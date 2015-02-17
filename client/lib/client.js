Module.register('client', function(module) {var require = module.require, log = module.log; var Directory, Editor, File, Html, IDE, Login, Logout, Project, TabView, http, start,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

Html = require('html').Html;

TabView = require('./layout').TabView;

Editor = require('./editor').Editor;

http = require('./http');

start = require('routine').start;

Login = (function(_super) {
  __extends(Login, _super);

  Login.prototype.element = Login.create('div', {
    id: 'signin',
    hidden: true
  }, '<div> <h3>Sign In</h3> <label>Username:</label><input name="username"/><br/> <label>Password:</label><input name="password" type="password"/><br/> <button class="blue">Sign In</button> <p class="error"></p> </div>');

  Login.prototype.map = {
    $username: 'input[name=username]',
    $password: 'input[name=password]',
    $submit: 'button',
    error: 'p.error'
  };

  function Login() {
    Login.__super__.constructor.apply(this, arguments);
  }

  Login.prototype.login = function*() {
    var exception;
    try {
      this.show();
      this.ide.user = (yield (function(_this) {
        return function(callback) {
          _this.$submit.onclick = function() {
            return start(_this.submit(), callback);
          };
          return _this.$username.onkeypress = _this.$password.onkeypress = function(event) {
            if (event.which === 13) {
              return start(_this.submit(), callback);
            } else {
              return log(event);
            }
          };
        };
      })(this));
      return this.hide();
    } catch (_error) {
      exception = _error;
      if ((exception != null ? exception.status : void 0) === 430) {
        return this.error.innerHTML = exception;
      } else {
        return callback(exception);
      }
    }
  };

  Login.prototype.submit = function() {
    return http.post('user/login', {
      username: this.$username.value,
      password: this.$password.value
    });
  };

  return Login;

})(Html);

Logout = (function(_super) {
  __extends(Logout, _super);

  Logout.prototype.element = Logout.create('a', {
    "class": 'logout'
  }, 'sign out');

  function Logout() {
    Logout.__super__.constructor.apply(this, arguments);
    this.element.onclick = this.onclick(function*() {
      (yield* http.post('user/logout'));
      return document.location.reload();
    });
  }

  return Logout;

})(Html);

File = (function(_super) {
  __extends(File, _super);

  File.prototype.element = File.create('file', '<label></label>');

  File.prototype.map = {
    label: 'label'
  };

  File.properties({
    path: {
      get: function() {
        return this.parent.path + "/" + this.name;
      }
    }
  });

  function File(_at__id, _at_parent, _at_name, _at_mime) {
    var _ref;
    this._id = _at__id;
    this.parent = _at_parent;
    this.name = _at_name;
    this.mime = _at_mime;
    _ref = this.mime.split('/'), this.type = _ref[0], this.extension = _ref[1];
    File.__super__.constructor.call(this, this.clone);
    this.label.innerHTML = this.name;
    this.element.setAttribute('mime', this.mime);
    this.element.onclick = this.onclick(function*() {
      var data;
      if (!this.editor) {
        data = (yield* http.post('file/read', {
          path: this.path,
          project_id: this._id
        }));
        this.editor = new this.ide.editors[this.type](this, data);
        this.editor.tab = this.ide.tabview.addTab(this.name, this.editor);
      }
      return this.editor.tab.focus();
    });
  }

  File.prototype.write = function(data) {
    return http.post('file/write', {
      path: this.path,
      project_id: this._id,
      data: data
    });
  };

  return File;

})(Html);

Directory = (function(_super) {
  __extends(Directory, _super);

  Directory.prototype.element = Directory.html('<directory><label></label><div></div></directory>');

  Directory.prototype.map = {
    label: 'label',
    content: 'div'
  };

  Directory.properties({
    path: {
      get: function() {
        return this.parent.path + "/" + this.name;
      }
    }
  });

  function Directory(_at__id, _at_parent, _at_name, hierarchy) {
    var key, value;
    this._id = _at__id;
    this.parent = _at_parent;
    this.name = _at_name;
    Directory.__super__.constructor.call(this, this.clone);
    this.label.innerHTML = this.name;
    for (key in hierarchy) {
      value = hierarchy[key];
      if (typeof value === 'object') {
        this.add(new Directory(this._id, this, key, value));
      } else {
        this.add(new File(this._id, this, key, value));
      }
    }
  }

  Directory.prototype.add = function(object) {
    log('adding', object.element);
    return this.content.appendChild(object.element);
  };

  return Directory;

})(Html);

Project = (function(_super) {
  __extends(Project, _super);

  Project.properties({
    path: {
      get: function() {
        return '';
      }
    }
  });

  Project.prototype.element = Project.html('<directory class="project"><label></label><a class="viewlink">view</a><div></div></directory>');

  Project.prototype.map = {
    label: 'label',
    viewlink: 'a.viewlink',
    content: 'div'
  };

  function Project(_id, name, hierarchy, url) {
    var viewwindow;
    log(arguments);
    Project.__super__.constructor.call(this, _id, void 0, name, hierarchy);
    viewwindow = void 0;
    this.viewlink.onclick = this.onclick(function*() {
      if (!viewwindow || viewwindow.closed) {
        viewwindow = window.open(url, '_blank');
      } else {
        viewwindow.focus();
      }
      (yield* Editor.saveAll());
      return viewwindow.location.reload();
    });
  }

  return Project;

})(Directory);

IDE = (function(_super) {
  __extends(IDE, _super);

  IDE.prototype.editors = {
    text: Editor
  };

  function IDE() {
    var ide;
    IDE.__super__.constructor.apply(this, arguments);
    Html.prototype.ide = ide = this;
    http.post = function*() {
      var exception;
      log("POST", arguments);
      try {
        return (yield* this.constructor.prototype.post.apply(this, arguments));
      } catch (_error) {
        exception = _error;
        if ((exception != null ? exception.status : void 0) === 403) {
          (yield* ide.login.login());
          return (yield* this.post.apply(this, arguments));
        } else {
          throw exception;
        }
      }
    };
  }

  IDE.properties({
    user: {
      set: function(_at__user) {
        this._user = _at__user;
        this.profile.show();
        return this.welcome.innerHTML = this._user.firstname + " " + this._user.lastname;
      },
      get: function() {
        return this._user;
      }
    },
    status: {
      set: function(html) {
        return this.statusbar.innerHTML = html;
      }
    }
  });

  IDE.prototype.element = IDE.html(IDE.create('div', {
    id: 'banner'
  }, '<h1>STBCS TechCloud</h1>', IDE.create('p', {
    id: 'profile',
    hidden: true
  }, 'Welcome <span>Guest</span>.<br/>', Logout.prototype)), IDE.create('div', {
    id: 'main'
  }, Login.prototype, IDE.create('div', {
    id: 'leftnav'
  }, '<hierarchy></hierarchy>'), '<vr></vr>', IDE.create('div', {
    id: 'view'
  }, TabView.prototype.clone)), IDE.create('div', {
    id: 'statusbar'
  }));

  IDE.prototype.map = {
    login: Login.$('#login'),
    logout: Logout.$('a.logout'),
    welcome: '#profile span',
    profile: Html.$('#profile'),
    hierarchy: Html.$('#leftnav hierarchy'),
    tabview: TabView.$('#view div.tabview'),
    statusbar: '#statusbar'
  };

  IDE.prototype.load = function*() {
    var project, projects, _i, _len, _ref, _results;
    _ref = (yield* http.post('')), this.user = _ref.user, projects = _ref.projects;
    this.logout.show();
    this.status = this.constructor.name + " loaded";
    _results = [];
    for (_i = 0, _len = projects.length; _i < _len; _i++) {
      project = projects[_i];
      _results.push(this.loadProject(project));
    }
    return _results;
  };

  IDE.prototype.loadProjects = function(projects) {
    var project, _i, _len, _results;
    this.hierarchy.clear();
    _results = [];
    for (_i = 0, _len = projects.length; _i < _len; _i++) {
      project = projects[_i];
      _results.push(this.loadProject(project));
    }
    return _results;
  };

  IDE.prototype.loadProject = function(_arg) {
    var exception, hierarchy, title, _id;
    _id = _arg._id, title = _arg.title, hierarchy = _arg.hierarchy;
    log('h1', hierarchy);
    try {
      hierarchy = JSON.parse(hierarchy);
    } catch (_error) {
      exception = _error;
      hierarchy = {};
    }
    log('h', typeof hierarchy);
    return this.hierarchy.append(new Project(_id, title, hierarchy, "/view/" + _id + "/index.html"));
  };

  return IDE;

})(Html);

module.exports = {
  IDE: IDE,
  Login: Login,
  Logout: Logout,
  Project: Project,
  Directory: Directory,
  File: File
};

});

//# sourceMappingURL=client.js.map