'use strict';


// 要素取得
function E(id){
//	const e = document.getElementById(id);if(!e) {console.log(id);};return e;
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
	const elements = root.querySelectorAll(selector);
	const L = elements.length;
	for(let i = 0; i < L; i++){
		callback(elements[i]);
	}
}

const PAGE_DATA = Object.create(null); 
/* 予約済みメンバ（ # → 詳細は common1.js ）
options:#
original_id_map:#
original_urls:#
trans_metadata:#
spec_metadata:#
ref_normative:#
ref_informative:#
ref_key_map:#
ref_data:#
link_map:
	keyword → リンク先
words_table:
	単語トークン対応
words_table1:
	単語トークン対応表
html_code_list:
	HTML 例示コード
*/

// see common1.js for possible members
const COMMON_DATA = Object.create(null);

// 予約済みメンバ
const Util = {
	_COMP_: null,
	DEFERRED: [], // 遅延実行
	defer: EMPTY_FUNC, // TODO
	initAdditional: EMPTY_FUNC,
	getState: EMPTY_FUNC, // 状態保存
	setState: EMPTY_FUNC,

	get_mapping: EMPTY_FUNC,
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
	collectHtmlCodeList: EMPTY_FUNC,

// common1.js
	ADDITIONAL_NODES: [],
//	CONTROL_UI: C(), //追加 UI
	CLICK_HANDLERS: {},

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




// 改行＋コロン区切りの文字列データから連想配列を取得
Util.get_mapping = function(data, map){
	map = map || Object.create(null);

	const rxp = /\n(\S.*?):(.*)/g;
	let m;
	while(m = rxp.exec(data)){
		map[m[1]] = m[2];
	}
	return map;
};

// ●●区切りの文字列から有名データブロックを抽出
Util.parseBlocks = function(source){
//	const rxp = RegExp('(\n' + splitter + ').+');
	const result = Object.create(null);
	let name = '';
	source.split(/(\n●●.*)/).forEach(function(block){
		if(block.slice(0,3) === '\n●●'){
			name = block.slice(3);
			if(!name){
				// 無名ブロックはコメント
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

/* HTML 例示コード用 */
Util.collectHtmlCodeList = function(parts){
	if(!parts){
		parts = Object.create(null);
	}

	const data = PAGE_DATA.html_code_list;
	delete PAGE_DATA.html_code_list;
	const rxp = /■(\S+)(.*)((?:\n.+)+)/g;
	let m;
	while(m = rxp.exec(data)){
		const pre = C('pre');
		pre.className = 'html-code' + (m[2] || '');
		const markup = m[3].trim().replace(/％/g, '');
		if(markup.indexOf('＜') < 0 ){
			pre.textContent = markup;
		} else {
			pre.innerHTML = markup
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/＜/g, '<mark>')
				.replace(/＞/g, '</mark>')
			;
		}
		parts['_ex-' + m[1]] = pre;
	}
	return parts;
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
	const header = section && section.firstElementChild;
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
		const ss = [];
		for(let p in s){
			ss.push(p + ': ' + s[p]);
		}
		s = ss.join('\n');
	}

	const area = C('textarea');
	area.cols = 200;
	area.rows = 100;
	area.value = s;
	document.body.appendChild(area);
	area.scrollIntoView();
};

// 訳文消去（ diff 比較用）
Util.del_j = function(){
	let parent;

	repeat('.trans-note', function(e){
		e.parentNode.removeChild(e);
	});
	repeat('details', function(e){
		e.open = true;
	});

	repeat('*[lang="en"]', function(en){
		const p = en.parentNode;
		if(en.tagName === 'SPAN'){
			const en1 = C('P');
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
		const text = e.title;
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
	const val = Util.page_state[key];
	return (type && (typeof(val) !== type))? default_val : val;
};

Util.setState = function(key, val){
	const page_state = Util.page_state;
	const old_val = page_state[key];
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
		const opts = Object.defineProperty({}, 'passive', {
			get: function() { Util.supportsListenerOptions = true;}
		});
		window.addEventListener("test", null, opts);
	} catch (e) {}
*/
}

new function(){
	// meta with viewport for mbile (ideally, should be set by CSS, not meta tag)
	const head = document.head || document.getElementsByTagName('head')[0];
	if(!head) return;
//	const w = screen.width;...
	const meta = C('meta');
	meta.setAttribute('name', 'viewport');
	meta.setAttribute('content', 'width=device-width, initial-scale=1, shrink-to-fit=no');
	head.appendChild(meta);
}

new function(){
	Util._COMP_ = new Promise(function(resolve){
		document.addEventListener('DOMContentLoaded', function(){
			init();
			resolve();
		}, false);
	});

	// 初期化
	function init(){
		document.removeEventListener('DOMContentLoaded', init, false);

		const elem = E('_source_data');
		if(elem){
			Object.assign(PAGE_DATA, Util.parseBlocks(elem.textContent));
			elem.parentNode.removeChild(elem);
		}

		const options =
		PAGE_DATA.options = Util.get_mapping(PAGE_DATA.options || '');

		// 利用者 表示設定
		let page_state = (JSON && get_state()) // setup saveStorage
		Util.page_state = page_state = history.state || page_state || Util.page_state;

		const classList = document.body.classList;

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
		let page_state = null;
		let storage_key = null;

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
	const toc_list = E(list_id), main = E(main_id);
	if(toc_list && main) {
		const new_list = Util.buildTocList(main);
		new_list.id = list_id;
		toc_list.parentNode.replaceChild(new_list, toc_list);
	}
	return toc_list;
}

Util.buildTocList = function(root){
	const range = document.createRange();
	const toc = buildToc(root);
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
		let list = null;
		for(let section = root.firstElementChild; 
			section;
			section = section.nextElementSibling
		){
			if('SECTION' !== section.tagName) continue;
			const header = Util.get_header(section);
			if(!header) continue;
			const id = section.id || header.id;
			if(!id) continue;
			const a = C('a');
			a.href = '#' + id;
			range.selectNodeContents(header);
			a.appendChild(range.cloneContents());

			const li = C('li');
			li.appendChild(a);

			const child_list = buildToc(section);
			if(child_list) li.appendChild(child_list);
			if(!list) list = C('ol');
			list.appendChild(li);
		}
		return list;
	}
}


Util.fillHeader = function(){
	const options = PAGE_DATA.options;
	const url = options.original_url || '';
//	if(!url) return;
	let isHTML = false;

	const header = document.body.querySelector('header');
	if(!header) return;
	const hgroup = header.querySelector('hgroup');

	if( url.slice(0,39) === 'https://html.spec.whatwg.org/multipage/' ){
		options.copyright = '2018,whatwg';
	}

	fillLogoImage();
	fillDate();
	placeMetadata();

	function fillDate(){
		let date = options.spec_date;
		if(!date) return;
		if(!hgroup) return;

		const m = date.match(/^(\d+)-0*(\d+)-0*(\d+)$/);
		if(m){
			date = 
'<time datetime="' + date + '">' + m[1] + ' 年 ' + m[2] + ' 月 ' + m[3] + ' 日</time>';
		}
		let header_text;
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

		const html = '<h2>' + header_text + ' — ' + date + '</h2>';
		hgroup.insertAdjacentHTML('beforeend', html);
	}

	function fillLogoImage(){
		// logo 画像
		let html;
		const domain = url.match( /^https?:\/\/([\w\.\-]+)\// );
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
		let html = 
'<details id="_trans_metadata"><summary><strong>この日本語訳は非公式な文書です…</strong></summary></details>';
		if(PAGE_DATA.spec_metadata){
			html += 
'<details id="_spec_metadata"><summary>仕様メタデータ</summary></details>';
		}
		if(options.copyright){
			html += 
'<details id="_copyright"><summary>©</summary></details>';
		}
		if(!PAGE_DATA.options.no_index) {
			html += 
'<details id="_index"><summary>索引など</summary></details>';
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
	const main_id =
	source_data.main_id = source_data.main_id || 'MAIN';
	initHTML();

	source_data.switchWords =  function(level){
		level = Math.min(level & 0xF, this.levels.length - 1 );
		const mapping = Util.get_mapping(
Util.getDataByLevel( COMMON_DATA.WORDS + PAGE_DATA.words_table, level)
			// 値の最後の文字が英数の場合は末尾にスペースを補填
			.replace(/(\w)(?=\n)/g, '$1 ')
			+ COMMON_DATA.SYMBOLS
			+ ( PAGE_DATA.words_table1 || '')
		);

		let parts = this.persisted_parts;
		if(parts){
			Object.keys(parts).forEach(function(id){
				const e = parts[id];
				if(e.parentNode){
					e.parentNode.removeChild(e);
				}
			});
		}

		generateHTML(mapping);
		if( source_data.populate ){
			source_data.populate();
		}

		parts = this.persisted_parts;
		if(parts){
//			console.log(parts);
			Object.keys(parts).forEach(function(id){
				const part = parts[id];
				const e = E(id);
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
		const parts = source_data.persisted_parts || Object.create(null);
		source_data.collectParts(parts);
		source_data.persisted_parts = parts;
	}

	source_data.switchWords(source_data.level);

	Util.DEFERRED.push(create_word_switch);

	// 内容生成完了
	E(main_id).style.display = '';
return;


	function initLevels(){
		let levels = source_data.levels;
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
		let level = source_data.level;
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

		let html = E(main_id).innerHTML;
		// 前処理：英文を抽出して placeholder に置換など
		const en_list = source_data.en_text_list = [
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
		let nesting = '';
		let nesting1;
		let result;
		const premap = Util.get_mapping(COMMON_DATA.PREMAP);

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
//					console.assert(cap1 in premap, 'Undefined PREMAP symbol: ' + match);
					return nesting1 + ( premap[cap1] || '＊' );
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
		if(en_list.length >= 0x1000 ){
			console.log('Error: Too many lang="en" items.');
		}
	}

	function generateHTML(words_mapping){
		const en_list = source_data.en_text_list;

		E(main_id).innerHTML = Util
		.replaceWords1(source_data.generate(), words_mapping)
		.replace(/[\uE000-\uEFFF]/g, function(match){
			return en_list[match.charCodeAt(0) - 0xE000];
		});
	}

	function createToc(id){
		const root = E(id || 'MAIN0'); // default toc
		if(!root) return;
		let nav = E('_toc');
		if(nav){
			nav.textContent = '';
		} else {
			nav = C('nav');
			nav.className = 'toc';
			nav.id = '_toc';
		}
		const h2 = C('h2');
		h2.textContent = '目次';
		nav.appendChild(h2);
		nav.appendChild(Util.buildTocList(root));

		const parent = root.parentNode;
		if(parent.tagName === 'MAIN'){
			parent.parentNode.insertBefore(nav, parent);
		} else {
			parent.insertBefore(nav, root);
		}
	}

	/** 語彙切替（内容生成） UI */

	function create_word_switch(){
		const w_switch = C('span');

		new function(){
			w_switch.className = '_hide_if_expanded';
			let html = 
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
		E('_view_control').appendChild(w_switch);

		w_switch.onclick = function(event){
			let level = (event.target.id || '').match(/^_words_level(\w)$/);
			if(!level) return;
			level = parseInt(level[1]);
			const auto = isNaN(level); // _words_levelX

			if(auto){
				level = (source_data.level + 1 ) % source_data.levels.length;
			}
			if(level === source_data.level) return;
			Util.switchView(function(){
				source_data.switchWords(level);
			}, true);
			Util.setState('words', source_data.level);

			if(auto){
				check_level();
			}
		}

		function check_level(){
			w_switch.children[source_data.level + 1].firstChild.checked = true;
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
	/~([\w\-]+|[あ-ん])|(~*)(((?:[\u4E00-\u9FFF]+|[\u30A1-\u30F4ー]+)\w*)(-|[あ-ん]{0,2}))/g;
Util.replaceWords1 = function(data, mapping){
	return data.replace( this.rxp_words1,
	function(t, en, til, ja, kan, hira){
		if(en){
			if(en[0] > '~') return en;
			return (en in mapping)? mapping[en] : t;
		}
		if(til === '~~') return ja;

		let r = mapping[ja];
		if(r) return r;
		if(hira.length === 0){
			return ja;
		}

		if(hira === 'でき') {
			r = mapping[kan + '-'];
			if(r) return r + hira;
		}
		const hira1 = hira[0];
		r = mapping[kan + hira1];
		if(r) return r + hira.slice(1);

		if('さしすせ'.indexOf(hira1) >= 0) {
			r = mapping[kan + '-'];
			if(r) return r + hira;
		}
		r = mapping[kan];
		if(r) return r + hira;

		return hira === '-' ? kan : ja;
	})
	.replace(this.rxp_wordsX, '$1$2 ');
};

COMMON_DATA.PREMAP = `
終: 
名:\uE00A\uE008名前\uE005
述:\uE00B\uE008名前\uE005
用:\uE007~For\uE005
値:\uE007<a href="~CSSVAL#value-defs">値</a>\uE006
新値:\uE007新たに定義される<a href="~CSSVAL#value-defs">値</a>\uE006
新初:\uE007新たに定義される<a href="~CASCADE#initial-values">初期値</a>\uE005
新算:\uE007新たに定義される<a href="~CASCADE#computed">算出値</a>\uE005
初:\uE007<a href="~CASCADE#initial-values">初期値</a>\uE005
適:\uE007適用対象\uE005
継:\uE007<a href="~CASCADE#inherited-property">継承-</a>\uE005
百:\uE007<a href="~CSSVAL#percentages">百分率</a>\uE005
媒:\uE007媒体\uE005
算:\uE007<a href="~CASCADE#computed">算出値</a>\uE005
順:\uE007正準的順序\uE005
ア:\uE007<a href="~TRANSITION#animatable-properties">~animation</a>\uE005
型:\uE007型\uE005
表終:\uE009
イ型:\uE00C\uE008型\uE005
界面:\uE007~interface\uE005
同期:\uE007同期？\uE005
浮上:\uE007浮上-？\uE005
標的:\uE007標的\uE005
取消:\uE007取消~可？\uE005
構:\uE007Composed？\uE005
既定動作:\uE007既定~動作\uE005
文脈:\uE007文脈~情報\uE005
`;

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


COMMON_DATA.SYMBOLS = `
THROW:<b>THROW</b>
WHILE:<b>WHILE</b>
RET:<b>RETURN</b>
IF:<b>IF</b>
ELSE:<b>ELSE</b>
ELIF:<b>ELSE IF</b>
ELSE_:他の場合は
OTHER:その他
FOR: 
EACH:<b>各</b>
GOTO:<b>GOTO</b>
BREAK:<b>BREAK</b>
CONTINUE:<b>CONTINUE</b>
此れ:<b>これ°</b>
Assert:<b>Assert</b>
MUST:なければならない
MUST_NOT:ならない
SHOULD:べき
MAY:よい
AND:<b>∧</b>
OR:<b>∨</b>
NOT:<b>¬</b>
EQ: <span class="op">＝</span> 
NEQ: <span class="op">≠</span> 
LET: :← 
SET: ← 
F:false
T:true
ON:ON
OFF:OFF
NULL: null 
PLUS: <span class="op">+</span> 
MINUS: <span class="op">−</span> 
MUL: <span class="op">×</span> 
DIV: <span class="op">÷</span> 
MOD: <span class="op">%</span> 
DECBY: <span class="op">−=</span> 
INCBY: <span class="op">+=</span> 
GT: <span class="op">&gt;</span> 
LT: <span class="op">&lt;</span> 
LTE: <span class="op">≤</span> 
GTE: <span class="op">≥</span> 
IN: <span class="op">∈</span> 
NIN: <span class="op">∉</span> 
SYMBOL_DEF_REF:<a href="index.html#common-algo-symbols">アルゴリズムに共通して用いられる表記</a>
INFORMATIVE:<p><em>この節は規範的ではない。</em><span lang="en">This section is non-normative.</span></p>
FINGERPRINTING:<a class="fingerprinting" href="HTML-infrastructure-ja.html#fingerprinting-vector"></a>
SPECBUGS:https://www.w3.org/Bugs/Public/show_bug.cgi
CSSisaLANG:<p><a href="css-snapshot-ja.html#css-is-a-lang">CSS とは…</a></p>
TR:https://www.w3.org/TR
IETF:https://tools.ietf.org/html
TC39:https://tc39.github.io/ecma262/
INFRA:infra-ja.html
DOM4:DOM4-ja.html
DOM-Parsing:DOM-Parsing-ja.html
ENCODING:Encoding-ja.html
FETCH:Fetch-ja.html
SW:https://w3c.github.io/ServiceWorker/
FILEAPI:File_API-ja.html
STREAMS:Streams-ja.html
URL1:URL-ja.html
MIMESNIFF:mimesniff-ja.html
FULLSCREEN:fullscreen-ja.html
NOTIFICATIONS:notifications-ja.html
WEBIDL:WebIDL-ja.html
XHR:XHR-ja.html
UIEVENTS:uievents-ja.html
RFC7230:RFC7230-ja.html
RFC7231:RFC7231-ja.html
RFC7232:RFC7232-ja.html
RFC7234:RFC7234-ja.html
CSSWG:https://drafts.csswg.org
CSSissue:https://github.com/w3c/csswg-drafts/issues
	CSS22:https://www.w3.org/TR/CSS22
CSS22:https://drafts.csswg.org/css2
CSS21:https://www.w3.org/TR/CSS21
CSP3:CSP3-ja.html
COMPOSITING:compositing-ja.html
FILTEREFFECTS1:filter-effects-ja.html
MASKING1:css-masking-ja.html
CASCADE:css-cascade-ja.html
CSS2BOX:css22-box-ja.html
CSS2CONFORM:css-common-ja.html
CSS2VISUDET:css22-visudet-ja.html
CSS2VISUFX:css22-visufx-ja.html
CSS2VISUREN:css22-visuren-ja.html
CSSALIGN:css-align-ja.html
CSSANIM:css-animations-ja.html
CSSBG:css-backgrounds-ja.html
CSSBREAK:css-break-ja.html
CSSCOLOR:css-color-ja.html
CSSCOND:css-conditional-ja.html
CSSCOUNTER:css-counter-styles-ja.html
CSSDISP:css-display-ja.html
CSSEXCLUSION:css-exclusions-ja.html
CSSFLEX:css-flexbox-ja.html
CSSFONT:css-fonts-ja.html
CSSGRID:css-grid-ja.html
CSSIMAGE:css-images-ja.html
CSSIMAGE4:css-images4-ja.html
CSSINLINE:css-inline-ja.html
CSSLOGICAL:css-logical-ja.html
CSSMCOL:css-multicol-ja.html
CSSNS:css-namespaces-ja.html
CSSOM1:cssom-ja.html
CSSOMVIEW:cssom-view-ja.html
CSSOVERFLOW:https://drafts.csswg.org/css-overflow-4/
CSSOVERFLOW3:css-overflow3-ja.html
CSSPAGE:css-page-ja.html
CSSPOS:https://drafts.csswg.org/css-position-3/
CSSRUBY:css-ruby-ja.html
CSSREGION:https://drafts.csswg.org/css-regions-1/
CSSPSEUDO:css-pseudo-ja.html
CSSSTYLEATTR:css-style-attr-ja.html
CSSSYN:css-syntax-ja.html
CSSTEXT:css-text-ja.html
CSSTEXTDECOR:css-text-decor-ja.html
CSSTIMING:css-timing-ja.html
CSSUI:css-ui-ja.html
CSSVAL:css-values-ja.html
CSSVAR:css-variables-ja.html
CSSWM:css-writing-modes-ja.html
SELECTORS4:selectors4-ja.html
SIZING:css-sizing-ja.html
TRANSFORM:css-transforms-ja.html
TRANSFORM2:css-transforms2-ja.html
TRANSITION:css-transitions-ja.html
WANIM:web-animations-ja.html
MQ4:mediaqueries4-ja.html
SVG11:SVG11
SVG2:https://svgwg.org/svg2-draft
HTMLLS:https://html.spec.whatwg.org/multipage
HTML50:https://www.w3.org/TR/html5
ARIA1:https://w3c.github.io/aria/
BROWSERS:browsers-ja.html
WINDOW:HTML-window-ja.html
ORIGIN:HTML-origin-ja.html
HISTORY:HTML-history-ja.html
NAVI:HTML-navigation-ja.html
WAPI:webappapis-ja.html
HTMLGAPI:HTML-global-api-ja.html
HTMLINFRA:HTML-infrastructure-ja.html
HTMLdep:HTML-dependencies-ja.html
HTMLcms:HTML-common-microsyntaxes-ja.html
HTMLcdom:HTML-common-dom-interfaces-ja.html
HTMLurl:HTML-urls-and-fetching-ja.html
HTMLcloning:HTML-structured-data-ja.html
HTMLcomms:HTML-comms-ja.html
HTMLsse:HTML-server-sent-events-ja.html
HTMLdnd:HTML-dnd-ja.html
HTMLdom:HTML-dom-ja.html
HTMLforms:HTML-forms-ja.html
HTMLautofill:HTML-autofill-ja.html
HTMLindex:HTML-index-ja.html
HTMLlinks:HTML-links-ja.html
HTMLnavigator:HTML-navigator-ja.html
HTMLinteraction:HTML-interaction-ja.html
HTMLrendering:HTML-rendering-ja.html
HTMLselectors:selectors-html-ja.html
HTMLxml:HTML-xhtml-ja.html
HTMLwriting:HTML-writing-ja.html
HTMLparsing:HTML-parsing-ja.html
HTMLdynamic:HTML-dynamic-markup-insertion-ja.html
HTMLobs:HTML-obsolete-ja.html
HEinteractive:HTML-interactive-elements-ja.html
HEforms:HTML-form-elements-ja.html
HEinput:HTML-input-ja.html
HEmetadata:HTML-metadata-ja.html
HEgrouping:HTML-grouping-ja.html
HEedits:HTML-edits-ja.html
HEimages:HTML-images-ja.html
HEembed:HTML-embed-ja.html
HEmedia:HTML-media-ja.html
HEcustom:HTML-custom-ja.html
HEtextlevel:HTML-text-level-ja.html
HEsections:HTML-sections-ja.html
HEscripting:HTML-scripting-ja.html
HEcanvas:https://html.spec.whatwg.org/multipage/canvas.html
HEtables:HTML-tables-ja.html
WORKERS:Workers-ja.html
WORKLETS1:worklets-ja.html
WEBSOCKET:WebSocket-ja.html
WEBSTORAGE:WebStorage-ja.html
INDEXEDDB:IndexedDB-ja.html
PROMISES:promises-guide-ja.html
TIMELINE:performance-timeline-ja.html
HRTIME:hr-time-ja.html
FEATUREPOLICY:feature-policy-ja.html
REFERRER-POLICY:webappsec-referrer-policy-ja.html
MIXED-CONTENT:webappsec-mixed-content-ja.html
SECURE-CONTEXT:webappsec-secure-contexts-ja.html
`;

/** 語彙 */
COMMON_DATA.WORDS = '';

