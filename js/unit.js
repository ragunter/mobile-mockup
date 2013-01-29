//credit to https://github.com/agnoster/unitology/blob/master/index.js
var Unit = (function(){

	var unitRE = new RegExp('^([+-]?[0-9]*[./]?[0-9]*(e[+-]?[0-9]+)?) *(.*)$')

	var Unit = function(size){
		if(!(this instanceof Unit)){return new Unit(size);}
		this._value = 1;
		this._unit;
		if(size){this.set(size);}
	}

	Unit.prototype = {
		constructor:Unit
	,	set:function(size){
			var from
			,	value = 1
			,	unit
			;
			while (true) {
				from = Unit.parse(size);
				value*= from.value;
				unit = from.unit;

				if (!unit){break;}
				unit = unit.toLowerCase();

				size = this[unit]
				if (!size){
					unit = Unit.singularize(unit);
					size = this[unit];
				}
				if (!size){
					throw ("No unit found for: '" + unit + "'")
				}else{
					this._value = value;
					this._unit = unit;
				}
			}
		}
	,	define:function(units,val){
			var that = this;
			if(typeof units === 'object'){
				for (key in units) {
					if(units.hasOwnProperty(key)){
						this.define(key, units[key])
					}
				}
			} else {
				units = units.split(/\s*,\s*/)
				if(!this._alternates){this._alternates = [];}
				this._alternates.push(units);
				units.forEach(function(key){
					that[key] = val;
				})
			}
		}
	,	value: function(units) {
			if (units) return this.to(units)
			return this._value;
		}
	,	to: function(target){
			var Class = Unit.classes[this._className];
			var multiplier = new Class(target);
			return this._value / multiplier
		}
	,	best:function(unit,abbr){
			if(typeof this._value == undefined || this._value == null){return false;}
			var val = this._value
			,	unit = unit || this._unit
			,	places = Unit.places(val)
			,	last = [100,100]
			,	i = 0
			,	alt = this._alternates
			,	l = alt.length
			,	diff
			,	d
			,	candidates = [];
			;
			for(i;i<l;i++){
				d = Unit.places(Unit.parse(this[alt[i][0]]).value);
				diff = [Math.abs(d[0]-places[0]),Math.abs(d[1]-places[1])];
				if(diff[0]<=last[0] && diff[1]<=last[1]){
					last = diff
					candidates.push(alt[i][alt[i].length-1])
				}
			}
			if(candidates.length){
				for(i=candidates.length-1;i>=0;i--){
					if(candidates[i].indexOf(unit)>=0){
						return this.natural(candidates[i],abbr)
					}
				}
				return this.natural(candidates[candidates.length-1],abbr);
			}
			return this.natural(unit,abbr);
		}
	,	natural:function(unit,abbr){
			if(!abbr){abbr=4}
			if(!unit){unit = this._unit;}
			var val = this.value(unit)
			,	i = 0
			,	j = 0
			,	alt = this._alternates
			,	units
			,	li = alt.length
			,	lj = 0
			;
			for(i=0;i<li;i++){
				units = alt[i];
				lj = units.length;
				for(j=0;j<lj;j++){
					if(units[j] == unit){
						j = ((abbr<lj)? abbr : lj)-1;
						return this.human(val,units[j])
					}
				}
			}
			return val;
		}
	,	cycleUnits:function(fn){
			var doContinue = true;
			for(var prop in this){
				if(prop.indexOf('_')==0 || (this[prop] instanceof Function)){continue;}
				doContinue = fn(prop,this[prop],this);
				if(doContinue === false){break;}
			}
		}
	,	human:function(val,unit){
			var approx2 = Number(val.toFixed(2))
			,	approx1 = Number(val.toFixed(1))
			,	exact2 = (approx2 == val)
			,	exact1 = (approx1 == val)
			,	str= (exact1 || exact2? '':'almost ')+'%d %s'
			;
			unit = val > 1 ? Unit.pluralize(unit) : unit;
			switch(approx2){
				case 0.75: str = (exact2 ? '':'almost ') + 'three quarters of a %s'; break;
				case 0.25: str = (exact2 ? '':'almost ') + 'one quarter of a %s'; break;
				default:break;
			}
			switch(approx1){
				case 0.0: str = (exact1 ? '':'almost ') + 'right there'; break;
				case 0.5: str = (exact1 ? '':'almost ') + 'half a %s'; break;
				case 0.1: str = (exact1 ? '':'almost ') + 'a tenth of a %s'; break;
				default:break;
			}
			
			return str.replace(/%s/g,unit).replace(/%d/g,val.toFixed());
		}		
	,	toString:function(){
			return this.value();
		}
	,	valueOf:function(){
			return this._value;
		}
	}

	Unit.classes = {};

	Unit.define = function(name,baseUnit, conversions) {
		if(Unit.classes.hasOwnProperty(name)){return Unit.classes[name];}
		var proto = new Unit();
		proto.constructor = Unit;
		proto._className = name;
		proto.define(baseUnit,1);
		if (conversions){proto.define(conversions);}
		var obj = function(opts){
			if(!(this instanceof obj)){return new obj(opts);}
			Unit.call(this,opts);
		};
		obj.prototype = proto;
		Unit.classes[name] = obj;
		return obj;
	}

	Unit.places = function(val){
		val = String(val).split(/[,.]/);
		return [val[0].length,val[1] ? val[1].length : 0];
	}

	Unit.singularize = function(unit){
		return unit.replace(/s?$/, '');
	}

	Unit.pluralize = function(unit){
		return unit+'s';
	}

	Unit.parse = function (string) {
	    var match
	    if (match = unitRE.exec(string)) {        
	        return {value:eval(match[1] || 1),unit:match[3] }
	    }
	    return false;
	}

	Unit.guess = function(str){
		var re = Unit.parse(str)
		,	unit = re.unit
		,	className
		,	proto
		,	Class
		,	match = false
		;
		var check = function(prop,val,obj){
			if(prop === unit){
				if(!match){match = Class;}
				else if(Class != match){
					throw new Error('ambiguous unit type '+unit);
					return false;
				}
			}
		};
		if(!unit){throw new Error('could not find a unit in '+str);}
		unit = unit.toLowerCase();
		for(className in Unit.classes){
			Class = Unit.classes[className];
			proto = Class.prototype;
			proto.cycleUnits(check)
		}
		if(match){
			return new match(str);
		}
		return false;
	}

	var definitions = {
		time:[
			'time'
		,	's, second'
		,	{
				"ms, millisecond": "0.001s"
			,	"m, min, minute": "60s"
			,	"h, hr, hour": "60m"
			,	"d, day": "24h"
			,	"w, week": "7d"
			,	"mo, month": "1/12y"
			,	"y, year": "365d"
			,	"dec, decade": "10y"
			,	"cent, century": "100y"
			,	"millennium, millennia": "100y"
			,	"micros, microsecond": "0.001ms"
			}
		]
	,	weight:[
			'weight'
		,	'kg, kilo, kilogram'
		,	{
				"g, gram": "0.001kg"
			,	"lb, pound": "0.453592kg"
			,	"oz, ounce": "1/16 lb"
			}
		]
	,	length:[
			'length'
		,	'm, meter'
		,	{
				"ft, foot, feet": "0.3048m"
			,	"yard": "3ft"
			,	"inch": "1/12ft"
			,	"mile": "5280ft"
			,	"km, kilometer": "1000m"
			,	"cm, centimeters":"0.01m"
			}
		]
	}
	definitions.distance = definitions.length;
	definitions.mass = definitions.weight;

	var process = function($from){
		var _from,_to;
		if(!$from){return false;}
		$from = $from.split('->');
		_from = Unit.singularize($from.shift().toLowerCase().trim());
		var obj = Unit.guess(_from);
		if(obj){
			if(!$from.length){return obj;}
			_to = $from.shift().trim();
			if(_to.indexOf('best')==0){
				_to = _to.split(' ');
				_to.shift();
				return obj.best(_to.shift());
			}
			if(_to.indexOf('natural')==0){
				_to = _to.split(' ');
				_to.shift();
				return obj.natural(_to.shift());
			}
			return obj.to(_to);
		}
		return false;
	}

	for(var n in definitions){
		Unit[n] = Unit.define(definitions[n][0],definitions[n][1],definitions[n][2])
		process[n] = Unit[n];
	};

	return process;

})();