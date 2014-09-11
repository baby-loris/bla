# Example of using bla and enb builder
if you use an [enb builder](http://enb-make.info/) you're lucky.

Just add ```bla``` dependecy in your package.json
```json
"enb": {
    "dependencies": [
      "bla"
    ]
}
```
and start using it in your modules
```javascript
modules.define('api', ['bla'], function (provide, Api) {
    provide(new Api('/api/'));
});
```

## Run example
```
make
```
