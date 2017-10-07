'use strict';


// 要素取得
function E(id){
//	var e = document.getElementById(id);if(!e) {console.log(id);};return e;
	return document.getElementById(id);
}
// 要素作成
function C(tag){
	return tag ? 
		document.createElement(tag) :
		document.createDocumentFragment();
}

function EMPTY_FUNC(){}

// セレクタ対象の要素を反復処理
function repeat(selector, callback, root){
	if(!root) root = document
	var elements = root.querySelectorAll(selector);
	var L = elements.length;
	for(var i = 0; i < L; i++){
		callback(elements[i]);
	}
}

var PAGE_DATA = Object.create(null); 
/* possible members:
options:
	see common1.js
ref_normative:
ref_informative:
	参照文献データ
original_id_map:
	訳文 id → 原文 id
link_map
	keyword → リンク先
spec_metadata
	仕様メタデータ
words_table:
words_table1:
	単語トークン → 単語

*/

// see common1.js for possible members
var COMMON_DATA = Object.create(null);

// 予約済みメンバ
var Util = {
	_COMP_: false,
	DEFERRED: [], // 遅延実行
	initAdditional: EMPTY_FUNC,
	getState: EMPTY_FUNC, // 状態保存
	setState: EMPTY_FUNC,

	getMapping: EMPTY_FUNC,
	get_mapping: EMPTY_FUNC,
	textData: EMPTY_FUNC,
	getDataByLevel: EMPTY_FUNC,
	get_header: EMPTY_FUNC,
	dump: EMPTY_FUNC,
	del_j: EMPTY_FUNC,

	ready: EMPTY_FUNC,
	rebuildToc: EMPTY_FUNC,
	buildTocList: EMPTY_FUNC,
	parseSourceBlock: EMPTY_FUNC,

// common0a.js にはなし
	switchWordsInit: EMPTY_FUNC,
	replaceWords1: EMPTY_FUNC,
	rxp_wordsX: null,
	rxp_words1: null,
	collectParts: EMPTY_FUNC,
	replaceParts: EMPTY_FUNC,

// common1.js
	ADDITIONAL_NODES: [],
//	CONTROL_UI: C(), //追加 UI
	CLICK_HANDLERS: {},
	CONTAINER_TAGS: {},

	removeAdditionalNodes: EMPTY_FUNC,
	indexHide: EMPTY_FUNC,
	dfnHide: EMPTY_FUNC,
	dfnInit: EMPTY_FUNC,
	altLinkInit: EMPTY_FUNC,
	fillMisc: EMPTY_FUNC,
	toggleSource: EMPTY_FUNC,

	indexInit: EMPTY_FUNC,

	switchView: EMPTY_FUNC,
	ref_position: null,
	page_state: Object.create(null),
	saveStorage: EMPTY_FUNC,
//	supportsListenerOptions: false,

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
		if(!e) return '';
	}
	var data = e.textContent;
	options = options || {};
	if(!options.keep) {
		e.parentNode.removeChild(e);
	}
	return data;
};

Util.parseBlocks = function(source){
//	var rxp = RegExp('(\n' + splitter + ').+');
//	var source = Util.textData('_source_data');
	var result = Object.create(null);
	var name = '';
	source.split(/(\n●●.*)/).forEach(function(block){
		if(block.slice(0,3) === '\n●●'){
			name = block.slice(3);
			if(!name){
				// blocks with empty name are treated as comments
				return;
			}
			if(!(name in result)){
				result[name] = '';
			}
		}else if(name){
			result[name] += block;
		}
	});
	return result;
}


