import * as yup from 'yup';
import * as express from 'express';

type ApiMethodAction<TParams extends yup.ObjectSchema, TResult> =
    (params: yup.InferType<TParams>, request: express.Request) => TResult | Promise<TResult>;

class ApiMethod<TParams extends yup.ObjectSchema = yup.ObjectSchema, TResult = unknown> {
    private params: TParams;
    private action: ApiMethodAction<TParams, TResult>;

    constructor(
        { params, action }: { params?: TParams; action: ApiMethodAction<TParams, TResult>; }
    ) {
        this.params = params || yup.object() as TParams;
        this.action = action;
    }

    exec(params: yup.InferType<TParams>, request: express.Request): Promise<TResult> {
        return this.params.validate(params, { stripUnknown: true }).then(
            (params: yup.InferType<TParams>) => this.action(params, request)
        );
    }
}

type ExtractApiMethodParams<TApiMethod extends ApiMethod<yup.ObjectSchema, unknown>> =
    TApiMethod extends ApiMethod<infer TParams, unknown> ? yup.InferType<TParams> : never;

type ExtractApiMethodResult<TApiMethod extends ApiMethod<yup.ObjectSchema, unknown>> =
    TApiMethod extends ApiMethod<yup.ObjectSchema, infer TResult> ? TResult : never;

export default ApiMethod;
export { ExtractApiMethodParams, ExtractApiMethodResult };
