Game.ALL_ENTITIES = {};

Game.Entity = function(template) {
  template = template || {};
  Game.Symbol.call(this, template);
  if (!('attr' in this)) {
    this.attr = {};
  }
  this.attr._name = template.name || '';
  this.attr._x = template.x || 0;
  this.attr._y = template.y || 0;
  this._entityID = Game.util.randomString(16);
  this._map = null;
  Game.ALL_ENTITIES[this._entityID] = this;

  this._mixins = template.mixins || [];
  this._mixinTracker = {};
  console.dir(template);
  console.dir(template.mixins);
  console.dir(this._mixins);

  for (var i = 0; i < this._mixins.length; i++) {
    var mixin = this._mixins[i];
    console.dir(mixin);
    this._mixinTracker[mixin.META.mixinName] = true;
    this._mixinTracker[mixin.META.mixinGroup] = true;

    for (var mixinProp in mixinProp != 'META' && mixin) {
      if (mixinProp != 'META' && mixin.hasOwnProperty(mixinProp)) {
        this[mixinProp] = mixin[mixinProp];
      }
    }

    if (mixin.META.hasOwnProperty('stateNamespace')) {
      this.attr[mixin.META.stateNamespace] = {};
      for (var mixinStateProp in mixin.META.stateModel) {
        if (mixin.META.stateModel.hasOwnProperty(mixinStateProp)) {
          this.attr[mixin.META.stateNamespace][mixinStateProp] = mixin.META.stateModel[mixinStateProp];
        }
      }
    }

    if (mixin.META.hasOwnProperty('init')) {
      mixin.META.init.call(this, template);
    }
  }
};

Game.Entity.extend(Game.Symbol);

Game.Entity.prototype.getName = function() {
    return this.attr._name;
};

Game.Entity.prototype.setName = function(name) {
    this.attr._name = name;
};

Game.Entity.prototype.getID = function() {
  return this.attr._entityID;
};

Game.Entity.prototype.getPos = function() {
  return {x: this.attr._x, y: this.attr._y};
};

Game.Entity.prototype.setPos = function(x_or_xy,y) {
  if (typeof x_or_xy == 'object') {
    this.attr._x = x_or_xy.x;
    this.attr._y = x_or_xy.y;
  } else {
    this.attr._x = x_or_xy;
    this.attr._y = y;
  }
};

Game.Entity.prototype.getX = function() {
    return this.attr._x;
};

Game.Entity.prototype.getY   = function() {
    return this.attr._y;
};

Game.Entity.prototype.setX = function(x) {
    this.attr._x = x;
};

Game.Entity.prototype.setY = function(y) {
    this.attr._y = y;
};

Game.Entity.prototype.getMap = function() {
  return this._map;
};

Game.Entity.prototype.setMap = function(map) {
  this._map = map;
};

Game.Entity.prototype.hasMixin = function(mixin) {
  if (typeof mixin == 'object') {
    return this._mixinTracker.hasOwnProperty(mixin.META.mixinName);
  } else {
    return this._mixinTracker.hasOwnProperty(mixin);
  }
},

Game.Entity.prototype.toJSON = function() {
  var json = Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  return json;
},

Game.Entity.prototype.fromJSON = function(json) {
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
}
