require.config({
    paths: {
        'baby-loris-api-error': 'blocks/baby-loris-api-error/baby-loris-api-error',
        'baby-loris-api': 'blocks/baby-loris-api/baby-loris-api',
        vow: 'node_modules/vow/vow.min'
    }
});

document.addEventListener('DOMContentLoaded', function () {
    require(['baby-loris-api'], function (Api) {
        var api = new Api('/api/');
        var input = document.getElementById('name');
        var result = document.getElementById('result');

        input.addEventListener('input', function (e) {
            api.exec('hello', {name: e.currentTarget.value})
                .then(function (response) {
                    result.classList.remove('label-danger');
                    result.innerHTML = response;
                })
                .fail(function (error) {
                    result.classList.add('label-danger');
                    result.innerHTML = error.message;
                });
        });

        api.exec('get-kittens').then(function (kittens) {
            document.getElementById('kittens').innerHTML = kittens
                .map(function (kitten) {
                    return '<img class="img-thumbnail" src="%s" title="%s"/>'
                        .replace('%s', kitten.url)
                        .replace('%s', kitten.title);
                })
                .join('');
        });
    });
});
