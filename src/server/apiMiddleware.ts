import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as runtypes from 'runtypes';
import Api from './Api';
import ApiMethod, { ExtractApiMethodParams } from './ApiMethod';
import ApiError from '../shared/ApiError';
import { ApiMethodResponse } from '../shared/types';

const apiMethodSchema = runtypes.Record({});
const batchSchema = runtypes.Array(
    runtypes.Record({
        method: runtypes.String,
        params: runtypes.Record({})
    })
);
const apiRouter = express.Router().use(bodyParser.json({ type: '*/*' }));

function apiMiddleware<TMethods extends Record<string, ApiMethod>>(
    api: Api<TMethods>
): express.RequestHandler {
    return apiRouter.post(
        '/:method',
        (req, res, next) => {
            if(req.params.method === 'batch') {
                if(validate(req.body, batchSchema)) {
                    execBatch(api, req.body, req).then(res.json);
                } else {
                    res.json({
                        error: { message: 'Incompatible body data, expected array of methods' }
                    });
                }
            } else if(validate(req.body, apiMethodSchema)) {
                execApiMethod(api, req.params.method, req.body, req).then(res.json);
            } else {
                res.json({
                    error: { message: 'Incompatible body data, expected method params' }
                });
            }
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

function validate(obj: unknown, schema: runtypes.Runtype): boolean {
    try {
        schema.check(obj);

        return true;
    } catch {
        return false;
    }
}

export default apiMiddleware;
