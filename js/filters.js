var makeFilterManager = function(pages){
	var filterManager = {
		filters:(function(p,o){
			for(var n in p){
				o['#'+p[n].title] = {};
			}
			return o;
		})(pages,{})
	,	add:function(query,page){
			var o = query.split(':')
			,	filter = o.shift()
			,	value = o.shift()
			,	name = o.shift()
			;
			query = filter+':'+value;
			filterManager.addFilterWidget(page,filter,name,value)
			filterManager.changeInput(page,filter,query,true);
		}
	,	addFilterWidget:function(page,filter,name,value){
			var repo = filterManager.filters[page]
			,	$container = $('.menuBar',page)
			;
			if(!(filter in repo)){
				$('.criteria-helper').hide();
				repo[filter] = $(t.filtericon({filter:filter,value:value,name:name}))
										.css('display','none')
										.appendTo($container)
										.trigger('create')
										.show('slow')
										;
				repo[filter].find('ul').hide();
			}else{
				repo[filter].find('#Filter'+filter+'_value').html(name);
				repo[filter].find('a.toggler .ui-btn-text .filter-value').html(name);
			}
		}
	,	removeFilterWidget:function(page,filter){
			var repo = filterManager.filters[page]
			,	last = true;
			;
			if(filter in repo){
				repo[filter].hide('fast',function(){
					$(this).remove();
				});
				delete repo[filter];
			}
			for(var n in repo){
				last = false;break;
			}
			if(last){$('.criteria-helper').show();}
		}
	,	remove:function(query,page){
			var o = query.split(':')
			,	filter = o.shift()
			,	value = o.shift()
			;
			filterManager.removeFilterWidget(page,filter);
			filterManager.changeInput(page,filter,'',true)
		}
	,	changeInput:function(page,oldVal,newVal,isFilter){
			var regex = isFilter ?  new RegExp('\\b'+oldVal+':.*\\b','ig') : new RegExp(''+oldVal+'','ig')
			,	$input = $(page+' input.ui-input-text')
			;
			newVal = newVal ? ' '+ newVal : '';
			var text = ($input.val().replace(regex,'')+newVal).replace(/\s+/g, ' ').trim();
			$input.val(text).trigger("change");
			console.log($input.val())
		}
	};
	return filterManager;
}
var filters = {
	text:{
		name:'text'
	,	key:'text'
	,	image_url:'./res/icons/gender.png'
	,	contents:'<input type="text" id="FullTextInput"><button class="fulltextbutton">ok</button>'
	}
,	gender:{
		name:'gender'
	,	key:'gender'
	,	image_url:'./res/icons/gender.png'
	,	values:{
			female:13
		,	male:14
		,	unisex:12
		}
	}
,	badges:{
		name:'badges'
	,	image_url:'./res/icons/badges.png'
	,	values:{
			sales:61
		,	'gift ideas':58
		}
	}
,	location:{
		name: 'locations'
	,	key: 'locations'
	,	image_url:'./res/icons/locations.png'
	,	values:{
			Ashrafieh:36
		,	'Beirut Central District':269
		,	'Beirut Souks':34
		,	Downtown:35
		,	Gemmayze:32
		,	Hamra:38
		,	'Saifi Village':33
		,	'Ain el Remmaneh':90
		,	Dbayeh:93
		,	Dora:29
		,	Jounieh:86
		,	'Sin el Fil':30
		,	Tripoli:295
		,	Verdun:37
	}
	}
,	color:{
		name:'color'
	,	key:'color'
	,	image_url:'./res/icons/color.png'
	,	values:{
			black: 4
		,	blue: 45
		,	brown: 40
		,	gray: 41
		,	green: 5
		,	orange: 277
		,	pink: 43
		,	purple: 44
		,	red: 6
		,	white: 42
		,	yellow: 47
		,	metallic: 80
		,	neon: 79
		,	multi: 161
		}
	}
,	product_type:{
		name: 'product type'
	,	key: 'product_type'
	,	image_url:'./res/icons/product.png'
	,	values:{
			accessories:66
		,	bags:67
		,	clothes:68
		,	jewelry:151
		,	'intimate wear':65
		,	shoes:63
		,	swimwear:271
		}
	}
,	
}