module.exports = function (bt) {

    bt.match('page', function (ctx) {
        return [
            '<!DOCTYPE html>',
            {
                elem: 'html',
                content: [
                    {
                        elem: 'head',
                        content: [
                            {elem: 'meta', charset: 'utf-8'},
                            {elem: 'title', content: ctx.getParam('title')},
                            ctx.getParam('styles').map(function (style) {
                                return {elem: 'css', url: style};
                            })
                        ]
                    },
                    ctx.getJson()
                ]
            }
        ];
    });

    bt.match('page__html', function (ctx) {
        ctx.setTag('html');
        ctx.disableCssClassGeneration();
        ctx.setContent(ctx.getParam('content'));
    });

    bt.match('page__head', function (ctx) {
        ctx.setTag('head');
        ctx.disableCssClassGeneration();
        ctx.setContent(ctx.getParam('content'));
    });

    bt.match('page__title', function (ctx) {
        ctx.disableCssClassGeneration();
        ctx.setTag('title');
        ctx.setContent(ctx.getParam('content'));
    });

    bt.match('page__meta', function (ctx) {
        ctx.setTag('meta');
        ctx.disableCssClassGeneration();
        ctx.setAttr('content', ctx.getParam('content'));
        ctx.setAttr('http-equiv', ctx.getParam('http-equiv'));
        ctx.setAttr('charset', ctx.getParam('charset'));
    });

    bt.match('page', function (ctx) {
        ctx.setTag('body');
        ctx.disableCssClassGeneration();
        ctx.setAttr('class', 'container');
        ctx.setContent([].concat(
            ctx.getParam('body'),
            ctx.getParam('scripts').map(function (script) {
                return {
                    elem: 'js',
                    url: script
                };
            })
        ));
    });

    bt.match('page__js', function (ctx) {
        ctx.disableCssClassGeneration();
        ctx.setTag('script');
        ctx.setAttr('src', ctx.getParam('url'));
        ctx.setAttr('type', 'text/javascript');
    });

    bt.match('page__css', function (ctx) {
        ctx.disableCssClassGeneration();
        ctx.setTag('link');
        ctx.setAttr('rel', 'stylesheet');
        ctx.setAttr('href', ctx.getParam('url'));
    });
};
