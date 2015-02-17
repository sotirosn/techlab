log = console.log.bind console,  __filename
{start, WaitAll} = require './routine'

class FileSystem
    fs = require 'fs'

    constructor:(@path = '.')->
    
    stat:(path)->
        if path
            return null unless yield (callback)=> fs.exists "#{@path}/#{path}", callback.bind null, null
            yield (callback)=> fs.stat "#{@path}/#{path}", callback
        else 
            return null unless yield (callback)=> fs.exists @path, callback.bind null, null
            yield (callback)=> fs.stat @path, callback
    
    list:->
        list = yield (callback)=>
            fs.readdir @path, callback

        {wait, all} = new WaitAll.Map
        for name in list
            wait name, @stat name
        yield all
        
    recursive:(routine)->
        {wait, all} = new WaitAll.Map
        for path, stat of yield from @list()
            if stat.isDirectory()
                wait path, (new FileSystem join @path, path).recursive routine
            else wait path, routine @, path, stat
        yield all

    readfile:(path)->
        yield (callback)=> fs.readFile "#{@path}/#{path}", encoding:'utf8', callback
        
    writefile:(path, data)->
        yield (callback)=> fs.writeFile "#{@path}/#{path}", data, encoding:'utf8', callback

isRebuild = process.argv[2] == '-f'
coffee = require 'coffee-script'

{join, dirname, extname, relative, basename} = require 'path'
parsepath = (rootpath, relpath)->
    path = relative rootpath, relpath
    dirpath = dirname path
    extension = extname path
    filename = basename path, extension
    [dirpath, filename, extension]

clientdir = new FileSystem 'client'
src = new FileSystem 'client/src'
lib = new FileSystem 'client/lib'
start do ->
    source = yield from clientdir.stat 'node.coffee'
    target = yield from clientdir.stat 'node.js'
    return if !isRebuild and target?.mtime > source.mtime
        
    sourcecode = yield from clientdir.readfile 'node.coffee'
    targetcode = coffee.compile sourcecode, 
        bare:true,
        filename: "node.coffee"
        sourceMap:true
        generatedFile: "node.js"
        sourceFiles: ["node.coffee"]
    yield from clientdir.writefile "node.js", "#{targetcode.js}\n\n//# sourceMappingURL=node.js.map"
    yield from clientdir.writefile "node.js.map", targetcode.v3SourceMap
    log 'compiled node.js'    

start do ->
    log yield from src.recursive (dir, path, source)->
        [modulepath, modulename, extension] = parsepath src.path, join dir.path, path
        
        if source.isFile() and extension == '.coffee'
            modulepath = join modulepath, modulename        
            sourcepath = "#{modulepath}.coffee"
            targetpath = "#{modulepath}.js"
            target = yield from lib.stat targetpath
            return 'skipped' if !isRebuild and target?.mtime > source.mtime
        
            sourcecode = yield from src.readfile sourcepath 
            targetcode = coffee.compile sourcecode, 
                bare:true,
                filename: sourcepath
                sourceMap:true
                sourceRoot: '/src'
                generatedFile: "#{modulename}.js"
                sourceFiles: [sourcepath]
            yield from lib.writefile targetpath, "Module.register('#{modulepath}', function(module) {var require = module.require, log = module.log; #{targetcode.js}\n});\n\n//# sourceMappingURL=#{modulename}.js.map"
            yield from lib.writefile "#{targetpath}.map", targetcode.v3SourceMap
            return "compiled #{targetpath}"
        'ignored'
        
module.exports = FileSystem

