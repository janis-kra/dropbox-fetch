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

  t.doesNotThrow(box.setToken.bind(this, ''),
    'setting the token to the empty string should not fail');

  t.doesNotThrow(box.setToken.bind(this, 'loremipsum1234!'),
    'setting the token to an arbitrary string should not fail');

  // 4 runs with invalid arguments
  [true, {}, [], 1].forEach((token) => {
    t.throws(box.setToken.bind(this, token),
      `setting the token to invalid argument ${token} should fail`);
  });
});
