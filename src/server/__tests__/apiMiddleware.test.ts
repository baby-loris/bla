import Api from '../Api';
import ApiMethod from '../ApiMethod';
import apiMiddleware from '../apiMiddleware';
import * as runtypes from 'runtypes';
import * as httpMocks from 'node-mocks-http';

describe('api middleware', () => {
    const api = new Api({
        method1: new ApiMethod({
            params: runtypes.Intersect(
                runtypes.Record({
                    method1RequiredParam: runtypes.String
                }),
                runtypes.Partial({
                    method1OptionalParam: runtypes.String
                })
            ),
            action: params => `${params.method1RequiredParam}!`
        }),

        method2: new ApiMethod({
            params: runtypes.Record({
                method2RequiredParam: runtypes.Number
            }),
            action: () => {
                throw new Error('Unspecified error');
            }
        })
    });

    const apiRequestHandler = apiMiddleware({ api });

    describe('without batch', () => {
        it('should send error if body format is not valid', () => {
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/method1',
                body: 'wrong format' as any
            });
            const response = httpMocks.createResponse();

            apiRequestHandler(request, response, () => {});

            return flushPromises().then(() => {
                expect(response._getData()).toBe(
                    JSON.stringify({
                        error: {
                            type: 'BAD_REQUEST',
                            message: 'Unexpected body, expected method params'
                        }
                    })
                );
            });
        });

        it('should send method result', () => {
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/method1',
                body: { method1RequiredParam: 'test' }
            });
            const response = httpMocks.createResponse();

            apiRequestHandler(request, response, () => {});

            return flushPromises().then(() => {
                expect(response._getData()).toBe(JSON.stringify({ data: 'test!' }));
            });
        });

        it('should send method error', () => {
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/method1',
                body: {}
            });
            const response = httpMocks.createResponse();

            apiRequestHandler(request, response, () => {});

            return flushPromises().then(() => {
                expect(response._getData()).toBe(
                    JSON.stringify({
                        error: {
                            type: 'BAD_REQUEST',
                            message: 'method1: Expected { method1RequiredParam: string; }, but was incompatible',
                            data: {
                                name: 'ValidationError',
                                code: 'CONTENT_INCORRECT',
                                details: {
                                    method1RequiredParam: 'Expected string, but was missing'
                                }
                            }
                        }
                    })
                );
            });
        });
    });

    describe('with batch', () => {
        it('should send error if body format is not valid', () => {
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/batch',
                body: [{ method: 'method1' }]
            });
            const response = httpMocks.createResponse();

            apiRequestHandler(request, response, () => {});

            return flushPromises().then(() => {
                expect(response._getData()).toBe(
                    JSON.stringify({
                        error: {
                            type: 'BAD_REQUEST',
                            message: 'Unexpected body, expected array of methods'
                        }
                    })
                );
            });
        });

        it('should send batch result', () => {
            const request = httpMocks.createRequest({
                method: 'POST',
                url: '/batch',
                body: [
                    { method: 'method1', params: { method1RequiredParam: 'test' } },
                    { method: 'method2', params: { method2RequiredParam: 1 } }
                ]
            });
            const response = httpMocks.createResponse();

            apiRequestHandler(request, response, () => {});

            return flushPromises().then(() => {
                expect(response._getData()).toBe(
                    JSON.stringify({
                        data: [
                            { data: 'test!' },
                            { error: { type: 'INTERNAL_ERROR', message: 'method2: Unspecified error', data: {} } }
                        ]
                    })
                );
            });
        });
    });
});

function flushPromises(): Promise<void> {
    return new Promise(setImmediate);
}
