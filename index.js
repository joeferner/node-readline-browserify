'use strict';

var util = require("util");
var events = require("events");

exports.createInterface = function (options) {
  return new ReadLineInterface(options);
};

function ReadLineInterface(options) {
  this.history = [];
  this._historyIdx = this.history.length;
  this._currentInput = '';
  this._options = options;
  this._options.write = this._options.write || console.log;
  this._elem = document.getElementById(this._options.elementId);
}
util.inherits(ReadLineInterface, events.EventEmitter);

ReadLineInterface.prototype.setPrompt = function (prompt) {
  this._prompt = prompt;
};

ReadLineInterface.prototype.prompt = function (preserveCursor) {
  this._elem.innerHTML =
  '<form id="_readline_cliForm">'
    + '<span class="prompt">' + this._prompt + '</span>'
    + '<input id="_readline_input" autocomplete="off" spellcheck="false" type="text">'
    + '<div class="autocompletePopup" id="_readline_autocomplete" style="display: none; position: fixed;"></div>'
    + '</form>';

  var form = document.getElementById('_readline_cliForm');
  addEvent(form, 'submit', this._onSubmit.bind(this));

  var input = document.getElementById('_readline_input');
  addEvent(input, 'keydown', this._inputKeydown.bind(this));
  input.focus();
};

ReadLineInterface.prototype._inputKeydown = function (e) {
  var TABKEY = 9;
  var UP = 38;
  var DOWN = 40;
  var ENTER = 13;
  var idx, count, value;
  var self = this;
  var input = document.getElementById('_readline_input');

  if (e.keyCode === ENTER) {
    value = this.getAutoCompleteValue();
    if (value) {
      this._updateValueWithCompletion(input, this.lastLinePartial, value);
      this._hideAutoComplete();
      return preventDefault(e);
    }
  }
  else if (e.keyCode === TABKEY) {
    if (this._isAutoCompleteVisible()) {
      value = this.getAutoCompleteValue();
      if (value) {
        this._updateValueWithCompletion(input, self.lastLinePartial, value);
        this._hideAutoComplete();
      }
    } else {
      if (this._options.completer) {
        this._options.completer(input.value, function (err, matchArray) {
          if (!matchArray) {
            return;
          }
          var matches = matchArray[0];
          self.lastLinePartial = matchArray[1];
          if (matches.length === 1) {
            self._updateValueWithCompletion(input, self.lastLinePartial, matches[0]);
          } else if (matches.length > 1) {
            self._showAutoComplete(input, matches);
          }
        });
      }
    }
    return preventDefault(e);
  } else if (e.keyCode == DOWN) {
    count = this.getAutoCompleteCount();
    if (count === 0) {
      if (this._historyIdx <= this.history.length - 1) {
        this._historyIdx++;
        if (this._historyIdx >= this.history.length) {
          input.value = this._currentInput;
        } else {
          input.value = this.history[this._historyIdx];
        }
      }
    } else {
      idx = this.getSelectedAutoCompleteItemIndex() + 1;
      if (idx >= count) {
        idx = 0;
      }
      this.setSelectedAutoCompleteItemIndex(idx);
    }
    return preventDefault(e);
  } else if (e.keyCode == UP) {
    count = this.getAutoCompleteCount();
    if (count === 0) {
      if (this._historyIdx === this.history.length) {
        this._currentInput = input.value;
      }
      if (this._historyIdx >= 1) {
        this._historyIdx--;
        input.value = this.history[this._historyIdx];
      }
    } else {
      idx = this.getSelectedAutoCompleteItemIndex() - 1;
      if (idx < 0) {
        idx = count - 1;
      }
      this.setSelectedAutoCompleteItemIndex(idx);
    }
    return preventDefault(e);
  } else {
    this._hideAutoComplete();
  }
  return true;
};

ReadLineInterface.prototype._updateValueWithCompletion = function (input, linePartial, value) {
  input.value = input.value.replace(new RegExp(linePartial + '$'), value);
};

