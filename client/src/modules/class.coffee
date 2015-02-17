class Class
    @properties:(properties)->
        Object.defineProperties @::, properties

module.exports = Class