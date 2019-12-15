import ApiMethod from '../ApiMethod';
import * as yup from 'yup';
import * as httpMocks from 'node-mocks-http';

describe('api method', () => {
    const requestMock = httpMocks.createRequest();
    const params = yup.object({
        requiredParam: yup
            .string()
            .required(),
        optionalParam: yup
            .number()
            .notRequired()
    });
    let method: ApiMethod<typeof params>;
    let action: jest.Mock;

    beforeEach(() => {
        action = jest.fn();
        method = new ApiMethod({ params, action });
    });

    it('should reject with error if params are not valid', () => {
        return expect(method.exec({} as any, requestMock)).rejects.toBeInstanceOf(yup.ValidationError);
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

    it('should strip unknown params', done => {
        method.exec(
            { requiredParam: 'test', optionalParam: 1, anotherParam: 'test3' } as any,
            requestMock
        ).then(() => {
            expect(action).toBeCalledWith({ requiredParam: 'test', optionalParam: 1 }, requestMock);
            done();
        });
    });

    it('should coerce params if possible', done => {
        method.exec(
            { requiredParam: 'test', optionalParam: '1', anotherParam: 'test3' } as any,
            requestMock
        ).then(() => {
            expect(action).toBeCalledWith({ requiredParam: 'test', optionalParam: 1 }, requestMock);
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
