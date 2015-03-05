{Html} = require 'html'
{EditTable} = require './edittable'
{start, WaitAll} = require 'routine'
{IDE, Login, Logout, Directory, Project} = require '../client'
{TabView} = require '../layout'
http = require '../http'

class AssignmentList extends EditTable
    element: @create 'div', @::clone
    url: 'admin/assignment'

    class @ContextMenu extends EditTable.ContextMenu
        @extend
            viewprojects: new Array 'View Projects', ->
                @ide.loadAssignmentProjects @data, yield from http.post "#{@url}/projectlist", {_id:@data._id}
    
    @define
        title: 'Title'
        grade: 'Grade'
        points: 'Points'
        hierarchy: 'Hierarchy'

    load:->
        yield from super
        @tab ?= ide.tabview.addTab 'Assignments', this
        @tab.focus()

class UserList extends EditTable
    element: @create 'div', @::clone
    url: 'admin/user'
    
    class @ContextMenu extends EditTable.ContextMenu
        @extend
            viewpropjects: new Array 'View Projects', ->
                @ide.loadUserProjects @data, yield from http.post "#{@url}/projectlist", {_id:@data._id}
    
    @define
        firstname: 'Firstname'
        lastname: 'Lastname'
        grade: 'Grade'
        username: 'Username'
        password: 'Password'

    load:->
        yield from super
        @tab ?= ide.tabview.addTab 'Students', this
        @tab.focus()

class AdminIDE extends IDE
    userlist: new UserList
    assignmentlist: new AssignmentList

    class @Menu extends Html
        element: @create 'ul', '<li>Users</li><li>Assignments</li>'
        map:
            userlistlink: 'li:nth-of-type(1)'
            assignmentlistlink: 'li:nth-of-type(2)'
            
        constructor:->
            super
            @userlistlink.onclick = @onclick ->
                yield from ide.userlist.load()
            @assignmentlistlink.onclick = @onclick ->
                yield from ide.assignmentlist.load()
                
        load:->

    element: @html(
        @create 'div', id:'banner',
            '<h1>STBCS TechCloud</h1>'
            @create 'p', {id:'profile', hidden:true},
                'Welcome <span>Guest</span>.<br/>',
                Logout::
        @create 'div', id:'main',
            Login::
            @create 'div', id:'leftnav',
                @Menu::
                '<hierarchy></hierarchy>'
            '<vr></vr>'
            @create 'div', id:'view',
                TabView::clone
        @create 'div', id:'statusbar'
    )
            
    map:
        login: Login.$ '#login'
        logout: Logout.$ 'a.logout'
        welcome: '#profile span'
        profile: Html.$ '#profile'
        navmenu: @Menu.$ '#leftnav ul'
        hierarchy: Html.$ '#leftnav hierarchy'
        tabview: TabView.$ '#view div.tabview'
        statusbar: '#statusbar'
    
    loadUserProjects:(user, projects)->
        @hierarchy.clear()
        @hierarchy.append "<h4>#{user.username}</h4>"
        for project in projects
            @loadProject( 
                user.username,
                project._id,
                project.title,
                project.hierarchy
            )
    loadAssignmentProjects:(assignment, projects)->
        @hierarchy.clear()
        @hierarchy.append "<h4>#{assignment.title}</h4>"
        for project in projects
            @loadProject(
                project.username,
                project._id,
                project.username,
                assignment.hierarchy
            )

ide = new AdminIDE
document.body.appendChild ide.element
start ide.load()
