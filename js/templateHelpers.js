var templateHelpers = {
	fakeImage:function(n,width,height){
		return (placeHolderService == 'placehold.it') ?
			'<img src="http://placehold.it/'+width+'x'+height+'"  width="'+width+'" height="'+height+'">'
			:
			'<img src="http://lorempixel.com/'+width+'/'+height+'/fashion/'+n+'"  width="'+width+'" height="'+height+'">'
			;
	}
,	split:function(str){
		str = str.split(',');
		for(var i = 0; i<str.length;i++){
			str[i] = '<a href="#">'+str[i].trim()+'</a>'
		}
		if(str.length){return str.join(', ');}
		return '';
	}
,	image:function(url,width,height){
		if(!width){width = 100; height = 100;}
		return '<img class="lazy" data-original="'+url+'" width="'+width+'" height="'+height+'">'
		+ '<noscript><img src="'+url+'" width="'+width+'" height="'+height+'"></noscript>'
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