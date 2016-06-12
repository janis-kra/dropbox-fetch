const fetch = require('node-fetch');

/**
 * The authorization token with which calls to the API are made.
 * @type {String}
 */
let _token = '';

const API_VERSION = '2/';

const AUTHORIZE_ENDPOINT = 'https://www.dropbox.com/oauth2/authorize';
const CONTENT_UPLOAD_ENDPOINT = 'https://content.dropboxapi.com/';

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
const setToken = (token) => {
  if (typeof token !== 'string') {
    throw new Error('invalid argument ' + token + ' (expected: string)');
  }
  _token = token;
};

/**
 * Upload the given file to the dropbox.
 * @param  {object} file an object describing the file, consisting of:
 *  - {string} name
 *  - {string} content
 *  - {string} mode
 * @param  {string} destinationPath the path in the dropbox where the file should
 * be uploaded to
 * @param  {string?} token the OAuth 2 token that is used to access your app;
 * can be omitted (in this case, the token that is set via ``setToken` is used)
 * @return {function} a promise that resolves when the upload is complete or
 * fails with an error message
 */
const upload = ({ name, content, mode }, destinationPath, token = _token) => {
  if (typeof name !== 'string') {
    throw new Error('invalid argument ' + name + ' (expected: string)');
  }
  if (typeof content !== 'string') {
    throw new Error('invalid argument ' + content + ' (expected: string)');
  }
  if (typeof mode !== 'string') {
    throw new Error('invalid argument ' + mode + ' (expected: string)');
  }
  if (typeof destinationPath !== 'string') {
    throw new Error('invalid argument ' + destinationPath + ' (expected: string)');
  }
  if (typeof token !== 'string') {
    throw new Error('invalid argument ' + token + ' (expected: string)');
  }

  const path = destinationPath + '/' + name;
  return fetch(CONTENT_UPLOAD_ENDPOINT + API_VERSION + '/files/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Authorization': 'Bearer ' + token,
      'Dropbox-API-Arg': JSON.stringify({
        'path': path,
        'mode': mode,
        'autorename': true,
        'mute': false
      })
    },
    body: content
  });
};

module.exports = {
  authorize,
  setToken,
  upload
};
