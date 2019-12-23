import * as express from 'express';
import ApiMethod, { ApiMethodParams, ExtractApiMethodParams, ExtractApiMethodResult } from './ApiMethod';
import ApiError from '../shared/ApiError';

class Api<TMethods extends Record<string, ApiMethod<ApiMethodParams, unknown>> = {}> {
    constructor(private methods: TMethods) {}

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
        return err instanceof ApiError ?
            new ApiError(
                err.type,
                `${methodName}: ${err.message}`,
                err.data
            ) :
            new ApiError(
                ApiError.INTERNAL_ERROR,
                `${methodName}: ${err instanceof Error ? err.message : undefined}`,
                err
            );
    }
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
