'use strict';

var readline = require('../');
//var readline = require('readline');

exports.run = function (options) {
  options = options || {};
  options.completer = function (linePartial, callback) {
    var lastSpace = linePartial.lastIndexOf(' ');
    if (lastSpace >= 0) {
      linePartial = linePartial.substr(lastSpace + 1);
    }
    var cmds = ['command1', 'command2', 'test'];
    var matches = [];
    cmds.forEach(function (cmd) {
      if (cmd.indexOf(linePartial) === 0) {
        matches.push(cmd);
      }
    });
    callback(null, [
      matches,
      linePartial
    ]);
  };

  var rl = readline.createInterface(options);

  rl.setPrompt('browserify> ');
  rl.prompt();

  rl.on('line', function (line) {
    switch (line.trim()) {
    case 'command1':
      rl.write('ok command1');
      break;
    case 'command2':
      rl.write('ok command2');
      break;
    case 'test':
      rl.write('ok test');
      break;
    default:
      rl.write('Say what? I might have heard `' + line.trim() + '`');
      break;
    }
    rl.prompt();
  });

  return rl;
};