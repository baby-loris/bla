import Api from '../Api';
import ApiMethod from '../ApiMethod';
import ApiError from '../../shared/ApiError';
import * as yup from 'yup';
import * as httpMocks from 'node-mocks-http';

describe('api', () => {
    const requestMock = httpMocks.createRequest();
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

    it('should reject with api error if method does not exist', done => {
        api.exec('method3' as any, {}, requestMock).catch(err => {
            expect(err).toBeInstanceOf(ApiError);
            expect(err.message).toBe('Method method3 not found');
            done();
        });
    });

    it('should reject with api error if method params are not valid', done => {
        api.exec('method1', {} as any, requestMock).catch(err => {
            expect(err).toBeInstanceOf(ApiError);
            expect(err.message).toBe('method1: method1RequiredParam is a required field');
            done();
        });
    });

    it('should normalize method error', done => {
        api.exec('method2', { method2RequiredParam: 1 }, requestMock).catch(err => {
            expect(err).toBeInstanceOf(ApiError);
            expect(err.message).toBe('method2: Unspecified error');
            expect(err.source).toBeInstanceOf(Error);
            done();
        });
    });
});
