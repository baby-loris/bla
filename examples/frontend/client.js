modules.define('jquery', function (provide) {
    provide($);
});

modules.define('domready', ['jquery'], function (provide, $) {
    $(provide);
});

modules.require(['api', 'domready'], function (Api) {
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
});
