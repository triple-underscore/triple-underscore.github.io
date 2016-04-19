'use strict';


// 要素取得
function E(id){
//	var e = document.getElementById(id);if(!e) {console.log(id);};return e;
	return document.getElementById(id);
}
// 要素作成
function C(tag){
	if(!tag) return document.createDocumentFragment();
	return document.createElement(tag);
}

function EMPTY_FUNC(){}

// セレクタ対象の要素を反復処理
function repeat(selector, callback){

/*	if(/^\w+$/.test(selector)){
		Array.prototype.forEach.call(document.getElementsByTagName(selector), callback);
		return;
	}
*/	var elements = document.querySelectorAll(selector);
	var L = elements.length;
	for(var i = 0; i < L; i++){
		callback(elements[i]);
	}
}

if(!window.console){
	window.console = EMPTY_FUNC;
}


// 何でもかんでも
var Util = {
	ADDITIONAL_NODES: [],
	CONTROL_UI: C(), //追加 UI
	CLICK_HANDLERS: null,
	CONTAINER_TAGS: {SECTION:1, PRE:1, DIV:1, DL:1, UL:1, OL:1, NAV:1, BODY:1, A:1},

	getMapping: EMPTY_FUNC,
	get_mapping: EMPTY_FUNC,
	textData: EMPTY_FUNC,
	getDataByLevel: EMPTY_FUNC,
	toggleClass: EMPTY_FUNC,
	get_header: EMPTY_FUNC,
	supplyLinkFromText: EMPTY_FUNC,
	dump: EMPTY_FUNC,
	del_j: EMPTY_FUNC,

	removeAdditionalNodes: EMPTY_FUNC,
	indexHide: EMPTY_FUNC,
	dfnHide: EMPTY_FUNC,

	toggleSource: EMPTY_FUNC,

	onClick: EMPTY_FUNC,

	rebuildToc: EMPTY_FUNC,
	buildTocList: EMPTY_FUNC,
	indexInit: EMPTY_FUNC,

	word_switcher: null,
	createWordSwitch: EMPTY_FUNC,
	switchWords: EMPTY_FUNC,
	replaceWords0: EMPTY_FUNC,
	replaceWords1: EMPTY_FUNC,
	rxp_wordsX: null,
	rxp_words1: null,

	switchView: EMPTY_FUNC,
	ref_position: null,

	dfnInit: EMPTY_FUNC,
	navToInit: EMPTY_FUNC,
	altLinkInit: EMPTY_FUNC,
	fillMisc: EMPTY_FUNC,

	removeParts: EMPTY_FUNC,
	replaceParts: EMPTY_FUNC,
	XXXXX: EMPTY_FUNC
};

/* 改行／コロン区切りの文字列データから連想配列を取得
引数
	e:
		文字列データを内容に含む要素またはその id
		既定では、実行後に要素は DOM から除去される
	options:
		keep:
			要素を DOM に残しておく場合は true
		replacer:
			変換前に文字列データを加工する関数（文字列 → 文字列）
		map:
			この連想配列（複製されない）にデータが追加される
*/

Util.getMapping = function(e, options){
	options = options || {};
	return this.get_mapping(
		this.textData(e, options), //.replace(/\n\t.+/g, ''),
		options.map
	);
};

Util.get_mapping = function(data, map){
	map = map || Object.create(null);

	var rxp = /\n(\S.*?):(.*)/g, m;
	while(m = rxp.exec(data)){
		map[m[1]] = m[2];
	}
	return map;
};

Util.textData = function(e, options){
	if(typeof(e) === 'string'){
		e = E(e);
	}
	var data = e.firstChild.data;
	options = options || {};
	if(!options.keep) {
		e.parentNode.removeChild(e);
	}
	if('replacer' in options){
//	if(options && options.replacer){
		if(options.regex){
			data = data.replace(options.regex, options.replacer);
		} else {
			data = options.replacer(data);
		}
	}
	return data;
};


/* 
'token:word1:word2:word3:...' の形式の各行を
'token:word' の形に変換 ( word = level 番目の word )

	word === 空 の場合
		word = 最も近い前の空でない word
	word === '~' の場合（恒等置換 指示）

*/

Util.getDataByLevel = function(data, level){
	return data
	// スペース／タブ開始行を削除
		.replace(/\n[ \t].*/g, '')
	// ":" 区切りの行フィールド数を level + 1 個に圧縮
	// level = 2 の場合: /((:[^:\n]*){3}).*/g ( w:w1:w2:w3 => w:w1:w2 )
		.replace(RegExp('((:[^:\\n]*){' + ((level & 0xF) + 1) + '}).*', 'g'), '$1')
	// 省略されたフィールドを補填 ( …w::\n => w:w\n)
		.replace(/([^:\n]*):+(?=\n)/g, '$1:$1')
	// 合間のフィールドをカット
		.replace(/:.*:/g, ':')
//		token が '-' で終端している場合 token:( token から末尾の '-' を除去した結果 ) に置換
//		.replace(/^(.*)-:~$/mg, '$1-:$1')
	// "~" への map （恒等置換 指示）は削除
		.replace(/^.*:~$/mg, '')
	;
};

// class トグル ( IE9 で classList がサポートされるのはいつかな？)

Util.toggleClass = function(e, token){
	var c = e.className;
	if(!c) {
		e.className = token;
		return true;
	}
	c = ' ' + c + ' ';
	var i = c.indexOf(' ' + token + ' ');
	var on = (i < 0);
	e.className = on ?
		c.slice(1) + token :
		c.slice(1, i) + c.slice(i + token.length + 1, -1);
	return on;
};

// 節見出しを取得
Util.get_header = function(section){
	var header = section && section.firstElementChild;
	return (
		header && /^H\d$/.test(header.tagName)
	)? header : null;
};

/* 単純な text -> リンク変換 
用法:
	repeat(selector, Util.supplyLinkFromText);
*/
Util.supplyLinkFromText = function(e){
	var text = e.firstChild;
	if(
		(text.nodeType === Node.TEXT_NODE) &&
		/^https?:\/\//.test(text.data)
	) {
		var a = C('a');
		a.href = a.textContent = text.data;
		e.replaceChild(a, text);
	}
};

/*
Util.getParts = function(selector){
};
*/

Util.removeParts = function(parts){
	Object.getOwnPropertyNames(parts).forEach(function(id){
		var e = parts[id];
		if(e.parentNode){
			e.parentNode.removeChild(e);
		}
	});
};

Util.replaceParts = function(parts){
	Object.getOwnPropertyNames(parts).forEach(function(id){
		var part = parts[id];
		var e = E(id);
		if(e) {
			e.parentNode.replaceChild(part, e);
		} else {
			console.log('replaceParts: place holder not found for id=' + id );
		}
	});
};

Util.dump = function(s){
	if(s instanceof Array){
		s = s.join('\n');
	} else if(s instanceof Object){
		var ss = [];
		for(var p in s){
			ss.push(p + ': ' + s[p]);
		}
		s = ss.join('\n');
	}

	var area = C('textarea');
	area.cols = 200;
	area.rows = 100;
	area.value = s;
	document.body.appendChild(area);
	area.scrollIntoView();
};

