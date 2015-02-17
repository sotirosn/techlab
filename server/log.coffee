path = require 'path'

module.exports = (filepath)->
    label = path.basename filepath
    -> console.log "#{label}:", arguments...
