import * as runtypes from 'runtypes';
import * as express from 'express';

type ApiMethodParams =
    runtypes.Record<{}, false> |
    runtypes.Partial<{}> |
    runtypes.Intersect2<ApiMethodParams, ApiMethodParams> |
    runtypes.Union2<ApiMethodParams, ApiMethodParams>;

type ApiMethodAction<TParams extends ApiMethodParams, TResult> =
    (params: runtypes.Static<TParams>, request: express.Request) => TResult | Promise<TResult>;

interface IApiMethod<
    TParams extends ApiMethodParams = ApiMethodParams,
    TResult = unknown
> {
    getParams(): TParams;
    exec(params: runtypes.Static<TParams>, request: express.Request): Promise<TResult>;
}

class ApiMethod<
    TParams extends ApiMethodParams = ApiMethodParams,
    TResult = unknown,
> implements IApiMethod<TParams, TResult> {
    private readonly params: TParams;
    private readonly action: ApiMethodAction<TParams, TResult>;

    constructor(
        { params, action }: { params?: TParams; action: ApiMethodAction<TParams, TResult>; }
    ) {
        this.params = params || runtypes.Record({}) as TParams;
        this.action = action;
    }

    getParams(): TParams {
        return this.params;
    }

    exec(params: runtypes.Static<TParams>, request: express.Request): Promise<TResult> {
        return new Promise((resolve, reject) => {
            try {
                this.params.check(params);
                resolve(this.action(params, request));
            } catch(err) {
                reject(err);
            }
        });
    }
}

type ExtractApiMethodParams<TApiMethod extends IApiMethod> =
    TApiMethod extends IApiMethod<infer TParams> ?
        runtypes.Static<TParams> extends Record<string, never> ?
            Record<string, never> :
            runtypes.Static<TParams> :
        never;

type ExtractApiMethodResult<TApiMethod extends IApiMethod> =
    TApiMethod extends IApiMethod<ApiMethodParams, infer TResult> ? TResult : never;

export default ApiMethod;
export { IApiMethod, ApiMethodParams, ApiMethodAction, ExtractApiMethodParams, ExtractApiMethodResult };
