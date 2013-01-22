var currentPage
,	doc = $(document)
,	setCurrentPage = function(id){
		var page;
		if(!id){id = '#Search';}
		else if(id instanceof jQuery){
			page = id;
			id = '#'+page[0].id;
		}else if(typeof(id)=='string' && id.indexOf('#') == 0){
			page = $(id);
		}
		if(page && page.length){
			currentPage = id;
		}
	}
;


doc.bind("mobileinit", function(){
	$.mobile.page.prototype.options.addBackBtn = true;
})
doc.bind('pagebeforechange',function(e,data){
	if(data.options.role!=='dialog'){
		setCurrentPage(data.toPage);
	}
})
$(function(){

	// SETTING UP

	var placeHolderService = 'placehold.it';
	var $templates = $('[type="text/x-handlebars-template"]');

	Handlebars.registerHelper('image', function(n,width,height){
		return (placeHolderService == 'placehold.it') ?
			'<img src="http://placehold.it/'+width+'x'+height+'"  width="'+width+'" height="'+height+'">'
			:
			'<img src="http://lorempixel.com/'+width+'/'+height+'/fashion/'+n+'"  width="'+width+'" height="'+height+'">'
			;
	});
	Handlebars.registerHelper('ifCond', function(v1, v2, options) {
		return (v1 == v2) ? options.fn(this) : options.inverse(this);
	});

	var 
		// dummy text function
		l = (function(lorem){
			return function(type,n){return lorem.createText(n,type);}
		})(new Lorem)
	,	random = function(from,to){
	    return Math.floor(Math.random()*(to-from+1)+from);
		}
	,	randomFromArr = function(arr){
		return arr[random(0,arr.length-1)];
	}
	,	filters = (function(f){
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
			items: (function(items){
				for(i=0;i<20;i++){
					items.push({
						title:l('w',2)
					,	description:l('p',1)
					,	id:i
					,	tags:(function(t){
							for(var n in filters){t[n] = randomFromArr(filters[n].values);}
							return t;
						})({})
					});
				}
				return items;
			})([])
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
			$templates.each(function(){
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
	,	closeMenu = (function(el){
			return function(){el.hide();}
		})($('.togglee'))
	;

	//$('.scroll').iscrollview();

	// END SETUP
	
	// FILTERS

	var filterManager = {
		filters:{
			'#Search':{}
		,	'#Locate':{}
		}
	,	add:function(filter,value,page){
			var query = filter+':'+value
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
				repo[filter].find('a.toggler .ui-btn-text').html(query)
			}
			var $input = $(page+' .ui-input-text');
			$input.val($input.val() + query);
			$input.trigger("change")
		}
	,	remove:function(filter,value,page){
			var query = filter+':'+value
			,	repo = filterManager.filters[page]
			;
			if(filter in repo){
				repo[filter].hide('fast',function(){
					$(this).remove();
				});
				delete filters[filter];
				var $input = $(page+' input.ui-input-text');
				$input.val($input.val().replace(query,'')).trigger("change")
			}
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
		var option = $o.data('select').split(':');
		$o.closest('.ui-dialog').dialog('close');
		filterManager.add(option[0],option[1],currentPage);
		closeMenus();
	});
	$('.menuBar').on('click','.filter-delete',function(){
		var $o = $(this);
		var option = $o.data('select').split(':');
		filterManager.remove(option[0],option[1],currentPage);
	});

	// END EVENTS
})
;