log = (require './log') __filename

class RunTarget
    pm = require 'child_process'
    constructor:(@path, @options)->
    run:(connection)->
        if @process
            @process.stdin.end();
        if @connection
            @connection.sendUTF JSON.stringify info:"process restarted by another connection"
            @connection.close();
        
        @connection = connection
        @process = pm.exec @path, @options
        @connection.on 'message', (data)=>
            #log 'stdin', data.utf8Data
            @process.stdin.write data.utf8Data + '\n'
        @connection.on 'close', =>
            @process?.stdin.end()
            delete @connection
            log 'connection closed'
        @process.stdout.on 'data', (data)=>
            #log 'stdout', data
            @connection.sendUTF JSON.stringify stdout:data
        @process.stderr.on 'data', (data)=>
            #console.error 'stderr', data
            @connection.sendUTF JSON.stringify stderr:data
        @process.on 'close', (exitcode)=>
            @connection?.sendUTF JSON.stringify info:"process terminated with [exitcode=#{exitcode}]"
            @connection?.close()
            log "process [pid=#{@process.pid}] closed"
            delete @process
            
        log "connected to [pid=#{@process.pid}]"

class Server
    http = {IncomingMessage, OutgoingMessage} = require 'http'
    https = require 'https'
    express = require 'express'
    
    Function::defineProperties = (properties)->
        Object.defineProperties @::, properties

    IncomingMessage.defineProperties
        postDataLimit:value: 1e6
        data:get:->
            yield (callback)=>
                data = ''
                @on 'end', onEnd = -> callback null, data
                @on 'data', (chunck)=>
                    if (data += chunck).length > @postDataLimit
                        @removeListener 'end', onEnd
                        callback "POST data limit exceeded!"
                
        json:get:->
            JSON.parse yield from @data
        
        cookies:get:->
            return @_cookies if @_cookies
            @_cookies = {}
            for cookie in (@headers.cookie?.split '; ') || []
                [key, value] = cookie.split '='
                @_cookies[key] = value
            @_cookies
        
    OutgoingMessage.defineProperties    
        cookies:set:(cookies)->
            cookie = ''
            for key, value of cookies
                cookie += "#{key}=#{value}; "
            @setHeader 'Set-Cookie', cookie

    @defineProperties
        url:get:-> "#{@proto}://#{@ip}:#{@port}"

    constructor:({@ip, @port, cert, key})->
        @ip ?= 'localhost'
        @port ?= 80
        @router = express()
        if cert && key
            @server = https.createServer @router, {cert, key} 
            @proto = 'https'
        else
            @server = http.createServer @router
            @proto = 'http'
            
        @router.use (request, response, next)->
            log request.method, request.url
            #log request.headers 
            #log request.cookies
            next()

    listen:->
        yield (callback)=> @server.listen @port, @ip, callback.bind null, null, "listening on #{@url}"
        
class RequestError extends Error
    name: 'RequestError'
    constructor:(@status, @message)->

{start} = require './routine'
route = (routine)->
    (request, response, next)->
        start (routine arguments...), (error, data)->
           return if error
               if error instanceof RequestError then response.status(error.status).send error.toString()
               else console.error error.stack; next 'internal server error'
           response.json data

module.exports = {Server, RequestError, route}