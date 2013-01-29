var templateHelpers = {
	fakeImage:function(n,width,height){
		return (placeHolderService == 'placehold.it') ?
			'<img src="http://placehold.it/'+width+'x'+height+'"  width="'+width+'" height="'+height+'">'
			:
			'<img src="http://lorempixel.com/'+width+'/'+height+'/fashion/'+n+'"  width="'+width+'" height="'+height+'">'
			;
	}
,	split:function(str){
		if(!str){return '';}
		str = str.split(',');
		for(var i = 0; i<str.length;i++){
			str[i] = '<a href="#">'+str[i].trim()+'</a>'
		}
		if(str.length){return str.join(', ');}
		return '';
	}
,	image:function(url,width,height){
		var widthTag = width ? ' width="'+width+'"' : '';
		var heightTag = height ? ' width="'+height+'"' : '';
		var widthStyle = width ? 'width:'+width+'px;' : '';
		var heightStyle = height ? 'height:'+height+'px;' : '';
		var tags = (widthTag || heightTag) ? widthTag+heightTag:'';
		var style = (widthStyle || heightStyle) ? ' style="'+widthStyle+heightStyle+'"' : ''
		return '<div class="lazy" src="./res/transparent.gif" data-original="'+url+'"'+style+'>'
		+ '<noscript><img src="'+url+'"'+tags+'></noscript>'
		+'</div>'
	}
,	ifCond:function(v1, v2, options) {
		return (v1 == v2) ? options.fn(this) : options.inverse(this);
	}
,	getFilter:function(filter,value){
		var f,n;
		if(filters.hasOwnProperty(filter)){
			f = filters[filter].values;
			for(n in f){
				if(f[n] == value){return n;}
			}
		}
		return ''
	}
,	outputFilters:function(obj){
		var res = '';
		for(var n in filters){
			if(obj[n]){res+=n+':'+obj[n];}
		}
		return res;
	}
,	locale:function(text){
		if(text in locale){
			return locale[text];
		}
		return text ? text.replace('_',' '): '';
	}
,	makeBadges:function(badges){
		var res = '',badge;
		if(!badges){return res;}
		badges = badges.split(',');
		for(i=0; i< badges.length; i++){
			badge = templateHelpers.getFilter('badges',badges[i].trim())
			res+='<div class="badge-icon badge-'+badge+'"></div>'
		}
		return res;
	}
,	makeCoordinates:function(coord){
		if(coord){
			coord = coord.split(',');
			return ' data-lat="'+coord[0]+'" data-long="'+coord[1]+'"';
		}
		return '';
	}
,	makeDistance:function(coord){
		if(coord){
			coord = coord.split(',');
			return templateHelpers.getDistance(coord[0],coord[1]);
		}
		return templateHelpers.locale('unknown_distance');
	}
,	getDistance:function(lat2,lon2,lat1,lon1){
		if(
			(typeof lat2 != 'string' && typeof lat2 != 'number')
		||	(typeof lon2 != 'string' && typeof lon2 != 'number')
		){
			return '';
		}
		if(typeof lat1 != 'string' || typeof lat1 != 'number'){
			lat1 = null;
			lon1 = null;
		}
		var dist = map.distance(lat2,lon2);
		if(dist){
			dist = templateHelpers.naturalDistance(dist);
			return templateHelpers.locale('distance_from_you').replace('%s',dist);
		}
		return '';
	}
,	naturalDistance:function(num){
		var str = Unit(num+'km').best();
		return str;
	}
};

(function(){
	var funcName;
	for(var n in filters){
		templateHelpers['get'+n] = (function(name){
			return function(val){
				return templateHelpers.getFilter(name,val)
			}
		})(n);
	}
})();

(function(){
	for(var n in templateHelpers){
		Handlebars.registerHelper(n,templateHelpers[n]);		
	}
})();