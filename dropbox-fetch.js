/**
 * The authorization token with which calls to the API are made.
 * @type {String}
 */
let token = '';

/**
 * Authorize via OAuth 2.0 for Dropbox API calls.
 *
 * @parameter {string} clientId your app's key
 * @parameter {string} redirectUri the uri where the user should be redirected
 * to, after authorization has completed
 * @return {function} a promise that resolves or fails both with the returned
 * HTTP status code
 */
const authorize = (clientId, redirectUri = '') => {
  return new Promise((resolve, reject) => {
    reject('not implemented yet');
  });
};

/**
 * Set the token that is used for all Dropbox API calls to the given value.
 * @param  {string} t The new token value.
 */
const setToken = (t) => {
  if (typeof t !== 'string') {
    throw new Error('invalid argument ' + t + ' (expected: string)');
  }
  token = t;
};

module.exports = {
  authorize,
  setToken
};
