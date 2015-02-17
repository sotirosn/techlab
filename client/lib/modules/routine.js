Module.register('modules/routine', function(module) {var require = module.require, log = module.log; var WaitAll, sleep, start, _callback;

_callback = function(error, data) {
  if (error) {
    console.error(error.stack);
    return setTimeout((function() {
      throw error;
    }), 0);
  }
};

start = function(routine, callback, error, data) {
  var done, exception, value, _ref;
  if (callback == null) {
    callback = _callback;
  }
  try {
    _ref = error ? routine["throw"](error) : routine.next(data), done = _ref.done, value = _ref.value;
    if (!done) {
      return value(function(error, data) {
        return start(routine, callback, error, data);
      });
    } else {
      return callback(null, value);
    }
  } catch (_error) {
    exception = _error;
    return callback(exception);
  }
};

WaitAll = (function() {
  function WaitAll() {
    this.wait = this.wait.bind(this);
    this.all = this.all.bind(this);
    this.routines = [];
  }

  WaitAll.prototype.wait = function(routine) {
    return this.routines.push(routine);
  };

  WaitAll.prototype.all = function(callback) {
    var count, errors, results, routine, _i, _len, _ref, _results;
    if (!(count = this.routines.length)) {
      callback(null);
    }
    errors = [];
    results = [];
    _ref = this.routines;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      routine = _ref[_i];
      _results.push(start(routine, function(error, data) {
        if (error) {
          errors.push(error);
        }
        if (data != null) {
          results.push(data);
        }
        if (--count === 0) {
          return callback((errors.length ? errors : null), results);
        }
      }));
    }
    return _results;
  };

  return WaitAll;

})();

WaitAll.Map = (function() {
  function Map() {
    this.wait = this.wait.bind(this);
    this.all = this.all.bind(this);
    this.routines = {};
  }

  Map.prototype.wait = function(key, routine) {
    return this.routines[key] = routine;
  };

  Map.prototype.all = function(callback) {
    var count, errors, results, routine, _key, _ref, _results;
    if (!(count = Object.keys(this.routines).length)) {
      callback(null);
    }
    errors = {};
    results = {};
    _ref = this.routines;
    _results = [];
    for (_key in _ref) {
      routine = _ref[_key];
      _results.push((function(key) {
        return start(routine, function(error, data) {
          if (error) {
            errors[key] = error;
          }
          results[key] = data;
          if (--count === 0) {
            return callback((Object.keys(errors).length ? errors : null), results);
          }
        });
      })(_key));
    }
    return _results;
  };

  return Map;

})();

sleep = function*(duration) {
  return (yield function(callback) {
    return setTimout(callback.bind(null, null), duration);
  });
};

module.exports = {
  start: start,
  sleep: sleep,
  WaitAll: WaitAll
};

});

//# sourceMappingURL=routine.js.map