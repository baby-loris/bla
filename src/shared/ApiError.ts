class ApiError<TSource = unknown> extends Error {
    name: 'ApiError';

    constructor(
        message: string,
        public readonly source?: TSource
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export default ApiError;
