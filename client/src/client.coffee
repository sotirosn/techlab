{Html} = require 'html'
{TabView} = require './layout'
{Editor} = require './editor'
http = require './http'
{start} = require 'routine'

class Login extends Html
    element: @create 'div', id:'signin', hidden:true, '
            <div>
                <h3>Sign In</h3>
                <label>Username:</label><input name="username"/><br/>
                <label>Password:</label><input name="password" type="password"/><br/>
                <button class="blue">Sign In</button>
                <p class="error"></p>
            </div>
        '
    map:
        $username: 'input[name=username]'
        $password: 'input[name=password]'
        $submit: 'button'
        error: 'p.error'
        
    constructor:->
        super
        
    login:->
        try
            @show()
            @ide.user = yield (callback)=>
                @$submit.onclick = => 
                    start @submit(), callback
                @$username.onkeypress = @$password.onkeypress = (event)=>
                    if event.which == 13 then start @submit(), callback
                    else log event
            @hide()
        catch exception
            if exception?.status == 430 then @error.innerHTML = exception
            else callback exception

    submit:->
        http.post 'user/login', 
            username: @$username.value
            password: @$password.value
        
class Logout extends Html
    element: @create 'a', class:'logout', 'sign out'
    constructor:->
        super
        @element.onclick = @onclick ->
            yield from http.post 'user/logout'
            document.location.reload()

class File extends Html
    element: @create 'file', '<label></label>'
    map: 
        label: 'label'
    
    @properties
        path:get:-> "#{@parent.path}/#{@name}"

    constructor:(@_id, @parent, @name, @mime)->
        [@type, @extension] = @mime.split '/'
        
        super @clone
        @label.innerHTML = @name
        @element.setAttribute 'mime', @mime
        @element.onclick = @onclick ->
            unless @editor
                data = yield from http.post 'file/read', {@path, project_id:@_id}
                @editor = new @ide.editors[@type] this, data
                @editor.tab = @ide.tabview.addTab @name, @editor
            @editor.tab.focus()

    write:(data)->
        http.post 'file/write', {@path, project_id:@_id, data}
        
class Directory extends Html
    element: @html '<directory><label></label><div></div></directory>'
    map:
        label: 'label'
        content: 'div'
    
    @properties
        path:get:-> "#{@parent.path}/#{@name}"
    
    constructor:(@_id, @parent, @name, hierarchy)->
        super @clone
        @label.innerHTML = @name
        for key, value of hierarchy
            if typeof value == 'object'
                @add new Directory @_id, this, key, value
            else
                @add new File @_id, this, key, value
    
    add:(object)->
        log 'adding', object.element
        @content.appendChild object.element

class Project extends Directory
    @properties
        path:get:-> ''
        
    element: @html '<directory class="project"><label></label><a class="viewlink">view</a><div></div></directory>'
    map:
        label: 'label'
        viewlink: 'a.viewlink'
        content: 'div'
    
    constructor:({_id, title, hierarchy}, url)->
        try hierarchy = JSON.parse hierarchy
        catch e then hierarchy = {}

        super _id, undefined, title, hierarchy
        viewwindow = undefined
        @viewlink.onclick = @onclick ->
            # must create window before yielding otherwise browser will block it as a pop-up
            if !viewwindow || viewwindow.closed then viewwindow = window.open url, '_blank'
            else viewwindow.focus()
            
            # if any saves are made then reload the view window
            yield from Editor.saveAll()
            viewwindow.location.reload()
     
class IDE extends Html
    editors:
        text: Editor

    constructor:->
        super
        Html::ide = ide = this
        http.post = ->
            log "POST", arguments
            try yield from @constructor::post.apply @, arguments
            catch exception
                if exception?.status == 403
                    yield from ide.login.login()
                    yield from @post arguments...
                else throw exception

    @properties
        user:
            set:(@_user)-> 
                @profile.show()
                @welcome.innerHTML = "#{@_user.firstname} #{@_user.lastname}"
            get:-> @_user
        status:
            set:(html)-> @statusbar.innerHTML = html
    
    element: @html(
        @create 'div', id:'banner',
            '<h1>STBCS TechCloud</h1> <a href="/~instructor/Resources/html.html" target="_blank"><img src="html-icon.png"/></a></h1>'
            @create 'p', {id:'profile', hidden:true},
                'Welcome <span>Guest</span>.<br/>',
                Logout::
        @create 'div', id:'main',
            Login::
            @create 'div', id:'leftnav',
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
        hierarchy: Html.$ '#leftnav hierarchy'
        tabview: TabView.$ '#view div.tabview'
        statusbar: '#statusbar'
    
    load:->
        {@user, projects} = yield from http.post ''
        @logout.show()
        #@navmenu.load assignments
        @status = "#{@constructor.name} loaded"
        for project in projects
            @loadProject @user.username, project.title, project 
        
    loadProject:(username, title, project)->
        @hierarchy.append new Project project, "/~#{username}/#{title}/index.html"

module.exports = {IDE, Login, Logout, Project, Directory, File}
