Module.register('modules/routine', function(module) {var require = module.require, log = module.log; var WaitAll, _callback, sleep, start;

_callback = function(error, data) {
  if (error) {
    console.error(error.stack);
    return setTimeout((function() {
      throw error;
    }), 0);
  }
};

start = function(routine, callback, error, data) {
  var done, exception, ref, value;
  if (callback == null) {
    callback = _callback;
  }
  try {
    ref = error ? routine["throw"](error) : routine.next(data), done = ref.done, value = ref.value;
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
    var count, errors, i, len, ref, results, results1, routine;
    if (!(count = this.routines.length)) {
      callback(null);
    }
    errors = [];
    results = [];
    ref = this.routines;
    results1 = [];
    for (i = 0, len = ref.length; i < len; i++) {
      routine = ref[i];
      results1.push(start(routine, function(error, data) {
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
    return results1;
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
    var _key, count, errors, ref, results, results1, routine;
    if (!(count = Object.keys(this.routines).length)) {
      callback(null);
    }
    errors = {};
    results = {};
    ref = this.routines;
    results1 = [];
    for (_key in ref) {
      routine = ref[_key];
      results1.push((function(key) {
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
    return results1;
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