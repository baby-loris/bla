import ApiMethod from '../ApiMethod';
import * as runtypes from 'runtypes';
import * as httpMocks from 'node-mocks-http';

describe('api method', () => {
    const requestMock = httpMocks.createRequest();
    const params = runtypes.Record({
        requiredParam: runtypes.String
    });
    let method: ApiMethod<typeof params>;
    let action: jest.Mock;

    beforeEach(() => {
        action = jest.fn();
        method = new ApiMethod({ params, action });
    });

    it('should reject with error if params are not valid', done => {
        method.exec({} as any, requestMock).catch(err => {
            expect(err).toBeInstanceOf(runtypes.ValidationError);
            done();
        });
    });

    it('should not execute action if params are not valid', done => {
        method.exec({} as any, requestMock).catch(() => {
            expect(action).not.toBeCalled();
            done();
        });
    });

    it('should execute action with params if params are valid', done => {
        method.exec({ requiredParam: 'test' }, requestMock).then(() => {
            expect(action).toBeCalled();
            expect(action).toBeCalledWith({ requiredParam: 'test' }, requestMock);
            done();
        });
    });

    it('should reject if action throws exception', () => {
        const err = new Error();

        action.mockImplementation(() => {
            throw err;
        });

        return expect(method.exec({ requiredParam: 'test' }, requestMock)).rejects.toBe(err);
    });

    it('should return action result', () => {
        const actionReturnValue = { result: true };

        action.mockReturnValue(actionReturnValue);

        return expect(method.exec({ requiredParam: 'test' }, requestMock)).resolves.toBe(actionReturnValue);
    });
});
