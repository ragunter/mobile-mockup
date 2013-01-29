var pages = {
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
,	validPages = (function(p,o){
		for(var n in p){
			o.push('#'+p[n].title);
		}
		return o;
	})(pages,[])
,	currentPage
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

doc.bind("mobileinit", function(){
	$.mobile.page.prototype.options.addBackBtn = true;
	$.extend($.mobile,{
		autoInitializePage:false
	,	defaultPageTransition:'none'
	,	phonegapNavigationEnabled:true
	})
	testInit('mobile');
});
Magento.on('init',function(ok){testInit('magento');})
Magento.getData();
jQuery(function(){testInit('page');})

doc.bind('pagebeforechange',function(e,data){
	if(data.options.role!=='dialog'){setCurrentPage(data.toPage);}
})

var init = function(){

	// SETTING UP

	var 
		data = {
			items: Magento.items.orderBy(['entity_id'],'asc')
		,	locations: Magento.locations.orderBy(['entity_id'],'asc')
		,	filters:filters
		}
	,	$body = $('body')
	,	filterManager = makeFilterManager(pages)
	,	pagesHtml = $(
			t.search($.extend(pages.search,data))
		+	t.locate($.extend(pages.locate,data))
		+	t.user($.extend(pages.user,data))
		+	t.item.each(data.items)
		+	t.location.each(data.locations)
		+	t.filter.each($.extend({},data.filters))
		).appendTo($body)
	,	closeMenus = function($not){
			var $els = ($not && $not.length) ? $('.togglee').not($not.toggle()) : $('.togglee');
			$els.hide();
		}
	,	oldVal = ''
	;
	// END SETUP

	// EVENTS

	$body
		.on('click',function(){$('.togglee').hide();})
		.on("click",'.toggler',function(evt){
			closeMenus($(this).closest('.toggle').find('.togglee'));
   			evt.stopPropagation();
   			evt.preventDefault();
		})

	
	$('.filter-select').on('click',function(){
		var $o = $(this);
		$o.closest('.ui-dialog').dialog('close');
		filterManager.add($o.data('select'),currentPage);
		closeMenus();
	});
	$('.fulltextbutton').on('click',function(){
		var $o = $(this);
		var newVal = $('#FullTextInput').val();
		$o.closest('.ui-dialog').dialog('close');
		filterManager.addFilterWidget(currentPage,'text',newVal,newVal);
		filterManager.changeInput(currentPage,oldVal,newVal);
		oldVal = newVal;
		closeMenus();
	})
	$('.menuBar').on('click','.filter-delete',function(){
		var $o = $(this);
		if($o[0].id== 'DeleteFiltertext'){
			filterManager.changeInput(currentPage,oldVal,'');
			oldVal = '';
			$('#FullTextInput').val('')
			filterManager.removeFilterWidget(currentPage,'text');
		}else{
			filterManager.remove($o.data('select'),currentPage);
		}
		closeMenus();
	});

	var hasScrolled = {
		old:false
	,	curr:false
	};

	var onScroll = function($el){
		var $searchbar = $el.siblings('.filtersBar:first');
		return function(evt){
			hasScrolled.curr = {
				bar:$searchbar
			,	y:evt.y
			}
			closeMenus();
		}
	}

	var checkScroll = function(){
		var oldY, newY, bar;
		if(hasScrolled.curr){
			oldY = hasScrolled.old && hasScrolled.old.y ? hasScrolled.old.y : 0;
			newY = hasScrolled.curr.y;
			bar = hasScrolled.curr.bar;
			if(newY<oldY){
				bar.slideDown();
			}else if(newY>60){
				bar.slideUp();
			}
			hasScrolled.old = hasScrolled.curr;
			hasScrolled.curr = false;
		}
	}

	var scrollInterval = setInterval(checkScroll,500);

	// END EVENTS

	$.mobile.initializePage()
	$("img.lazy").show().lazyload({
		effect:'fadeIn'
	});
	$('.iscrollPane').iscrollview({preventTouchHover:true}).each(function(){
		var $el = $(this);
		$el.bind('iscroll_onscrollstart',onScroll($el))
	})
	setCurrentPage();

	$('body').removeClass('loading');
}
;