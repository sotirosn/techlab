_callback = (error, data)->
    if error
        console.error error.stack
        setTimeout (-> throw error), 0 

start = (routine, callback = _callback, error, data)->
    try
        {done, value} = if error then routine.throw error else routine.next data
        unless done then value (error, data)->
            start routine, callback, error, data
        else callback null, value
    catch exception then callback exception

class WaitAll
    constructor:->
        @wait = @wait.bind @
        @all = @all.bind @
        @routines = []
        
    wait:(routine)->
        @routines.push routine
    
    all:(callback)->
        callback null unless count = @routines.length
        errors = []
        results = []
        
        for routine in @routines
            start routine, (error, data)->
                if error then errors.push error
                if data? then results.push data
                if --count == 0 then callback (if errors.length then errors else null), results
        
class WaitAll.Map
    constructor:->
        @wait = @wait.bind @
        @all = @all.bind @
        @routines = {}
        
    wait:(key, routine)->
        @routines[key] = routine
    
    all:(callback)->
        callback null unless count = Object.keys(@routines).length
        errors = {}
        results = {}
        
        for _key, routine of @routines
            do (key = _key)->
                start routine, (error, data)->
                    if error then errors[key] = error
                    results[key] = data
                    if --count == 0 then callback (if Object.keys(errors).length then errors else null), results

sleep = (duration)->
    yield (callback)-> setTimout (callback.bind null, null), duration

module.exports = {start, sleep, WaitAll}