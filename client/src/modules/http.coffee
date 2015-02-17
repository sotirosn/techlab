class Http
    class @Error extends Error
        name: 'HttpError'
        constructor:(@status, @message)->

    constructor:(@url)->
    post:(path, data = {})->
        request = new XMLHttpRequest 
        request.open 'POST', "#{@url}/#{path}"
        request.withCredentials = true
        request.send JSON.stringify data
        
        yield (callback)->
            request.onreadystatechange = ->
                if @readyState == 4
                    if @status == 200
                        callback null, JSON.parse @responseText
                    else
                        callback new Http.Error @status, @responseText

module.exports = Http
