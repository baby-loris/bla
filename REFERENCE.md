# API Reference
  * Server side
    * [Class Api](#class-api)
      * [constructor(methodPathPattern)](#constructormethodpathpattern)
      * [exec(methodName, [params], [request])](#execmethodname-params-request)
    * [Class ApiMethod](#class-apimethod)
      * [constructor(method)](#constructormethod)
      * [exec([params], [request])](#execparams-request)
    * [Class ApiError](#class-apierror)
      * [Error types](#error-types)
    * [Express middleware](#express-middleware)
  * Frontend side
    * [Class Api (bla)](#class-api-bla)
      * [constructor(basePath, [options])](#constructorbasepath-options)
      * [exec(methodName, [params], [execOptions])](#execmethodname-params-execoptions)
    * [Class ApiError (bla-error)](#class-apierror-bla-error)

## Class Api
### constructor(methodPathPattern)
Creates a new instance of API and collects all your API methods from `methodPathPattern` path. Path supports [minimatch](https://github.com/isaacs/minimatch).

Example:
```javascript
var Api = require('bla').Api;
var api = new Api(__dirname + '/api/**/*.api.js');
```

### exec(methodName, [params], [request])
Executes an API method `methodName` with the provided `params`.

An express request can also be passed using `request` parameter. [The middleware](#express-middleware) proxies it for you.

Returns [vow.Promise](https://github.com/dfilatov/vow).
Promise will be resolved with a method response or rejected with [ApiError](#class-apierror).

Example:
```javascript
api.exec('hello', {name: 'Stepan'})
    .then(function (response) {
        console.log(response);
    })
    .fail(function (error) {
        console.log(error.message);
    });
```

## Class ApiMethod
### constructor(method)
Creates a new instance of ApiMethod with provided data.

`method` is an object described a method.

| Name                    | Type     | Description                                        |
| ----------------------- | -------- | -------------------------------------------------- |
| name                    | String   | Method name                                        |
| [action](#action)       | Function | Function which should be executed when method runs |
| \[description\]         | String   | Method description                                 |
| [\[params\]](#params)   | Object   | Declarations of method parameters                  |
| [\[options\]](#options) | Object   | Method options                                     |

Example:
```javascript
var ApiMethod = require('bla').ApiMethod;
var helloMethod = new ApiMethod({
    name: 'hello',
    action: function () {
        return 'Hello, world!';
    }
});
```

#### action
Declared parameters will be passed to the `action` function as a first parameter. If the method is executed via the middleware, expresses request will be passed as a second parameter (`undefined` for server side execution).

A third parameter is an [Api](#class-api) instance. It's very useful in cases when the api method executes other api methods.

Example:
```javascript
var helloMethod = new ApiMethod({
    name: 'hello',
    action: function (params, request, api) {
        return api.exec('method1');
    }
});
```

#### params
API method param is an object with the follow fields:

| Name             | Type    | Description                                       |
| ---------------- | ------- | ------------------------------------------------- |
| name             | String  | Parameter name                                    |
| description      | String  | Parameter description                             |
| \[type\]         | String  | Parameter type (String, Number, Boolean, etc.)    |
| \[defaultValue\] | Any     | Default value of the parameter                    |
| \[required\]     | Boolean | Should the parameter be made obligatory           |

Example:
```javascript
var helloMethod = new ApiMethod({
    name: 'hello',
    params: {
        name: {
            type: 'String',
            description: 'User name'
            required: true
        }
    },
    action: function () {
        return 'Hello, world!';
    }
});
```

#### options
List of available `options`:

| Name                | Type     | Description                                    |
| ------------------- | -------- | ---------------------------------------------- |
| hiddenOnDocPage     | Boolean  | Hides the API method in built documentation.   |
| executeOnServerOnly | Boolean  | Permit to execute method only on server side . |

### exec([params], [request])
Executes an API method with provided `params`.

An express request can also be passed using `request` parameter. [The middleware](#express-middleware) proxies it for you.

Returns [vow.Promise](https://github.com/dfilatov/vow).
The promise will be resolved with a method response or rejected with [ApiError](#class-apierror).

Example:
```javascript
helloMethod.exec({name: 'Stepan'})
    .then(function (response) {
        console.log(response);
    })
    .fail(function (error) {
        console.log(error.message);
    });
```

## Class ApiError
### constructor(type, message)
ApiError is inherited from JavaScript Error class. You can specify `type` of the error and `message` with human-readable description of the error.

See bellow supported list of errors.

Example:
```javascript
var ApiError = require('bla').ApiError;
throw new ApiError(ApiError.INTERNAL_ERROR, 'Internal server error');
```

### Error types
  * `ApiError.BAD_REQUEST` — Invalid or missed parameter.
  * `ApiError.INTERNAL_ERROR` — Unspecified error or error in server logic.
  * `ApiError.NOT_FOUND` — API method or middleware wasn't found.

## Express Middleware
```
var apiMiddleware = require('bla').apiMiddleware(methodPathPattern, options)
```
The middleware adds a route path for API to your Express application. You need to pass `methodPathPattern` as you did for Api class or an Api instance itself.

**Note.** The middleware always proxies an express request to an executed method.

### Options
Using the second paremeter `options` you can tune the middleware up.

| Name              | Type     | Description                                                                                         |
| ----------------- | -------- | --------------------------------------------------------------------------------------------------- |
| \[enableDocPage\]  | Boolean  | Generate documentation page. Defaults to `true`. See [example](examples/middleware/without_docpage.js). |
| \[buildMethodName\] | Function | `express.Request` is passed to the function. The function should return a method name. By default methodName is grabbed by executing `req.param('method')`. See [example](examples/middleware/build_method_name.js). |

Method parameters are collected from Express request using [req.param](http://expressjs.com/4x/api.html#req.param) method.

For example, the apiMiddleware will look for a parameter named `myparam` in the following order:
  1. In the URL path (`/api/:myparam?`).
  2. In the request's query string (`?myparam=1`).
  3. In the request's body.

The middleware accepts `GET` and `POST` requests from the client.

**Note.** Don't forget to add [body-parser](https://github.com/expressjs/body-parser) middleware, because the provided client module uses `POST` requests.

Also you must specify `:method?` parameter in the route path used by this middleware or `buildMethodName` function. Otherwise, the middleware won't find the API method name.

If you don't provide any method name, the middleware will show your the list of all available API methods (special page with documentation). Specified descriptions for methods and params will be used for generating documentation.

Example:
```
var app = require('express')();
var bodyParser = require('body-parser');
var apiMiddleware = require('bla').apiMiddleware;

app
    .use(bodyParser.json())
    .use('/api/:method?', apiMiddleware(__dirname + '/../api/**/*.api.js'))
```

You can find a working examples in [example/middleware](examples/middleware) directory.

### Response
The middleware returns a response with a JSON string and a `200` status code (even if an error occured). You can distinguish an error and successful response by checking the `data` and `error` fields in the root of the response object.

Example of a successful response:
```json
{
    "data": "Hello, Stepan"
}
```

Example of a response with an error:
```json
{
    "error": {
        "type": "BAD_REQUEST",
        "message": "missing name parameter"
    }
}
```

## Class Api (bla)
Requirements:
  * [vow](https://github.com/dfilatov/vow) — DOM Promise and Promises/A+ implementation for Node.js and browsers.

### constructor(basePath, [options])
Creates a new instance of client API. `basePath` is used to build the path for AJAX requests to the server. For example, if you define `/api` as a `basePath` then all request will be sent to `https://<your host>/api/<method name>`.

Also you can specify an extra options:

| Name           | Type                | Description                                                                                                                                                               |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \[noBatching\] | Boolean\|String\[\] | Disable using [batch](#bla-batch) for all client requests (`false` by default), or if an array of strings is passed, disable batching only for specific methods. |

You can use the client-side bundle of bla with different module systems. For example:
```javascript
// ym
modules.require('bla', function (Api) {
    var api = new Api('/api/');
});

// require.js
require(['bla'], function (Api) {
    var api = new Api('/api/');
});

// without module system
var api = new bla.Api('/api/');
```
There are two ways for using the `noBatching` parameter.
Disable batching globally:
```javascript
// all api.exec() calls will NOT be batched
var api = new Api('/api/', {noBatching: true});
```
Disable batching per method:
```javascript
// api.exec() calls with method name argument 'slow-poke' will not be batched
var api = new Api('/api/', {noBatching: ['slow-poke']});
```
### exec(methodName, [params], [execOptions])
Sends a request to the server for executing API method with name `methodName` and provided `params`. The options argument is used for changing the method behavior.
The method returns a [vow.Promise](http://dfilatov.github.io/vow/).

| Name           | Type    | Description                                                                |
| -------------- | ------- | -------------------------------------------------------------------------- |
| \[noBatching\] | Boolean | Disable using [batch](#bla-batch) for current request (`false` by default) |

For example:
```javascript
api.exec('hello')
    .then(function (response) {
        // Be polite! Handle the 'response' properly.
        // ...
    })
    .fail(function (reason) {
        // Even when rejected, a gentleman shouldn't lose his temper. Do something with the 'reason'.
        // ...
    });
```
If you want to disable the batching for a single `api.exec()` call:
```javascript
// method 'slow-poke' won't be batched for this call only
api.exec('slow-poke', {}, {noBatching: true}).then(function () {
    // ...
});
```
## Class ApiError (bla-error)

It works absolutely the same as [the server version of ApiError](#class-apierror).
