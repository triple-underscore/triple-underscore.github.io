'use strict';

/* TODO
CLICK_HANDLERS

*/


/******** 付帯機能 *********/

/** 付帯機能 初期化
PAGE_DATA member
	spec_status:
		ED, REC, etc.
	original_url:
		原文 URL
	original_urls:
		原文 URL（複数
	main:
		'MAIN'
	toc:
		目次 id
	alt_refs:
		'references',
	word_switch:
		false
	no_index:
		用語索引なしならば true
	no_original_dfn:
		どの dfn の id も原文にはないならば true
	fill_text_link: （選択子）
		要素内容の text を URL としてリンクを作成させる
	expanded:
		page は展開状態で保存されている
	ref_id_lowercase
		小文字 id
	ref_id_prefix
		'biblio-' etc.
*/


new function(){
	var init = function(){
		if(!Util._COMP_){
			window.setTimeout(init, 100);
			if(document.readyState === 'complete') {
				// this should not happen
				init = EMPTY_FUNC;
			}
			return;
		}

		document.body.addEventListener('click', onClick, false);
		document.body.addEventListener('dblclick', onDblClick, false);

		Util.fillMisc(PAGE_DATA);
		Util.dfnInit();
//		Util.contextMenuInit();

		var main = E(PAGE_DATA.main);// TODO main への依存を除去 -> main 要素
		Util.altLinkInit(main);// 

		document.addEventListener('visibilitychange', onVisibilityChange, false);

		Util.ref_position.init();
		Util.DEFERRED.forEach(function(f){f();});
		init = null;
	}

	window.setTimeout(init, 50);

	function onVisibilityChange(){
		if(document.hidden){
			// pagehide event も含まれる
			Util.removeAdditionalNodes();
		}
	}

	function onDblClick(event){
		Util.toggleSource(event.target);
	}
	function onClick(event){
		var that = Util;
		var handlers = that.CLICK_HANDLERS;
		var target = event.target;
		var handler = handlers[target.id];
		if(handler){
			handler(event);
			return;
		}

		switch(event.detail){
		case 0:// IE11 event.detail == 0?
		case 1:
			for(var e = target; e; e = e.parentNode){
				if(e.tagName in that.CONTAINER_TAGS) break;
				// consider to use Element.matches()/matchesSelector()
				var handler = handlers[e.tagName];
				if(handler){
					handler(e);
					return;
				}
			}
			break;
		}
		// default
		that.removeAdditionalNodes();

/*
	case 2:
		that.toggleSource(target);
		break;
*/
	}
}


Util.fillMisc = function(options){//PAGE_DATA
	if(options.expanded) return;

	// 参照文献 和訳リンク
	COMMON_DATA.addAltRefs();
	// ボタン類
	addControls(options);
	// auto-fill url text
	if(options.fill_text_link){
		repeat(options.fill_text_link, Util.supplyLinkFromText);
	}

	initAside(options);
	initSideway(options);
	return;

	function initAside(options){
		var e;
		if(e = E('_SPEC_URL')){
			e.href = options.original_url || '';
		}
		if(e = E('_THIS_PAGE')){
			e.href =
				'https://triple-underscore.github.io/' +
				window.location.pathname.match(/[^\/]+$/)[0];
	//		e.textContent = 'このページ';
		}
		if(e = E('_CONTACT')){
			e.innerHTML = '誤訳その他ご指摘／ご意見は<a href="https://triple-underscore.github.io/about.html">連絡先</a>まで。'
		}
	}

	function initSideway(options){
		var key = options.spec_status;
		if(!key) return;

		var text = {

WD: 'W3C Working Draft',
ED: 'W3C Editor’s Draft',
EDCG: 'W3C Community Group Draft Report',
PR: 'W3C Proposed Recommendation',
CR: 'W3C Candidate Recommendation',
REC: 'W3C Recommendation',
NOTE: 'W3C Working Group Note',
LS: 'Living Standard',
IETFPR: 'IETF PROPOSED STANDARD'
		}[key];
		if(!text) return;

		var color = { ED: 'red', EDCG: 'orange', IETFPR: 'gray', LS: 'green' }[key];
		var div = C('div');
		div.id = 'sideways-logo';
		if(color) div.style.background = color;
		div.textContent = text;
		document.body.appendChild(div);
	}

	function addControls(options){
		var controls = C('div');
		controls.id = 'view_control';
		// controls.onmouseover = function(GUI 作成) ... accesskey はどうする？
		add_button('　　目次　　', 'A', '_toggle_toc');
		if(!options.no_index){
			Util.indexInit()
			add_button('索引', 'S', '_toggle_index');
		}
		add_button('原文', 'Z', '_toggle_source');
		if(options.word_switch){ // TODO move to common0a.js
			add_button('語の和英', 'X', '_toggle_words');
		}

		var e = E('_optional_controls');//TODO
		if(e){
			controls.appendChild(e);
		}
//		controls.appendChild(Util.CONTROL_UI);

		document.body.appendChild(controls);

		function add_button(label, key, id){
			var b = C('input');
			b.type = 'button';
			b.value = label;
			b.id = id;
			b.tabIndex = 1;
			if(key){
				b.accessKey = key;
				b.title = 'アクセスキー： ' + key;
			}
			controls.appendChild(b);
		}
	}
	
};

Util.removeAdditionalNodes = function(refresh){
	this.dfnHide(refresh);
	this.indexHide(refresh);
	this.ADDITIONAL_NODES.forEach(function(node){
		if(node.parentNode){
			node.parentNode.removeChild(node);
		}
	});
};


Util.CONTAINER_TAGS = {
	SECTION:1, PRE:1, DIV:1, DL:1, UL:1, OL:1, NAV:1, BODY:1, A:1
};

Util.CLICK_HANDLERS = {
//	_toggle_source:
//	_toggle_toc:
//	view_control:
//	_toggle_index 用語索引 

//	_toggle_words
//	DFN, DT
//	H2, H3, H4, H5, H6
};
/** 原文表示切替 */
Util.CLICK_HANDLERS._toggle_source = function(){
	Util.switchView(function(){
		var on = document.body.classList.toggle('show-original');
		COMMON_DATA.setState('show_original', on);
	});
};
/** 目次表示切替 */
Util.CLICK_HANDLERS._toggle_toc = function(){
	Util.switchView(function(){
		var on = document.body.classList.toggle('side-menu');
		Util.ref_position.releaseAndFix()
		COMMON_DATA.setState('side_menu', on);
	});
};
/** 全体表示 常時化切替 */
Util.CLICK_HANDLERS.view_control = function(event){
	var e = E('view_control');
	if(event.target !== e) return;
	e.classList.toggle('_hoverd')
};

//	_toggle_index 用語索引 


/** 原文表示開閉（個別）*/
Util.toggleSource = function(target){
	if(target.lang === 'en') return;
	for(var e = target; e; e = e.parentNode){
		if(e.tagName === 'SECTION') return;
		var c = e.lastElementChild;
		if(c && c.lang === 'en'){
			e.classList.toggle('show-original');
			return;
		}
	}
};
	// click handler



/** 語彙切替（内容生成） UI */

Util.create_word_switch = function(source_data){
	var w_switch = C('span');

	new function(){
		w_switch.className = '_hide_if_expanded';
		var html = 
'<input type="button" id="_words_levelX" tabindex="1" accesskey="X" value="用語" title="アクセスキー： X" >';

		source_data.levels.forEach(function(label, index){
			html += 
'<label><input type="radio" id="_words_level'
+ index
+ '" name="_words" />'
+ label
+ '</label>'
			;
		});
		w_switch.innerHTML = html;
	}

	check_level();
	E('view_control').appendChild(w_switch);
//	this.CONTROL_UI.appendChild(w_switch);

	w_switch.onclick = function(event){
		var level = (event.target.id || '').match(/^_words_level(\w)$/);
		if(!level) return;
		level = parseInt(level[1]);
		var auto = isNaN(level); // _words_levelX

		if(auto){
			level = (source_data.level + 1 ) % source_data.levels.length;
		}
		if(level === source_data.level) return;
		Util.switchView(function(){
			source_data.switchWords(level);
		}, true);
		COMMON_DATA.setState('words', source_data.level);

		if(auto){
			check_level();
		}
	}

	function check_level(){
		w_switch.children[source_data.level + 1].firstChild.checked = true;
	}
}


