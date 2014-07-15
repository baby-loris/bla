# baby-loris-api
\[ [Quick start](#quick-start) • [Examples](#examples) • [API Reference](#api-reference) \]

Provides helpers to support API in your baby-loris project.

## Installation
```
npm install baby-loris-api --save
```

## Quick start
### Declare API Method
Write API method declaration.
```javascript
var ApiMethod = require('baby-loris-api/lib/api-method');

module.exports = new ApiMethod('hello')
    .setDescription('Hello API method')
    .addParam({
        name: 'name',
        description: 'User name',
        required: true
    })
    .setAction(function (params) {
        return 'Hello, ' + params.name;
    });
```

Save it to the file ```hello.api.js``` and move it to ```api``` directory.

### and use it on server side
```javascript
var Api = require('baby-loris-api');
var api = new Api(__dirname + '/api/**/*.api.js');
api.exec('hello', {name: 'Stepan'}).then(function (response) {
    console.log(response); // 'Hello, Stepan'
});
```

You can find a working example in [example/backend](examples/backend/index.js) directory.

### or on frontend side
First, include [API middleware](#express-middleware) to your express application.
```javascript
var app = express();
var apiMiddleware = require('baby-loris-api/lib/middleware');
app.use('/api/:method?', apiMiddleware(__dirname + '/api/**/*.api.js'));
```

Only then use api module.
```javascript
modules.require('baby-loris-api', function (Api) {
    var api = new Api('/api/');
    api.exec('hello', {name: 'Stepan'}).then(function (response) {
        console.log(response); // 'Hello, Stepan'
    });
});
```
See [Api class](#class-api-baby-loris-api) for more information.

You can find a working example in [example/frontend](examples/frontend) directory.

## Examples
You can find examples in [examples](examples) folder.

Use makefile to run an example. For instance,
```
make example examples/frontend
```

## API Reference
  * Server side
    * [Class Api](#class-api)
      * [constructor(methodPathPattern)](#constructormethodpathpattern)
      * [exec(methodName, [params])](#execmethodname-params)
    * [Class ApiMethod](#class-apimethod)
      * [constructor(methodName)](#constructormethodname)
      * [setDescription(description)](#setdescriptiondescription)
      * [addParam(param)](#addparamparam)
      * [setAction(action)](#setactionaction)
      * [exec([params])](#execparams)
      * [hideOnDocPage()](#hideondocpage)
    * [Class ApiError](#class-apierror)
      * [Error types](#error-types)
    * [Express middleware](#express-middleware)
  * Frontend side
    * [Class Api (baby-loris-api)](#class-api-baby-loris-api)
      * [constructor(basePath)](#constructorbasepath)
      * [exec(methodName, [params], [options])](#execmethodname-params-options)
    * [Class ApiError (baby-loris-api-error)](#class-apierror-baby-loris-api-error)

### Class Api
#### constructor(methodPathPattern)
Creates a new instance of API and collects all your API methods from ```methodPathPattern``` path. Path supports [minimatch](https://github.com/isaacs/minimatch).

Example:
```javascript
var Api = require('baby-loris-api');
var api = new Api(__dirname + '/api/**/*.api.js');
```

#### exec(methodName, [params])
Executes an API method ```methodName``` with provided ```params```.

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

### Class ApiMethod
#### constructor(methodName)
Creates a new instance of API method with provided ```methodName```.

ApiMethod class supports chaining for methods: ```setDescription```, ```addParam```, and ```setAction```.

Example:
```javascript
var ApiMethod = require('baby-loris-api/lib/api-method');
var helloMethod = new ApiMethod('hello');
```
#### setDescription(description)
Change method description to provided ```description```.

Example:
```javascript
helloMethod.setDescription('This is a hello method');
```

#### addParam(param)
Add a new param declaration.

API method param is an object with the follow fields:

| Name          | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| name          | String  | Parameter name                                    |
| description   | String  | Parameter description                             |
| [type]        | String  | Parameter type (String, Number, Boolean, and etc) |
| [required]    | Boolean | Parameter should be required                      |

Example:
```javascript
helloMethod.addParam({
    name: 'name',
    description: 'User name',
    required: true
});
```

#### setAction(action)
Sets a function which should be executed when method runs.

Declared parameters will be passed to the ```action``` function.

Example:
```javascript
helloMethod.setAction(function (params) {
    return 'Hello, world';
});
```

#### exec([params])
Executes an API method with provided ```params```.

Returns [vow.Promise](https://github.com/dfilatov/vow).
Promise will be resolved with a method response or rejected with [ApiError](#class-apierror).

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

#### hideOnDocPage()
Hides the API method in built documentation.

### Class ApiError
#### constructor(type, message)
ApiError is inherited from Javascript Error class. You can specify ```type``` of the error and ```message``` with human-readable desription of the error.

See bellow supported list of errors.

Example:
```javascript
var ApiError = require('baby-loris-api/lib/api-error');
throw new ApiError(ApiError.INTERNAL_ERROR, 'Internal server error');
```

#### Error types
  * ```ApiError.BAD_REQUEST``` — Invalid or missed parameter.
  * ```ApiError.INTERNAL_ERROR``` — Unspecified error or server logic error.
  * ```ApiError.NOT_FOUND``` — API method or middleware wasn't found.

### Express Middleware
```
var apiMiddleware = require('baby-loris-api/lib/middleware')(methodPathPattern, options)
```
The middleware adds support API to your Express application. You need to pass ```methodPathPattern``` as you did for Api class.

#### Options
Using the second paremeter ```options``` you can tune the middleware up.

| Name             | Type    | Description                                       |
| ---------------- | ------- | ------------------------------------------------- |
| [disableDocPage] | Boolean | Turn off generating page with documentation       |

Method parameters are collected from Express request using [req.param](http://expressjs.com/4x/api.html#req.param) method. That means that you can use ```GET``` and ```POST``` methods from the client side as well.

**Note.** Don't forget to add [body-parser](https://github.com/expressjs/body-parser) middleware if you decide to use ```POST``` requests.

Also you must specify ```:method?``` parameter in the route path used by this middleware. Otherwise, the middleware couldn't find any API method at all.

If you don't provide any method name, the middleware will show your the list of all available API methods (special page with documentation). Specified descriptions for methods and params will be used for generating documentation.

Example:
```
var app = require('express')();
var apiMiddleware = require('baby-loris-api/lib/middleware');

app.use('/api/:method?', apiMiddleware(__dirname + '/../api/**/*.api.js'))
```

You can find a working example in [example/middleware](examples/middleware/index.js) directory.

#### Response
The middleware returns JSON from the server with ```200``` status (even if an error occured). You can distinguish an error and successful response cheking ```data``` and ```error``` fields in the root object.

Example of a successful response:
```json
{
    "data": "Hello, Stepan"
}
```

Example of a error response:
```json
{
    "error": {
        "type": "BAD_REQUEST",
        "message": "missing name parameter"
    }
}
```

### Class Api (baby-loris-api)
Requirements:
  * [YM](https://github.com/ymaps/modules) module system.
  * [inherit](https://github.com/dfilatov/inherit) — Inheritance module for Node.js and browsers.
  * [vow](https://github.com/dfilatov/vow) — DOM Promise and Promises/A+ implementation for Node.js and browsers.
  * [jQuery](http://jquery.com/) because everything needs jQuery :)

This class is provided by ```baby-loris-api``` module.

#### constructor(basePath)
Creates a new instance of client API. ```basePath``` is used to build path for ajax requests to the server. For example, if you define ```/api``` as a ```basePath``` then all request will be sent at ```https://<your host>/api/<method name>```.

Example:
```javascript
modules.require('baby-loris-api', function (Api) {
    var api = new Api('/api/');
});
```
#### exec(methodName, [params], [options])
Sends a request to the server for executing API method with name ```methodName``` and provided ```params```.

Also you can specify extra options:

| Name             | Type    | Description                                       |
| ---------------- | ------- | ------------------------------------------------- |
| [ajaxSettings]   | Object  | jQuery settings for ajax request                  |

### Class ApiError (baby-loris-api-error)
Requirements:
  * [YM](https://github.com/ymaps/modules) module system.
  * [inherit](https://github.com/dfilatov/inherit) — Inheritance module for Node.js and browsers.

This class is provided by ```baby-loris-api-error``` module.

It works absolutely the same as [the server version of ApiError](#class-apierror).
