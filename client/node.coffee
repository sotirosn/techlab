log = console.log.bind console, 'Module:'

class Directory
    constructor:(@parent, @path)->
        #log 'new directory:', @path
        @contents = {}

class Module
    class @Error extends Error
        name: 'ModuleError'
        constructor:(@message)->

    @directory: new Directory undefined, '.'
    @modules: @directory.contents.modules = new Directory undefined, '/'

    @register:(path, callback)->
        #log 'register:', path
        [dirpath..., modulename] = path.split '/'
        
        directory = @directory
        throw new Module.Error "bad module path dir: #{path}" unless directory instanceof Directory
        for dirname in dirpath
            directory = (directory.contents[dirname]) || (directory.contents[dirname] = new Directory directory, dirpath)
            throw new Module.Error "bad module path dir: #{path}" unless directory instanceof Directory
        directory.contents[modulename] = new Module path, directory, callback
        
    @require:(path)->
        #log @path, 'require:', path
        [dirpath..., modulename] = path.split '/'
        
        directory = switch dirpath[0]
            when '.' then @directory
            when '..' then @directory
            else Module.modules
            
        for dirname in dirpath
            if dirname == '..'
                directory = directory.parent
            else if dirname != '.'
                directory = directory.contents[dirname]
            throw new Module.Error "bad module path dir: #{path}" unless directory instanceof Directory
        module = directory.contents[modulename]
        throw new Module.Error "bad module path name: #{path}" unless module instanceof Module
         
        module.initialize() unless module.initialized
        module.exports

    constructor:(@path, @directory, @module)->
        #log 'new module:', @path
        @require = @require.bind @
        @log = console.log.bind console, "#{@path}:"
    
    require: @require
    
    initialize:->
        #log 'initialize:', @path
        @initialized = true
        @module.call null, this
        