/** 索引機能 初期化*/
Util.indexInit = function(){

	var list = null;        // 文書順の索引項目（ DOM node ）リスト
	var sorted = true;      // true 字句順 / false 文書順
	var scroll_top = 0;     // 最後のスクロール位置
	var index_node = init(); // 索引コンテナ node

	index_node.onclick = function(event){
		if(event.target === index_node.firstChild){ //button
			show_index(!sorted);
		}
		// indexHide が呼ばれないようにする
		event.stopPropagation();
	};
	this.indexHide = indexHide;

	this.CLICK_HANDLERS._toggle_index = function(event){
		if(indexHide()) return;
		show_index(sorted);
	};

return;

	function init(){
		// 索引コンテナ, 切替ボタン, 一覧 Box
		var index_node = C('div');
		index_node.className = '_additional'; // for CSS
		index_node.id = '_index_table'; // for CSS ：子要素はすべて display:block
		index_node.appendChild(C('button'));// 表示順序 切替ボタン
		index_node.appendChild(C('div'));//一覧 Box
		return index_node;
	}

	function indexHide(refresh){
		if(!list) return;
		var parent = index_node.parentNode;
		var list_box = index_node.lastChild;
		if(parent){
			scroll_top = list_box.scrollTop;
		}
		if(refresh){
			list = null;
			list_box.textContent = '';
		}
		if(parent){
			parent.removeChild(index_node);
			return true;
		}
	};

	function show_index(sort){
		sort = sort? true : false;
		var list_box = index_node.lastChild;

		if(!list || (sorted !== sort)) {
			list_box.textContent = '';
			if(!list) list = collect();
			var list1 = list;
			var button = index_node.firstChild;
			if(sort){
				button.textContent = '出現順に切替';
				list1 = list.slice(0);
				list1.sort(function(a, b){
					return a.textContent <= b.textContent ? -1 :1 ;
				});
			} else {
				button.textContent = '字句順に切替';
			}
			list1.forEach(function(e){list_box.appendChild(e)});
		}
		sorted = sort;
		document.body.appendChild(index_node);
		list_box.scrollTop = scroll_top;
	}

	function collect(){
		var list = [];
		repeat('main dfn[id], main dt[id]', add_item);
		return list;

		function add_item(dfn){
			var text = dfn.textContent.trim();
			if(!text) return;
			var id = dfn.id;
			var a = C('a');

			a.href = '#' + id;
			var e = dfn.firstElementChild;
			var childE = e
				&& (e === dfn.firstChild)
				&& (e === dfn.lastChild)
				&& (e.tagName !== 'A');
			if(childE){
				a.appendChild(e.cloneNode(true));
			} else {
				a.textContent = text;
			}
			if(dfn.className){
				a.className = dfn.className;
			} else if(!childE){
				var tag = dfn.parentNode.tagName;
				if( (tag === 'PRE') || (tag === 'CODE') ){
					a.className = 'code';
				}
			}
			list.push(a);
		}
	}
}



/** 表示モード切替（スクロール位置も復帰）

	引数 callback : 実際に表示切替を行う関数
	引数 refresh : 切替時にページ DOM 内容が置換される場合 true

*/

Util.switchView = function(callback, refresh){

	if(refresh){
		Util.removeAdditionalNodes(refresh);
	}

	// スクロール位置を保存 -> callback -> 復帰
	var pos = this.ref_position.current(refresh);
	callback();
	this.ref_position.restore(pos);
};

/** reflow 時の scroll 位置の復帰のための基準位置 */

Util.ref_position = {
	// 現在の基準 scroll 位置
	current: function(refresh){
		if(!document.elementFromPoint) {// 低精度 fallback
			return {ratio: document.body.scrollTop / document.body.scrollHeight };
		}
		var H = window.innerHeight || 800;
		var W = (document.body.clientWidth || 800);
		var h = 999999, e = null;
		for(var y = 0; y < H ; y += H / 10 ){
			var x = W / 2 + W * (Math.random() - 0.5) * 0.7;
			var e1 = document.elementFromPoint(x, y);
		// offsetParent: body / display:none / position:fixed に対しては null
			if(!e1 || (e1 === e) || !e1.offsetParent) continue;
			var h1 = e1.offsetHeight;
			if(h1 < h){
				e = e1;
				h = h1;
				if(h < (H / 3)) break;
			}
		}
		if(refresh){
			/*
表示切替後の基準位置となる要素は id を持つもののみを対象にする
精度が落ちる代わりにページ内容が置換される場合にも対応する
	課題
			SVG 画像が object タグで埋め込まれている場合は切替後の表示位置がずれる
*/
			while(!e.id && e.offsetParent){
				e = e.parentNode;
			}
			return {
				id: e.id,
				ratio: - this.offsetY(e) / e.offsetHeight
			};
		} else {
			return (h < 999999) ?
				 { element: e, y_offset: this.offsetY(e) }
				 : {element: document.body, y_offset: 0 }
			;
		}
	},

	// reflow 後に scroll 位置を基準位置に復帰
	restore: function(pos){
		var e;
		if(pos.id){ //refreshed
			var e = (pos.id && E(pos.id)) || document.body;
			window.scrollBy(0, this.offsetY(e) + pos.ratio * e.offsetHeight);
		} else if(pos.element){
			e = pos.element;
			// 基準位置の要素が表示切替後に未表示になった場合は文書順で前の要素を基準にする
			while(! e.offsetParent){
				while(! e.previousElementSibling) {
					e = e.parentNode;
					if(! e) return;
				}
				e = e.previousElementSibling;
			}
			var h = this.offsetY(e);
			window.scrollBy(0, h - pos.y_offset);
		} else if(pos.ratio){
			// 低精度 fallback
			window.scrollTo(0, pos.ratio * document.body.scrollHeight);
		}
	},

/* 注記
	e.scrollIntoView(); window.scrollBy(0, - this.y_offset);
	の方法は、 scrollBy の時点で scrollIntoView の処理が
	途中でキャンセルされて位置がずれることがある( Safari )
*/

	// 要素のウィンドウ内での表示位置 y を得る
	offsetY: function(e){
		var y = 0;
		while(e){
			y += e.offsetTop;
			e = e.offsetParent;
		}
		return y - window.scrollY;
//		return e.getBoundingClientRect().top; より軽い？
	},

	//	resize 時の reflow 頻度を抑えるため、body の width を固定
	//	resize 操作を終える度, または目次切り替えの度に更新する：
	releaseAndFix: function(){
		var body = document.body;
		body.style.width = '';
		body.style.width = window.getComputedStyle(body).width;
	},

/** resize/zoom/orientationchange 時に
	基準位置へ復帰する／基準位置を更新するようにする

	課題: zoom 時に resize イベントが生じない場合がある
*/

	init: function(){
		var ref_position = this;
		var reflow_timer = 0;
		var pos = null;

		if(!document.elementFromPoint) return;

		window.addEventListener('resize', onreflow, false);
		window.addEventListener('orientationchange', onreflow, false);

		window.setTimeout(function(){
			ref_position.releaseAndFix();
		}, 500);

		function onreflow(){
			if(reflow_timer){
				clearTimeout(reflow_timer);
			} else {
				pos = ref_position.current();
			}
			reflow_timer = window.setTimeout(endReflow, 300);
		}

		function endReflow(){
			// resize 操作の「終了」
			ref_position.releaseAndFix();
			// resize event は reflow 完了後とされているが、そうでないこともある様子 (Safari)
			ref_position.restore(pos);
			pos = null;
			reflow_timer = 0;
		}
	}
}


/** 被参照リンク一覧の表示

id 付きの dfn, dt, H2 〜 H6 タグの参照元リンクの一覧, 原文リンク を表示する

動作前提：
	document.querySelectorAll
	element.scrollIntoView
		(課題) speech browser でも有効にするためには？

	// 必須ではない
	getBoundingClientRect


//original_url, no_original_dfn
*/


