mocha.setup('bdd');
mocha.checkLeaks();

chai.config.includeStack = true;

// Resolve test dependency if `test` module is not found.
modules.define('test', function (provide) {
    provide();
});

var should = chai.should();
modules.require(['test'], function () {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
});
