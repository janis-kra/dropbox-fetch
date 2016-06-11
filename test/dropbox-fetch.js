const test = require('tape');
const box = require('../dropbox-fetch');
const config = (() => {
  // IIFE for catching Module-not-found error when config.js does not exist
  let c;
  try {
    c = require('./config');
  } catch (_) {
     // set config = false s.t. the corresponding test fails instead of throwing an Error
    c = false;
  }
  return c;
})();

test.onFinish(() => {
});

test('authorize', (t) => {
  t.plan(6);

  box.authorize().then((result) => {
    t.fail('Authorization without a clientId should fail');
  }).catch(() => {
    t.pass('Authorization without a clientId failed correctly');
  });

  t.equal(typeof config, 'object', 'config.js must exist and be a function (module) for the test to pass');
  t.equal(typeof config.clientId, 'string', 'config.clientId must exist and be a string for the test to pass');

  const clientId = config.clientId;

  box.authorize(clientId).then((status) => {
    t.equal(status, 200, 'authorizing with a valid clientId should return status code 200');
  }).catch(() => {
    t.fail('authorizing with a valid clientId should not fail');
  });

  box.authorize(clientId, 'invalid url').then(() => {
    t.fail('authorizing with an invalid url should lead to a rejected promise');
  }).catch(() => {
    t.pass('invalid url detected correctly');
  });

  box.authorize(clientId, 'http://localhost').then((status) => {
    t.equal(status, 200, 'valid url detected correctly');
  }).catch(() => {
    t.fail('authorizing with a valid url should NOT lead to a rejected promise');
  });
});

test('setToken', (t) => {
  t.plan(6);

  try {
    box.setToken('');
    t.pass('token successfully set to the empty string');
  } catch (e) {
    t.fail('setting the token to the empty string should not fail - ' + e);
  }

  try {
    box.setToken('loremipsum1234!');
    t.pass('token successfully set to an arbitrary string');
  } catch (e) {
    t.fail('setting the token to an arbitrary string should not fail - ' + e);
  }

  // 4 runs with invalid arguments
  [true, {}, [], 1].forEach((token) => {
    try {
      box.setToken(token);
      t.fail(`setting the token to invalid argument ${token} should fail`);
    } catch (e) {
      t.pass(`setting the token to invalid argument ${token} failed as expected`);
    }
  });
});
