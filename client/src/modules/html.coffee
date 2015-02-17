{start} = require 'routine'
$ = document.querySelector.bind document
$$ = document.querySelectorAll.bind document

Object.clone = (object)->
    result = {}
    for key, value of object
        result[key] = value
    result

class Html
    @$:(query)-> 
        [@, query]

    @properties:(properties)->
        Object.defineProperties @::, properties

    @properties
        clone:get:-> @element.cloneNode true

    bind:(routine)->
        routine.bind @

    onclick:(routine)->
        (event)=>
            start routine.apply @, arguments
            event.stopPropagation()
            event.preventDefault()
            false

    constructor:(element)->
        @element = element || @element
        for key, value of @map
            @[key] = if value instanceof Array
                log @element
                log [Type, querystring] = value
                log @element.querySelector querystring
                new Type @element.querySelector querystring
            else
                @element.querySelector value
    
    clear:->
        @element.innerHTML = ''

    insert:(children...)->
        @element.insertBefore (Html.html children...), @element.firstChild

    append:(children...)->
        @element.appendChild Html.html children...

    remove:->
        @element.parentNode.removeChild @element

    hide:->
        @element.setAttribute 'hidden', true
    
    show:->
        @element.removeAttribute 'hidden'
    
    close:->
        delete @tab
        yield return
    
    div = document.createElement 'div'
    @parse:(html)->
        fragment = document.createDocumentFragment()
        div.innerHTML = html
        while div.childNodes.length
            fragment.appendChild div.firstChild
        fragment
            
    @html:(children...)->
        fragment = document.createDocumentFragment()
        for child in children
            fragment.appendChild if child.element instanceof Node then child.element
            else if child instanceof Node then child
            else if typeof child == 'string' then @parse child
            else throw new TypeError "cannot convert #{child?.constructor.name} to html"
        fragment
        
    @create:(tagname, children...)->
        element = document.createElement tagname
        attributes = if children[0]?.constructor == Object then children.splice(0,1)[0] else {}
        for key, value of attributes
            element.setAttribute key, value
        element.appendChild @html children...
        element

class Html.ContextMenu extends Html
    @define:(menuItems)->
        @::menuItems = menuItems
        @::element = @create 'div', class:'contextmenu', hidden:true
        @::map = {}
        @i = 1
        for key, [label, routine] of menuItems
            log 'context', key, label
            @::element.appendChild @create 'label', label
            @::map[key] = "label:nth-of-type(#{@i++})"
            log @::map
        log 'define', @::menuItems
        log 'define', @::map
    
    @extend:(menuItems)->
        @::element = @::clone
        @::menuItems = Object.clone @::menuItems
        @::map = Object.clone @::map
        for key, [label, routine] of menuItems
            @::element.appendChild @create 'label', label
            @::map[key] = "label:nth-of-type(#{@i++})"
            @::menuItems[key] = [label, routine]
    
    constructor:->
        super @clone
        for key, [label, _routine] of @menuItems
            do (routine = _routine)=>
                @[key].onclick = @onclick ->
                    @hide()
                    yield from routine.call @target
        document.body.appendChild @element
        
    display:(event, @target)->
        @element.style.left = event.clientX || event.x
        @element.style.top = event.clientY || event.y
        @show()
        event.stopPropagation()
        event.preventDefault()
        false
        
class Html.List extends Html
    class @::Element extends Html
        element: @create 'li'
        
        constructor:(text)->
            super @clone
            @element.innerHTML = text
    
    element: @html '<ul></ul>'
    
    map: content: Html.$ 'ul'
    
    load:(datas)->
        @content.clear()
        for data in datas
            @add data
            
    add:(data)->
        @content.append new @Element data

class Html.Table extends Html.List
    @define:(fields)->
        @::fields = fields
        @::element = @html '<a>create</a> | <a>save</a> | <a>revert</a><br/><table><thead></thead><tbody></tbody></table><div></div>'
        @::map =
            head: Html.$ 'thead'
            body: Html.$ 'tbody'
            createlink: 'a:nth-of-type(1)'
            savelink: 'a:nth-of-type(2)'
            revertlink: 'a:nth-of-type(3)'
        
        map = {}
        trhead = @create 'tr' 
        trbody = @create 'tr'
        
        i = 1
        for key, value of fields
            trhead.appendChild @create 'td', value
            trbody.appendChild @create 'td', '<input/>'
            map[key] = "td:nth-child(#{i++}) input"
        @::trhead = trhead
        container = @
        
        class @::Element extends Html
            element: trbody
            map: map
            fields: fields
            container: container
            
            @properties
                modified:set:(value)->
                    if value then @element.setAttribute 'modified', true
                    else @element.removeAttribute 'modified'
            
            constructor:(data)->
                super @clone
                for key of fields
                    @[key].value = data[key] || ''
                    @[key].onchange = =>
                        @container.modify this
                    
    update:->
        for element in @modified
            element.modified = false
                    
    modify:(element)->
        @modified.push element
        element.modified = true
            
    constructor:(element)->
        super element || @clone
        log 'new table', element
        
        @header.append new @Element @fields
        @savelink.onclick = @onclick @update
        @modified = []
        
class Html.View extends Html
    @define:(fields)->
        @::fields = fields
        @::element = @create 'div', class:'view'        
        @::map = {}
        
        for key, [name, input] of fields
            element.appendChild @html '<label>#{name}</label>', input, '<br/>'
            map[key] = Html.$ "[name=#{name}]"

    load:(data)->
        for key of @fields
            @[key].value = data[key]

module.exports = {Html, $, $$}