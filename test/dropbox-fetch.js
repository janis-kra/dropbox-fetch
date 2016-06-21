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

// set an attribute to true in order to skip that particular test
const skip = {
  authorize: true,
  setToken: true,
  post: true,
  upload: true,
  download: true,
  get: true,
  getMetadata: false,
  fetch: true,
  examples: true
};

// authorize currently not used --> skip test
test('authorize', { skip: skip.authorize }, (t) => {
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

test('setToken', { skip: skip.setToken }, (t) => {
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

test('post:reject', { skip: skip.post }, (t) => {
  t.plan(5);
  t.throws(box.post, null, 'calling post without any arguments should throw an Error');

  const failPost = (method, apiArgs, content, endpoint, token) => {
    box.post(method, apiArgs, content, endpoint, token).then((result) => {
      t.ok((result.status === 400) || (result.status === 404), 'if post is called with an invalid but correctly typed argument and resolves, result.status should be 400 or 404');
    }).catch(() => {
      t.pass('calling post with an invalid argument failed as expected');
    });
  };

  const method = 'files/upload';
  const apiArgs = {
    path: 'file.txt',
    mode: 'add',
    autorename: true,
    mute: false
  };
  const content = 'loremipsum1234';
  const token = config.token;
  const endpoint = box.CONTENT_UPLOAD_ENDPOINT;

  failPost('unknownmethod', apiArgs, content, endpoint, token);
  failPost(method, {}, content, endpoint, token);
  // test for invalid content intentionally left out
  failPost(method, apiArgs, content, endpoint, 'invalidToken');
  failPost(method, apiArgs, content, 'unknownEndpoint', token);
});

test('post:upload', { skip: skip.post }, (t) => {
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

test('post:invalidApiMethod', { skip: skip.post }, (t) => {
  t.plan(5);
  const apiArgs = {};
  const content = 'loremipsum1234';
  const token = config.token;
  const endpoint = box.CONTENT_UPLOAD_ENDPOINT;

  const invalidApiMethods = ['-', '/', '/foo', 'foo//bar', 'foo/'];

  invalidApiMethods.forEach((apiMethod) => {
    t.throws(box.post.bind(this, apiMethod, apiArgs, content, endpoint, token),
      null, 'calling post with an invalid apiMethod parameter should throw an error');
  });
});

test('upload', { skip: skip.upload }, (t) => {
  t.plan(10);

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

  // valid params:
  box.upload(apiArgs, content, validToken).then((result) => {
    t.equal(result.status, 200, 'uploading a valid file should return http status 200');
  }).catch(() => {
    t.fail('uploading a valid file should not fail ' +
      '(make sure that the given path is writable in your dropbox and ' +
      'that the token parameter is correct)');
  });
  // omit all optional params:
  box.upload({ path }, content, validToken).then((result) => {
    t.equal(result.status, 200, 'calling upload without the optional params ' +
      'should return status 200');
  }).catch(() => {
    t.fail('calling upload without the optional params should not fail ');
  });
  // missing leading slash in the destination path:
  apiArgs.path = 'foo/bar';
  box.upload(apiArgs, content, validToken).then((result) => {
    t.equal(result.status, 200, 'leading slash for the path should be inserted ' +
      'automatically (expect http status 200)');
  }).catch(() => {
    t.fail('calling upload without the leading slash in the dest path should not fail');
  });
  apiArgs.path = path;

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

test('download:fail', { skip: skip.download }, (t) => {
  t.plan(3);

  t.throws(box.download, null,
    'attempting a download without specifying a path should result in an Error');

  t.throws(box.upload.bind(this, true), null, 'attempting a download with a ' +
    'boolean value as the path should result in an Error');

  t.throws(box.upload.bind(this, 1), null, 'attempting a download with a ' +
    'number value as the path should result in an Error');
});

test('download:success', { skip: skip.download }, (t) => {
  t.plan(2);

  const path = '/tape-test/upload.txt';
  const apiArgs = {
    path: path,
    mode: 'add',
    autorename: true,
    mute: false
  };
  const content = 'loremipsum1234!';
  const token = config.token;

  box.upload(apiArgs, content, token).then((result) => {
    if (result.status === 200) {
      box.download(path, token).then((result) => {
        const fileContentAsPromise = result.text();
        t.ok(fileContentAsPromise instanceof Promise,
          'result.text() should return a promise');
        return fileContentAsPromise;
      }).then((fileContent) => {
        t.equal(fileContent, content, 'the content of the downloaded file ' +
          'should match the content of the uploaded file');
      });
    }
  });
});

test('get:download', { skip: skip.get }, (t) => {
  // reproduce the download function
  t.plan(1);
  const method = 'files/download';
  const apiArgs = {
    path: '/abcd/efgh/ijkl/mnop/qrst/uvwx/y.z' // this file is expected not to exist!
  };
  const token = config.token;
  const endpoint = box.CONTENT_UPLOAD_ENDPOINT;

  box.get(method, apiArgs, endpoint, token).then((result) => {
    t.equal(result.status, 200, 'downloading using `get` should return http status 200');
  }).catch(() => {
    t.fail('downloading any file (existing or not) via `get` should not ' +
      'result in a rejected promise');
  });
});

test('get:invalidApiMethod', { skip: skip.get }, (t) => {
  t.plan(5);
  const apiArgs = {};
  const token = config.token;
  const endpoint = box.CONTENT_UPLOAD_ENDPOINT;

  const invalidApiMethods = ['-', '/', '/foo', 'foo//bar', 'foo/'];

  invalidApiMethods.forEach((apiMethod) => {
    t.throws(box.get.bind(this, apiMethod, apiArgs, endpoint, token),
      null, 'calling get with an invalid apiMethod parameter should throw an error');
  });
});

test('getMetadata:fail', { skip: skip.getMetadata }, (t) => {
  /*

  {
   ".tag": "file",
   "name": "Prime_Numbers.txt",
   "id": "id:a4ayc_80_OEAAAAAAAAAXw",
   "client_modified": "2015-05-12T15:50:38Z",
   "server_modified": "2015-05-12T15:50:38Z",
   "rev": "a1c10ce0dd78",
   "size": 7212,
   "path_lower": "/homework/math/prime_numbers.txt",
   "path_display": "/Homework/math/Prime_Numbers.txt",
   "sharing_info": {
     "read_only": true,
     "parent_shared_folder_id": "84528192421",
     "modified_by": "dbid:AAH4f99T0taONIb-OurWxbNQ6ywGRopQngc"
   },
   "has_explicit_shared_members": false
  }
   */
  // call the getMetadata function with invalid args
  t.plan(5);
  const validPath = '/tape-test/getMetadata:fail'; // not neccessarily existing
  const invalidPath = 1;

  t.throws(box.getMetadata, null,
      'calling getMetadata without arguments should fail');

  t.throws(box.getMetadata.bind(this, invalidPath), null,
      'calling getMetadata with an invalid type for the path should fail');

  t.throws(box.getMetadata.bind(this, validPath, 1), null,
      'calling getMetadata with an invalid type for includeMediaInfo should fail');
  t.throws(box.getMetadata.bind(this, validPath, true, 1), null,
      'calling getMetadata with an invalid type for includeDeleted should fail');
  t.throws(box.getMetadata.bind(this, validPath, true, true, 1), null,
      'calling getMetadata with an invalid type for includeHasExplicitSharedMembers should fail');
});

test('getMetadata:success', { skip: skip.getMetadata }, (t) => {
  t.plan(1);

  const validPath = '/tape-test/getMetadata:success'; // not neccessarily existing

  box.getMetadata(validPath, true, true, true)
    .then((result) => result.json())
    .then((json) => {
      const data = JSON.parse(json);
      t.ok(data.error_summary === 'path/not_found/...' ||
          data.name === 'getMetadata:success',
        'depending on whether the file exists in the testing dropbox, ' +
        'getMetadata should either return a path-not-found error or the metadata' +
        'of the specified file');
    }).catch(() => {
      t.fail('getMetadata should not fail when called with valid arguments');
    });
});

test('fetch', { skip: skip.fetch }, (t) => {
  t.plan(1);

  fetch('http://httpbin.org/post', { method: 'POST', body: 'a=1' })
    .then(function (res) {
      return res.json();
    }).then(function (json) {
      t.ok(json, 'fetch post should return a json response');
    });
});

test('examples:upload', { skip: skip.examples }, (t) => {
  t.plan(1);
  // test the examples that are published in the README.md
  const apiArgs = {
    path: '/foo/bar.txt' // this is were your file will be stored in your dropbox
    // optional parameters are omitted (see JSDoc of the upload function)
  };
  const content = 'loremipsum1234!';
  const token = config.token; // your personal access token

  // upload the file to your dropbox
  box.upload(apiArgs, content, token).then((result) => {
    // do whatever you want with the response
    t.equal(result.status, 200, 'uploading a valid file should return http status 200');
  }).catch(() => {
    t.fail('uploading a valid file should not fail');
  });
});
