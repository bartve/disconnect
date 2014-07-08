## About

`disconnect` is a [Node.js](http://www.nodejs.org) client library that connects with the [Discogs.com API v2.0](http://www.discogs.com/developers/).

[![Dependency Status](https://david-dm.org/bartve/disconnect.png)](https://david-dm.org/bartve/disconnect)

## Features

  * Covers all API endpoints
  * Supports [pagination](http://www.discogs.com/developers/accessing.html#pagination), [rate limiting](http://www.discogs.com/developers/accessing.html#rate-limiting), etc.
  * All functions implement a standard `function(err, data, rateLimit)` format for the callback
  * Includes OAuth 1.0a tools. Just plug in your consumer key and secret and do the OAuth dance
  * API functions grouped in their own namespace for easy access and isolation
  
## Todo

  * Add more tests

## Installation

[![NPM](https://nodei.co/npm/disconnect.png?downloads=true)](https://nodei.co/npm/disconnect/)

## Structure
The global structure of `disconnect` looks as follows:
```
require('disconnect') -> new Client() -> database()
                                      -> marketplace()
                                      -> user() -> collection()
                                                -> wantlist()
                      -> util
```
To get the user wantlist functions: 
```javascript
var Discogs = require('disconnect').Client;
var wantlist = new Discogs().user().wantlist();
```
More examples below.

## Usage

### Quick start
Here are some basic usage examples that connect with the public API. Error handling has been left out for demonstrational purposes.

#### Init

```javascript
var Discogs = require('disconnect').Client;
```
#### Go!

Get release data.
```javascript
app.get('/release/:id', function(req, res){
	var db = new Discogs().database();
	db.release(req.params.id, function(err, data){
		res.send(data);
	});
});
```

Set your own custom [User-Agent](http://www.discogs.com/developers/accessing.html#required-headers). This is optional as when omitted `disconnect` will set a default one with the value `DisConnectClient/x.x.x` where `x.x.x` is the installed version of `disconnect`.
```javascript
var dis = new Discogs('MyUserAgent/1.0');
```

Get page 2 of user's public collection showing 75 releases.
The second param is the collection folder ID where 0 is always the "All" folder.
```javascript
app.get('/collection/:user', function(req, res){
	var col = new Discogs().user().collection();
	col.releases(req.params.user, 0, {page:2, per_page:75}, function(err, data){
		res.send(data);
	});
});
```

### OAuth
Below are the steps that involve getting a valid OAuth access token from Discogs.

#### 1. Get a request token
```javascript
app.get('/authorize', function(req, res){
	var dis = new Discogs();
	dis.getRequestToken(
		'CONSUMER_KEY', 
		'CONSUMER_SECRET', 
		'http://your-script-url/callback', 
		function(err, requestData){
			// Persist "requestData" here so that the callback handler can 
			// access it later after returning from the authorize url
			res.redirect(requestData.authorizeUrl);
		}
	);
});
```
#### 2. Authorize
After redirection to the Discogs authorize URL in step 1, authorize the application.

#### 3. Get an access token
```javascript
app.get('/callback', function(req, res){
	var dis = new Discogs();
	dis.getAccessToken(
		requestData, 
		req.query.oauth_verifier, // Verification code sent back by Discogs
		function(err, accessData){
			// From this point on we no longer need "requestData", so it can be deleted.
			// Persist "accessData" here for following OAuth calls 
			res.send('Received access token!');
		}
	);
});
```

#### 4. Make OAuth calls
Simply provide the constructor with the access data object persisted in step 3.
```javascript
app.get('/identity', function(req, res){
	var dis = new Discogs(accessData);
	dis.identity(function(err, data){
		res.send(data);
	});
});
```
The User-Agent may still be passed for OAuth calls.
```javascript
var dis = new Discogs('MyUserAgent/1.0', accessData);
```

### Images
Image requests require authentication and are subject to [rate limiting](http://www.discogs.com/developers/accessing.html#rate-limiting).
```javascript
app.get('/image/:filename', function(req, res){
	var db = new Discogs(accessData).database(),
		file = req.params.filename;
	db.image(file, function(err, data, rateLimit){
		// Data contains the raw binary image data
		require('fs').writeFile(file, data, 'binary', function(err){
			// See your current limits
			console.log(rateLimit);
			res.send('Image saved!');
		});
	});
});
```

## Resources

  * [Discogs API 2.0 documentation](http://www.discogs.com/developers/)
  * [The OAuth Bible](http://oauthbible.com/)

## License

MIT