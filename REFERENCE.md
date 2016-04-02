# API Reference
  * Server side
    * [Class Api](#class-api)
      * [constructor(methodPathPattern, [options])](#constructormethodpathpattern-options)
      * [exec(methodName, [params], [request])](#execmethodname-params-request)
    * [Class ApiMethod](#class-apimethod)
      * [constructor(method)](#constructormethod)
      * [exec([params], [request], [api])](#execparams-request-api)
    * [Class ApiError](#class-apierror)
      * [constructor(type, message)](#constructortype-message)
      * [toJSON](#tojson)
      * [Error types](#error-types)
    * [Express middleware](#express-middleware)
  * Frontend side
    * [Class Api (bla)](#class-api-bla)
      * [constructor(basePath, [options])](#constructorbasepath-options)
      * [exec(methodName, [params], [execOptions])](#execmethodname-params-execoptions)
    * [Class ApiError (bla-error)](#class-apierror-bla-error)

## Class Api
### constructor(methodPathPattern, options)
Creates a new instance of API and collects all your API methods from `methodPathPattern` path. Path supports [minimatch](https://github.com/isaacs/minimatch).

Example:
```javascript
var Api = require('bla').Api;
var api = new Api(__dirname + '/api/**/*.api.js');
```

Also you can pass extra `options`:

| Name                  | Type               | Description                                                                                 |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| allowUndeclaredParams | Boolean            | Tolerates undeclared parameters. Defaults to `false`. See [ApiMethod](#class-apimethod)     |
| preventThrowingErrors | Boolean            | Wraps api call in promise to prevent throwing errors. Defaults to `false`. See [ApiMethod](#class-apimethod |
| paramsValidation      | String \| Function | Preprocessing method parameters. Defaults to `normalize`. See [ApiMethod](#class-apimethod) |

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

| Name                  | Type               | Description                                                                |
| --------------------- | ------------------ | -------------------------------------------------------------------------- |
| showOnDocPage         | Boolean            | Show API method on the documentation page. Defaults to `true`.             |
| executeOnServerOnly   | Boolean            | Permit to execute method only on server side. Defaults to `false`.         |
| allowUndeclaredParams | Boolean            | Tolerates undeclared parameters. Defaults to `false`.                      |
| preventThrowingErrors | Boolean            | Wraps api call in promise to prevent throwing errors. Defaults to `false`. |
| paramsValidation      | String \| Function | Preprocessing method parameters. Defaults to `normalize`.                  |

By default all passed undeclared paramters cause an error. The option `allowUndeclaredParams` disable this behaviour and makes it possible to pass undeclared parameters.

The `preventThrowingErrors` option is good for production environment because all errors which occur in api methods (even SyntaxError) will be safely wrapped in a promise. So it breaks the developed service more gracefully.

The option `paramsValidation` makes it possible to change default parameter preprocessing. `normalize` mode tries to convert each parameter value to its declared type if it is possible. `strict` mode strictly checks if parameter value corresponds to its declared type.

Also you can implement your own `paramsValidation` function.
```javascript
var helloMethod = new ApiMethod({
    name: 'hello',
    params: {
        name: {type: 'String'}
    },
    options: {
        paramsValidation: function (paramValue, paramName, paramDeclaration) {
            return paramValue; // don't use validation at all
        }
    },
    action: function () {}
});

```
where
  * `paramValue` — a parameter value which should be validated.
  * `paramDeclaration` — [parameter declaration](#params).

**Note.** It is strongly recommended to throw ApiErrors only.

### exec([params], [request], [api])
Executes an API method with provided `params`.

An express request can also be passed using `request` parameter. [The middleware](#express-middleware) proxies it for you.

`api` is an instance of [Api class](#class-api). You can use it to execute methods inside a method.

Returns [vow.Promise](https://github.com/dfilatov/vow).
The promise will be resolved with a method response or rejected with [ApiError](#class-apierror).

**We strongly recommend to reject promises only with [ApiError](#class-apierror) instances.**

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

## Validation
By default all parameter types are cast according to the declared types.
Also default values are automatically set, if declared. See [params](#params).

It is possible to use custom parameters validation. It can be achieved by creating an ApiMethod subclass and overriding its protected method `_normalizeParams`.

In the following example [inherit](https://github.com/dfilatov/inherit) library is used to create a subclass.
```javascript
 var CustomMethod = inherit(ApiMethod, {
    _normalizeParams: function (values, params) {
        // perform any actions

        // call parent method if necessary
        return this.__base(values, params);
     }
 });

 var customMethod = new CustomMethod({
     // method declaration
 });

```
 Please, refer to the [_normalizeParams method code](https://github.com/baby-loris/bla/blob/master/lib/api-method.js) for more details.

## Class ApiError
### constructor(type, message)
ApiError is inherited from JavaScript Error class. You can specify `type` of the error and `message` with human-readable description of the error.

See bellow supported list of errors.

Example:
```javascript
var ApiError = require('bla').ApiError;
throw new ApiError(ApiError.INTERNAL_ERROR, 'Internal server error');
```

### toJSON()
Stringify an ApiError into a json object. It's used by [middleware](#express-middleware).

You can specify your own `toJSON` implementation if you want to pass extra parameters to the client side.
```javascript
var apiMethod = new bla.ApiMethod({
    name: 'method',
    action: function () {
        var error = new Error('Something bad is happened');
        error.toJSON = function ()  {
            return {
                type: 'BAD_ERROR',
                message: 'Something bad is happened',
                reason: 'It was Loki\'s fault'
            };
        };

        return vow.reject(error);
    }
});
```

### Error types
  * `ApiError.BAD_REQUEST` — Invalid or missed parameter.
  * `ApiError.INTERNAL_ERROR` — Unspecified error or error in server logic.
  * `ApiError.NOT_FOUND` — API method or middleware wasn't found.

## Express Middleware
```
var apiMiddleware = require('bla').apiMiddleware(api, options)
```
The middleware adds a route path for API to your Express application. You need to pass Api instance.

**Note.** The middleware always proxies an express request to an executed method.

### Options
Using the second paremeter `options` you can tune the middleware up.

| Name                | Type     | Description                                                                                             |
| -----------------   | -------- | ------------------------------------------------------------------------------------------------------- |
| \[enableDocPage\]   | Boolean  | Generate documentation page. Defaults to `true`. See [example](examples/middleware/without_docpage.js). |
| \[buildMethodName\] | Function | `express.Request` is passed to the function. The function should return a method name. By default methodName is taken from the `req.params.method`. See [example](examples/middleware/build_method_name.js). |

Method parameters are `req.query` extended by `req.body`.

The middleware accepts `GET` and `POST` requests from the client.

**Note.** Don't forget to add [body-parser](https://github.com/expressjs/body-parser) middleware, because the provided client module uses `POST` requests.

Also you must specify `:method?` parameter in the route path used by this middleware or `buildMethodName` function. Otherwise, the middleware won't find the API method name.

If you don't provide any method name, the middleware will show your the list of all available API methods (special page with documentation). Specified descriptions for methods and params will be used for generating documentation.

Example:
```
var app = require('express')();
var bodyParser = require('body-parser');
var bla = require('bla');
var api = new bla.Api(__dirname + '/../api/**/*.api.js');

app
    .use(bodyParser.json())
    .use('/api/:method?', bla.apiMiddleware(api))
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

Also you can specify extra options:

| Name               | Type    | Description                                                                             |
| ------------------ | ------- | --------------------------------------------------------------------------------------- |
| \[enableBatching\] | Boolean | Configure [batching](README.md#batch) globally. Pass `false` to disable. Defaults to `true`. |

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
Disable batching globally:
```javascript
// all api.exec() calls will NOT be batched
var api = new Api('/api/', {enableBatching: false});
```

### exec(methodName, [params], [execOptions])
Sends a request to the server for executing API method with name `methodName` and provided `params`. The options argument is used for changing the method behavior.
The method returns a [vow.Promise](http://dfilatov.github.io/vow/).

execOptions:

| Name               | Type    | Description                                                                                            |
| ------------------ | ------- | ------------------------------------------------------------------------------------------------------ |
| \[enableBatching\] | Boolean | Configure [batching](README.md#batch) for the current request. Pass `false` to disable. Defaults to `true`. |

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
api.exec('slow-poke', {}, {enableBatching: false}).then(function () {
    // ...
});
```
## Class ApiError (bla-error)

It works absolutely the same as [the server version of ApiError](#class-apierror).
