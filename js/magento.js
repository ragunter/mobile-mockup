(function(scope){
	var MagentoTable = function(name,attribute_number){
		this._attribute_number = (attribute_number && attribute_number.length) ? attribute_number : [attribute_number];
		this._attribute_name = 'attribute_set';
		this._name = name;
		this._data = null;
		this._cache = {};
		this._ids = [];
	}
	MagentoTable.prototype = {
		constructor: MagentoTable
	,	setData: function(data){
			var table = new jOrder(data);
			this._data = this._setIndexes(table);
		}
	,	_setIndexes: function(table){
			table.index('entity_id',['entity_id'],{ordered:true,type:jOrder.number});
			return table;
		}
	,	get:function(where,options){
			if(!this._data){throw new Error('data not initialized');return;}
			var s = JSON.stringify(where)+JSON.stringify(options);
			if(!this._cache[s]){this._cache[s] = this._data.where(where,options);}
			return this._cache[s];
		}
	,	orderBy:function(ordering,dir,limit,offset){
			if(!this._data){throw new Error('data not initialized');return;}
			if(!dir){dir = jOrder.asc;}
			else{
				switch(dir){
					case true:
					case 'DESC':
					case 'desc':
					case 'des':
					case 'd':
						dir = jOrder.asc;
					default:
						dir = jOrder.asc;
				}
			}
			if(!offset){offset = 0;}
			if(!limit){limit = null;}
			var s = JSON.stringify(ordering+dir+offset+limit);
			if(!this._cache[s]){this._cache[s] = this._data.orderby(ordering,dir,{offset:offset,limit:limit})}
			return this._cache[s];
		}
	,	condition:function(){
			var ids = this._ids
			,	attribute_name = this._attribute_name
			,	attribute_number = this._attribute_number
			;
			var cond = function(element, index, array){
				if(element.hasOwnProperty(attribute_name) && attribute_number.indexOf(parseInt(element[attribute_name]))>=0 && ids.indexOf(element.entity_id)<0){
					ids.push(element.entity_id);
					return true;	
				};
				return false;
			}
			return cond;
		}
	}

	var StoresTable = function(){
		MagentoTable.call(this,'stores',214);
	}
	StoresTable.prototype = new MagentoTable();
	StoresTable.prototype.constructor = MagentoTable;

	var ParkingsTable = function(){
		MagentoTable.call(this,'parkings',212);
	}
	ParkingsTable.prototype = new MagentoTable();
	ParkingsTable.prototype.constructor = MagentoTable;

	var MallsTable = function(){
		MagentoTable.call(this,'malls',211);
	}
	MallsTable.prototype = new MagentoTable();
	MallsTable.prototype.constructor = MagentoTable;

	var LocationsTable = function(){
		MagentoTable.call(this,'locations',[214,212,211]);
	}
	LocationsTable.prototype = new MagentoTable();
	LocationsTable.prototype.constructor = MagentoTable;

	var ItemsTable = function(){
		MagentoTable.call(this,'items',210);
		this._attribute_name = 'attribute_set';
	}
	ItemsTable.prototype = new MagentoTable();
	ItemsTable.prototype.constructor = MagentoTable;
	ItemsTable.prototype._setIndexes = function(table){
		MagentoTable.prototype._setIndexes.call(this,table);
		table.index('final_price_without_tax',['final_price_without_tax'],{grouped:true, ordered:true,type:jOrder.number});
		table.index('name',['name'],{grouped:true,type:jOrder.string})
		return table;
	}
	ItemsTable.prototype.condition = function(){
		var ids = this._ids
		,	attribute_name = this._attribute_name
		,	attribute_number = this._attribute_number
		;
		var cond = function(element, index, array){
			if(element.hasOwnProperty('product_type') && ids.indexOf(element.entity_id)<0){
				ids.push(element.entity_id);
				return true;
			};
			return false;
		}
		return cond;
	}

	var parseData = function(data,cb){
		var arrays = {'items':[],'locations':[]}
		,	condition
		;
		for(var n in arrays){
			condition = Magento[n].condition();
			arrays[n] = data.filter(condition);
			//console.log(arrays[n]);
			Magento[n].setData(arrays[n]);
		}
		cb(null,true);
	}

	var fakeTimeStamp = '1358904893';

	var localStorage = {
		getVersion:function(){
			return fakeTimeStamp;
		}
	,	store:function(data){

		}
	,	data:function(){
			return null;
		}
	}

	var Magento = {
		_data: false
	,	_version:null
	,	_baseUrl:'./api/'
	,	_listeners:{}
	,	items:new ItemsTable()
	,	locations:new LocationsTable()
	,	getData:function(cb,forceRefresh){
			if(!cb){cb = function(){};}
			var that = this
			,	parse = function(data,cb){
					parseData(data,function(err,ok){
						if(err || !ok){cb(err);return;}
						if(ok){
							that._data = true;
							cb(null,ok);
						}
					});
				}
			;
			if(forceRefresh){this.refresh();}
			if(!this._data){
				that.getServerDataVersion(function(err,ver){
					if(err){cb(err);return;}
					if(ver !== that.getLocalDataVersion() || !localStorage.data()){
						that.get('data.json',function(err,data){
							if(err){cb(err);return;}
							that._version = data.magento_api.version;
							data = data.magento_api.data_item;
							parse(data,cb);
							that.trigger(Magento.EVENT_INIT,true);
						})
					}else{
						parse(localStorage.data(),cb);
						that.trigger(Magento.EVENT_INIT,true);
					}
				});
				return;
			}
			cb(null,true);
		}
	,	on:function(event,listener){
			if(event == Magento.EVENT_INIT && this._data){listener(true,this);}
			if(!this._listeners[event]){this._listeners[event] = [];}
			this._listeners[event].push(listener);
			return this;
		}
	,	trigger:function(event,props){
			if(this._listeners.hasOwnProperty(event)){
				var i = 0, evts = this._listeners[event], l = evts.length
				for(i;i<l;i++){
					evts[i](props,this);
				}
			}
			return this;
		}
	,	refresh:function(){
			//supposedly destroys everything in local store
			this._data = false;
		}
	,	get:function(url,cb){
			$.ajax({
				url: this._baseUrl + url
			,	dataType:'json'
			,	success:function(data){
					cb(null,data);
				}
			,	error:function(jqXHR,status,error){
					var err = new Error(error+':'+status);
					cb(err);
				}
			})
		}
	,	getLocalDataVersion:function(){
			var that = this;
			if(!this._version){
				this._version = localStorage.getVersion();
			}
			return this._version;
		}
	,	getServerDataVersion:function(cb){
			var that = this;
			this.get('version.json',function(err,data){
				if(err){cb(err);return};
				cb(null,parseInt(data.version));
			})
		}
	}

	Magento.EVENT_INIT = 'init';
	Magento.EVENT_ERROR = 'error';
	Magento.EVENT_DATA = 'data';

	scope.Magento = Magento;

})(this);

/**
var DataItem = function(vals){
	this._entity_id='';
	this._type_id='';
	this._sku = '';
	this._name = '';
	this._meta_title = '';
	this._meta_description = '';
	this._brands='';
	this._badges='';
	this._gift_for='';
	this._material='';
	this._tags='';
	this._location='';
	this._branches='';
	this._product_type='';
	this._gender='';
	this._color='';
	this._season='';
	this._description='';
	this._short_description='';
	this._meta_keyword='';
	this._regular_price_with_tax='';
	this._regular_price_without_tax='';
	this._final_price_with_tax='';
	this._final_price_without_tax='';
	this._is_saleable='';
	this._image_url='';
}

DataItem.prototype = {
	constructor:DataItem
,	set:function(vals){
		for(var n in vals){
		}
	}
}
**/