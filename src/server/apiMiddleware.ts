import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as yup from 'yup';
import Api from './Api';
import ApiMethod, { ExtractApiMethodParams } from './ApiMethod';
import ApiError from '../shared/ApiError';
import { ApiMethodResponse } from '../shared/types';

const apiMethodSchema = yup.object({
    method: yup.string().required(),
    params: yup.object().notRequired()
});
const batchSchema = yup.object({
    method: yup.string().oneOf(['batch']),
    params: yup.array().of(yup.object()).required()
});
const apiRouter = express.Router().use(bodyParser.json({ type: '*/*' }));

function apiMiddleware<TMethods extends Record<string, ApiMethod>>(
    api: Api<TMethods>
): express.RequestHandler {
    return apiRouter.post(
        '/',
        (req, res, next) => {
            Promise.all([
                apiMethodSchema.validate(req.body).catch(() => null),
                batchSchema.validate(req.body).catch(() => null)
            ]).then(([apiMethod, batch]) => {
                if(apiMethod) {
                    return execApiMethod(
                        api,
                        apiMethod.method,
                        apiMethod.params as ExtractApiMethodParams<TMethods[typeof apiMethod.method]>,
                        req
                    );
                }

                if(batch) {
                    return execBatch(
                        api,
                        batch.params as {
                            method: keyof TMethods;
                            params: ExtractApiMethodParams<TMethods[keyof TMethods]>;
                        }[],
                        req
                    );
                }

                return {
                    error: {
                        message: 'Incompatible input data, expected object with method and params fields'
                    }
                };
            }).then(methodRes => {
                res.json(methodRes);
            });
        }
    );
}

function execBatch<TMethods extends Record<string, ApiMethod>>(
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

function execApiMethod<TMethods extends Record<string, ApiMethod>>(
    api: Api<TMethods>,
    method: keyof TMethods,
    params: ExtractApiMethodParams<TMethods[keyof TMethods]>,
    request: express.Request
): Promise<ApiMethodResponse> {
    return api.exec(method, params, request).then(
        methodRes => ({ data: methodRes }),
        ({ message, source }: ApiError) => ({ error: { message, source } })
    );
}

export default apiMiddleware;
