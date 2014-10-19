[![Build Status](https://travis-ci.org/nnarhinen/passwordless-bookshelfstore.svg)](https://travis-ci.org/nnarhinen/passwordless-bookshelfstore)

passwordless-bookshelfstore
===========================

A Passwordless TokenStore impleentation using Bookshelf.js

Installation
------------

`npm install passwordless-bookshelfstore`

Usage
-----

Create a Bookshelf Model with following properties:
 * `token` string (unique)
 * `uid` string (unique)
 * `ttl` timestamp
 * `origin` string

Initialize store:

```js
var BookshelfStore = require('passwordless-bookshelfstore');
passwordless.init(new BookshelfStore(MyTokenModel));
```

Author
------

Niklas Närhinen <niklas@narhinen.net>

License
-------

The MIT license
