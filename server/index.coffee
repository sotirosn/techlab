log = (require './log') __filename
{Database, query} = require './database'
{start, WaitAll} = require './routine'
{Server, RequestError, route} = require './server'
ObjectId = (require 'mongoose').Schema.Types.ObjectId
{resolve} = require 'path'
uuid = require 'uuid'
fs = require 'fs'

db = new Database 
    uri: 'mongodb://localhost/techlab'

User = Database.define 'User',
    sid: String
    firstname: String
    lastname: String
    username: String
    password: String
    grade: String
    lastlogin: Date

Assignment = Database.define 'Assignment',
    dateAssigned: Date
    dateDue: Date
    title: String
    grade: String
    points: Number
    hierarchy: String
    url: String

Project = Database.define 'Project',
    assignment_id: {type: ObjectId, ref:'Assignment'}
    user_id: [{type: ObjectId, ref:'User'}]
    points: Number

File = Database.define 'File',
    project_id: {type: ObjectId, ref:'Project'}
    type: String
    path: String
    data: String

log 'config:', config = JSON.parse fs.readFileSync (process.argv[2] || 'config.json'), encoding:'utf8'
ssl =
    key: fs.readFileSync config.keypath, encoding:'utf8'
    cert: fs.readFileSync config.certpath, encoding: 'utf8'

webserver = new Server
    host: config.host
    port: config.webport

clientserver = new Server
    host: config.host
    port: config.clientport
    key: ssl.key
    cert: ssl.cert

appserver = new Server
    host: config.host
    port: config.appport
    key: ssl.key
    cert: ssl.cert


SID = 0
sessions = {}
authorize = (request, isAdmin)->
    user = sessions[request.cookies.sid]
    throw new RequestError 403, 'invalid session' unless user
    throw new RequestError 403, 'invalid administrator' if isAdmin and user.grade != 'administrator'
    user

webserver.router
    .use (request, response, next)->
        response.setHeader 'Access-Control-Allow-Origin', 'https://localhost:8080'
        next()
    
    .get '/', (request, response)->
        response.setHeader 'Location', "https://#{config.hostname}:#{clientserver.port}/"
        response.status(301).send "This site must be accessed over a secure link, <a href=\"https://#{config.hostname}:#{clientserver.port}\">secure site</a>."

    .get '/:username/:title*', (request, response, next)->
        {username, title} = request.params
        path = request.params[0] || "/index.html"
        
        start do ->
            try
                user = yield from User.findOne {username}, {grade:true}
                assignment = yield from Assignment.findOne {grade:user.grade, title}
                project = yield from Project.findOne {user_id:user._id, assignment_id:assignment._id}
                file = yield from File.findOne {project_id:project._id, path}
                return if file
                    response.setHeader 'Content-Type', 'text/html' #file.meta
                    response.send file.data
            catch exception then return next exception unless exception instanceof TypeError
            response.sendFile resolve 'client', '404.html'

clientserver.router            
    .get '/', (request, response)->
        response.sendFile resolve 'client', 'index.html'
        
    .get '/admin', (request, response)->
        response.sendFile resolve 'client/admin/index.html'

    .get '/http.js', (request, response)->
        response.setHeader 'Content-Type', 'text/javascript'
        response.send "
            Module.register('http', function(module) {\n
                \tvar require = module.require, log = module.log;\n
                \tvar Http = require('http');\n
                \tmodule.exports = {\n
                    \t\thttp: new Http('https://#{config.hostname}:#{config.appport}'),\n
                    \t\twebhost: 'http://#{config.hostname}'\n
                \t};
                \tmodule.log('here', module.exports.url);\n
            });"
    
    .get '/*', (request, response)->
        try response.sendFile resolve 'client', request.params[0]
        catch error then response.send 404, '<h1>Page not found</h1>'

