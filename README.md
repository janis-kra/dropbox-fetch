# dropbox-fetch
Simple Javascript wrapper for the Dropbox HTTP API, using fetch. This is mainly a personal project that I started because Dropbox does not provide a Javascript wrapper for their API, and most other projects that I found here on Github that do this are no longer maintained anymore or otherwise unsuitable for me.

These functions that implement the Dropbox HTTP API all are pure functions (except for the network request that is being sent, of course). They return a promise which resolves with the complete result that the API returns.

There is a convenience function `setToken` that allows you to set your token once and omit this in your subsequent function calls.

## Examples

### upload

``` js
const box = require('dropbox-fetch');

const apiArgs = {
  path: '/foo/bar.txt' // this is were your file will be stored in your dropbox
  // optional parameters are omitted (see JSDoc of the upload function)
};
const content = 'loremipsum1234!';
const token = config.token; // your personal access token

// upload the file to your dropbox
box.upload(apiArgs, content, token).then((result) => {
  // do whatever you want with the response
  console.log(result.status); // 200
}).catch((result) => {
  console.log(result.status); // 400 or something similar
});
```

## Features / Upcoming

Features:

- `upload`

Upcoming:

- `authorize`
- `download`
- `listFiles`


## Contributing

You're welcome to contribute a feature to this repository. If you do, please make sure that it passes the linter (run `npm run lint`) and add a short unit test to *test/dropbox-fetch.js* (which should, obviously, pass - run the tests using `npm run test`).
