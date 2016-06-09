const test = require('tape');
const box = require('../dropbox-fetch');
const config = require('./config');

test.onFinish(() => {
});

test('authorize', (t) => {
  t.plan(6);

  box.authorize().then((result) => {
    t.fail('Authorization without a clientId should fail');
  }).catch(() => {
    t.pass('Authorization without a clientId failed correctly');
  });

  t.equal(typeof config, 'object', 'config.js must exist and be a function for the test to pass');
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
