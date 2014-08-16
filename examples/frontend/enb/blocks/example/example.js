modules.define('example', ['api'], function (provide, api) {

    /**
     * @param {DOM} parentNode
     */
    function Example(parentNode) {
        this._helloInput = parentNode.querySelector('#name');
        this._helloResult = parentNode.querySelector('#result');
        this._kittensContainer = parentNode.querySelector('#kittens');

        this._helloInput.addEventListener('input', this._onInput.bind(this));
    }

    Example.prototype = {
        constructor: Example,

        _onInput: function (e) {
            api.exec('hello', {name: e.currentTarget.value})
                .then(function (response) {
                    this._helloResult.classList.remove('label-danger');
                    this._helloResult.innerHTML = response;
                }.bind(this))
                .fail(function (error) {
                    this._helloResult.classList.add('label-danger');
                    this._helloResult.innerHTML = error.message;
                }.bind(this));
        },

        showKittens: function () {
            api.exec('get-kittens').then(function (kittens) {
                this._kittensContainer.innerHTML = kittens
                    .map(function (kitten) {
                        return '<img class="img-thumbnail" src="%s" title="%s"/>'
                            .replace('%s', kitten.url)
                            .replace('%s', kitten.title);
                    })
                    .join('');
            }.bind(this));
        }
    };

    provide(Example);
});
