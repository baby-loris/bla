import * as express from 'express';
import ApiMethod, { ApiMethodParams, ExtractApiMethodParams, ExtractApiMethodResult } from './ApiMethod';
import ApiError from '../shared/ApiError';

class Api<TMethods extends Record<string, ApiMethod<ApiMethodParams, any>> = {}> {
    constructor(private methods: TMethods) {}

    exec<TMethodName extends keyof TMethods>(
        methodName: TMethodName,
        methodParams: ExtractApiMethodParams<TMethods[TMethodName]>,
        request: express.Request
    ): Promise<ExtractApiMethodResult<TMethods[TMethodName]>> {
        return methodName in this.methods ?
            this.methods[methodName].exec(methodParams, request).catch(err => {
                throw this.normalizeError(err, methodName as string);
            }) :
            Promise.reject(new ApiError(`Method ${methodName} not found`));
    }

    private normalizeError(err: unknown, methodName: string): ApiError {
        return err instanceof ApiError ?
            new ApiError(
                `${methodName}: ${err.message}`,
                err.source
            ) :
            new ApiError(
                `${methodName}: ${err instanceof Error ? err.message : 'Internal error'}`,
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
