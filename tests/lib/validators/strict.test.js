var strict = require('../../../lib/validators/strict');
var ApiError = require('../../../lib/api-error');
var should = require('chai').should();

var strictFn = function (type) {
    return function (value) {
        return function () {
            return strict(value, {type: type});
        }
    }
};

describe('strict validator', function () {
    it('should allow numbers only', function () {
        var strictNumberFn = strictFn('number');

        strictNumberFn('42').should.throw(ApiError);
        strictNumberFn('foobar').should.throw(ApiError);
        strictNumberFn([4, 2]).should.throw(ApiError);
        strictNumberFn({4: 2}).should.throw(ApiError);
        strictNumberFn(true).should.throw(ApiError);
        strictNumberFn(null).should.throw(ApiError);

        strictNumberFn(42)().should.be.equal(42);
    });

    it('should allow strings only', function () {
        var strictStringFn = strictFn('string');

        strictStringFn(42).should.throw(ApiError);
        strictStringFn([4, 2]).should.throw(ApiError);
        strictStringFn({4: 2}).should.throw(ApiError);
        strictStringFn(true).should.throw(ApiError);
        strictStringFn(null).should.throw(ApiError);

        strictStringFn('42')().should.be.equal('42');
    });

    it('should allow boolean values only', function () {
        var strictBooleanFn = strictFn('boolean');

        strictBooleanFn('false').should.throw(ApiError);
        strictBooleanFn('foobar').should.throw(ApiError);
        strictBooleanFn([4, 2]).should.throw(ApiError);
        strictBooleanFn({4: 2}).should.throw(ApiError);
        strictBooleanFn(null).should.throw(ApiError);

        strictBooleanFn(true)().should.be.equal(true);
        strictBooleanFn(false)().should.be.equal(false);
    });

    it('should allow arrays only', function () {
        var strictArrayFn = strictFn('array');

        strictArrayFn(42).should.throw(ApiError);
        strictArrayFn('foobar').should.throw(ApiError);
        strictArrayFn('[4, 2]').should.throw(ApiError);
        strictArrayFn({4: 2}).should.throw(ApiError);
        strictArrayFn(true).should.throw(ApiError);
        strictArrayFn(null).should.throw(ApiError);

        var arr = [4, 2];
        strictArrayFn(arr)().should.be.equal(arr);
    });

    it('should allow objects only', function () {
        var strictObjectFn = strictFn('object');

        strictObjectFn(42).should.throw(ApiError);
        strictObjectFn('foobar').should.throw(ApiError);
        strictObjectFn('{4: 2}').should.throw(ApiError);
        strictObjectFn([4, 2]).should.throw(ApiError);
        strictObjectFn(true).should.throw(ApiError);

        var obj = {foo: 'bar'};
        strictObjectFn(obj)().should.be.equal(obj);
        should.equal(strictObjectFn(null)(), null);
    });

    it('should return value as is if type is skipped', function () {
        strict(42).should.be.equal(42);
        strict('42').should.be.equal('42');
        strict([42]).should.be.deep.equal([42]);
        strict({a: 42}).should.be.deep.equal({a: 42});
    });
});