Util.dfnInit = function(){
		// current target (the clicked element)
	var dfnStart = null;
		// all the source anchors targeting to dfnStart in the document
	var dfnLinks = null;
		// links to dfnLinks
	var dfnIndecies = null;
	var dfnJumpCount = 0;
	var dfnIndex = -1;
//	var dfnTargetScrollPositionY = 0;

	var dfnPanel = C('div');
		dfnPanel.id = 'dfnPanel';
		dfnPanel.innerHTML =
			'<div><input type="button" value="←"/><input type="button" value="→"/><a></a><a class="_additional">(原文)</a></div><ul></ul>';
		// a link to dfnStart
	var dfnTarget = dfnPanel.firstElementChild.children[2];
		// link to the corresponding element in the original spec
	var dfnOriginal = dfnTarget.nextElementSibling;

	var original_id_map;

	new function(){
		var e = E('_original_id_map');
		original_id_map = e ?
			Util.getMapping(e, {keep: true}) :
			Object.create(null)
		;
	}

	new function(){

		var b = dfnTarget.previousElementSibling;
		b.onclick = function(event){navBy( 1, event);}
		b = b.previousElementSibling;
		b.onclick = function(event){navBy(-1, event);}

		dfnPanel.lastElementChild.onclick = function(event){
			// dfnHide が呼ばれない様にする
			event.stopPropagation();
		};

		// keyboard navigation
		dfnPanel.tabIndex = '-1';
		dfnPanel.onkeydown = function(event){
			if(event.metaKey || event.altKey || event.ctrlKey) return;
			switch(event.key){
			case "Escape":
	//			dfnJump0(-1); // back to the original position
				dfnHide();
				break;
			case "ArrowLeft":
				var index = dfnLinks.length + 1;
				navBy(-1, event);
				break;
			case "ArrowRight":
				navBy( 1, event);
				break;
			}
		};

		// 課題 hash が変化しない場合も，スクロールされているときは呼び出される必要あり
		window.addEventListener('hashchange', dfnJump, false);
		function dfnJump(event){
			if(!dfnStart) return;
			//event.newURL may not be supported (e.g. IE9)
			var hash = window.location.hash;
			var num = hash.match(/_xref-\d+-(\d+)/);
			if(!num) return;
			dfnJump0(parseInt(num[1], 10));
		}

		function navBy(d, event){
			var L = dfnLinks.length + 1;
			var index = (dfnIndex + d + L) % L;
			event.preventDefault();
			event.stopPropagation();
			dfnJump0(index);
			var ul = dfnPanel.lastElementChild;
			if(ul.scrollHeight <= ul.clientHeight) return;
			// auto scroll
			var emp = em_panel.current;
			if(!emp) return;
			var r1 = ul.getBoundingClientRect();
			var r2 = emp.getBoundingClientRect();
			if(r2.top < r1.top || r2.bottom > r1.bottom ){
				emp.scrollIntoView();
			}
		}
	}

	var em_external = Object.create(null);
	var em_panel = Object.create(null);
	em_external.emphasize = 
	em_panel.emphasize = 
	function(e){
		// emphasize only one of
		e = e || null;
		var e0 = this.current || null;
		if(e0 === e) return;
		if(e0){
			e0.classList.toggle('highlight');
		}
		if(e){
			e.classList.toggle('highlight');
		}
		this.current = e;
	}

	this.dfnHide = dfnHide;

	var handlers = this.CLICK_HANDLERS;
	handlers.DT =
	handlers.DFN =
	handlers.H1 =
	handlers.H2 =
	handlers.H3 =
	handlers.H4 =
	handlers.H5 =
	handlers.H6 = dfnShow;
	return;// dfnShow;

	function setLinkForOriginal(id, is_header){
		// 原文リンク先を設定
		dfnOriginal.style.display = 'none';

		if(id.charAt(0) === '_') return; // 和訳固有の id
		if(original_id_map[id] === '') return; // 和訳固有の id
		if(!is_header && PAGE_DATA.no_original_dfn) return;
		var original_url = PAGE_DATA.original_url;
		var urls = PAGE_DATA.original_urls;
		if(urls){// 複数の原文 URL に分岐
			for(var e = E(id); e; e = e.parentNode){
				if(urls.hasOwnProperty(e.id)){
					original_url = urls[e.id];
					break;
				}
			}
		}
		if(!original_url) return;

		dfnOriginal.href = original_url + '#' + (original_id_map[id] || id);
		dfnOriginal.style.display = '';
	}

	function originalURL(id){
		return PAGE_DATA.original_url;
	}

	function dfnHide(){
		if(!dfnStart) return;
		em_external.emphasize();
		em_panel.emphasize();
		dfnIndecies = 
		dfnLinks = 
		dfnStart = null;
		if(dfnPanel.parentNode){
			dfnPanel.parentNode.removeChild(dfnPanel);
		}
	}

	function dfnJump0(index){
// dfnLinks.item() throws an exception in Safari, if the index arg is out of the range
		var a = dfnLinks[index];
		var emp;
		if(a) {
			emp = dfnIndecies[index];
		} else {
			index = -1;
			a = dfnStart;
			emp = dfnTarget;
		}
		dfnIndex = index;
		em_panel.emphasize(emp);
		em_external.emphasize(a);

/*
	Show the target at (innerHeight / 10) px below from the top of the viewport
	We use scrollBy instead of scrollIntoView to show surrounding text

	Note:
		In webkit, scrollIntoView behaves wired, when a === dfnStart.
*/
		window.scrollBy(0, a.getBoundingClientRect().top - (window.innerHeight / 10));
//		if(a === dfnStart) window.scrollTo(0, dfnTargetScrollPositionY); // 元位置...

//	make the panel's postion:fixed to the bottom of the view port
		if(dfnPanel.className !== '_fixed'){
			dfnPanel.className = '_fixed';
			dfnPanel.style.left =
			dfnPanel.style.right = '';
		}
	}

	function dfnShow(dfn){
		Util.removeAdditionalNodes();
		if(dfn === dfnStart) return;
		var id = dfn.id;
		var is_header = /^H\d$/.test(dfn.tagName);
		if(!id && is_header){
			id = dfn.parentNode.id;
		}
		if(!id) return;
		dfnStart = dfn;
//		dfnTarget.textContent = (is_header && dfn.title) || ('#' + id);
		dfnTarget.textContent = dfn.title || ('#' + id);
		dfnTarget.href = '#' + id;
		dfnIndex = -1;
//		dfnTargetScrollPositionY = window.scrollY;

		setLinkForOriginal(id, is_header);

		// 合致するものが無ければ空の NodeList
		dfnIndecies = [];
		dfnLinks = document.querySelectorAll(
			dfn.getAttribute('data-cycling') || 'a[href="#' + id + '"]'
		);
		var L = dfnLinks.length;

		var ul = dfnPanel.lastElementChild;
		ul.textContent = '';
		ul.className = L ? '' : 'empty';

		var lastSection;
		var lastLi;
		var n;
		var prefix = '#_xref-' + (dfnJumpCount++) + '-';
		
		for(var i = 0; i < L; i++){
			var link = dfnLinks[i];
			for(var section = link.parentNode; section;
				section = section.parentNode){
				if(section.tagName === 'SECTION' ||
					section.tagName === 'NAV' ) break;
			}

			var a = C('a');
			if (section !== lastSection) {
				lastSection = section;
				var header = Util.get_header(section);
				n = 1;
				lastLi = C('li');
				ul.appendChild(lastLi);
				a.textContent = (header && header.textContent) || '[no header]';
			} else {
				a.textContent = (++n);
			}
			//make hash always unique
			a.href = prefix + i;
			lastLi.appendChild(a);
			dfnIndecies.push(a);
		}

		// 表示を初期状態に戻す
		dfnPanel.className = '';
		dfnPanel.style.left =
		dfnPanel.style.right = 'auto';
		dfn.insertBefore(dfnPanel, dfn.firstChild);
		//dfn.appendChild(dfnPanel);
		dfnPanel.focus();

		if(dfnPanel.getBoundingClientRect){
			var r = dfnPanel.getBoundingClientRect();
			var w = document.body.clientWidth; // exclude scroll bar
			if(r.right > w) {
				if(r.width > w){
					dfnPanel.style.left = 0;
				} else {
					dfnPanel.style.right = 0;
				}
			}
		}
	}
}


/** 外部リンク日本語訳リンク追加 */
Util.altLinkInit = function(root){
//	COMMON_DATA.JA_BASIS[''] = ''; //
	var ja_link = C('a');
	this.ADDITIONAL_NODES.push(ja_link);
	ja_link.id = '_ja_link';
	ja_link.className = '_additional';
	ja_link.textContent = '【和訳】';

	root.addEventListener('mouseover', insert_ja_link, false);
	//focus does not bubble
	root.addEventListener('focus', insert_ja_link, true);

	function insert_ja_link(e){
		var a = e.target;
		if(a.tagName !== 'A'){
			a = a.parentNode;
			if(a.tagName !== 'A') return;
		}
		if(a.className === '_additional') return;

		var alt_url = COMMON_DATA.altURL(a.getAttribute('href'));
		if(!alt_url) return;
		ja_link.href = alt_url;
		a.parentNode.insertBefore(ja_link, a.nextSibling);
	}
}

/* TODO
Util.contextMenuInit = function(){
	-> common-01.js
}
*/

/** 参照文献に日本語訳リンク追加
    外部リンク→ 日本語訳 データ構築
引数
	参照文献節の id
生成内容：
	<div class="trans-ja-refs"><a href="リンク先">'日本語訳'[番号|注釈]?</a></div>
挿入位置：
	<dd> の末尾
加えて、参照文献の項目に id が与えられていない場合は，自動的に付加する

※ 参照文献節が内容生成の対象にされている場合は再追加の必要あり
*/


