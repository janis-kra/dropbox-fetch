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
  const method = 'files/upload';
  const apiArgs = {
    path: '/tape-test/upload.txt',
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
  t.plan(9);

  const path = '/tape-test/upload.txt';
  const apiArgs = {
    path: path,
    mode: 'add',
    autorename: true,
    mute: false
  };
  const content = 'loremipsum1234!';
  const validToken = config.token;
  const invalidToken = 1;

  box.upload(apiArgs, content, validToken).then((result) => {
    t.equal(result.status, 200, 'uploading a valid file should return http status 200');
  }).catch(() => {
    t.fail('uploading a valid file should not fail ' +
      '(make sure that the given path is writable in your dropbox and ' +
      'that the token parameter is correct)');
  });
  box.upload({ path }, content, validToken).then((result) => {
    t.equal(result.status, 200, 'calling upload without the optional params ' +
      'should return status 200');
  }).catch(() => {
    t.fail('calling upload without the optional params should not fail ');
  });

  // test with 5 invalid file objects:
  const invalidApiArgs = [
    true, // invalid type boolean
    {}, // invalid empty object
    { path: true, mode: 'add', autorename: true, mute: false }, // invalid path
    { path: '/tape-test/upload.txt', mode: true, autorename: true, mute: false }, // invalid mode
    { path: '/tape-test/upload.txt', mode: 'add', autorename: 1, mute: false }, // invalid autorename
    { path: '/tape-test/upload.txt', mode: 'add', autorename: true, mute: 1 } // invalid mute
  ];
  invalidApiArgs.forEach((apiArgs) => {
    t.throws(box.upload.bind(this, apiArgs, content, validToken), null,
      'uploading an invalid file to a valid path should fail');
  });

  t.throws(box.upload.bind(this, apiArgs, content, invalidToken),
    'uploading with an invalid token type should fail');
});

test('fetch', (t) => {
  t.plan(1);

  fetch('http://httpbin.org/post', { method: 'POST', body: 'a=1' })
    .then(function (res) {
      return res.json();
    }).then(function (json) {
      t.ok(json, 'fetch post should return a json response');
    });
});
