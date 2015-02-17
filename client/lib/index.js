Module.register('index', function(module) {var require = module.require, log = module.log; var $, ClientIDE, Directory, Html, IDE, WaitAll, http, ide, start, _ref, _ref1, _ref2,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

_ref = require('html'), Html = _ref.Html, $ = _ref.$;

_ref1 = require('routine'), start = _ref1.start, WaitAll = _ref1.WaitAll;

_ref2 = require('./client'), IDE = _ref2.IDE, Directory = _ref2.Directory;

http = require('./http');

ClientIDE = (function(_super) {
  __extends(ClientIDE, _super);

  function ClientIDE() {
    return ClientIDE.__super__.constructor.apply(this, arguments);
  }

  ClientIDE.Menu = (function(_super1) {
    __extends(Menu, _super1);

    function Menu() {
      return Menu.__super__.constructor.apply(this, arguments);
    }

    Menu.prototype.element = Menu.create('div', {
      "class": 'navmenu'
    }, '<h3>Assignments</h3><ul></ul>');

    Menu.prototype.Element = (function(_super2) {
      __extends(Element, _super2);

      function Element(_arg) {
        var title, _id;
        title = _arg.title, _id = _arg._id;
        Element.__super__.constructor.call(this, title);
        this.element.onclick = this.onclick(function*() {
          this.ide.hierarchy.clear();
          return this.ide.loadProject((yield* http.post('assignment/get', {
            _id: _id
          })));
        });
      }

      return Element;

    })(Html.List.prototype.Element);

    return Menu;

  })(Html.List);

  return ClientIDE;

})(IDE);

ide = new ClientIDE;

document.body.appendChild(ide.element);

start(ide.load());

});

//# sourceMappingURL=index.js.map