/* 
'token:word1:word2:word3:...' の形式の各行を
'token:word' の形に変換 ( word = level 番目の word )

	word === 空 の場合
		word = 最も level が高い空でない word
	word === '~' の場合
		恒等置換

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


// 節見出しを取得
Util.get_header = function(section){
	var header = section && section.firstElementChild;
	return (
		header && /^H\d$/.test(header.tagName)
	)? header : null;
};


Util.collectParts = function(parts){
	// 既定の収集器
	repeat('#_persisted_parts > *[id]', function(e){
		parts[e.id] = e;
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

	repeat('.trans-note', function(e){
		e.parentNode.removeChild(e);
	});

	repeat('*[lang="en"]', function(en){
		var p = en.parentNode;
		if(en.tagName === 'SPAN'){
			var en1 = C('P');
			p.insertBefore(en1, en);
			en1.appendChild(en);
			en = en1;
			if(p === parent){
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
	});
	Util.DEFERRED.push(function(){
		repeat('details', function(e){
			e.open = true;
		});
	});
};



Util.getState = function(key, default_val, type){
	if(! (key in Util.page_state) ) return default_val;
	var val = Util.page_state[key];
	return (type && (typeof(val) !== type))? default_val : val;
};

Util.setState = function(key, val){
	var page_state = Util.page_state;
	var old_val = page_state[key];
	if(val === old_val) return;
	if(val === undefined){
		delete page_state[key];
	} else {
		page_state[key] = val;
	}

	history.replaceState( page_state, '' );
	Util.saveStorage(page_state);
};


new function(){
	if(!window.console){
		window.console = { log: EMPTY_FUNC };
	}

/*
	try {
		var opts = Object.defineProperty({}, 'passive', {
			get: function() { Util.supportsListenerOptions = true;}
		});
		window.addEventListener("test", null, opts);
	} catch (e) {}
*/
}

new function(){
	// meta with viewport for mbile (ideally, should be set by CSS, not meta tag)
	var head = document.head || document.getElementsByTagName('head')[0];
	if(!head) return;
//	var w = screen.width;...
	var meta = C('meta');
	meta.setAttribute('name', 'viewport');
	meta.setAttribute('content', 'width=device-width, initial-scale=1, shrink-to-fit=no');
	head.appendChild(meta);
}

new function(){
	document.addEventListener('DOMContentLoaded', init, false);

	// 初期化
	function init(){
		document.removeEventListener('DOMContentLoaded', init, false);
		Object.assign(PAGE_DATA, Util.parseBlocks(Util.textData('_source_data')));

		var options =
		PAGE_DATA.options = Util.get_mapping(PAGE_DATA.options || '');

		// 利用者 表示設定
		var page_state = (JSON && get_state()) // setup saveStorage
		Util.page_state = page_state = history.state || page_state || Util.page_state;

		var classList = document.body.classList;

		if(page_state.show_original){
			classList.toggle('show-original');
		}
		if(page_state.side_menu){
			classList.toggle('side-menu');
		}
		if(classList.contains('_expanded')){
			// ページは展開状態で保存されている
			PAGE_DATA.options.expanded = true;
			repeat('._hide_if_expanded', function(e){
//				e.parentNode.removeChild(e);
				e.style.display = 'none';
			});
		} else {
			Util.fillHeader()
			Util.ready(PAGE_DATA);
			classList.add('_expanded');
		}
		Util.initAdditional();
	}

	// 表示状態を sessionStorage から読み込む
	function get_state(){
		var page_state = null;
		var storage_key = null;

		storage_key = PAGE_DATA.options.page_state_key || window.location.pathname;
		try {
// sessionStorage property へのアクセスのみでも security error になることがある
			page_state = sessionStorage.getItem(storage_key);
			Util.saveStorage = function(data){
				sessionStorage.setItem(storage_key, JSON.stringify(data));
			};
			if(! page_state || (page_state.length > 1000)) return;
			page_state = JSON.parse(page_state);
		} catch(e){
			console.log(e.message + ' failed sessionStorage.getItem');
		}
		if(page_state instanceof Object){
			return page_state;
		}
	}
}


Util.initAdditional = function(){
	delete Util.initAdditional;
////
	Util._COMP_ = true;
}


/** 目次構築

section の入れ子階層を反映する，入れ子 ol による目次を得る
各 section タグの先頭の子要素（見出し）の内容が目次の各項目の内容に複製される

	引数 root : section を子に持つ DOM 要素

備考
・ section の入れ子は直接の親子関係のみ
・ 子要素を持たない section は無視される
・ 自身またはその見出しに id があてがわれていない section も無視される
・ 見出しの内容に id を持つ要素があると生成項目と id が重複する（不正）
・ 見出しの内容が巨大になる可能性がある
・ すべての Node を走査することになるが、実行速度は getElementsByTagName('section') による反復と変わらないか高速

*/


Util.rebuildToc = function(main_id, list_id){
	list_id = list_id || '_toc_list';
	var toc_list = E(list_id), main = E(main_id);
	if(toc_list && main) {
		var new_list = Util.buildTocList(main);
		new_list.id = list_id;
		toc_list.parentNode.replaceChild(new_list, toc_list);
	}
	return toc_list;
}

