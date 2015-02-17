{Html} = require 'html'
http = require '../http'

class EditTable extends Html
    element: @html '<a>create</a> | <a>save</a> | <a>revert</a><br/><table><thead></thead><tbody></tbody></table><div></div>'
    map:
        head: Html.$ 'thead'
        body: Html.$ 'tbody'
        createlink: 'a:nth-of-type(1)'
        savelink: 'a:nth-of-type(2)'
        revertlink: 'a:nth-of-type(3)'
    
    @define:(fields)->
        log 'define', fields
        @::fields = fields
        @::modifies = []
        Self = @
        element = @create 'tr'
        map = {}
        
        i = 1
        for key of fields
            element.appendChild @create 'td', '<input type="text"/>'
            map[key] = "td:nth-of-type(#{i++}) input"
        
        class @::Row extends @Row
            contextmenu: new Self.ContextMenu
            url: Self::url
            modifies: Self::modifies
            fields: fields
            element: element
            map: map

    class @ContextMenu extends Html.ContextMenu
        @define
            delete: new Array 'Delete', ->
                @ide.status = yield from http.post "#{@url}/remove", {_id:@data._id}
                @remove()
        
    class @Row extends Html
        modifies: []
        fields: {}
        element: @create 'tr'
        map: {}
        
        @properties
            modified:set:(modified)->
                return if @_modified == modified
                if modified
                    @modifies.push this
                    @element.setAttribute 'modified', true
                else
                    @element.removeAttribute 'modified'
                @_modified = modified
            value:get:->
                results = {_id:@data._id}
                for key, value of @fields
                    results[key] = @[key].value
                results
                    
        constructor:(@data)->
            super @clone
            if @data then @revert()
            else
                @data = {}
                @modified = true
            
            @element.onchange = =>
                @modified = true
            @element.oncontextmenu = (event)=>
               @contextmenu.display event, this
    
        revert:->
            for key of @fields
                @[key].value = @data[key] || '' 
            @modified = false
        
        updated:(_id)->
            @data._id = _id
            for key of @fields
                @data[key] = @[key].value 
            @modified = false
        
        remove:->
            @modifies.remove this
            super
        
    constructor:->
        super @clone
        @head.append new @Row @fields
        
        @createlink.onclick = =>
            @body.insert new @Row
        
        @savelink.onclick = @onclick @save
        
        @revertlink.onclick = @onclick ->
            for row in @modifies
                row.revert()
            @modifies.length = 0
    
    save:->
        return unless @modifies.length
        [@ide.status, updated] = yield from http.post "#{@url}/update", @modifies.map (row)-> row.value
        for value, key in updated
            @modifies[key].updated value
        @modifies.length = 0
        
    load:->
        @body.clear()
        for row in yield from http.post "#{@url}/list"
            log 'adding row', row
            @body.append new @Row row
    
    close:->
        if @modifies.length
            if confirm "Would you like to save changes before closing?"
                yield from @save()
        delete @tab
        
module.exports = {EditTable}

