var normalize = require('../../../lib/validators/normalize');
var ApiError = require('../../../lib/api-error');
var should = require('chai').should();

describe('normalize', function () {
    it('should normalize a number', function () {
        normalize('42', 'paramName', {type: 'Number'}).should.be.equal(42);
        normalize('3.14$', 'paramName', {type: 'Number'}).should.be.equal(3.14);
    });

    it('should normalize a string', function () {
        normalize(42, 'paramName', {type: 'String'}).should.be.equal('42');
    });

    it('should allow any register for parameter type', function () {
        normalize('42', 'paramName', {type: 'Number'}).should.be.equal(42);
        normalize('42', 'paramName', {type: 'number'}).should.be.equal(42);
        normalize('42', 'paramName', {type: 'NuMbeR'}).should.be.equal(42);
    });

    it('should throw an error for a invalid number', function () {
        var fn = function () {
            normalize('nan', 'paramName', {type: 'Number'});
        };
        fn.should.throw(ApiError);
    });

    it('should normalize a boolean', function () {
        normalize('false', 'paramName', {type: 'Boolean'}).should.be.equal(false);
        normalize('true', 'paramName', {type: 'Boolean'}).should.be.equal(true);
        normalize('lorem ipsum', 'paramName', {type: 'Boolean'}).should.be.equal(true);
    });

    it('should normalize value to array', function () {
        normalize('42', 'paramName', {type: 'Array'}).should.be.deep.equal([42]);
    });

    it('should return value as is if type is skipped', function () {
        normalize(42, 'paramName').should.be.equal(42);
        normalize([42], 'paramName').should.be.deep.equal([42]);
        normalize({a: 42}, 'paramName').should.be.deep.equal({a: 42});
    });

    describe('when object or array are passed as a string', function () {
        it('should parse JSON', function () {
            var obj = {a: 42};
            normalize(JSON.stringify(obj), 'paramName', {type: 'object'}).should.be.deep.equal(obj);

            var arr = [{geoObject: {name: 'Moscow', accuracy: 0.07}}];
            normalize(JSON.stringify(arr), 'paramName', {type: 'array'}).should.be.deep.equal(arr);
        });

        it('should throw an error for bad JSON', function () {
            var fn = function () {
                normalize('{a:42}', 'paramName', {type: 'object'});
            };
            fn.should.throw(ApiError);
        });
    });
});
