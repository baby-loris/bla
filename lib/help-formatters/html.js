var jade = require('jade');
var vowFs = require('vow-fs');

/**
 * HTML help formatter.
 *
 * @param {Array} methods List of available methods.
 */
module.exports = function (methods) {
    var path = __dirname + '/html.jade';

    return vowFs.read(path).then(function (file) {
        return jade.compile(file.toString())({
            methods: methods
        });
    });
}
