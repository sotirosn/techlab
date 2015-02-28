log = console.log.bind console,  __filename
_callback = (error)->
    (process.nextTick -> throw error) if error

# usage:
# start routine(arg1, arg2, ...)
#
start = (routine, callback = _callback, error, data)->
    try
        {done, value} = if error then routine.throw error else routine.next data
        unless done then value (error, data...)->
            start routine, callback, error, switch data.length
                when 0 then undefined
                when 1 then data[0]
                else data
        else callback null, value
    catch exception then callback exception

# usage:
# start do ->
#   {wait, all} = new WaitAll
#   wait routine1()
#   wait routine2()
#   wait ...
#   yield all
#
class WaitAll
    constructor:->
        @routines = []
        @wait = @wait.bind @
        @all = @all.bind @

    wait:(routine)->
        @routines.push routine
    
    all:(callback)->
        count = @routines.length
        return callback null if count == 0
        log count
        
        errors = []
        results = []
        for routine in @routines
            start routine, (error, data)->
                log arguments
                errors.push error if error
                results.push data
                if --count == 0 then callback (if errors.length then errors else null), results

# usage:
# start do ->
#   {wait, all} = new WaitAll.Map
#   wait key1, routine1()
#   wait key2, routine2()
#   wait ..., ...
#   yield all
#
class WaitAll.Map
    @flatten = (object)->
        value for key, value of object
    @first = (object)->
        object[Object.keys(object)[0]]
    @summarize = (object)->
        count = Object.keys(object).length
        "#{count} error#{if count > 1 then 's' else ''} occured"

    constructor:(@formatErrors = @constructor.first)->
        @routines = {}
        @wait = @wait.bind @
        @all = @all.bind @

    wait:(key, routine)->
        @routines[key] = routine
    
    all:(callback)->
        count = Object.keys(@routines).length
        return callback() if count == 0
        
        errors = {}
        results = {}
        for _key, routine of @routines
            do (key = _key)=>
                start routine, (error, data)=>
                    errors[key] = error if error
                    results[key] = data
                    if --count == 0 
                        if Object.keys(errors).length > 0
                            callback (@formatErrors? errors) || errors
                        else callback null, results
                    
# usage: yield skip message
skip = (message)->
    (callback)-> process.nextTick ->
            log "skip: #{message}"
            callback()

# usage: yield sleep duration
sleep = (duration)->
    (callback)-> setTimeout (-> callback null, duration), duration

module.exports = {WaitAll, start, skip, sleep}
