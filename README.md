# dropbox-fetch
[![Build Status](https://travis-ci.org/janis-kra/dropbox-fetch.svg?branch=master)](https://travis-ci.org/janis-kra/dropbox-fetch)

Simple Javascript wrapper for the Dropbox HTTP API, using fetch. This is mainly a personal project that I started because Dropbox does not provide a Javascript wrapper for their API, and most other projects that I found here on Github that do this are no longer maintained anymore or otherwise unsuitable for me.

These functions that implement the Dropbox HTTP API all are pure functions (except for the network request that is being sent, of course). They return a promise which resolves with the complete result that the API returns.

There is a convenience function `setToken` that allows you to set your token once and omit this in your subsequent function calls.

## Requirements

You'll obviously need a Dropbox user account in order create a Dropbox app on their [*apps*](https://www.dropbox.com/developers/apps) page.
While this application is in development (version < `1.x`), you'll need node.js version `6` to run it because I use some fancy ES6 features.
I will probably support the LTS version of node.js sometime in the future.

## Examples

### upload

``` js
const box = require('dropbox-fetch');

const apiArgs = {
  path: '/foo/bar.txt' // this is were your file will be stored in your dropbox
  // optional parameters are omitted (see JSDoc of the upload function)
};
/* 
 * Now read the file content - you could also pass just the content as a string
 * to the upload function (if you wish to create a textfile), but I recommend
 * using a ReadStream, because it also works with images etc.
 */
const content = fs.createReadStream('foo.txt');
const token = config.token; // your personal access token

// upload the file to your dropbox
box.upload(apiArgs, content, token).then((result) => {
  // do whatever you want with the response
  console.log(result.status); // 200 (hopefully)
  // result.status could also be 400 or 500, these also result in a resolved promise
}).catch((result) => {
  console.err('something went wrong'); 
});
```

### download

``` js
const path = '/foo/bar.txt'; // whatever file you wish to download
const token = config.token; // your personal access token

box.download(path, token).then((result) => {
  return result.text(); // promise that resolves with the file's content as a string
}).then((fileContent) => {
  // do whatever you want with the file's contents, e.g. write to a file or just log
  console.log(fileContent);
});
```

### getMetadata

``` js

const validPath = '/tape-test/' + filename; // not neccessarily existing
const token = config.token; // your personal access token

box.getMetadata(validPath, true, true, true, token).then((result) => {
  if (result.status === 200) {
    // obtain the files metadata via result.json() (returns a promise)
    console.log('success');
  }
});
```

## Features / Upcoming

Features:

- `upload`
- `download`
- `getMetadata`

Upcoming:

- `authorize`
- `listFiles`


## Contributing

You're welcome to contribute a feature to this repository. If you do, please make sure that it passes the linter (run `npm run lint`) and add a short unit test to *test/dropbox-fetch.js* (which should, obviously, pass - run the tests using `npm run test`).
