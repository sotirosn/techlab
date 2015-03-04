{start, WaitAll} = require 'routine'
{Html} = require 'html'

Array::remove = (element)->
    index = @indexOf element
    if index >= 0 then @splice index, 1
    index

class Editor extends Html
    @saveAll:->
        {wait, all} = new WaitAll
        for editor in @::editors
            if editor.saving then wait editor.save()
        yield all

    editors:[]

    modes:
        html: 'htmlmixed'
        css: 'css'
        javascript: 'javascript'
        coffee: 'coffeescript'

    constructor:(@file, data)->
        @editors.push this
        @editor = new CodeMirror ((@element)=>),
            mode: @modes[@file.extension]
            lineNumbers: true
            indentUnit: 4
            value: data
            extraKeys:
                Tab: CodeMirror.commands.indentMore
                'Shift-Tab': CodeMirror.commands.indentLess
            readOnly: @file.project.readonly                

        @editor.on 'change', @autosave.bind @    
    
    autosaveDelay: 30000
    autosave:->
        unless @saving
            @tab.label = @file.name + "*"
            log 'saving', @saving = setTimeout (=> start @save()), @autosaveDelay
    
    save:->
        clearTimeout @saving
        try @ide.status = yield from @file.write @editor.getValue()
        catch exception
            @ide.status = exception
            throw exception
        delete @saving
        @tab.label = @file.name
    
    hide:->
        @element.setAttribute 'hidden', true
        
    show:->
        @element.removeAttribute 'hidden'
        @editor.refresh()
        @editor.focus()
        
    close:->
        yield from @save() if @saving
        @editors.remove this
        delete @file.editor
        
module.exports = {Editor}

