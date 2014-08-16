module.exports = function (bt) {

    bt.match('example', function (ctx) {
        ctx.setContent(ctx.getParam('content'));
    });

    bt.match('example__caption', function (ctx) {
        ctx.setTag('h1');
        ctx.setContent(ctx.getParam('content'));
    });

    bt.match('example__subcaption', function (ctx) {
        ctx.setTag('h2');
        ctx.setContent(ctx.getParam('content'));
    });

    bt.match('example__hello', function (ctx) {
        ctx.disableCssClassGeneration();
        ctx.setAttr('class', 'form-group');
        ctx.setContent([
            {elem: 'hello-label'},
            {elem: 'hello-control'},
            {elem: 'hello-result'}
        ]);
    });

    bt.match('example__hello-label', function (ctx) {
        ctx.disableCssClassGeneration();
        ctx.setTag('label');
        ctx.setAttr('class', 'control-label');
        ctx.setAttr('for', 'name');
        ctx.setContent('Enter your name');
    });

    bt.match('example__hello-control', function (ctx) {
        ctx.disableCssClassGeneration();
        ctx.setTag('input');
        ctx.setAttr('class', 'form-control');
        ctx.setAttr('id', 'name');
    });

    bt.match('example__hello-result', function (ctx) {
        ctx.setTag('h3');
        ctx.setContent({elem: 'hello-result-label'});
    });

    bt.match('example__hello-result-label', function (ctx) {
        ctx.disableCssClassGeneration();
        ctx.setTag('span');
        ctx.setAttr('class', 'label label-success');
        ctx.setAttr('id', 'result');
    });

    bt.match('example__kittens', function (ctx) {
        ctx.disableCssClassGeneration();
        ctx.setAttr('class', 'col-md-9');
        ctx.setContent([
            {elem: 'kittens-pictures'}
        ]);
    });

    bt.match('example__kittens-pictures', function (ctx) {
        ctx.disableCssClassGeneration();
        ctx.setAttr('class', 'inline');
        ctx.setAttr('id', 'kittens');
    });
};
