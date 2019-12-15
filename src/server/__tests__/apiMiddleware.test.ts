import Api from '../Api';
import ApiMethod from '../ApiMethod';
import apiMiddleware from '../apiMiddleware';
import * as yup from 'yup';
import * as httpMocks from 'node-mocks-http';

describe('api middleware', () => {
    const api = new Api({
        method1: new ApiMethod({
            params: yup.object({
                method1RequiredParam: yup
                    .string()
                    .required()
            }),
            action: params => `${params.method1RequiredParam}!`
        }),

        method2: new ApiMethod({
            params: yup.object({
                method2RequiredParam: yup
                    .number()
                    .required()
            }),
            action: () => {
                throw new Error('Unspecified error');
            }
        })
    });

    const apiRequestHandler = apiMiddleware(api);

    it('should send error if input format is wrong', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/'
        });
        const response = httpMocks.createResponse();

        apiRequestHandler(request, response, () => {});

        return flushPromises().then(() => {
            expect(response._getData()).toBe(
                JSON.stringify({
                    error: { message: 'Incompatible input data, expected object with method and params fields' }
                })
            );
        });
    });

    it('should send method result', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/',
            body: { method: 'method1', params: { method1RequiredParam: 'test' } }
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
            url: '/',
            body: { method: 'method3', params: {} }
        });
        const response = httpMocks.createResponse();

        apiRequestHandler(request, response, () => {});

        return flushPromises().then(() => {
            expect(response._getData()).toBe(JSON.stringify({ error: { message: 'Method method3 not found' } }));
        });
    });

    it('should send batch result', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/',
            body: {
                method: 'batch',
                params: [
                    { method: 'method1', params: { method1RequiredParam: 'test' } },
                    { method: 'method2', params: { method2RequiredParam: 1 } }
                ]
            }
        });
        const response = httpMocks.createResponse();

        apiRequestHandler(request, response, () => {});

        return flushPromises().then(() => {
            expect(response._getData()).toBe(
                JSON.stringify({
                    data: [
                        { data: 'test!' },
                        { error: { message: 'method2: Unspecified error', source: {} } }
                    ]
                })
            );
        });
    });
});

function flushPromises(): Promise<void> {
    return new Promise(setImmediate);
}
