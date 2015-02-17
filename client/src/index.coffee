{Html, $} = require 'html'
{start, WaitAll} = require 'routine'
{IDE, Directory} = require './client'
http = require './http'

class ClientIDE extends IDE
    class @Menu extends Html.List
        element: @create 'div', class:'navmenu', '<h3>Assignments</h3><ul></ul>'
        
        class @::Element extends Html.List::Element
            constructor:({title, _id})->
                super title
                @element.onclick = @onclick ->
                    @ide.hierarchy.clear()
                    @ide.loadProject yield from http.post 'assignment/get', {_id}
    
ide = new ClientIDE 
document.body.appendChild ide.element
start ide.load()
