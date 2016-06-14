const test = require('tape');
const box = require('../dropbox-fetch');
const fetch = require('node-fetch');
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

// authorize currently not used --> skip test
test('authorize', { skip: true }, (t) => {
  t.plan(6);

  box.authorize().then((result) => {
    t.fail('Authorization without a clientId should fail');
  }).catch(() => {
    t.pass('Authorization without a clientId failed correctly');
  });

  t.equal(typeof config, 'object', 'config.js must exist and be a function ' +
    '(module) for the test to pass');
  t.equal(typeof config.clientId, 'string', 'config.clientId must exist ' +
    'and be a string for the test to pass');

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

  t.doesNotThrow(box.setToken.bind(this, ''), null,
    'setting the token to the empty string should not fail');

  t.doesNotThrow(box.setToken.bind(this, 'loremipsum1234!'), null,
    'setting the token to an arbitrary string should not fail');

  // 4 runs with invalid arguments
  [true, {}, [], 1].forEach((token) => {
    t.throws(box.setToken.bind(this, token), null,
      `setting the token to invalid argument ${token} should fail`);
  });
});

test('post:fail', (t) => {
  t.plan(5);
  t.throws(box.post, null, 'calling post without any arguments should throw an Error');

  const failPost = (method, apiArgs, content, endpoint, token) => {
    box.post(method, apiArgs, content, endpoint, token).then((result) => {
      t.ok((result.status === 400) || (result.status === 404), 'if post is called with an invalid but correctly typed argument and resolves, result.status should be 400 or 404');
    }).catch(() => {
      t.pass('calling post with an invalid argument failed as expected');
    });
  };

  const method = '/files/upload';
  const apiArgs = {
    path: 'file.txt',
    mode: 'add',
    autorename: true,
    mute: false
  };
  const content = 'loremipsum1234';
  const token = config.token;
  const endpoint = box.CONTENT_UPLOAD_ENDPOINT;

  failPost('unknownMethod', apiArgs, content, endpoint, token);
  failPost(method, {}, content, endpoint, token);
  // test for invalid content intentionally left out
  failPost(method, apiArgs, content, endpoint, 'invalidToken');
  failPost(method, apiArgs, content, 'unknownEndpoint', token);
});

test('post:upload', (t) => {
  t.plan(1);
  const method = '/files/upload';
  const apiArgs = {
    path: 'file.txt',
    mode: 'add',
    autorename: true,
    mute: false
  };
  const content = 'loremipsum1234';
  const token = config.token;
  const endpoint = box.CONTENT_UPLOAD_ENDPOINT;

  box.post(method, apiArgs, content, endpoint, token).then((result) => {
    t.equal(result.status, 200, 'uploading a valid file via `post` should return http status 200');
  }).catch(() => {
    t.fail('uploading a valid file via `post` should not fail');
  });
});

test('upload', (t) => {
  t.plan(8);

  // prepare the test file
  const file = {
    name: 'upload.txt',
    content: 'loremipsum1234',
    mode: 'add'
  };
  const validPath = '/tape-test';
  const invalidPath = true;
  const validToken = config.token;
  const invalidToken = 1;

  box.upload(file, validPath, validToken).then((result) => {
    t.equal(result.status, 200, 'uploading a valid file should return http status 200');
  }).catch(() => {
    t.fail('uploading a valid file should not fail ' +
      '(make sure that path "validTestPath" is writable in your dropbox and "validToken" is correct)');
  });

  t.throws(box.upload.bind(this, file, invalidPath, validToken),
    'uploading a valid file to an invalid path should fail ');

  // test with 5 invalid file objects:
  const invalidFiles = [
    true, // invalid type boolean
    {}, // invalid empty object
    { name: true, content: 'loremipsum1234', mode: 'add' }, // invalid name
    { name: 'upload', content: true, mode: 'add' }, // invalid content
    { name: 'upload', content: 'loremipsum1234', mode: 1 } // invalid mode
  ];
  invalidFiles.forEach((f) => {
    t.throws(box.upload.bind(this, f, validPath, validToken), null, 'uploading an invalid file to a valid path should fail');
  });

  t.throws(box.upload.bind(this, file, validPath, invalidToken), 'uploading with an invalid token type should fail');
});

test('fetch', (t) => {
  t.plan(1);

  fetch('http://httpbin.org/post', { method: 'POST', body: 'a=1' })
    .then(function (res) {
      return res.json();
    }).then(function (json) {
      t.pass(json);
    });
});
