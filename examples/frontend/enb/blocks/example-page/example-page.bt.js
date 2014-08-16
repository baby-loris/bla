module.exports = function (bt) {

    bt.match('example-page', function () {
        return {
            block: 'page',
            title: 'Frontend example',
            styles: [
                'http://yastatic.net/bootstrap/3.1.1/css/bootstrap.min.css'
            ],
            scripts: [
                '/build/example/_example.en.js'
            ],
            body: {
                block: 'example',
                content: [
                    {elem: 'caption', content: 'Tests for the frontend part of API'},
                    {elem: 'subcaption', content: 'Greeting from server (hello.api.js)'},
                    {elem: 'hello'},
                    {elem: 'subcaption', content: 'Kittens from flickr (get-kittens.api.js)'},
                    {elem: 'kittens'}
                ]
            }
        };
    });
};
