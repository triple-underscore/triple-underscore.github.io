'use strict';


// 要素取得
const E = (id) => {
//	const e = document.getElementById(id);if(!e) {console.log(id);};return e;
	return document.getElementById(id);
}
// 要素作成
const C = (tag) => {
	return tag ? 
		document.createElement(tag) :
		document.createDocumentFragment();
}

const EMPTY_FUNC = () => {}

// セレクタ対象の要素を反復処理
const repeat = (selector, callback, root) => {
	if(!root) root = document
	const elements = root.querySelectorAll(selector);
	const L = elements.length;
	for(let i = 0; i < L; i++){
		callback(elements[i]);
	}
}

const PAGE_DATA = Object.create(null); 
/* 予約済みメンバ
• 付帯情報用（ 詳細は common1.js ）
options
original_id_map
original_urls
trans_metadata
spec_metadata
copyright
ref_normative
ref_informative
ref_additional
ref_key_map
ref_data

• 本文 html 生成用
words_table: 単語トークン置換表
words_table1: 単語トークン置換表（固定的）
class_map: class 名 対応表
tag_map: tag 名 対応表
link_map: リンク先 対応表
abbr_url: ページ URL 略称コード（ "INFRA" 等）
html_code_list: HTML 見本コード
images: 画像データ
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
	collectParts: EMPTY_FUNC, // 今や無用
	collectDeclaredParts: EMPTY_FUNC,
	replaceParts: EMPTY_FUNC,

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
Util.get_mapping = (data, map) => {
	map = map || Object.create(null);
	const rxp = /\n(\S.*?):(.*)/g;
	let m;
	while(m = rxp.exec(data)){
		map[m[1]] = m[2];
	}
	return map;
};

// ●●区切りの文字列から有名データブロックを抽出
Util.parseBlocks = (source) => {
//	const rxp = RegExp('(\n' + splitter + ').+');
	const result = Object.create(null);
	let name = '';
	for( const block of source.split(/(\n●●.*)/) ){
		if(block.slice(0,3) === '\n●●'){
			name = block.slice(3);
			if(!name){
				// 無名ブロックはコメント
				continue;
			}
			if(!(name in result)){
				result[name] = '';
			}
		} else if(name){
			result[name] += block;
		}
	};
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

Util.getDataByLevel = (data, level) => {
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
Util.get_header = (section) => {
	const header = section && section.firstElementChild;
	return (
		header && /^H\d$/.test(header.tagName)
	)? header : null;
};


Util.collectDeclaredParts = (parts) => {
	// 既定の収集器
	if(PAGE_DATA.html_code_list){
		// HTML 見本コード id="_ex-html-${key}"
		const data = PAGE_DATA.html_code_list;
		delete PAGE_DATA.html_code_list;
		const rxp = /■(\S+)(.*)((?:\n.+)+)/g;
		let m;
		while(m = rxp.exec(data)){
			const pre = C('pre');
			pre.className = 'lang-html' + (m[2] || '');
			const markup = m[3].trim();
			if(/[%＜]/.test(markup)){
				pre.innerHTML = markup
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/＜/g, '<mark>')
					.replace(/＞/g, '</mark>')
					.replace(/%(\w+)/g, '<var>$1</var>')
					.replace(/％/g, '')
				;
			} else {
				pre.textContent = markup.replace(/％/g, '');
			}
			parts['_ex-html-' + m[1]] = pre;
		}
	}

	if(PAGE_DATA.images){
		// 画像データから img を生成
		let image_path = '';
		const data = PAGE_DATA.images.replace(/＼\n/g, ''); // 行継続
		data.split('\n').forEach( (line) => {
			if(line[0] === '＠'){
				image_path = line.slice(1); // 例： '＠images/'
				return;
			}
			let [id, style, alt, src] = line.split('｜');
			// 例：foo｜height:10rem｜fooのデモ｜foo.png
			if(!src) return;
			if(! /^[\w\-\.]+$/.test(id)) return;
			if(src.startsWith('data:image/')){
				// data URL
			} else {
				if(src[0] === '.'){
					// src は拡張子のみ
					src = id + src;
				}
				src = `${image_path}${src}`;
			}
			id = `_dgm-${id}`; // 常に _dgm- を接頭

			const img = C('img');
			img.loading = 'lazy'; // 常に lazy
			img.src = src;
			if(style){
				img.setAttribute('style', style);
			}
			let is_ext = (alt === '');
			if(alt[0] === '＝'){
				// 代替テキストの内容は本文と重複
				is_ext = true;
				alt = alt.slice(1);
			}
			if(alt){
				img.alt = (alt === '＋')? '' : alt; // '＋' は明示的な空文字列
			}
			if(is_ext){
				// 代替テキストは img の外（直後）
				img.setAttribute('aria-describedby', id);
			}
			parts[id] = img;
		});
	}

	const container = E('_persisted_parts');
	if(container && (container.tagName === 'TEMPLATE')){
		Array.from(container.content.children).forEach( e => {
			const id = e.getAttribute('aria-describedby') || e.id;
			// aria-describedby 用の id は 1 個だけが前提
			if(id){
				parts[id] = e;
			}
		});
	}
};

Util.dump = (s) => {
	if(s instanceof Array){
		s = s.join('\n');
	} else if(s instanceof Object){
		const ss = [];
		for(let p in s){
			ss.push( `${p}: ${s[p]}` );
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

// 訳文消去（原文 diff 比較用）
Util.del_j = () => {
	let parent;

	repeat('.trans-note', (e) => {
		e.remove();
	});
	repeat('details', (e) => {
		e.open = true;
	});
	repeat('.alt', (e) => {
		e.hidden = false;
	});

	repeat('._en', (en) => {
		const p = en.parentNode;
		if(en.tagName === 'SPAN'){
			const en1 = C('P');
			en.before(en1);
			en1.appendChild(en);
			en = en1;
			if(p === parent){
				return;
			}
			parent = p;
		}
		while(p.firstChild !== en) {
			p.firstChild.remove();
		}
	});
	repeat('h2,h3,h4,h5,h6', (e) => {
		const text = e.title;
		if(text){
			e.textContent = `${e.textContent.match(/[ABC\d\.]+/) || ''} ${text}`;
		}
	});
	Util.DEFERRED.push(() => {
		repeat('details', (e) => {
			e.open = true;
		});
	});
};



Util.getState = (key, default_val, type) => {
	if(! (key in Util.page_state) ) return default_val;
	const val = Util.page_state[key];
	return (type && (typeof(val) !== type))? default_val : val;
};

Util.setState = (key, val) => {
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


/* 初期処理： console */ {
	if(!window.console){
		window.console = { log: EMPTY_FUNC };
	}

/*
	try {
		const opts = Object.defineProperty({}, 'passive', {
			get: () => { Util.supportsListenerOptions = true;}
		});
		window.addEventListener("test", null, opts);
	} catch (e) {}
*/
}

/* 初期処理： <meta viewport> <link rel=icon> */
{
	// meta with viewport for mbile (ideally, should be set by CSS, not meta tag)
	const head = document.head || document.getElementsByTagName('head')[0];
	if(head){
		let meta = C('meta');
		meta.name = 'viewport';
		meta.content = 'width=device-width, initial-scale=1, minimum-scale=1';
		head.appendChild(meta);

		meta = C('meta');
		meta.name = 'color-scheme';
		meta.content = 'light dark';
		head.appendChild(meta);

		const link = C('link');
		link.rel = 'icon';
		link.href = 'common/3underscore.png';
		head.appendChild(link);
	}
}

