/**
 * @jest-environment jsdom
 */

import Api from '../Api';
import ApiError from '../../shared/ApiError';
import { Api as ServerApi, ApiMethod as ServerApiMethod, ExtractApiContract } from '../../server';
import * as runtypes from 'runtypes';

describe('api', () => {
    const serverMethod1 = new ServerApiMethod({
        params: runtypes.Intersect(
            runtypes.Record({
                method1RequiredParam: runtypes.String
            }),
            runtypes.Partial({
                method1OptionalParam: runtypes.String
            })
        ),
        action: params => `${params.method1RequiredParam}!`
    });
    const serverMethod2 = new ServerApiMethod({
        params: runtypes.Record({
            method2RequiredParam: runtypes.Number
        }),
        action: () => {
            throw new Error('Unspecified error');
        }
    });
    const serverMethod3 = new ServerApiMethod({
        action: () => {
            throw new Error('Unspecified error');
        }
    });
    const serverApi = new ServerApi({
        method1: serverMethod1,
        method2: serverMethod2,
        method3: serverMethod3
    });

    afterAll(() => {
        fetchMock.resetMocks();
    });

    describe('headers', () => {
        it('should be possible to pass static headers', done => {
            const api = new Api<ExtractApiContract<typeof serverApi>>({
                url: '/api',
                headers: { 'X-Lang': 'en' }
            });
            let headers: Headers;

            fetchMock.mockResponseOnce(
                req => {
                    ({ headers } = req);
                    return Promise.resolve({ body: JSON.stringify({ data: 'test' }) });
                }
            );

            api.exec('method1', { method1RequiredParam: 'test' }).then(() => {
                expect(headers.get('X-Lang')).toBe('en');
                done();
            });
        });

        it('should be possible to pass headers via function', done => {
            const api = new Api<ExtractApiContract<typeof serverApi>>({
                url: '/api',
                headers: () => ({ 'X-Lang': 'en' })
            });
            let headers: Headers;

            fetchMock.mockResponseOnce(
                req => {
                    ({ headers } = req);
                    return Promise.resolve({ body: JSON.stringify({ data: 'test' }) });
                }
            );

            api.exec('method1', { method1RequiredParam: 'test' }).then(() => {
                expect(headers.get('X-Lang')).toBe('en');
                done();
            });
        });
    });

    describe('searchParams', () => {
        const getSearchParamsFromUrl = (url: string): URLSearchParams => {
            return new URLSearchParams(url.split('?')[1]);
        };

        test('should be possible to pass static searchParams', done => {
            const api = new Api<ExtractApiContract<typeof serverApi>>({
                url: '/api',
                searchParams: new URLSearchParams('foo=bar')
            });
            let url: string;

            fetchMock.mockResponseOnce(
                req => {
                    ({ url } = req);
                    return Promise.resolve({ body: JSON.stringify({ data: 'test' }) });
                }
            );

            api.exec('method1', { method1RequiredParam: 'test' }).then(() => {
                expect(getSearchParamsFromUrl(url).get('foo')).toBe('bar');
                done();
            });
        });

        it('should be possible to pass searchParams via function', done => {
            const api = new Api<ExtractApiContract<typeof serverApi>>({
                url: '/api',
                searchParams: () => new URLSearchParams([['bar', 'foo']])
            });
            let url: string;

            fetchMock.mockResponseOnce(
                req => {
                    ({ url } = req);
                    return Promise.resolve({ body: JSON.stringify({ data: 'test' }) });
                }
            );

            api.exec('method1', { method1RequiredParam: 'test' }).then(() => {
                expect(getSearchParamsFromUrl(url).get('bar')).toBe('foo');
                done();
            });
        });
    });

    describe('without batch', () => {
        const api = new Api<ExtractApiContract<typeof serverApi>>({ url: '/api', timeout: 100 });

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
            fetchMock.mockResponseOnce('null');

            api.exec('method1', { method1RequiredParam: 'test' }).catch(err => {
                expect(err).toBeInstanceOf(ApiError);
                expect(err.type).toBe('INTERNAL_ERROR');
                expect(err.message).toBe('Incompatible response format');
                done();
            });
        });

        it('should reject if server method failed', done => {
            fetchMock.mockResponseOnce(
                JSON.stringify({ error: { type: 'INTERNAL_ERROR', message: 'error!', data: {} } })
            );

            api.exec('method1', { method1RequiredParam: 'test' }).catch(err => {
                expect(err).toBeInstanceOf(ApiError);
                expect(err.type).toBe('INTERNAL_ERROR');
                expect(err.message).toBe('error!');
                expect(err.data).toEqual({});
                done();
            });
        });

        it('should reject if server timed out', done => {
            fetchMock.mockResponseOnce(() =>
                new Promise(resolve => {
                    window.setTimeout(
                        () => {
                            resolve({ body: JSON.stringify({ data: 'test' }) });
                        },
                        200
                    );
                })
            );

            api.exec('method1', { method1RequiredParam: 'test' }).then(
                done.fail,
                err => {
                    expect(err).toBeInstanceOf(ApiError);
                    expect(err.type).toBe('TIMEOUT');
                    done();
                }
            );
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
            batchMaxSize: Number.POSITIVE_INFINITY,
            timeout: 100
        });

        it('should reject all if server method does not respond', done => {
            fetchMock.mockResponseOnce('', { status: 500, statusText: 'Internal server error' });

            Promise.all([
                api.exec('method1', { method1RequiredParam: 'test' }).then(
                    done.fail,
                    err => {
                        expect(err).toBeInstanceOf(ApiError);
                        expect(err.type).toBe('INTERNAL_ERROR');
                        expect(err.message).toBe('Internal server error');
                    }
                ),
                api.exec('method2', { method2RequiredParam: 4 }).then(
                    done.fail,
                    err => {
                        expect(err).toBeInstanceOf(ApiError);
                        expect(err.type).toBe('INTERNAL_ERROR');
                        expect(err.message).toBe('Internal server error');
                    }
                )
            ]).then(() => {
                done();
            });
        });

        it('should reject all if server timed out', done => {
            fetchMock.mockResponseOnce(() =>
                new Promise(resolve => {
                    window.setTimeout(
                        () => {
                            resolve({ body: JSON.stringify({ data: [{ data: 'test1' }, { data: 'test2' }] }) });
                        },
                        200
                    );
                })
            );

            Promise.all([
                api.exec('method1', { method1RequiredParam: 'test' }).then(
                    done.fail,
                    () => {}
                ),
                api.exec('method3').then(
                    done.fail,
                    () => {}
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
                                type: 'BAD_REQUEST',
                                message: 'method2: Expected string, but was undefined',
                                data: {
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
                        expect(err.type).toBe('BAD_REQUEST');
                        expect(err.message).toBe('method2: Expected string, but was undefined');
                        expect(err.data).toEqual({
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