ReadLineInterface.prototype._isAutoCompleteVisible = function () {
  var autocomplete = document.getElementById('_readline_autocomplete');
  return autocomplete.style.display !== 'none';
};

ReadLineInterface.prototype._hideAutoComplete = function () {
  var autocomplete = document.getElementById('_readline_autocomplete');
  autocomplete.innerHTML = '';
  autocomplete.style.display = 'none';
};

ReadLineInterface.prototype._autoCompleteClick = function (elem) {
  var input = document.getElementById('_readline_input');
  var value = elem.getAttribute('data-value');
  this._updateValueWithCompletion(input, this.lastLinePartial, value);
  this._hideAutoComplete();
  input.focus();
};

ReadLineInterface.prototype._showAutoComplete = function (input, matches) {
  var autocomplete = document.getElementById('_readline_autocomplete');
  var html = '';
  matches.forEach(function (match) {
    html += '<div data-value="' + match + '">' + match + "</div>";
  });
  autocomplete.innerHTML = html;
  for (var i = 0; i < autocomplete.children.length; i++) {
    var child = autocomplete.children[i];
    addEvent(child, 'click', this._autoCompleteClick.bind(this, child));
  }
  var inputLoc = getOffset(input);
  autocomplete.style.left = inputLoc.left;
  autocomplete.style.top = (inputLoc.top + input.offsetHeight) + 'px';
  autocomplete.style.display = 'block';
  if (inputLoc.top + autocomplete.offsetHeight > window.pageYOffset + window.innerHeight) {
    var y = inputLoc.top - autocomplete.offsetHeight;
    if (y > 0) {
      autocomplete.style.top = y + 'px';
    }
  }
};

ReadLineInterface.prototype.getAutoCompleteValue = function (idx) {
  idx = idx || this.getSelectedAutoCompleteItemIndex();
  if (idx === -1) {
    return null;
  }
  var autocomplete = document.getElementById('_readline_autocomplete');
  return autocomplete.children[idx].getAttribute('data-value');
};

ReadLineInterface.prototype.getAutoCompleteCount = function () {
  var autocomplete = document.getElementById('_readline_autocomplete');
  return autocomplete.children.length;
};

ReadLineInterface.prototype.getSelectedAutoCompleteItemIndex = function () {
  var autocomplete = document.getElementById('_readline_autocomplete');
  for (var i = 0; i < autocomplete.children.length; i++) {
    if (autocomplete.children[i].className === 'selected') {
      return i;
    }
  }
  return -1;
};

ReadLineInterface.prototype.setSelectedAutoCompleteItemIndex = function (idx) {
  var autocomplete = document.getElementById('_readline_autocomplete');
  for (var i = 0; i < autocomplete.children.length; i++) {
    autocomplete.children[i].className = i === idx ? 'selected' : '';
  }
};

ReadLineInterface.prototype._onSubmit = function (e) {
  var input = document.getElementById('_readline_input');
  var line = input.value;
  this.history.push(line);
  this._historyIdx = this.history.length;
  this._currentInput = '';
  this.emit("line", line);
  this.prompt();
  return preventDefault(e);
};

ReadLineInterface.prototype.question = function (query, callback) {
  throw new Error("Not Implemented (question)");
};

ReadLineInterface.prototype.pause = function () {
  var input = document.getElementById('_readline_input');
  input.disabled = 'disabled';
};

ReadLineInterface.prototype.resume = function () {
  var input = document.getElementById('_readline_input');
  input.disabled = '';
};

ReadLineInterface.prototype.close = function () {
};

ReadLineInterface.prototype.write = function (data, key) {
  this._options.write(data);
};

function preventDefault(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  return false;
}

function getOffset(el) {
  var _x = 0;
  var _y = 0;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { top: _y, left: _x };
}

function addEvent(elem, eventName, fn) {
  if (elem.addEventListener) {
    elem.addEventListener(eventName, fn, false);
  } else if (elem.attachEvent) {
    elem.attachEvent('on' + eventName, fn, false);
  }
}