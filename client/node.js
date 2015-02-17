var Directory, Module, log,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty,
  __slice = [].slice;

log = console.log.bind(console, 'Module:');

Directory = (function() {
  function Directory(_at_parent, _at_path) {
    this.parent = _at_parent;
    this.path = _at_path;
    this.contents = {};
  }

  return Directory;

})();

Module = (function() {
  Module.Error = (function(_super) {
    __extends(Error, _super);

    Error.prototype.name = 'ModuleError';

    function Error(_at_message) {
      this.message = _at_message;
    }

    return Error;

  })(Error);

  Module.directory = new Directory(void 0, '.');

  Module.modules = Module.directory.contents.modules = new Directory(void 0, '/');

  Module.register = function(path, callback) {
    var directory, dirname, dirpath, modulename, _i, _j, _len, _ref;
    _ref = path.split('/'), dirpath = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), modulename = _ref[_i++];
    directory = this.directory;
    if (!(directory instanceof Directory)) {
      throw new Module.Error("bad module path dir: " + path);
    }
    for (_j = 0, _len = dirpath.length; _j < _len; _j++) {
      dirname = dirpath[_j];
      directory = directory.contents[dirname] || (directory.contents[dirname] = new Directory(directory, dirpath));
      if (!(directory instanceof Directory)) {
        throw new Module.Error("bad module path dir: " + path);
      }
    }
    return directory.contents[modulename] = new Module(path, directory, callback);
  };

  Module.require = function(path) {
    var directory, dirname, dirpath, module, modulename, _i, _j, _len, _ref;
    _ref = path.split('/'), dirpath = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), modulename = _ref[_i++];
    directory = (function() {
      switch (dirpath[0]) {
        case '.':
          return this.directory;
        case '..':
          return this.directory;
        default:
          return Module.modules;
      }
    }).call(this);
    for (_j = 0, _len = dirpath.length; _j < _len; _j++) {
      dirname = dirpath[_j];
      if (dirname === '..') {
        directory = directory.parent;
      } else if (dirname !== '.') {
        directory = directory.contents[dirname];
      }
      if (!(directory instanceof Directory)) {
        throw new Module.Error("bad module path dir: " + path);
      }
    }
    module = directory.contents[modulename];
    if (!(module instanceof Module)) {
      throw new Module.Error("bad module path name: " + path);
    }
    if (!module.initialized) {
      module.initialize();
    }
    return module.exports;
  };

  function Module(_at_path, _at_directory, _at_module) {
    this.path = _at_path;
    this.directory = _at_directory;
    this.module = _at_module;
    this.require = this.require.bind(this);
    this.log = console.log.bind(console, this.path + ":");
  }

  Module.prototype.require = Module.require;

  Module.prototype.initialize = function() {
    this.initialized = true;
    return this.module.call(null, this);
  };

  return Module;

})();


//# sourceMappingURL=node.js.map