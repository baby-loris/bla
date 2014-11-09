# Example of using bla and enb builder
[enb builder](http://enb-make.info/) is a builder for BEM/BEViS projects.

## Installation
Specify an extra level `node_modules/enb/blocks` in `.enb/make.js`.

Also don't forget about `vow` dependency.

**Note.** [bem-core](https://github.com/bem/bem-core) library has `vow` module. Use `bem-core` for BEM projects ;)

## Run example
```
make
```

## BEViS
If you are using [BEViS approach](https://github.com/bevis-ui/docs) you're lucky.

Just add `bla` dependency in your `package.json`.
```json
"enb": {
    "dependencies": [
      "bla"
    ]
}
```
and start using it in your modules.
```javascript
modules.define('api', ['bla'], function (provide, Api) {
    provide(new Api('/api/'));
});
```
