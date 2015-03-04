Module.register('client', function(module) {var require = module.require, log = module.log; var Directory, Editor, File, Html, IDE, Login, Logout, Project, TabView, http, start,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Html = require('html').Html;

TabView = require('./layout').TabView;

Editor = require('./editor').Editor;

http = require('./http');

start = require('routine').start;

Login = (function(superClass) {
  extend(Login, superClass);

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

Logout = (function(superClass) {
  extend(Logout, superClass);

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

File = (function(superClass) {
  extend(File, superClass);

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

  function File(_id1, parent, name, mime) {
    var ref;
    this._id = _id1;
    this.parent = parent;
    this.name = name;
    this.mime = mime;
    ref = this.mime.split('/'), this.type = ref[0], this.extension = ref[1];
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

Directory = (function(superClass) {
  extend(Directory, superClass);

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

  function Directory(_id1, parent, name, hierarchy) {
    var key, value;
    this._id = _id1;
    this.parent = parent;
    this.name = name;
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

Project = (function(superClass) {
  extend(Project, superClass);

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

  function Project(arg, url) {
    var _id, e, hierarchy, title, viewwindow;
    _id = arg._id, title = arg.title, hierarchy = arg.hierarchy;
    try {
      hierarchy = JSON.parse(hierarchy);
    } catch (_error) {
      e = _error;
      hierarchy = {};
    }
    Project.__super__.constructor.call(this, _id, void 0, title, hierarchy);
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

IDE = (function(superClass) {
  extend(IDE, superClass);

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
      set: function(_user) {
        this._user = _user;
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
  }, '<h1>STBCS TechCloud</h1> <a href="/~instructor/Resources/html.html" target="_blank"><img src="html-icon.png"/></a></h1>', IDE.create('p', {
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
    var i, len, project, projects, ref, results;
    ref = (yield* http.post('')), this.user = ref.user, projects = ref.projects;
    this.logout.show();
    this.status = this.constructor.name + " loaded";
    results = [];
    for (i = 0, len = projects.length; i < len; i++) {
      project = projects[i];
      results.push(this.loadProject(this.user.username, project.title, project));
    }
    return results;
  };

  IDE.prototype.loadProject = function(username, title, project) {
    return this.hierarchy.append(new Project(project, "/~" + username + "/" + title + "/index.html"));
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