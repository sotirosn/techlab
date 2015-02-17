{Html} = require 'html'

class TabView extends Html
    class Tab extends Html
        element: @create 'div', class:'tab', '<label></label><button class="close"></button>'
        map:
            $label: 'label'
            $close: 'button.close'
        
        @properties
            label:set:(label)->
                @$label.innerHTML = label
        
        constructor:(@container, label, @content)->
            super @clone
            @$label.innerHTML = label
            @$close.onclick = @onclick @close
            @element.onclick = @focus.bind @
            
        close:->
            yield from @content.close()
            @container.removeTab this
            
        focus:->
            @container.focusTab this
            @content.show()
            @element.setAttribute 'active', true
                
        blur:->
            @element.removeAttribute 'active'
            @content.hide()
    
    element: @create 'div', class:'tabview', '<div class="tabs"></div><div class="views"></div>'
    map:
        $tabs: 'div.tabs'
        $views: 'div.views'
    
    constructor:(element)->
        super element || @clone
        @tabs = []
    
    addTab:(label, view)->
        log this
        tab = new Tab this, label, view
        @tabs.push tab
        @$tabs.appendChild tab.element
        @$views.appendChild tab.content.element
        tab

    removeTab:(tab)->
        index = @tabs.remove tab
        if @active == tab 
            if @tabs.length then @tabs[if @tabs.length == index then index-1 else index].focus()
            else delete @active
        @$tabs.removeChild tab.element
        @$views.removeChild tab.content.element

    focusTab:(tab)->
        return if @active == tab
        @active?.blur()
        @active = tab
    
    closeAllTabs:->
        {wait, all} = new WaitAll
        for tab in @tabs
            wait tab.close()
        yield all

module.exports = {TabView}
