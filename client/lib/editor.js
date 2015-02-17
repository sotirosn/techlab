Module.register('editor', function(module) {var require = module.require, log = module.log; var Editor, Html, WaitAll, start, _ref,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

_ref = require('routine'), start = _ref.start, WaitAll = _ref.WaitAll;

Html = require('html').Html;

Array.prototype.remove = function(element) {
  var index;
  index = this.indexOf(element);
  if (index >= 0) {
    this.splice(index, 1);
  }
  return index;
};

Editor = (function(_super) {
  __extends(Editor, _super);

  Editor.saveAll = function*() {
    var all, editor, wait, _i, _len, _ref1, _ref2;
    _ref1 = new WaitAll, wait = _ref1.wait, all = _ref1.all;
    _ref2 = this.prototype.editors;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      editor = _ref2[_i];
      if (editor.saving) {
        wait(editor.save());
      }
    }
    return (yield all);
  };

  Editor.prototype.editors = [];

  Editor.prototype.modes = {
    html: 'htmlmixed',
    css: 'css',
    javascript: 'javascript',
    coffee: 'coffeescript'
  };

  function Editor(_at_file, data) {
    this.file = _at_file;
    this.editors.push(this);
    this.editor = new CodeMirror(((function(_this) {
      return function(_at_element) {
        _this.element = _at_element;
      };
    })(this)), {
      mode: this.modes[this.file.extension],
      lineNumbers: true,
      indentUnit: 4,
      value: data,
      extraKeys: {
        Tab: CodeMirror.commands.indentMore,
        'Shift-Tab': CodeMirror.commands.indentLess
      }
    });
    this.editor.on('change', this.autosave.bind(this));
  }

  Editor.prototype.autosaveDelay = 30000;

  Editor.prototype.autosave = function() {
    if (!this.saving) {
      this.tab.label = this.file.name + "*";
      return log('saving', this.saving = setTimeout(((function(_this) {
        return function() {
          return start(_this.save());
        };
      })(this)), this.autosaveDelay));
    }
  };

  Editor.prototype.save = function*() {
    var exception;
    clearTimeout(this.saving);
    try {
      this.ide.status = (yield* this.file.write(this.editor.getValue()));
    } catch (_error) {
      exception = _error;
      this.ide.status = exception;
      throw exception;
    }
    delete this.saving;
    return this.tab.label = this.file.name;
  };

  Editor.prototype.hide = function() {
    return this.element.setAttribute('hidden', true);
  };

  Editor.prototype.show = function() {
    this.element.removeAttribute('hidden');
    this.editor.refresh();
    return this.editor.focus();
  };

  Editor.prototype.close = function*() {
    if (this.saving) {
      (yield* this.save());
    }
    this.editors.remove(this);
    return delete this.file.editor;
  };

  return Editor;

})(Html);

module.exports = {
  Editor: Editor
};

});

//# sourceMappingURL=editor.js.map