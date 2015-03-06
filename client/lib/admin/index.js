Module.register('admin/index', function(module) {var require = module.require, log = module.log; var AdminIDE, AssignmentList, Directory, EditTable, Html, IDE, Login, Logout, Project, TabView, UserList, WaitAll, http, ide, ref, ref1, start,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Html = require('html').Html;

EditTable = require('./edittable').EditTable;

ref = require('routine'), start = ref.start, WaitAll = ref.WaitAll;

ref1 = require('../client'), IDE = ref1.IDE, Login = ref1.Login, Logout = ref1.Logout, Directory = ref1.Directory, Project = ref1.Project;

TabView = require('../layout').TabView;

http = require('../http').http;

AssignmentList = (function(superClass) {
  extend(AssignmentList, superClass);

  function AssignmentList() {
    return AssignmentList.__super__.constructor.apply(this, arguments);
  }

  AssignmentList.prototype.element = AssignmentList.create('div', AssignmentList.prototype.clone);

  AssignmentList.prototype.url = 'admin/assignment';

  AssignmentList.ContextMenu = (function(superClass1) {
    extend(ContextMenu, superClass1);

    function ContextMenu() {
      return ContextMenu.__super__.constructor.apply(this, arguments);
    }

    ContextMenu.extend({
      viewprojects: new Array('View Projects', function*() {
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

UserList = (function(superClass) {
  extend(UserList, superClass);

  function UserList() {
    return UserList.__super__.constructor.apply(this, arguments);
  }

  UserList.prototype.element = UserList.create('div', UserList.prototype.clone);

  UserList.prototype.url = 'admin/user';

  UserList.ContextMenu = (function(superClass1) {
    extend(ContextMenu, superClass1);

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

AdminIDE = (function(superClass) {
  extend(AdminIDE, superClass);

  function AdminIDE() {
    return AdminIDE.__super__.constructor.apply(this, arguments);
  }

  AdminIDE.prototype.userlist = new UserList;

  AdminIDE.prototype.assignmentlist = new AssignmentList;

  AdminIDE.Menu = (function(superClass1) {
    extend(Menu, superClass1);

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
    var i, len, project, results;
    this.hierarchy.clear();
    this.hierarchy.append("<h4>" + user.username + "</h4>");
    results = [];
    for (i = 0, len = projects.length; i < len; i++) {
      project = projects[i];
      results.push(this.loadProject(user.username, project._id, project.title, project.hierarchy));
    }
    return results;
  };

  AdminIDE.prototype.loadAssignmentProjects = function(assignment, projects) {
    var i, len, project, results;
    this.hierarchy.clear();
    this.hierarchy.append("<h4>" + assignment.title + "</h4>");
    results = [];
    for (i = 0, len = projects.length; i < len; i++) {
      project = projects[i];
      results.push(this.loadProject(project.username, project._id, project.title, assignment.hierarchy));
    }
    return results;
  };

  return AdminIDE;

})(IDE);

ide = new AdminIDE;

document.body.appendChild(ide.element);

start(ide.load());

});

//# sourceMappingURL=index.js.map