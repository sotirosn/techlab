Module.register('editor', function(module) {var require = module.require, log = module.log; var Editor, Html, WaitAll, ref, start,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ref = require('routine'), start = ref.start, WaitAll = ref.WaitAll;

Html = require('html').Html;

Array.prototype.remove = function(element) {
  var index;
  index = this.indexOf(element);
  if (index >= 0) {
    this.splice(index, 1);
  }
  return index;
};

Editor = (function(superClass) {
  extend(Editor, superClass);

  Editor.saveAll = function*() {
    var all, editor, i, len, ref1, ref2, wait;
    ref1 = new WaitAll, wait = ref1.wait, all = ref1.all;
    ref2 = this.prototype.editors;
    for (i = 0, len = ref2.length; i < len; i++) {
      editor = ref2[i];
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

  function Editor(file, data) {
    this.file = file;
    this.editors.push(this);
    this.editor = new CodeMirror(((function(_this) {
      return function(element1) {
        _this.element = element1;
      };
    })(this)), {
      mode: this.modes[this.file.extension],
      lineNumbers: true,
      indentUnit: 4,
      value: data,
      extraKeys: {
        Tab: CodeMirror.commands.indentMore,
        'Shift-Tab': CodeMirror.commands.indentLess
      },
      readOnly: this.file.project.readonly
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