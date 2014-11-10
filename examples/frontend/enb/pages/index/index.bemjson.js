({
    block: 'page',
    title: 'Frontend example',
    styles: [
        {elem: 'css', url: 'http://yastatic.net/bootstrap/3.1.1/css/bootstrap.min.css'}
    ],
    scripts: [
        {elem: 'js',  url: '/pages/index/_index.js'}
    ],
    content: {
        block: 'example',
        content: [
            {elem: 'caption', content: 'Tests for the frontend part of API'},
            {elem: 'subcaption', content: 'Greeting from server (hello.api.js)'},
            {elem: 'hello', content: [
                {elem: 'hello-label', content: 'Enter your name'},
                {elem: 'hello-control'},
                {elem: 'hello-result', content: [
                    {elem: 'hello-result-label'}
                ]}
            ]},
            {elem: 'subcaption', content: 'Kittens from flickr (get-kittens.api.js)'},
            {elem: 'kittens'}
        ]
    }
})
