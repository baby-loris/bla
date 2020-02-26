import ApiError from '../shared/ApiError';
import { ApiContract, ApiMethodResponse, ApiMethodResponseSuccess } from '../shared/types';
import queueMicrotask from './queueMicrotask';

interface ApiItem {
    method: string;
    params: Record<string, unknown> | Record<string, unknown>[];
    resolve(data: unknown): void;
    reject(err: unknown): void;
}

interface ApiOptions {
    url: string;
    csrfToken?: string;
    batchMaxSize?: number;
    timeout?: number;
}

const MAX_RETRIES = 2;

const DEFAULT_API_OPTIONS = {
    csrfToken: '',
    batchMaxSize: 1,
    timeout: 30000
};

class Api<TApiContract extends ApiContract> {
    private options: Required<ApiOptions>;
    private queue: ApiItem[] = [];

    constructor(options: ApiOptions) {
        this.options = {
            ...DEFAULT_API_OPTIONS,
            ...options
        };
    }

    exec<TMethod extends Extract<keyof TApiContract, string>>(
        method: TMethod,
        params: TApiContract[TMethod]['params']
    ): Promise<TApiContract[TMethod]['result']> {
        return new Promise((resolve, reject) => {
            const { options, queue } = this;

            if(options.batchMaxSize > 1) {
                queue.push({ method, params, resolve, reject });

                switch(queue.length) {
                    case options.batchMaxSize:
                        this.processQueue();
                        break;

                    case 1:
                        queueMicrotask(this.processQueue);
                        break;
                }
            } else {
                this.doRequest({
                    reject,
                    method,
                    params,
                    resolve: (res: ApiMethodResponse) => {
                        this.handleMethodResponse(res, resolve, reject);
                    }
                });
            }
        });
    }

    private processQueue = (): void => {
        const { queue } = this;

        this.queue = [];

        this.doRequest({
            method: 'batch',
            params: queue.map(({ method, params }) => ({ method, params })),
            resolve: ({ data }: ApiMethodResponseSuccess<ApiMethodResponse[]>) => {
                queue.forEach(({ resolve, reject }, i) => {
                    const item = data[i];

                    if(typeof item !== 'object' || item === null) {
                        reject('Incompatible format, expected object with data or error field');
                    }

                    this.handleMethodResponse(item, resolve, reject);
                });
            },
            reject: (err: ApiError) => {
                queue.forEach(({ reject }) => {
                    reject(err);
                });
            }
        });
    }

    private doRequest(
        { resolve, reject, method, params, retries = 0 }: ApiItem & { retries?: number; }
    ): void {
        const { url, csrfToken, timeout } = this.options;
        const timeoutCancellationToken = window.setTimeout(
            () => {
                reject(new ApiError('TIMEOUT'));
            },
            timeout
        );

        fetch(
            `${url}/${method}`,
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: csrfToken ?
                    { 'X-Csrf-Token': csrfToken } :
                    undefined,
                body: JSON.stringify(params)
            }
        ).then(
            response => {
                window.clearTimeout(timeoutCancellationToken);

                if(response.ok) {
                    return response.json().catch(err => {
                        throw new ApiError(ApiError.INTERNAL_ERROR, err.message, err);
                    });
                } else if(csrfToken) {
                    const newCsrfToken = response.headers.get('X-Csrf-Token');

                    if(newCsrfToken && newCsrfToken !== csrfToken) {
                        this.options.csrfToken = newCsrfToken;

                        throw new ApiError('WRONG_CSRF_TOKEN');
                    }
                }

                throw new ApiError(ApiError.INTERNAL_ERROR, response.statusText);
            },
            err => {
                window.clearTimeout(timeoutCancellationToken);
                throw new ApiError(ApiError.INTERNAL_ERROR, err.message, err);
            }
        ).then((res: ApiMethodResponse) => {
            if('data' in res || 'error' in res) {
                resolve(res);
            } else {
                throw new ApiError(
                    ApiError.INTERNAL_ERROR,
                    'Incompatible format, expected object with data or error field'
                );
            }
        }).catch(err => {
            if(err && err.type === 'WRONG_CSRF_TOKEN' && retries < MAX_RETRIES) {
                this.doRequest({ resolve, reject, method, params, retries: retries + 1 });
            } else {
                reject(err);
            }
        });
    }

    private handleMethodResponse(
        response: ApiMethodResponse,
        resolve: (data: unknown) => void,
        reject: (err: unknown) => void,
    ): void {
        if(response.error) {
            reject(new ApiError(response.error.type, response.error.message, response.error.data));
        } else {
            resolve(response.data);
        }
    }
}

export default Api;
export { ApiOptions };
