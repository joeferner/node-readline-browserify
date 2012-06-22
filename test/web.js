#!/usr/bin/env node
'use strict';

var path = require('path');
var connect = require('connect');

var server = connect.createServer();
server.use(connect.static(__dirname));
server.use(connect.static(path.join(__dirname, '..')));

var browserify = require('browserify');
var bundle = browserify(path.join(__dirname, 'entry.js'));
server.use(bundle);

var port = parseInt(process.argv[2] || 8080, 10);
server.listen(port);
console.log('Listening on :' + port);
