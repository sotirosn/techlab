Module.register('layout', function(module) {var require = module.require, log = module.log; var Html, TabView,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

Html = require('html').Html;

TabView = (function(_super) {
  var Tab;

  __extends(TabView, _super);

  Tab = (function(_super1) {
    __extends(Tab, _super1);

    Tab.prototype.element = Tab.create('div', {
      "class": 'tab'
    }, '<label></label><button class="close"></button>');

    Tab.prototype.map = {
      $label: 'label',
      $close: 'button.close'
    };

    Tab.properties({
      label: {
        set: function(label) {
          return this.$label.innerHTML = label;
        }
      }
    });

    function Tab(_at_container, label, _at_content) {
      this.container = _at_container;
      this.content = _at_content;
      Tab.__super__.constructor.call(this, this.clone);
      this.$label.innerHTML = label;
      this.$close.onclick = this.onclick(this.close);
      this.element.onclick = this.focus.bind(this);
    }

    Tab.prototype.close = function*() {
      (yield* this.content.close());
      return this.container.removeTab(this);
    };

    Tab.prototype.focus = function() {
      this.container.focusTab(this);
      this.content.show();
      return this.element.setAttribute('active', true);
    };

    Tab.prototype.blur = function() {
      this.element.removeAttribute('active');
      return this.content.hide();
    };

    return Tab;

  })(Html);

  TabView.prototype.element = TabView.create('div', {
    "class": 'tabview'
  }, '<div class="tabs"></div><div class="views"></div>');

  TabView.prototype.map = {
    $tabs: 'div.tabs',
    $views: 'div.views'
  };

  function TabView(element) {
    TabView.__super__.constructor.call(this, element || this.clone);
    this.tabs = [];
  }

  TabView.prototype.addTab = function(label, view) {
    var tab;
    log(this);
    tab = new Tab(this, label, view);
    this.tabs.push(tab);
    this.$tabs.appendChild(tab.element);
    this.$views.appendChild(tab.content.element);
    return tab;
  };

  TabView.prototype.removeTab = function(tab) {
    var index;
    index = this.tabs.remove(tab);
    if (this.active === tab) {
      if (this.tabs.length) {
        this.tabs[this.tabs.length === index ? index - 1 : index].focus();
      } else {
        delete this.active;
      }
    }
    this.$tabs.removeChild(tab.element);
    return this.$views.removeChild(tab.content.element);
  };

  TabView.prototype.focusTab = function(tab) {
    var _ref;
    if (this.active === tab) {
      return;
    }
    if ((_ref = this.active) != null) {
      _ref.blur();
    }
    return this.active = tab;
  };

  TabView.prototype.closeAllTabs = function*() {
    var all, tab, wait, _i, _len, _ref, _ref1;
    _ref = new WaitAll, wait = _ref.wait, all = _ref.all;
    _ref1 = this.tabs;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      tab = _ref1[_i];
      wait(tab.close());
    }
    return (yield all);
  };

  return TabView;

})(Html);

module.exports = {
  TabView: TabView
};

});

//# sourceMappingURL=layout.js.map