appserver.router
    .use (request, response, next)->
        response.setHeader 'Access-Control-Allow-Origin', request.headers.origin
        response.setHeader 'Access-Control-Allow-Credentials', true
        next()

    .post '/', route (request)->
        user = authorize request
        results = yield query Project.model.find({user_id:user._id}, user_id:false).populate('assignment_id', hierarchy:true, title:true)
        
        projects = []
        for project in results
            projects.push
                _id: project._id
                title: project.assignment_id.title
                hierarchy: project.assignment_id.hierarchy
        {user, projects}
        
    .post '/user/logout', (request, response)->
        delete sessions[request.cookies.sid]
        response.json 'OK'
    
    .post '/user/login', route (request, response)->
        {username, password} = yield from request.json
        user = yield from User.findOne {username, password}, password:false
        throw new RequestError 430, 'Invalid user sign in.' unless user
        
        delete sessions[user.sid]
        sid = uuid.v4()
        yield from User.update {_id:user._id}, $set:{sid, lastlogin:Date.now()}
        response.cookies = {sid, path:'/'}
        sessions[sid] = user       
 
    .post '/file/read', route (request)->
        user = authorize request
        {project_id, path} = yield from request.json
            
        #throw 'invalid project' unless user.grade == 'administrator' || yield from Project.findOne {_id:project_id, user_id:user._id}
        
        file = yield from File.findOne {project_id:project_id, path}
        file?.data || ''
        
    .post '/file/write', route (request)->
        user = authorize request
        {project_id, path, data} = yield from request.json
        
        throw new Error 'invalid project' unless project_id && (user.grade == 'administrator' || yield from Project.findOne {_id:project_id, user_id:user._id})
        
        yield from File.update {project_id, path}, {$set:{data}}, upsert:true
        'file written'
        
    .post '/admin/user/list', route (request)->
        authorize request, true
        yield from User.find()

    .post '/admin/user/update', route (request)->
        authorize request, true
        ids = for {_id, firstname, lastname, username, password, grade} in yield from request.json
            if _id
                yield from User.update {_id}, $set:{firstname, lastname, username, password, grade}
            else
                [{_id}] = yield from User.insert {firstname, lastname, username, password, grade}
                {wait, all} = new WaitAll
                for assignment in yield from Assignment.find {grade}
                    wait Project.insert user_id:[_id], assignment_id:assignment._id
                yield all
            _id
        ["#{ids.length} users updated", ids]
    
    .post '/admin/user/remove', route (request)->
        authorize request, true
        {_id} = yield from request.json
        yield from User.remove {_id}
        for project in yield from Project.find {user_id:_id}
            yield from File.remove {project_id:project._id}
        yield from Project.remove {user_id:_id}
        "user removed [id=#{_id}]"

    .post '/admin/user/projectlist', route (request)->
        authorize request, true
        log {_id} = yield from request.json
        for project in yield query Project.model.find({user_id:_id}, {user_id:false}).populate 'assignment_id'
            {
                _id: project._id
                title: project.assignment_id.title
                hierarchy: project.assignment_id.hierarchy
            }
    
    .post '/admin/assignment/list', route (request)->
        authorize request, true
        yield from Assignment.find {}
    
    .post '/admin/assignment/update', route (request)->
        authorize request, true
        ids = for {_id, title, grade, points, hierarchy} in yield from request.json
            for key, value of hierarchy
                unless key.indexOf('.') == -1
                    delete hierarchy[key]
                    hierarchy[key.replace '.', '\uff0e'] = value
               
            if _id
                yield from Assignment.update {_id}, $set:{title, grade, points, hierarchy}
            else
                [{_id}] = yield from Assignment.insert {title, grade, points, hierarchy}
                if title[0] == '$'
                    users = yield from User.find {grade}
                    yield from Project.insert user_id:users, assignment_id:_id
                    admins = yield from User.find {grade:'administrator'}
                    yield from Project.insert user_id:admins, assignment_id:_id
                else
                    {wait, all} = new WaitAll
                    for user in yield from User.find {grade}
                        wait Project.insert user_id:[user._id], assignment_id:_id
                    yield all
            _id
        ["#{ids.length} assignments updated", ids]
            
    .post '/admin/assignment/remove', route (request)->
        authorize request, true
        {_id} = yield from request.json
        yield from Assignment.remove {_id}
        for project in yield from Project.find {assignment_id:_id}
            yield from File.remove {project_id:project._id}
        yield from Project.remove {assignment_id:_id}
        "assignment removed [id=#{_id}]"
        
    .post '/admin/assignment/projectlist', route (request)->
        authorize request, true
        {_id} = yield from request.json
        for project in yield query Project.model.find({assignment_id:_id}, {assignment_id:false}).populate('user_id', username:true)
            {
                _id: project._id
                username: project.user_id[0].username
            }
    
start do ->
    {wait, all} = new WaitAll.Map
    wait 'webserver', webserver.listen()
    wait 'clientserver', clientserver.listen()
    wait 'appserver', appserver.listen()
    wait 'database', db.connect()
    log yield all

    unless (yield from User.findOne username:'administrator')?
        yield from User.insert
            username: 'administrator'
            password: 'admin!1'
            grade: 'administrator'