/* 初期処理 */ {

	const init = () => {
		document.removeEventListener('DOMContentLoaded', init, false);

		const elem = E('_source_data');
		if(elem){
			Object.assign(PAGE_DATA, Util.parseBlocks(elem.textContent));
			elem.remove();
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
			repeat('._hide_if_expanded', (e) => {
//				e.remove();
				e.style.display = 'none';
			});
		} else {
			Util.fillHeader()
			Util.ready(PAGE_DATA);
			classList.add('_expanded');
		}
		Util.initAdditional();
	}

	Util._COMP_ = new Promise((resolve) => {
		document.addEventListener('DOMContentLoaded', () => {
			init();
			resolve();
		}, false);
	});

	// 表示状態を sessionStorage から読み込む
	const get_state = () => {
		let page_state = null;
		let storage_key = null;

		storage_key = PAGE_DATA.options.page_state_key || window.location.pathname;
		try {
// sessionStorage property へのアクセスのみでも security error になることがある
			page_state = sessionStorage.getItem(storage_key);
			Util.saveStorage = (data) => {
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

section の入れ子階層を反映する，入れ子 ol による目次を生成する
各 section タグの先頭の子要素（見出し）の内容が目次の各項目の内容に複製される

	引数 root : section を子に持つ要素

備考
・ section の入れ子は直な親子関係のみ
・ 子要素を持たない section は無視される
・ 自身またはその見出しに id があてがわれていない section も無視される
・ 見出しの内容に id を持つ要素があると生成項目と id が重複する（不正）
・ 見出しの内容が巨大になる可能性がある
・ すべての Node を走査することになるが、実行速度は getElementsByTagName('section') による反復と変わらないか高速

*/


Util.rebuildToc = (main_id, list_id) => {
	list_id = list_id || '_toc_list';
	const toc_list = E(list_id), main = E(main_id);
	if(toc_list && main) {
		const new_list = Util.buildTocList(main);
		new_list.id = list_id;
		toc_list.replaceWith(new_list);
	}
	return toc_list;
}

Util.buildTocList = (root) => {

	const buildToc = (root) => {
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

	const range = document.createRange();
	const toc = buildToc(root);
	if(toc) { // a 要素の入れ子を除去
		repeat('a a', (e) => {
			range.selectNodeContents(e);
			e.replaceWith(range.extractContents());
		}, toc);
		repeat('[id]', (e) => { // 重複 id を除去
			e.removeAttribute('id');
		}, toc);
	}
	return toc;
}


Util.fillHeader = () => {
	const options = PAGE_DATA.options;
	const url = options.original_url || '';
//	if(!url) return;

	const header = document.body.querySelector('header');
	if(!header) return;
	const hgroup = header.querySelector('hgroup');

	if( url.slice(0,39) === 'https://html.spec.whatwg.org/multipage/' ){
		options.copyright = ',whatwg';
	}

	// タイトル横のロゴ画像リンク
	fillLogo: {
		let html;
		const domain = url.match( /^https?:\/\/([\w\.\-]+)\// );
		if(!domain) break fillLogo;
		switch(domain[1]){
		case 'www.w3.org':
		case 'w3c.github.io':
		case 'w3ctag.github.io':
		case 'drafts.csswg.org':
			html = '<a href="https://www.w3.org/" id="_W3C">W3C</a>';
			break;
		case 'html.spec.whatwg.org':
			html = '<a href="https://whatwg.org/" id="_WHATWG">WHATWG</a>';
			break;
		default:
			break fillLogo;
		}
		header.insertAdjacentHTML('afterbegin', html);
	}

	// 副題＋日付
	fillDate: {
		let date = options.spec_date;
		if(!date) break fillDate;
		if(!hgroup) break fillDate;

		const m = date.match(/^(\d+)-0*(\d+)-0*(\d+)$/);
		if(m){
			date = 
`<time datetime="${date}">${m[1]}年 ${m[2]}月 ${m[3]}日</time>`;
		}
		let header_text ='';
		const status = options.spec_status;
		if(status){
			header_text = {
ED: '<a href="w3c-standards-types-ja.html#ED">編集者草案</a>',
WD: '<a href="w3c-standards-types-ja.html#WD">作業草案</a>',
FPWD: '<a href="w3c-standards-types-ja.html#FPWD">最初の公な作業草案</a>',
PR: '<a href="w3c-standards-types-ja.html#PR">勧告案</a>',
CRD: '<a href="w3c-standards-types-ja.html#CRD">勧告候補草案</a>',
CR: '<a href="w3c-standards-types-ja.html#CR">勧告候補スナップショット</a>',
REC: '<a href="w3c-standards-types-ja.html#REC">勧告</a>',
DRY: '<a href="w3c-standards-types-ja.html#DRY">草案レジストリ</a>',
NOTE: '<a href="w3c-standards-types-ja.html#NOTE">W3C グループノート</a>',
DNOTE: '<a href="w3c-standards-types-ja.html#DNOTE">W3C グループ草案ノート</a>',
EDCG: '<a href="w3c-standards-types-ja.html#reports">Draft Community Group Report</a>', // #CG-DRAFT
LS: 'Living Standard',
LD: 'Living Document',
//IETFPR: 'IETF PROPOSED STANDARD',
IETFSTD: 'Internet Standard',
IETFBCP: 'Best Current Practice',
IETFID: 'Internet Draft',
			}[status] || status;
		}
		const html = `<p>${header_text} — ${date}</p>`;
		hgroup.insertAdjacentHTML('beforeend', html);
	}

	// metadata 置き場
	placeMetadata: {
		let html = 
'<details id="_trans_metadata"><summary><strong>この日本語訳は非公式な文書です…</strong></summary></details>';
		if(PAGE_DATA.spec_metadata){
			html += 
'<details id="_spec_metadata"><summary>この文書についての詳細</summary></details>';
		}
		if(PAGE_DATA.copyright || options.copyright){
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


/** 語彙切替／ HTML 生成 
source_data メンバ：
.main_id: 生成した HTML コードはこの id の要素の innerHTML になる（省略時は 'MAIN' ）
.html: 単語置換前の HTML 生コード
.generate(): ページが定義する .html 生成関数
.populate(): DOM 構築後に呼ばれる
.persisted_parts: HTML 再生成（用語切り替え）時にも DOM に保たれる部品
.collectParts(): JS による persisted_parts 生成用
.switchWords: HTML 生成処理の本体
.en_text_list: 原文データ／静的置換データ
.level: 用語切り替えレベル
.levels: 最大 level 数
.class_map: 指示子 → class 名
.tag_map: 指示子 → tag 名
.link_map: keyword → リンク先
.word_map: 後から変更可能な単語置換マップ
*/

Util.switchWordsInit = (source_data) => {
	source_data = source_data || {};
	if(!source_data.persisted_parts){
		source_data.persisted_parts = Object.create(null);
	}
	const main_id =
	PAGE_DATA.options.main_id =
	source_data.main_id = source_data.main_id || 'MAIN';
	const abbr_url = (PAGE_DATA.options.abbr_url || '' );

/** ページ内のデータ, html 内容を前処理して source_data を拡充する */

	{
		source_data.class_map = Util.get_mapping(
			COMMON_DATA.class_map + (PAGE_DATA.class_map || '')
		);
		source_data.tag_map = Util.get_mapping(
			COMMON_DATA.tag_map + (PAGE_DATA.tag_map || '')
		);
		delete PAGE_DATA.class_map;
		delete PAGE_DATA.tag_map;
		delete COMMON_DATA.class_map;
		delete COMMON_DATA.tag_map;

		let link_map = COMMON_DATA.link_map + (PAGE_DATA.link_map || '');
		if( /^[\w\-]+$/.test( abbr_url ) ){
			link_map = link_map.replace(
				new RegExp( `:~${abbr_url}(#|\n)`, 'g'), ':$1'
			);
		}
		source_data.link_map = Util.get_mapping(link_map);
		delete PAGE_DATA.link_map;
		delete COMMON_DATA.link_map;

		// html 内容の前処理：英文を抽出して placeholder に置換など
		const en_list = source_data.en_text_list = [
'</span>', // \uE000
'<span lang="en" class="_en">', // \uE001
'<span class="trans-note">', // \uE002
'：<span class="block">', // \uE003
'：<span class="block preline">', // \uE004
	// see PREMAP
'<td>', // \uE005
'<td class="prod">', // \uE006
'<tr><th>', // \uE007
'<tbody><tr><th>', // \uE008
'</tbody></table>', // \uE009
'<table class="def-table propdef">', // \uE00A
'<table class="def-table descdef">', // \uE00B
'<table class="def-table eventdef">' // \uE00C
		];
		let nesting = '';
		let nesting1;
		let result;
		const premap = Util.get_mapping(COMMON_DATA.PREMAP);

		source_data.html = E(main_id).innerHTML.replace(
		/◎([\u0080-\uFFFF]\S*|[^<◎]+)|【.*?】|⇒＃?\s*|<\/(?:li|p|dd|div|th|td)\b/g,
		// 一-鿆ア-ン
		// ⇒|⇒＃を中で利用するタグはこれらのみ（ ... figcaption|blockquote|pre ）
		// U+E000.., 私用領域（ likely never be used in the specs.
		// up to 24bit 4096 items

		(match, cap1) => {
			switch(match[0]){
			case '◎':
				nesting1 = nesting;
				nesting = ''; // ⇒ を終端させる
				if(match.charCodeAt(1) < 0x80){
					// english text
					en_list.push( cap1.trim() );
					return (
`${nesting1}\uE001${String.fromCharCode( 0xE000 + en_list.length - 1 )}\uE000`
					);
				} else {
					// PREMAP
//					console.assert(cap1 in premap, 'Undefined PREMAP symbol: ' + match);
					return nesting1 + ( premap[cap1] || '＊' );
				}
			case '【':
				return (match[1] === '！' ) ?
					'' // 編集用コメント
					: `\uE002${match}\uE000`;
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

/** 語彙レベルを切り替える回ごとに遂行する処理 */

	// 内容出力
	const generateHTML = (words_mapping) => {
		const en_list = source_data.en_text_list;

		E(main_id).innerHTML = 
		Util.replaceWords1(source_data.generate(), words_mapping)
		.replace(/[\uE000-\uEFFF]/g, (match) => {
			return en_list[match.charCodeAt(0) - 0xE000];
		});
	}

	// 目次生成
	const createToc = (id) => {
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
			parent.before(nav);
		} else {
			root.before(nav);
		}
	}

	source_data.switchWords = function(level){
		level = Math.min(level & 0xF, this.levels.length - 1 );

		const mapping = Util.get_mapping(
			Util.getDataByLevel( COMMON_DATA.words_table + PAGE_DATA.words_table, level)
			// 値の最後が英数＋0個以上のかなで終わる所は英数の末尾にスペースを補填
			.replace(/(\w)([あ-ん]*)(?=\n)/g, '$1 $2')
			+ COMMON_DATA.words_table1
			+ ( abbr_url? `\n${abbr_url}:\n` : '' )
			+ ( PAGE_DATA.words_table1 || '')
		);

		if(this.word_map){
			Object.assign(mapping, this.word_map);
		}

		let parts = this.persisted_parts;
		for( const id of Object.keys(parts) ){
			parts[id].remove();
		};

		generateHTML(mapping);
		if( source_data.populate ){
			source_data.populate();
		}

		parts = this.persisted_parts;/// 
		for( const id of Object.keys(parts) ){
			const part = parts[id];
			const e = E(id);
			if(e) {
				if(part.hasAttribute('aria-describedby')){
					e.before(part); // e の内容は代替テキスト
				} else {
					e.replaceWith(part); // e は placeholder
				}
			} else {
				console.log( `replaceParts: placeholder not found for id=${id}` );
			}
		}
		createToc(this.toc_main);
		this.level = level;
	}

	Util.collectDeclaredParts(source_data.persisted_parts);
	if(source_data.collectParts){
		source_data.collectParts(source_data.persisted_parts);
	}

	// 語彙レベルを初期化
	{
		let levels = source_data.levels;
		if(!levels){
			levels = 'ほぼ英語:英語主体:漢字+英語:漢字主体:カナ主体';
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

	source_data.switchWords(source_data.level);
	E(main_id).hidden = false; // 内容生成完了

/** 語彙切替（＋内容生成）用 UI */
	const create_word_switch = () => {
		const w_switch = C('span');
		{
			w_switch.className = '_hide_if_expanded';
			let html = 
'<input type="button" id="_words_levelX" tabindex="1" accesskey="X" value="用語" title="アクセスキー： X" >';

			source_data.levels.forEach(function(label, index){
				html += 
`<label><input type="radio" id="_words_level${index}" name="_words" />${label}</label>`
				;
			});
			w_switch.innerHTML = html;
		}

		const checkLevel = () => {
			w_switch.children[source_data.level + 1].firstChild.checked = true;
		}
		checkLevel();

		E('_view_control').appendChild(w_switch);

		w_switch.onclick = (event) => {
			let level = (event.target.id || '').match(/^_words_level(\w)$/);
			if(!level) return;
			level = parseInt(level[1]);
			const auto = isNaN(level); // _words_levelX

			if(auto){
				level = (source_data.level + 1 ) % source_data.levels.length;
			}
			if(level === source_data.level) return;
			Util.switchView(() => {
				source_data.switchWords(level);
			}, true);
			Util.setState('words', source_data.level);

			if(auto){
				checkLevel();
			}
		}
	}

	Util.DEFERRED.push(create_word_switch);
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
語？＊	mapping[語 ？]２	定義な + ＊	→definedな|定義な + ＊
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
	/(?:~([\w\-]+|[あ-ん])|~*([\u4E00-\u9FFF]+\w*|[\u30A1-\u30F4ー]+\w*))(-|[あ-ん々]{0,2})/g;
Util.replaceWords1 = (data, mapping) => {

	return data.replace( Util.rxp_words1, (t, en, word, hira) => {
//		hira = hira || '';
		if(en){
			if(en[0] > '~') return en + hira;
			word = en;
		}
		if(t[1] === '~'){
			return word + hira;
		}

		let r = mapping[word + hira];
		if(r) return r;
		if(hira){
			r = mapping[word + hira[0]];
			if(r){
				return r + hira.slice(1);
			}
			if( (hira === 'でき' ) || ('さしすせ'.indexOf(hira[0]) >= 0) ) {
				r = mapping[word + '-'];
				if(r) return r + hira;
			}
		}
		r = mapping[word];
		if(!r && en) return t;
		return ( r || word ) + ( ( hira === '-' ) ? '' : hira );
	})
	.replace(Util.rxp_wordsX, '$1$2 ');
};


COMMON_DATA.PREMAP = `
終: 
名:\uE00A\uE008名前\uE005
述:\uE00B\uE008名前\uE005
用:\uE007~For\uE005
値:\uE007<a href="~CSSVAL#value-defs">値</a>\uE006
新値:\uE007新たに定義される<a href="~CSSVAL#value-defs">値</a>\uE006
新初:\uE007新たに定義される<a href="~CASCADE#initial-values">初期~値</a>\uE005
新算:\uE007新たに定義される<a href="~CASCADE#computed">算出d値</a>\uE005
初:\uE007<a href="~CASCADE#initial-values">初期~値</a>\uE005
適:\uE007<a href="~CASCADE#applies-to">適用対象</a>\uE005
継:\uE007<a href="~CASCADE#inherited-property">継承-</a>\uE005
百:\uE007<a href="~CSSVAL#percentages">百分率</a>\uE005
算:\uE007<a href="~CASCADE#computed">算出d値</a>\uE005
使:\uE007<a href="~CASCADE#used">使用~値</a>\uE005
順:\uE007<a href="~CSSOM1#serializing-css-values">正準的~順序</a>\uE005
ア:\uE007<a href="~WANIM#animation-type">~animation型</a>\uE005
論:\uE007<a href="~CSSLOGICAL#logical-property-group">論理-~prop~group</a>\uE005
型:\uE007型\uE005
表終:\uE009
イ型:\uE00C\uE008型\uE005
界面:\uE007~interface\uE005
同期:\uE007同期c？\uE005
浮上:\uE007浮上-？\uE005
標的:\uE007~target\uE005
取消:\uE007取消~可？\uE005
構:\uE007Composed？\uE005
既定動作:\uE007既定~動作\uE005
文脈:\uE007文脈~情報\uE005
表記記号:<p>この訳において（主に~algo内で）利用される各種記号（ ε, ~SET, ~IF, ~THROW, 等々）の意味や定義の詳細は、<a href="index.html#common-wording">共通な慣用表現</a>, <a href="index.html#common-algo-symbols">~algoに共通して利用される表記</a>を参照されたし。</p>
追跡路:<a class="fingerprinting" href="infra-ja.html#tracking-vector" title="（ここには、利用者の追跡に利用され得るものがある。／There is a tracking vector here.）"></a>
非規範的:<p><em>この節は規範的ではない。</em><span lang="en" class="_en">This section is non-normative.</span></p>
要約:<h2 title="Abstract">要約a</h2>
位置付け:<h2 title="Status of this Document">この文書の位置付け</h2>
`;

/*
"終" は "⇒" の終端用

	CSS propdef
名:<table class="propdef"><tbody><tr><th>名前<td>
述:<table class="descdef"><tbody><tr><th>名前<td>
対:<tr><th>~For<td>
値:<tr><th><a href="css-values-ja.html#value-defs">値</a><td class="prod">
新値:<tr><th>新たに定義される値<td class="prod">
新初:<tr><th>新たに定義される初期~値<td>
新算:<tr><th>新たに定義される算出d値<td>
初:<tr><th>初期~値<td>
適:<tr><th>適用対象<td>
継:<tr><th>継承-<td>
百:<tr><th>百分率<td>
算:<tr><th>算出d値<td>
順:<tr><th>正準的~順序<td>
ア:<tr><th>~animation<td>
型:<tr><th>型<td>
表終:</tbody></table>

	UIEVENTS CSS eventdef
イ型:<table class="eventdef"><tbody><tr><th>型<td>
界面:<tr><th>~interface<td>
同期:<tr><th>同期？<td>
浮上:<tr><th>浮上-？<td>
標的:<tr><th>~target<td>
取消:<tr><th>取消可？<td>
構:<tr><th>Composed？<td>
既定動作:<tr><th>既定~動作<td>
文脈:<tr><th>文脈~情報<td>

*/

COMMON_DATA.class_map = '';
COMMON_DATA.tag_map = '';
COMMON_DATA.link_map = '';

/** 共通な置換語
	キーワード／略称 URL など
*/
COMMON_DATA.words_table1 = `
THROW:<b>THROW</b>
WHILE:<b>WHILE</b>
RET:<b>RETURN</b>
IF:<b>IF</b>
IS:<b>IS</b>
ELSE:<b>ELSE</b>
ELIF:<b>ELSE IF</b>
ELSE_:他の場合は
EACH:<b>各</b>
GOTO:<b>GOTO</b>
BREAK:<b>BREAK</b>
CONTINUE:<b>CONTINUE</b>
コレ:<b>これ°</b>
DF:<b>?=</b>
Assert:<b>Assert</b>
ABRUPT:<b>?</b>
NOABRUPT:<b>!</b>
ナラナイ:ならない
モノトスル:ものとする
ベキ:べき
ヨイ:よい
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
SOTD-CSS:<a href="css-common-ja.html#sotd">CSS 日本語訳 共通ページ</a>／<a href="#_spec_metadata">この文書についての詳細</a>
SOTD-W3C:<a href="w3c-common-ja.html#sotd">W3C 日本語訳 共通ページ</a>／<a href="#_spec_metadata">この文書についての詳細</a>
CSSisaLANG:<p><a href="css-snapshot-ja.html#css-is-a-lang">CSS とは…</a></p>
TR:https://www.w3.org/TR
RFCx:https://www.rfc-editor.org/rfc
	RFCx:https://datatracker.ietf.org/doc/html
CSSWG:https://drafts.csswg.org
CSSissue:https://github.com/w3c/csswg-drafts/issues
HTMLLS:https://html.spec.whatwg.org/multipage
HTMLissue:https://github.com/whatwg/html/issues
IANA-a:https://www.iana.org/assignments

APPMANIFEST:appmanifest-ja.html
ARIA1:https://w3c.github.io/aria/
BROWSERS:HTML-document-sequences-ja.html
CASCADE:css-cascade-ja.html
COMPAT:compat-ja.html
COMPOSITING:compositing-ja.html
CSP3:CSP3-ja.html
CSS22:https://www.w3.org/TR/CSS22
	CSS22:https://drafts.csswg.org/css2 → single page
CSS2J:css2-ja.html
CSS2TABLE:https://drafts.csswg.org/css2/tables.html/../
CSSALIGN:css-align-ja.html
CSSANCHOR:css-anchor-position-ja.html
CSSANIM2:css-animations2-ja.html
CSSANIM:css-animations-ja.html
CSSBG:css-backgrounds-ja.html
CSSBOX:css-box-ja.html
CSSBORDER:css-borders-ja.html
CSSBREAK:css-break-ja.html
CSSCOLOR5:css-color5-ja.html
CSSCOLOR:css-color-ja.html
CSSCOLORADJUST:css-color-adjust-ja.html
CSSCOND:css-conditional-ja.html
CSSCOND4:css-conditional4-ja.html
CSSCOND5:css-conditional5-ja.html
CSSCONTAIN:css-contain-ja.html
CSSCONTENT:css-content-ja.html
CSSCOUNTER:css-counter-styles-ja.html
CSSDISP:css-display-ja.html
CSSEASING:css-easing-ja.html
CSSENV:css-env-ja.html
CSSEXCLUSION:css-exclusions-ja.html
CSSFLEX:css-flexbox-ja.html
CSSFONT:css-fonts4-ja.html
CSSFONTLOADING:css-font-loading-ja.html
CSSFORMS:css-forms-ja.html
CSSGRID:css-grid-ja.html
CSSIMAGE4:css-images4-ja.html
CSSIMAGE:css-images-ja.html
CSSINLINE:css-inline-ja.html
CSSLIST:css-lists-ja.html
CSSLOGICAL:css-logical-ja.html
CSSMCOL:css-multicol-ja.html
CSSNESTING:css-nesting-ja.html
CSSNS:css-namespaces-ja.html
CSSOM1:cssom-ja.html
CSSOMVIEW:cssom-view-ja.html
CSSOVERFLOW3:css-overflow-ja.html
CSSOVERFLOW4:css-overflow4-ja.html
CSSPAGE:css-page-ja.html
CSSPOS4:css-position4-ja.html
CSSPOS:css-position-ja.html
CSSPSEUDO:css-pseudo-ja.html
CSSPV1:css-properties-values-api-ja.html
CSSREGION:https://drafts.csswg.org/css-regions-1/
CSSRUBY:css-ruby-ja.html
CSSSCOPING:css-scoping-ja.html
CSSSCROLLSNAP:css-scroll-snap-ja.html
CSSSHADOWPARTS:css-shadow-parts-ja.html
CSSSHAPES:css-shapes-ja.html
CSSSIZEADJUST:css-size-adjust-ja.html
CSSSNAPSHOT:css-snapshot-ja.html
CSSSPEECH:css-speech-ja.html
CSSSTYLEATTR:css-style-attr-ja.html
CSSSYN:css-syntax-ja.html
CSSTABLE:https://drafts.csswg.org/css-tables-3/
CSSTEXT:css-text-ja.html
CSSTEXTDECOR:css-text-decor-ja.html
CSSTOM1:css-typed-om-ja.html
CSSUI:css-ui-ja.html
CSSVAL5:css-values5-ja.html
CSSVAL:css-values-ja.html
CSSVAR:css-variables-ja.html
CSSVT:css-view-transitions-ja.html
CSSWILLCHANGE:css-will-change-ja.html
CSSWM:css-writing-modes-ja.html
CSScommon:css-common-ja.html
DESIGN-PRINCIPLES:design-principles-ja.html
DEVICEORIENTATION:deviceorientation-ja.html
DOM-Parsing:DOM-Parsing-ja.html
DOM4:DOM4-ja.html
ENCODING:Encoding-ja.html
EXEC-COMMAND:https://w3c.github.io/editing/docs/execCommand/
FETCH:Fetch-ja.html
FILEAPI:File_API-ja.html
FILTERS:filter-effects-ja.html
FULLSCREEN:fullscreen-ja.html
GEOLOCATION:geolocation-api-ja.html
GEOMETRY:geometry-ja.html
HEcanvas:HTML-canvas-ja.html
HEcustom:HTML-custom-ja.html
HEedits:HTML-edits-ja.html
HEembed:HTML-embed-ja.html
HEforms:HTML-form-elements-ja.html
HEgrouping:HTML-grouping-ja.html
HEimageAlt:HTML-image-alt-ja.html
HEimages:HTML-images-ja.html
HEinput:HTML-input-ja.html
HEinteractive:HTML-interactive-elements-ja.html
HEmedia:HTML-media-ja.html
HEmetadata:HTML-metadata-ja.html
HEscripting:HTML-scripting-ja.html
HEsections:HTML-sections-ja.html
HEtables:HTML-tables-ja.html
HEtextlevel:HTML-text-level-ja.html
HEtrack:HTML-track-ja.html
HRTIME:hr-time-ja.html
HTMLAAM:https://w3c.github.io/html-aam/
HTMLARIA:https://w3c.github.io/html-aria/
HTMLGAPI:HTML-global-api-ja.html
HTMLINFRA:HTML-infrastructure-ja.html
HTMLWPROXY:HTML-windowproxy-ja.html
HTMLautofill:HTML-autofill-ja.html
HTMLcdom:HTML-common-dom-interfaces-ja.html
HTMLcloning:HTML-structured-data-ja.html
HTMLcms:HTML-common-microsyntaxes-ja.html
HTMLcomms:HTML-comms-ja.html
HTMLdep:HTML-dependencies-ja.html
HTMLdnd:HTML-dnd-ja.html
HTMLdom:HTML-dom-ja.html
HTMLds:HTML-document-sequences-ja.html
HTMLdynamic:HTML-dynamic-markup-insertion-ja.html
HTMLforms:HTML-forms-ja.html
HTMLiana:HTML-iana-ja.html
HTMLindex:HTML-index-ja.html
HTMLinteraction:HTML-interaction-ja.html
HTMLlifecycle:HTML-document-lifecycle-ja.html
HTMLlinks:HTML-links-ja.html
HTMLnav:HTML-navigation-ja.html
HTMLnavAPI:HTML-navigation-apis-ja.html
HTMLnavigator:HTML-navigator-ja.html
HTMLobs:HTML-obsolete-ja.html
HTMLparsing:HTML-parsing-ja.html
HTMLpopover:HTML-popover-ja.html
HTMLrendering:HTML-rendering-ja.html
HTMLselectors:selectors-html-ja.html
HTMLsl:HTML-speculative-loading-ja.html
HTMLsse:HTML-server-sent-events-ja.html
HTMLurl:HTML-urls-and-fetching-ja.html
HTMLwriting:HTML-writing-ja.html
HTMLxml:HTML-xhtml-ja.html
HTTPcache:http-cache-ja.html
HTTPcommon:http-common-ja.html
HTTPcookie:http-cookie-ja.html
HTTPinfra:http-semantics-ja.html
HTTPpriority:http-priority-ja.html
HTTPsem:http-semantics2-ja.html
HTTPv1:http1-ja.html
HTTPv3:http3-ja.html
HTTPweblink:http-web-linking-ja.html
IETFcommon:ietf-common-ja.html
INDEXEDDB:IndexedDB-ja.html
INFRA:infra-ja.html
INTERSECTIONOBSERVER:IntersectionObserver-ja.html
LONGAF:long-animation-frames-ja.html
LONGTASKS:longtasks-ja.html
MASKING1:css-masking-ja.html
MATHMLcore:https://w3c.github.io/mathml-core/
MIMESNIFF:mimesniff-ja.html
MIXED-CONTENT:webappsec-mixed-content-ja.html
MQ5:mediaqueries-ja.html
NAV-TIMING:navigation-timing-ja.html
NOTIFICATIONS:notifications-ja.html
ORIGIN:HTML-origin-ja.html
PERMISSIONS-POLICY:webappsec-permissions-policy-ja.html
PERMISSIONS:webappsec-permissions-ja.html
POINTEREVENTS:pointerevents-ja.html
REFERRER-POLICY:webappsec-referrer-policy-ja.html
REPORTING:reporting1-ja.html
REQUESTIDLECALLBACK:requestidlecallback-ja.html
RESOURCE-TIMING:resource-timing-ja.html
SCREEN-ORIENTATION:screen-orientation-ja.html
SECQ:security-questionnaire-ja.html
SECURE-CONTEXT:webappsec-secure-contexts-ja.html
SELECTIONAPI:selection-api-ja.html
SELECTORS4:selectors4-ja.html
SENSORS:sensors-ja.html
SIZING:css-sizing-ja.html
SRI:webappsec-subresource-integrity-ja.html
STORAGE:storage-ja.html
STREAMS:Streams-ja.html
STRUCTURED-FIELDS:http-structured-fields-ja.html
SVG11:SVG11
SVG2:https://svgwg.org/svg2-draft
SVGcoords:svg-coords-ja.html
SVGembedded:svg-embedded-ja.html
SVGgeometry:svg-geometry-ja.html
SVGinteract:svg-interact-ja.html
SVGlinking:svg-linking-ja.html
SVGpainting:svg-painting-ja.html
SVGpaths:svg-paths-ja.html
SVGpservers:svg-pservers-ja.html
SVGrender:svg-render-ja.html
SVGshapes:svg-shapes-ja.html
SVGstruct:svg-struct-ja.html
SVGstyling:svg-styling-ja.html
SVGtext:svg-text-ja.html
SVGtypes:svg-types-ja.html
SW1:service-workers-ja.html
TC39:https://tc39.es/ecma262/multipage/
TIMELINE:performance-timeline-ja.html
TRANSFORM2:css-transforms2-ja.html
TRANSFORM:css-transforms-ja.html
TRANSITION2:css-transitions2-ja.html
TRANSITION:css-transitions-ja.html
TRUSTED-TYPES:https://w3c.github.io/trusted-types/dist/spec/
UIEVENTS:uievents-ja.html
URL1:URL-ja.html
W3Ccommon:w3c-common-ja.html
WANIM:web-animations-ja.html
WANIMapi:web-animations-api-ja.html
WAPI:webappapis-ja.html
WEBIDL:WebIDL-ja.html
WEBIDLjs:WebIDL-JS-ja.html
WEBSOCKET:WebSocket-ja.html
WEBSTORAGE:WebStorage-ja.html
WINDOW:HTML-window-ja.html
WORKERS:Workers-ja.html
WORKLETS:worklets-ja.html
XHR:XHR-ja.html
`;

/** 対訳データ
	どの仕様にも高確率／高頻度に現れる語彙
*/

COMMON_DATA.words_table = `

●略語
UA:user agent:UA
Web:
web:
JS:JavaScript
ASCII:
DOM:
HTML:
CSS:
API:
XML:
SVG:
ID:
	~ID:id
UTF-8:
JSON:
ABNF:
IDL:
HTTP:
HTTPS:
MIME:
Unicode:
OS:operating system:OS
W3C:
IETF:
IANA:
RFC:
WG:
	WG:Working Group／:the working group／:working group
	~CSS~WG:CSSWG

●指示語
特定0の:particular:ある特定の
個々の:individual:~
個別に:individualに:~
自前の:own:~
複-:multi-:~
単-:single-:~
単独の:single:~
現在の:current:~
後続な:subsequent:後続の
元の:original:~
	ナシ:none:なし
subject::対象
別個:distinct:~
	別物:distinct:~
直に:directに:~
直な:directな:~
首な:primaryな:主たる
首に:primaryに:主として
	首に:primarily

●未分類
block::::ブロック
window:
worker:
sw:service worker
Realm:
realm:
title::::タイトル
page::::ページ
paged::::ページ化
	~page割り:paginate
	~page割り:pagination
hint::::ヒント
channel::::チャネル
匿名:anonymous::~
行先:destination::~
関数:function::~
関数-:functional::~
inline::::インライン
機器:device:~
装置:device:~
	デバイス
pattern::::パタン
metadata::::メタデータ
段落:paragraph:~
長さ:length:~
size::::サイズ
sizing::::サイズ法
resize::::リサイズ
絶対:absolute::~
絶対的:absolute::~
相対:relative::~
相対的:relative::~
物理-:physical::~
物理的:physical::~
論理-:logical::~
論理的:logical::~
移動-:move:~
開始:start:~
開始-:start:~
終了:end:~
	終了-:terminate
整数:integer:~
正な:positiveな:~
正で:positiveで:~
正に:positiveに:~
負な:negativeな:~
負で:negativeで:~
負に:negativeに:~
最小:minimum:~
最大:maximum:~
	最小~化:minimize／-tion／ing
	最大~化:maximize／-tion／ing
最小限に:minimize:~
無限:infinite:~
有限:finite:~
無限大:infinity:~
別名:alias::~
確立-:establish:~
省略-:omit:~
保持-:hold:~
形成-:form:~
不透明:opaque::~
透明:transparent::~
text::::テキスト
textな:textual::textな:テキストな
scalar::::スカラー
vector::::ベクター
素な:plainな::~
	素な~text:plaintext
単語:word:~
profile::::プロファイル
random::::ランダム
	~random化:randomization／randomize
command::::コマンド
機会:opportunity:~
機会c:chance:機会
snapshot::::スナップショット
mark::::マーク
marker::::マーカ
anchor::::アンカー
frame::::フレーム
閲覧-:browse::~
閲覧:browsing::~
navi:navigation:::ナビ
navigate::::ナビゲート
navigable::::ナビ可能
辿り:traversal::~
辿可能:traversable::辿り可能
辿-:traverse::辿り
	辿-法:traversing
辿る:traverseする::~
辿られ:traverseされ::~
辿らな:traverseしな::~
辿らせ:traverseさせ::~
辿っ:traverseし::~
辿れ:traverseでき::~

●幾何
空間:space:~
次元:dimension:~
寸法:dimension:~
方向:direction::~
方向性:directionality::~
右端:right::~
左端:left::~
上端:top::~
下端:bottom::~
始端:start::~
終端:end::~
軸:axis::~
	軸:axes
辺:edge::~
境界:boundary:~
横幅:width::~
縦幅:height::~
位置-:position::~
位置:position::~
位置決め:positioning::~
有位置:positioned::~
	位置し直す:reposition
座標:coordinate::~
座標系:coordinate system::~
原点:origin::~
距離:distance::~
角度:angle::~
方位:orientation::~
方位-:orient::~
交差-:intersect::~
交差:intersection::~
交差域:intersection::~

●仕様レベル

作者:author:~
著作者:author:~
利用-:use:~
利用:use:~
再利用-:reuse:~
	再利用:re-use
再利用:reuse:~
利用者:user:~:::ユーザ
利用者-:user:利用者による:::ユーザによる
利用元:user:~
有用:useful:~
用法:usage:~
開発者:developer:~
実装:implementation:~
実装定義:implementation-defined:~
実装-:implement:~
実装者:implementer:~
制御者:controller:~
読者:reader:~
ヒト:human:人

通常:normal:~
通常の:normalな:~
通常は:normalには:~
通常に:normalに:通常どおり
通常通り:as normalに:通常どおり
共通:common:~
共通して:commonに:共通して
共通する:commonになる:共通する
共通的な:commonな:よくある
共通的に:commonに:よく
通例的:usual:~
通例の:usualな:~
通例通り:as usualに:通例どおり
概して:typicalに:~
代表的:typical:~
典型的:typical:~
定例の:regularな:~

	●規約／表記
編集者:editor:~
編集上の:editorialな:~
導入-:introduce:~
序論:introduction:~
概観:overview:~
用語:term:~
各種用語:terminology:~
語彙:vocabulary:~
述べな:describeしな:~
述べれ:describeでき:~
述べて:describeして:~
述べた:describeした:~
述べら:describeさ:~
述べる:describeする:~
記述-:describe:~
記述:description:~
記述的:descriptive:~
解釈-:interpret:~
解釈:interpretation:~
明確化-:clarify:~
明確化:clarification:~
表出-:express:~
言明-:state:~
言明:statement:~
説明-:explain:~
説明:explanation:~
要約a:abstract:要約
要約:summary:~
要約-:summarize:~
表明-:assert:~
表明:assertion:~
規約:convention:~
表記規約:convensions:~
記法:notation:~
注釈-:annotate:~
注釈:annotation:~
注釈文:prose:~
混同-:confuse:~
混同:confusion:~
解-:understand:~
解せ:understandでき:~
解され:understandされ:~
解さな:understandしな:~
理解-:understand:~
多義的:ambiguous:~
一義的:unambiguous:~
一義化-:disambiguate:~
一義化:disambiguation:~
多義性:ambiguity:~
言及-:mention:~
言及:mention:~
詳細:details:~
詳細な:detailed:~
詳細に:in detailに:~
付録:Appendix:~
	付録:appendix
図式:diagram:~
見本:sample:~
明瞭:clear:~
不明瞭:unclear:~
可読性:readability:~
要旨-:outline:~

表現-:represent:~
表現:representation:~

見なさ:considerさ:~
見なす:considerする:~
見なし:considerし:~
見なせ:considerでき:~
考慮:consideration:~
考慮点:considerations:~
考慮-:consider:~
考える:considerする:~
考えた:considerした:~

見做す:assumeする:~
見做され:assumeされ:~
見做さな:assumeしな:~
見做せ:assumeでき:~
見做した:assumeした:~
見做して:assumeして:~
前提:assumption:~
表t:table:表:::テーブル

	●設計
architecture::::アーキテクチャ
approach::::アプローチ
community::::コミュニティ
cost::::コスト
feedback::::フィードバック
module::::モジュール
model::::モデル
risk::::リスク
framework::::フレームワーク
論じる:discussする:~
論じら:discussさ:~
論じて:discussして:~
論じた:discussした:~
論点:discussion:~
論:discussion:~
問題:problem:~
	問題になり得る:problematic
課題:issue:~
処置集:disposition:~
	各~commentに対する処置集:Disposition of Comments
一般:general:~
一般の:generalな:~
一般的:general:~
汎用:generic:~
策定者:author:~
著作-:author:~
著作:authoring:~
仕様:spec:~
指定-:specify:~
指定:specification:~
指定d:specified:指定
指定通り:as specified:指定どおり
未指定:unspecified:~
	指定されない:unspecified
指定子:specifier:~
特有:specific:~
	に特有:-specific
特定の:specificな:~
特定な:specificな:特定的な
特定に:specificに:特定的に
特定的に:specificalに:特に
特定的には:specificalには:具体的には
特別:special:~
特殊:special:~
特化-:specialize:~
指示-:indicate:~
指示:indication:~
指示子:indicator:~

概念:concept:~
概念的:conceptual:~
観念:notion:~
抽象-:abstract:~
	抽象-化:abstraction
抽象的:abstract:~
具象-:concrete:~
具象的:concrete:~
定義-:define:~
定義:definition:~
定義な:definedな:~
未定義:undefined:~
	定義されない:undefined
定義済み:predefined:~
裁定-:decide:~
裁定:decision:~
設計-:design:~
設計:design:~
精査-:examine:~
考査-:review:~
考査:review:~
	査読:peer review
仕組み:mechanism:~
取組む:addressする:取り組む
取組んで:addressして:取り組んで
取組んだ:addressした:取り組んだ
取組もう:addressしよう:取り組もう
取組まれ:addressされ:取り組まれ
取組まな:addressしな:取り組まな
取組める:addressできる:取り組める
精緻化-:refine:~
提案:proposal:~
提案-:propose:~
案:idea:~
示唆-:suggest:~
示唆:suggestion:~
動機:motivation:~
目的:purpose:~
目標:goal:~
	目指して:aimして:~
	目指す:aimする:~
修正点:fixes:~
修正s:fixes:修正
修正-:fix:~

意味論:semantics:~
意味論上の:semanticな:~
意味論的:semantical:~
意味:meaning:~
意味され:meanされ:意図され
意味-:mean:~
有意義:meaningful:~
イミ:sense:意味
有意:significant:~
意図-:intend:~
	意図されない:unintended
意図:intent:~
意図n:intention:意図
意図的:intentional:~
	意図的でない:unintentional
	意図的でなく:unintentionally
	意図nに反して:unintentionally
明示的:explicit:~
暗黙的:implicit:~
暗黙:implied:~
	暗黙に:by implication
含意-:imply:~
含意:implication:~

求める:wantする:~
求めな:wantしな:~
求めら:wantさ:~
求めて:wantして:~
求めた:wantした:~
求まれ:wantされ:~
	求まれない:unwanted
欲する:desireする:~
欲され:desireされ:~
欲さな:desireしな:~
欲して:desireして:~
	望ましくない:undesirable／:not desirable
	望ましい:desirable
望む:wishする:~
望まな:wishしな:~
望まれ:wishされ:~
望んだ:wishした:~
望んで:wishして:~

挙動:behavior:ふるまい
挙動する:behaveする:ふるまう
挙動し:behaveし:ふるまわ
挙動でき:behaveでき:ふるまえ
挙動させ:behaveさせ:ふるまわせ
挙動して:behaveして:ふるまって
挙動した:behaveした:ふるまった
働く:workする:~
働ける:workできる:~
働いて:workして:~
働かせ:workさせ:~
働かな:workしな:~
作業:work:~
作業-:work:~
要因:factor:~
懸念-:concern:~
懸念:concern:~
困難:difficult:~
困難さ:difficulty:~
直感的:intuitive:~
本質的:essential:~
手法:method:~
原則:principle:~
資質:nature:~
自然:natural:~
不変則:invariant:~
特性:characteristic:~
	特徴付ける:characterize
重要:important:~
重要度:importance:~

受持てる:coverできる:受け持てる
受持たす:coverさせる:受け持たす
受持っ:coverし:受け持っ
受持たな:coverしな:受け持たな
受持つ:coverする:受け持つ
包摂-:encompass:~
中核:core:~
中核の:coreな:~
予約-:reserve:~
文書化-:document:~
文書化:documentation:~
諮る:consultする:~
諮られ:consultされ:~
諮っ:consultし:~
諮れ:consultでき:~
諮らな:consultしな:~
背景0:background:背景

	●拡張／互換
version::::バージョン
level::::レベル
bug::::バグ
debug::::デバッグ
test::::テスト
console::::コンソール
registry::::レジストリ
相互運用能:interoperability:~
相互運用可能:interoperable:~
互換:compatible:~
互換性:compatibility:~
	非互換:incompatible
	互換でない:incompatible
	非互換性:incompatibility
非互換化-:break:~
非互換化:breakage:~
後方-:backwards:~
前方-:forwards:~
過去互換:quirks:~
位置付け:status:~
非推奨に:deprecate:~
非推奨d:deprecated:非推奨
	取って代わ:supersede
開発-:develop:~
開発:development:~
改善:improvement:~
改善-:improve:~
向上-:improve:~
統合-:integrate:~
統合:integration:~
組入れて:incorporateして:組み入れて
組入れた:incorporateした:組み入れた
組入れら:incorporateさ:組み入れら
組入れる:incorporateする:組み入れる

落とす:dropする:~
落とさ:dropさ:~
落とせ:dropでき:~
落とし:dropし:~

改訂-:revise:~
改訂:revision:~
改訂版:revision:~
廃用:obsolete:~
廃用に:obsolete:~
履歴:history:~
歴史:history:~
歴史的:historical:~
変更点:changes:~
公表-:publish:~
公表:publication:~
公表版:publication:~
正誤表:errata:~
謝辞:acknowledgements:~
知的財産権:intellectual property rights:~

将来:future:~
	将来の:future:~
未来:future:~
	未来の:future:~
旧来:legacy:~
旧来の:legacyな:~
現代の:modernな:~
伝統的:traditional:~
相違-:differ:~
相違:difference:~
相違点:differences:~
相互作用-:interact:~
相互作用:interaction:~
保守-:maintain:~
保守:maintenance:~

追加的に:additionalに:追加で
追加的な:additionalな:追加の
機能性:functionality:~
	機能:function:~
	機能的:functional:~
	機能上の:functional:~
拡張-:extend:~
拡張:extension:~
拡張d:extended:拡張
拡張能:extensibility:~
能:ability:~
能力:capability:~
	能力:capabilities:~
特能:feature::~
アリ:possible:可能
	可能性:possibility:~
	不可能:impossible:~
可用:available:~
公開-:expose:~
公開:exposure:~
供せ:provideでき:~
供さな:provideしな:~
供-:provide:~
提供-:offer:~
改める:alterする:~
改めれ:alterでき:~
改めな:alterしな:~
改めら:alterさ:~
改めて:alterして:~
改めた:alterした:~
古典:classic::~::クラシック


	●適合性

標準:standard:~
草案:draft:~
編集者草案:Editor’s Draft:~
作業草案:Working Draft:~
勧告候補:Candidate Recommendation:~
勧告案:Proposed Recommendation:~
勧告:Recommendation:~

規則:rule:~
強制-:force:~
許容-:allow:~
	許容しない:disallow
許可-:permit:~
許可:permission:~
是認-:grant:~
否認-:deny:~
禁止:forbidden:~
禁止-:forbid:~
抑止:suppression:~
抑止-:suppress:~
抑制-:reduce:~
制限-:limit:~
制限s:limits:制限
制限:limitations:~
制約-:restrict:~
制約:restriction:~
制約的:restrictive:~
拘束-:constrain:~
拘束:constraint:~
違反-:violate:~
違反:violation:~
防止-:prevent:~
要求-:require:~
要件:requirements:~
期待-:expect:~
期待:expectation:~
予期-:expect:~
予期:expectation:~
省略可能:optional:~
	省略時は:optional
任意選択:optional:~
任意選択で:optionalに:~
奨励-:encourage:~
	しないことが奨励-:discourage
忌避-:discourage:~
推奨:recommendation:~
推奨-:recommend:~
認可-:approve:~
督促-:urge:~
尊守-:honor:~
固守-:adhere:~
順守-:obey:~
規範的:normative:~
厳密:strict:~
確保-:ensure:~
保証:guarantee:~
保証-:guarantee:~

指針:guideline:~:::ガイドライン
指導:guidance:~:::ガイダンス
手引き:guide:~:::ガイド
	目安:guidance／guide
助言的:advisory:助言
	助言:advice:~
公式的:official:~
正式:formal:~
非正式:informal:略式的
	正式でない:informal
判定基準:criteria:~
	判定基準:criterion

強く:strongに:~
強い:strongな:~
	強いられ
	強いる

故意的な:willful:故意による
適用-:apply:~
適用:application:~
適用能:applicability:~
応用:application:~:::アプリケーション
適切:appropriate:~
不適切:inappropriate:~
適正:proper:~
不適正:improper:~
適合性:conformance:~
適合-:conform:~
適合:conforming:~
適合t:conformant:適合
不適合:non-conforming:~
不適合t:non-conformant:不適合
正しい:correctな:~
正しく:correctに:~
不正:incorrect:~
正す:correctする:~
正され:correctされ:~
正した:correctした:~
正して:correctして:~

一貫性:consistency:~
一貫であ:consistentであ:一貫してい
一貫でな:consistentでな:一貫していな
一貫して:consistentに:~
一貫した:consistentな:~
一貫する:consistentになる:~
一貫しな:consistentにならな:~
一貫させ:consistentにす:~
整合な:consistentな:整合する
整合する:consistentになる:~
整合させ:consistentにす:~
整合でな:consistentでな:整合していな
	inconsistent:
整合性:consistency:~


	●実施
computer::::コンピュータ
native::::ネイティブ
app:application:::アプリ
platform::::プラットフォーム
vendor::::ベンダ
system::::システム
browser::::ブラウザ
software::::ソフトウェア
hardware::::ハードウェア
engine::::エンジン
support::::サポート
	~supportされない:unsupported
	~supportしない:unsupported
	未~supportな:unsupported
library::::ライブラリ
plugin::::プラグイン
	~plugin:plug-in
tool::::ツール
memory::::メモリー
install::::インストール
log::::ログ

義務付けら:mandateさ:~
義務付けな:mandateしな:~
義務付ける:mandateする:~
義務付けて:mandateして:~

取扱わず:handleせず:取り扱わず
取扱えな:handleできな:取り扱えな
取扱え:handleでき:取り扱え
取扱わせ:handleさせ:取り扱わせ
取扱わな:handleしな:取り扱わな
取扱っ:handleし:取り扱っ
取扱われ:handleされ:取り扱われ
取扱える:handleできる:取り扱える
取扱う:handleする:取り扱う
取扱い:handling:取り扱い

扱う:treatする:~
扱われ:treatされ:~
扱わな:treatしな:~
扱っ:treatし:~
扱え:treatでき:~
	扱い:treatment:~

試み:attempt:~
試みて:attemptして:~
試みた:attemptした:~
試みな:attemptしな:~
試みる:attemptする:~
試みら:attemptさ:~
試みれ:attemptでき:~
試行-:try:~

避ける:avoidする:~
避けら:avoidさ:~
避けた:avoidした:~
避けて:avoidして:~
避けれ:avoidでき:~
	避けれ:avoidでき:避けられ
	避けつ:avoidしつ:~

達成-:achieve:~
成遂げる:accomplishする:成し遂げる
成遂げれ:accomplishでき:成し遂げれ
成遂げら:accomplishさ:成し遂げら

施行-:enforce:~
監視-:monitor::~
監視:monitoring::~
実施:practice:~
実践:practice:~
実用的:practical:~
委任-:delegate:~
委任:delegation:~
調整-:adjust:~
調整:adjustment:~
最適:optimal:~
最適化-:optimize:~
最適化:optimization:~
処理能:performance:~
	高処理能:performant:~
事例:case:~
利用事例:use case:~:::ユースケース
デモる:demonstrateする::~
デモられ:demonstrateされ::~
デモっ:demonstrateし::~
デモれ:demonstrateでき::~
デモ:demonstration::~
	デモ:demo
基盤:infrastructure:~:::インフラ
	規定-:dictate:~
強力:powerful:~
体験:experience:~
経験:experience:~
試験的:experimental:~
試験-:experiment:~
試験:experiment:~
実験:experiment:~
便宜性:facility:~
経験則:heuristics:~
	経験的:heuristic:~
技法:technique:~
技術:technology:~
技術-:technical:~
技術的:technical:~
技術用の:technicalな:~
形上では:technicalには:形の上では

環境:environment:~
環境設定:configuration:~
環境設定-:configure:~
局面:scenario:~
状況:situation:~
状況下:circumstances:~

効果:effect:~
効果的:effective:~
実質的:effective:~
効率的:efficient:~
効率:efficiency:~
副作用:side-effect:~
影響-:affect:~
影響i:impact:影響
波及-:influence:~
実際:actual:~
実際の:actualな:~

最善:best:~
最良:best:~
不良:bad:~
便益:benefit:~
便利:convenience:~
簡便:convenient:~
援助-:aid:~
援助:aid:~
方式:manner:~
仕方:way:~
労:effort:~
適度:reasonable:~
適理:reasonable:~

	●仕様（未分類
logic::::ロジック
custom::::カスタム
	~custom化:customize
	~custom化:customizations
program::::プログラム
programming::::プログラミング
拡充-:populate:~
検分-:inspect:~
検分:inspection:~
決定-:determine:~
決定:determination:~
受容-:accept:~
選定-:select:~
選定:selection:~
認識:recognition:~
認識-:recognize:~
判断-:deem:~
判別-:distinguish:~
除外:exclusion:~
除外-:exclude:~
既定:default:~:::デフォルト
既定の:default:~:::デフォルト
理由:reason:~
事由:reason:~
基本的:basic:~
基本:basic:~
基底:base:~
存在-:exist:~
存在:existence:~
既存の:existing:~

選好-:prefer:~
選好:preference:~
選好d:preferred:選好
無視-:ignore:~
妥当:valid:~
妥当性:validity:~
無効:invalid:~
	妥当でない:invalid
	無効~化:invalidate／invalidation
	無効に:invalidate
正確:exact:~
正確a:accurate:正確
正確度:accuracy:正確さ
精確:precise:~
精度:precision:~

言語:language:~
登録-:register:~
登録:registration:~
未登録に:unregister:~
公に:publicに:~
公な:publicな:~

既知:known:~
未知:unknown:~
知識:knowledge:~
完全:complete:~
不完全:incomplete:~
容易:easy:~
	容易に:easily
孕む:involveする:~
孕まれ:involveされ:~
孕んで:involveして:~
孕まな:involveしな:~
孕み:involveし:~
関与i:involvement:関与

見出す:findする:~
見出され:findされ:~
見出せ:findでき:~
見出さな:findしな:~
見出した:findした:~
見出して:findして:~

代替-:alternate:~
代替:alternative:~
相似的:analogous:~
類似な:similarな:~
類似に:similarに:同様に
類似する:similarである:~
干渉-:interfere:~
干渉:interference:~
予測-:predict:~
自覚-:aware:~
予見-:believe:~
主張-:claim:~
統治-:govern:~
使役-:employ:~
依頼-:ask:~
保全-:preserve:~
発見-:discover:~
発見:discovery:~
恣意的:arbitrary:~
任意な:arbitraryな:~
任意に:arbitraryに:~
帰結:consequence:~
駆動な:drivenな:~
駆動-:drive:~
導出-:derive:~
正準的:canonical::~
正準-:canonical::~
	正準-化:canonicaliz-
側面:aspect:~
手段:means:~
相応しく:suitableに:~
相応しい:suitableな:~
相応でな:suitableでな:相応しくな
care:::配慮::ケア
	~careする:take care
注意深く:carefulに:~
注意深い:carefulな:~
	気を付ける:be careful
管理-:manage:~
管理:management:~
純粋:pure:~
組込みの:built-inな:組み込みの
国際的:international:~
国際-:international:~
	国際-化:internationalization／:internationalized
測定-:measure:~
測定:measurement:~
伝達-:convey:~

貢献-:contribute:~
貢献:contribution:~
貢献者:contributor:~
	貢献された方々:contributor
	謝意／感謝:thank
必要yな:necessaryな:必要とされる
	必要yなだけ:as necessary
必要yなら:necessaryなら:必要とされるなら
必要yであ:necessaryであ:必要とされ
必要yでな:necessaryでな:必要とされな
必要yあり:necessaryになり:必要とされ
必要yある:necessaryになる:必要とされる
不必要:unnecessary:~
	必要yでない:unnecessary
	不必要に:unnecessarily
用立てる:utilizeする:~
用立てら:utilizeさ:~
用立てれ:utilizeでき:~
用立て:utilizeし:~
	用立てる:make use of


●制御／処理
algo:algorithm:::アルゴリズム
call:
callback:
method::::メソッド
段:step:~
手続き:steps:~
手続-:procedure:手続き
呼出され:invokeされ:呼び出され
呼出さな:invokeしな:呼び出さな
呼出す:invokeする:呼び出す
呼出した:invokeした:呼び出した
呼出して:invokeして:呼び出して
呼出せば:invokeすれば:呼び出せば
呼出せる:invokeできる:呼び出せる
呼出せな:invokeできな:呼び出せな
呼出そう:invokeしよう:呼び出そう
呼出ng:invoking:呼び出し
呼出n:invocation:呼び出し

呼応して:対する response において:~
	呼応して:in response to
遂行-:perform:~
実行-:execute:~
実行:execution:~
走らす:runする:~
走らせ:runし:~
走っ:runし:~
走る:runする:~
走らさ:runさ:~
走らな:runしな:~
走れる:runできる:~
返す:returnする:~
返され:returnされ:~
返さな:returnしな:~
返らな:returnしな:~
返せる:returnできる:~
返った:returnした:~
返さず:returnせず:~
返し:returnし:~
	返して:returnして:~
	返した:returnした:~
返る:returnする:~
返せ:returnでき:~
返り:return:~

script::::スクリプト
scripting::::スクリプト処理
hook::::フック
fall-back:fall back:::フォールバック
fallback::::フォールバック
thread::::スレッド
lock::::ロック
access::::アクセス
error::::エラー
task::::タスク
loop::::ループ
event::::イベント
handler::::ハンドラ
target::::ターゲット
listen::::リッスン
listener::::リスナ
filter::::フィルタ
誘発-:trigger:~
発火:firing::~
発火-:fire::~
浮上-:bubble::~
浮上:bubbling::~
配送:dispatch::~
配送-:dispatch::~

作動中:active::~::アクティブ
作動化-:activate::~::アクティブ化
作動化:activation::~::アクティブ化
動作-:act::~
動作:action::~

達-:reach:~
到達-:reach:~
制御-:control::~
制御:control::~
制御器:controller::~
起動-:initiate:~
起動元:initiator:~
初期:initial:~
初期の:initial:~
初期化-:initialize:~
初期化:initialization:~
	初期化:initializing
	初期~時には:initially
mode::::モード
flag::::フラグ
option::::オプション
parameter::::パラメタ
入力:input:~
引数:argument:~
変数:variable:~
出力-:output:~
出力:output:~
定数:constant:~

不能化:disabled:~
不能化-:disable:~
可能化-:enable:~
可能化:enabled:~
破棄-:discard:~
停止-:stop::~
中断-:interrupt::~
待機-:wait::~
中止-:abort::~
再開-:resume::~
休止-:suspend::~
終了-:terminate::~
終了n:termination::終了
	終了:end
完遂-:finish::~
完遂d:finished::完遂
完了-:complete::~
完了:completion::~
取消n:cancelation::取り消し::キャンセル
取消:cancel::取り消し::キャンセル
取消す:cancelする::取り消す::キャンセルする
取消され:cancelされ::取り消され::キャンセルされ
取消せ:cancelでき::取り消せ::キャンセルでき
取消さな:cancelしな::取り消さな::キャンセルしな
取消して:cancelして::取り消して::キャンセルして
取消した:cancelした::取り消した::キャンセルした
飛ばす:skipする:~
飛ばさ:skipさ:~
飛ばせ:skipでき:~
飛ばし:skipし:~

例外:exception::~
catch:
投出:throw::~
投出-:throw::~
即時:immediate::~
並列的:parallel::~
同時並行:concurrent::~
同時並行性:concurrency::~
同期c:sync::同期
非同期c:async::非同期
同期-:synchronize::~
同期:synchronous::~
同期的:synchronous::~
非同期:asynchronous::~
非同期的:asynchronous::~
同期法:synchronization::~
阻む:blockする::~::ブロックする
阻まれ:blockされ::~::ブロックされ
阻まな:blockしな::~::ブロックしな
阻んで:blockして::~::ブロックして
阻んだ:blockした::~::ブロックした

却下-:reject::~
却下:rejection::~
充足-:fulfill::~
充足:fulfillment::~
失敗-:fail::~
失敗:failure::~
成功:success::~
成功-:succeed::~
成功裡:successful::~
	成功した:successful

継続-:continue::~
継続:continuation::~
継続的:continuous::~

進行中:ongoing:~
評価:evaluation::~
評価-:evaluate::~

処理:processing:~
処理-:process:~
処理n:process:処理
処理器:processor:~:::プロセッサ

自動的:automatic::~
自動:auto::~
自動-:auto-::~
自動で:auto-::~
自動化:automation::~
自動化-:automate::~
	自動的に:automatically
手動:manual::~
手動で:manualに::~

検証-:validate::~
検証:validation::~
検証器:validator::~
検証y-:verify::検証
検証y:verification::検証
検査-:check:~
検査:check:~
検査器:checker:~
検出-:detect::~
検出:detection::~
報告:report::~::レポート
報告-:report::~::レポート
情報:information:~
報:info:情報
通知-:notify::~
通知:notification::~
通達-:signal::~
通達:signal::~
記録-:record::~
記録:record::~
受取る:receiveする:受け取る
受取っ:receiveし:受け取っ
受取らな:receiveしな:受け取らな
受取れる:receiveできる:受け取れる
受取れな:receiveできな:受け取れな

演算-:operate:~
演算:operation:~
	演算子:operator:~
計算-:calculate:~
計算:calculation:~
補間-:interpolate::~
補間:interpolation::~

状態:state::~::ステート
状態s:status::状態°::ステータス
更新-:update::~
更新:update::~
遷移-:transition::~::トランジション
遷移:transition::~::トランジション

上書き:override::~
	上書き:overwrite:~

条件:condition::~
条件付き:conditional::~
条件付きで:conditionalに::~
無条件に:unconditionalに::無条件で
無条件な:unconditionalな::~
	条件付けら:conditionさ
	条件付き~でない:unconditional
	条件付き~でない:non-conditional
	条件を伴わずに:unconditional

反応-:react::~
反応:reaction::~
観測-:observe::~::オブザーブ
観測:observing::~::オブザービング
観測n:observation::観測::オブザベーション
観測器:observer::~::オブザーバ

message::::メッセージ

	切替える:switchする:切り替える
	切替えら:switchさ:切り替えら
	切替えれ:switchでき:切り替えれ
	切替えた:switchした:切り替えた
	切替えて:switchして:切り替えて
	切替えな:switchしな:切り替えな
	切替えよ:switchしよ:切り替えよ
	切替わっ:switchされ:切り替わっ
	切替n:switch:切り替え

promise:
解決-:resolve::~
解決d:resolved::解決
解決:resolution::~
	処理待ち:pending:~
先送り:defer::~
先送d:deferred::先送り
遅延-:delay::~
遅延:delay::~
待時間:latency::待ち時間
所要時間:duration::~
時刻印:timestamp::~::タイムスタンプ
時刻:time::~
時間:time:~
	時間~越し:over time
計時:timing::~
時列線:timeline::~::タイムライン
日付:date::~
準備済み:ready::~
準備-:prepare:~
準備:preparation:~
進捗-:progress::~
進捗:progress::~
live:
消費-:consume::~

反復-:iterate::~
反復:iteration::~
反復子:iterator::~
繰返す:repeatする:繰り返す
繰返され:repeatされ:繰り返され

動的:dynamic::~
静的:static::~
再帰的:recursive::~
counter::::カウンタ
破壊:destruction::~
破壊-:destroy::~

指令:directive::~::ディレクティブ

凍結-:freeze::~
凍結d:frozen::凍結

折衝-:negotiate::~::ネゴシエート
折衝:negotiation::~::ネゴシエーション

garbage::::ガーベジ
探索:search::~::サーチ
探索-:search::~::サーチ
探索処理:searching::~::サーチ処理
往復:roundtrip::~::ラウンドトリップ
往復-:round-trip::~::ラウンドトリップ
	往復:round trip

●構造／関係／IDL

部分的:partial:~
全部的:full:~
内部:internal:~
内部の:internalな:~
内部的:internal:~
外部:external:~
外部の:externalな:~
内側:inside:~
外側:outside:~
内縁:inner:~
外縁:outer:~
自己-:self-:~
下位-:sub-:~
直接的:direct:~
間接的:indirect:~
依拠-:rely:~
依存-:depend:~
	依存して:depending on(upon)
	に依存する:is dependent on／:is independent of
	に依存する:-dependent
依存関係:dependency:~
独立:independent:~
	に依存しない:independent
関係-:relate:~
関係:relation:~
関係性:relationship:~
無関係:unrelated:~
関連な:relevantな:関連する
関連する:relevantになる:~
関連しな:relevantでな:~
	関連しない:irrelevant
結付けれ:associateでき:結び付けれ
結付き:association:結び付き
結付け:association:結び付け
結付けた:associateした:結び付けた
結付けて:associateして:結び付けて
結付ける:associateする:結び付ける
結付けら:associateさ:結び付けら

対応付けた:mapした::~
対応付けれ:mapでき::~
対応付けら:mapさ::~
対応付けて:mapして::~
対応付ける:mapする::~
対応付け:mapping::~
組合わす:combineする:組み合わす
組合せる:combineする:組み合せる
組合せれ:combineすれ:組み合せれ
組合せた:combineした:組み合せた
組合せて:combineして:組み合せて
組合され:combineされ:組み合され
組合でき:combineでき:組み合せれ
組合n:combination:組み合せ
所有-:own:~
所有者:owner:~
束縛-:bind::~
束縛:binding::~
継承-:inherit::~
継承:inheritance::~
継承d:inherited::継承
参照:reference:~
参照-:reference:~

graph::::グラフ
shadow:
平坦:flat::~
	平坦~化:flatten
primitive::::プリミティブ
interface::::インタフェース
mixin:
obj:object:::オブジェクト
item::::アイテム
queue::::キュー
entry::::エントリ
group::::グループ
	~group化:grouping
key:
member::::メンバ
map::::マップ
top-level::::トップレベル
tuple::::タプル
pair::::ペア
list::::リスト
配列:array::~
配列-:arrange::~
辞書:dictionary::~::ディクショナリ
capsule::::カプセル
	~capsule化-:encapsulate
	~capsule化:encapsulation
collection::::コレクション
record::::レコード
table::::テーブル
row:
col:column
cell:
field::::フィールド
slot::::スロット
prop:property:::プロパティ
属性:attribute::~
構造体:struct::~
共用体:union::~
連列:sequence::~::シーケンス
連列的:sequential::~::シーケンシャル
stack::::スタック
cluster::::クラスタ
集合:set::~::セット
部分集合:subset::~::サブセット
下位集合:subset::~::下位セット
上位集合:superset::~::上位セット
交差集合:intersection:~
	和集合:union:~
列挙:enumeration::~
列挙-:enumerate::~
列挙d:enumerated::列挙

index:
有index:indexed::有 index
instance::::インスタンス
tree::::ツリー
下位tree:subtree:::下位ツリー:サブツリー
根:root::~::ルート
node::::ノード
親:parent::~
子:child::~
子孫:descendant::~
先祖:ancestor::~
同胞:sibling::~
広義-:inclusive:~
要素:element::~
文書:document::~
文書片:document fragment::~::文書フラグメント

単純:simple:~
	単純~化-:simplify
	単純~化:simplification
	単純に:simply
	より単純:simpler
複階-:complex::~
複階的:complex::~
複階性:complexity::複雑さ
複合-:compound::~
複合的:compound::~
階層:hierarchy:~
階層-:heirarchical:~
階層的:hierarchical:~
下層:underlying:~
下層の:underlying:~
層:layer::~::レイヤ
内在的:intrinsic::~
包含-:contain::~
内容:content::~
容器:container:::コンテナ
包装-:wrap::~
入子に:nest::入れ子に
入子な:nestedな::入れ子な
入子ng:nesting::入れ子
順序:order:~
有順序:ordered:~
無順序:unordered:~
順序付け:ordering:~
順序付けら:orderさ:~
	順序付ける
並替ng:reordering:並び替え
空:empty:~
型:type::~
有型:typed::~
種別:type:~
class::::クラス
下位class:subclass:下位 class::下位クラス
文脈:context::~
scope::::スコープ
視野:scope::~::スコープ
名前空間:namespace::~

大域:global::~::グローバル
大域的:global::~::グローバル
局所:local::~::ローカル
局所的:local::~::ローカル

共有-:share::~
	共有d:shared:共有
	共有:sharing:~
共用:shared::~
専用:dedicated::~
専用の:dedicatedな::~

構造:structure::~
有構造:structured::~
構造的:structural::~
構造上の:structuralな::~

構成子:constructs:~
構築子:constructor::~::コンストラクタ
構築-:construct::~::コンストラクト
構築:construction::~::コンストラクション

築く:buildする:~
築かれ:buildされ:~
築ける:buildできる:~
築いた:buildした:~
築いて:buildして:~
	築き:buildし:~

伝播-:propagate::~
伝播:propagation::~
連鎖:chain::~::チェイン
連鎖-:chain::~::チェイン
反映-:reflect:~
反映:reflection:~

隔離-:isolate::~
隔離:isolation::~
分断:break::~
分断-:break::~
分断ng:breaking::分断
分断法:breaking::~
	分断-不能:unbreakable
	分断-法:breaking
分離:separation:~
分離-:separate:~
分離子:separator:~
	〜で分離された:-separated
	~space等で分離され:space-separated
別々な:separateな:~
別々に:separateに:~
区切子:delimiter:~

等価:equivalent:~
比較:comparison:~
比較-:compare:~
関与-:participate:~
関与:participation:~
一意:unique:~
単位:unit:~
	単位なし:unitless

●データ／操作

buffer::::バッファ
code::::コード
data::::データ
stream::::ストリーム
byte::::バイト
octet::::オクテット
bit::::ビット
本体:body::~::ボディ
binary::::バイナリ
source::::ソース
query::::クエリ
	pointer::::ポインタ
scalar::::スカラー
値:value:~
範囲:range:~
真偽-:boolean::~
真偽値:boolean::~
名:name:~
名前:name:~
有名:named:~
命名-:name:~
命名:naming:~
改称-:rename:~

識別-:identify:~
識別:identification:~
識別子:identifier:~

新たな:new:~
操作-:manipulate:~
操作:manipulation:~
追加-:add:~
追加:addition:~
作成-:create::~
作成:creation::~
アテガう:assignする::あてがう
アテガわれ:assignされ::あてがわれ
アテガわな:assignしな::あてがわな
アテガっ:assignし::あてがっ
アテガえる:assignできる::あてがえる
アテガえば:assignすれば::あてがえば
得する:obtainする:得る
得され:obtainされ:得られ
得した:obtainした:得た
得して:obtainして:得て
得しよ:obtainしよ:得よ
得せ:obtainでき:得れ
取得-:get::~
取得子:getter::~
設定-:set::~
	設定しておく:set up／setup
設定:setting::~
設定子:setter::~
設定群:settings::~
再設定-:reset::~
再設定:reset::~
	設定し直:reset
置換-:replace::~
置換d:replaced::置換
置換:replacement::~
除去-:remove::~
除去:removal::~
挿入-:insert::~
挿入:insertion::~
付加-:append::~
前付加-:prepend::~
複製-:copy::~
複製:copy::~
削除-:delete::~
削除:deletion::~
clear::::クリア
	空にする:clear
抽出-:extract::~
生産-:produce::~
格納-:store::~
storage::::ストレージ
収集-:collect::~
収集:collection::~
push::::プッシュ
pop::::ポップ
pull::::プル
enqueue::::エンキュー
dequeue::::デキュー
clone::::クローン
sort::::ソート
結合-:combine::~
結合:combining::~
結合n:combination::結合
結合子:combinator::~
分割-:split:~
	分割-:divide
正規化-:normalize::~
正規化:normalization::~
生成-:generate::~
生成d:generated:生成
生成:generation::~
生成器:generator::~

検索取得-:retrieve::~
検索取得:retrieval::~

変異-:mutate::~
変異:mutation::~

変更-:change:~
変更:change:~
変化-:change:~
変化:change:~

改変-:modify::~
改変:modification::~

変換-:convert::~
変換:conversion::~

直列化-:serialize::~::シリアル化
直列化:serialization::~::シリアル化
直列化子:serializer::~::シリアライザ
直列化器:serializer::~::シリアライザ

	読専:readonly:~
読専:read-only::~

形式:format::~::フォーマット

符号単位:code unit::~
符号位置:code point::~

符号化-:encode::~::エンコード
符号化法:encoding::~::エンコーディング
符号化:encoding::~::エンコーディング
符号化器:encoder::~::エンコーダ
復号-:decode::~::デコード
	復号-可能:decodable
復号:decoding::~::デコーディング
復号器:decoder::~::デコーダ

読込n:load::読み込み::ロード
読込ng:loading::読み込み::ローディング
読込まれ:loadされ::読み込まれ::ロードされ
読込まな:loadしな::読み込まな::ロードしな
読込ませ:loadさせ::読み込ませ::ロードさせ
読込む:loadする::読み込む::ロードする
読込みつ:loadしつ::読み込みつ::ロードしつ
読込みた:loadした::読み込みた::ロードした
読込んで:loadして::読み込んで::ロードして
読込んだ:loadした::読み込んだ::ロードした
読込め:loadでき::読み込め::ロードでき
読込もう:loadしよう::読み込もう::ロードしよう

読取n:read::読み取り
	読取n法:reading
	読取n可能:readable
読取る:readする::読み取る
読取られ:readされ::読み取られ
読取らな:readしな::読み取らな
読取れ:readでき::読み取れ
読取っ:readし::読み取っ
読取り:reading::読み取り
読取器:reader::読み取り器

加算:addition::~
加算-:add::~
減算:subtraction::~
減算-:subtract::~
除算:division::~
除算-:divide::~
乗算:multiplication::~
乗算-:multiply::~


●構文

文字:character:~
文字列:string::~
tag::::タグ
文法:grammar:~
keyword::::キーワード
markup::::マークアップ
mark-up:mark up:::マークアップ
成分:component:~
空白:whitespace::~
	空白:white space
comma::::カンマ
space::::スペース
tab::::タブ
colon::::コロン
semicolon::::セミコロン
slash::::スラッシュ
hyphen::::ハイフン
	~hyphen化:hyphenation／:hyphenate
改行文字:newline::~
	改行文字:newline character
数字:digit::~
token::::トークン
comment::::コメント
escape::::エスケープ
literal::::リテラル
引用符:quote::~
接頭-:prefix::~
接頭辞:prefix::~
接尾-:suffix::~
接尾辞:suffix::~
小文字:lowercase::~
大文字:uppercase::~
大小無視:case-insensitive::~
文字大小無視:case-insensitive::~
大小区別:case-sensitive::~
文字大小区別:case-sensitive::~
文字大小:case::~
合致-:match::~::マッチ
照合-:match::~::マッチ
照合:matching::~::マッチング
宣言-:declare::~
宣言:declaration::~
宣言的:declarative::~
生成規則:production::~

構文:syntax::~
構文-:syntactic::~
構文上の:syntacticな::~
構文上は:syntacticには::~
	構文上は:syntactically

構文解析-:parse::~::パース
構文解析器:parser::~::パーサ
構文解析:parsing::~::パース処理

形:form:~
欠落:missing:欠落している
欠落な:missingな:欠落している
欠落であ:missingであ:欠落してい
欠落っ:missingであっ:欠落してい

●具現化

媒体:media::~::メディア
media::::メディア
画像:image::~::イメージ
画素:pixel::~::ピクセル
pixel::::ピクセル
動画:video::~::ビデオ
音声:audio::~::オーディオ
表示:display:~
表示-:display:~
呈示-:present:~
呈示:presentation:~
	呈示~用:presentational
具現化-:render::~::レンダー
具現化:rendering::~::レンダリング
具現化器:renderer::~::レンダラ
描画-:render::~::レンダー
描画:rendering::~::レンダリング
描画器:renderer::~::レンダラ

視覚-:visual:~
視覚的:visual:~
可視:visible:~
可視性:visibility:~
不可視:invisible:~
表示域:viewport::~::ビューポート

	合成-:synthesize:~
	合成:synthetic:~
	合成な:syntheticな:~
	合成d:synthesized:合成
	合成:synthesis:~
	合成的に:syntheticに:合成により
	合成器:synthesizer:~

●UI
UI:
	UI:user interface／interface
accessibility:::access 能:アクセス能:アクセシビリティ
form::::フォーム
focus::::フォーカス
screen::::スクリーン
scrollbar::::スクロールバー
scroll::::スクロール
control::::コントロール
modal::::モーダル
	~modal性:modality
gesture::::ジェスチャ
prompt:
click::::クリック
label::::ラベル
button::::ボタン
mouse::::マウス
UIkey:key:::キー
keyboard::::キーボード
view::::ビュー
UIwindow:window:::ウィンドウ
UItab:tab:::タブ
menu::::メニュー
bar::::バー
	~URL~bar:address bar
	~URL~bar:location bar
dialog::::ダイアログ
icon::::アイコン
widget::::ウィジェット
caption::::キャプション
pointer::::ポインタ
cursor::::カーソル
file::::ファイル
filename::::ファイル名
外観:appearance:~
手入力-:enter:~
手入力:entry:~
ヤリトリ-:interact::やりとり::インタラクト
ヤリトリ:interaction::やりとり::インタラクション
ヤリトリあり:interactive::やりとり可能::インタラクティブ
	ヤリトリ-~~能:interactivity
toggle::::トグル

印刷:print:~:::プリント
印刷-:print:~:::プリント

●network

資源:resource::~:リソース
下位資源:subresource::~:下位リソース

埋込d:embedded:埋め込み
埋込み:embedding:埋め込み
埋込む:embedする:埋め込む
埋込まれ:embedされ:埋め込まれ
埋込める:embedできる:埋め込める
埋込んだ:embedした:埋め込んだ
埋込んで:embedして:埋め込んで
埋込まな:embedしな:埋め込まな
埋込もう:embedしよう:埋め込もう

要請-:request::~::リクエスト
要請:request::~::リクエスト
応答-:respond::~::レスポンド
応答:response::~::レスポンス

提出-:submit::~
提出:submission::~
所在:location::~
URL:
url:
scheme::::スキーム
path::::パス
素片:fragment::~::フラグメント
host::::ホスト
port::::ポート
site::::サイト
link::::リンク
hyperlink::::ハイパーリンク
address::::アドレス
domain::::ドメイン
download::::ダウンロード
upload::::アップロード
redirect::::リダイレクト
redirection::::リダイレクション
referrer::::リファラ
remote::::リモート

接続-:connect::~
接続:connection::~
通信-:communicate::~
通信:communication::~
送信:sending::~
送信-:send::~
送信者:sender::~
受信-:receive::~
受信:receiving::~
受信者:recipient::~
送達:delivery::~
送達-:deliver::~
転送-:transfer::~
転送:transfer::~
転送ng:transferring::転送

伝送-:transmit::~
伝送:transmission::~

network::::ネットワーク
networking::::ネットワーク処理
header::::ヘッダ
client::::クライアント
server::::サーバ
serve::::サーブ
service::::サービス
媒介者:intermediary::~
proxy::::プロキシ
transport::::トランスポート
cache::::キャッシュ
protocol::::プロトコル
cookie::::クッキー
fetch:
fetching::::fetch 処理

配備:deployment::~
配備-:deploy::~
流通:traffic:~:::トラフィック

訪問-:visit:~
訪問:visit:~
追従-:follow:~

●保安
security::::セキュリティ
secure::::セキュア
	~secure化:secured
privacy::::プライバシー
施策:policy::~::ポリシー
session::::セッション
sandbox::::サンドボックス
	~sandbox化:sandboxed
	~sandbox法:sandboxing
CSP:
CORS:
生成元:origin::~::オリジン
同一-:same-::~
非同一-:cross-::~::クロス
軽減-:mitigate:~
軽減:mitigation:~
軽減策:mitigations:~
安全:safe:~
	安全でない:unsafe
主体:party::~::パーティ
第三者-:third-::~::サード
当事者-:first-::~::ファースト
阻止-:block::~::ブロック
敵対的:hostile:~

指紋収集-:fingerprint::~
指紋収集:fingerprinting::~
悪意的:malicious:~
追跡:tracking::~::トラッキング
追跡-:track::~::トラック
注入:injection::~::インジェクション
注入-:inject::~::インジェクト
敏感:sensitive::~::センシティブ
完全性:integrity::~
偽装-:spoof::~
偽装:spoofing::~
資格証:credentials::資格情報::クレデンシャル
攻撃:attack::~
攻撃者:attacker::~
行路:vector::路
保護-:protect::~
保護:protection::~
脆弱性:vulnerability::~
信用:trust::~
信用-:trust::~
漏洩-:leak::~
漏洩:leak::~
漏洩e:leakage::漏洩
漏洩ng:leaking::漏洩

●CSS 全般

style::::スタイル
	~style上の:stylistic
stylesheet:style sheet:::スタイルシート
cascade::::カスケード
at-:
記述子:descriptor::~
略式:shorthand::~
下位prop:sub-property::下位 property:下位プロパティ
	下位prop:longhand／subproperty／sub-properties／subproperties

適用対象:applies to:~
百分率:percentage:~
離散的:discrete::~
animate::::アニメート
animation::::アニメーション
使用:used:~
算出:computation:~
算出-:compute:~
算出d:computed:算出
選択子:selector::~::セレクタ
疑似類:pseudo-class::疑似 class:疑似クラス
疑似要素:pseudo-element::~

font::::フォント
glyph::::グリフ
graphic::::グラフィック
graphicな:graphical:::グラフィックな
canvas::::キャンバス
layout::::レイアウト
lay-out:lay out:::レイアウト
flow::::フロー
overflow::::過フロー:オーバーフロー
box::::ボックス
border::::ボーダー
padding::::パディング
margin::::マージン
offset::::オフセット
inset::::インセット
配置-:place:~
配置:placement:~
区画:area::~
領域:region::~
整形-:format::~
整形:formatting::~

包含塊:containing block::包含 block:包含ブロック
行内-:inline-::~::インライン
行内:inline::~::インライン
	行内~levelの:inline-level
塊:block:::ブロック
塊-:block-:::ブロック
	塊~levelの:block-level
行l:line::行
	行-:line-:~
断片:fragment::~
断片化-:fragment::~
断片化:fragmentation::~
	断片~化:fragmented
	断片~化:fragmenting
	断片化-法:fragmenting
整列-:align::~
整列:alignment::~
	整列-法:alignment
	〜に整列され:-aligned
	整列-済み:aligned
色:color::~
背景:background::~
前景:foreground::~
`;

/*

●●その他の定訳

	●定訳（語彙レベル
FOO化-:FOOize／FOOfy
FOO化:FOOnization／FOOfication
FOO化:FOOizing
FOO-法:FOOing
非FOO:non-FOO
FOOでない:non-FOO
非FOO:inFOO
FOOでない:inFOO
FOOなしの:FOOless
非:non
FOO-可能:FOOable
FOO-可能:able to FOO
FOO-不能:unFOOable
FOO-不能:unable to FOO
FOO-不能:inFOOable／imFOOable
可FOO:FOOable
よりFOO:FOOer
方がFOO:FOOer
最もFOO:FOOest
再FOO:reFOO
FOOし直す:reFOO
再びFOOする:reFOOする
FOO間:inter-FOO
過FOO:overFOO

	●定訳（文法レベル
〜内／にて／において:in
〜用:for 〜
〜の中:within 〜
〜の中へ:into 〜
〜を介して:via 〜
〜を通して:through 〜
〜を超え:beyond 〜
〜越し:over 〜
〜に対し:to／on／for 〜
〜上:on 〜
〜から:from 〜
〜過ぎ:too 〜
〜の場合:if 〜
〜を伴う:with 〜
〜で:with 〜
〜により:by 〜
〜と同じく:as with 〜
どう:how

	●定訳（対象
どれ:which
方の:whichever of
どの〜:any
この:this
これらの:these
その:that
それら:they
それらの:their
それらの:those
それらを:them
そのような:such
もの:one
もの:thing
何か:something
すべての／すべて:all
のみ／限り／しか〜ない:only
他の:other
他の場合:otherwise
以外の:other than
その他:others
前者:former
後者:latter
別々な:separateな:~
別の:another
両者／両:both
ほとんどの:most
当の:in question
当の:the
最初の:the first
最後の:the last
頭部の:leading
尾部の:trailing
次の／次に挙げる:the following
残りの:remaining
一部の:some
何らかの:some
の一部:some of
ある／いくつか:some
一定の:certain
ある種の:certain
まるごと:entirely
全体:entire
一連の:series of
一緒:together
後続-:follow

同じ:same
一致:identical
各:each
自身:itself
自身:themselves
自前の:own
互いに:each other
の一部／一部を成す／成す部分:part of
異なる:different

何であれ:whatever
何:what
どの〜も:any
いずれか:one of
様々な:various
種々の:various
類の:sort of
など:such as
等々:and so forth／:and so on／:etc.
新たに:newly
からなる:consists of
様に／様な:like

向けて:toward
いくぶん:somewhat
より／もっと／方が:more
最も:most
最も:〜est
ほぼ:almost
が:although
が:but

	●定訳（所在
どこで:／どこ:where
ここ:here
そこ:there
どこでも:anywhere
どこか:somewhere
他所:elsewhere
周囲の:surrounding
周り:around
上:above
下:below
前:before
後:after
合間／間:between
隣接する:adjacent な

	●定訳（量
どれだけ／どう:how
いくつかの:several
〜以上:〜or more
単独の／1 個の:single
0:zero
個:one／:two／:three...
何個かの／いくつかの:a number of
総数／〜数／〜の個数:the number of 〜
いくつでも／任意個数の／0 個以上の:any number of
何個:number of
多数の／数多くの／多くの:many
少なくとも／〜以上:at least
以下:or less
以下:less than or equal to
未満:less than
〜以下:〜or less
以上:greater than or equal to
回:time／:times
少数の:a few
少数の:few
目:first／:second／:third／...
複数の:more than one
複数の:two or more
複数の:multiple

	●定訳（時間
いつ:when
常に:always
現:current
現時点／現在:currently
同時に:simultaneous
間:during
間:between
すでに:already
もはや:no longer
まで:until
今や:now
再び:again
再度:again
まだ:yet
依然として:still
先立って:prior to
後で／後に:later
まず／先ず:first
それまで／以前の／前の:previous／:previously
早期:early／:earlier
より早い:earlier
時機:timing
いつでも:at any time
時点:at the time
この時点:at this point
時を経:over time

●その他の定訳（仕様レベル
かつ:and
または:or
与え:give
所与の:given
挙げられ:listed
結果:result
結果の:resulting
結果の:resultant
除いて:except
除く:except
に基づく:-based
し続ける:continue to
含む:include
含め:including
呼ばれ:called
在る／無い:present／:absent／:there is
在る／無い［こと／下で／場合／とき］:presence／:absence
有無:presence／:present
不在:absence／:absent
対応-:correspond
選ぶ:choose
生じ:occur
用立てる:make use of／utilize
知る:know
示す:show
示され:shown
織り込む:account
織り込まれ:taken into account
要約:abstract
見よ:see
見受けられ:seem
起こる:happen
渡す:pass
所与の:given
与えられた:given
導き:lead
変わる:vary
〜に関係する:〜-related
〜に注意:note that
注記:Note
節:section
十分:enough
〜と違って:unlike
〜に基づいて:based on
〜に基づく:-based
代わりに:instead
〜に代えて:instead
あいにく:unfortunately
とりわけ:especially
あり続ける:remain
いたかのように:as if
されたし:please
しかしながら，:however
したがって:therefore
したがって:thus
そのようなわけで:As such
すなわち:i.e.,
すなわち、:that is
するためには:in order to
であっても:even if
になる:becomes
加えて:in addition,
加えて:Additionally,
〜に加えて:in addition to〜
もっぱら:solely
良い:good
方が良い／より良く／より良い／もっと良い:better
他が〜されない限り unless otherwise 〜
他からは〜ない:otherwise
さもなければ:otherwise
他方:on the other hand,
多い:often
元々／元から:originally
代わりに:instead
例：:e.g.,
例:example
例えば:for example
一例として:for instance
きちんと〜され:well-〜ed
上手く:well
則って:according to 〜
則って:accordingly
則って:in accordance with
則って:in accordance to
様に／様な:like
の様な:-like
同様に:likewise
同様に:similarly
因り／因る／因っ:due to
場合によっては:possibly
少し／少しばかり:slightly
必要:need
必要に応じて:as necessary／needed／required
とは限らない:necessarily
必ずしも〜ない:necessarily
方法:how to
更なる:further
概ね:roughly
決して:never
特に:in particular
特に:particular
特に:particularly
言い回し:wording
言い換えれば:in other words
諸々の:miscellaneous
足る:sufficient
関わらず:regardless
にもかかわらず:despite
〜に関する:regarding／:with regards to
〜に関し:with respect to
概ね:roughly
たぶん:perhaps
おそらく:probably
諸々の:miscellaneous
あいにく:unfortunately
正確に:exactly
等しい:equal
等しく:equally
難しい／し難い:hard
困難:difficult
対照的に:in constrast
対照的に:by contrast
歓迎:welcome
指定通り:as specified:指定どおり
〜に利する:on behalf of 〜
する用意がある:willing to
するつもりはない:unwilling to／:not willing to

*/
