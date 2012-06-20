
# readline-browserify

Readline implementation for browserify.

# Install

```bash
npm install browserify
npm install readline-browserify
```

# Usage

Copy the css from default.css into your css file.

```html
<div id="commandLineOutput"></div>
<div id="commandLine"></div>

<script>
  var readline = require("readline");

  var rl = readline.createInterface({
    elementId: 'commandLine',

    write: function(data) {
      var output = document.getElementById('commandLineOutput');
      if (output.innerHTML.length > 0) {
        output.innerHTML += "<br>";
      }
      output.innerHTML += line;
    },

    completer: function(linePartial, callback) {
      var cmds = ['command1', 'command2', 'test'];
      var matches = [];
      cmds.forEach(function (cmd) {
        if (cmd.indexOf(linePartial) === 0) {
          matches.push(cmd);
        }
      });
      callback(null, [matches, linePartial]);
    }
  });

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
</script>
```