// 訳文消去（ diff 比較用）
Util.del_j = function(){
	var parent;

	repeat('*[lang="en"]', function(en){
		var p = en.parentNode;
		if(en.tagName === 'SPAN'){
			if(p === parent){
				p.insertBefore(C('br'), en);
				return;
			}
			parent = p;
		}
		while(p.firstChild !== en) {
			p.removeChild(p.firstChild);
		}
	});
	repeat('h2,h3,h4,h5', function(e){
		var text = e.title;
		if(text){
			e.textContent = (e.textContent.match(/[ABC\d\.]+/) || '') + ' ' + text;
		}
	})
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


var PAGE_DATA = {};

var COMMON_DATA = {
	PAGE_STATE: {},
	getState: function(key, default_val, type){
		if(! (key in this.PAGE_STATE) ) return default_val;
		var val = this.PAGE_STATE[key];
		return (type && (typeof(val) !== type))? default_val : val;
	},
	setState: function(key, val){
		var data = this.PAGE_STATE;
		var old_val = data[key];
		if(val === old_val) return;
		if(val === undefined){
			delete PAGE_STATE[key];
		} else {
			data[key] = val;
		}
		this.saveStorage(data);
	},
	page_state_key: null,
	init : null
};


COMMON_DATA.saveStorage = EMPTY_FUNC;

new function(){
	// meta with viewport for mbile (ideally, should be set by CSS, not meta tag)
	var head = document.getElementsByTagName('head')[0];
	if(head) {
		var meta = C('meta');
		meta.setAttribute('name', 'vewport');
		meta.setAttribute('content', 'width=device-width');
		head.appendChild(meta);
	}
}

new function(){

	document.addEventListener('DOMContentLoaded', init, false);

	// 初期化
	function init(){

		// 利用者 表示設定
		var page_state = (JSON && get_state()) || {};
		COMMON_DATA.PAGE_STATE = page_state;
		if(page_state.show_original){
			Util.toggleClass(document.body, 'show-original')
		}
		if(page_state.side_menu){
			Util.toggleClass(document.body, 'side-menu');
		}
		if(COMMON_DATA.init) {
			initAdditional(COMMON_DATA.init(E('view_control')), page_state);
		}
		document.removeEventListener('DOMContentLoaded', init, false);
	}

	// 表示状態を DOM Storage / hidden field から読み込む
	function get_state(){
		var page_state = null;
		var storage_key = null;

		storage_key = COMMON_DATA.page_state_key || window.location.pathname;
		try {
			// sessionStorage property へのアクセスのみでも security error になることがある
			page_state = sessionStorage.getItem(storage_key);
			COMMON_DATA.saveStorage = function(data){
				sessionStorage.setItem(storage_key, JSON.stringify(data));
			};
		} catch(e){
			// おそらく 'file://' scheme — hidden field から読み取りを試行
			console.log(e.message + ' failed sessionStorage.getItem');
			if(! E('_page_config')) return;

			page_state = E('_page_config').value;
			COMMON_DATA.saveStorage = function(data){
				E('_page_config').value = JSON.stringify(data);
			};
		}

		if(! page_state || (page_state.length > 1000)) return;
		try {
			page_state = JSON.parse(page_state);
		} catch(e) {
			return;
		}

		if(page_state instanceof Object){
			return page_state;
		}
	}

/*
	// 表示状態を hidden field から読み込む
	function get_state(){
		var page_state = null;
		if(!E('_page_config')) return;
		page_state = E('_page_config').value;

		COMMON_DATA.saveStorage = save_state;

		if(! page_state || (page_state.length > 1000)) return;
		try {
			page_state = JSON.parse(page_state);
		} catch(e) {
			return;
		}

		if(page_state instanceof Object){
			return page_state;
		}
	}

	// 表示状態を hidden field に保存
	function save_state(data){
		E('_page_config').value = JSON.stringify(data);
	}
*/
}

/******** 付帯機能 *********/



/** 付帯機能 初期化
	original_url: 'http://...',
	main: 'MAIN',
	toc: 'table-of-contents',
	alt_refs: 'references',
	hash_case_modified: 'dfn'
	word_switch: false
	no_index: false
	no_original_dfn: false
	fill_text_link: selector
*/

function initAdditional(options){
	PAGE_DATA =
	options = options || PAGE_DATA;
//	if(!options) options = {};

	var e = E('_original_id_map');
	PAGE_DATA.original_id_map = e ?
		Util.getMapping(e/*, {keep: true}*/) : Object.create(null);

	var main = E(options.main);// || document.body; //TODO main への依存を除去

	var content_generation = null;

	if(E('view_control')) { // ページは展開状態で保存されている
		repeat('._hide_if_expanded', function(e){
//			e.parentNode.removeChild(e);
			e.style.display = 'none';
		});
	} else {
		content_generation = E('_GENERATING'); // 内容生成ページには存在
		if(content_generation){
			// 内容生成完了
			main.style.display = ''; // TODO 別箇所に移動 innerHTML
			content_generation.className = '_generated';
		} else if(options.toc){
			// 目次構築
			var toc_list = Util.buildTocList(main);// options.main
			toc_list.id = '_toc_list';
			E(options.toc).appendChild(toc_list);
		}

		window.setTimeout(function(){
			Util.fillMisc(options);
			Util.navToInit(!!content_generation);
		}, 100);
	}

	if(options.word_switch){
		Util.word_switcher.init_toggle();
	}

	document.body.addEventListener('click', Util.onClick, false);
	document.body.addEventListener('dblclick', function(event){
		Util.toggleSource(event.target);
	}, false);

//	Util.navToInit(!!content_generation);

	Util.dfnInit();
	Util.altLinkInit(main);// TODO main 除去 -> main 要素

	window.addEventListener('pagehide', function(){
		Util.removeAdditionalNodes();
	}, false);
	document.addEventListener('visibilitychange', onVisibilityChange);
	Util.ref_position.init();

return;

	function onVisibilityChange(){
		if(document.hidden){
			Util.removeAdditionalNodes();
		}
	}
}

Util.fillMisc = function(options){//PAGE_DATA
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
PR: 'W3C Proposed Recommendation',
CR: 'W3C Candidate Recommendation',
REC: 'W3C Recommendation',
LS: 'Living Standard',
IETFPR: 'IETF PROPOSED STANDARD'
		}[key] || '????';

		var color = { ED: 'red', IETFPR: 'gray', LS: 'green' }[key];
		var div = C('div');
		div.id = 'sideways-logo';
		var div1 = C('div');
		if(color) div1.style.background = color;
		div1.textContent = text;
		div.appendChild(div1);
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
		if(options.word_switch){
			add_button('語の和英', 'X', '_toggle_words');
		}

		var e = E('_optional_controls');//TODO
		if(e){
			controls.appendChild(e);
		}
		controls.appendChild(Util.CONTROL_UI);

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


Util.CLICK_HANDLERS = {
/** 原文表示切替 */
	_toggle_source: function(){
		Util.switchView(function(){
			COMMON_DATA.setState('show_original',
				Util.toggleClass(document.body, 'show-original')
			);
		});
	},
/** 目次表示切替 */
	_toggle_toc: function(){
		Util.switchView(function(){
			COMMON_DATA.setState('side_menu', 
				Util.toggleClass(document.body, 'side-menu')
			);
			Util.ref_position.releaseAndFix()
		});
	},
/** 切替 固定化 */
	view_control: function(event){
		var e = E('view_control');
		if(event.target !== e) return;
		Util.toggleClass(e, '_hoverd')
	},
//	_toggle_index 用語索引 

//	_toggle_words
//	DFN, DT
//	H2, H3, H4, H5, H6
};


/** 原文表示開閉（個別）*/
Util.toggleSource = function(target){
	if(target.lang === 'en') return;
	for(var e = target; e; e = e.parentNode){
		if(e.tagName === 'SECTION') return;
		var c = e.lastElementChild;
		if(c && c.lang === 'en'){
			this.toggleClass(e, 'show-original');
			return;
		}
	}
};
	// click handler

Util.onClick = function(event){
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
};

/*
	case 2:
		that.toggleSource(target);
		break;
*/




/** 目次構築

section の入れ子階層を反映する，入れ子 ol による目次を得る
各 section タグの先頭の子要素（見出し）の内容が目次の各項目の内容に複製される

	引数 root : section を子に持つ DOM 要素

備考
・ section の入れ子は直接の親子関係のみ
・ 子要素を持たない section は無視される
・ 自身またはその見出しに id があてがわれていない section も無視される
・ 見出しの内容にリンクがあると生成項目のリンクが入れ子になる（不正）
・ 見出しの内容に id を持つ要素があると生成項目と id が重複する（不正）
・ 見出しの内容が巨大になる可能性がある
・ すべての Node を走査することになるが、実行速度は getElementsByTagName('section') による反復と変わらないか高速

TODO rebuildToc 抹消
*/


function rebuildToc(main_id, list_id){
	list_id = list_id || '_toc_list';
	var toc_list = E(list_id), main = E(main_id);
	if(toc_list && main) {
		var new_list = Util.buildTocList(main);
		new_list.id = list_id;
		toc_list.parentNode.replaceChild(new_list, toc_list);
	}
	return toc_list;
}
Util.rebuildToc = rebuildToc;

Util.buildTocList = function(root){
	var list = null;
	var range = document.createRange();
	for(var section = root.firstElementChild; 
		section;
		section = section.nextElementSibling
	){
		if('SECTION' !== section.tagName) continue;
		var header = Util.get_header(section);
		if(!header) continue;
		var id = section.id || header.id;
		if(!id) continue;
		var a = C('a');
		a.href = '#' + id;
		range.selectNodeContents(header);
		a.appendChild(range.cloneContents());
/*		header = header.cloneNode(true);
		var node;
		while(node = header.firstChild){
			if(node.id) node.removeAttribute('id');
			a.appendChild(node);
		}
*/
		var li = C('li');
		li.appendChild(a);

		var child_list = Util.buildTocList(section);
		if(child_list) li.appendChild(child_list);
		if(!list) list = C('ol');
		list.appendChild(li);
	}
	return list;
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
		repeat('dfn[id], dt[id]', add_item);
		return list;

		function add_item(dfn){
			var text = dfn.textContent.trim();
			if(!text) return;
			if(text.charAt(0) === '[') return; // おそらく参照文献
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

/** 語彙切替 （訳語 → 原語 変換）

検索パタン
	(1) 漢字+
		動詞的／名詞的 用法は、[さしすせ]が後続しているかどうかで区別
		例：
			接続（する） → connection / connect（する）
			（課題）「〜できる／〜可能」の場合も動詞的用法（例：断片化）

			「動く」のような活用形は語尾も含めて変換する必要があるので
			(3) の「漢字かな」の対象になる
	(2) 漢字+<!--.-->
		重複の区別／無変換指示のため、ドットの部分で検索キーを分岐
		例：
			指定 → specify / designate
			概念 → notion / concept
			取得 → fetch / retrieve / obtain
		ドットの部分が '0' ならば無変換を指示
	(3) 漢字+かな+<!--.-->
		例：予約済み → reserved
		ドットは意味を持たない
	(5) カナ+
	(4) 漢字+カナ+
		例：下位プロトコル → subprotocol
	(6) カナ+漢字+
		例： "サービス供与" → serve, "リソース名" → resource name
	(課題)
		例：
			割り当てる → allocate する
			あてがう → assign する
			呼び出す → invoke する
			呼び出さない → invoke しない
			ページ遷移（する） → navigation / navigate
			待ち行列 → queue
		<漢字><かな>(?=<漢字>) を複合 処理の対象にする？
		[一-龠][ぁ-ゔ]

[\u4E00-\u9FFF] : CJK [一-鿆]
[\u30A1-\u30FC] : カナ [ァ-ー] // "・" も含まれる
[\u3041-\u3094] : かな [ぁ-ゔ]

*/

Util.word_switcher = {
	rxp: 
/(?:(?:[\u30A1-\u30FC]+|[\u4E00-\u9FFF]+)([\u3041-\u3094]*<!--.-->)?)(?=(?:([\u30A1-\u30FC]+|[\u4E00-\u9FFF]+)|([さしすせ]|でき))?)/g,

	main_id: null,
	html: null,

	convert:function(map){
		var main = E(this.main_id);
		if(!this.html) this.html = main.innerHTML;
		var ignore_flag = false;
		main.innerHTML = this.html.replace(this.rxp, function(key, hira, suffix, sa){
			if(ignore_flag){
				ignore_flag = false;
				return (hira || '');
			}
			var val;
			if(hira){
				//(カナ+|漢字+)かな*<!--.-->
				//この場合は suffix, sa を無視
				var opt = hira.slice(-4,-3);
				key = key.slice(0,-8);
				if(opt === '0'){
					return key; // 無変換
				}
				if(hira.length > 8){
					val = map[key];
				} else {
					val = map[key + opt];
				}
			} else if(sa){
				if(key.charCodeAt(0) >= 0x4E00){
					// サ行変格
					val = map[key + '-'];
				}
			} else if(suffix){
				val = map[key + suffix];
				if(val) { // 漢字＋カナ 複合語
					ignore_flag = true;
				}
			}

			val = val || map[key];
			return val? (
				(val.charCodeAt(0) < 128 ? ' ': '')
				+ val + 
				(val.charCodeAt(val.length - 1) < 128 ? ' ': '')
			) : key;
		});
		Util.rebuildToc(this.main_id);
	},
	revert: function(){
		if(!this.html) return;
		E(this.main_id).innerHTML = this.html;
		this.html = null;
		Util.rebuildToc(this.main_id);
	},

	// 2 レベル切替用
	init_toggle: function(){
		var B = E('_toggle_words');
		if(B && ( B.className === '_converted') ){
			B.style.display = 'none';
			return;
		}

//		if(!PAGE_DATA.word_switch) return;
		this.main_id = PAGE_DATA.main;
		var that = this;

		Util.CLICK_HANDLERS._toggle_words = function(){
			Util.switchView(toggleWords2, true);
		}

		function toggleWords2(){
			if(that.html){
				that.revert();
			} else {
				that.convert(
					Util.getMapping(PAGE_DATA.word_switch, {keep: true})
				);
			}
			E('_toggle_words').className = that.html? '_converted' : '';
		}
	},

	// 3 レベル以上用
	num_levels: 3,
	level:0,
	switchWords: function(level){
		if(isNaN(level)){
			level = (this.level + 1);
		}
		level = (level & 0xF) % this.num_levels;
		if(level === this.level) return;
		this.level = level;
		var mapping;
		if(level > 0){
			mapping = 
				Util.getDataByLevel(
					E('words_table').firstChild.data,
					level - 1
				)
				// 恒等置換 削除
				.replace(/^([^\n:]+)[\d\-]?:\1$/mg, '');
			mapping = Util.get_mapping(mapping);
		}
		var that = this;
		Util.switchView(function(){
			level ?
				that.convert(mapping) :
				that.revert();
		}, true);
	}
};


/** 語彙切替（内容生成） */

Util.createWordSwitch = function(source_data){
	var w_switch = C('span');
	w_switch.className = '_hide_if_expanded';
	var html = 
'<input type="button" id="_words_levelX" tabindex="1" accesskey="X" value="用語" title="アクセスキー： X" >';

	source_data.levels.split(':').forEach(function(label, index){
		html += 
'<label><input type="radio" id="_words_level'
+ index
+ '" name="_words" />'
+ label
+ '</label>'
		;
	});
	w_switch.innerHTML = html;
	check_level();
	this.CONTROL_UI.appendChild(w_switch);

	w_switch.onclick = function(event){
		var level = (event.target.id || '').match(/^_words_level(\w)$/);
		if(!level) return;
		level = parseInt(level[1]);
		Util.switchWords(level, source_data);
		if(isNaN(level)) check_level();
	}

	function check_level(){
		w_switch.children[source_data.level + 1].firstChild.checked = true;
	}
}

/** 単語置換（送り仮名なし）*/
Util.switchWords = function(level, options){
	var reset = ! ('level' in options);
	if(!('num_levels' in options)){//TODO
		options.num_levels = options.levels.replace(/[^:]/g, '').length + 1;
	}
	if(reset){
		// fisrt time ... use level as default
		level = COMMON_DATA.getState('words', level, 'number');
	} else if(isNaN(level)){
		level = (options.level + 1) % options.num_levels;
	}
	level &= 0xF;
	if(level >= options.num_levels){
		level = 0;
	}
	if(level === options.level) return;

	options.level = level;

	var mapping = Util.get_mapping(
		Util.getDataByLevel(
			COMMON_DATA.WORDS + get_data('words_table'), level
		)
		// 値の最後の文字が英数の場合は末尾にスペースを補填
		.replace(/(\w)(?=\n)/g, '$1 ')
	);
	var m1 = 
	options.fixed_mapping = options.fixed_mapping || Util.get_mapping(
		COMMON_DATA.SYMBOLS + get_data('words_table1')
	);
	for(var key in m1){
//		if(key in mapping) throw key;
		mapping[key] = m1[key];
	}

	if(reset){
		options.callback(mapping);
	} else {
		Util.switchView(function(){
			options.callback(mapping);
		}, true);
		COMMON_DATA.setState('words', level);
	}

	function get_data(id){
		if(id in options) return options[id];
		//textData
		var e = id && E(id);
		e = e && e.firstChild;
		return (e && e.data) || '';
	}
};


Util.rxp_wordsX = /\b ((?:<\/[^>]*>)+)|([\u2E80-\u9FFF])(?=(<\w[^>]*>)*\w)/g;

/** 単語置換（送り仮名込み）

	１ = 送り仮名１文字目
	２ = 送り仮名２文字目
	サ = [さしすせ]
	＊ = 任意
	？ = 任意，mappingに利用
	／ = 語尾なし

語１２	結果				例
語？？	mapping[語 ？？]	満たす	→satisfyする|満たす
語でき	mapping[語-]１２	定義 + でき	→define|定義 + でき
語？＊	mapping[語 ？]２	共通の + ＊	→common|共通の + ＊
語？／	mapping[語 ？]／	渡す		→passする|渡す
語サ＊	mapping[語-]１２	定義 + され	→define|定義 + され
語サ／	mapping[語-]１／	定義 + し	→define|定義 + し
語＊＊	mapping[語 ]１２	定義 + ＊＊	→definition|定義 + ＊＊
語＊／	mapping[語 ]１／	定義 + ＊	→definition|定義 + ＊
語／／	mapping[語 ]／／	定義		→definition|定義


々U+3005
、U+3001
。U+3002
，U+FF0C
*/
Util.rxp_words1 =
	/~([\w\-]+)|(~*)([\u30A1-\u30F4ー]+|([\u4E00-\u9FFF]+\w*)(-|[あ-ん]{0,2}))/g;
Util.replaceWords1 = function(data, mapping){
	return data.replace( this.rxp_words1,
	function(t, en, til, ja, kan, hira){
		if(en) return (en in mapping)? mapping[en] : t;
		if(til === '~~') return ja;
		if(!kan) return mapping[ja] || t;

		var r = mapping[ja];
		if(r) return r;
		if(hira.length > 0){
			if(hira === 'でき') {
				r = mapping[kan + '-'];
				if(r) return r + hira;
			}
			var hira1 = hira.charAt(0);
			r = mapping[kan + hira1];
			if(r) return r + hira.slice(1);

			if('さしすせ'.indexOf(hira1) >= 0) {
				r = mapping[kan + '-'];
				if(r) return r + hira;
			}
		}
		r = mapping[kan];
		if(r) return r + hira;
//		return ja;
		return hira === '-' ? kan : ja;
	})
	.replace(this.rxp_wordsX, '$1$2 ');
};


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


//original_url, hash_case_modified, no_original_dfn
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
			switch(event.keyCode || event.charCode){
			case 27: // esc
	//			dfnJump0(-1); // back to the original position
				dfnHide();
				break;
			case 37: // left arrow
				var index = dfnLinks.length + 1;
				navBy(-1, event);
				break;
			case 39: // right arrow
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
			Util.toggleClass(e0, 'highlight');
		}
		if(e) {
			Util.toggleClass(e, 'highlight');
		}
		this.current = e;
	}

	this.dfnHide = dfnHide;

	var handlers = this.CLICK_HANDLERS;
	handlers.DT =
	handlers.DFN =
	handlers.H2 =
	handlers.H3 =
	handlers.H4 =
	handlers.H5 =
	handlers.H6 = dfnShow;
	return;// dfnShow;

	function originalID(id, e, is_header){
		if(!PAGE_DATA.original_url) return '';
		if(!is_header && PAGE_DATA.no_original_dfn) return '';

		if(id.charAt(0) === '_') return ''; // 和訳固有の id
		if(id in PAGE_DATA.original_id_map){
			return PAGE_DATA.original_id_map[id];
		}
		if(PAGE_DATA.hash_case_modified && /^dom-/.test(id)){
			return id.toLowerCase();
		}
		return id; // normal
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
		dfnTarget.textContent = (is_header && dfn.title) || ('#' + id);
		dfnTarget.href = '#' + id;
		dfnIndex = -1;
//		dfnTargetScrollPositionY = window.scrollY;

		var original_id = originalID(id, dfn, is_header);
		if(original_id){
			dfnOriginal.href = PAGE_DATA.original_url + '#' + original_id;
			dfnOriginal.style.display = '';
		} else {
			dfnOriginal.style.display = 'none';
		}

		// http://www.w3.org/TR/selectors-api/#queryselector
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
		dfnPanel.style.right = '';
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


/** 内容生成／load 後に素片識別子のアンカーにジャンプ */
Util.navToInit = function(content_generation){

	function is_jump_needed(){
		// ページ遷移が 戻る／進む ボタンによるものと見られる場合はブラウザに任せる
		// onpageshow event.persisted ?
		var nav = window.performance && window.performance.navigation;
		if(nav){
			if(nav.type === nav.TYPE_BACK_FORWARD) return;
		} else {// fallback
			if(window.scrollY > 50) return;
		}

		var hash = window.location.hash;
		if(!hash) return;

		if(!content_generation && !PAGE_DATA.hash_case_modified) return;


		var id = hash.slice(1);
		if(id.indexOf('_xref') === 0) return; // 生成リンク

		var prefix = PAGE_DATA.ref_id_prefix;
		if(! ( ( prefix !== undefined ) && (id.indexOf(prefix) === 0) ) ){
			// 生成された参照文献リンク
			return id;
		}
		if(! content_generation && E(id)) return; // ブラウザに任せる

		return id;
	}

	var id = is_jump_needed();

	if(!id) return;

	var map = PAGE_DATA.original_id_map;
	for(var id0 in map){
		if(map[id0] === id){
			id = id0;
			break;
		}
	}

	var e = E(id) || E1(id);
	if(e){
		e.scrollIntoView();
		if(! e.hasAttribute('tabIndex')){
			e.tabIndex = 0;
		}
		e.focus();
	}

	function E1(id){
		var tag = PAGE_DATA.hash_case_modified;
		if(!tag) return null;
		if(!/^dom-/.test(id)) return null;

		var DFNs = document.getElementsByTagName(tag);
		id = id.toLowerCase();
		for(var i = 0; i < DFNs.length; i++){
			var dfn = DFNs[i];
			var id1 = dfn.id;
			if(id1 && (id1.toLowerCase() === id)){
				return dfn;
			}
		}
		return null;
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
	id = id || PAGE_DATA.alt_refs;

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
			.replace(/● */g, ':http://'),
		JA_LINKS
	);

	var mapping = Object.create(null);
	if(id) repeat('#' + id + ' dt', collect_entries);

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
		var url1 = 'http://' + url;
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
//	console.log(JSON.stringify(JA_LINKS));

	function collect_entries(dt){
		var text = dt.textContent;
		var key = text.replace(/[^\w]/g, '').toUpperCase();
		if(!dt.id){
			// dt に id を自動付与
			text = text.slice(1, -1)// remove surrounding [,]
			dt.id = ref_id_prefix +
				(ref_id_lowercase ? text.toLowerCase() : text );
		}
		key = REF_KEY_MAP[key] || key;
		if(key in mapping){
			// 重複は最初の出現への参照を追加
			add_ref_link0(dt, '#' + mapping[key].id, '【↑】')
		} else {
			mapping[key] = dt;
		}
	}

	function add_ref_link(key, url, label){
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
}

/** 文献 id = 英文 URL = 和訳 URL の対応データ*/

COMMON_DATA.JA_REFS = Object.create(null); // 文献 id -> 和訳 URL
COMMON_DATA.JA_LINKS = Object.create(null);// 英文 URL -> 文献 id

// 短縮形 URL の接頭辞 対応表
COMMON_DATA.JA_BASIS = {
	'' :       'triple-underscore.github.io',
//	XML :      'triple-underscore.github.io/XML',
	mitsue:    'standards.mitsue.co.jp/resources/w3c/TR',
	momdo:     'momdo.s35.xrea.com/web-html-test/spec',
	momdoG:    'momdo.github.io',
	ipa:       'www.ipa.go.jp/security/rfc',
	adagio:    'www.y-adagio.com/public/standards',
	TR:        'www.w3.org/TR',
	CSSWG:     'drafts.csswg.org',
	HTML5:     'html.spec.whatwg.org/multipage',
	IETF:      'tools.ietf.org/html',
	HTTPWG:    'httpwg.github.io/specs',
	studying:  'www.eonet.ne.jp/~h-hash/rfc_ja'
//	HTML5:     'www.whatwg.org/specs/web-apps/current-work/multipage'
//	default:   ''
};
//http://html.spec.whatwg.org/multipage/dom.html#htmlelement

/*
主 副 版 編 ・
＃ ＃ ＃ ＃ 　 参照文献に追加する？
　 　 ＃ ＃ ＃ 和訳リンク対応表に追加する？  JA_LINKS に (url:ref-id) を追加
＃ 　 　 　 　 hover 時に表示する？       JA_REFS に  (ref-id:url) を追加

*/

COMMON_DATA.REF_DATA = '\n\
COMPOSITING1=主       ~/compositing-ja.html\n\
COMPOSITING1=編       dev.w3.org/fxtf/compositing-1/\n\
CORS=副               ~/Fetch-ja.html●Fetch 日本語訳\n\
CSP=主                ~/CSP-ja.html\n\
CSP=版                ~TR/CSP2/\n\
CSP=編                w3c.github.io/webappsec/specs/content-security-policy/\n\
CSP1=主               ~/CSP10-ja.html\n\
CSP1=版               ~TR/CSP/\n\
CSS1=主               www.doraneko.org/webauth/css1/19961217/Overview.html\n\
	CSS1=＊               ~TR/REC-CSS1\n\
CSS21=主              ~momdoG/css2/cover.html\n\
	CSS21=主              ~momdo/CSS21/cover.html\n\
CSS21=副2             hp.vector.co.jp/authors/VA022006/css/index.html\n\
CSS21=副              ~adagio/tr_css2/toc.html●2.0 日本語訳 2\n\
CSS21=版              ~TR/CSS2/\n\
CSS21=編              ~CSSWG/css2/\n\
	CSS32DTRANSFORMS？    ~/css-transforms-ja.html●日本語訳（CSS Transforms）\n\
CSSALIGN=主           ~/css-align-ja.html\n\
CSSALIGN=版           ~TR/css3-align/\n\
CSSALIGN=編           ~CSSWG/css-align/\n\
CSSANIMATIONS1=・     ~CSSWG/css-animations/\n\
CSSANIMATIONS1=主     ~/css-animations-ja.html\n\
CSSANIMATIONS1=編     ~CSSWG/css-animations-1/\n\
CSSBACKGROUNDS3=主    ~/css-backgrounds-ja.html\n\
CSSBACKGROUNDS3=副2   ~mitsue/css3-background/\n\
CSSBACKGROUNDS3=版    ~TR/css3-background/\n\
CSSBACKGROUNDS3=編    ~CSSWG/css-backgrounds-3/\n\
CSSBACKGROUNDS3=・    ~CSSWG/css3-background/\n\
CSSBREAK3=主          ~/css-break-ja.html\n\
CSSBREAK3=版          ~TR/css3-break/\n\
CSSBREAK3=編          ~CSSWG/css-break-3/\n\
CSSBREAK3=・          ~CSSWG/css3-break/\n\
CSSMULTICOL=主        ~/css-multicol-ja.html\n\
CSSMULTICOL=編        ~CSSWG/css-multicol-1/\n\
CSSMULTICOL=版        ~TR/css3-multicol/\n\
CSSCOLOR=主           ~/css-color-ja.html\n\
CSSCOLOR=編           ~CSSWG/css-color/\n\
CSS3COLOR=主          ~mitsue/css3-color/\n\
CSS3COLOR=版          ~TR/css3-color/\n\
CSS3COLOR=編          ~CSSWG/css-color-3/\n\
CSSEXCLUSIONS=主      ~/css-exclusions-ja.html\n\
CSSEXCLUSIONS=版      ~TR/css3-exclusions/\n\
CSSEXCLUSIONS=編      ~CSSWG/css-exclusions/\n\
CSS3FONTS=主          ~/css-fonts-ja.html\n\
CSS3FONTS=版          ~TR/css3-fonts/\n\
CSS3FONTS=・          ~TR/css-fonts-3/\n\
CSS3FONTS=編          ~CSSWG/css-fonts-3/\n\
CSS3FONTS=・          ~CSSWG/css-fonts/\n\
CSS3IMAGES=主         ~/css-images-ja.html\n\
CSS3IMAGES=副         ~momdo/CR-css3-images-20120417.html\n\
CSS3IMAGES=版         ~TR/css3-images/\n\
CSS3IMAGES=編         ~CSSWG/css-images-3/\n\
CSSPAGE=主            ~/css-page-ja.html\n\
CSSPAGE=版            ~TR/css3-page/\n\
CSSPAGE=編            ~CSSWG/css-page/\n\
CSSPAGE=・            ~CSSWG/css-page-3/\n\
CSSPOSITION=編        ~CSSWG/css-position/\n\
CSSPOSITION=版        ~TR/css3-positioning/\n\
CSSSIZING=主          ~/css-sizing-ja.html\n\
CSSSIZING=版          ~TR/css3-sizing/\n\
CSSSIZING=編          ~CSSWG/css-sizing-3/\n\
CSSSIZING=・          ~CSSWG/css-sizing/\n\
CSS3SPEECH=主         ~/css-speech-ja.html\n\
CSS3SPEECH=版         ~TR/css3-speech/\n\
CSS3TEXT=主           ~/css-text-ja.html\n\
	CSS3TEXT=主           suzukima.github.io/css-ja/css3-text/\n\
CSS3TEXT=編           ~CSSWG/css-text-3/\n\
CSS3TEXT=版           ~TR/css-text-3/\n\
CSS3TEXTDECOR=主      ~/css-text-decor-ja.html\n\
CSS3TEXTDECOR=副2     ~momdo/CR-css-text-decor-3-20130801.html\n\
CSS3TEXTDECOR=編      ~CSSWG/css-text-decor-3/\n\
CSS3TEXTDECOR=版      ~TR/css-text-decor-3/\n\
CSSTRANSFORMS1=・     ~CSSWG/css-transforms/\n\
CSSTRANSFORMS1=主     ~/css-transforms-ja.html\n\
CSSTRANSFORMS1=編     ~CSSWG/css-transforms-1/\n\
CSSTRANSFORMS1=・     ~CSSWG/css-transforms/\n\
CSSTRANSITIONS1=・    ~CSSWG/css3-transitions/\n\
CSSTRANSITIONS1=主    ~/css-transitions-ja.html\n\
CSSTRANSITIONS1=版    ~TR/css3-transitions/\n\
CSSTRANSITIONS1=編    ~CSSWG/css-transitions/\n\
CSSUI3=主             ~/css-ui-ja.html\n\
CSSUI3=副             ~momdoG/css-ui/\n\
CSSUI3=版             ~TR/css-ui-3/\n\
CSSUI3=編             ~CSSWG/css-ui-3/\n\
CSSVAL=主             ~/css-values-ja.html\n\
CSSVAL=副2            ~momdo/CR-css3-values-20130404.html\n\
CSSVAL=版             ~TR/css-values/\n\
CSSVAL=編             ~CSSWG/css-values/\n\
CSSVAL=・             ~TR/css3-values/\n\
	CSSVAL=・            ~CSSWG/css-values/\n\
CSSCASCADE=主         ~/css-cascade-ja.html\n\
CSSCASCADE=版         ~TR/css-cascade-3/\n\
CSSCASCADE=編         ~CSSWG/css-cascade-4/\n\
	CSSCASCADE3=・         ~CSSWG/css-cascade/\n\
CSSCONDITIONAL=主     ~/css-conditional-ja.html\n\
CSSCONDITIONAL=版     ~TR/css-conditional/\n\
CSSCONDITIONAL=編     ~CSSWG/css-conditional-3/\n\
CSSCONDITIONAL=・     ~CSSWG/css-conditional/\n\
CSSDISPLAY=主         ~/css-display-ja.html\n\
CSSDISPLAY=版         ~TR/css-display-3/\n\
CSSDISPLAY=編         ~CSSWG/css-display-3/\n\
CSSDISPLAY=・         ~CSSWG/css-display/\n\
CSSDISPLAY=・         ~TR/css-display/\n\
CSSFLEX=主            ~/css-flexbox-ja.html\n\
CSSFLEX=版            ~TR/css3-flexbox/\n\
CSSFLEX=編            ~CSSWG/css-flexbox-1/\n\
CSSGRID=主            ~/css-grid-ja.html\n\
CSSGRID=版            ~TR/css-grid-1/\n\
CSSGRID=編            ~CSSWG/css-grid-1/\n\
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
CSSSTYLEATTR=主       ~mitsue/css-style-attr/\n\
CSSSTYLEATTR=版       ~TR/css-style-attr/\n\
CSSSYNTAX=・          ~CSSWG/css-syntax/\n\
CSSSYNTAX=主          ~/css-syntax-ja.html\n\
CSSSYNTAX=版          ~TR/css3-syntax/\n\
CSSSYNTAX=編          ~CSSWG/css-syntax-3/\n\
CSSSYNTAX=・          ~TR/css-syntax-3/\n\
CSSVARIABLES=主       ~/css-variables-ja.html\n\
CSSVARIABLES=編       ~CSSWG/css-variables/\n\
CSSWRITINGMODES=・    ~CSSWG/css-writing-modes/\n\
CSSWRITINGMODES=主    ~/css-writing-modes-ja.html\n\
CSSWRITINGMODES=副2   suzukima.github.io/css-ja/css3-writing-modes/\n\
CSSWRITINGMODES=版    ~TR/css3-writing-modes/\n\
CSSWRITINGMODES=編    ~CSSWG/css-writing-modes-3/\n\
DOM=主                ~/DOM4-ja.html\n\
DOM=編                dom.spec.whatwg.org/●LS\n\
DOM=版                ~TR/dom/●W3C版\n\
DOM=・                ~TR/domcore/\n\
DOMLEVEL2STYLE=主     ~adagio/tr_dom2_style/expanded-toc.html\n\
ECMASCRIPT=主         tsofthome.appspot.com/ecmascript.html●第五版 訳\n\
ELEMENTTRAVERSAL=主   www.hcn.zaq.ne.jp/___/DOM/ElementTraversal.html\n\
ENCODING=主           ~/Encoding-ja.html\n\
ENCODING=・           encoding.spec.whatwg.org/\n\
FETCH=主              ~/Fetch-ja.html\n\
FETCH=・              fetch.spec.whatwg.org/\n\
FILEAPI=主            ~/File_API-ja.html\n\
FILEAPI=版            ~TR/FileAPI/\n\
FILEAPI=編            w3c.github.io/FileAPI/\n\
FILEAPI=・            dev.w3.org/2006/webapi/FileAPI/\n\
HRTIME2=主            ~/hr-time-2-ja.html\n\
HRTIME2=版            ~TR/hr-time-2/\n\
HRTIME2=編            w3c.github.io/hr-time/\n\
HIGHRESOLUTIONTIME=主 ~/hr-time-ja.html\n\
HIGHRESOLUTIONTIME=版 ~TR/hr-time/\n\
HTML=主               ~momdoG/html5/Overview.html●日本語(部分)訳\n\
HTML=副               ~momdoG/html51/Overview.html●5.1 日本語(部分)訳\n\
	HTML=版               ~TR/html51/●W3C\n\
	HTML=版               html.spec.whatwg.org/multipage/●LS\n\
HTML401=主            www.asahi-net.or.jp/~sd5a-ucd/rec-html401j/cover.html\n\
MQ4=主                ~/mediaqueries4-ja.html\n\
MQ4=編                ~CSSWG/mediaqueries-4/\n\
MEDIAQ=主             ~mitsue/css3-mediaqueries/\n\
MEDIAQ=副             ~/mediaqueries4-ja.html●Level 4 日本語訳\n\
MEDIAQ=副             www.asahi-net.or.jp/~ax2s-kmtn/internet/css/REC-css3-mediaqueries-20120619.html\n\
MEDIAQ=版             ~TR/css3-mediaqueries/\n\
NAVIGATIONTIMING2=主  ~/navigation-timing-2-ja.html\n\
NAVIGATIONTIMING2=版  ~TR/navigation-timing-2/\n\
NAVIGATIONTIMING=主   ~/navigation-timing-ja.html\n\
NAVIGATIONTIMING=版   ~TR/navigation-timing/\n\
NETSCAPE=主           www.futomi.com/lecture/cookie/specification.html\n\
PAGEVISIBILITY=主     ~/page-visibility-ja.html\n\
PAGEVISIBILITY=版     ~TR/page-visibility/\n\
PERFORMANCETIMELINE2=主    ~/performance-timeline-2-ja.html\n\
PERFORMANCETIMELINE2=版    ~TR/performance-timeline-2/\n\
PERFORMANCETIMELINE2=編    w3c.github.io/performance-timeline/\n\
PERFORMANCETIMELINE=主     ~/performance-timeline-ja.html\n\
PERFORMANCETIMELINE=版     ~TR/performance-timeline/\n\
BEACON=主             ~/beacon-ja.html\n\
BEACON=版             ~TR/beacon/\n\
PROGRESSEVENTS=主     ~/ProgressEvents-ja.html\n\
PROGRESSEVENTS=版     ~TR/progress-events\n\
RESOURCETIMING=主     ~/resource-timing-ja.html\n\
RESOURCETIMING=版     ~TR/resource-timing/\n\
RFC1034=主            srgia.com/docs/rfc1034j.html\n\
RFC1123=主            hp.vector.co.jp/authors/VA002682/rfc1123j.htm\n\
RFC1123=副2           www2s.biglobe.ne.jp/~hig/tcpip/HostReq_Appl.html\n\
RFC1630=主            srgia.com/docs/rfc1630j.html\n\
RFC1928=主            srgia.com/docs/rfc1928j.html\n\
RFC2046=主            www.asahi-net.or.jp/~bd9y-ktu/htmlrel_f/dtd_f/rfc_f/rfc2046j.html\n\
RFC2109=主            lab.moyo.biz/translations/rfc/rfc2109-ja.xsp\n\
RFC2109=副2           www5b.biglobe.ne.jp/~type-aya/rfc/rfc2109j.txt\n\
RFC2119=主            www.cam.hi-ho.ne.jp/mendoxi/rfc/rfc2119j.html\n\
RFC2119=副2           www.asahi-net.or.jp/~sd5a-ucd/rfc-j/rfc-2119j.html\n\
RFC2119=副3           www.t-net.ne.jp/~cyfis/rfc/format/rfc2119_ja.html\n\
RFC2119=副4           ~ipa/RFC2119JA.html\n\
RFC2119=副5           ~studying/rfc2119.ja.html\n\
RFC2145=主            ~studying/rfc2145.ja.html\n\
RFC2295=主            ~studying/rfc2295.ja.html\n\
RFC2397=・            ~IETF/rfc2397\n\
RFC2397=主            d.hatena.ne.jp/tily/20071103/p1\n\
RFC2388=主            ~studying/rfc2388.ja.html\n\
HTTP=主               ~/RFC723X-ja.html\n\
HTTP=副               ~studying/rfc2616.ja.html●旧版\n\
RFC2616=主            ~studying/rfc2616.ja.html\n\
	RFC2616=主            ~/RFC2616-ja.html\n\
RFC2616=副            ~/RFC723X-ja.html\n\
RFC2616=・            ~IETF/rfc2616\n\
RFC2616=・            www.ietf.org/rfc/rfc2616.txt\n\
RFC2616=副2           suika.fam.cx/~wakaba/wiki/sw/n/RFC%202616\n\
RFC2616=・            www.w3.org/Protocols/rfc2616/rfc2616-sec8.html\n\
RFC2616=・            www.w3.org/Protocols/rfc2616/rfc2616-sec13.html\n\
RFC2617=主            ~studying/rfc2617.ja.html\n\
RFC2774=主            ~studying/rfc2774.ja.html\n\
RFC2817=主            ~studying/rfc2817.ja.html\n\
RFC2817=副            ~ipa/RFC2817JA.html\n\
RFC2817=・            ~IETF/rfc2817\n\
RFC2818=主            suika.fam.cx/~wakaba/wiki/sw/n/RFC%202818\n\
RFC2818=副2           ~ipa/RFC2818JA.html\n\
RFC2818=副3           ~studying/rfc2818.ja.html\n\
RFC2818=・            www.ietf.org/rfc/rfc2818.txt\n\
RFC2818=・            ~IETF/rfc2818\n\
RFC2965=主            ~studying/rfc2965.ja.html\n\
RFC3174=主            ~ipa/RFC3174JA.html\n\
RFC3174=副2           www7b.biglobe.ne.jp/~k-west/SSLandTLS/rfc3174-Ja.txt\n\
RFC3490=主            www.jdna.jp/survey/rfc/rfc3490j.html\n\
RFC3629=主            www5d.biglobe.ne.jp/~stssk/rfc/rfc3629j.html\n\
RFC3629=副2           www.akanko.net/marimo/data/rfc/rfc3629-jp.txt\n\
RFC3986=主            ~studying/rfc3986.ja.html\n\
	RFC3986=主            ~/RFC3986-ja.html\n\
RFC3986=・            ~IETF/rfc3986\n\
RFC3986=・            www.ietf.org/rfc/rfc3986.txt\n\
RFC3987=主            suika.fam.cx/~wakaba/wiki/sw/n/RFC%203987\n\
RFC4086=主            ~ipa/RFC4086JA.html\n\
RFC4122=主            rui86.hatenablog.jp/entry/2013/07/18/065147\n\
RFC4270=主            ~ipa/RFC4270JA.html\n\
RFC4291=主            srgia.com/docs/rfc4291j.html\n\
RFC4648=主            www5d.biglobe.ne.jp/~stssk/rfc/rfc4648j.html\n\
RFC5234=主            www.cam.hi-ho.ne.jp/mendoxi/rfc/rfc5234j.html\n\
RFC5246=主            ~ipa/RFC5246-00JA.html\n\
RFC5321=主            www.hde.co.jp/rfc/rfc5321_ja.txt\n\
RFC5322=主            srgia.com/docs/rfc5322j.html\n\
RFC5322=副2           www.hde.co.jp/rfc/rfc5322_ja.txt\n\
RFC5789=主            ~studying/rfc5789.ja.html\n\
RFC5789=・            ~IETF/rfc5789\n\
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
SELECT=主             ~mitsue/css3-selectors/\n\
SELECT=副2            zng.info/specs/css3-selectors.html\n\
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
SSML=主               www.asahi-net.or.jp/~ax2s-kmtn/ref/accessibility/REC-speech-synthesis11-20100907.html\n\
SSML=・               ~TR/speech-synthesis11/\n\
STREAMS=主            ~/Streams-ja.html\n\
STREAMS=・            streams.spec.whatwg.org/\n\
STREAMS=・            github.com/whatwg/streams\n\
SVG=主                www.hcn.zaq.ne.jp/___/SVG11-2nd/\n\
TYPEDARRAY=主         ~/TypedArray-ja.html\n\
TYPEDARRAY=版         www.khronos.org/registry/typedarray/specs/latest/\n\
URL=主                ~/URL-ja.html\n\
URL=編                url.spec.whatwg.org/●LS\n\
URL=版                www.w3.org/TR/url/●W3C版\n\
	URL=・                url.spec.whatwg.org/\n\
USERTIMING=主         ~/user-timing-ja.html\n\
USERTIMING=版         ~TR/user-timing/\n\
WCAG20=主             waic.jp/docs/WCAG20/Overview.html\n\
WCAG20=副             www.jsa.or.jp/stdz/instac/commitee-acc/W3C-WCAG/WCAG20/\n\
WEBIDL=主             ~/WebIDL-ja.html\n\
WEBIDL=版             ~TR/WebIDL/\n\
WEBIDL=編             heycam.github.io/webidl/\n\
WEBSOCKETS=主         ~/WebSocket-ja.html\n\
WEBSOCKETS=副2        www.html5.jp/trans/w3c_websockets.html\n\
WEBSOCKETS=編         w3c.github.io/websockets/\n\
WEBSOCKETS=・         dev.w3.org/html5/websockets/\n\
WORKERS=・            ~HTML5/workers.html\n\
WORKERS=・            dev.w3.org/html5/workers/\n\
WORKERS=主            ~/Workers-ja.html\n\
WORKERS=版            ~TR/workers/\n\
WORKERS=編            w3c.github.io/workers/\n\
XHR=・                xhr.spec.whatwg.org/\n\
XHR=主                ~/XHR-ja.html\n\
XHR=版                ~TR/XMLHttpRequest/\n\
XHR=編                dvcs.w3.org/hg/xhr/raw-file/default/xhr-1/Overview.html\n\
XML11=主              w4ard.eplusx.net/translation/W3C/REC-xml11-20060816/\n\
XML=主                w4ard.eplusx.net/translation/W3C/REC-xml-20081126/\n\
XML=・                ~TR/xml/\n\
XMLNS=主              ~XML/Namespaces-ja.html\n\
XMLNS=・              ~TR/xml-names/\n\
XMLSS=主              ~XML/xml-stylesheet-ja.html\n\
XMLSS=・              ~TR/xml-stylesheet/\n\
XSLT=主               ~adagio/tr_xslt10/toc.htm\n\
XSLT=副2              www.infoteria.com/jp/contents/xml-data/REC-xslt-19991116-jpn.htm\n\
XSLT=副3              ~XML/xslt10-ja.html\n\
PROMISES=主           ~/promises-guide-ja.html\n\
PROMISES=・           www.w3.org/2001/tag/doc/promises-guide\n\
';

/* 廃
CSS21=副              www.swlab.it.okayama-u.ac.jp/man/rec-css2/cover.html●2.0 日本語訳\n\

*/

COMMON_DATA.REF_DATA2 = '\n\
~TR/CSS21/●       ~momdoG/css2/\n\
~TR/CSS2/●        ~momdoG/css2/\n\
~CSSWG/css2/●     ~momdoG/css2/\n\
	SVG (@ 不可)\n\
~TR/SVG/●         www.hcn.zaq.ne.jp/___/SVG11-2nd/\n\
~TR/SVG11/●       www.hcn.zaq.ne.jp/___/SVG11-2nd/\n\
	HTML (@ 不可)\n\
~HTML5/●          ~momdoG/html5/\n\
~TR/html5/●       ~momdoG/html5/\n\
www.w3.org/html/wg/drafts/html/master/●  ~momdoG/html5/\n\
	WHTAWG’s HTML to W3C’s HTML \n\
~HTML5/embedded-content.html●  ~momdoG/html5/embedded-content-0.html\n\
~HTML5/elements.html●          ~momdoG/html5/dom.html\n\
~HTML5/interaction.html●       ~momdoG/html5/editing.html\n\
~HTML5/scripting.html●         ~momdoG/html5/scripting-1.html\n\
~HTML5/xhtml.html●             ~momdoG/html5/the-xhtml-syntax.html\n\
~HTML5/comms.html:\n\
';

// 文献 id 別名 -> 文献 id
COMMON_DATA.REF_KEY_MAP = '\n\
DOM4:DOM\n\
DOMLS:DOM\n\
DOMCORE:DOM\n\
	CSS2:CSS21\n\
COMPOSITING:COMPOSITING\n\
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
CSSCOLOR3:CSS3COLOR\n\
CSSCOLOR4:CSSCOLOR\n\
CSS3GRIDLAYOUT:CSSGRID\n\
CSS3CONDITIONAL:CSSCONDITIONAL\n\
CSSCONDITIONAL3:CSSCONDITIONAL\n\
CSS3EXCLUSIONS:CSSEXCLUSIONS\n\
CSS3FONT:CSS3FONTS\n\
CSSFONTS3:CSS3FONTS\n\
CSS3PAGE:CSSPAGE\n\
CSSPAGE3:CSSPAGE\n\
CSSTEXT3:CSS3TEXT\n\
CSSVARIABLES1:CSSVARIABLES\n\
CSSOM1:CSSOM\n\
CSSOMVIEW1:CSSOMVIEW\n\
CSSPOSITION3:CSSPOSITION\n\
CSSIMAGES3:CSS3IMAGES\n\
CSSSIZING3:CSSSIZING\n\
CSS3SIZING:CSSSIZING\n\
CSS3TRANSFORMS:CSSTRANSFORMS1\n\
CSS3TRANSITIONS:CSSTRANSITIONS1\n\
CSSDISPLAY3:CSSDISPLAY\n\
CSS3DISPLAY:CSSDISPLAY\n\
CSSVALUES3:CSSVAL\n\
CSSVALUES:CSSVAL\n\
CSS3VAL:CSSVAL\n\
CSS3UI:CSSUI3\n\
CSSWRITINGMODES3:CSSWRITINGMODES\n\
CSS3WRITINGMODES:CSSWRITINGMODES\n\
CSS3NAMESPACE:CSSNAMESPACES\n\
CSSNAMESPACES3:CSSNAMESPACES\n\
CSS3BACKGROUNDS:CSSBACKGROUNDS3\n\
CSS3BG:CSSBACKGROUNDS3\n\
CSSSTYLEATTR1:CSSSTYLEATTR\n\
MEDIAQUERIES4:MQ4\n\
SELECTORS4:SELECTORS\n\
URLAPISPECIFICATION:URL\n\
XMLHTTPREQUEST:XHR\n\
HTML5:HTML\n\
SVG11:SVG\n\
TYPEDARRAYS:TYPEDARRAY\n\
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

COMMON_DATA.WORDS = '';
COMMON_DATA.SYMBOLS = '\n\
THROW:<b>THROW</b>\n\
WHILE:<b>WHILE</b>\n\
RET:<b>RETURN</b>\n\
IF:<b>IF</b>\n\
ELSE:<b>ELSE</b>\n\
ELIF:<b>ELSE IF</b>\n\
ELSE_:他の場合は\n\
OTHER:その他\n\
FOR: \n\
EACH:<b>各</b>\n\
GOTO:<b>GOTO</b>\n\
BREAK:<b>BREAK</b>\n\
CONTINUE:<b>CONTINUE</b>\n\
MUST:なければならない\n\
MUST_NOT:ならない\n\
SHOULD:べき\n\
MAY:よい\n\
AND:, かつ\n\
OR:, または\n\
EQ: <span class="op">＝</span> \n\
NEQ: <span class="op">≠</span> \n\
LET: :← \n\
SET: ← \n\
F:false\n\
T:true\n\
ON:ON\n\
OFF:OFF\n\
NULL: null \n\
PLUS: <code class="op">+</code> \n\
MINUS: <code class="op">−</code> \n\
MUL: <code class="op">×</code> \n\
DIV: <code class="op">÷</code> \n\
MOD: <code class="op">%</code> \n\
DECBY: <code class="op">−=</code> \n\
INCBY: <code class="op">+=</code> \n\
GT: <code class="op">&gt;</code> \n\
LT: <code class="op">&lt;</code> \n\
LTE: <code class="op">≤</code> \n\
GTE: <code class="op">≥</code> \n\
IN: <span class="op">∈</span> \n\
NIN: <span class="op">∉</span> \n\
UNSPECIFIED:<span class="trans-note">【…未策定】</span>\n\
SYMBOL_DEF_REF:<a href="index.html#common-algo-symbols">アルゴリズムに共通して用いられる表記</a>\n\
INFORMATIVE:<p><em>この節は規定ではない。</em><span lang="en">This section is not normative.</span></p>\n\
\n';


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
