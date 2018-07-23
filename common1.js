'use strict';


/******** PAGE_DATA（付帯機能／メタデータ用） ********

予約済みメンバ（ # → 詳細は common0.js ）

options:
	各種オプション
original_id_map:
	訳文 id → 原文 id への対応付け（文字列データ
original_urls:
	原文URL複数分岐
trans_metadata:
	和訳メタデータ
spec_metadata:
	仕様メタデータ
ref_normative:
ref_informative:
	参照文献データ
ref_key_map:
ref_data:
	参照文献追加リンク用（ REF_DATA

link_map:#
words_table:#
words_table1:#



PAGE_DATA.options 予約済みメンバ

expanded:
	ページは展開状態で保存されている
spec_title:
	仕様の原文タイトル（未利用
trans_title:
	仕様の和訳タイトル（未利用
spec_status:
	ED, REC, LS, etc.
spec_date:
	原文更新日（ YYYY-MM-DD ）
trans_update:
	和訳更新日（ YYYY-MM-DD ）
source_checked
	最後に原文テキストと付き合わせた日付
original_url:
	原文 URL
main:
	'MAIN'
toc:
	目次 id
no_index:
	あるならば、用語索引なし
no_original_dfn:
	あるならば、どの dfn の id も原文にはない
fill_text_link: （選択子）
	要素内容の text を URL としてリンクを作成させる
ref_id_lowercase
	参照文献の id は小文字化する
ref_id_prefix
	参照文献の id 接頭辞（ 'biblio-' etc.
site_nav
	他の一覧へのナビゲーション用キーワードリスト
nav_prev／nav_next
	前／次のページへのリンク（ HTML 用
navs
	巡回用（ INDEX_KEYS

*/

/** 付帯機能 初期化／メタデータの拡充 */
new function(){
let options;

Util._COMP_.then(function(){

	PAGE_DATA.original_id_map = PAGE_DATA.original_id_map || '';

	options = PAGE_DATA.options;

	if(!options.expanded){
		Util.DEFERRED.unshift(addControls);
	}
	Util.DEFERRED.unshift(navToInit);

	if(!options.expanded){
		Util.DEFERRED.push(
			fillSiteNav, // サイトナビ
			fillTransMetadata, // 和訳メタデータ
			fillSpecMetadata, // 仕様メタデータ
			fillCopyright, // Copyright
			fillIndexes, // 巡回
			fillConformance, // 適合性
			initSideway, // 左端の帯
			addTopNav, // ページ先頭へのリンク
			Util.addAltRefs // 参照文献 和訳リンク
		);
	}

	Util.DEFERRED.push(initEvents);
	Util.DEFERRED.push(
		function(){Util.dfnInit();},
		function(){Util.ref_position.init();},
		function(){Util.toc_intersection_observer.restartObservation();},
		altLinkInit
	);

	defer0();
});


function defer0(){
	//TODO Util.defer()
	const d = Util.DEFERRED;
	const task = d.shift();
	if(!task) return;
	try {
		task();
	} catch(err){
		console.log(err);
	}
	if(d.length === 0) return;
	window.setTimeout(defer0, 10);//requestAnimationFrame
}

function initEvents(){
	document.body.addEventListener('click', onClick, false);
	document.body.addEventListener('dblclick', onDblClick, false);
	document.addEventListener('visibilitychange', onVisibilityChange, false);

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
		const handlers = Util.CLICK_HANDLERS;
		const target = event.target;
		var handler = handlers[target.id];
		if(handler){
			handler(event);
			return;
		}

		switch(event.detail){
		case 0:// IE11 event.detail == 0?
		case 1:
			for(let e = target; e; e = e.parentNode){
				switch(e.tagName){
				case 'BODY':
					// 両端 click でも原文開閉
					const e1 = document.elementFromPoint(
						window.innerWidth /2, event.clientY);
					if(e1){
						Util.toggleSource(e1);
					}
					break;
				case 'SECTION':
				case 'PRE':
				case 'DIV':
				case 'DL':
				case 'UL':
				case 'OL':
				case 'NAV':
					break;
				case 'A':
					if(e.href) break;
				default:
					var handler = handlers[e.tagName];
					if(handler){
						handler(e);
						return;
					}
					continue;
				}
				break;
				// consider to use Element.matches()/matchesSelector()
			}
			break;
		}
		// default
		Util.removeAdditionalNodes();
/*
		case 2:
			Util.toggleSource(target);
			break;
*/
	}
}


function navToInit(){
/** 内容生成後に素片識別子のアンカーへスクロールする */
	if( history.state ){
		return; // back/forward
	}

	let e;
	let id = window.location.hash;
	if(id){
		id = id.slice(1);
		if(id.indexOf('_xref-') === 0) return; // 生成リンク（ common1.js ）
		id = targetId1(id) || id;
		e = E(id);
	}
	if(!e){
		// 後から生成される内容（参照文献など）の id
		Util.DEFERRED.push(function(){
			if(id && E(id)){
				window.location.hash = id;
			}
		});
		return;
	}

// html.spec.whatwg.org/multipage/history.html#location-object-setter-navigate
	window.location.hash = e.id;
	if(! e.hasAttribute('tabIndex')){
		e.tabIndex = 0;
	}
	e.focus();

	history.replaceState( Util.page_state, '' );

	function targetId1(id){
		// 訳文id:原文id （先頭の \t も有効）
		id = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const rxp = new RegExp( '^\t?([^\\s:]+):' + id + '$', 'm' );
		const match = PAGE_DATA.original_id_map.match(rxp);
		if(!match) return;
		return match[1];
	}
}


