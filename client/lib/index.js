Module.register('index', function(module) {var require = module.require, log = module.log; var $, ClientIDE, Directory, Html, IDE, WaitAll, http, ide, ref, ref1, ref2, start,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ref = require('html'), Html = ref.Html, $ = ref.$;

ref1 = require('routine'), start = ref1.start, WaitAll = ref1.WaitAll;

ref2 = require('./client'), IDE = ref2.IDE, Directory = ref2.Directory;

http = require('./http');

ClientIDE = (function(superClass) {
  extend(ClientIDE, superClass);

  function ClientIDE() {
    return ClientIDE.__super__.constructor.apply(this, arguments);
  }

  ClientIDE.Menu = (function(superClass1) {
    extend(Menu, superClass1);

    function Menu() {
      return Menu.__super__.constructor.apply(this, arguments);
    }

    Menu.prototype.element = Menu.create('div', {
      "class": 'navmenu'
    }, '<h3>Resources</h3><a href="~administrator/Resources/html.html">html</a><h3>Assignments</h3><ul></ul>');

    Menu.prototype.Element = (function(superClass2) {
      extend(Element, superClass2);

      function Element(arg) {
        var _id, title;
        title = arg.title, _id = arg._id;
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