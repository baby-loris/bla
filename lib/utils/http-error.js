/**
 * HTTP error.
 *
 * @param {Number} status HTTP status.
 * @param {String} message
 */
function HttpError(status, message) {
    this.name = 'HttpError';
    this.message = message;
    this.status = status;
}
HttpError.prototype = Error.prototype;

module.exports = HttpError;