// ボタン類
function addControls(){
	const controls = C('div');
	controls.id = '_view_control';

	add_button('　　目次　　', 'A', '_toggle_toc');
	if(!options.no_index){
		Util.indexInit()
		add_button('索引', 'S', '_toggle_index');
	}
	add_button('原文', 'Z', '_toggle_source');

	const e = E('_optional_controls');//TODO
	if(e){
		controls.appendChild(e);
	}

	document.body.appendChild(controls);

	function add_button(label, key, id){
		const b = C('input');
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

function addTopNav(){
	const a = C('a');
	a.href = '#top';
	a.style.cssText =
'position:fixed; left:0; bottom:0; height:5em; background:#EEE; text-align:center; width:1.5em;'
	a.textContent = '↑';
	document.body.appendChild(a);
}


// 付帯情報を生成する

function initSideway(){
	const key = options.spec_status;
	if(!key) return;

	const text = {
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

	const color = { ED: 'red', EDCG: 'orange', IETFPR: 'gray', LS: 'green' }[key];
	const div = C('div');
	div.id = '_sideways-logo';
	if(color) div.style.background = color;
	div.textContent = text;
	document.body.appendChild(div);
}

function fillSiteNav(){
	const nav = C('nav');

	const html = ['<ul id="_site_nav">'];
	let href;
	if(href = findMatch(options.nav_prev)){
		html.push(`<li><a href="${href}">＜前</a>`);
	}
	if(href = findMatch(options.nav_next)){
		html.push(`<li><a href="${href}">次＞</a>`);
	}
	const name_map = Util.get_mapping(`
infrastructure:基盤
svg:SVG
html:HTML
html-dom:HTML 要素
comms:メッセージ通信
browsers:ナビと閲覧
storage:ストレージ
uievents:イベント／UX
network:ネットワーク
http:HTTP
security:セキュリティ
performance:計時
graphics:グラフィックス
paint:画像-色-塗り
css:CSS
css-ux:CSS UX
css-anim:アニメーション
typeset:テキスト組版
layout:レイアウト一般
layouts:レイアウト個別
selector:選択子
xml:XML
`
	);
	const label_map = {
CSS: 'css,html',
HTML: 'html-dom,html,css',
WEBAPPSEC: 'security,network',
TIMING: 'performance,network',
PERFORMANCE: 'performance,network',
HTTP: 'http,network,security',
UIEVENTS: 'uievents,css-ux,html',
	};
	const href_map = {
http: 'RFC723X-ja.html#index',
	};
	let site_nav = options.site_nav;
	if(!site_nav){
		site_nav = options.page_state_key ? label_map[options.page_state_key] : '';
	}
	if(!site_nav) site_nav = 'infrastructure';
	site_nav.split(',').forEach(function(label){
		const name = name_map[label];
		if(!name) return;
		const href = href_map[label] || ('index.html#spec-list-' + label);
		html.push('<li><a href="' + href + '">' + name +'</a>');
	});
	html.push('<li><a href="index.html#page-list">すべて</a>')
	html.push('</ul>');
	nav.innerHTML = html.join('');
	document.body.insertBefore(nav, document.body.firstChild);

	function findMatch(name){
		if(!name) return;
		if(name.slice(-5) === '.html') return name;
		let data = COMMON_DATA.SYMBOLS;
		if(!data) return;
		let i = data.indexOf('\n' + name + ':' );
		if(i < 0) return;
		i += name.length + 2;
		const j = data.indexOf('\n', i);
		if(j < 0) return;
		data = data.slice(i,j);
		if(data.slice(-5) !== '.html') return;
		return data;
	}
}

function fillTransMetadata(){
	const details = E('_trans_metadata');
	if(!details) return;
	let html = PAGE_DATA.trans_metadata || '';
	delete PAGE_DATA.trans_metadata;
	if(options.trans_update){
		const summary = details.firstElementChild;
		if(summary){
			summary.insertAdjacentHTML( 'beforeend',
'（翻訳更新：<time>' + options.trans_update + '</time> ）'
			);
		}
	}

	if(html){
		const url = window.location.pathname.match(/[^\/]+$/);
		const mapping = {
THIS_PAGE: url?
'<a href="https://triple-underscore.github.io/' + url[0] + '">このページ</a>' : 'このページ',
SPEC_URL:
options.original_url || '',
PUB: options.trans_1st_pub ?
'（公開：<time>' + options.trans_1st_pub +'</time> ）' : '',
W3C:
'<a href="https://www.w3.org/">W3C</a>',
WHATWG:
'<a href="https://whatwg.org/">WHATWG</a>',
HTMLLS:
'https://html.spec.whatwg.org/multipage',
		};
		html = html.replace(/~(\w+)/g, function(match, key){
			return mapping[key] || '';
		});
	}

	html += `
<ul style="font-size:smaller;">
<li><strong>この翻訳の正確性は保証されません。</strong>
<li>【 と 】で括られた部分は<span class="trans-note">【訳者による注釈】</span>です。
<li><a href="index.html#functions">各ページに共通の機能</a>も参照されたし（左下隅の表示切替ボタンなど）。
<li>誤訳その他ご指摘／ご意見は<a href="https://triple-underscore.github.io/about.html">連絡先</a>まで。
</ul>
`;
	details.insertAdjacentHTML('beforeend', html);
}

function fillSpecMetadata(){
	const details = E('_spec_metadata');
	if(!details) return;
	let html;
	let data = PAGE_DATA.spec_metadata;
	delete PAGE_DATA.spec_metadata;
	if(!data) return;

	html = '<dl>';
	if(options.original_url){
		data = `
このバージョン（原文 URL ）
	${options.original_url}
${data}`
	}
	html += data
		.replace(/\n\S.+/g, '\n<dt>$&<dt>')
		.replace(/\n[ \t]+(https?:\S+)/g, '\n<dd><a href="$1">$1</a><dd>')
		.replace(/\n[ \t]+(.+)/g, '<dd>$1<dd>');
	html += '</dl>';

	details.insertAdjacentHTML('beforeend', html);
}

function fillCopyright(){
	const details = E('_copyright');
	if(!details) return;

	let info = options.copyright;
	if(!info) return;

	info = info.split(',');
	const year = info[0];
	const license = info[1];

	let html = `
<small>このページは、次による原文の許諾の下で翻訳されています：
<br><span lang="en-x-a0">
`;
	switch( license ){
	case 'whatwg':
		html += `
<a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>. Copyright © ${year} WHATWG (Apple, Google, Mozilla, Microsoft).`;
		break;
	case 'use':
	case 'permissive':
		html += `
<a href="http://www.w3.org/Consortium/Legal/ipr-notice#Copyright">Copyright</a> © ${year}
<a href="http://www.w3.org/"><abbr title="World Wide Web Consortium">W3C</abbr></a><sup>®</sup>
(<a href="http://www.csail.mit.edu/"><abbr title="Massachusetts Institute of Technology">MIT</abbr></a>,
<a href="http://www.ercim.eu/"><abbr title="European Research Consortium for Informatics and Mathematics">ERCIM</abbr></a>,
<a href="http://www.keio.ac.jp/">Keio</a>, <a href="http://ev.buaa.edu.cn/">Beihang</a>).
W3C <a href="http://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer">liability</a>,
<a href="http://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks">trademark</a> and`
		+ ( license === 'use' ?
'<a rel="license" href="https://www.w3.org/Consortium/Legal/copyright-documents">document use</a>' :
'<a rel="license" href="http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document">permissive document license</a>'
)
		+ `
rules apply.
</span></small>`;

/*
http://www.ercim.org/ と https://www.ercim.eu/ の違いは無視（ 1 箇所のみ）。
", All Rights Reserved" （数カ所）は省略。
rel="license" の有無は無視。
https と http の違いは無視。
*/

		break;
	}

	details.insertAdjacentHTML('beforeend', html);
}

function fillIndexes(){
	const details = E('_index');
	if(!details) return;
	if(details.open){
		fill_data();
	} else {
		details.addEventListener('toggle', fill_data, false);
	}

	function fill_data(){
		details.removeEventListener('toggle', fill_data, false);
		const html = ['<p>'];
		const selectors = Util.get_mapping(COMMON_DATA.INDEX_KEYS + (PAGE_DATA.navs || ''));
		let count = 0;
		for(let label in selectors){
			const selector = selectors[label]
			if(document.body.querySelector(selector)){
				html.push(
`<a id="_index-nav-${count++}" data-cycling="${selector}">${label}</a>`, '／'
				);
			}
		}
		if(count !== 0) {
			html[html.length - 1] =
'<small>（クリックで巡回）</small>';
		};
		if(!options.no_index){
			html.push(
' | <button id="_toggle_index">用語一覧</button>'
			);
		}
		if(E('references')){
			html.push(
' | <a href="#references">参照文献</a>'
			)
		}
			html.push( '</p>' );
		details.insertAdjacentHTML('beforeend', html.join('') );
	}
}

function fillConformance(){
	const links = {
w3c: '<a href="w3c-common-ja.html#conformance">W3C 日本語訳 共通ページ</a>',
css: '<a href="css-common-ja.html#conformance">CSS 日本語訳 共通ページ</a>',
	};
	const link = links[ (options.conformance ) || ''];
	if(!link) return;
	const sec = C('section');
	sec.id = 'conformance';
	sec.innerHTML = `
<h2 title="Conformance">適合性</h2>
<p class="trans-note">【この節の内容は${link}に委譲。】</p>
`;
	document.body.appendChild(sec);
}

/** 外部リンク日本語訳リンク追加 */
function altLinkInit(){
	const root = (options.main) ?
		E(options.main) :
		document.getElementsByTagName('main')[0];

	if(!root) return;
//	COMMON_DATA.JA_BASIS[''] = ''; //
	const ja_link = C('a');
	Util.ADDITIONAL_NODES.push(ja_link);
	ja_link.id = '_ja_link';
	ja_link.className = '_additional';
	ja_link.textContent = '【和訳】';

	root.addEventListener('mouseover', insert_ja_link, false);
	//focus does not bubble
	root.addEventListener('focus', insert_ja_link, true);

	function insert_ja_link(e){
		let a = e.target;
		if(a.tagName !== 'A'){
			a = a.parentNode;
			if(a.tagName !== 'A') return;
		}
		if(a.className === '_additional') return;

		const alt_url = altURL(a.getAttribute('href'));
		if(!alt_url) return;
		ja_link.href = alt_url;
		a.parentNode.insertBefore(ja_link, a.nextSibling);
	}

	function altURL(href){
		if(!href) return;
	//	if(href.indexOf(PAGE_DATA.options.original_url) === 0) return;
		href = href.match(/^https?:\/\/([^#]+)(#.*)?/);
		if(!href) return;
		const url = href[1];
		let alt_url = COMMON_DATA.JA_LINKS[url];
		if(alt_url === '') return; // 明示的な無効化
		if(alt_url){
			if(alt_url.charAt(0) === '@'){
				alt_url = COMMON_DATA.JA_REFS[alt_url.slice(1)] || '';
				if(!alt_url) return;
			}
		} else {
			// multi-page (HTML5, CSS2, SVG)
			const slash = url.lastIndexOf('/');
			if(slash < 0 ) return;
			alt_url = COMMON_DATA.JA_LINKS[url.slice(0, slash + 1)];
			if(!alt_url) return;
			alt_url += url.slice(slash + 1);
		}
		const hash = href[2] || '';
		return alt_url + hash;
	//	return COMMON_DATA.fillURL(alt_url) + (href[2] || '');
	}
}

}//new function

Util.removeAdditionalNodes = function(refresh){
	this.dfnHide(refresh);
	this.indexHide(refresh);
	this.ADDITIONAL_NODES.forEach(function(node){
		if(node.parentNode){
			node.parentNode.removeChild(node);
		}
	});
};



Util.CLICK_HANDLERS = {
//	_toggle_source:
//	_toggle_toc:
//	_view_control:
//	_toggle_index 用語索引 

//	_toggle_words
//	DFN, DT
//	H2, H3, H4, H5, H6
};
/** 原文表示切替 */
Util.CLICK_HANDLERS._toggle_source = function(){
	Util.switchView(function(){
		const on = document.body.classList.toggle('show-original');
		Util.setState('show_original', on);
	});
};
/** 目次表示切替 */
Util.CLICK_HANDLERS._toggle_toc = function(){
	Util.switchView(function(){
		const on = document.body.classList.toggle('side-menu');
		Util.ref_position.releaseAndFix()
		Util.setState('side_menu', on);
		Util.toc_intersection_observer.restartObservation();
	});
};
/** 全体表示 常時化切替 */
Util.CLICK_HANDLERS._view_control = function(event){
	const e = E('_view_control');
	if(event.target !== e) return;
	e.classList.toggle('_hoverd')
};

//	_toggle_index 用語索引 


/** 原文表示開閉（個別）*/
Util.toggleSource = function(target){
	if(target.lang === 'en') return;
	for(let e = target; e; e = e.parentNode){
		if(e.tagName === 'SECTION') return;
		const c = e.lastElementChild;
		if(c && c.lang === 'en'){
			e.classList.toggle('show-original');
			return;
		}
	}
};
	// click handler


/** 交差観測 
	目次内の現在表示中の節を強調
*/

Util.toc_intersection_observer = {
	observer: null,
	pending: -1,

	restartObservation: function(){
		if(!window.IntersectionObserver) return;
		if(this.pending >= 0) return;

		if(this.observer){
			this.observer.disconnect();
		}

		const that = this;
		const toc_id = PAGE_DATA.options.toc || '_toc';
		let first_time = true;

		this.pending = window.setTimeout(observe, 500);

		function observe(){
			that.pending = -1;
			let observer = that.observer;
			if(!observer){
				observer =
				that.observer = new IntersectionObserver(
					intersected, {
						rootMargin: '-80px 0px', // 0 でも px が要る（ Chrome
					}
				);
			}

			const visible = document.body.classList.contains('side-menu');
			if(!visible) return;
//			'#' + toc_main + ' section[id]'
			repeat('#' + toc_id + ' a[href]', function(e){
				const section = E(e.hash.slice(1));
				if(!section) return; // This should not happen
				observer.observe(section);
			});
		}

		function intersected(entries, observer){
			const nav = E(toc_id);
			entries.forEach(function(entry){
				if(first_time && !entry.isIntersecting) return;
				const id = entry.target.id;// section
				if(!id) return;
				const a = nav.querySelector('[href="#' + id + '"]');
				if(!a) return;
				a.classList.toggle('_intersecting', entry.isIntersecting);
			});
			first_time = false;
		}
	},
};


/** 索引機能 初期化*/
Util.indexInit = function(){

	let list = null;        // 文書順の索引項目（ DOM node ）リスト
	let sorted = true;      // true 字句順 / false 文書順
	let scroll_top = 0;     // 最後のスクロール位置
	const index_node = init(); // 索引コンテナ node

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
		const index_node = C('div');
		index_node.className = '_additional'; // for CSS
		index_node.id = '_index_table'; // for CSS ：子要素はすべて display:block
		index_node.appendChild(C('button'));// 表示順序 切替ボタン
		index_node.appendChild(C('div'));//一覧 Box
		return index_node;
	}

	function indexHide(refresh){
		if(!list) return;
		const parent = index_node.parentNode;
		const list_box = index_node.lastChild;
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
		const list_box = index_node.lastChild;

		if(!list || (sorted !== sort)) {
			list_box.textContent = '';
			if(!list) list = collect();
			let list1 = list;
			const button = index_node.firstChild;
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
		const list = [];
		repeat('main dfn[id], main dt[id]', add_item);
		return list;

		function add_item(dfn){
			const text = dfn.textContent.trim();
			if(!text) return;
			const id = dfn.id;
			const a = C('a');

			a.href = '#' + id;
			const e = dfn.firstElementChild;
			const childE = e
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
				const tag = dfn.parentNode.tagName;
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
		Util.toc_intersection_observer.restartObservation();
	}

	// スクロール位置を保存 -> callback -> 復帰
	const pos = this.ref_position.current(refresh);
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
		const H = window.innerHeight || 800;
		const W = (document.body.clientWidth || 800);
		let h = 999999, e = null;
		for(let y = 0; y < H ; y += H / 10 ){
			let x = W / 2 + W * (Math.random() - 0.5) * 0.7;
			const e1 = document.elementFromPoint(x, y);
		// offsetParent: body / display:none / position:fixed に対しては null
			if(!e1 || (e1 === e) || !e1.offsetParent) continue;
			const h1 = e1.offsetHeight;
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
		let e;
		if(pos.id){ //refreshed
			e = (pos.id && E(pos.id)) || document.body;
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
			const h = this.offsetY(e);
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
		let y = 0;
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
		const body = document.body;
		body.style.width = '';
		body.style.width = window.getComputedStyle(body).width;
	},

/** resize/zoom/orientationchange 時に
	基準位置へ復帰する／基準位置を更新するようにする

	課題: zoom 時に resize イベントが生じない場合がある
*/

	init: function(){
		const ref_position = this;
		let reflow_timer = 0;
		let pos = null;

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
	let dfnStart = null;
		// all the source anchors targeting to dfnStart in the document
	let dfnLinks = null;
		// links to dfnLinks
	let dfnIndecies = null;
	let dfnJumpCount = 0;
	let dfnIndex = -1;
//	let dfnTargetScrollPositionY = 0;

	const dfnPanel = C('div');
		dfnPanel.id = '_dfnPanel';
		dfnPanel.innerHTML =
'<div><input type="button" value="  ←  "><input type="button" value="  →  "><a></a><a class="_additional">(原文)</a></div><ul></ul>';
		// a link to dfnStart
	const dfnTarget = dfnPanel.firstElementChild.children[2];
		// link to the corresponding element in the original spec
	const dfnOriginal = dfnTarget.nextElementSibling;

	const original_id_map = Util.get_mapping(PAGE_DATA.original_id_map);
	var original_urls = null;
	if(PAGE_DATA.original_urls){
		// original_url の他に複数の原文 URL がある
		original_urls = Util.get_mapping(PAGE_DATA.original_urls);
	}

	new function(){

		let b = dfnTarget.previousElementSibling;
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
				const index = dfnLinks.length + 1;
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
			const hash = window.location.hash;
			const num = hash.match(/_xref-\d+-(\d+)/);
			if(!num) return;
			dfnJump0(parseInt(num[1], 10));
		}

		function navBy(d, event){
			const L = dfnLinks.length + 1;
			const index = (dfnIndex + d + L) % L;
			event.preventDefault();
			event.stopPropagation();
			dfnJump0(index);
			const ul = dfnPanel.lastElementChild;
			if(ul.scrollHeight <= ul.clientHeight) return;
			// auto scroll
			const emp = em_panel.current;
			if(!emp) return;
			const r1 = ul.getBoundingClientRect();
			const r2 = emp.getBoundingClientRect();
			if(r2.top < r1.top || r2.bottom > r1.bottom ){
				emp.scrollIntoView();
			}
		}
	}

	const em_external = Object.create(null);
	const em_panel = Object.create(null);
	em_external.emphasize = 
	em_panel.emphasize = 
	function(e){
		// emphasize only one of
		e = e || null;
		const e0 = this.current || null;
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

	const handlers = this.CLICK_HANDLERS;
	handlers.DT =
	handlers.DFN =
	handlers.A =
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
		if(!is_header && PAGE_DATA.options.no_original_dfn) return;
		let original_url; // 原文 URL
		if(original_urls){
			for(let e = E(id); e; e = e.parentNode){
				original_url = original_urls[e.id];
				if(original_url) break;
			}
		}
		original_url = original_url || PAGE_DATA.options.original_url;
		if(!original_url) return;

		dfnOriginal.href = original_url + '#' + (original_id_map[id] || id);
		dfnOriginal.style.display = '';
	}

	function originalURL(id){
		return PAGE_DATA.options.original_url;
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
		let a = dfnLinks[index];
		let emp;
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
		let id = dfn.id;
		const is_header = /^H\d$/.test(dfn.tagName);
		if(!id && is_header){
			id = dfn.parentNode.id;
		}
		if(!id) return;
		dfnStart = dfn;
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
		const L = dfnLinks.length;

		const ul = dfnPanel.lastElementChild;
		ul.textContent = '';
		ul.className = L ? '' : 'empty';

		let lastSection;
		let lastLi;
		let n;
		const prefix = '#_xref-' + (dfnJumpCount++) + '-';

		for(let i = 0; i < L; i++){
			const link = dfnLinks[i];
			let section = link.parentNode;
			while(section){
				if(section.tagName === 'SECTION' ||
					section.tagName === 'NAV' ) break;
				section = section.parentNode;
			}
			const a = C('a');
			if (section !== lastSection) {
				lastSection = section;
				const header = Util.get_header(section);
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
			const r = dfnPanel.getBoundingClientRect();
			const w = document.body.clientWidth; // exclude scroll bar
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



/* TODO
Util.contextMenuInit = function(){
	-> common-01.js
}
*/

/** 参照文献
• 外部リンク→ 日本語訳 データ構築
• 参照文献 HTML を生成
	<dt> に id を自動的に付与
• 日本語訳リンク追加： 末尾 <dd> に次を挿入
	<dd class="trans-ja-refs"><a href="リンク先">'日本語訳'[番号|注釈]?</a>...</dd>
	
*/


Util.addAltRefs = function(){

	const LABELS = {
		'主': '日本語訳',
		'副': '日本語訳',
		'版': '最新発行版',
		'編': '編集者草案'
	};

	const JA_REFS = COMMON_DATA.JA_REFS;
	const JA_LINKS = COMMON_DATA.JA_LINKS;
	const JA_BASIS = COMMON_DATA.JA_BASIS;
	const REF_DATA = (PAGE_DATA.ref_data || '') + COMMON_DATA.REF_DATA;
	const REF_KEY_MAP = Util.get_mapping(COMMON_DATA.REF_KEY_MAP + (PAGE_DATA.ref_key_map || ''));

	const ref_id_prefix = PAGE_DATA.options.ref_id_prefix || '';
	const ref_id_lowercase = PAGE_DATA.options.ref_id_lowercase || false;


	Util.get_mapping(
		COMMON_DATA.REF_DATA2
			.replace(/~(\w+)/g, function(s, s1){ return JA_BASIS[s1];})
			.replace(/● */g, ':https://'),
		JA_LINKS
	);

	const mapping = Object.create(null);
	const ref_node_list = ['normative', 'informative'].filter(collect_entries);

	let m;
	const rxp = /^(\w+)=(\S)(\d*)[\t ]+(~\w*)?([^\s●]+)(●.*)?$/mg;
	while(m = rxp.exec(REF_DATA)){
		const key = m[1];
		const mark = m[2];
		const label_index = m[3] || '';
		let prefix = m[4];
		const is_local = prefix === '~';
		const url0 = m[5];
		const label = ( m[6]? m[6].slice(1): LABELS[mark] ) + label_index;
		let url = url0;
		if(prefix){
			prefix = prefix.slice(1);
//			if(! prefix in JA_BASIS) throw prefix;
			url = JA_BASIS[prefix] + url0;
		}
		const url1 = ( url[0] === '＃' ) ?
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

	if(ref_node_list.length > 0){
		generateRefsHTML();
	}

	// 下位 directory への和訳リンク生成防止
	if(PAGE_DATA.options.original_url){
		COMMON_DATA.JA_LINKS[
			PAGE_DATA.options.original_url.replace(/^https?:\/\//,'')
		] = '';
	}

//	console.log(JSON.stringify(JA_LINKS));
	function refKey(s){
		const key = s.replace(/[^\w]/g, '').toUpperCase();
		return REF_KEY_MAP[key] || key;
	}

	function collect_entries(id){
		const ref_data = PAGE_DATA['ref_' + id];
		if(!ref_data) return false;
		ref_data.replace(/\n\[.+\]/g, function(ref_name){
			const key = refKey(ref_name);
			mapping[key] = '';
			return '';
		});
		return true;
	}

	function add_ref_link(key, url, label){
		const v = mapping[key];
		if(v === undefined) return;
		const html = '<a href="' + url + '">' + label + '</a>';
		mapping[key] += html;
	}

	function generateRefsHTML(){
		let refs = E('references');
		if(!refs){
			refs = C('section');
			refs.id = 'references';
			refs.insertAdjacentHTML('beforeend', '<h2>参照文献</h2>');
			document.body.appendChild(refs);
		}

		const html_data = {
normative: '<h3>文献（規範）</h3>',
informative: '<h3>文献（参考）</h3>'
		};

		ref_node_list.forEach(function(id){
			const ref_data = PAGE_DATA['ref_' + id];
			if(!ref_data) return;
			delete PAGE_DATA['ref_' + id];
			const section = C('section');
			section.id = id;
			section.innerHTML = [
				html_data[id],
				'<dl>',
				refHTML(ref_data),
				'</dl>'
			].join('\n');
			refs.appendChild(section);
		});

		function refHTML(data){
			let last_key = '';
			let html = data
			.replace(/\n\[(.+)\]/g, function(match, ref_name){
				const id = ref_id_prefix +
					(ref_id_lowercase ? ref_name.toLowerCase() : ref_name );
				const last_key1 = last_key;
				const key = refKey(ref_name);
				const altref = mapping[key];
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
			return html;
		}
	}
}

COMMON_DATA.INDEX_KEYS =`
見出し:h2,h3,h4,h5,h6
課題:.issue
注記:.note
例:.example
要素:.element-def
IDL:pre.idl
プロパティ:.propdef
記述子:.descdef
ABNF:pre.ABNF
`;

/** 文献 id = 英文 URL = 和訳 URL の対応データ

URL の先頭の文字 '＃' は http:// ／ 他は https://
*/

COMMON_DATA.JA_REFS = Object.create(null); // 文献 id -> 和訳 URL
COMMON_DATA.JA_LINKS = Object.create(null);// 英文 URL -> 文献 id

// 短縮形 URL の接頭辞 対応表
COMMON_DATA.JA_BASIS = {
	'' :       'triple-underscore.github.io',
	XML :      'triple-underscore.github.io/XML',
	mitsue:    'standards.mitsue.co.jp/resources/w3c/TR',
	momdo:     '＃momdo.s35.xrea.com/web-html-test/spec',
	momdoG:    'momdo.github.io',
	ipa:       'www.ipa.go.jp/security/rfc',
	adagio:    '＃www.y-adagio.com/public/standards',
	TR:        'www.w3.org/TR',
	CSSWG:     'drafts.csswg.org',
	HTMLLS:    'html.spec.whatwg.org/multipage',
	IETF:      'tools.ietf.org/html',
	HTTPWG:    'httpwg.org/specs',
	suika:     'wiki.suikawiki.org',
//	default:   ''
};

/*
主 副 版 編 ・
■ ■ ■ ■ 　 参照文献に追加する？
　 　 ■ ■ ■ 和訳リンク対応表に追加する？  JA_LINKS に (url:ref-id) を追加
■ 　 　 　 　 hover 時に表示する？       JA_REFS に  (ref-id:url) を追加
*/

COMMON_DATA.REF_DATA = `
ARIA=主               ~momdoG/wai-aria-1.1/
ARIA=・               w3c.github.io/aria/
ARIAHTML=主           ~momdoG/html-aria/
ARIAHTML=・           w3c.github.io/html-aria/
ATOM=主               ＃momdo.s35.xrea.com/web-html-test/spec/rfc4287j.html
ATOM=副               ＃www.futomi.com/lecture/japanese/rfc4287.html
COMPOSITING1=主       ~/compositing-ja.html
COMPOSITING1=版       ~TR/compositing-1/
COMPOSITING1=編       dev.w3.org/fxtf/compositing-1/
CORS=副               ~/Fetch-ja.html●Fetch 日本語訳
CSP3=主               ~/CSP3-ja.html
CSP3=副2              hashedhyphen.github.io/webappsec-specjp/csp/index.html
CSP3=編               w3c.github.io/webappsec-csp/
CSP2=主               ~/CSP-ja.html
CSP2=版               ~TR/CSP2/
CSP2=編               w3c.github.io/webappsec/specs/content-security-policy/
CSP1=主               ~/CSP10-ja.html
CSP1=版               ~TR/CSP/
CSS1=主               ＃www.doraneko.org/webauth/css1/19961217/Overview.html
	CSS1=＊               ~TR/REC-CSS1
CSS21=主              ~momdoG/css2/Overview.html
CSS21=副2             ＃hp.vector.co.jp/authors/VA022006/css/index.html
CSS21=副              ~adagio/tr_css2/toc.html●2.0 日本語訳 2
CSS21=版              ~TR/CSS2/
CSS21=編              ~CSSWG/css2/
CSSALIGN=主           ~/css-align-ja.html
CSSALIGN=版           ~TR/css-align-3/
CSSALIGN=編           ~CSSWG/css-align-3/
CSSALIGN=・           ~CSSWG/css-align/
CSSANIMATIONS1=版     ~TR/css3-animations/
CSSANIMATIONS1=主     ~/css-animations-ja.html
CSSANIMATIONS1=編     ~CSSWG/css-animations-1/
CSSANIMATIONS1=・     ~CSSWG/css-animations/
CSSBACKGROUNDS3=主    ~/css-backgrounds-ja.html
CSSBACKGROUNDS3=副2   ~mitsue/css3-background/
CSSBACKGROUNDS3=版    ~TR/css3-background/
CSSBACKGROUNDS3=編    ~CSSWG/css-backgrounds-3/
CSSBACKGROUNDS3=・    ~CSSWG/css3-background/
CSSBREAK3=主          ~/css-break-ja.html
CSSBREAK3=版          ~TR/css-break-3/
CSSBREAK3=編          ~CSSWG/css-break-3/
CSSBREAK3=・          ~CSSWG/css-break/
CSSCASCADE=主         ~/css-cascade-ja.html
CSSCASCADE=版         ~TR/css-cascade-3/
CSSCASCADE=編         ~CSSWG/css-cascade-4/
CSSCASCADE=・         ~TR/css3-cascade/
CSSCASCADE=・         ~TR/css-cascade-4/
CSSCASCADE=・         ~CSSWG/css-cascade-3/
	CSSCASCADE3=・         ~CSSWG/css-cascade/
CSSCOLOR=主           ~/css-color-ja.html
CSSCOLOR=編           ~CSSWG/css-color/
CSS3COLOR=主          ~mitsue/css3-color/
CSS3COLOR=副          ~/css-color-ja.html●Level 4 日本語訳
CSS3COLOR=版          ~TR/css3-color/
CSSCOUNTERSTYLES=主   ~/css-counter-styles-ja.html
CSSCOUNTERSTYLES=編   ~CSSWG/css-counter-styles/
CSSCOUNTERSTYLES=版   ~TR/css-counter-styles-3/
CSS3COLOR=編          ~CSSWG/css-color-3/
CSSCONDITIONAL=主     ~/css-conditional-ja.html
CSSCONDITIONAL=版     ~TR/css3-conditional/
CSSCONDITIONAL=・     ~TR/css-conditional/
CSSCONDITIONAL=編     ~CSSWG/css-conditional-3/
CSSCONDITIONAL=・     ~CSSWG/css-conditional/
CSSCONTAIN1=主        ~/css-contain-ja.html
CSSCONTAIN1=版        ~TR/css-contain-1/
CSSCONTAIN1=編        ~CSSWG/css-contain-1/
CSSDEVICEADAPT=主     ~momdoG/css-device-adapt-1/
CSSDEVICEADAPT=版     ~TR/css-device-adapt-1/
CSSDEVICEADAPT=編     ~CSSWG/css-device-adapt/
CSSDEVICEADAPT=・     ~TR/css-device-adapt/
CSSDEVICEADAPT=・     ~CSSWG/css-device-adapt-1/
CSSDISPLAY=主         ~/css-display-ja.html
CSSDISPLAY=版         ~TR/css-display-3/
CSSDISPLAY=編         ~CSSWG/css-display-3/
CSSDISPLAY=・         ~CSSWG/css-display/
CSSDISPLAY=・         ~TR/css-display/
CSSEXCLUSIONS=主      ~/css-exclusions-ja.html
CSSEXCLUSIONS=版      ~TR/css3-exclusions/
CSSEXCLUSIONS=編      ~CSSWG/css-exclusions/
CSSFLEX=主            ~/css-flexbox-ja.html
CSSFLEX=版            ~TR/css-flexbox-1/
CSSFLEX=・            ~TR/css3-flexbox/
CSSFLEX=編            ~CSSWG/css-flexbox-1/
CSSFONTS3=主          ~/css-fonts-ja.html
CSSFONTS3=版          ~TR/css3-fonts/
CSSFONTS3=・          ~TR/css-fonts-3/
CSSFONTS3=編          ~CSSWG/css-fonts-3/
CSSFONTS3=・          ~CSSWG/css-fonts/
CSSFONTLOAD=主        ~/css-font-loading-ja.html
CSSFONTLOAD=版        ~TR/css-font-loading/
CSSFONTLOAD=編        ~CSSWG/css-font-loading/
CSSGRID=主            ~/css-grid-ja.html
CSSGRID=版            ~TR/css-grid-1/
CSSGRID=編            ~CSSWG/css-grid-1/
CSSINLINE=主          ~/css-inline-ja.html
CSSINLINE=版          ~TR/css-inline/
CSSINLINE=編          ~CSSWG/css-inline/
CSSIMAGES3=主         ~/css-images-ja.html
CSSIMAGES3=副         ~momdo/CR-css3-images-20120417.html
CSSIMAGES3=版         ~TR/css3-images/
CSSIMAGES3=編         ~CSSWG/css-images-3/
CSSLOGICAL=主         ~/css-logical-ja.html
CSSLOGICAL=編         ~CSSWG/css-logical/
CSSMASKING=主         ~/css-masking-ja.html
CSSMASKING=編         ~CSSWG/css-masking-1/
CSSMASKING=版         ~TR/css-masking-1/
CSSMULTICOL=主        ~/css-multicol-ja.html
CSSMULTICOL=編        ~CSSWG/css-multicol-1/
CSSMULTICOL=版        ~TR/css-multicol-1/
CSSMULTICOL=・        ~TR/css3-multicol/
CSSNAMESPACES=主      ~/css-namespaces-ja.html
CSSNAMESPACES=副2     ~mitsue/css3-namespace/
CSSNAMESPACES=副3     ~momdo/REC-css-namespaces-3-20140320.html
CSSNAMESPACES=版      ~TR/css3-namespace/
CSSNAMESPACES=編      ~CSSWG/css3-namespace/
CSSOVERFLOW=主        ~/css-overflow3-ja.html
CSSOVERFLOW=版        ~TR/css-overflow-3/
CSSOVERFLOW=編        ~CSSWG/css-overflow/
CSSPAGE3=主            ~/css-page-ja.html
CSSPAGE3=版            ~TR/css3-page/
CSSPAGE3=編            ~CSSWG/css-page/
CSSPAGE3=・            ~CSSWG/css-page-3/
CSSPOSITION=編        ~CSSWG/css-position/
CSSPOSITION=版        ~TR/css3-positioning/
CSSRUBY1=主          ~/css-ruby-ja.html
CSSRUBY1=版          ~TR/css-ruby-1/
CSSRUBY1=編          ~CSSWG/css-ruby-1/
CSSSHAPES1=主          ~/css-shapes-ja.html
CSSSHAPES1=版          ~TR/css-shapes-1/
CSSSHAPES1=編          ~CSSWG/css-shapes-1/
CSSSIZING=主          ~/css-sizing-ja.html
CSSSIZING=版          ~TR/css-sizing/
CSSSIZING=編          ~CSSWG/css-sizing/
CSSSIZING=・          ~CSSWG/css-sizing-3/
	CSS3SPEECH=主         ~/css-speech-ja.html
	CSS3SPEECH=版         ~TR/css3-speech/
CSSOM=主              ~/cssom-ja.html
CSSOM=版              ~TR/cssom/
CSSOM=編              ~CSSWG/cssom/
CSSOMVIEW=主          ~/cssom-view-ja.html
CSSOMVIEW=版          ~TR/cssom-view/
CSSOMVIEW=編          ~CSSWG/cssom-view/
CSSPSEUDO4=主         ~/css-pseudo-ja.html
CSSSCOPING1=主        ~/css-scoping-ja.html
CSSSTYLEATTR=主       ~/css-style-attr-ja.html
CSSSTYLEATTR=副2      ~mitsue/css-style-attr/
CSSSTYLEATTR=版       ~TR/css-style-attr/
CSSSYNTAX=・          ~CSSWG/css-syntax/
CSSSYNTAX=主          ~/css-syntax-ja.html
CSSSYNTAX=版          ~TR/css3-syntax/
CSSSYNTAX=編          ~CSSWG/css-syntax-3/
CSSSYNTAX=・          ~TR/css-syntax-3/
CSS3TEXT=主           ~/css-text-ja.html
	CSS3TEXT=主           suzukima.github.io/css-ja/css3-text/
CSS3TEXT=編           ~CSSWG/css-text-3/
CSS3TEXT=版           ~TR/css-text-3/
CSS3TEXTDECOR=主      ~/css-text-decor-ja.html
CSS3TEXTDECOR=副2     ~momdoG/css-text-decor-3/
CSS3TEXTDECOR=編      ~CSSWG/css-text-decor-3/
CSS3TEXTDECOR=版      ~TR/css-text-decor-3/
CSSTIMING=主          ~/css-timing-ja.html
CSSTIMING=編          ~CSSWG/css-timing/
CSSTRANSFORMS1=・     ~CSSWG/css-transforms/
CSSTRANSFORMS1=主     ~/css-transforms-ja.html
CSSTRANSFORMS1=副     ~/css-transforms2-ja.html●Level 2 日本語訳
CSSTRANSFORMS1=版     ~TR/css3-transforms/
CSSTRANSFORMS1=編     ~CSSWG/css-transforms-1/
CSSTRANSFORMS1=・     ~CSSWG/css-transforms/
CSSTRANSITIONS1=・    ~CSSWG/css3-transitions/
CSSTRANSITIONS1=主    ~/css-transitions-ja.html
CSSTRANSITIONS1=版    ~TR/css3-transitions/
CSSTRANSITIONS1=編    ~CSSWG/css-transitions/
CSSUI4=主             ~/css-ui-ja.html
CSSUI4=版             ~TR/css-ui-4/
CSSUI4=編             ~CSSWG/css-ui-4/
CSSUI3=主             ~/css-ui-ja.html●Level 4 日本語訳
CSSUI3=副             ~momdoG/css-ui/
CSSUI3=版             ~TR/css-ui-3/
CSSUI3=・             ~TR/css3-ui/
CSSUI3=編             ~CSSWG/css-ui-3/
CSSVALUES4=主         ~/css-values-ja.html
CSSVAL=主             ~/css-values-ja.html●Level 4 日本語訳
CSSVAL=副2            ~momdoG/css3-values/
CSSVAL=版             ~TR/css3-values/
CSSVAL=・             ~TR/css-values/
CSSVAL=編             ~CSSWG/css-values/
CSSVAL=・             ~CSSWG/css-values-3/
	CSSVAL=・            ~CSSWG/css-values/
CSSVARIABLES=主       ~/css-variables-ja.html
CSSVARIABLES=編       ~CSSWG/css-variables/
CSSVARIABLES=版       ~TR/css-variables-1/
CSSWILLCHANGE1=主     ~/css-will-change-ja.html
CSSWILLCHANGE1=版     ~TR/css-will-change-1/
CSSWRITINGMODES=・    ~CSSWG/css-writing-modes/
CSSWRITINGMODES=主    ~/css-writing-modes-ja.html
CSSWRITINGMODES=副2   ＃suzukima.github.io/css-ja/css3-writing-modes/
CSSWRITINGMODES=版    ~TR/css-writing-modes-3/
CSSWRITINGMODES=編    ~CSSWG/css-writing-modes-3/●編（Level 3）
CSSWRITINGMODES=編    ~CSSWG/css-writing-modes-4/
MQ4=主                ~/mediaqueries4-ja.html
MQ4=編                ~CSSWG/mediaqueries-4/
MQ4=版                ~TR/mediaqueries-4/
FILTEREFFECTS1=主     ~/filter-effects-ja.html
FILTEREFFECTS1=編     drafts.fxtf.org/filter-effects-1/
FILTEREFFECTS1=版     ~TR/filter-effects-1/
MEDIAQ=主             ~mitsue/css3-mediaqueries/
MEDIAQ=副             ~/mediaqueries4-ja.html●Level 4 日本語訳
MEDIAQ=副             ＃www.asahi-net.or.jp/~ax2s-kmtn/internet/css/REC-css3-mediaqueries-20120619.html
MEDIAQ=版             ~TR/css3-mediaqueries/
MEDIAFRAG=主          ＃www.asahi-net.or.jp/~ax2s-kmtn/internet/media/REC-media-frags-10-20120925.html
MEDIAFRAG=版          ~TR/media-frags/
COMPAT=主             ~/compat-ja.html
DOM=主                ~/DOM4-ja.html
DOM=編                dom.spec.whatwg.org/●LS
DOM=版                ~TR/dom/●W3C版
DOM=・                ~TR/domcore/
DOMPARSING=主         ~/DOM-Parsing-ja.html
DOMPARSING=編         w3c.github.io/DOM-Parsing/
DOMPARSING=版         ~TR/DOM-Parsing/
DOMLEVEL2STYLE=主     ~adagio/tr_dom2_style/expanded-toc.html
ECMASCRIPT=主         ＃tsofthome.appspot.com/ecmascript.html●第五版 訳
ENCODING=主           ~/Encoding-ja.html
ENCODING=・           encoding.spec.whatwg.org/
FETCH=主              ~/Fetch-ja.html
FETCH=・              fetch.spec.whatwg.org/
FILEAPI=主            ~/File_API-ja.html
FILEAPI=版            ~TR/FileAPI/
FILEAPI=編            w3c.github.io/FileAPI/
FILEAPI=・            dev.w3.org/2006/webapi/FileAPI/
FULLSCREEN=主         ~/fullscreen-ja.html
FULLSCREEN=・         fullscreen.spec.whatwg.org/
NOTIFICATIONS=主      ~/notifications-ja.html
NOTIFICATIONS=・      notifications.spec.whatwg.org/
GEOMETRY1=主          ~/geometry-ja.html
GEOLOCATIONAPI=主     ＃www.asahi-net.or.jp/~ax2s-kmtn/internet/geo/REC-geolocation-API-20161108.html
GEOLOCATIONAPI=版     ~TR/geolocation-API/
HTML=副               ~/index.html#spec-list-html●日本語訳(このサイト, WHATWG 版)
HTML=副               ~momdoG/html/●日本語(部分)訳(WHATWG 版)
HTML=副               ~momdoG/html/dev/●日本語訳( Web 開発者向け)
	HTML=・               ~TR/html/●W3C
	HTML=・               html.spec.whatwg.org/multipage/●LS
HTMLMICRODATA=主      ~momdoG/html/microdata.html
HTMLMICRODATA=・      ~HTMLLS/microdata.html
HTMLIANA=主           ~momdoG/html/iana.html
HTMLIANA=・           ~HTMLLS/iana.html
HTML401=主            ＃www.asahi-net.or.jp/~sd5a-ucd/rec-html401j/cover.html
INDEXEDDB=主          ~/IndexedDB-ja.html
INDEXEDDB=版          ~TR/IndexedDB/
INDEXEDDB=編          w3c.github.io/IndexedDB/
JLREQ=主              ~TR/jlreq/ja/
JLREQ=副              w3c.github.io/jlreq/ja/●日本語訳(編集者草案)
JLREQ=編              w3c.github.io/jlreq/
INFRA=主              ~/infra-ja.html
MIX=主                ~/webappsec-mixed-content-ja.html
MIX=版                ~TR/mixed-content/
MIX=編                w3c.github.io/webappsec-mixed-content/
HRTIME2=主            ~/hr-time-ja.html
HRTIME2=版            ~TR/hr-time-2/
HRTIME2=編            w3c.github.io/hr-time/
NAVIGATIONTIMING2=主  ~/navigation-timing-ja.html
NAVIGATIONTIMING2=版  ~TR/navigation-timing-2/
NETSCAPE=主           ＃www.futomi.com/lecture/cookie/specification.html
PAGEVISIBILITY=主     ~/page-visibility-ja.html
PAGEVISIBILITY=版     ~TR/page-visibility-2/
	PAGEVISIBILITY=・     ~TR/page-visibility/
PERFORMANCETIMELINE2=主    ~/performance-timeline-ja.html
PERFORMANCETIMELINE2=版    ~TR/performance-timeline-2/
PERFORMANCETIMELINE2=編    w3c.github.io/performance-timeline/
USERTIMING2=主        ~/user-timing-ja.html
USERTIMING2=版        ~TR/user-timing-2/
RESOURCETIMING=主     ~/resource-timing-ja.html
RESOURCETIMING=版     ~TR/resource-timing/
RESOURCETIMING=編     w3c.github.io/resource-timing/
BEACON=主             ~/beacon-ja.html
BEACON=版             ~TR/beacon/
RESOURCEHINTS=主      ~/resource-hints-ja.html
REFERRERPOLICY=主     ~/webappsec-referrer-policy-ja.html
PERMISSIONS=主        ~/webappsec-permissions-ja.html
RFC1034=主            ＃srgia.com/docs/rfc1034j.html
RFC1123=主            ＃hp.vector.co.jp/authors/VA002682/rfc1123j.htm
RFC1123=副2           ＃www2s.biglobe.ne.jp/~hig/tcpip/HostReq_Appl.html
RFC1630=主            ＃srgia.com/docs/rfc1630j.html
RFC1928=主            ＃srgia.com/docs/rfc1928j.html
RFC2046=主            ＃www.t-net.ne.jp/~cyfis/rfc/mime/rfc2046_ja-1.html
RFC2046=副            ~adagio/tr_mime-p2_2046/toc.htm
RFC2119=主            ＃www.cam.hi-ho.ne.jp/mendoxi/rfc/rfc2119j.html
RFC2119=副2           ＃www.asahi-net.or.jp/~sd5a-ucd/rfc-j/rfc-2119j.html
RFC2119=副3           ＃www.t-net.ne.jp/~cyfis/rfc/format/rfc2119_ja.html
RFC2119=副4           ~ipa/RFC2119JA.html
RFC2397=・            ~IETF/rfc2397
RFC2397=主            ＃d.hatena.ne.jp/tily/20071103/p1
HTTP=主               ~/RFC723X-ja.html
HTTP=副2              ~suika/n/HTTP%2F1.1
RFC2616=主            ~/RFC2616-ja.html
RFC2616=副            ~/RFC723X-ja.html
RFC2616=・            ~IETF/rfc2616
RFC2616=・            www.ietf.org/rfc/rfc2616.txt
RFC2616=副2           ~suika/n/RFC%202616
RFC2616=・            www.w3.org/Protocols/rfc2616/rfc2616-sec8.html
RFC2616=・            www.w3.org/Protocols/rfc2616/rfc2616-sec13.html
RFC2817=副            ~ipa/RFC2817JA.html
RFC2817=・            ~IETF/rfc2817
RFC2818=主            ~suika/n/RFC%202818
RFC2818=副2           ~ipa/RFC2818JA.html
RFC2818=・            www.ietf.org/rfc/rfc2818.txt
RFC2818=・            ~IETF/rfc2818
RFC3174=主            ~ipa/RFC3174JA.html
RFC3174=副2           ＃www7b.biglobe.ne.jp/~k-west/SSLandTLS/rfc3174-Ja.txt
RFC3490=主            ＃www.jdna.jp/survey/rfc/rfc3490j.html
RFC3629=主            ＃www5d.biglobe.ne.jp/~stssk/rfc/rfc3629j.html
RFC3629=副2           ＃www.akanko.net/marimo/data/rfc/rfc3629-jp.txt
RFC3986=主            ~/RFC3986-ja.html
RFC3986=・            ~IETF/rfc3986
RFC3986=・            www.ietf.org/rfc/rfc3986.txt
RFC3987=主            ~suika/n/RFC%203987
RFC4086=主            ~ipa/RFC4086JA.html
RFC4122=主            ＃rui86.hatenablog.jp/entry/2013/07/18/065147
RFC4270=主            ~ipa/RFC4270JA.html
RFC4291=主            ＃srgia.com/docs/rfc4291j.html
RFC4648=主            ＃www5d.biglobe.ne.jp/~stssk/rfc/rfc4648j.html
RFC5234=主            ＃www.cam.hi-ho.ne.jp/mendoxi/rfc/rfc5234j.html
RFC5246=主            ~ipa/RFC5246-00JA.html
RFC5321=主            ＃www.hde.co.jp/rfc/rfc5321_ja.txt
RFC5322=主            ＃srgia.com/docs/rfc5322j.html
RFC5322=副2           ＃www.hde.co.jp/rfc/rfc5322_ja.txt
RFC5890=主            jprs.co.jp/idn/rfc5890j.txt
RFC5891=主            jprs.co.jp/idn/rfc5891j.txt
RFC5895=主            jprs.co.jp/idn/rfc5895j.txt
RFC6066=主            ~ipa/RFC6066JA.html
RFC6265=主            ~/RFC6265-ja.html
RFC6265=・            ~IETF/rfc6265
RFC6454=主            ~/RFC6454-ja.html
RFC6454=副2           ~ipa/RFC6454JA.html
RFC6454=・            ~IETF/rfc6454
RFC6455=主            ~/RFC6455-ja.html
RFC6901=主            ~/RFC6901-ja.html
RFC6902=主            ~/RFC6902-ja.html
RFC6919=主            ＃www.geocities.jp/toyprog/rfc/rfc6919.txt
RFC6919=・            ~IETF/rfc6919
RFC7230=主            ~/RFC7230-ja.html
RFC7230=・            ~IETF/rfc7230
RFC7230=・            ~HTTPWG/rfc7230.html
RFC7231=主            ~/RFC7231-ja.html
RFC7231=・            ~IETF/rfc7231
RFC7231=・            ~HTTPWG/rfc7231.html
RFC7232=主            ~/RFC7232-ja.html
RFC7232=・            ~IETF/rfc7232
RFC7232=・            ~HTTPWG/rfc7232.html
RFC7233=主            ~/RFC7233-ja.html
RFC7233=・            ~IETF/rfc7233
RFC7233=・            ~HTTPWG/rfc7233.html
RFC7234=主            ~/RFC7234-ja.html
RFC7234=・            ~IETF/rfc7234
RFC7234=・            ~HTTPWG/rfc7234.html
RFC7235=主            ~/RFC7235-ja.html
RFC7235=・            ~IETF/rfc7235
RFC7235=・            ~HTTPWG/rfc7235.html
RFC7301=主            github.com/ami-GS/ALPN-spec-jp/blob/master/spec.md
SELECT=主             ~mitsue/css3-selectors/
SELECT=副2            ＃zng.info/specs/css3-selectors.html
SELECT=副3            ~/selectors4-ja.html●Level 4 日本語訳
SELECT=版             ~TR/css3-selectors/
SELECT=編             ~CSSWG/selectors-3/
SELECT=・             ~TR/selectors/
SELECTORS=・          ~CSSWG/selectors/
SELECTORS=主          ~/selectors4-ja.html
SELECTORS=副2         ~mitsue/css3-selectors/●Level 3 日本語訳
SELECTORS=版          ~TR/selectors4/
SELECTORS=編          ~CSSWG/selectors4/
SELECTORSAPI=主       ~mitsue/selectors-api/●Level 1 日本語訳
SECURECONTEXTS=主     ~/webappsec-secure-contexts-ja.html
SECURECONTEXTS=副     hashedhyphen.github.io/webappsec-specjp/secure-contexts/index.html
SECURECONTEXTS=版     ~TR/secure-contexts/
SECURECONTEXTS=編     w3c.github.io/webappsec-secure-contexts/
SRI=主                ~/webappsec-subresource-integrity-ja.html
SRI=版                www.w3.org/TR/SRI/
SRI=編                w3c.github.io/webappsec-subresource-integrity/
UPGRADEINSECUREREQUESTS=主 ~/webappsec-upgrade-insecure-requests-ja.html
UPGRADEINSECUREREQUESTS=版 ~TR/upgrade-insecure-requests/
UPGRADEINSECUREREQUESTS=編 w3c.github.io/webappsec-upgrade-insecure-requests/
SSML=主               ＃www.asahi-net.or.jp/~ax2s-kmtn/ref/accessibility/REC-speech-synthesis11-20100907.html
SSML=・               ~TR/speech-synthesis11/
STREAMS=主            ~/Streams-ja.html
STREAMS=・            streams.spec.whatwg.org/
STREAMS=・            github.com/whatwg/streams
SVG2=副               triple-underscore.github.io/SVG11/●Version 1 日本語訳
SVG=主                triple-underscore.github.io/SVG11/
TOUCHEVENTS=主        ~/touch-events-ja.html
URL=主                ~/URL-ja.html
URL=編                url.spec.whatwg.org/●LS
UIEVENTS=主           ~/uievents-ja.html
UIEVENTS=版           ~TR/uievents/
UIEVENTS=編           w3c.github.io/uievents/
WCAG20=主             ＃waic.jp/docs/WCAG20/Overview.html
WCAG20=・             ~TR/WCAG20/
WEBIDL=主             ~/WebIDL-ja.html
WEBIDL=版             ~TR/WebIDL-1/
WEBIDL=編             heycam.github.io/webidl/
WEBIDL=・             ~TR/WebIDL/
WEBSOCKETS=主         ~/WebSocket-ja.html
WEBSOCKETS=版         www.w3.org/TR/websockets/
WEBSOCKETS=編         w3c.github.io/websockets/
WEBSTORAGE=主         ~/WebStorage-ja.html
WEBSTORAGE=版         ~TR/webstorage/
WEBSTORAGE=編         ~HTMLLS/webstorage.html●WHATWG版
WORKERS=・            ~HTMLLS/workers.html
WORKERS=主            ~/Workers-ja.html
WORKERS=版            ~TR/workers/
WORKERS=編            w3c.github.io/workers/
WORKLETS1=主          ~/worklets-ja.html
WORKLETS1=版          ~TR/worklets-1/
WORKLETS1=編          drafts.css-houdini.org/worklets/
XHR=・                xhr.spec.whatwg.org/
XHR=主                ~/XHR-ja.html
XML11=主              ＃w4ard.eplusx.net/translation/W3C/REC-xml11-20060816/
XML=主                ＃w4ard.eplusx.net/translation/W3C/REC-xml-20081126/
XML=・                ~TR/xml/
XMLNS=主              ~/xml-names-ja.html
XMLNS=・              ~TR/xml-names/
XMLSS=主              ~/xml-stylesheet-ja.html
XMLSS=・              ~TR/xml-stylesheet/
XSLT=主               ~adagio/tr_xslt10/toc.htm
XSLT=副2              ~XML/xslt10-ja.html
PROMISES=主           ~/promises-guide-ja.html
PROMISES=・           www.w3.org/2001/tag/doc/promises-guide
PRELOAD=主            ~/preload-ja.html
`;

/* 廃
CSS21=副              www.swlab.it.okayama-u.ac.jp/man/rec-css2/cover.html●2.0 日本語訳

*/

COMMON_DATA.REF_DATA2 = `
~TR/CSS22/●       ~momdoG/css2/
~TR/CSS21/●       ~momdoG/css2/
~TR/CSS2/●        ~momdoG/css2/
~CSSWG/css2/●     ~momdoG/css2/
~CSSWG/css21/●    ~momdoG/css2/
~TR/SVG/●         triple-underscore.github.io/SVG11/
~TR/SVG11/●       triple-underscore.github.io/SVG11/
	~HTMLLS/●          ~momdoG/html/
`;


// 文献 id 別名 -> 文献 id
COMMON_DATA.REF_KEY_MAP = `
DOM4:DOM
DOMLS:DOM
WHATWGDOM:DOM
WHATWGENCODING:ENCODING
WHATWGURL:URL
HTML51:HTML
WEBIDL2:WEBIDL
DOMCORE:DOM
CSP:CSP3
CSS2:CSS21
CSS22:CSS21
COMPOSITING:COMPOSITING1
CSSALIGN3:CSSALIGN
CSS3ANIMATIONS:CSSANIMATIONS1
CSS3BREAK:CSSBREAK3
CSS3CASCADE:CSSCASCADE
CSSCASCADE3:CSSCASCADE
CSSCASCADE4:CSSCASCADE
	CSS3PAGE:CSSCASCADE
CSS3SYN:CSSSYNTAX
CSSSYNTAX3:CSSSYNTAX
CSS3FLEXBOX:CSSFLEX
CSSFLEXBOX1:CSSFLEX
CSSMASKING1:CSSMASKING
CSSMULTICOL1:CSSMULTICOL
CSS3COL:CSSMULTICOL
CSS3MULTICOL:CSSMULTICOL
CSSCOLOR3:CSS3COLOR
CSSCOLOR4:CSSCOLOR
CSSCOUNTERSTYLES3:CSSCOUNTERSTYLES
CSSGRID1:CSSGRID
CSS3GRIDLAYOUT:CSSGRID
CSSINLINE3:CSSINLINE
CSS3CONDITIONAL:CSSCONDITIONAL
CSSCONDITIONAL3:CSSCONDITIONAL
CSS3EXCLUSIONS:CSSEXCLUSIONS
CSS3FONTS:CSSFONTS3
CSS3FONT:CSS3FONTS
CSSPAGE:CSSPAGE3
CSS3PAGE:CSSPAGE3
CSSSHAPES:CSSSHAPES1
CSSRUBY:CSSRUBY1
CSS3RUBY:CSSRUBY1
CSSTEXT3:CSS3TEXT
CSSTEXT:CSS3TEXT
CSSTIMING1:CSSTIMING
CSSVARIABLES1:CSSVARIABLES
CSSOM1:CSSOM
CSSOMVIEW1:CSSOMVIEW
CSSOVERFLOW3:CSSOVERFLOW
CSSPOSITION3:CSSPOSITION
CSS3IMAGES:CSSIMAGES3
CSSSIZING3:CSSSIZING
CSSSIZING4:CSSSIZING
CSS3SIZING:CSSSIZING
CSS3TRANSFORMS:CSSTRANSFORMS1
CSS3TRANSITIONS:CSSTRANSITIONS1
CSSDISPLAY3:CSSDISPLAY
CSS3DISPLAY:CSSDISPLAY
CSSVALUES3:CSSVAL
CSSVALUES:CSSVAL
CSS3VAL:CSSVAL
CSSTEXTDECOR3:CSS3TEXTDECOR
CSS3UI:CSSUI3
CSSUI:CSSUI4
CSSWRITINGMODES3:CSSWRITINGMODES
CSSWRITINGMODES4:CSSWRITINGMODES
CSS3WRITINGMODES:CSSWRITINGMODES
CSS3NAMESPACE:CSSNAMESPACES
CSSNAMESPACES3:CSSNAMESPACES
CSS3BACKGROUND:CSSBACKGROUNDS3
CSS3BG:CSSBACKGROUNDS3
CSSBG:CSSBACKGROUNDS3
CSSSTYLEATTR1:CSSSTYLEATTR
MEDIAQUERIES4:MQ4
MEDIAFRAGS:MEDIAFRAG
CSS3MEDIAQUERIES:MEDIAQ
SELECTORS4:SELECTORS
SELECTORS3:SELECT
CSS3SELECTORS:SELECT
URLAPISPECIFICATION:URL
XMLHTTPREQUEST:XHR
HTML5:HTML
SVG11:SVG
TOUCH:TOUCHEVENTS
WSAPI:WEBSOCKETS
WEBWORKERS:WORKERS
XML10:XML
XMLNAMES:XMLNS
XMLSTYLESHEET:XMLSS
ECMA262:ECMASCRIPT
	HTTP:RFC2616
HTTP11:RFC2616
HTTPAUTH:RFC2617
URI:RFC3986
IDNA:RFC3490
IPV6:RFC4291
ABNF:RFC5234
COOKIES:RFC6265
ORIGIN:RFC6454
WSP:RFC6455
WEBIDL1:WEBIDL
WORKLETS:WORKLETS1
REFERRER:REFERRERPOLICY
UPGRADE:UPGRADEINSECUREREQUESTS
TLS12:RFC5246
TLS:RFC5246
`;

/* END REF_KEY_MAP*/


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
		insertAdjacentHTML
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
