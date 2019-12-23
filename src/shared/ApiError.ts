interface ApiError<TData = unknown> extends Error {
    type: string;
    data?: TData;
}

declare class ApiError<TData extends unknown> {
    constructor(type: string, message?: string, data?: TData);
}

function ApiError<TData extends unknown>(
    this: unknown,
    type = ApiError.INTERNAL_ERROR,
    message?: string,
    data?: TData
): ApiError<TData> {
    const err = new Error(message) as ApiError<TData>;

    err.name = 'ApiError';
    err.type = type;
    err.data = data;

    Object.setPrototypeOf(err, Object.getPrototypeOf(this));

    if(Error.captureStackTrace) {
        Error.captureStackTrace(err, ApiError);
    }

    return err;
}

// NOTE: Use [] to get rid of an error in generated d.ts
ApiError['prototype'] = Object.create(
    Error.prototype,
    {
        constructor: {
            value: Error,
            enumerable: false,
            writable: true,
            configurable: true
        }
    }
);

Object.setPrototypeOf(ApiError, Error);

ApiError.INTERNAL_ERROR = 'INTERNAL_ERROR';
ApiError.BAD_REQUEST = 'BAD_REQUEST';
ApiError.NOT_FOUND = 'NOT_FOUND';

export default ApiError;
