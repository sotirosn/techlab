Module.register('modules/http', function(module) {var require = module.require, log = module.log; var Http,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Http = (function() {
  Http.Error = (function(superClass) {
    extend(Error, superClass);

    Error.prototype.name = 'HttpError';

    function Error(status, message) {
      this.status = status;
      this.message = message;
    }

    return Error;

  })(Error);

  function Http(url) {
    this.url = url;
  }

  Http.prototype.post = function*(path, data) {
    var request;
    if (data == null) {
      data = {};
    }
    request = new XMLHttpRequest;
    request.open('POST', this.url + "/" + path);
    request.withCredentials = true;
    request.send(JSON.stringify(data));
    return (yield function(callback) {
      return request.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            return callback(null, JSON.parse(this.responseText));
          } else {
            return callback(new Http.Error(this.status, this.responseText));
          }
        }
      };
    });
  };

  return Http;

})();

module.exports = Http;

});

//# sourceMappingURL=http.js.map