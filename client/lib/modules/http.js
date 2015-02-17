Module.register('modules/http', function(module) {var require = module.require, log = module.log; var Http,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

Http = (function() {
  Http.Error = (function(_super) {
    __extends(Error, _super);

    Error.prototype.name = 'HttpError';

    function Error(_at_status, _at_message) {
      this.status = _at_status;
      this.message = _at_message;
    }

    return Error;

  })(Error);

  function Http(_at_url) {
    this.url = _at_url;
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