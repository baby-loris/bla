var MochaSauce = require('mocha-sauce');
var express = require('express');
var server = express()
    .use('/', express.static(__dirname + '/../..'))
    .listen(8080);

var sauce = new MochaSauce({
    name: 'bla',
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    host: 'localhost',
    port: 4445,
    url: 'http://localhost:8080/tests/blocks/run-tests.html?sauce',
    build: process.env.TRAVIS_BUILD_NUMBER || Date.now(),
    public: 'public'
});

sauce.browser({browserName: 'chrome', platform: 'Windows 7'});
sauce.browser({browserName: 'firefox', platform: 'Windows XP'});
sauce.browser({browserName: 'opera', platform: 'Windows XP'});

sauce.on('init', function (browser) {
    console.log('[init]\t%s %s\t%s', browser.browserName, browser.version, browser.platform);
});

sauce.on('start', function (browser) {
    console.log('[start]\t%s %s\t%s', browser.browserName, browser.version, browser.platform);
});

sauce.on('end', function (browser, res) {
    console.log('[end]\t%s %s\t%s => %d failures',
        browser.browserName, browser.version, browser.platform, res.failures);
});

sauce.start(function (err, res) {
    if (err) {
        console.error(err);
    }
    server.close();
});
