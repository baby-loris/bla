interface ApiMethodResponseSuccess<TData = unknown> {
    data: TData;
    error?: undefined;
}

interface ApiMethodResponseFailed {
    data?: undefined;
    error: {
        message: string;
        source?: unknown;
    };
}

type ApiMethodResponse<TData = unknown> =
    ApiMethodResponseSuccess<TData> |
    ApiMethodResponseFailed;

export { ApiMethodResponse, ApiMethodResponseSuccess, ApiMethodResponseFailed };
