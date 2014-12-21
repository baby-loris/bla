require('../blocks/bla-error/bla-error.js');
require('../blocks/bla/bla.js');
require('../tests/blocks/bla/bla.test.js');
require('../tests/blocks/bla-error/bla-error.test.js');

var should = chai.should();
window.TIMEOUT = 400; // next tick is different in browsers
modules.require(['test'], function () {
    mocha.run();
});
