#!/usr/bin/env node
'use strict';

var test = require('./test').run({
  input: process.stdin,
  output: process.stdout
});
