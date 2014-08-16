modules.define('api', ['baby-loris-api'], function (provide, Api) {
    provide(new Api('/api/'));
});
