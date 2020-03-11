# bla
[![NPM version](https://badge.fury.io/js/bla.svg)](http://badge.fury.io/js/bla) [![Build Status](https://secure.travis-ci.org/baby-loris/bla.svg)](http://travis-ci.org/baby-loris/bla)

## Installation
```
npm i bla
```
Also you need to install [runtypes](https://github.com/pelotom/runtypes) to define params schema.

```
npm i runtypes
```

## Quick start
### Server side
#### Write API method declaration
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

#### Create api with declared methods
```ts
import { ApiMethod } from 'bla/server';
import helloMethod from './api/hello.ts';

const api = new Api({
    hello: helloMethod
});

// Export api contract to use it on client side
type ApiContract = ExtractApiContract<typeof api>;

export default api;
export { ApiContract };
```

Save it to `api.ts`.

#### Expose api as express middleware
```ts
import * as express from 'express';
import { apiMiddleware } from 'bla/server';
import api from './api';

express()
    .use('/api', apiMiddleware({ api }))
    .listen(8080);
```

### Client side
```ts
import { Api } from 'bla/client';
import { ApiContract } from 'pathToServer/Api.ts';

const api = new Api<ApiContract>({ url: '/api' });

api.exec('hello', { name: 'Stepan' }).then(res => {
    console.log(res); // 'Hello, Stepan'
});
```

## FAQ
### How to define both required and optional params?
Use `runtypes.Intersect`:
```ts
const getObject = new ApiMethod({
    params: runtypes.Intersect(
        runtypes.Record({
            id: runtypes.String
        }),
        runtypes.Partial({
            uid: runtypes.String
        })
    }),
    
    action: params => {
        // typeof `params.id` is `string`
        // typeof `params.uid` is `string | undefined`
    }
});
```
