var Directory, Module, log,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

log = console.log.bind(console, 'Module:');

Directory = (function() {
  function Directory(parent, path1) {
    this.parent = parent;
    this.path = path1;
    this.contents = {};
  }

  return Directory;

})();

Module = (function() {
  Module.Error = (function(superClass) {
    extend(Error, superClass);

    Error.prototype.name = 'ModuleError';

    function Error(message) {
      this.message = message;
    }

    return Error;

  })(Error);

  Module.directory = new Directory(void 0, '.');

  Module.modules = Module.directory.contents.modules = new Directory(void 0, '/');

  Module.register = function(path, callback) {
    var directory, dirname, dirpath, i, j, len, modulename, ref;
    ref = path.split('/'), dirpath = 2 <= ref.length ? slice.call(ref, 0, i = ref.length - 1) : (i = 0, []), modulename = ref[i++];
    directory = this.directory;
    if (!(directory instanceof Directory)) {
      throw new Module.Error("bad module path dir: " + path);
    }
    for (j = 0, len = dirpath.length; j < len; j++) {
      dirname = dirpath[j];
      directory = directory.contents[dirname] || (directory.contents[dirname] = new Directory(directory, dirpath));
      if (!(directory instanceof Directory)) {
        throw new Module.Error("bad module path dir: " + path);
      }
    }
    return directory.contents[modulename] = new Module(path, directory, callback);
  };

  Module.require = function(path) {
    var directory, dirname, dirpath, i, j, len, module, modulename, ref;
    ref = path.split('/'), dirpath = 2 <= ref.length ? slice.call(ref, 0, i = ref.length - 1) : (i = 0, []), modulename = ref[i++];
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
    for (j = 0, len = dirpath.length; j < len; j++) {
      dirname = dirpath[j];
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

  function Module(path1, directory1, module1) {
    this.path = path1;
    this.directory = directory1;
    this.module = module1;
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