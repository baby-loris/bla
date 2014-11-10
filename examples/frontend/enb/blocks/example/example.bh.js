module.exports = function (bh) {
    bh.match('example', function (ctx) {
        ctx.cls('col-md-9');
    });

    bh.match('example__caption', function (ctx) {
        ctx.tag('h1');
    });

    bh.match('example__subcaption', function (ctx) {
        ctx.tag('h2');
    });

    bh.match('example__hello', function (ctx) {
        ctx.cls('form-group');
    });

    bh.match('example__hello-label', function (ctx) {
        ctx
            .tag('label')
            .attr('class', 'control-label')
            .attr('for', 'name');
    });

    bh.match('example__hello-control', function (ctx) {
        ctx
            .tag('input')
            .cls('form-control')
            .attr('id', 'name');
    });

    bh.match('example__hello-result', function (ctx) {
        ctx.tag('h3');
    });

    bh.match('example__hello-result-label', function (ctx) {
        ctx
            .tag('span')
            .cls('label label-success')
            .attr('id', 'result');
    });

    bh.match('example__kittens', function (ctx) {
        ctx
            .cls('inline')
            .attr('id', 'kittens');
    });
};
