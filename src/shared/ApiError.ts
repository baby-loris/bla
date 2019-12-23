interface ApiError<TSource = unknown> extends Error {
    source?: TSource;
}

declare class ApiError<TSource extends unknown> {
    constructor(message: string, source?: TSource);
}

function ApiError<TSource extends unknown>(this: unknown, message: string, source?: TSource): ApiError<TSource> {
    const err = new Error(message) as ApiError<TSource>;

    err.name = 'ApiError';
    err.source = source;

    Object.setPrototypeOf(err, Object.getPrototypeOf(this));

    if(Error.captureStackTrace) {
        Error.captureStackTrace(err, ApiError);
    }

    return err;
};

ApiError.prototype = Object.create(
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

export default ApiError;
