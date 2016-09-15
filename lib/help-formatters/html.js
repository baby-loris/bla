var vow = require('vow');

/**
 * HTML help formatter.
 *
 * @param {Array} methods List of available methods.
 * @returns {vow.Promise}
 */
module.exports = function (methods) {
    var html = getHtml(methods);
    return vow.resolve(html);
};

/**
 * Genereates HTML for documentation page.
 *
 * @param {ApiMethod[]} methods
 * @returns {String}
 */
function getHtml(methods) {
    return [
        '<!doctype html>',
        '<html lang="en">',
            '<head>',
                '<title>API Index</title>',
                '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>',
                '<link rel="stylesheet" href="//yastatic.net/bootstrap/3.1.1/css/bootstrap.min.css"/>',
            '</head>',
            '<body class="container">',
                '<div class="col-md-7">',
                    Object.keys(methods).map(function (name) {
                        return getMethodHtml(methods[name]);
                    }).join(''),
                '</div>',
            '</body>',
        '</html>'
    ].join('');
}

/**
 * Genereates documentation for API method.
 *
 * @param {ApiMethod} method
 * @returns {String}
 */
function getMethodHtml(method) {
    var params = method.getParams();

    return [
        '<h3>', method.getName(), '</h3>',
        method.getOption('executeOnServerOnly') &&
            '<span class="label label-primary" style="font-size:0.5em;vertical-align:middle">server only</span>',
        '<p>', method.getDescription(), '</p>',
         Object.keys(params).length &&
            [
                '<table class="table table-bordered table-condensed">',
                    '<thead>',
                        '<tr>',
                            '<th class="col-md-2">Name</th>',
                            '<th class="col-md-2">Type</th>',
                            '<th>Description</th>',
                        '</tr>',
                    '</thead>',
                    '<tbody>',
                        Object.keys(params).map(function (key) {
                            return getMethodParamHtml(key, params[key]);
                        }).join(''),
                    '</tbody>',
                '</table>'
            ].join('')
    ].filter(Boolean).join('');
}

/**
 * Genereates documentation for API method param.
 *
 * @param {String} name
 * @param {Object} param
 * @returns {String}
 */
function getMethodParamHtml(name, param) {
    return [
        '<tr>',
            '<td>',
                name,
                param.required ?
                    '<span title="Required field" style="color:red;cursor:default">&nbsp;*</span>' : '',
            '</td>',
            '<td>', param.type || 'As is', '</td>',
            '<td>', param.description, '</td>',
        '</tr>'
    ].join('');
}
