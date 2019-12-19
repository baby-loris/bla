import Api from '../Api';
import ApiError from '../../shared/ApiError';
import { Api as ServerApi, ApiMethod as ServerApiMethod, ExtractApiContract } from '../../server';
import * as runtypes from 'runtypes';

describe('api', () => {
    const serverApi = new ServerApi({
        method1: new ServerApiMethod({
            params: runtypes.Record({
                method1RequiredParam: runtypes.String
            }),
            action: params => `${params.method1RequiredParam}!`
        }),

        method2: new ServerApiMethod({
            params: runtypes.Record({
                method2RequiredParam: runtypes.Number
            }),
            action: () => {
                throw new Error('Unspecified error');
            }
        })
    });

    afterAll(() => {
        fetchMock.resetMocks();
    });

    describe('without batch', () => {
        const api = new Api<ExtractApiContract<typeof serverApi>>({ url: '/api' });

        it('should reject if server does not respond', done => {
            fetchMock.mockResponseOnce('', { status: 500, statusText: 'Internal server error' });

            api.exec('method1', { method1RequiredParam: 'test' }).catch(err => {
                expect(err).toBeInstanceOf(ApiError);
                expect(err.message).toBe('Internal server error');
                done();
            });
        });

        it('should reject if server return invalid json', done => {
            fetchMock.mockResponseOnce('wrong');

            api.exec('method1', { method1RequiredParam: 'test' }).catch(err => {
                expect(err).toBeInstanceOf(ApiError);
                done();
            });
        });

        it('should reject if server return invalid format', done => {
            fetchMock.mockResponseOnce('{}');

            api.exec('method1', { method1RequiredParam: 'test' }).catch(err => {
                expect(err).toBeInstanceOf(ApiError);
                expect(err.message).toBe('Incompatible format, expected object with data or error field');
                done();
            });
        });

        it('should reject if server method failed', done => {
            fetchMock.mockResponseOnce(JSON.stringify({ error: { message: 'error!', source: {} } }));

            api.exec('method1', { method1RequiredParam: 'test' }).catch(err => {
                expect(err).toBeInstanceOf(ApiError);
                expect(err.message).toBe('error!');
                expect(err.source).toEqual({});
                done();
            });
        });

        it('should resolve if server method successfully respond', done => {
            fetchMock.mockResponseOnce(JSON.stringify({ data: 'test' }));

            api.exec('method1', { method1RequiredParam: 'test' }).then(res => {
                expect(res).toBe('test');
                done();
            });
        });
    });

    describe('with batch', () => {
        const api = new Api<ExtractApiContract<typeof serverApi>>({
            url: '/api',
            batchMaxSize: Number.POSITIVE_INFINITY
        });

        it('should reject all if server method does not respond', done => {
            fetchMock.mockResponseOnce('', { status: 500, statusText: 'Internal server error' });

            Promise.all([
                api.exec('method1', { method1RequiredParam: 'test' }).then(
                    done.fail,
                    err => {
                        expect(err).toBeInstanceOf(ApiError);
                        expect(err.message).toBe('Internal server error');
                    }
                ),
                api.exec('method2', { method2RequiredParam: 4 }).then(
                    done.fail,
                    err => {
                        expect(err).toBeInstanceOf(ApiError);
                        expect(err.message).toBe('Internal server error');
                    }
                )
            ]).then(() => {
                done();
            });
        });

        it('should resolve and reject depending on server method status', done => {
            fetchMock.mockResponseOnce(
                JSON.stringify({
                    data: [
                        { data: 'test!' },
                        {
                            error: {
                                message: 'method2: Expected string, but was undefined',
                                source: {
                                    key: 'method2RequiredParam',
                                    name: 'ValidationError'
                                }
                            }
                        }
                    ]
                })
            );

            Promise.all([
                api.exec('method1', { method1RequiredParam: 'test' }).then(
                    res => {
                        expect(res).toBe('test!');
                    },
                    done.fail
                ),
                api.exec('method2', {} as any).then(
                    done.fail,
                    err => {
                        expect(err).toBeInstanceOf(ApiError);
                        expect(err.message).toBe('method2: Expected string, but was undefined');
                        expect(err.source).toEqual({
                            key: 'method2RequiredParam',
                            name: 'ValidationError'
                        });
                    }
                )
            ]).then(() => {
                done();
            });
        });
    });
});
