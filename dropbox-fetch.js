/**
 * The authorization token with which calls to the API are made.
 * @type {String}
 */
let token = '';

const AUTHORIZE_ENDPOINT = 'https://www.dropbox.com/oauth2/authorize';

const getAuthorizationUrl = (clientId) => {
  return AUTHORIZE_ENDPOINT + '?' +
    'response_type=token' +
    'client_id=' + clientId;
};

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
    reject('Not implemented yet, please obtain a token manually by calling ' +
      getAuthorizationUrl(clientId));
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

/**
 * Upload the given file to the dropbox.
 * @param  {object} file an object describing the file, consisting of:
 *  - {string} name
 *  - {Buffer} content
 *  - {boolean} replace
 * @param  {string} destinationPath the path in the dropbox where the file should
 * be uploaded to
 * @return {function} a promise that resolves when the upload is complete or
 * fails with an error message
 */
const upload = ({ name, content, replace }, destinationPath) => {
  return new Promise((resolve, reject) => {
    reject('Not implemented yet');
  });
};

module.exports = {
  authorize,
  setToken,
  upload
};
