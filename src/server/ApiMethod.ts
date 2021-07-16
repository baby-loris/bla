import * as runtypes from 'runtypes';
import * as express from 'express';

type ApiMethodParams =
    runtypes.Record<{}, false> |
    runtypes.Partial<{}, false> |
    runtypes.Intersect<[ApiMethodParams, ApiMethodParams]> |
    runtypes.Union<[ApiMethodParams, ApiMethodParams]>;

type ApiMethodAction<TParams extends ApiMethodParams, TResult, TRequest extends express.Request> =
    (params: runtypes.Static<TParams>, request: TRequest) => TResult | Promise<TResult>;

interface IApiMethod<
    TParams extends ApiMethodParams = runtypes.Record<{}, false>,
    TResult = unknown,
    TRequest extends express.Request = express.Request
> {
    getParams(): TParams;
    exec(params: runtypes.Static<TParams>, request: TRequest): Promise<TResult>;
}

class ApiMethod<
    TParams extends ApiMethodParams = runtypes.Record<{}, false>,
    TResult = unknown,
    TRequest extends express.Request = express.Request
> implements IApiMethod<TParams, TResult, TRequest> {
    private readonly params: TParams;
    private readonly action: ApiMethodAction<TParams, TResult, TRequest>;

    constructor({
        params = runtypes.Record({}) as TParams,
        action
    }: {
        params?: TParams;
        action: ApiMethodAction<TParams, TResult, TRequest>;
    }) {
        this.params = params;
        this.action = action;
    }

    getParams(): TParams {
        return this.params;
    }

    exec(params: runtypes.Static<TParams>, request: TRequest): Promise<TResult> {
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

type ExtractApiMethodParams<TApiMethod extends IApiMethod<ApiMethodParams>> =
    TApiMethod extends IApiMethod<infer TParams> ?
        runtypes.Static<TParams> extends Record<string, never> ?
            Record<string, never> :
            runtypes.Static<TParams> :
        never;

type ExtractApiMethodResult<TApiMethod extends IApiMethod<ApiMethodParams>> =
    TApiMethod extends IApiMethod<ApiMethodParams, infer TResult> ? TResult : never;

export default ApiMethod;
export { IApiMethod, ApiMethodParams, ApiMethodAction, ExtractApiMethodParams, ExtractApiMethodResult };