COMMON_DATA.addAltRefs = function(id){
	var LABELS = {
		'主': '日本語訳',
		'副': '日本語訳',
		'版': '最新発行版',
		'編': '編集者草案'
	};

	var JA_REFS = this.JA_REFS;
	var JA_LINKS = this.JA_LINKS;
	var JA_BASIS = this.JA_BASIS;
	var REF_DATA = this.REF_DATA;
	var REF_KEY_MAP = Util.get_mapping(this.REF_KEY_MAP);

	var ref_id_prefix = PAGE_DATA.ref_id_prefix || '';
	var ref_id_lowercase = PAGE_DATA.ref_id_lowercase || false;


	Util.get_mapping(
		COMMON_DATA.REF_DATA2
			.replace(/~(\w+)/g, function(s, s1){ return JA_BASIS[s1];})
			.replace(/● */g, ':https://'),
		JA_LINKS
	);

	var mapping = Object.create(null);

	var add_ref_link = EMPTY_FUNC;
	var ref_node_list;
	if(PAGE_DATA.ref_data){
		add_ref_link = add_ref_link2;
		collect_entries2(PAGE_DATA.ref_data)
	} else{
		id = id || PAGE_DATA.alt_refs;
		if(id){
			add_ref_link = add_ref_link1;
			repeat('#' + id + ' dt', collect_entries1);
		}
	}


	var m;
	var rxp = /^(\w+)=(\S)(\d*)[\t ]+(~\w*)?([^\s●]+)(●.*)?$/mg;
	while(m = rxp.exec(REF_DATA)){
		var key = m[1];
		var mark = m[2];
		var label_index = m[3] || '';
		var prefix = m[4];
		var is_local = prefix === '~';
		var url0 = m[5];
		var label = ( m[6]? m[6].slice(1): LABELS[mark] ) + label_index;
		var url = url0;
		if(prefix){
			prefix = prefix.slice(1);
//			if(! prefix in JA_BASIS) throw prefix;
			url = JA_BASIS[prefix] + url0;
		}
		var url1 = ( url[0] === '＃' ) ?
			( 'http://' + url.slice(1)) :
			( 'https://' + url);
		switch(mark){
			case '主':
				JA_REFS[key] = is_local? ( '.' + url0 ) : url1;
			case '副':
				add_ref_link(key, url1, label);
				break;

			case '版':
			case '編':
				add_ref_link(key, url1, label);
			default:
				if(!(url in JA_LINKS)) JA_LINKS[url] = '@' + key;
		}
	}

	if(ref_node_list){
		ref_node_list.forEach(generateRefsHTML);
	}

	// 下位 directory への和訳リンク生成防止
	if(PAGE_DATA.original_url){
		COMMON_DATA.JA_LINKS[
			PAGE_DATA.original_url.replace(/^https?:\/\//,'')
		] = '';
	}


//	console.log(JSON.stringify(JA_LINKS));
	function refKey(s){
		key = s.replace(/[^\w]/g, '').toUpperCase();
		return REF_KEY_MAP[key] || key;
	}

	function collect_entries1(dt){
		var text = dt.textContent;
		if(!dt.id){
			// dt に id を自動付与
			text = text.slice(1, -1)// remove surrounding [,]
			dt.id = ref_id_prefix +
				(ref_id_lowercase ? text.toLowerCase() : text );
		}
		var key = refKey(text);
		if(key in mapping){
			// 重複は最初の出現への参照を追加
			add_ref_link0(dt, '#' + mapping[key].id, '【↑】')
		} else {
			mapping[key] = dt;
		}
	}

	function add_ref_link1(key, url, label){
// TODO url が同じなら追加しない
		var dt = mapping[key];
		if(!dt) return;
		var dd = add_ref_link0(dt, url, label);
		if(dd !== dt){
			mapping[key] = dd;
		}
	}

	function add_ref_link0(dd, url, label){
		var dd1;
		while(dd1 = dd.nextElementSibling){
			if(dd1.tagName !== 'DD') break;
			dd = dd1;
		}
		if(dd.className !== 'trans-ja-refs'){
			dd1 = C('dd');
			dd1.className = 'trans-ja-refs';
			dd.parentNode.insertBefore(dd1, dd.nextSibling);
			dd = dd1;
		}
		var a = C('a');
		a.href = url;
		a.textContent = label;
		dd.appendChild(a);
		return dd;
	}

	/* 素のテキストから生成（ bikeshed 用） */

	function collect_entries2(selector){
		ref_node_list = [];
		repeat(selector, function(node){
			var data = node.textContent;
			data.replace(/\n\[.+\]/g, function(ref_name){
				var key = refKey(ref_name);
				mapping[key] = '';
				return '';
			});
			ref_node_list.push({ root: node, data: data });
		});
	}

	function add_ref_link2(key, url, label){
		var v = mapping[key];
		if(v === undefined) return;
		var html = '<a href="' + url + '">' + label + '</a>';
		mapping[key] += html;
	}

	function generateRefsHTML(item){
		var last_key = '';
		var html = item.data
		.replace(/\n\[(.+)\]/g, function(match, ref_name){
			var id = ref_id_prefix +
				(ref_id_lowercase ? ref_name.toLowerCase() : ref_name );

			var last_key1 = last_key;
			var key = refKey(ref_name);
			var altref = mapping[key];
			if(altref){
				if(altref[0] !== '<'){
					last_key = '\n<dd class="trans-ja-refs"><a href="#' + altref + '">【↑】</a></dd>'
				} else {
					last_key = '\n<dd class="trans-ja-refs">' + altref + '</dd>'
					mapping[key] = id;
				}
			} else {
				last_key = '';
			}
			return ( last_key1
				+ '\n\n<dt id="' + id + '">[' + ref_name + ']</dt>'
			);
		})
		.replace(/\s+URL: +(https?:[^\s]+)/g,
			'\n<dd><a href="$1">$1</a></dd>'
		).replace(/\n +(.+)/g, '\n<dd lang="en-x-a0">$1</dd>');
		html += last_key;

		var dl = C('dl');
		dl.innerHTML = html;
		item.root.parentNode.replaceChild(dl, item.root);
	}
}


/** 文献 id = 英文 URL = 和訳 URL の対応データ

URL の先頭の文字 '＃' は http:// ／ 他は https://
*/

COMMON_DATA.JA_REFS = Object.create(null); // 文献 id -> 和訳 URL
COMMON_DATA.JA_LINKS = Object.create(null);// 英文 URL -> 文献 id

// 短縮形 URL の接頭辞 対応表
COMMON_DATA.JA_BASIS = {
	'' :       'triple-underscore.github.io',
	XML :      'triple-underscore.github.io/XML',
	mitsue:    '＃standards.mitsue.co.jp/resources/w3c/TR',
	momdo:     '＃momdo.s35.xrea.com/web-html-test/spec',
	momdoG:    'momdo.github.io',
	ipa:       'www.ipa.go.jp/security/rfc',
	adagio:    '＃www.y-adagio.com/public/standards',
	TR:        'www.w3.org/TR',
	CSSWG:     'drafts.csswg.org',
	HTML5:     'html.spec.whatwg.org/multipage',
	IETF:      'tools.ietf.org/html',
	HTTPWG:    '＃httpwg.github.io/specs',
	suika:     'wiki.suikawiki.org',
//	default:   ''
};

/*
主 副 版 編 ・
■ ■ ■ ■ 　 参照文献に追加する？
　 　 ■ ■ ■ 和訳リンク対応表に追加する？  JA_LINKS に (url:ref-id) を追加
■ 　 　 　 　 hover 時に表示する？       JA_REFS に  (ref-id:url) を追加
*/

COMMON_DATA.REF_DATA = '\n\
ARIA=主               ~momdoG/wai-aria-1.1/\n\
ARIA=・               w3c.github.io/aria/aria/aria.html\n\
ARIAHTML=主           ~momdoG/html-aria/\n\
ARIAHTML=・           w3c.github.io/html-aria/\n\
ATOM=主               ＃momdo.s35.xrea.com/web-html-test/spec/rfc4287j.html\n\
ATOM=副               ＃www.futomi.com/lecture/japanese/rfc4287.html\n\
COMPOSITING1=主       ~/compositing-ja.html\n\
COMPOSITING1=版       ~TR/compositing-1/\n\
COMPOSITING1=編       dev.w3.org/fxtf/compositing-1/\n\
CORS=副               ~/Fetch-ja.html●Fetch 日本語訳\n\
CSP3=主               ~/CSP3-ja.html\n\
CSP3=副2              hashedhyphen.github.io/webappsec-specjp/csp/index.html\n\
CSP3=編               w3c.github.io/webappsec-csp/\n\
CSP2=主               ~/CSP-ja.html\n\
CSP2=版               ~TR/CSP2/\n\
CSP2=編               w3c.github.io/webappsec/specs/content-security-policy/\n\
CSP1=主               ~/CSP10-ja.html\n\
CSP1=版               ~TR/CSP/\n\
CSS1=主               ＃www.doraneko.org/webauth/css1/19961217/Overview.html\n\
	CSS1=＊               ~TR/REC-CSS1\n\
CSS21=主              ~momdoG/css2/Overview.html\n\
CSS21=副2             ＃hp.vector.co.jp/authors/VA022006/css/index.html\n\
CSS21=副              ~adagio/tr_css2/toc.html●2.0 日本語訳 2\n\
CSS21=版              ~TR/CSS2/\n\
CSS21=編              ~CSSWG/css2/\n\
CSSALIGN=主           ~/css-align-ja.html\n\
CSSALIGN=版           ~TR/css3-align/\n\
CSSALIGN=編           ~CSSWG/css-align/\n\
CSSANIMATIONS1=版     ~TR/css3-animations/\n\
CSSANIMATIONS1=・     ~CSSWG/css-animations/\n\
CSSANIMATIONS1=主     ~/css-animations-ja.html\n\
CSSANIMATIONS1=編     ~CSSWG/css-animations-1/\n\
CSSBACKGROUNDS3=主    ~/css-backgrounds-ja.html\n\
CSSBACKGROUNDS3=副2   ~mitsue/css3-background/\n\
CSSBACKGROUNDS3=版    ~TR/css3-background/\n\
CSSBACKGROUNDS3=編    ~CSSWG/css-backgrounds-3/\n\
CSSBACKGROUNDS3=・    ~CSSWG/css3-background/\n\
CSSBREAK3=主          ~/css-break-ja.html\n\
CSSBREAK3=版          ~TR/css-break-3/\n\
CSSBREAK3=編          ~CSSWG/css-break/\n\
CSSBREAK3=・          ~CSSWG/css-break-3/\n\
CSSMULTICOL=主        ~/css-multicol-ja.html\n\
CSSMULTICOL=編        ~CSSWG/css-multicol-1/\n\
CSSMULTICOL=版        ~TR/css3-multicol/\n\
CSSCOLOR=主           ~/css-color-ja.html\n\
CSSCOLOR=編           ~CSSWG/css-color/\n\
CSS3COLOR=主          ~mitsue/css3-color/\n\
CSS3COLOR=副          ~/css-color-ja.html●Level 4 日本語訳\n\
CSS3COLOR=版          ~TR/css3-color/\n\
CSSCOUNTERSTYLES=主   ~/css-counter-styles-ja.html\n\
CSSCOUNTERSTYLES=編   ~CSSWG/css-counter-styles/\n\
CSSCOUNTERSTYLES=版   ~TR/css-counter-styles-3/\n\
CSS3COLOR=編          ~CSSWG/css-color-3/\n\
CSSEXCLUSIONS=主      ~/css-exclusions-ja.html\n\
CSSEXCLUSIONS=版      ~TR/css3-exclusions/\n\
CSSEXCLUSIONS=編      ~CSSWG/css-exclusions/\n\
CSS3FONTS=主          ~/css-fonts-ja.html\n\
CSS3FONTS=版          ~TR/css3-fonts/\n\
CSS3FONTS=・          ~TR/css-fonts-3/\n\
CSS3FONTS=編          ~CSSWG/css-fonts-3/\n\
CSS3FONTS=・          ~CSSWG/css-fonts/\n\
CSSFONTLOAD=主        ~/css-font-loading-ja.html\n\
CSSFONTLOAD=版        ~TR/css-font-loading/\n\
CSSFONTLOAD=編        ~CSSWG/css-font-loading/\n\
CSS3IMAGES=主         ~/css-images-ja.html\n\
CSS3IMAGES=副         ~momdo/CR-css3-images-20120417.html\n\
CSS3IMAGES=版         ~TR/css3-images/\n\
CSS3IMAGES=編         ~CSSWG/css-images-3/\n\
CSSLOGICAL=主         ~/css-logical-ja.html\n\
CSSLOGICAL=編         ~CSSWG/css-logical/\n\
CSSPAGE=主            ~/css-page-ja.html\n\
CSSPAGE=版            ~TR/css3-page/\n\
CSSPAGE=編            ~CSSWG/css-page/\n\
CSSPAGE=・            ~CSSWG/css-page-3/\n\
CSSOVERFLOW=主        ~/css-overflow3-ja.html\n\
CSSOVERFLOW=版        ~TR/css-overflow-3/\n\
CSSOVERFLOW=編        ~CSSWG/css-overflow/\n\
CSSPOSITION=編        ~CSSWG/css-position/\n\
CSSPOSITION=版        ~TR/css3-positioning/\n\
CSSSHAPES1=主          ~/css-shapes-ja.html\n\
CSSSHAPES1=版          ~TR/css-shapes-1/\n\
CSSSHAPES1=編          ~CSSWG/css-shapes-1/\n\
CSSSIZING=主          ~/css-sizing-ja.html\n\
CSSSIZING=版          ~TR/css-sizing/\n\
CSSSIZING=編          ~CSSWG/css-sizing/\n\
CSSSIZING=・          ~CSSWG/css-sizing-3/\n\
CSS3SPEECH=主         ~/css-speech-ja.html\n\
CSS3SPEECH=版         ~TR/css3-speech/\n\
CSS3TEXT=主           ~/css-text-ja.html\n\
	CSS3TEXT=主           suzukima.github.io/css-ja/css3-text/\n\
CSS3TEXT=編           ~CSSWG/css-text-3/\n\
CSS3TEXT=版           ~TR/css-text-3/\n\
CSS3TEXTDECOR=主      ~/css-text-decor-ja.html\n\
CSS3TEXTDECOR=副2     ~momdoG/css-text-decor-3/\n\
CSS3TEXTDECOR=編      ~CSSWG/css-text-decor-3/\n\
CSS3TEXTDECOR=版      ~TR/css-text-decor-3/\n\
CSSTRANSFORMS1=・     ~CSSWG/css-transforms/\n\
CSSTRANSFORMS1=主     ~/css-transforms-ja.html\n\
CSSTRANSFORMS1=副     ~/css-transforms2-ja.html●Level 2 日本語訳\n\
CSSTRANSFORMS1=版     ~TR/css3-transforms/\n\
CSSTRANSFORMS1=編     ~CSSWG/css-transforms-1/\n\
CSSTRANSFORMS1=・     ~CSSWG/css-transforms/\n\
CSSTRANSITIONS1=・    ~CSSWG/css3-transitions/\n\
CSSTRANSITIONS1=主    ~/css-transitions-ja.html\n\
CSSTRANSITIONS1=版    ~TR/css3-transitions/\n\
CSSTRANSITIONS1=編    ~CSSWG/css-transitions/\n\
CSSCASCADE=主         ~/css-cascade-ja.html\n\
CSSCASCADE=版         ~TR/css3-cascade/\n\
CSSCASCADE=・         ~TR/css-cascade-3/\n\
CSSCASCADE=・         ~CSSWG/css-cascade-3/\n\
CSSCASCADE=編         ~CSSWG/css-cascade-4/\n\
	CSSCASCADE3=・         ~CSSWG/css-cascade/\n\
CSSCONDITIONAL=主     ~/css-conditional-ja.html\n\
CSSCONDITIONAL=版     ~TR/css3-conditional/\n\
CSSCONDITIONAL=・     ~TR/css-conditional/\n\
CSSCONDITIONAL=編     ~CSSWG/css-conditional-3/\n\
CSSCONDITIONAL=・     ~CSSWG/css-conditional/\n\
CSSDEVICEADAPT=主     ~momdoG/css-device-adapt-1/\n\
CSSDEVICEADAPT=版     ~TR/css-device-adapt-1/\n\
CSSDEVICEADAPT=編     ~CSSWG/css-device-adapt/\n\
CSSDEVICEADAPT=・     ~TR/css-device-adapt/\n\
CSSDEVICEADAPT=・     ~CSSWG/css-device-adapt-1/\n\
CSSDISPLAY=主         ~/css-display-ja.html\n\
CSSDISPLAY=版         ~TR/css-display-3/\n\
CSSDISPLAY=編         ~CSSWG/css-display-3/\n\
CSSDISPLAY=・         ~CSSWG/css-display/\n\
CSSDISPLAY=・         ~TR/css-display/\n\
CSSFLEX=主            ~/css-flexbox-ja.html\n\
CSSFLEX=版            ~TR/css-flexbox-1/\n\
CSSFLEX=・            ~TR/css3-flexbox/\n\
CSSFLEX=編            ~CSSWG/css-flexbox-1/\n\
CSSGRID=主            ~/css-grid-ja.html\n\
CSSGRID=版            ~TR/css-grid-1/\n\
CSSGRID=編            ~CSSWG/css-grid-1/\n\
CSSINLINE=主          ~/css-inline-ja.html\n\
CSSINLINE=版          ~TR/css-inline/\n\
CSSINLINE=編          ~CSSWG/css-inline/\n\
CSSNAMESPACES=主      ~/css-namespaces-ja.html\n\
CSSNAMESPACES=副2     ~mitsue/css3-namespace/\n\
CSSNAMESPACES=副3     ~momdo/REC-css-namespaces-3-20140320.html\n\
CSSNAMESPACES=版      ~TR/css3-namespace/\n\
CSSNAMESPACES=編      ~CSSWG/css3-namespace/\n\
CSSOM=主              ~/cssom-ja.html\n\
CSSOM=版              ~TR/cssom/\n\
CSSOM=編              ~CSSWG/cssom/\n\
CSSOMVIEW=主          ~/cssom-view-ja.html\n\
CSSOMVIEW=版          ~TR/cssom-view/\n\
CSSOMVIEW=編          ~CSSWG/cssom-view/\n\
CSSPSEUDO4=主         ~/css-pseudo-ja.html\n\
CSSSCOPING1=主        ~/css-scoping-ja.html\n\
CSSSTYLEATTR=主       ~/css-style-attr-ja.html\n\
CSSSTYLEATTR=副2      ~mitsue/css-style-attr/\n\
CSSSTYLEATTR=版       ~TR/css-style-attr/\n\
CSSSYNTAX=・          ~CSSWG/css-syntax/\n\
CSSSYNTAX=主          ~/css-syntax-ja.html\n\
CSSSYNTAX=版          ~TR/css3-syntax/\n\
CSSSYNTAX=編          ~CSSWG/css-syntax-3/\n\
CSSSYNTAX=・          ~TR/css-syntax-3/\n\
CSSVARIABLES=主       ~/css-variables-ja.html\n\
CSSVARIABLES=編       ~CSSWG/css-variables/\n\
CSSTIMING=主          ~/css-timing-ja.html\n\
CSSTIMING=編          ~CSSWG/css-timing/\n\
CSSUI3=主             ~/css-ui-ja.html\n\
CSSUI3=副             ~momdoG/css-ui/\n\
CSSUI3=版             ~TR/css-ui-3/\n\
CSSUI3=・             ~TR/css3-ui/\n\
CSSUI3=編             ~CSSWG/css-ui-3/\n\
CSSVAL=主             ~/css-values-ja.html\n\
CSSVAL=副2            ~momdoG/css3-values/\n\
CSSVAL=版             ~TR/css3-values/\n\
CSSVAL=・             ~TR/css-values/\n\
CSSVAL=編             ~CSSWG/css-values/\n\
CSSVAL=・             ~CSSWG/css-values-3/\n\
	CSSVAL=・            ~CSSWG/css-values/\n\
CSSWRITINGMODES=・    ~CSSWG/css-writing-modes/\n\
CSSWRITINGMODES=主    ~/css-writing-modes-ja.html\n\
CSSWRITINGMODES=副2   ＃suzukima.github.io/css-ja/css3-writing-modes/\n\
CSSWRITINGMODES=版    ~TR/css3-writing-modes/\n\
CSSWRITINGMODES=編    ~CSSWG/css-writing-modes-3/●編（Level 3）\n\
CSSWRITINGMODES=編    ~CSSWG/css-writing-modes-4/\n\
CSSWILLCHANGE1=主     ~/css-will-change-ja.html\n\
CSSWILLCHANGE1=版     ~TR/css-will-change-1/\n\
COMPAT=主             ~/compat-ja.html\n\
DOM=主                ~/DOM4-ja.html\n\
DOM=編                dom.spec.whatwg.org/●LS\n\
DOM=版                ~TR/dom/●W3C版\n\
DOM=・                ~TR/domcore/\n\
DOMPARSING=主         ~/DOM-Parsing-ja.html\n\
DOMPARSING=編         w3c.github.io/DOM-Parsing/\n\
DOMPARSING=版         ~TR/DOM-Parsing/\n\
DOMLEVEL2STYLE=主     ~adagio/tr_dom2_style/expanded-toc.html\n\
ECMASCRIPT=主         ＃tsofthome.appspot.com/ecmascript.html●第五版 訳\n\
ENCODING=主           ~/Encoding-ja.html\n\
ENCODING=・           encoding.spec.whatwg.org/\n\
FETCH=主              ~/Fetch-ja.html\n\
FETCH=・              fetch.spec.whatwg.org/\n\
FILEAPI=主            ~/File_API-ja.html\n\
FILEAPI=版            ~TR/FileAPI/\n\
FILEAPI=編            w3c.github.io/FileAPI/\n\
FILEAPI=・            dev.w3.org/2006/webapi/FileAPI/\n\
GEOMETRY1=主          ~/geometry-ja.html\n\
GEOLOCATIONAPI=主     ＃www.asahi-net.or.jp/~ax2s-kmtn/internet/geo/REC-geolocation-API-20161108.html\n\
GEOLOCATIONAPI=版     ~TR/geolocation-API/\n\
HTML=副               ~/index.html#spec-list-html●日本語訳(このサイト, WHATWG 版)\n\
HTML=副               ~momdoG/html/●日本語(部分)訳(WHATWG 版)\n\
HTML=副               ~momdoG/html/dev/●日本語訳( Web 開発者向け)\n\
HTML=副               ~momdoG/html51/Overview.html●5.1 日本語(部分)訳\n\
	HTML=副               ~momdoG/html5/Overview.html●5.0 日本語訳( 部分訳)\n\
	HTML=・               ~TR/html/●W3C\n\
	HTML=・               html.spec.whatwg.org/multipage/●LS\n\
	HTMLINTORO=主         ~momdoG/html/introduction.html\n\
	HTMLINTORO=・         ~HTML5/introduction.html\n\
HTMLMICRODATA=主      ~momdoG/html/microdata.html\n\
HTMLMICRODATA=・      ~HTML5/microdata.html\n\
HTMLOBS=主            ~momdoG/html/obsolete.html\n\
HTMLOBS=・            ~HTML5/obsolete.html\n\
HTMLIANA=主           ~momdoG/html/iana.html\n\
HTMLIANA=・           ~HTML5/iana.html\n\
HTML401=主            ＃www.asahi-net.or.jp/~sd5a-ucd/rec-html401j/cover.html\n\
INDEXEDDB=主          ~/IndexedDB-2nd-ja.html\n\
INDEXEDDB=版          ~TR/IndexedDB/\n\
INDEXEDDB=編          w3c.github.io/IndexedDB/\n\
JLREQ=主              ~TR/jlreq/ja/\n\
JLREQ=副              w3c.github.io/jlreq/ja/●日本語訳(編集者草案)\n\
JLREQ=編              w3c.github.io/jlreq/\n\
INFRA=主              ~/infra-ja.html\n\
MQ4=主                ~/mediaqueries4-ja.html\n\
MQ4=編                ~CSSWG/mediaqueries-4/\n\
MEDIAQ=主             ~mitsue/css3-mediaqueries/\n\
MEDIAQ=副             ~/mediaqueries4-ja.html●Level 4 日本語訳\n\
MEDIAQ=副             ＃www.asahi-net.or.jp/~ax2s-kmtn/internet/css/REC-css3-mediaqueries-20120619.html\n\
MIX=主                ~/webappsec-mixed-content-ja.html\n\
MIX=版                ~TR/mixed-content/\n\
MIX=編                w3c.github.io/webappsec-mixed-content/\n\
MEDIAQ=版             ~TR/css3-mediaqueries/\n\
HRTIME2=主            ~/hr-time-ja.html\n\
HRTIME2=版            ~TR/hr-time-2/\n\
HRTIME2=編            w3c.github.io/hr-time/\n\
NAVIGATIONTIMING2=主  ~/navigation-timing-2-ja.html\n\
NAVIGATIONTIMING2=版  ~TR/navigation-timing-2/\n\
NAVIGATIONTIMING=主   ~/navigation-timing-ja.html\n\
NAVIGATIONTIMING=版   ~TR/navigation-timing/\n\
NETSCAPE=主           ＃www.futomi.com/lecture/cookie/specification.html\n\
PAGEVISIBILITY=主     ~/page-visibility-ja.html\n\
PAGEVISIBILITY=版     ~TR/page-visibility-2/\n\
	PAGEVISIBILITY=・     ~TR/page-visibility/\n\
PERFORMANCETIMELINE2=主    ~/performance-timeline-ja.html\n\
PERFORMANCETIMELINE2=版    ~TR/performance-timeline-2/\n\
PERFORMANCETIMELINE2=編    w3c.github.io/performance-timeline/\n\
USERTIMING2=主        ~/user-timing-ja.html\n\
USERTIMING2=版        ~TR/user-timing-2/\n\
RESOURCETIMING=主     ~/resource-timing-ja.html\n\
RESOURCETIMING=版     ~TR/resource-timing/\n\
RESOURCETIMING=編     w3c.github.io/resource-timing/\n\
BEACON=主             ~/beacon-ja.html\n\
BEACON=版             ~TR/beacon/\n\
RESOURCEHINTS=主      ~/resource-hints-ja.html\n\
REFERRERPOLICY=主     ~/webappsec-referrer-policy-ja.html\n\
PERMISSIONS=主        ~/webappsec-permissions-ja.html\n\
RFC1034=主            srgia.com/docs/rfc1034j.html\n\
RFC1123=主            ＃hp.vector.co.jp/authors/VA002682/rfc1123j.htm\n\
RFC1123=副2           ＃www2s.biglobe.ne.jp/~hig/tcpip/HostReq_Appl.html\n\
RFC1630=主            ＃srgia.com/docs/rfc1630j.html\n\
RFC1928=主            ＃srgia.com/docs/rfc1928j.html\n\
RFC2046=主            ＃www.t-net.ne.jp/~cyfis/rfc/mime/rfc2046_ja-1.html\n\
RFC2046=副            ~adagio/tr_mime-p2_2046/toc.htm\n\
RFC2119=主            ＃www.cam.hi-ho.ne.jp/mendoxi/rfc/rfc2119j.html\n\
RFC2119=副2           ＃www.asahi-net.or.jp/~sd5a-ucd/rfc-j/rfc-2119j.html\n\
RFC2119=副3           ＃www.t-net.ne.jp/~cyfis/rfc/format/rfc2119_ja.html\n\
RFC2119=副4           ~ipa/RFC2119JA.html\n\
RFC2397=・            ~IETF/rfc2397\n\
RFC2397=主            ＃d.hatena.ne.jp/tily/20071103/p1\n\
HTTP=主               ~/RFC723X-ja.html\n\
HTTP=副2              ~suika/n/HTTP%2F1.1\n\
RFC2616=主            ~/RFC2616-ja.html\n\
RFC2616=副            ~/RFC723X-ja.html\n\
RFC2616=・            ~IETF/rfc2616\n\
RFC2616=・            www.ietf.org/rfc/rfc2616.txt\n\
RFC2616=副2           ~suika/n/RFC%202616\n\
RFC2616=・            www.w3.org/Protocols/rfc2616/rfc2616-sec8.html\n\
RFC2616=・            www.w3.org/Protocols/rfc2616/rfc2616-sec13.html\n\
RFC2817=副            ~ipa/RFC2817JA.html\n\
RFC2817=・            ~IETF/rfc2817\n\
RFC2818=主            ~suika/n/RFC%202818\n\
RFC2818=副2           ~ipa/RFC2818JA.html\n\
RFC2818=・            www.ietf.org/rfc/rfc2818.txt\n\
RFC2818=・            ~IETF/rfc2818\n\
RFC3174=主            ~ipa/RFC3174JA.html\n\
RFC3174=副2           ＃www7b.biglobe.ne.jp/~k-west/SSLandTLS/rfc3174-Ja.txt\n\
RFC3490=主            ＃www.jdna.jp/survey/rfc/rfc3490j.html\n\
RFC3629=主            ＃www5d.biglobe.ne.jp/~stssk/rfc/rfc3629j.html\n\
RFC3629=副2           ＃www.akanko.net/marimo/data/rfc/rfc3629-jp.txt\n\
RFC3986=主            ~/RFC3986-ja.html\n\
RFC3986=・            ~IETF/rfc3986\n\
RFC3986=・            www.ietf.org/rfc/rfc3986.txt\n\
RFC3987=主            ~suika/n/RFC%203987\n\
RFC4086=主            ~ipa/RFC4086JA.html\n\
RFC4122=主            ＃rui86.hatenablog.jp/entry/2013/07/18/065147\n\
RFC4270=主            ~ipa/RFC4270JA.html\n\
RFC4291=主            ＃srgia.com/docs/rfc4291j.html\n\
RFC4648=主            ＃www5d.biglobe.ne.jp/~stssk/rfc/rfc4648j.html\n\
RFC5234=主            ＃www.cam.hi-ho.ne.jp/mendoxi/rfc/rfc5234j.html\n\
RFC5246=主            ~ipa/RFC5246-00JA.html\n\
RFC5321=主            ＃www.hde.co.jp/rfc/rfc5321_ja.txt\n\
RFC5322=主            ＃srgia.com/docs/rfc5322j.html\n\
RFC5322=副2           ＃www.hde.co.jp/rfc/rfc5322_ja.txt\n\
RFC5890=主            jprs.co.jp/idn/rfc5890j.txt\n\
RFC5891=主            jprs.co.jp/idn/rfc5891j.txt\n\
RFC5895=主            jprs.co.jp/idn/rfc5895j.txt\n\
RFC6066=主            ~ipa/RFC6066JA.html\n\
RFC6265=主            ~/RFC6265-ja.html\n\
RFC6265=・            ~IETF/rfc6265\n\
RFC6454=主            ~/RFC6454-ja.html\n\
RFC6454=副2           ~ipa/RFC6454JA.html\n\
RFC6454=・            ~IETF/rfc6454\n\
RFC6455=主            ~/RFC6455-ja.html\n\
RFC6901=主            ~/RFC6901-ja.html\n\
RFC6902=主            ~/RFC6902-ja.html\n\
RFC6919=主            ＃www.geocities.jp/toyprog/rfc/rfc6919.txt\n\
RFC6919=・            ~IETF/rfc6919\n\
RFC7230=主            ~/RFC7230-ja.html\n\
RFC7230=・            ~IETF/rfc7230\n\
RFC7230=・            ~HTTPWG/rfc7230.html\n\
RFC7231=主            ~/RFC7231-ja.html\n\
RFC7231=・            ~IETF/rfc7231\n\
RFC7231=・            ~HTTPWG/rfc7231.html\n\
RFC7232=主            ~/RFC7232-ja.html\n\
RFC7232=・            ~IETF/rfc7232\n\
RFC7232=・            ~HTTPWG/rfc7232.html\n\
RFC7233=主            ~/RFC7233-ja.html\n\
RFC7233=・            ~IETF/rfc7233\n\
RFC7233=・            ~HTTPWG/rfc7233.html\n\
RFC7234=主            ~/RFC7234-ja.html\n\
RFC7234=・            ~IETF/rfc7234\n\
RFC7234=・            ~HTTPWG/rfc7234.html\n\
RFC7235=主            ~/RFC7235-ja.html\n\
RFC7235=・            ~IETF/rfc7235\n\
RFC7235=・            ~HTTPWG/rfc7235.html\n\
RFC7301=主            github.com/ami-GS/ALPN-spec-jp/blob/master/spec.md\n\
SELECT=主             ~mitsue/css3-selectors/\n\
SELECT=副2            ＃zng.info/specs/css3-selectors.html\n\
SELECT=副3            ~/selectors4-ja.html●Level 4 日本語訳\n\
SELECT=版             ~TR/css3-selectors/\n\
SELECT=編             ~CSSWG/selectors-3/\n\
SELECT=・             ~TR/selectors/\n\
SELECTORS=・          ~CSSWG/selectors/\n\
SELECTORS=主          ~/selectors4-ja.html\n\
SELECTORS=副2         ~mitsue/css3-selectors/●Level 3 日本語訳\n\
SELECTORS=版          ~TR/selectors4/\n\
SELECTORS=編          ~CSSWG/selectors4/\n\
SELECTORSAPI=主       ~mitsue/selectors-api/●Level 1 日本語訳\n\
SECURECONTEXTS=主     ~/webappsec-secure-contexts-ja.html\n\
SECURECONTEXTS=副     hashedhyphen.github.io/webappsec-specjp/secure-contexts/index.html\n\
SECURECONTEXTS=版     ~TR/secure-contexts/\n\
SECURECONTEXTS=編     w3c.github.io/webappsec-secure-contexts/\n\
SRI=主                ~/webappsec-subresource-integrity-ja.html\n\
SRI=版                www.w3.org/TR/SRI/\n\
SRI=編                w3c.github.io/webappsec-subresource-integrity/\n\
UPGRADEINSECUREREQUESTS=主 ~/webappsec-upgrade-insecure-requests-ja.html\n\
UPGRADEINSECUREREQUESTS=版 ~TR/upgrade-insecure-requests/\n\
UPGRADEINSECUREREQUESTS=編 w3c.github.io/webappsec-upgrade-insecure-requests/\n\
SSML=主               ＃www.asahi-net.or.jp/~ax2s-kmtn/ref/accessibility/REC-speech-synthesis11-20100907.html\n\
SSML=・               ~TR/speech-synthesis11/\n\
STREAMS=主            ~/Streams-ja.html\n\
STREAMS=・            streams.spec.whatwg.org/\n\
STREAMS=・            github.com/whatwg/streams\n\
SVG2=副               triple-underscore.github.io/SVG11/●Version 1 日本語訳\n\
SVG=主                triple-underscore.github.io/SVG11/\n\
TOUCHEVENTS=主        ~/touch-events-ja.html\n\
URL=主                ~/URL-ja.html\n\
URL=編                url.spec.whatwg.org/●LS\n\
URL=版                www.w3.org/TR/url/●W3C版\n\
UIEVENTS=主           ~/uievents-ja.html\n\
UIEVENTS=版           ~TR/uievents/\n\
UIEVENTS=編           w3c.github.io/uievents/\n\
WCAG20=主             ＃waic.jp/docs/WCAG20/Overview.html\n\
WCAG20=・             ~TR/WCAG20/\n\
WEBIDL=主             ~/WebIDL-ja.html\n\
WEBIDL=版             ~TR/WebIDL-1/\n\
WEBIDL=編             heycam.github.io/webidl/\n\
WEBIDL=・             ~TR/WebIDL/\n\
WEBSOCKETS=主         ~/WebSocket-ja.html\n\
WEBSOCKETS=版         www.w3.org/TR/websockets/\n\
WEBSOCKETS=編         w3c.github.io/websockets/\n\
WEBSOCKETS=・         dev.w3.org/html5/websockets/\n\
WEBSTORAGE=主         ~/WebStorage-ja.html\n\
WEBSTORAGE=版         ~TR/webstorage/\n\
WEBSTORAGE=編         ~HTML5/webstorage.html●WHATWG版\n\
WORKERS=・            ~HTML5/workers.html\n\
WORKERS=・            dev.w3.org/html5/workers/\n\
WORKERS=主            ~/Workers-ja.html\n\
WORKERS=版            ~TR/workers/\n\
WORKERS=編            w3c.github.io/workers/\n\
XHR=・                xhr.spec.whatwg.org/\n\
XHR=主                ~/XHR-ja.html\n\
XHR=版                ~TR/XMLHttpRequest/●W3C版\n\
XML11=主              ＃w4ard.eplusx.net/translation/W3C/REC-xml11-20060816/\n\
XML=主                ＃w4ard.eplusx.net/translation/W3C/REC-xml-20081126/\n\
XML=・                ~TR/xml/\n\
XMLNS=主              ~/xml-names-ja.html\n\
XMLNS=・              ~TR/xml-names/\n\
XMLSS=主              ~XML/xml-stylesheet-ja.html\n\
XMLSS=・              ~TR/xml-stylesheet/\n\
XSLT=主               ~adagio/tr_xslt10/toc.htm\n\
XSLT=副2              ~XML/xslt10-ja.html\n\
PROMISES=主           ~/promises-guide-ja.html\n\
PROMISES=・           www.w3.org/2001/tag/doc/promises-guide\n\
';

/* 廃
CSS21=副              www.swlab.it.okayama-u.ac.jp/man/rec-css2/cover.html●2.0 日本語訳\n\

*/

COMMON_DATA.REF_DATA2 = '\n\
~TR/CSS22/●       ~momdoG/css2/\n\
~TR/CSS21/●       ~momdoG/css2/\n\
~TR/CSS2/●        ~momdoG/css2/\n\
~CSSWG/css2/●     ~momdoG/css2/\n\
~CSSWG/css21/●    ~momdoG/css2/\n\
~TR/SVG/●         triple-underscore.github.io/SVG11/\n\
~TR/SVG11/●       triple-underscore.github.io/SVG11/\n\
	~HTML5/●          ~momdoG/html/\n\
';


// 文献 id 別名 -> 文献 id
COMMON_DATA.REF_KEY_MAP = '\n\
DOM4:DOM\n\
DOMLS:DOM\n\
WHATWGDOM:DOM\n\
WHATWGENCODING:ENCODING\n\
WHATWGURL:URL\n\
HTML51:HTML\n\
WEBIDL2:WEBIDL\n\
DOMCORE:DOM\n\
CSP:CSP3\n\
CSS2:CSS21\n\
CSS22:CSS21\n\
COMPOSITING:COMPOSITING1\n\
CSSALIGN3:CSSALIGN\n\
CSS3ANIMATIONS:CSSANIMATIONS1\n\
CSS3BREAK:CSSBREAK3\n\
CSS3CASCADE:CSSCASCADE\n\
CSSCASCADE3:CSSCASCADE\n\
CSSCASCADE4:CSSCASCADE\n\
	CSS3PAGE:CSSCASCADE\n\
CSS3SYN:CSSSYNTAX\n\
CSSSYNTAX3:CSSSYNTAX\n\
CSS3FLEXBOX:CSSFLEX\n\
CSSFLEXBOX1:CSSFLEX\n\
CSSMULTICOL1:CSSMULTICOL\n\
CSS3COL:CSSMULTICOL\n\
CSS3MULTICOL:CSSMULTICOL\n\
CSSCOLOR3:CSS3COLOR\n\
CSSCOLOR4:CSSCOLOR\n\
CSSCOUNTERSTYLES3:CSSCOUNTERSTYLES\n\
CSSGRID1:CSSGRID\n\
CSS3GRIDLAYOUT:CSSGRID\n\
CSSINLINE3:CSSINLINE\n\
CSS3CONDITIONAL:CSSCONDITIONAL\n\
CSSCONDITIONAL3:CSSCONDITIONAL\n\
CSS3EXCLUSIONS:CSSEXCLUSIONS\n\
CSS3FONT:CSS3FONTS\n\
CSSFONTS3:CSS3FONTS\n\
CSS3PAGE:CSSPAGE\n\
CSSPAGE3:CSSPAGE\n\
CSSSHAPES:CSSSHAPES1\n\
CSSTEXT3:CSS3TEXT\n\
CSSTEXT:CSS3TEXT\n\
CSSTIMING1:CSSTIMING\n\
CSSVARIABLES1:CSSVARIABLES\n\
CSSOM1:CSSOM\n\
CSSOMVIEW1:CSSOMVIEW\n\
CSSOVERFLOW3:CSSOVERFLOW\n\
CSSPOSITION3:CSSPOSITION\n\
CSSIMAGES3:CSS3IMAGES\n\
CSSSIZING3:CSSSIZING\n\
CSSSIZING4:CSSSIZING\n\
CSS3SIZING:CSSSIZING\n\
CSS3TRANSFORMS:CSSTRANSFORMS1\n\
CSS3TRANSITIONS:CSSTRANSITIONS1\n\
CSSDISPLAY3:CSSDISPLAY\n\
CSS3DISPLAY:CSSDISPLAY\n\
CSSVALUES3:CSSVAL\n\
CSSVALUES:CSSVAL\n\
CSS3VAL:CSSVAL\n\
CSSTEXTDECOR3:CSS3TEXTDECOR\n\
CSS3UI:CSSUI3\n\
CSSUI:CSSUI3\n\
CSSWRITINGMODES3:CSSWRITINGMODES\n\
CSSWRITINGMODES4:CSSWRITINGMODES\n\
CSS3WRITINGMODES:CSSWRITINGMODES\n\
CSS3NAMESPACE:CSSNAMESPACES\n\
CSSNAMESPACES3:CSSNAMESPACES\n\
CSS3BACKGROUND:CSSBACKGROUNDS3\n\
CSS3BG:CSSBACKGROUNDS3\n\
CSSBG:CSSBACKGROUNDS3\n\
CSSSTYLEATTR1:CSSSTYLEATTR\n\
MEDIAQUERIES4:MQ4\n\
CSS3MEDIAQUERIES:MEDIAQ\n\
SELECTORS4:SELECTORS\n\
SELECTORS3:SELECT\n\
CSS3SELECTORS:SELECT\n\
URLAPISPECIFICATION:URL\n\
XMLHTTPREQUEST:XHR\n\
HTML5:HTML\n\
SVG11:SVG\n\
TOUCH:TOUCHEVENTS\n\
WSAPI:WEBSOCKETS\n\
WEBWORKERS:WORKERS\n\
XML10:XML\n\
XMLNAMES:XMLNS\n\
XMLSTYLESHEET:XMLSS\n\
ECMA262:ECMASCRIPT\n\
	HTTP:RFC2616\n\
HTTP11:RFC2616\n\
HTTPAUTH:RFC2617\n\
URI:RFC3986\n\
IDNA:RFC3490\n\
IPV6:RFC4291\n\
ABNF:RFC5234\n\
COOKIES:RFC6265\n\
ORIGIN:RFC6454\n\
WSP:RFC6455\n\
WEBIDL1:WEBIDL\n\
REFERRER:REFERRERPOLICY\n\
UPGRADE:UPGRADEINSECUREREQUESTS\n\
TLS12:RFC5246\n\
TLS:RFC5246\n\
';

/* END REF_KEY_MAP*/

COMMON_DATA.altURL = function(href){
	if(!href) return;
//	if(href.indexOf(PAGE_DATA.original_url) === 0) return;
	href = href.match(/^https?:\/\/([^#]+)(#.*)?/);
	if(!href) return;
	var url = href[1];
	var alt_url = this.JA_LINKS[url];
	if(alt_url === '') return; // 明示的な無効化
	if(alt_url){
		if(alt_url.charAt(0) === '@'){
			alt_url = this.JA_REFS[alt_url.slice(1)] || '';
			if(!alt_url) return;
		}
	} else {
		// multi-page (HTML5, CSS2, SVG)
		var slash = url.lastIndexOf('/');
		if(slash < 0 ) return;
		alt_url = this.JA_LINKS[url.slice(0, slash + 1)];
		if(!alt_url) return;
		alt_url += url.slice(slash + 1);
	}
	var hash = href[2] || '';
	if(alt_url.indexOf('h-hash/rfc_ja') > 0 ){ // for "studying:"
		hash = hash.replace(/#section-/, '#Sec');
	}
	return alt_url + hash;
//	return this.fillURL(alt_url) + (href[2] || '');
};


/*


global
	toUpperCase isNaN
Array
	forEach
String
	trim charAt parseInt split indexOf slice replace
Math
	floor max

event.
	target detail

element.
	HTML
		href tabIndex innerHTML style
	DOM
		id className tagName textContent
		hasAttribute getAttribute
		firstChild parentNode childNodes
		firstElementChild previousElementSibling lastElementChild
		cloneNode appendChild
		addEventListener removeEventListener
	CSSOM view:
		scrollTop scrollHeight
		scrollIntoView getBoundingClientRect
		offsetParent
		offsetHeight
		clientWidth

document.
	HTML:
		body
	DOM:
		getElementById getElementsByTagName createElement createTextNode createRange
	Range
		selectNodeContents cloneContents

	Selectos API
		querySelectorAll
	CSSOM view:
		elementFromPoint

window.
	CSSOM view:
		innerWidth innerHeight
		scrollY scrollBy scrollTo
	sessionStorage


*/

/*TODO
・リンク移動が行内の場合、その先祖のブロック全体を表示させる
*/
