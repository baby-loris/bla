module.exports = function (config) {
    config.node('pages/index', function (nodeConfig) {
        nodeConfig.addTechs([
            [require('enb/techs/levels'), {levels: getLevels(config)}],
            [require('enb/techs/file-provider'), {target: '?.bemjson.js'}],
            require('enb/techs/bemdecl-from-bemjson'),
            require('enb-modules/techs/deps-with-modules'),
            require('enb/techs/files'),
            require('enb-bh/techs/bh-server'),
            [require('enb/techs/js'), {target: '?.pre.js'}],
            [require('enb-modules/techs/prepend-modules'), {source: '?.pre.js', target: '?.js'}],
            require('enb-bh/techs/html-from-bemjson'),
            [require('enb/techs/file-copy'), {source: '?.js', target: '_?.js'}]
        ]);
        nodeConfig.addTargets(['?.html', '_?.js']);
    });

    function getLevels(config) {
        var levels = [
            'node_modules/bla/blocks',
            'blocks'
        ];
        return levels.map(config.resolvePath.bind(config));
    }
};
