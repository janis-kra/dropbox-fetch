'use strict';
const assert = require('assert-plus');
const fetch = require('node-fetch');

/**
 * The authorization token with which calls to the API are made.
 * @type {String}
 */
let _token = '';

const API_VERSION = '2/';

const AUTHORIZE_ENDPOINT = 'https://www.dropbox.com/oauth2/authorize';
const CONTENT_ENDPOINT = 'https://content.dropboxapi.com/';

/**
 * Regex for testing the format of an apiMethod.
 * @type {RegExp}
 */
const apiMethodRegex = /^([a-z_2]+\/)*[a-z_2]+$/;

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
    reject('Not implemented yet, please obtain a token manually and store it via setToken');
  });
};

/**
 * Set the token that is used for all Dropbox API calls to the given value.
 * If you set this value, you can omit the `token` parameter in all the calls
 * to this library.
 * @param  {string} t The new token value.
 */
const setToken = (token) => {
  if (typeof token !== 'string') {
    throw new Error('invalid argument ' + token + ' (expected: string)');
  }
  _token = token;
};

/**
* Generic function for loading content from the Dropbox given an endpoint-method
* combination. If no wrapper function for the method you need exists, feel free
 * to use this for your GET calls to the Dropbox API.
 *
 * See https://www.dropbox.com/developers/documentation/http/documentation for
 * the documentation of the Dropbox HTTP API.
 *
 * @param  {string} apiMethod the method to call
 * @param  {object} apiArgs an object that is passed as the Dropbox-API-Arg header
 * @param  {string?} endpoint the URL endpoint to use; defaults to
 * https://content.dropboxapi.com as this is used for all file operations,
 * which are most frequently used when operating on a dropbox
 * @param  {string?} token your Dropbox API token
 * (defaults to the value set via setToken`)
 * @return {function} a promise that, depending on if your call was successfull,
 * either resolves or rejects with the answer from the Dropbox HTTP Api. You
 * probably want to access some data that is returned by the call; this can be
 * achieved by calling `text()` on the result returned by the promise.
 */
const get = (
  apiMethod,
  apiArgs,
  content,
  endpoint = CONTENT_ENDPOINT,
  token = _token
) => {
  return new Promise((resolve, reject) => {
    reject('Not implemented yet');
  });
};

/**
 * Generic function for posting some content to a given endpoint using a certain
 * API method. If no wrapper function for the method you need exists, feel free
 * to use this for your POST calls to the Dropbox API.
 *
 * See https://www.dropbox.com/developers/documentation/http/documentation for
 * the documentation of the Dropbox HTTP API.
 *
 * @param  {string} apiMethod the method to call
 * @param  {object} apiArgs an object that is passed as the Dropbox-API-Arg header
 * @param  {any} content the content to upload
 * @param  {string=} endpoint the URL endpoint to use; defaults to
 * https://content.dropboxapi.com as this is used for all file operations,
 * which are most frequently used when operating on a dropbox
 * @param  {string=} token your Dropbox API token
 * (defaults to the value set via setToken`)
 * @return {function} a promise that, depending on if your call was successfull,
 * either resolves or rejects with the answer from the Dropbox HTTP Api
 */
const post = (
  apiMethod,
  apiArgs,
  content,
  endpoint = CONTENT_ENDPOINT,
  token = _token
) => {
  assert.string(apiMethod, 'invalid argument ' + apiMethod + ' (expected: string)');
  assert.ok(apiMethodRegex.test(apiMethod), 'apiMethod has an unexpected format: ' + apiMethod);
  assert.object(apiArgs, 'invalid argument ' + apiArgs + ' (expected: object)');
  // no assertion for content - can be anything
  assert.string(endpoint, 'invalid argument ' + endpoint + ' (expected: string)');
  assert.string(token, 'invalid argument ' + token + ' (expected: string)');

  return fetch(endpoint + API_VERSION + apiMethod, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Authorization': 'Bearer ' + token,
      'Dropbox-API-Arg': JSON.stringify(apiArgs)
    },
    body: content
  });
};

/**
 * Upload the given file to the dropbox.
 * @param  {object} file an object describing the file, consisting of:
 *  - {string} path the path in the dropbox where the file should
 * be uploaded to, with a leading slash. Use forward slashes.
 *  - {string} mode what to do when the file already exists ('add', 'overwrite' or 'update')
 *  - {boolean} autorename
 *  - {boolean} mute
 * @param  {string} content the content  that should be written to the file
 * described in the apiArgs parameter
 * @param  {string=} token the OAuth 2 token that is used to access your app;
 * can be omitted (in this case, the token that is set via `setToken` is used)
 * @return {function} a promise that resolves when the upload is complete or
 * fails with an error message
 */
const upload = (
  {
    path,
    mode = 'add',
    autorename = true,
    mute = false
  },
  content,
  token = _token
) => {
  assert.string(path);
  assert.string(mode);
  assert.bool(autorename);
  assert.bool(mute);

  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  return post(
    'files/upload',
    { path, mode, autorename, mute },
    content,
    CONTENT_ENDPOINT,
    token
  );
};

/**
 * Download the file specified by a path from the user's Dropbox.
 * @param {string} path the path of the file to download
 * @param {string=} token the OAuth 2 token that is used to access your app;
 * can be omitted (in this case, the token that is set via `setToken` is used)
 * @return {function} a promise that resolves when the upload is complete or
 * fails with an error message
 */
const download = (path, token = _token) => {
  assert.string(path, 'invalid argument ' + path + ' (expected: string)');
  assert.string(token, 'invalid argument ' + token + ' (expected: string)');

  return fetch(CONTENT_ENDPOINT + API_VERSION + 'files/download', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Dropbox-API-Arg': JSON.stringify({ path })
    }
  });
};

module.exports = {
  AUTHORIZE_ENDPOINT,
  CONTENT_ENDPOINT,
  authorize,
  download,
  get,
  post,
  setToken,
  upload
};
