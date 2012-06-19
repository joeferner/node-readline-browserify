
# readline-browserify

Readline implementation for browserify.

# Install

```bash
npm install browserify
npm install readline-browserify
```

# Usage

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
</script>
```
