# bla 
[![NPM version](https://badge.fury.io/js/bla.svg)](http://badge.fury.io/js/bla) [![Build Status](https://secure.travis-ci.org/baby-loris/bla.svg)](http://travis-ci.org/baby-loris/bla)

## Installation
```
npm i bla
```
If you use TypeScript, don't forget to install typings for [yup](https://github.com/jquense/yup):

```
npm i @types/yup
```

## Quick start
### Server side
#### Declare API Method

Write API method declaration
```ts
import { ApiMethod } from 'bla/server';
import * as yup from 'yup';

const helloMethod = new ApiMethod({
    params: yup.object({
        name: yup.string().required()
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

api.exec('hello', { name: 'Stepan' }).then(res => {
    console.log(res); // 'Hello, Stepan'
});

export default api;
```

Save it to `api.ts`.

#### or expose it as express middleware
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
