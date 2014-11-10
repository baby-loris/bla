// borrowed from https://github.com/bem/bem-core/tree/v2/common.blocks/page
module.exports = function (bh) {
    bh.match('page', function (ctx, json) {
        ctx
            .tag('body')
            .cls('container')
            .content([
                ctx.content(),
                json.scripts
            ], true);

        return [
            '<!DOCTYPE html>',
            {
                tag: 'html',
                content: [
                    {
                        elem: 'head',
                        content: [
                            {tag: 'title', content: json.title},
                            json.styles
                        ]
                    },
                    json
                ]
            }
        ];
    });

    bh.match('page__head', function (ctx) {
        ctx.bem(false).tag('head');
    });

    bh.match('page__link', function (ctx) {
        ctx.bem(false).tag('link');
    });

    bh.match('page__js', function (ctx, json) {
        ctx
            .bem(false)
            .tag('script');
        json.url && ctx.attr('src', json.url);
    });

    bh.match('page__css', function (ctx, json) {
        ctx.bem(false);

        if (json.url) {
            ctx
                .tag('link')
                .attr('rel', 'stylesheet')
                .attr('href', json.url);
        } else {
            ctx.tag('style');
        }
    });
};