Util.buildTocList = function(root){
	var range = document.createRange();
	var toc = buildToc(root);
	if(toc) { // a 要素の入れ子を除去
		repeat('a a', function(e){
			range.selectNodeContents(e);
			e.parentNode.replaceChild(range.extractContents(), e);
		}, toc);
		repeat('[id]', function(e){ // 重複 id を除去
			e.removeAttribute('id');
		}, toc);
	}
	return toc;

	function buildToc(root){
		var list = null;
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

			var li = C('li');
			li.appendChild(a);

			var child_list = buildToc(section);
			if(child_list) li.appendChild(child_list);
			if(!list) list = C('ol');
			list.appendChild(li);
		}
		return list;
	}
}


Util.fillHeader = function(){
	var options = PAGE_DATA.options;
	var url = options.original_url || '';
//	if(!url) return;
	var isHTML = false;

	var header = document.body.querySelector('header');
	if(!header) return;
	var hgroup = header.querySelector('hgroup');

	fillLogoImage();
	fillDate();
	placeMetadata();

	function fillDate(){
		var date = options.spec_date;
		if(!date) return;
		if(!hgroup) return;

		var m = date.match(/^(\d+)-0*(\d+)-0*(\d+)$/);
		if(m){
			date = 
'<time datetime="' + date + '">' + m[1] + ' 年 ' + m[2] + ' 月 ' + m[3] + ' 日</time>';
		}
		var header_text;
		if(isHTML) {
			header_text = 'HTML Living Standard';
		} else {
			header_text = {
WD: '作業草案',
ED: '編集者草案',
EDCG: 'W3C Community Group Draft Report',
PR: '勧告案',
CR: '勧告候補',
REC: '勧告',
NOTE: 'Working Group Note',
LS: 'Living Standard',
//IETFPR: 'IETF PROPOSED STANDARD'
			}[options.spec_status] || '';
		}

		var html = '<h2>' + header_text + ' — ' + date + '</h2>';
		hgroup.insertAdjacentHTML('beforeend', html);
	}

	function fillLogoImage(){
		// logo 画像
		var html;
		var domain = url.match( /^https?:\/\/([\w\.\-]+)\// );
		if(!domain) return;
		switch(domain[1]){
		case 'www.w3.org':
		case 'w3c.github.io':
		case 'drafts.csswg.org':
			html = '<a href="https://www.w3.org/" id="_W3C">W3C</a>';
			break;
		case 'html.spec.whatwg.org':
			html = '<a href="https://whatwg.org/" id="_WHATWG">WHATWG</a>';
			isHTML = true;
		default:
			return;
		}
		header.insertAdjacentHTML('afterbegin', html);
	}

	// metadata 置き場
	function placeMetadata(){
		var html = 
'<details id="_trans_metadata"><summary><strong>この日本語訳は非公式な文書です…</strong></summary></details>';
		if(PAGE_DATA.spec_metadata){
			html += 
'<details id="_spec_metadata"><summary>仕様メタデータ</summary></details>';
		}
		if(options.copyright){
			html += 
'<details id="_copyright"><summary>©</summary></details>';
		}
		if(hgroup){
			hgroup.insertAdjacentHTML('afterend', html);
		} else {
			header.insertAdjacentHTML('beforeend', html);
		}
	}
}


/** 語彙切替／ HTML 生成 */

Util.switchWordsInit = function(source_data){
	source_data = source_data || {};
	if(!source_data.generate) source_data.generate = Util.produce;
	initLevels();
	var main_id =
	source_data.main_id = source_data.main_id || 'MAIN';
	initHTML();

	source_data.switchWords =  function(level){
		level = Math.min(level & 0xF, this.levels.length - 1 );
		var mapping = Util.get_mapping(
Util.getDataByLevel( COMMON_DATA.WORDS + PAGE_DATA.words_table, level)
			// 値の最後の文字が英数の場合は末尾にスペースを補填
			.replace(/(\w)(?=\n)/g, '$1 ')
			+ COMMON_DATA.SYMBOLS
			+ ( PAGE_DATA.words_table1 || '')
		);

		var parts = this.persisted_parts;
		if(parts){
			Object.keys(parts).forEach(function(id){
				var e = parts[id];
				if(e.parentNode){
					e.parentNode.removeChild(e);
				}
			});
		}

		generateHTML(mapping);
		if( source_data.populate ){
			source_data.populate();
		}

		var parts = this.persisted_parts;
		if(parts){
//			console.log(parts);
			Object.keys(parts).forEach(function(id){
				var part = parts[id];
				var e = E(id);
				if(e) {
					e.parentNode.replaceChild(part, e);
				} else {
					console.log('replaceParts: place holder not found for id=' + id );
				}
			});
		}
		createToc(this.toc_main);
		this.level = level;
	}

	if(source_data.collectParts){
		var parts = source_data.persisted_parts || Object.create(null);
		source_data.collectParts(parts);
		source_data.persisted_parts = parts;
	}

	source_data.switchWords(source_data.level);

	Util.DEFERRED.push(function(){
		Util.create_word_switch(source_data);
	});

	// 内容生成完了
	E(main_id).style.display = '';
return;


	function initLevels(){
		var levels = source_data.levels;
		if(!levels){
			switch(PAGE_DATA.options.page_state_key){
			case 'CSS':
			case 'TIMING' :
				levels = '英語主体:英語寄り:漢字主体:カナ主体';
				break;
			case 'HTML' :
			default:
				levels = 'ほぼ英語:英語主体:漢字+英語:漢字主体:カナ主体';
			}
		}
		levels = 
		source_data.levels = levels.split(':');
		if(levels.length === 0) levels = ['-'];
		var level = source_data.level;
		if(!level) {
			level = [0,1,1,2,2,3,3,4,4,5,5][levels.length] || 0;
		}
		level = Util.getState('words', level, 'number')
		source_data.level = Math.min( level & 0xF, levels.length - 1 );
	}

	function initHTML(){
		if(PAGE_DATA.link_map){
			source_data.link_map = Util.get_mapping(PAGE_DATA.link_map);
			delete PAGE_DATA.link_map;
		}

		var html = E(main_id).innerHTML;
		// 前処理：英文を抽出して placeholder に置換など
		var en_list = source_data.en_text_list = [
'</span>', // \uE000
'<span lang="en">', // \uE001
'<span class="trans-note">', // \uE002
'：<span class="block">', // \uE003
'：<span class="block preline">', // \uE004
	// see PREMAP
'<td>', // \uE005
'<td class="prod">', // \uE006
'<tr><th>', // \uE007
'<tbody><tr><th>', // \uE008
'</tbody></table>', // \uE009
'<table class="propdef">', // \uE00A
'<table class="descdef">', // \uE00B
'<table class="eventdef">' // \uE00C
		];
		var nesting = '';
		var nesting1;
		var result;
		var premap = Util.get_mapping(COMMON_DATA.PREMAP);

		html = 
		source_data.html = html.replace(
		/◎([\u0080-\uFFFF]\S*|[^<◎]+)|【.*?】|⇒＃?\s*|<\/(?:li|p|dd|div|th|td)\b/g,
		// 一-鿆ア-ン
		// ⇒|⇒＃を中で利用するタグはこれらのみ（ ... figcaption|blockquote|pre ）
		// U+E000.., 私用領域（ likely never be used in the specs.
		// up to 24bit 4096 items

		function f(match, cap1){
			switch(match[0]){
			case '◎':
				nesting1 = nesting;
				nesting = ''; // ⇒ を終端させる
				if(match.charCodeAt(1) < 0x80){
					// english text
					en_list.push( cap1.trim() );
					return (
						nesting1
						+ '\uE001'
						+ ( String.fromCharCode(0xE000 + en_list.length - 1 ) )
						+ '\uE000'
					);
				} else {
					// PREMAP
					cap1 = premap[cap1];
					if(!cap1) {
						console.log('Undefined PREMAP symbol: ' + match );
						return nesting1 + '＊' + match;
					}
					return nesting1 + cap1;
	//				return nesting1 + ( premap[cap1] || '＊' );
				}
			case '【':
				return '\uE002' + match + '\uE000';
				// TODO: 【\t で開始するならば <p> 用バージョン 等々
			case '⇒':
				nesting += '\uE000';
				return ( match[1] === '＃' )? '\uE004' : '\uE003';
			case '<':
				nesting1 = nesting;
				nesting = '';
				return nesting1 + match;
			}
		});
		if(en_list.length >= 4096 ){
			console.log('Error: Too many lang="en" items.');
		}
	}

	function generateHTML(words_mapping){
		var html = source_data.html;
		var en_list = source_data.en_text_list;

		E(main_id).innerHTML = Util
		.replaceWords1(source_data.generate(), words_mapping)
		.replace(/[\uE000-\uEFFF]/g, function(match){
			return en_list[match.charCodeAt(0) - 0xE000];
		});
	}

	function createToc(id){
		var root = E(id || 'MAIN0'); // default toc
		if(!root) return;
		var nav = E('_toc');
		if(nav){
			nav.textContent = '';
		} else {
			nav = C('nav');
			nav.className = 'toc';
			nav.id = '_toc';
		}
		var h2 = C('h2');
		h2.textContent = '目次';
		nav.appendChild(h2);
		nav.appendChild(Util.buildTocList(root));

		var parent = root.parentNode;
		if(parent.tagName === 'MAIN'){
			parent.parentNode.insertBefore(nav, parent);
		} else {
			parent.insertBefore(nav, root);
		}
	}
}



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
	/~([\w\-]+|[あ-ん])|(~*)([\u30A1-\u30F4ー]+|([\u4E00-\u9FFF]+\w*)(-|[あ-ん]{0,2}))/g;
Util.replaceWords1 = function(data, mapping){
	return data.replace( this.rxp_words1,
	function(t, en, til, ja, kan, hira){
		if(en){
			if(en[0] > '~') return en;
			return (en in mapping)? mapping[en] : t;
		}
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

COMMON_DATA.PREMAP = '\n\
終: \n\
名:\uE00A\uE008名前\uE005\n\
述:\uE00B\uE008名前\uE005\n\
対:\uE007~For\uE005\n\
値:\uE007<a href="css-values-ja.html#value-defs">値</a>\uE006\n\
新値:\uE007新たに定義される値\uE006\n\
新初:\uE007新たに定義される初期値\uE005\n\
新算:\uE007新たに定義される算出値\uE005\n\
初:\uE007初期値\uE005\n\
適:\uE007適用対象\uE005\n\
継:\uE007継承-\uE005\n\
百:\uE007百分率\uE005\n\
媒:\uE007媒体\uE005\n\
算:\uE007算出値\uE005\n\
順:\uE007正準的順序\uE005\n\
ア:\uE007~animation\uE005\n\
型:\uE007型\uE005\n\
表終:\uE009\n\
イ型:\uE00C\uE008型\uE005\n\
界面:\uE007~interface\uE005\n\
同期:\uE007同期？\uE005\n\
浮上:\uE007浮上-？\uE005\n\
標的:\uE007標的\uE005\n\
取消:\uE007取消可？\uE005\n\
構:\uE007Composed？\uE005\n\
既定動作:\uE007既定~動作\uE005\n\
文脈:\uE007文脈~情報\uE005\n\
';

/*
"終" は "⇒" の終端用

	CSS propdef
名:<table class="propdef"><tbody><tr><th>名前<td>
述:<table class="descdef"><tbody><tr><th>名前<td>
対:<tr><th>~For<td>
値:<tr><th><a href="css-values-ja.html#value-defs">値</a><td class="prod">
新値:<tr><th>新たに定義される値<td class="prod">
新初:<tr><th>新たに定義される初期値<td>
新算:<tr><th>新たに定義される算出値<td>
初:<tr><th>初期値<td>
適:<tr><th>適用対象<td>
継:<tr><th>継承-<td>
百:<tr><th>百分率<td>
媒:<tr><th>媒体<td>
算:<tr><th>算出値<td>
順:<tr><th>正準的順序<td>
ア:<tr><th>~animation<td>
型:<tr><th>型<td>
表終:</tbody></table>

	UIEVENTS CSS eventdef
イ型:<table class="eventdef"><tbody><tr><th>型<td>
界面:<tr><th>~interface<td>
同期:<tr><th>同期？<td>
浮上:<tr><th>浮上-？<td>
標的:<tr><th>標的<td>
取消:<tr><th>取消可？<td>
構:<tr><th>Composed？<td>
既定動作:<tr><th>既定~動作<td>
文脈:<tr><th>文脈~情報<td>

*/


/*
AND:<b>∧</b>\n\
OR:<b>∨</b>\n\
*/

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
此れ:<b>これ°</b>\n\
Assert:<b>Assert</b>\n\
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
PLUS: <span class="op">+</span> \n\
MINUS: <span class="op">−</span> \n\
MUL: <span class="op">×</span> \n\
DIV: <span class="op">÷</span> \n\
MOD: <span class="op">%</span> \n\
DECBY: <span class="op">−=</span> \n\
INCBY: <span class="op">+=</span> \n\
GT: <span class="op">&gt;</span> \n\
LT: <span class="op">&lt;</span> \n\
LTE: <span class="op">≤</span> \n\
GTE: <span class="op">≥</span> \n\
IN: <span class="op">∈</span> \n\
NIN: <span class="op">∉</span> \n\
UNSPECIFIED:<span class="trans-note">【…未策定】</span>\n\
SYMBOL_DEF_REF:<a href="index.html#common-algo-symbols">アルゴリズムに共通して用いられる表記</a>\n\
INFORMATIVE:<p><em>この節は規範的ではない。</em><span lang="en">This section is non-normative.</span></p>\n\
FINGERPRINTING:<a class="fingerprinting" href="HTML-infrastructure-ja.html#fingerprinting-vector"></a>\n\
SPECBUGS:https://www.w3.org/Bugs/Public/show_bug.cgi\n\
CSSisaLANG:<p><a href="css-snapshot-ja.html#css-is-a-lang">CSS とは…</a></p>\n\
TR:https://www.w3.org/TR\n\
IETF:https://tools.ietf.org/html\n\
TC39:https://tc39.github.io/ecma262/\n\
INFRA:infra-ja.html\n\
DOM4:DOM4-ja.html\n\
DOM-Parsing:DOM-Parsing-ja.html\n\
ENCODING:Encoding-ja.html\n\
FETCH:Fetch-ja.html\n\
SW:https://w3c.github.io/ServiceWorker/\n\
FILEAPI:File_API-ja.html\n\
STREAMS:Streams-ja.html\n\
URL1:URL-ja.html\n\
MIMESNIFF:https://mimesniff.spec.whatwg.org/\n\
WEBIDL:WebIDL-ja.html\n\
XHR:XHR-ja.html\n\
UIEVENTS:uievents-ja.html\n\
RFC7230:RFC7230-ja.html\n\
RFC7231:RFC7231-ja.html\n\
RFC7232:RFC7232-ja.html\n\
RFC7234:RFC7234-ja.html\n\
CSSWG:https://drafts.csswg.org\n\
CSS22:https://www.w3.org/TR/CSS22\n\
CSS21:https://www.w3.org/TR/CSS21\n\
CSP3:CSP3-ja.html\n\
COMPOSITING:compositing-ja.html\n\
CASCADE:css-cascade-ja.html\n\
CSS2BOX:css22-box-ja.html\n\
CSS2CONFORM:css-common-ja.html\n\
CSS2VISUDET:css22-visudet-ja.html\n\
CSS2VISUFX:css22-visufx-ja.html\n\
CSS2VISUREN:css22-visuren-ja.html\n\
CSSALIGN:css-align-ja.html\n\
CSSANIM:css-animations-ja.html\n\
CSSBG:css-backgrounds-ja.html\n\
CSSBREAK:css-break-ja.html\n\
CSSCOLOR:css-color-ja.html\n\
CSSCOND:css-conditional-ja.html\n\
CSSCOUNTER:css-counter-styles-ja.html\n\
CSSDECOR:css-text-decor-ja.html\n\
CSSDISP:css-display-ja.html\n\
CSSEXCLUSION:css-exclusions-ja.html\n\
CSSFLEX:css-flexbox-ja.html\n\
CSSFONT:css-fonts-ja.html\n\
CSSGRID:css-grid-ja.html\n\
CSSIMAGE:css-images-ja.html\n\
CSSIMAGE4:css-images4-ja.html\n\
CSSINLINE:css-inline-ja.html\n\
CSSLOGICAL:css-logical-ja.html\n\
CSSMCOL:css-multicol-ja.html\n\
CSSNS:css-namespaces-ja.html\n\
CSSOM1:cssom-ja.html\n\
CSSOMVIEW:cssom-view-ja.html\n\
CSSOVERFLOW:https://drafts.csswg.org/css-overflow-4/\n\
CSSOVERFLOW3:css-overflow3-ja.html\n\
CSSPAGE:css-page-ja.html\n\
CSSPOS:https://drafts.csswg.org/css-position-3/\n\
CSSREGION:https://drafts.csswg.org/css-regions-1/\n\
SELECTORS4:selectors4-ja.html\n\
SELECTORS:selectors4-ja.html\n\
CSSPSEUDO:css-pseudo-ja.html\n\
CSSSTYLEATTR:css-style-attr-ja.html\n\
CSSSYN:css-syntax-ja.html\n\
CSSTEXT:css-text-ja.html\n\
CSSTEXTDECOR:css-text-decor-ja.html\n\
CSSUI:css-ui-ja.html\n\
CSSVAL:css-values-ja.html\n\
CSSVAR:css-variables-ja.html\n\
CSSWM:css-writing-modes-ja.html\n\
CSSSIZING:css-sizing-ja.html\n\
SIZING:css-sizing-ja.html\n\
TRANSFORM:css-transforms-ja.html\n\
TRANSFORM2:css-transforms2-ja.html\n\
TRANSITION:css-transitions-ja.html\n\
MQ4:mediaqueries4-ja.html\n\
SVG11:SVG11\n\
SVG2:https://svgwg.org/svg2-draft\n\
HTML5:https://html.spec.whatwg.org/multipage\n\
HTML50:https://www.w3.org/TR/html5\n\
BROWSERS:browsers-ja.html\n\
WINDOW:HTML-window-ja.html\n\
ORIGIN:HTML-origin-ja.html\n\
HISTORY:HTML-history-ja.html\n\
NAVI:HTML-navigation-ja.html\n\
WAPI:webappapis-ja.html\n\
HTMLGAPI:HTML-global-api-ja.html\n\
HTMLINFRA:HTML-infrastructure-ja.html\n\
HTMLdep:HTML-dependencies-ja.html\n\
HTMLcms:HTML-common-microsyntaxes-ja.html\n\
HTMLcdom:HTML-common-dom-interfaces-ja.html\n\
HTMLurl:HTML-urls-and-fetching-ja.html\n\
HTMLcloning:HTML-structured-data-ja.html\n\
HTMLcomms:HTML-comms-ja.html\n\
HTMLsse:HTML-server-sent-events-ja.html\n\
HTMLdnd:HTML-dnd-ja.html\n\
HTMLdom:HTML-dom-ja.html\n\
HTMLforms:HTML-forms-ja.html\n\
HTMLautofill:HTML-autofill-ja.html\n\
HTMLindex:HTML-index-ja.html\n\
HTMLlinks:HTML-links-ja.html\n\
HTMLnavigator:HTML-navigator-ja.html\n\
HTMLinteraction:HTML-interaction-ja.html\n\
HTMLrendering:HTML-rendering-ja.html\n\
HTMLselectors:selectors-html-ja.html\n\
HTMLxml:HTML-xhtml-ja.html\n\
HTMLwriting:HTML-writing-ja.html\n\
HTMLparsing:HTML-parsing-ja.html\n\
HTMLobs:https://html.spec.whatwg.org/multipage/obsolete.html\n\
HEinteractive:HTML-interactive-elements-ja.html\n\
HEforms:HTML-form-elements-ja.html\n\
HEinput:HTML-input-ja.html\n\
HEmetadata:HTML-metadata-ja.html\n\
HEgrouping:HTML-grouping-ja.html\n\
HEedits:HTML-edits-ja.html\n\
HEimages:HTML-images-ja.html\n\
HEembed:HTML-embed-ja.html\n\
HEmedia:HTML-media-ja.html\n\
HEcustom:HTML-custom-ja.html\n\
HEtextlevel:HTML-text-level-ja.html\n\
HEsections:HTML-sections-ja.html\n\
HEscripting:HTML-scripting-ja.html\n\
HEcanvas:https://html.spec.whatwg.org/multipage/canvas.html\n\
HEtables:HTML-tables-ja.html\n\
WEBSOCKET:WebSocket-ja.html\n\
WORKERS:Workers-ja.html\n\
WEBSTORAGE:WebStorage-ja.html\n\
INDEXEDDB:IndexedDB-2nd-ja.html\n\
PROMISES:promises-guide-ja.html\n\
TIMELINE:performance-timeline-ja.html\n\
HRTIME:hr-time-ja.html\n\
REFERRER-POLICY:webappsec-referrer-policy-ja.html\n\
MIXED-CONTENT:webappsec-mixed-content-ja.html\n\
SECURE-CONTEXT:webappsec-secure-contexts-ja.html\n\
\n';

/** 語彙 */
COMMON_DATA.WORDS = '';

