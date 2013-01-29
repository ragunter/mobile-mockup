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
,	activePage
,	scrollWatch = {}
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
	if(scrollWatch[activePage]){
		scrollWatch[activePage].hasScrolled = false;
	}
})
doc.bind('pagechange',function(e,data){
	activePage = data.toPage.attr('id');
})

var init = function(){

	// SETTING UP

	var 
		data = {
			items: Magento.items.orderBy(['entity_id'],'asc',50)
		,	locations: Magento.locations.orderBy(['entity_id'],'asc',50)
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

	var onScroll = function($el){
		var $searchbar = $el.siblings('.filtersBar:first');
		var id = $el.closest('.page').attr('id');
		scrollWatch[id] = {bar:$searchbar, old:0, curr:0,hasScrolled:false,hidden:false};
		return function(evt,o){
			var repo = scrollWatch.hasOwnProperty(activePage) ? 
				scrollWatch[activePage]
				:
				false
			;
			if(!repo){return;}
			repo.curr = o.iscrollview.y();
			repo.hasScrolled = true;
		}
	}

	var checkScroll = function(){
		var oldY, newY, bar,repo;
		if((repo = scrollWatch[activePage]) && repo.hasScrolled == true){
			var oldY = repo.old || 0
			,	newY = repo.curr
			,	bar = repo.bar
			,	hidden = repo.hidden
			,	distance = Math.abs(newY - oldY)
			;
			repo.old = repo.curr;
			repo.hasScrolled = false;
			console.log(oldY,newY, distance)	
			if(newY < oldY && newY < -60 && !hidden){
				bar.slideUp();
				repo.hidden = true;
			}else if(hidden && (distance > 100 || newY>-60)){
				bar.slideDown();
				repo.hidden = false;
			}

		}
	}

	var scrollInterval = setInterval(checkScroll,500);

	// END EVENTS

	$.mobile.initializePage()
	$("img.lazy").show().lazyload({
		effect:'fadeIn'
	});
	$('.iscrollPane').iscrollview({preventTouchHover:false}).each(function(){
		var $el = $(this);
		$el.bind('iscroll_onscrollmove',onScroll($el))
	})
	setCurrentPage();

	$('body').removeClass('loading');
}
;