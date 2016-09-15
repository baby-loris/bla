/**
 * Generates HTML page for examples.
 *
 * @returns {String}
 */
module.exports = function () {
    return [
        '<doctype html/>',
        '<html lang="en">',
            '<head>',
                '<title>Frontend example</title>',
                '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>',
                '<link rel="stylesheet" href="//yastatic.net/bootstrap/3.1.1/css/bootstrap.min.css"/>',
                '<script src="/node_modules/vow/lib/vow.js"></script>',
                '<script src="/blocks/bla-error/bla-error.js"></script>',
                '<script src="/blocks/bla/bla.js"></script>',
                '<script src="/examples/frontend/bla/client.js"></script>',
            '</head>',
            '<body class="container">',
                '<div class="col-md-7">',
                    '<h1>Tests for the frontend part of API</h1>',
                    '<h1>Greeting from server (hello.api.js)</h1>',
                    '<div class="form-group">',
                        '<label class="control-label" for="name">Enter your name</label>',
                        '<input class="form-control" id="name"/>',
                        '<h3>',
                            '<span class="label label-success" id="result"></span>',
                        '</h3>',
                    '</div>',
                '</div>',
                '<div class="col-md-9">',
                    '<h3>Kittens from flickr (get-kittens.api.js)</h3>',
                    '<div id="kittens" class="inline"></div>',
                '</div>',
            '</body>',
        '</html>'
    ].join('');
};
