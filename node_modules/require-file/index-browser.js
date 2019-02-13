/**
 * @module  require-file
 */

function require(url){
	request = new XMLHttpRequest();

	// `false` makes the request synchronous
	request.open('GET', url, false);
	request.send();

	//return successfull url
	if (request.status === 200) {
		return request.responseText || request.response;
	}

	throw Error('\'' + url + '\' status is \'' + request.statusText + '\'');
}


module.exports = require;