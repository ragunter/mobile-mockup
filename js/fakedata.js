var	random = function(from,to){
		return Math.floor(Math.random()*(to-from+1)+from);
	}
,	randomFromArr = function(arr){
		return arr[random(0,arr.length-1)];
	}
,	placeHolderService = 'placehold.it'
,	l = (function(lorem){
		return function(type,n){return lorem.createText(n,type);}
	})(new Lorem)
;