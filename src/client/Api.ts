import ApiError from '../shared/ApiError';
import { ApiContract, ApiMethodResponse, ApiMethodResponseSuccess } from '../shared/types';

interface ApiItem {
    method: string;
    params: Record<string, unknown> | Record<string, unknown>[];
    resolve(data: unknown): void;
    reject(err: unknown): void;
}

interface ApiOptions {
    url: string;
    batchMaxSize?: number;
}

const DEFAULT_API_OPTIONS = {
    batchMaxSize: 1
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
                        // TODO: rewrite with microtasks
                        window.setTimeout(this.processQueue, 0);
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

    private doRequest({ resolve, reject, method, params }: ApiItem): void {
        fetch(
            this.options.url,
            {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ method, params })
            }
        ).then(
            response => {
                if(response.ok) {
                    return response.json().catch(err => {
                        throw new ApiError(err.message, err);
                    });
                }

                throw new ApiError(response.statusText);
            },
            err => {
                throw new ApiError(err.message, err);
            }
        ).then((res: ApiMethodResponse) => {
            if('data' in res || 'error' in res) {
                resolve(res);
            } else {
                throw new ApiError('Incompatible format, expected object with data or error field');
            }
        }).catch(reject);
    }

    private handleMethodResponse(
        response: ApiMethodResponse,
        resolve: (data: unknown) => void,
        reject: (err: unknown) => void,
    ): void {
        if(response.error) {
            reject(new ApiError(response.error.message, response.error.source));
        } else {
            resolve(response.data);
        }
    }
}

export default Api;
export { ApiOptions };
