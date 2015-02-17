log = console.log.bind console, "#{__filename}:"

class Database
    mongoose = require 'mongoose'

    constructor:(@config)->
    
    connect: ->
        @db = mongoose.connect(@config.uri).connection 
        yield (callback)=>
            @db.once 'connected', (=> callback null, "db connected to #{@config.uri}")
            @db.on 'error', (error) -> callback error

    class Model
        constructor:(@data)->
        
        @insert:(args...)-> 
            yield (callback)=>
                model = new @model args...
                model.save callback
        
        @update:(args...)-> yield (callback)=>
            @model.update args..., callback
        
        @findOne:(args...)-> yield (callback)=>
            @model.findOne args..., callback
    
        @find:(args...)-> yield (callback)=>
            @model.find args..., callback
            
        @remove:(args...)-> yield (callback)=>
            @model.remove args..., callback

    @define:(name, schema)->
        #log arguments
        class extends Model
            @model: mongoose.model name, new mongoose.Schema schema

query = (query)-> query.exec.bind query

module.exports = {Database, query}