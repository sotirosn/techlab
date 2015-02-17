Module.register('modules/html', function(module) {var require = module.require, log = module.log; var $, $$, Html, start,
  __slice = [].slice,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

start = require('routine').start;

$ = document.querySelector.bind(document);

$$ = document.querySelectorAll.bind(document);

Object.clone = function(object) {
  var key, result, value;
  result = {};
  for (key in object) {
    value = object[key];
    result[key] = value;
  }
  return result;
};

Html = (function() {
  var div;

  Html.$ = function(query) {
    return [this, query];
  };

  Html.properties = function(properties) {
    return Object.defineProperties(this.prototype, properties);
  };

  Html.properties({
    clone: {
      get: function() {
        return this.element.cloneNode(true);
      }
    }
  });

  Html.prototype.bind = function(routine) {
    return routine.bind(this);
  };

  Html.prototype.onclick = function(routine) {
    return (function(_this) {
      return function(event) {
        start(routine.apply(_this, arguments));
        event.stopPropagation();
        event.preventDefault();
        return false;
      };
    })(this);
  };

  function Html(element) {
    var Type, key, querystring, value, _ref;
    this.element = element || this.element;
    _ref = this.map;
    for (key in _ref) {
      value = _ref[key];
      this[key] = value instanceof Array ? (log(this.element), log((Type = value[0], querystring = value[1], value)), log(this.element.querySelector(querystring)), new Type(this.element.querySelector(querystring))) : this.element.querySelector(value);
    }
  }

  Html.prototype.clear = function() {
    return this.element.innerHTML = '';
  };

  Html.prototype.insert = function() {
    var children;
    children = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.element.insertBefore(Html.html.apply(Html, children), this.element.firstChild);
  };

  Html.prototype.append = function() {
    var children;
    children = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.element.appendChild(Html.html.apply(Html, children));
  };

  Html.prototype.remove = function() {
    return this.element.parentNode.removeChild(this.element);
  };

  Html.prototype.hide = function() {
    return this.element.setAttribute('hidden', true);
  };

  Html.prototype.show = function() {
    return this.element.removeAttribute('hidden');
  };

  Html.prototype.close = function*() {
    delete this.tab;
    return ;
  };

  div = document.createElement('div');

  Html.parse = function(html) {
    var fragment;
    fragment = document.createDocumentFragment();
    div.innerHTML = html;
    while (div.childNodes.length) {
      fragment.appendChild(div.firstChild);
    }
    return fragment;
  };

  Html.html = function() {
    var child, children, fragment, _i, _len;
    children = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    fragment = document.createDocumentFragment();
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      fragment.appendChild((function() {
        if (child.element instanceof Node) {
          return child.element;
        } else if (child instanceof Node) {
          return child;
        } else if (typeof child === 'string') {
          return this.parse(child);
        } else {
          throw new TypeError("cannot convert " + (child != null ? child.constructor.name : void 0) + " to html");
        }
      }).call(this));
    }
    return fragment;
  };

  Html.create = function() {
    var attributes, children, element, key, tagname, value, _ref;
    tagname = arguments[0], children = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    element = document.createElement(tagname);
    attributes = ((_ref = children[0]) != null ? _ref.constructor : void 0) === Object ? children.splice(0, 1)[0] : {};
    for (key in attributes) {
      value = attributes[key];
      element.setAttribute(key, value);
    }
    element.appendChild(this.html.apply(this, children));
    return element;
  };

  return Html;

})();

Html.ContextMenu = (function(_super) {
  __extends(ContextMenu, _super);

  ContextMenu.define = function(menuItems) {
    var key, label, routine, _ref;
    this.prototype.menuItems = menuItems;
    this.prototype.element = this.create('div', {
      "class": 'contextmenu',
      hidden: true
    });
    this.prototype.map = {};
    this.i = 1;
    for (key in menuItems) {
      _ref = menuItems[key], label = _ref[0], routine = _ref[1];
      log('context', key, label);
      this.prototype.element.appendChild(this.create('label', label));
      this.prototype.map[key] = "label:nth-of-type(" + (this.i++) + ")";
      log(this.prototype.map);
    }
    log('define', this.prototype.menuItems);
    return log('define', this.prototype.map);
  };

  ContextMenu.extend = function(menuItems) {
    var key, label, routine, _ref, _results;
    this.prototype.element = this.prototype.clone;
    this.prototype.menuItems = Object.clone(this.prototype.menuItems);
    this.prototype.map = Object.clone(this.prototype.map);
    _results = [];
    for (key in menuItems) {
      _ref = menuItems[key], label = _ref[0], routine = _ref[1];
      this.prototype.element.appendChild(this.create('label', label));
      this.prototype.map[key] = "label:nth-of-type(" + (this.i++) + ")";
      _results.push(this.prototype.menuItems[key] = [label, routine]);
    }
    return _results;
  };

  function ContextMenu() {
    var key, label, _fn, _ref, _ref1, _routine;
    ContextMenu.__super__.constructor.call(this, this.clone);
    _ref = this.menuItems;
    _fn = (function(_this) {
      return function(routine) {
        return _this[key].onclick = _this.onclick(function*() {
          this.hide();
          return (yield* routine.call(this.target));
        });
      };
    })(this);
    for (key in _ref) {
      _ref1 = _ref[key], label = _ref1[0], _routine = _ref1[1];
      _fn(_routine);
    }
    document.body.appendChild(this.element);
  }

  ContextMenu.prototype.display = function(event, _at_target) {
    this.target = _at_target;
    this.element.style.left = event.clientX || event.x;
    this.element.style.top = event.clientY || event.y;
    this.show();
    event.stopPropagation();
    event.preventDefault();
    return false;
  };

  return ContextMenu;

})(Html);

Html.List = (function(_super) {
  __extends(List, _super);

  function List() {
    return List.__super__.constructor.apply(this, arguments);
  }

  List.prototype.Element = (function(_super1) {
    __extends(Element, _super1);

    Element.prototype.element = Element.create('li');

    function Element(text) {
      Element.__super__.constructor.call(this, this.clone);
      this.element.innerHTML = text;
    }

    return Element;

  })(Html);

  List.prototype.element = List.html('<ul></ul>');

  List.prototype.map = {
    content: Html.$('ul')
  };

  List.prototype.load = function(datas) {
    var data, _i, _len, _results;
    this.content.clear();
    _results = [];
    for (_i = 0, _len = datas.length; _i < _len; _i++) {
      data = datas[_i];
      _results.push(this.add(data));
    }
    return _results;
  };

  List.prototype.add = function(data) {
    return this.content.append(new this.Element(data));
  };

  return List;

})(Html);

Html.Table = (function(_super) {
  __extends(Table, _super);

  Table.define = function(fields) {
    var container, i, key, map, trbody, trhead, value;
    this.prototype.fields = fields;
    this.prototype.element = this.html('<a>create</a> | <a>save</a> | <a>revert</a><br/><table><thead></thead><tbody></tbody></table><div></div>');
    this.prototype.map = {
      head: Html.$('thead'),
      body: Html.$('tbody'),
      createlink: 'a:nth-of-type(1)',
      savelink: 'a:nth-of-type(2)',
      revertlink: 'a:nth-of-type(3)'
    };
    map = {};
    trhead = this.create('tr');
    trbody = this.create('tr');
    i = 1;
    for (key in fields) {
      value = fields[key];
      trhead.appendChild(this.create('td', value));
      trbody.appendChild(this.create('td', '<input/>'));
      map[key] = "td:nth-child(" + (i++) + ") input";
    }
    this.prototype.trhead = trhead;
    container = this;
    return this.prototype.Element = (function(_super1) {
      __extends(Element, _super1);

      Element.prototype.element = trbody;

      Element.prototype.map = map;

      Element.prototype.fields = fields;

      Element.prototype.container = container;

      Element.properties({
        modified: {
          set: function(value) {
            if (value) {
              return this.element.setAttribute('modified', true);
            } else {
              return this.element.removeAttribute('modified');
            }
          }
        }
      });

      function Element(data) {
        Element.__super__.constructor.call(this, this.clone);
        for (key in fields) {
          this[key].value = data[key] || '';
          this[key].onchange = (function(_this) {
            return function() {
              return _this.container.modify(_this);
            };
          })(this);
        }
      }

      return Element;

    })(Html);
  };

  Table.prototype.update = function() {
    var element, _i, _len, _ref, _results;
    _ref = this.modified;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      _results.push(element.modified = false);
    }
    return _results;
  };

  Table.prototype.modify = function(element) {
    this.modified.push(element);
    return element.modified = true;
  };

  function Table(element) {
    Table.__super__.constructor.call(this, element || this.clone);
    log('new table', element);
    this.header.append(new this.Element(this.fields));
    this.savelink.onclick = this.onclick(this.update);
    this.modified = [];
  }

  return Table;

})(Html.List);

Html.View = (function(_super) {
  __extends(View, _super);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.define = function(fields) {
    var input, key, name, _ref, _results;
    this.prototype.fields = fields;
    this.prototype.element = this.create('div', {
      "class": 'view'
    });
    this.prototype.map = {};
    _results = [];
    for (key in fields) {
      _ref = fields[key], name = _ref[0], input = _ref[1];
      element.appendChild(this.html('<label>#{name}</label>', input, '<br/>'));
      _results.push(map[key] = Html.$("[name=" + name + "]"));
    }
    return _results;
  };

  View.prototype.load = function(data) {
    var key, _results;
    _results = [];
    for (key in this.fields) {
      _results.push(this[key].value = data[key]);
    }
    return _results;
  };

  return View;

})(Html);

module.exports = {
  Html: Html,
  $: $,
  $$: $$
};

});

//# sourceMappingURL=html.js.map