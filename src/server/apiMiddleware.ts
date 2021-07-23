import * as express from 'express';
import * as bodyParser from 'body-parser';
import Api from './Api';
import { IApiMethod, ApiMethodParams, ExtractApiMethodParams } from './ApiMethod';
import ApiError from '../shared/ApiError';
import { ApiMethodResponse, ApiMethodResponseFailed } from '../shared/types';

type BodyParserOptions = Omit<bodyParser.OptionsJson, 'type'>;
type onError = (err: ApiError) => void;

function apiMiddleware<TMethods extends Record<string, IApiMethod<ApiMethodParams>>>(
    {
        api,
        bodyParserOptions,
        onError
    }: {
        api: Api<TMethods>;
        bodyParserOptions?: BodyParserOptions;
        onError?: onError;
    }
): express.RequestHandler {
    return express.Router()
        .use(bodyParser.json({ ...bodyParserOptions, type: '*/*' }))
        .post(
            '/:method(*)',
            (req, res) => {
                if(req.params.method === 'batch') {
                    if(
                        Array.isArray(req.body) &&
                        req.body.every(item =>
                            item &&
                            typeof item.method === 'string' &&
                            item.params &&
                            typeof item.params === 'object'
                        )
                    ) {
                        execBatch(api, req.body, req, onError).then(data => {
                            res.json(data);
                        });
                    } else {
                        const err = new ApiError(ApiError.BAD_REQUEST, 'Unexpected body, expected array of methods');

                        onError?.(err);
                        res.json(convertApiErrorToResponse(err));
                    }
                } else if(req.body && typeof req.body === 'object') {
                    execApiMethod(api, req.params.method, req.body, req, onError).then(data => {
                        res.json(data);
                    });
                } else {
                    const err = new ApiError(ApiError.BAD_REQUEST, 'Unexpected body, expected method params');

                    onError?.(err);
                    res.json(convertApiErrorToResponse(err));
                }
            }
        );
}

function execBatch<TMethods extends Record<string, IApiMethod<ApiMethodParams>>>(
    api: Api<TMethods>,
    params: {
        method: keyof TMethods;
        params: ExtractApiMethodParams<TMethods[keyof TMethods]>;
    }[],
    request: express.Request,
    onError?: onError
): Promise<ApiMethodResponse> {
    return Promise.all(
        params.map(({ method, params }) => execApiMethod(api, method, params, request, onError))
    ).then(methodsRes => ({ data: methodsRes }));
}

function execApiMethod<TMethods extends Record<string, IApiMethod<ApiMethodParams>>>(
    api: Api<TMethods>,
    method: keyof TMethods,
    params: ExtractApiMethodParams<TMethods[keyof TMethods]>,
    request: express.Request,
    onError?: onError
): Promise<ApiMethodResponse> {
    return api.exec(method, params, request).then(
        methodRes => ({ data: methodRes }),
        (err: ApiError) => {
            onError?.(err);
            return convertApiErrorToResponse(err);
        }
    );
}

function convertApiErrorToResponse({ type, message, data }: ApiError): ApiMethodResponseFailed {
    return {
        error: {
            type,
            message,
            data
        }
    };
}

export default apiMiddleware;
