# bla
[![NPM version](https://badge.fury.io/js/bla.svg)](http://badge.fury.io/js/bla) [![Build Status](https://secure.travis-ci.org/baby-loris/bla.svg)](http://travis-ci.org/baby-loris/bla)

## Installation
```
npm i bla
```
Also you have to install [runtypes](https://github.com/pelotom/runtypes) to define params schema.

```
npm i runtypes
```

## Quick start
### Server side
#### Declare API Method

Write API method declaration
```ts
import { ApiMethod } from 'bla/server';
import * as runtypes from 'runtypes';

const helloMethod = new ApiMethod({
    params: runtypes.Record({
        name: runtypes.String
    }),
    action: params => `Hello, ${params.name}`;
});

export default helloMethod;
```

Save it to `api/hello.ts`.

#### and use it on server side
```ts
import { ApiMethod } from 'bla/server';
import helloMethod from './api/hello.ts';

const api = new Api({
    hello: helloMethod
});

export default api;
```

Save it to `api.ts`.

#### exposing as express middleware
```ts
import * as express from 'express';
import { apiMiddleware } from 'bla/server';
import api from './api';

express()
    .use('/api', apiMiddleware(api))
    .listen(8080);
```

### Client side
```ts
import { Api } from 'bla/client';

const api = new Api({ url: '/api' });

api.exec('hello', { name: 'Stepan' }).then(res => {
    console.log(res); // 'Hello, Stepan'
});
```
