Module.register('admin/index', function(module) {var require = module.require, log = module.log; var AdminIDE, AssignmentList, Directory, EditTable, Html, IDE, Login, Logout, Project, TabView, UserList, WaitAll, http, ide, start, _ref, _ref1,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

Html = require('html').Html;

EditTable = require('./edittable').EditTable;

_ref = require('routine'), start = _ref.start, WaitAll = _ref.WaitAll;

_ref1 = require('../client'), IDE = _ref1.IDE, Login = _ref1.Login, Logout = _ref1.Logout, Directory = _ref1.Directory, Project = _ref1.Project;

TabView = require('../layout').TabView;

http = require('../http');

AssignmentList = (function(_super) {
  __extends(AssignmentList, _super);

  function AssignmentList() {
    return AssignmentList.__super__.constructor.apply(this, arguments);
  }

  AssignmentList.prototype.element = AssignmentList.create('div', AssignmentList.prototype.clone);

  AssignmentList.prototype.url = 'admin/assignment';

  AssignmentList.ContextMenu = (function(_super1) {
    __extends(ContextMenu, _super1);

    function ContextMenu() {
      return ContextMenu.__super__.constructor.apply(this, arguments);
    }

    ContextMenu.extend({
      viewprojects: new Array('View Projects', function*() {
        log('contextmenu clicked');
        return this.ide.loadAssignmentProjects(this.data, (yield* http.post(this.url + "/projectlist", {
          _id: this.data._id
        })));
      })
    });

    return ContextMenu;

  })(EditTable.ContextMenu);

  AssignmentList.define({
    title: 'Title',
    grade: 'Grade',
    points: 'Points',
    hierarchy: 'Hierarchy'
  });

  AssignmentList.prototype.load = function*() {
    (yield* AssignmentList.__super__.load.apply(this, arguments));
    if (this.tab == null) {
      this.tab = ide.tabview.addTab('Assignments', this);
    }
    return this.tab.focus();
  };

  return AssignmentList;

})(EditTable);

UserList = (function(_super) {
  __extends(UserList, _super);

  function UserList() {
    return UserList.__super__.constructor.apply(this, arguments);
  }

  UserList.prototype.element = UserList.create('div', UserList.prototype.clone);

  UserList.prototype.url = 'admin/user';

  UserList.ContextMenu = (function(_super1) {
    __extends(ContextMenu, _super1);

    function ContextMenu() {
      return ContextMenu.__super__.constructor.apply(this, arguments);
    }

    ContextMenu.extend({
      viewpropjects: new Array('View Projects', function*() {
        return this.ide.loadUserProjects(this.data, (yield* http.post(this.url + "/projectlist", {
          _id: this.data._id
        })));
      })
    });

    return ContextMenu;

  })(EditTable.ContextMenu);

  UserList.define({
    firstname: 'Firstname',
    lastname: 'Lastname',
    grade: 'Grade',
    username: 'Username',
    password: 'Password'
  });

  UserList.prototype.load = function*() {
    (yield* UserList.__super__.load.apply(this, arguments));
    if (this.tab == null) {
      this.tab = ide.tabview.addTab('Students', this);
    }
    return this.tab.focus();
  };

  return UserList;

})(EditTable);

AdminIDE = (function(_super) {
  __extends(AdminIDE, _super);

  function AdminIDE() {
    return AdminIDE.__super__.constructor.apply(this, arguments);
  }

  AdminIDE.prototype.userlist = new UserList;

  AdminIDE.prototype.assignmentlist = new AssignmentList;

  AdminIDE.Menu = (function(_super1) {
    __extends(Menu, _super1);

    Menu.prototype.element = Menu.create('ul', '<li>Users</li><li>Assignments</li>');

    Menu.prototype.map = {
      userlistlink: 'li:nth-of-type(1)',
      assignmentlistlink: 'li:nth-of-type(2)'
    };

    function Menu() {
      Menu.__super__.constructor.apply(this, arguments);
      this.userlistlink.onclick = this.onclick(function*() {
        return (yield* ide.userlist.load());
      });
      this.assignmentlistlink.onclick = this.onclick(function*() {
        return (yield* ide.assignmentlist.load());
      });
    }

    Menu.prototype.load = function() {};

    return Menu;

  })(Html);

  AdminIDE.prototype.element = AdminIDE.html(AdminIDE.create('div', {
    id: 'banner'
  }, '<h1>STBCS TechCloud</h1>', AdminIDE.create('p', {
    id: 'profile',
    hidden: true
  }, 'Welcome <span>Guest</span>.<br/>', Logout.prototype)), AdminIDE.create('div', {
    id: 'main'
  }, Login.prototype, AdminIDE.create('div', {
    id: 'leftnav'
  }, AdminIDE.Menu.prototype, '<hierarchy></hierarchy>'), '<vr></vr>', AdminIDE.create('div', {
    id: 'view'
  }, TabView.prototype.clone)), AdminIDE.create('div', {
    id: 'statusbar'
  }));

  AdminIDE.prototype.map = {
    login: Login.$('#login'),
    logout: Logout.$('a.logout'),
    welcome: '#profile span',
    profile: Html.$('#profile'),
    navmenu: AdminIDE.Menu.$('#leftnav ul'),
    hierarchy: Html.$('#leftnav hierarchy'),
    tabview: TabView.$('#view div.tabview'),
    statusbar: '#statusbar'
  };

  AdminIDE.prototype.loadUserProjects = function(user, projects) {
    var project, _i, _len, _results;
    this.hierarchy.clear();
    this.hierarchy.append("<h4>" + user.username + "</h4>");
    _results = [];
    for (_i = 0, _len = projects.length; _i < _len; _i++) {
      project = projects[_i];
      _results.push(this.loadProject({
        _id: project._id,
        title: project.title,
        hierarchy: project.hierarchy
      }));
    }
    return _results;
  };

  AdminIDE.prototype.loadAssignmentProjects = function(assignment, projects) {
    var project, _i, _len, _results;
    this.hierarchy.clear();
    this.hierarchy.append("<h4>" + assignment.title + "</h4>");
    _results = [];
    for (_i = 0, _len = projects.length; _i < _len; _i++) {
      project = projects[_i];
      _results.push(this.loadProject({
        _id: project._id,
        title: project.username,
        hierarchy: assignment.hierarchy
      }));
    }
    return _results;
  };

  return AdminIDE;

})(IDE);

ide = new AdminIDE;

document.body.appendChild(ide.element);

start(ide.load());

});

//# sourceMappingURL=index.js.map