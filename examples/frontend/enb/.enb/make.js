module.exports = function (config) {
    config.includeConfig('enb-bevis-helper');
    config.setLanguages(['en']);

    var bevisHelper = config.module('enb-bevis-helper')
        .browserSupport([
            'IE >= 9',
            'Safari >= 5',
            'Chrome >= 33',
            'Opera >= 12.16',
            'Firefox >= 28'
        ])
        .useAutopolyfiller();

    config.node('build/example', function (nodeConfig) {
        bevisHelper
            .sourceDeps('example-page')
            .forServerPage()
            .configureNode(nodeConfig);
    });
};
