var ApiError = require('../../../lib/api-error');
var responseFormatter = require('../../../lib/utils/response-formatter');

require('chai').should();

describe('response-formatter', function () {

    it('should format data', function () {
        var data = {a: 1, b: 2};
        responseFormatter.formatResponse(data).should.deep.equal({
            data: data
        });
    });

    it('should format error', function () {
        var error = new ApiError('MY_ERROR', 'Bad times');
        responseFormatter.formatError(error).should.deep.equal({
            error: {
                type: 'MY_ERROR',
                message: 'Bad times'
            }
        });
    });

    it('should format error with custom toJson method', function () {
        var error = {
            toJson: function () {
                return 'Bad times'
            }
        };
        responseFormatter.formatError(error).should.deep.equal({
            error: 'Bad times'
        });
    });

    it('should format an common error', function () {
        var error = new Error('Bad times');
        responseFormatter.formatError(error).should.deep.equal({
            error: {
                type: ApiError.INTERNAL_ERROR,
                message: 'Bad times'
            }
        });
    });
});
