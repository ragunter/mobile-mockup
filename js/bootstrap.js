String.prototype.trim = String.prototype.trim || function trim() { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };
jOrder.logging = false;
less = {
	env: "development"
,	functions: {}
,	dumpLineNumbers: "all"
};
var	doc = $(document)
,	log = console && console.log ? function(){console.log(arguments);} : function(){alert(arguments);}
,	initSequence = {
		'mobile':false
	,	'page':false
	,	'magento':false
	,	'templates':false
	}
,	hasInit = false
,	testInit = function(finished){
		if(finished){
			initSequence[finished] = true;
			//console.log('sequence finished: '+finished)
		}
		for(var n in initSequence){
			if(initSequence[n] == false){return false;}
		}
		if(!hasInit){
			hasInit = true;
			init();
		}
		return true;
	}
;


var t = (function(t){

	var templates = {
		'partials/filtericon':false
	,	'partials/filters':false
	,	'partials/footer':false
	,	'partials/header':false
	,	'partials/item':false
	,	'partials/location':false
	,	'page/filter':false
	,	'page/item':false
	,	'page/locate':false
	,	'page/location':false
	,	'page/search':false
	,	'page/user':false
	}

	var complete = function(template,url){
		templates[url] = template;
		for(var n in templates){
			if(templates[n] == false){return false;}
		}
		allComplete();
	}

	var allComplete = function(){
		var n, f, origin, name, e;
		for(n in templates){
			f = Handlebars.compile(templates[n]);
			e  = Handlebars.compile('{{#each this}}'+templates[n]+'{{/each}}');
			n = n.split('/');
			origin = n.shift();
			name = n.shift();
			if(origin == 'partials'){Handlebars.registerPartial(name,f)}
			t[name] = f;
			f.each = e
		}
		testInit('templates')
	}

	for(var n in templates){
		$.ajax({
			url: './templates/'+n+'.handlebars'
		,	dataType:'text'
		,	success:(function(name){
				return function(data){
					complete(data,name);
				}
			})(n)
		,	error:function(jqXHR,status,error){
				var err = new Error(error+':'+status);
				throw err;
			}
		})
	}

	return t;

})({})