import * as express from 'express';
import * as runtypes from 'runtypes';
import { IApiMethod, ExtractApiMethodParams, ExtractApiMethodResult } from './ApiMethod';
import ApiError from '../shared/ApiError';

class Api<TMethods extends Record<string, IApiMethod<runtypes.Record<{}, false>, unknown>> = {}> {
    constructor(private readonly methods: TMethods) {}

    exec<TMethodName extends keyof TMethods>(
        methodName: TMethodName,
        methodParams: ExtractApiMethodParams<TMethods[TMethodName]>,
        request: express.Request
    ): Promise<ExtractApiMethodResult<TMethods[TMethodName]>> {
        return methodName in this.methods ?
            this.methods[methodName].exec(methodParams, request).catch(err => {
                throw this.normalizeError(err, methodName as string);
            }) as Promise<ExtractApiMethodResult<TMethods[TMethodName]>> :
            Promise.reject(new ApiError(ApiError.NOT_FOUND, `Method ${methodName} not found`));
    }

    private normalizeError(err: unknown, methodName: string): ApiError {
        if(err instanceof ApiError) {
            return new ApiError(err.type, formatMethodErrorMessage(methodName, err.message), err.data);
        }

        if(err instanceof runtypes.ValidationError) {
            return new ApiError(ApiError.BAD_REQUEST, formatMethodErrorMessage(methodName, err.message), err);
        }

        if(err instanceof Error) {
            return new ApiError(ApiError.INTERNAL_ERROR, formatMethodErrorMessage(methodName, err.message), err);
        }

        if(isErrorLike(err)) {
            return new ApiError(err.type, formatMethodErrorMessage(methodName, err.message), err);
        }

        return new ApiError(ApiError.INTERNAL_ERROR, formatMethodErrorMessage(methodName), err);
    }
}

function isErrorLike(err: unknown): err is { type: string; message?: string; } {
    return (
        typeof err === 'object' &&
        err !== null &&
        typeof (err as { type?: unknown; }).type === 'string' &&
        (
            typeof (err as { message?: unknown; }).message === 'string' ||
            typeof (err as { message?: unknown; }).message === 'undefined'
        )
    );
}

function formatMethodErrorMessage(methodName: string, errorMessage?: string): string {
    return `${methodName}: ${errorMessage || 'Something went wrong'}`;
}

type ExtractApiContract<TApi extends Api> = TApi extends Api<infer TMethods> ?
    {
        [methodName in keyof TMethods]: {
            params: ExtractApiMethodParams<TMethods[methodName]>;
            result: ExtractApiMethodResult<TMethods[methodName]>;
        }
    } :
    never;

export default Api;
export { ExtractApiContract };
