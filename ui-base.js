var _ = require("lodash");
var $ = require("jquery");

function UIBase(_$elm) {
	this.$elm     = _$elm;
	this.elm      = _$elm[0];

	this.$elms   = {};
	this.subs    = {};
	/** @todo make array so multiple widgets can be bound **/
	this.$elm.data("ua.bind", this);

	this.on      = this.$elm.on.bind      ( this.$elm);
	this.off     = this.$elm.on.bind      ( this.$elm);
	this.trigger = this.$elm.trigger.bind ( this.$elm);
	this.one     = this.$elm.one.bind     ( this.$elm);
	/** should this be called on an init in case we don't want it on creation **/
	this.createEventHandlers();
}


UIBase.prototype.createEventHandlers = function() {
	var self = this;
	_.forEach(this.constructor.prototype, function(fn, name) {
		var m;
		if (!!(m = /^on([A-Z]\w*)/.exec(name))) {
			self.on(m[1].toLowerCase(), fn.bind(self));
		}
	});
	return this;
};

UIBase.prototype.setProps = function(_value){
	this.props = _value;
	return this;
};

UIBase.prototype.inject = function(_subName, _props){
	if(this.subs[_subName].length){
		_.each(this.subs[_subName], function(v,k){
			this.subs[_subName][k].setProps(_props[k])	;
		});
	} else{
		this.subs[_subName].setProps(_props);
	}
	return this;
};

UIBase.prototype.delegateEvents = function(_type, _selector){
	if(!_.isString(_type) && _.isString(_selector)){
		throw new TypeError("was expecting an _type (string) and _selector (string)");
	}

	this.on(_type, _selector, function(){
		var component = this.data("ua.bind");
		component["onDelegated" + (_type.charAt(0).toUpperCase() + _type.slice(1))].apply(component, arguments);
	});
	return this;
};

UIBase.prototype.initializeElms = function(){
	_.each(this.SELECTORS, function(_selector, _name){
		var $elms = $(_selector, this.$el);
		this.$elms[_name + ( $elms.length && "Stack" || "" )] = $elms;
	});
	return this;
};

UIBase.prototype.initializeSubs = function(_module){
	_.each(this.$elms, function(_$elm, _modName){
		if(_$elm.length){
			this.subs[_modName] = _.map(_$elm, function(_$el){
				return new _module[_modName]($(_$el));
			});
		} else {
			this.subs[_modName] = new _module[_modName](_$elm);
		}
	}.bind(this));
	return this;
};
