/*global $:true */

modules.define('jquery', function (provide) {
    provide($);
});

modules.define('domready', ['jquery'], function (provide, $) {
    $(provide);
});

modules.require(['baby-loris-api', 'domready'], function (Api) {
    var api = new Api('/api/');
    $('#name').on('input', function (e) {
        api.exec('hello', {name: e.currentTarget.value})
            .then(function (response) {
                $('#result')
                    .attr('class', 'label label-success')
                    .html(response);
            })
            .fail(function (error) {
                $('#result')
                    .attr('class', 'label label-danger')
                    .html(error.message);
            });
    });

    api.exec('get-kittens').then(function (kittens) {
        kittens.forEach(function (kitten) {
            $('<img/>')
                .addClass('img-thumbnail')
                .attr('src', kitten.url)
                .attr('title', kitten.title)
                .appendTo($('#kittens'));
        });
    });
});
