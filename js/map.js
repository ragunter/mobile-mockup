var	EARTH_RADIUS = 6371;
var map = {
	coords:{
		latitude:false
	,	longitude:false
	}
,	_init:false
,	_positionWatch:false
,	_available:null
,	_listeners:{}
,	_marker:null
,	_changed:false
,	_getCurrentPositionCalled:false
,	available:function(){
		return map._init && map._available
	}
,	addEventListener:function(evt,listener){
		if(!map._listeners.hasOwnProperty(evt)){map._listeners[evt] = [];}
		map._listeners[evt].push(listener);
		return map;
	}
,	removeEventListner:function(evt,listener){
		var index;
		if(map._listeners.hasOwnProperty(evt) && (index = map._listeners[evt].indexOf(listener))>=0){
			map._listeners.splice(index,1);
		}
		return map;
	}
,	trigger:function(evt,opts){
		var fns = map._listeners[evt], i=0, l = fns && fns.length ? fns.length : 0;
		for(i;i<l;i++){
			fns[i].call(map,opts);
		}
	}
,	latitude:function(callback){
		return map.getCoordinate('latitude',callback);
	}
,	longitude:function(callback){
		return map.getCoordinate('longitude',callback);
	}
,	marker:function(gMap){
		if(map._marker == false){return false;}
		if(map._marker == null){
			if(this.available()){
				map._marker = map.createMarker(
					map.coords.latitude
				,	map.coords.longitude
				,	templateHelpers.locale('your_position')
				,	null
				,	{
						fillColor:'#d3ff00'
					,	strokeColor:'#000'
					,	path:google.maps.SymbolPath.CIRCLE
					,	fillOpacity:1
					,	radius:20
					,	scale:5
					,	strokeWeight:2
					}
				)
			}else{
				if(!this._available){mp._marker = false;}
				return false;
			}
		}
		if(gMap instanceof google.maps.Map){
			map._marker.setMap(gMap);
		}else if(gMap instanceof google.maps.LatLng){
			map._marker.setPosition(gMap);
		}
		return map._marker;
	}
,	createMarker:function(lat,lon,title,gMap,icon){
		var latlng
		if(lat instanceof google.maps.LatLng){
			gMap = title;
			title = lon;
			lon = null;
			latlng = lat;
		}else{
			latlng = new google.maps.LatLng(lat,lon);
		}
		var marker = new google.maps.Marker({
			position:latlng
		,	title:title
		,	icon:icon
		});
		if(gMap){marker.setMap(gMap);}
		return marker
	}
,	getCoordinate:function(name,callback){
		if(map.available()){
			if(callback){callback(null,map.coords[name]);};
			return map.coords[name];
		}
		var cb = function(coords){
			if(callback){callback(null,coords[name])};
			map.removeEventListner(cb);
		}
		map.addEventListener(map.INIT,cb);
		map.getCurrentLocation();
		return NaN;
	}
,	updateLocation:function(position){
		if(map.coords.latitude != position.coords.latitude || map.coords.longitude != position.coords.longitude){
			map.coords.latitude = Number(position.coords.latitude);
			map.coords.longitude = Number(position.coords.longitude);
			map._changed = true;
			if(map._marker!==false){
				var latlng = new google.maps.LatLng(map.coords.latitude,map.coords.longitude);
				map.marker(latlng);
			}
			map.trigger(map.UPDATE,map.coords);
		}else{
			map._changed = false;
		}
	}
,	getCurrentLocation:function(callback){
		if(map._init && map._available){
			if(callback){callback(null,map.coords);}
			return map.coords;
		}
		else if(map._init && map._available == false){
			if(callback){callback(true,null);}
			return false;
		}
		else if(!navigator.geolocation){
			map._available = false;
			return false;
		};
		map._available = true;
		map._init = true;
		navigator.geolocation.getCurrentPosition(
			function(position){
				if(map._getCurrentPositionCalled){return;}
				map.updateLocation(position);
				map.trigger(map.INIT,map.coords);
				if(callback){callback(null,map.coords);}
				map._positionWatch = navigator.geolocation.watchPosition(map.updateLocation);
				map._getCurrentPositionCalled = true;
			}
		,	function(error){
				if(callback){
					callback(error);
				}
				else{console.log( "Something went wrong: ", error);}
			}
		,	{
				timeout: (5 * 1000),
				maximumAge: (1000 * 60 * 15),
				enableHighAccuracy: true
			}
		);
	}
,	distance: function(lat2,lon2,lat1,lon1){
		if(map._init && map._available == false){return false;}
		if(!lat1){lat1 = map.latitude();}
		if(!lon1){lon1 = map.longitude();}
		if(isNaN(lat1) || isNaN(lat2)){return false;}
		lon2 = Number(lon2);
		lat2 = Number(lat2);
		var point1 = new LatLon(lat1,lon1);
		var point2 = new LatLon(lat2,lon2);
		return point1.distanceTo(point2);
	}
,	google: function($el,$lat,$long,title){
		var latlng = new google.maps.LatLng($lat, $long);
		var mapOptions = {
			center: latlng
		,	zoom: 12
		,	mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var gMap = new google.maps.Map($el,mapOptions);
		map.createMarker(latlng,title,gMap);
		map.marker(gMap);
	}
}

map.INIT = 'init';
map.ERROR = 'error';
map.UPDATE = 'update';
map.on = map.addEventListener;
map.off = map.removeEventListner;