Module.register('admin/edittable', function(module) {var require = module.require, log = module.log; var EditTable, Html, http,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

Html = require('html').Html;

http = require('../http');

EditTable = (function(_super) {
  __extends(EditTable, _super);

  EditTable.prototype.element = EditTable.html('<a>create</a> | <a>save</a> | <a>revert</a><br/><table><thead></thead><tbody></tbody></table><div></div>');

  EditTable.prototype.map = {
    head: Html.$('thead'),
    body: Html.$('tbody'),
    createlink: 'a:nth-of-type(1)',
    savelink: 'a:nth-of-type(2)',
    revertlink: 'a:nth-of-type(3)'
  };

  EditTable.define = function(fields) {
    var Self, element, i, key, map;
    log('define', fields);
    this.prototype.fields = fields;
    this.prototype.modifies = [];
    Self = this;
    element = this.create('tr');
    map = {};
    i = 1;
    for (key in fields) {
      element.appendChild(this.create('td', '<input type="text"/>'));
      map[key] = "td:nth-of-type(" + (i++) + ") input";
    }
    return this.prototype.Row = (function(_super1) {
      __extends(Row, _super1);

      function Row() {
        return Row.__super__.constructor.apply(this, arguments);
      }

      Row.prototype.contextmenu = new Self.ContextMenu;

      Row.prototype.url = Self.prototype.url;

      Row.prototype.modifies = Self.prototype.modifies;

      Row.prototype.fields = fields;

      Row.prototype.element = element;

      Row.prototype.map = map;

      return Row;

    })(this.Row);
  };

  EditTable.ContextMenu = (function(_super1) {
    __extends(ContextMenu, _super1);

    function ContextMenu() {
      return ContextMenu.__super__.constructor.apply(this, arguments);
    }

    ContextMenu.define({
      "delete": new Array('Delete', function*() {
        this.ide.status = (yield* http.post(this.url + "/remove", {
          _id: this.data._id
        }));
        return this.remove();
      })
    });

    return ContextMenu;

  })(Html.ContextMenu);

  EditTable.Row = (function(_super1) {
    __extends(Row, _super1);

    Row.prototype.modifies = [];

    Row.prototype.fields = {};

    Row.prototype.element = Row.create('tr');

    Row.prototype.map = {};

    Row.properties({
      modified: {
        set: function(modified) {
          if (this._modified === modified) {
            return;
          }
          if (modified) {
            this.modifies.push(this);
            this.element.setAttribute('modified', true);
          } else {
            this.element.removeAttribute('modified');
          }
          return this._modified = modified;
        }
      },
      value: {
        get: function() {
          var key, results, value, _ref;
          results = {
            _id: this.data._id
          };
          _ref = this.fields;
          for (key in _ref) {
            value = _ref[key];
            results[key] = this[key].value;
          }
          return results;
        }
      }
    });

    function Row(_at_data) {
      this.data = _at_data;
      Row.__super__.constructor.call(this, this.clone);
      if (this.data) {
        this.revert();
      } else {
        this.data = {};
        this.modified = true;
      }
      this.element.onchange = (function(_this) {
        return function() {
          return _this.modified = true;
        };
      })(this);
      this.element.oncontextmenu = (function(_this) {
        return function(event) {
          return _this.contextmenu.display(event, _this);
        };
      })(this);
    }

    Row.prototype.revert = function() {
      var key;
      for (key in this.fields) {
        this[key].value = this.data[key] || '';
      }
      return this.modified = false;
    };

    Row.prototype.updated = function(_id) {
      var key;
      this.data._id = _id;
      for (key in this.fields) {
        this.data[key] = this[key].value;
      }
      return this.modified = false;
    };

    Row.prototype.remove = function() {
      this.modifies.remove(this);
      return Row.__super__.remove.apply(this, arguments);
    };

    return Row;

  })(Html);

  function EditTable() {
    EditTable.__super__.constructor.call(this, this.clone);
    this.head.append(new this.Row(this.fields));
    this.createlink.onclick = (function(_this) {
      return function() {
        return _this.body.insert(new _this.Row);
      };
    })(this);
    this.savelink.onclick = this.onclick(this.save);
    this.revertlink.onclick = this.onclick(function() {
      var row, _i, _len, _ref;
      _ref = this.modifies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        row.revert();
      }
      return this.modifies.length = 0;
    });
  }

  EditTable.prototype.save = function*() {
    var key, updated, value, _i, _len, _ref;
    if (!this.modifies.length) {
      return;
    }
    _ref = (yield* http.post(this.url + "/update", this.modifies.map(function(row) {
      return row.value;
    }))), this.ide.status = _ref[0], updated = _ref[1];
    for (key = _i = 0, _len = updated.length; _i < _len; key = ++_i) {
      value = updated[key];
      this.modifies[key].updated(value);
    }
    return this.modifies.length = 0;
  };

  EditTable.prototype.load = function*() {
    var row, _i, _len, _ref, _results;
    this.body.clear();
    _ref = (yield* http.post(this.url + "/list"));
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      row = _ref[_i];
      log('adding row', row);
      _results.push(this.body.append(new this.Row(row)));
    }
    return _results;
  };

  EditTable.prototype.close = function*() {
    if (this.modifies.length) {
      if (confirm("Would you like to save changes before closing?")) {
        (yield* this.save());
      }
    }
    return delete this.tab;
  };

  return EditTable;

})(Html);

module.exports = {
  EditTable: EditTable
};

});

//# sourceMappingURL=edittable.js.map