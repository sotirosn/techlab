Module.register('modules/class', function(module) {var require = module.require, log = module.log; var Class;

Class = (function() {
  function Class() {}

  Class.properties = function(properties) {
    return Object.defineProperties(this.prototype, properties);
  };

  return Class;

})();

module.exports = Class;

});

//# sourceMappingURL=class.js.map