# Example of using baby-loris-api and enb builder
if you use an [enb builder](http://enb-make.info/) you're lucky.

Just add ```baby-loris-api``` dependecy in your package.json
```json
"enb": {
    "dependencies": [
      "baby-loris-api"
    ]
}
```
and start using it in your modules
```javascript
modules.define('api', ['baby-loris-api'], function (provide, Api) {
    provide(new Api('/api/'));
});
```

## Run example
```
make
```
