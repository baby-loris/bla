import * as express from 'express';
import * as bodyParser from 'body-parser';
import Api from './Api';
import { IApiMethod, ExtractApiMethodParams } from './ApiMethod';
import ApiError from '../shared/ApiError';
import { ApiMethodResponse } from '../shared/types';

type BodyParserOptions = Omit<bodyParser.OptionsJson, 'type'>;

function apiMiddleware<TMethods extends Record<string, IApiMethod>>(
    { api, bodyParserOptions }: { api: Api<TMethods>; bodyParserOptions?: BodyParserOptions; }
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
                        execBatch(api, req.body, req).then(data => {
                            res.json(data);
                        });
                    } else {
                        res.json({
                            error: {
                                type: ApiError.BAD_REQUEST,
                                message: 'Unexpected body, expected array of methods'
                            }
                        });
                    }
                } else if(req.body && typeof req.body === 'object') {
                    execApiMethod(api, req.params.method, req.body, req).then(data => {
                        res.json(data);
                    });
                } else {
                    res.json({
                        error: {
                            type: ApiError.BAD_REQUEST,
                            message: 'Unexpected body, expected method params'
                        }
                    });
                }
            }
        );
}

function execBatch<TMethods extends Record<string, IApiMethod>>(
    api: Api<TMethods>,
    params: {
        method: keyof TMethods;
        params: ExtractApiMethodParams<TMethods[keyof TMethods]>;
    }[],
    request: express.Request
): Promise<ApiMethodResponse> {
    return Promise.all(
        params.map(({ method, params }) => execApiMethod(api, method, params, request))
    ).then(methodsRes => ({ data: methodsRes }));
}

function execApiMethod<TMethods extends Record<string, IApiMethod>>(
    api: Api<TMethods>,
    method: keyof TMethods,
    params: ExtractApiMethodParams<TMethods[keyof TMethods]>,
    request: express.Request
): Promise<ApiMethodResponse> {
    return api.exec(method, params, request).then(
        methodRes => ({ data: methodRes }),
        ({ type, message, data }: ApiError) => ({ error: { type, message, data } })
    );
}

export default apiMiddleware;
