# require-file [![Code Climate](https://codeclimate.com/github/dfcreative/require-file/badges/gpa.svg)](https://codeclimate.com/github/dfcreative/require-file) <a href="UNLICENSE"><img src="http://upload.wikimedia.org/wikipedia/commons/6/62/PD-icon.svg" width="20"/></a>


Require file as a string both in node/browser. Simple wrapper for [rfile](https://www.npmjs.com/package/rfile), but works browser-side via synchronous `XMLHttpRequest`. It might be very useful for tests, when you need to include some big external files as strings.


`$ npm install require-file`

```js
var rfile = require('require-file');
var result;

try {
	result = rfile('./local/path');
}
catch (e) {

}
```

If you need async version, take a look at [browser-request](https://github.com/iriscouch/browser-request).


[![NPM](https://nodei.co/npm/require-file.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/require-file/)