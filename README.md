# dropbox-fetch
Simple Javascript wrapper for the Dropbox HTTP API, using fetch. This is mainly a personal project that is started because dropbox does not provide a Javascript wrapper for their API, and most other projects that I found here on Github that do this are not maintained anymore or otherwise unsuitable for me.

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

Gotta implement a minimum set of operations first.
