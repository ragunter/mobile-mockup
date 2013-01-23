String.prototype.trim = String.prototype.trim || function trim() { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };

var validPages = ['#Search','#Locate','#User']
,	random = function(from,to){
		return Math.floor(Math.random()*(to-from+1)+from);
	}
,	randomFromArr = function(arr){
		return arr[random(0,arr.length-1)];
	}
,	placeHolderService = 'placehold.it'
		// dummy text function
,	l = (function(lorem){
		return function(type,n){return lorem.createText(n,type);}
	})(new Lorem)
,	currentPage
,	doc = $(document)
,	log = console && console.log ? console.log : alert
,	setCurrentPage = function(id){
		var page;
		if(!id){
			id = window.location.hash ? window.location.hash : '#Search';
		}
		else if(id instanceof jQuery){
			page = id;
			id = '#'+page[0].id;
		}
		if(typeof(id)=='string' && id.indexOf('#') == 0 && validPages.indexOf(id)>=0){
			page = $(id);
			if(page && page.length){
				currentPage = id;
			}
		}
	}
,	initSequence = {
		'mobile':false
	,	'page':false
	,	'magento':false
	}
,	hasInit = false
,	testInit = function(finished){
		if(finished){
			initSequence[finished] = true;
			console.log('sequence finished: '+finished)
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

doc.bind("mobileinit", function(){
	$.mobile.page.prototype.options.addBackBtn = true;
	$.extend($.mobile,{
		autoInitializePage:false
	,	defaultPageTransition:'slide'
	,	phonegapNavigationEnabled:true
	})
	testInit('mobile');
})
Magento.on('init',function(ok){testInit('magento');})
Magento.getData();
jQuery(function(){testInit('page');})

doc.bind('pagebeforechange',function(e,data){
	if(data.options.role!=='dialog'){
		setCurrentPage(data.toPage);
	}
})
Handlebars.registerHelper('fakeImage', function(n,width,height){
	return (placeHolderService == 'placehold.it') ?
		'<img src="http://placehold.it/'+width+'x'+height+'"  width="'+width+'" height="'+height+'">'
		:
		'<img src="http://lorempixel.com/'+width+'/'+height+'/fashion/'+n+'"  width="'+width+'" height="'+height+'">'
		;
});
Handlebars.registerHelper('image', function(url){
	return '<img src="'+url+'" width="100" height="100">'
});
Handlebars.registerHelper('ifCond', function(v1, v2, options) {
	return (v1 == v2) ? options.fn(this) : options.inverse(this);
});

var init = function(){

	// SETTING UP

	var 
		filters = (function(f){
			for(var n in f){
				f[n] = {name:n,values:f[n].split(',')};
			}
			return f;
		})({
			color:'red,green,blue'
		,	type:'clothes,blah,bluh'
		})
		// data
	,	data = {
			items: Magento.items.orderBy(['entity_id'],'asc',50)
		,	locations: (function(items){
				for(i=0;i<20;i++){
					items.push({
						title:l('w',2)
					,	description:l('p',1)
					,	id:i
					,	type: (random(1,4)==1)? 'parking' : 'store'
					,	distance: (random(1,100))
					,	tags:(function(t){
							for(var n in filters){t[n] = randomFromArr(filters[n].values);}
							return t;
						})({})
					});
				}
				return items;
			})([])
		,	filters:filters
		}
	,	pages = {
			search:{
				title:'Search'
			}
		,	locate:{
				title:'Locate'
			}
		,	user:{
				title:'User'
			}
		}
		// object to hold the templates 
	,	t = (function(t){
			$('[type="text/x-handlebars-template"]').each(function(){
				var n = this.id.replace('-template','')
				,	p = Handlebars.compile(this.innerHTML); 
				;
				this.className=="partial" ?  Handlebars.registerPartial(n,p) : null;
				t[n] = p;
				$(this).remove();
			})
			return t;
		})({})
	,	$body = $('body')
		// fill the templates
	,	pagesHtml = $(
			t.pageSearch($.extend(pages.search,data))
		+	t.pageLocate($.extend(pages.locate,data))
		+	t.pageUser($.extend(pages.user,data))
		+	t.pageItem(data)
		+	t.pageFilter(data)
		).appendTo($body)
	,	closeMenus = (function(el){
			return function(){el.hide();}
		})($('.togglee'))
	;

	console.log(data.items);

	// END SETUP

	// FILTERS

	var filterManager = {
		filters:{
			'#Search':{}
		,	'#Locate':{}
		}
	,	add:function(query,page){
			var o = query.split(':')
			,	filter = o.shift()
			,	value = o.shift()
			,	$container = $('.menuBar',page)
			,	repo = filterManager.filters[page]
			;
			if(!(filter in repo)){
				repo[filter] = $(t.filterIcon({name:filter,value:value}))
										.css('display','none')
										.appendTo($container)
										.trigger('create')
										.show('slow')
										;
				repo[filter].find('ul').hide();
			}else{
				repo[filter].find('#Filter'+filter+'_value').html(value);
				repo[filter].find('a.toggler .ui-btn-text').html(query);
			}
			filterManager.changeInput(page,query,filter);
		}
	,	remove:function(query,page){
			var o = query.split(':')
			,	filter = o.shift()
			,	value = o.shift()
			,	repo = filterManager.filters[page]
			;
			if(filter in repo){
				repo[filter].hide('fast',function(){
					$(this).remove();
				});
				delete repo[filter];
			}
			filterManager.changeInput(page,'',filter)
		}
	,	changeInput:function(page,query,filter){
			var regex = new RegExp('\\b'+filter+':.*\\b','ig')
			,	$input = $(page+' input.ui-input-text')
			;
			query = query ? ' '+ query : '';
			var text = ($input.val().replace(regex,'')+query).replace(/\s+/g, ' ').trim();
			$input.val(text).trigger("change");
		}
	};

	// END FILTERS

	// EVENTS

	$body
		.on('click',function(){$('.togglee').hide();})
		.on("click",'.toggler',function(evt){
   			$(this).closest('.toggle').find('.togglee').toggle(); 
   			evt.stopPropagation();
   			evt.preventDefault();
		})

	
	$('.filter-select').on('click',function(){
		var $o = $(this);
		$o.closest('.ui-dialog').dialog('close');
		filterManager.add($o.data('select'),currentPage);
		closeMenus();
	});
	$('.menuBar').on('click','.filter-delete',function(){
		var $o = $(this);
		filterManager.remove($o.data('select'),currentPage);
	});

	$.mobile.initializePage()
	setCurrentPage();

	// END EVENTS
}
;