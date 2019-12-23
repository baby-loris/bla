import * as runtypes from 'runtypes';
import * as express from 'express';
import ApiError from '../shared/ApiError';

type ApiMethodParams =
    runtypes.Record<{}, false> |
    runtypes.Partial<{}> |
    runtypes.Intersect2<runtypes.Record<{}, false>, runtypes.Partial<{}>>;

type ApiMethodAction<TParams extends ApiMethodParams, TResult> =
    (params: runtypes.Static<TParams>, request: express.Request) => TResult | Promise<TResult>;

class ApiMethod<TParams extends ApiMethodParams = ApiMethodParams, TResult = unknown> {
    private params: TParams;
    private action: ApiMethodAction<TParams, TResult>;

    constructor(
        { params, action }: { params?: TParams; action: ApiMethodAction<TParams, TResult>; }
    ) {
        this.params = params || runtypes.Record({}) as TParams;
        this.action = action;
    }

    exec(params: runtypes.Static<TParams>, request: express.Request): Promise<TResult> {
        return new Promise((resolve, reject) => {
            try {
                this.params.check(params);
                resolve(this.action(params, request));
            } catch(err) {
                reject(
                    err instanceof runtypes.ValidationError ?
                        new ApiError(ApiError.BAD_REQUEST, err.message, err) :
                        err
                );
            }
        });
    }
}

type ExtractApiMethodParams<TApiMethod extends ApiMethod<ApiMethodParams, unknown>> =
    TApiMethod extends ApiMethod<infer TParams, unknown> ?
        runtypes.Static<TParams> extends { [x: string]: never; } ?
            { [x: string]: never; } :
            runtypes.Static<TParams> :
        never;

type ExtractApiMethodResult<TApiMethod extends ApiMethod<ApiMethodParams, unknown>> =
    TApiMethod extends ApiMethod<ApiMethodParams, infer TResult> ? TResult : never;

export default ApiMethod;
export { ApiMethodParams, ExtractApiMethodParams, ExtractApiMethodResult };
