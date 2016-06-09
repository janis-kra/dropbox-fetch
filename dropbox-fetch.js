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

module.exports = {
  authorize
};
