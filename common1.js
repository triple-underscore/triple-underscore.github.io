'use strict';


/******** PAGE_DATA（付帯機能／メタデータ用） ********

予約済みメンバ（ # → 詳細は common0.js ）

options:
	各種オプション／メタデータ
original_id_map:
	訳文 id → 原文 id への対応付け（文字列データ
original_urls:
	原文URL複数分岐
mdn_urls:
	MDN サイト（https://developer.mozilla.org/docs/Web/...）へのリンク（ id → URL ）
copyright:
	著作権（ページ特有
trans_metadata:
	和訳メタデータ
spec_metadata:
	仕様メタデータ
ref_normative:
ref_informative:
ref_additional:
	参照文献データ
ref_key_map:
ref_data:
	参照文献追加リンク用（ REF_DATA
link_map:#
words_table:#
words_table1:#



PAGE_DATA.options 予約済みメンバ

expanded
	ページは展開状態で保存されている
spec_title
	仕様の原文タイトル（未利用
trans_title
	仕様の和訳タイトル（未利用
spec_status
	仕様の位置付け（ ED, REC, LS, etc.
spec_date
	原文更新日（ YYYY-MM-DD ）
trans_update
	和訳更新日（ YYYY-MM-DD ）
source_checked
	最後に原文テキストと突き合わせた日付（YYMMDD）
original_url
	原文 URL
abbr_url
	和訳略称 URL
main_id
	内容生成コンテナ id
toc
	目次 id
no_index
	在るならば、用語索引なし
no_original_dfn
	在るならば、どの dfn の id も原文には無い（主に RFC 用
ref_id_lowercase
	在るならば、参照文献の id は小文字化する
ref_id_prefix
	参照文献の id 接頭辞（ 'biblio-', 'ref-', 等々
ref_rfc
	廃
site_nav
	他の一覧へのナビゲーション用キーワードリスト
nav_prev／nav_next
	前／次のページへのリンク（ HTML/SVG 用
navs
	巡回 UI 用（ INDEX_KEYS
copyright
	著作権（共通

*/

/** ↓付帯機能初期化／メタデータの拡充 */ {
let options;
Util._COMP_.then(() => {

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
			fillConformance, // §適合性
			initSideway, // 左端の帯
			addTopNav, // ページ先頭へのリンク
			Util.addAltRefs // 参照文献 和訳リンク
		);
	}

	Util.DEFERRED.push(
		initEvents,
		Util.dfnInit,
		() => {Util.ref_position.init();},
		() => {Util.toc_intersection_observer.restartObservation();},
		altLinkInit
	);

	defer0();
});


const defer0 = () => {
	const task = Util.DEFERRED.shift();
	if(!task) return;
	try {
		task();
	} catch(err){
		console.log(err.message);
	}
	if(Util.DEFERRED.length === 0) return;
	window.setTimeout(defer0, 10);//requestAnimationFrame
}

const initEvents = () => {

	const onVisibilityChange = () => {
		if(document.hidden){
			// pagehide event も含まれる
			Util.removeAdditionalNodes();
		}
	}

	const onDblClick = (event) => {
		Util.toggleSource(event.target);
	}

	const onClick = (event) => {
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
					{
						// 両端 click でも原文開閉
						const e1 = document.elementFromPoint(
							window.innerWidth /2, event.clientY);
						if(e1){
							Util.toggleSource(e1);
						}
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
				case 'IMG':
				case 'X-DIAGRAM': // 画像等を表現する汎用の図式コンテナ
					{
						// 外部代替テキストを表示
						const e1 = e.nextElementSibling;
						if(e1 && (e1.classList.contains('alt'))){
							e1.hidden = !e1.hidden;
						}
					}
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

	document.body.addEventListener('click', onClick, false);
	document.body.addEventListener('dblclick', onDblClick, false);
	document.addEventListener('visibilitychange', onVisibilityChange, false);

}

const navToInit = () => {
/** 内容生成後に素片識別子のアンカーへスクロールする */
	if( history.state ){
		return; // back/forward
	}

	let e;
	let id = window.location.hash;

	const targetId1 = (id) => {
		// 訳文id:原文id （先頭の \t も有効）
		id = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const rxp = new RegExp( '^\t?([^\\s:]+):' + id + '$', 'm' );
		const match = PAGE_DATA.original_id_map.match(rxp);
		if(!match) return;
		return match[1];
	}

	if(id){
		id = id.slice(1);
		if(id.indexOf('_xref-') === 0) return; // 生成リンク（ common1.js ）
		id = targetId1(id) || id;
		e = E(id);
	}
	if(!e){
		// 後から生成される内容（参照文献など）の id
		Util.DEFERRED.push(() => {
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
}


// ボタン類
const addControls = () => {

	const add_button = (label, key, id) => {
		const b = C('input');
		b.type = 'button';
		b.value = label;
		b.id = id;
		b.tabIndex = 1;
		if(key){
			b.accessKey = key;
			b.title = `アクセスキー： ${key}`;
		}
		controls.appendChild(b);
	}

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

}

const addTopNav = () => {
	const a = C('a');
	a.href = '#top';
	a.style.cssText =
'position:fixed; left:0; bottom:0; height:5em; background:var(--pale-color); text-align:center; width:1.5em;'
	a.textContent = '↑';
	document.body.appendChild(a);
}


// 付帯情報を生成する

const initSideway = () => {
	const key = options.spec_status;
	if(!key) return;

	const text = {
ED: 'W3C Editor’s Draft',
EDCG: 'W3C Community Group Draft Report',
WD: 'W3C Working Draft',
FPWD: 'W3C First Public Working Draft',
CR: 'W3C Candidate Recommendation Snapshot',
CRD: 'W3C Candidate Recommendation Draft',
PR: 'W3C Proposed Recommendation',
REC: 'W3C Recommendation',
DRY: 'W3C Draft Registry',
NOTE: 'W3C Group Note',
DNOTE: 'W3C Group Draft Note',
LS: 'Living Standard',
IETFPR: 'IETF PROPOSED STANDARD',
IETFSTD: 'IETF Internet Standard',
IETFBCP: 'IETF Best Current Practice',
IETFID: 'IETF Internet-Draft',
IETFEX: 'IETF Experimental',
	}[key];
	if(!text) return;

	const color = { ED: 'red', EDCG: 'orange', IETFBCP: 'gray', IETFSTD: 'gray', IETFPR: 'gray', IETFID: 'green', IETFEX: 'green', LS: 'green' }[key];
	const div = C('div');
	div.id = '_sideways-logo';
	if(color){
		div.style.background = color;
	}
	div.textContent = text;
	document.body.appendChild(div);
}

const fillSiteNav = () => {

	const html = ['<ul id="_site_nav">'];

	{
		const findMatch = (name) => {
			if(!name) return;
			if(name.slice(-5) === '.html') return name;
			let data = COMMON_DATA.words_table1;
			if(!data) return;
			let i = data.indexOf(`\n${name}:` );
			if(i < 0) return;
			i += name.length + 2;
			const j = data.indexOf('\n', i);
			if(j < 0) return;
			data = data.slice(i,j);
			if(data.slice(-5) !== '.html') return;
			return data;
		}
		let href;
		if(href = findMatch(options.nav_prev)){
			html.push(`<li><a href="${href}">＜前</a>`);
		}
		if(href = findMatch(options.nav_next)){
			html.push(`<li><a href="${href}">次＞</a>`);
		}
	}

	const name_map = Util.get_mapping(`
infrastructure:基盤
tag-finding:TAG知見
svg:SVG
html:HTML
html-dom:HTML 要素
html-syntax:HTML 構文
comms:メッセージ通信
browsers:ナビと閲覧
storage:ストレージ
uievents:UI
sensors:センサー
network:ネットワーク
http:HTTP
security:セキュリティ
performance:計時
transform:変形
paint:塗り
css:CSS
css-ux:CSS UX
css-anim:アニメーション
css-gnerated:生成内容
cssom:CSSOM
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
http: 'http-common-ja.html#index',
	};
	let site_nav = options.site_nav;
	if(!site_nav){
		site_nav = options.page_state_key ? label_map[options.page_state_key] : '';
	}
	if(!site_nav) site_nav = 'infrastructure';

	for(const label of site_nav.split(',') ){
		const name = name_map[label];
		if(!name) continue;
		const href = href_map[label] || `index.html#spec-list-${label}`;
		html.push( `<li><a href="${href}">${name}</a>` );
	}

	html.push('<li><a href="index.html#page-list">すべて</a>')
	html.push('</ul>');

	const nav = C('nav');
	nav.innerHTML = html.join('');
	document.body.insertBefore(nav, document.body.firstChild);
}

const fillTransMetadata = () => {
	const details = E('_trans_metadata');
	if(!details) return;
	if(options.trans_update){
		const summary = details.firstElementChild;
		if(summary){
			summary.insertAdjacentHTML( 'beforeend',
`（翻訳更新：<time>${options.trans_update}</time> ）`
			);
		}
	}

	let html = `
${PAGE_DATA.trans_metadata || ''}
<ul style="font-size:smaller;">
~COMMITS
<li><strong>この翻訳の正確性は保証されません。</strong>
<li>【 と 】で括られた部分は<span class="trans-note">【訳者による注釈】</span>です。
<li><a href="index.html#functions">各ページに共通の機能</a>も参照されたし（左下隅の表示切替ボタンなど）。
<li>誤訳その他ご指摘／ご意見は<a href="https://triple-underscore.github.io/about.html">連絡先</a>まで。
</ul>`
	;
	delete PAGE_DATA.trans_metadata;

	const url = window.location.pathname.match(/[^\/]+$/);
	const mapping = {
THIS_PAGE: url?
`<a href="https://triple-underscore.github.io/${url[0]}">このページ</a>` : 'このページ',
SPEC_URL:
options.original_url || '',
PUB: options.trans_1st_pub ?
`（初公表日：<time>${options.trans_1st_pub}</time> ）` : '',
W3C:
'<a href="https://www.w3.org/">W3C</a>',
WHATWG:
'<a href="https://whatwg.org/">WHATWG</a>',
IETF:
'<a href="https://www.ietf.org/">IETF</a>',
HTMLLS:
'https://html.spec.whatwg.org/multipage',
COMMITS: url?
`<li><a href="https://github.com/triple-underscore/triple-underscore.github.io/commits/master/${url[0]}">更新履歴</a>` : '',
	};
	html = html.replace(/~(\w+)/g, (match, key) => {
		return mapping[key] || '';
	});

	details.insertAdjacentHTML('beforeend', html);
}

const fillSpecMetadata = () => {
	const details = E('_spec_metadata');
	if(!details) return;
	let data = PAGE_DATA.spec_metadata;
	delete PAGE_DATA.spec_metadata;
	if(!data) return;

	if(options.original_url){
		const url = options.original_url;
		data = `
このバージョン（原文 URL ）
	${options.original_url}
${data}`
	}
	data = data
		.replace(/\n\S.+/g, '\n<dt>$&<dt>')
		.replace(/\n[ \t]+(https?:\S+)/g, '\n<dd><a href="$1">$1</a><dd>')
		.replace(/\n[ \t]+(.+)/g, '<dd>$1<dd>');

	details.insertAdjacentHTML('beforeend', `<dl>${data}</dl>`);
}

const fillCopyright = () => {
	const details = E('_copyright');
	if(!details) return;
	let license_data = PAGE_DATA.copyright;
	if(!license_data) {
		let info = options.copyright;
		if(!info) return;
		const [ year, license ] = info.split(',');
		switch( license ){
		case 'whatwg': // whatwg は year なし
			license_data = `
<a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>. Copyright © WHATWG (Apple, Google, Mozilla, Microsoft).`;
		break;

		case 'permissive': // W3C
			license_data = `
<a href="https://www.w3.org/policies/#copyright">Copyright</a> © ${year} <a href="https://www.w3.org/">World Wide Web Consortium</a>. <abbr title="World Wide Web Consortium">W3C</abbr><sup>®</sup> <a href="https://www.w3.org/policies/#Legal_Disclaimer">liability</a>, <a href="https://www.w3.org/policies/#W3C_Trademarks">trademark</a> and <a href="https://www.w3.org/copyright/software-license/" rel="license" title="W3C Software and Document License">permissive document license</a> rules apply.`;
		break;

		case 'use': // W3C（旧）
			license_data = `
<a href="https://www.w3.org/policies/#Copyright">Copyright</a> © ${year}
<a href="https://www.w3.org/"><abbr title="World Wide Web Consortium">W3C</abbr></a><sup>®</sup>
(<a href="https://www.csail.mit.edu/"><abbr title="Massachusetts Institute of Technology">MIT</abbr></a>,
<a href="https://www.ercim.eu/"><abbr title="European Research Consortium for Informatics and Mathematics">ERCIM</abbr></a>,
<a href="https://www.keio.ac.jp/">Keio</a>, <a href="https://ev.buaa.edu.cn/">Beihang</a>).
W3C <a href="https://www.w3.org/policies/#Legal_Disclaimer">liability</a>,
<a href="https://www.w3.org/policies/#W3C_Trademarks">trademark</a> and <a rel="license" href="https://www.w3.org/copyright/document-license/" rel="license">document use</a> rules apply.`;

/*
", All Rights Reserved" （数カ所）は省略。
rel="license" は無いものにも常に付与。
http は https に置換。
http://www.ercim.org/ （ 1 箇所）は https://www.ercim.eu/ に置換。
*/

			break;
		}
	}

	const html = license_data ? `
<small>このページは、次による原文の許諾の下で翻訳されています：
<br><span lang="en">${license_data}</span></small>` : `
<small>（翻訳エラー：適用可能な著作権情報が指定されていない）</small>`;

	details.insertAdjacentHTML('beforeend', html);
}

const fillIndexes = () => {
	const details = E('_index');
	if(!details) return;

	const fill_data = () => {
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

	if(details.open){
		fill_data();
	} else {
		details.addEventListener('toggle', fill_data, false);
	}
}

const fillConformance = () => {
	const links = {
w3c: '<a href="w3c-common-ja.html#conformance">W3C 日本語訳 共通ページ</a>',
css: '<a href="css-snapshot-ja.html#conformance">CSS Snapshot ページ</a>',
	};
	const link = links[ (options.conformance ) || ''];
	if(!link) return;
	const sec = C('section');
	sec.id = 'conformance';
	sec.innerHTML = `
<h2 title="Conformance">適合性</h2>
<p class="trans-note">【この節の内容は ${link}に移譲。】</p>
`;
	document.body.appendChild(sec);
}

/** 外部リンク日本語訳リンク追加 */
const altLinkInit = () => {
	const root = (options.main_id) ?
		E(options.main_id) :
		document.getElementsByTagName('main')[0];

	if(!root) return;
//	COMMON_DATA.JA_BASIS[''] = ''; //
	const ja_link = C('a');
	Util.ADDITIONAL_NODES.push(ja_link);
	ja_link.id = '_ja_link';
	ja_link.className = '_additional';
	ja_link.textContent = '【和訳】';

	const insert_ja_link = (e) => {
		let a = e.target;
		if(a.tagName !== 'A'){
			a = a.parentNode;
			if(a.tagName !== 'A') return;
		}
		if(a.className === '_additional') return;

		const alt_url = altURL(a.getAttribute('href'));
		if(!alt_url) return;
		ja_link.href = alt_url;
		a.after(ja_link);
	}

	root.addEventListener('mouseover', insert_ja_link, false);
	//focus does not bubble
	root.addEventListener('focus', insert_ja_link, true);

	const altURL = (href) => {
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

} // 付帯機能初期化↑

Util.removeAdditionalNodes = (refresh) => {
	Util.dfnHide(refresh);
	Util.indexHide(refresh);
	for( const node of Util.ADDITIONAL_NODES ){
		node.remove();
	}
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
Util.CLICK_HANDLERS._toggle_source = () => {
	Util.switchView(() => {
		const on = document.body.classList.toggle('show-original');
		Util.setState('show_original', on);
	});
};
/** 目次表示切替 */
Util.CLICK_HANDLERS._toggle_toc = () => {
	Util.switchView(() => {
		const on = document.body.classList.toggle('side-menu');
		Util.setState('side_menu', on);
		Util.toc_intersection_observer.restartObservation();
	});
};
/** 全体表示 常時化切替 */
Util.CLICK_HANDLERS._view_control = (event) => {
	const e = E('_view_control');
	if(event.target !== e) return;
	e.classList.toggle('_hoverd')
};

//	_toggle_index 用語索引 


/** 原文表示開閉（個別）*/
Util.toggleSource = (target) => {
	if(target.classList.contains('_en')) return;
	for(let e = target; e; e = e.parentNode){
		if(e.tagName === 'SECTION') return;
		const c = e.lastElementChild;
		if(c && c.classList.contains('_en')){
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

	restartObservation(){
		if(!window.IntersectionObserver) return;
		if(this.pending >= 0) return;

		if(this.observer){
			this.observer.disconnect();
		}

		const toc_id = PAGE_DATA.options.toc || '_toc';
		let first_time = true;

		const observe = () => {
			this.pending = -1;
			let observer = this.observer;
			if(!observer){
				observer =
				this.observer = new IntersectionObserver(
					intersected, {
						rootMargin: '-80px 0px', // 0 でも px が要る（ Chrome
					}
				);
			}

			const visible = document.body.classList.contains('side-menu');
			if(!visible) return;
//			`#${toc_main} section[id]`
			repeat(`#${toc_id} a[href]`, (e) => {
				const section = E(e.hash.slice(1));
				if(!section) return; // This should not happen
				observer.observe(section);
			});
		}

		const intersected = (entries, observer) => {
			const nav = E(toc_id);
			let last_elem;
			for( const entry of entries ){
				if(first_time && !entry.isIntersecting) continue;
				const id = entry.target.id;// section
				if(!id) continue;
				const a = nav.querySelector(`[href="#${id}"]`);
				if(!a) continue;
				a.classList.toggle('_intersecting', entry.isIntersecting);
				if(entry.isIntersecting) {
					last_elem = a;
				}
			}
			first_time = false;
			if(last_elem) {
				last_elem.scrollIntoView({block: 'nearest'});
			}
		}

		this.pending = window.setTimeout(observe, 500);
	},
};


/** 索引機能 初期化*/
Util.indexInit = () => {

	let item_list = null;        // 文書順の索引項目（ DOM node ）リスト
	let sorted = true;      // true 字句順 / false 文書順
	let scroll_top = 0;     // 最後のスクロール位置

	const index_node = C('div'); // 索引コンテナ node

	{
		// 索引コンテナ, 切替ボタン, 一覧 Box
		index_node.className = '_additional'; // for CSS
		index_node.id = '_index_table'; // for CSS ：子要素はすべて display:block
		index_node.appendChild(C('button'));// 表示順序 切替ボタン
		index_node.appendChild(C('div'));//一覧 Box
	}

	index_node.onclick = (event) => {
		if(event.target === index_node.firstChild){ //button
			showIndex(!sorted);
		}
		// indexHide が呼ばれないようにする
		event.stopPropagation();
	};

	Util.CLICK_HANDLERS._toggle_index = (event) => {
		if(indexHide()) return;
		showIndex(sorted);
	};

	const indexHide = 
	Util.indexHide = (refresh) => {
		if(!item_list) return;
		const parent = index_node.parentNode;
		const list_box = index_node.lastChild;
		if(parent){
			scroll_top = list_box.scrollTop;
		}
		if(refresh){
			item_list = null;
			list_box.textContent = '';
		}
		if(parent){
			index_node.remove();
			return true;
		}
	};

	const showIndex = (sort) => {
		sort = sort? true : false;
		const list_box = index_node.lastChild;

		if(!item_list || (sorted !== sort)) {
			list_box.textContent = '';
			if(!item_list) item_list = collectItems();
			let list1 = item_list;
			const button = index_node.firstChild;
			if(sort){
				button.textContent = '出現順に切替';
				list1 = item_list.slice(0);
				list1.sort((a, b) => {
					return a.textContent <= b.textContent ? -1 :1 ;
				});
			} else {
				button.textContent = '字句順に切替';
			}
			for(const e of list1){
				list_box.appendChild(e);
			}
		}
		sorted = sort;
		document.body.appendChild(index_node);
		list_box.scrollTop = scroll_top;
	}

	const collectItems = () => {
		const add_item = (dfn) => {
			const text = dfn.textContent.trim();
			if(!text) return;
			const id = dfn.id;
			const a = C('a');

			a.href = `#${id}`;
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

		const list = [];
		repeat('main dfn[id], main dt[id]', add_item);
		return list;
	}
}



/** 表示モード切替（スクロール位置も復帰）

	引数 callback : 実際に表示切替を行う関数
	引数 refresh : 切替時にページ DOM 内容が置換される場合 true

*/

Util.switchView = (callback, refresh) => {

	if(refresh){
		Util.removeAdditionalNodes(refresh);
		Util.toc_intersection_observer.restartObservation();
	}

	// スクロール位置を保存 -> callback -> 復帰
	const pos = Util.ref_position.current(refresh);
	callback();
	Util.ref_position.restore(pos);
};

/** reflow 時の scroll 位置の復帰のための基準位置 */

Util.ref_position = {
	// 現在の基準 scroll 位置
	current(refresh){
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
*/
			while(
				(!e.id && e.offsetParent )
				|| (e.offsetHeight === 0 ) /* 例：tbody */
				|| (e.classList.contains('alt')) /* 代替テキスト（既定で隠される） */
			){
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
	restore(pos){
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
	e.scrollIntoView(); window.scrollBy(0, - pos.y_offset);
	とするのは、 scrollIntoView が滑らかに scroll している間に
	scrollBy により中断され，位置がずれる
*/

	// 要素のウィンドウ内での表示位置 y を得る
	offsetY(e){
		let y = 0;
		while(e){
			y += e.offsetTop;
			e = e.offsetParent;
		}
		return y - window.scrollY;
	},

/** resize/orientationchange 時に
	基準位置へ復帰する／基準位置を更新する
*/

	init(){
		const onreflow = () => {
			if(reflow_timer){
				clearTimeout(reflow_timer);
			} else {
				pos = ref_position.current();
			}
			reflow_timer = window.setTimeout(endReflow, 300);
		};
		const endReflow = () => {
			// 一連の resize 操作の「終了」
			fix_timer = releaseAndFix(fix_timer);
			// resize event は reflow 完了後とされているが、そうでないこともある様子 (Safari)
			ref_position.restore(pos);
			pos = null;
			reflow_timer = 0;
		};

		// resize 時の reflow 頻度を抑えるため、全体の width を固定する
		// 一連の resize 操作を終える度に更新する：
		const releaseAndFix = (fix_timer) => {
			const root = document.documentElement;
			root.style.width = '';
			clearTimeout(fix_timer);
			return window.setTimeout( () => {
				root.style.width = window.getComputedStyle(root).width;
			}, 500)
		};

		const ref_position = this;
		let reflow_timer = 0;
		let fix_timer = 0;
		let pos = null;

		if(!document.elementFromPoint) return;

		window.addEventListener('resize', onreflow, false);
		window.addEventListener('orientationchange', onreflow, false);

		window.setTimeout(() => {
			fix_timer = releaseAndFix(fix_timer);
		}, 500);
	}
}


/** 被参照リンク一覧の表示
	id 付きの dfn, dt, H2 〜 H6 タグの参照元リンクの一覧, 原文リンク を表示する
*/


Util.dfnInit = () => {
	let dfnStart = null; // current target (the clicked element)
	let dfnLinks = null; // all link anchors targeting to dfnStart
	let dfnIndecies = null; // links to dfnLinks
	let dfnJumpCount = 0;
	let dfnIndex = -1;
//	let dfnTargetScrollPositionY = 0;

	const dfnPanel = C('div');
		dfnPanel.id = '_dfnPanel';
		dfnPanel.innerHTML =
'<div><input type="button" value="  ←  "><input type="button" value="  →  "><a></a><a class="_additional" target="original-spec">(原文)</a><a class="_additional" target="mdn">(MDN)</a></div><ul></ul>';

	const dfnTarget // a link to dfnStart
		= dfnPanel.firstElementChild.children[2];
	const dfnOriginal // a link to the corresponding element in the original spec
		= dfnTarget.nextElementSibling;
	const dfnMDN // a link to the corresponding MDN page
		= dfnOriginal.nextElementSibling;

	const original_id_map = Util.get_mapping(PAGE_DATA.original_id_map);
	let original_urls = null;
	if(PAGE_DATA.original_urls){
		// original_url の他に複数の原文 URL がある
		original_urls = Util.get_mapping(PAGE_DATA.original_urls);
	}
	const mdn_urls = Util.get_mapping(PAGE_DATA.mdn_urls || '');

	{
		let b = dfnTarget.previousElementSibling;
		b.onclick = (event) => {navBy( 1, event);}
		b = b.previousElementSibling;
		b.onclick = (event) => {navBy(-1, event);}

		dfnPanel.lastElementChild.onclick = (event) => {
			// dfnHide が呼ばれない様にする
			event.stopPropagation();
		};

		// keyboard navigation
		dfnPanel.tabIndex = '-1';
		dfnPanel.onkeydown = (event) => {
			if(event.metaKey || event.altKey || event.ctrlKey) return;
			switch(event.key){
			case "Escape":
	//			dfnJump(-1); // back to the original position
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
		window.addEventListener('hashchange', (event) => {
			if(!dfnStart) return;
			//event.newURL may not be supported (e.g. IE9)
			const hash = window.location.hash;
			const num = hash.match(/_xref-\d+-(\d+)/);
			if(!num) return;
			dfnJump(parseInt(num[1], 10));
		}, false);

		const navBy = (d, event) => {
			const L = dfnLinks.length + 1;
			const index = (dfnIndex + d + L) % L;
			event.preventDefault();
			event.stopPropagation();
			dfnJump(index);
			const ul = dfnPanel.lastElementChild;
			if(ul.scrollHeight <= ul.clientHeight) return;
			// auto scroll
			const emp = h_panel.current;
			if(!emp) return;
			const r1 = ul.getBoundingClientRect();
			const r2 = emp.getBoundingClientRect();
			if(r2.top < r1.top || r2.bottom > r1.bottom ){
				emp.scrollIntoView();
			}
		}
	}

	// For UI: highlighting only one of links/targets during nav
	const h_panel = {
		current: null,
		highlight(e){
			// highlight only one of
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
	}
	const h_external = {
		current: null,
		highlight: h_panel.highlight,
	};

	const setLinkForOriginal = (id, is_header) => {
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

		dfnOriginal.href = `${original_url}#${(original_id_map[id] || id)}`;
		dfnOriginal.style.display = '';
	}

	const setLinkForMDN = (id) => {
		// MDNリンク先を設定
		dfnMDN.style.display = 'none';
		const href = mdn_urls[id];
		if(!href) return;
		dfnMDN.href = `https://developer.mozilla.org/en-US/docs/Web/${href}`;
//		dfnMDN.href = `https://developer.mozilla.org/docs/Web/${href}`;
		dfnMDN.style.display = '';
	}

	const dfnHide =
	Util.dfnHide = () => {
		if(!dfnStart) return;
		h_external.highlight();
		h_panel.highlight();
		dfnIndecies = 
		dfnLinks = 
		dfnStart = null;
		if(dfnPanel.parentNode){
			dfnPanel.remove();
		}
	}

	const dfnJump = (index) => {
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
		h_panel.highlight(emp);
		h_external.highlight(a);

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

	const handlers = Util.CLICK_HANDLERS;

	const dfnShow = 
	handlers.DT =
	handlers.DFN =
	handlers.A =
	handlers.H1 =
	handlers.H2 =
	handlers.H3 =
	handlers.H4 =
	handlers.H5 =
	handlers.H6 = (dfn) => {
		Util.removeAdditionalNodes();
		if(dfn === dfnStart) return;
		let id = dfn.id;
		const is_header = /^H\d$/.test(dfn.tagName);
		if(!id && is_header){
			id = dfn.parentNode.id;
		}
		if(!id) return;
		dfnStart = dfn;
		dfnTarget.textContent = dfn.title || `#${id}`;
		dfnTarget.href = `#${id}`;
		dfnIndex = -1;
//		dfnTargetScrollPositionY = window.scrollY;

		setLinkForOriginal(id, is_header);
		setLinkForMDN(id);

		// 合致するものが無ければ空の NodeList
		dfnIndecies = [];
		dfnLinks = document.querySelectorAll(
			dfn.getAttribute('data-cycling') || `a[href="#${id}"]`
		);
		const L = dfnLinks.length;

		const ul = dfnPanel.lastElementChild;
		ul.textContent = '';
		ul.className = L ? '' : 'empty';

		let lastSection;
		let lastLi;
		let n;
		const prefix = `#_xref-${dfnJumpCount++}-`;

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



/** 参照文献
• 外部リンク→ 日本語訳 データ構築
• 参照文献 HTML を生成
	<dt> に id を自動的に付与
• 日本語訳リンク追加： 末尾 <dd> に次を挿入
	<dd class="trans-ja-refs"><a href="リンク先">'日本語訳'[番号|注釈]?</a>...</dd>
	
*/


Util.addAltRefs = () => {

	const JA_REFS = COMMON_DATA.JA_REFS;
	const JA_LINKS = COMMON_DATA.JA_LINKS;
	const JA_BASIS = COMMON_DATA.JA_BASIS;
	const REF_KEY_MAP = Util.get_mapping(COMMON_DATA.REF_KEY_MAP + (PAGE_DATA.ref_key_map || ''));

	const ref_id_prefix = PAGE_DATA.options.ref_id_prefix || '';
	const ref_id_lowercase = PAGE_DATA.options.ref_id_lowercase || false;

	Util.get_mapping(
		COMMON_DATA.REF_DATA2
			.replace(/~(\w+)/g, (s, s1) => { return JA_BASIS[s1];})
			.replace(/● */g, ':https://'),
		JA_LINKS
	);

	const refKey = (s) => {
		const key = s.replace(/[^\w]/g, '').toUpperCase();
		return REF_KEY_MAP[key] || key;
	}

	const ref_types = ['normative', 'informative', 'additional'];

	const ref_node_list = ref_types.filter( (type) => {
		let ref_data = PAGE_DATA[`ref_${type}`];
		if(!ref_data) return false;
		return true;
	});

	const altrefs = Object.create(null);
	const add_altref_link = (key, url, label) => {
		if(altrefs[key] === undefined) {
			altrefs[key] = '';
		};
		altrefs[key] += `<a href="${url}">${label}</a>`;
	}

	//和訳リンク先データ
	const REF_DATA = (PAGE_DATA.ref_data || '') + COMMON_DATA.REF_DATA;

	let m;
	const rxp = /^(\w+)=(\S)(\d*)[\t ]+(~\w*)?([^\s●]+)(●.*)?$/mg;
	while(m = rxp.exec(REF_DATA)){
		const key = m[1];
		const mark = m[2];
		let prefix = m[4];
		const url0 = m[5];
		const label = ( m[6]? m[6].slice(1): '日本語訳' ) + (m[3] || '');
		let url1 = url0;
		let url;
		if(prefix === '~'){ // link to this site
			url = url0.slice(1);
		} else {
			if(prefix){
				prefix = prefix.slice(1);
				url1 = JA_BASIS[prefix] + url0;
			}
			url = ( url1[0] === '＃' ) ?
				`http://${url1.slice(1)}` : `https://${url1}`;
		}
		switch(mark){
			case '主':
				JA_REFS[key] = url;
			case '副':
				add_altref_link(key, url, label);
				break;
			case '・':
				if(url && !(url1 in JA_LINKS))
					JA_LINKS[url1] = `@${key}`;
				break;
			default:
				break;
		}
	}

	const generateRefsHTML = () => {
		let refs = E('references');

		if(!refs){
			refs = C('section');
			refs.id = 'references';
			refs.insertAdjacentHTML('beforeend', '<h2>参照文献</h2>');
			document.body.appendChild(refs);
		}

		const ref_titles = {
normative: '文献（規範）',
informative: '文献（参考）',
additional: '文献（この訳による追加）'
		};

		const refHTML = (data) => {
			const result = [];
			let ref_key = '';
			let ref_id = '';
			data = data
				.replace(
					/＜(.+?)＞/g,
					'<cite>$1</cite>'
				).replace(/~RFC(\d+)\b(.*)/g,
'RFC $1$2 URL: https://www.rfc-editor.org/rfc/rfc$1'
				).replace(
					/\bURL: +(https?:[^\s]+)/g,
					'\n＠$1\n'
				).replace(
					/\n\[/g,
					'\n＆\n['
				);
			data += '\n＆';
			data.split('\n').forEach( (line) => {
				line = line.trim();
				if( line === '') return;
				if(/^\[(.+)\]$/.test(line)){
					const ref_name = line.slice(1,-1);
					ref_id = ref_id_prefix +
						(ref_id_lowercase ? ref_name.toLowerCase() : ref_name );
					ref_key = refKey(ref_name);
					result.push(
`<dt id="${ref_id}">[${ref_name}]</dt>`
					);
				} else if(line[0] === '＠') {
					const url = line.slice(1);
					result.push(
`<dd><a href="${url}">${url}</a></dd>`
					);
					const rfc_n = url.match(/\/(?:rfc)\/rfc(\d+)/);
					if(!rfc_n) return;
					const rfc_num = rfc_n[1];
					add_altref_link(ref_key, `https://rfcs.web.fc2.com/rfc${rfc_num}.html`, 'google 翻訳');
					if(parseInt(rfc_num) >= 2220){
						add_altref_link(ref_key, `https://tex2e.github.io/rfc-translater/html/rfc${rfc_num}.html`, 'rfc-translater');
					}
				} else if(line === '＆') {
					const altref = altrefs[ref_key];
					if(!altref) return;
					let altlinks;
					if(altref[0] !== '<'){
						altlinks = `<a href="#${altref}">【↑】</a>`;
					} else {
						altlinks = altref;
						altrefs[ref_key] = ref_id;
					}
					result.push(
`<dd class="trans-ja-refs">${altlinks}</dd>`
					);
				} else {
					result.push(
`<dd lang="en">${line}</dd>`
					);
				}
			});
			return result.join('\n');
		}

		for(const id of ref_node_list){
			const ref_data = PAGE_DATA[`ref_${id}`];
			if(!ref_data) continue;
			delete PAGE_DATA[`ref_${id}`];
			const section = C('section');
			section.id = id;
			section.innerHTML = `
<h3>${ref_titles[id]}</h3>
<dl>
${refHTML(ref_data)}
</dl>
`;
			refs.appendChild(section);
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
構文:pre.bnf,pre.prod
訳注:.trans-note
`;

/** 文献 id = 英文 URL = 和訳 URL の対応データ

URL の先頭の文字 '＃' は http:// ／ 他は https://
*/

COMMON_DATA.JA_REFS = Object.create(null); // 文献 id -> 和訳 URL
COMMON_DATA.JA_LINKS = Object.create(null);// 英文 URL -> 文献 id

// 短縮形 URL の接頭辞 対応表
COMMON_DATA.JA_BASIS = {
//	'':        'triple-underscore.github.io',
	mitsue:    'standards.mitsue.co.jp/resources/w3c/TR',
	momdo:     '＃momdo.s35.xrea.com/web-html-test/spec',
	momdoG:    'momdo.github.io',
	ipa:       'www.nic.ad.jp/ja/tech/ipa',
	adagio:    '＃www.y-adagio.com/public/standards',
	TR:        'www.w3.org/TR',
	CSSWG:     'drafts.csswg.org',
	HTMLLS:    'html.spec.whatwg.org/multipage',
	RFCx:      'www.rfc-editor.org/rfc',
//	RFCx:      'datatracker.ietf.org/doc/html',
	HTTPWG:    'httpwg.org/specs',
	suika:     'wiki.suikawiki.org',
//	default:   ''
};

/*
主 副 ・
＊ ＊ 　 参照文献に追加する？
　 　 ＊ 和訳リンク対応表に追加する？  JA_LINKS に (url:ref-id) を追加
＊ 　 　 hover 時に表示する？       JA_REFS に  (ref-id:url) を追加
*/

COMMON_DATA.REF_DATA = `
ARIA=・               w3c.github.io/aria/
ARIA=・               ~TR/wai-aria-1.1/
ARIA=・               ~TR/wai-aria-1.2/
ARIA=・               ~TR/wai-aria-1.3/
ARIA=主               ~momdoG/wai-aria-1.3/
	ARIA=主               ~momdoG/wai-aria-1.2/
	ARIA=主               ~momdoG/wai-aria-1.1/
GRAPHICSARIA10=・     ~TR/graphics-aria-1.0/
GRAPHICSARIA10=主     ~momdoG/graphics-aria-1.0/
ARIAHTML=・           w3c.github.io/html-aria/
ARIAHTML=主           ~momdoG/html-aria/
CAPABILITYURLS=副     ~/capability-urls-ja.html
COMPOSITING1=副       ~/compositing-ja.html
COMPOSITING2=副       ~/compositing-ja.html●Level 1 日本語訳
CHARMOD=副            ~/charmod-ja.html
CORS=副               ~/Fetch-ja.html●Fetch 日本語訳
CSP3=副               ~/CSP3-ja.html
CSP3=副2              hashedhyphen.github.io/webappsec-specjp/csp/index.html
CSP2=副               ~/CSP-ja.html
CSS1=副               ＃www.doraneko.org/webauth/css1/19961217/Overview.html
CSS2=副               ~momdoG/css2/Overview.html
CSS2=副2              hp.vector.co.jp/authors/VA022006/css/index.html
CSS2=副3              ~adagio/tr_css2/toc.html●2.0 日本語訳
CSS2TABLE=主          ~momdoG/css2/tables.html
CSS2TABLE=・          ~CSSWG/css2/tables.html/../
CSSALIGN3=副          ~/css-align-ja.html
CSSANCHORPOSITION1=副 ~/css-anchor-position-ja.html
CSSANIMATIONS1=副     ~/css-animations-ja.html
CSSANIMATIONS2=副     ~/css-animations2-ja.html
CSSBACKGROUNDS3=副    ~/css-backgrounds-ja.html
CSSBACKGROUNDS3=副2   ~mitsue/css3-background/
CSSBOX3=副            ~/css-box-ja.html●Level 4 日本語訳
CSSBOX4=副            ~/css-box-ja.html
CSSBREAK3=副          ~/css-break-ja.html●Level 4 日本語訳
CSSBREAK4=副          ~/css-break-ja.html
CSSCASCADE3=副        ~/css-cascade-ja.html●Level 5 日本語訳
CSSCASCADE4=副        ~/css-cascade-ja.html●Level 5 日本語訳
CSSCASCADE5=副        ~/css-cascade-ja.html
CSSCOLOR3=主          ~mitsue/css3-color/
CSSCOLOR3=副          ~/css-color-ja.html●Level 4 日本語訳
CSSCOLOR4=副          ~/css-color-ja.html
CSSCOLOR5=副          ~/css-color5-ja.html
CSSCOLORADJUST1=副    ~/css-color-adjust-ja.html
CSSCOUNTERSTYLES3=副  ~/css-counter-styles-ja.html
CSSCONDITIONAL3=副    ~/css-conditional-ja.html
CSSCONDITIONAL4=副    ~/css-conditional4-ja.html
CSSCONDITIONAL5=副    ~/css-conditional5-ja.html
CSSCONTAIN2=副        ~/css-contain-ja.html
CSSCONTAIN1=副        ~/css-contain-ja.html●Level 2 日本語訳
CSSCONTENT3=副        ~/css-content-ja.html
CSSDEVICEADAPT1=・    ~TR/css-device-adapt/
CSSDEVICEADAPT1=・    ~CSSWG/css-device-adapt-1/
CSSDEVICEADAPT1=主    ~momdoG/css-device-adapt-1/
CSSDISPLAY3=副        ~/css-display-ja.html●Level 4 日本語訳
CSSDISPLAY4=副        ~/css-display-ja.html
CSSEASING1=副         ~/css-easing-ja.html●Level 2 日本語訳
CSSEASING2=副         ~/css-easing-ja.html
CSSEXCLUSIONS1=副     ~/css-exclusions-ja.html
CSSFLEXBOX1=副        ~/css-flexbox-ja.html
CSSFONTS3=副          ~/css-fonts-ja.html
CSSFONTS4=副          ~/css-fonts4-ja.html
CSSFONTLOADING3=副    ~/css-font-loading-ja.html
CSSGRID1=副           ~/css-grid-ja.html●Level 2 日本語訳
CSSGRID2=副           ~/css-grid-ja.html
CSSINLINE3=副         ~/css-inline-ja.html
CSSIMAGES3=副         ~/css-images-ja.html
CSSIMAGES3=副2        ~momdo/CR-css3-images-20120417.html
CSSIMAGES4=副         ~/css-images4-ja.html
CSSLOGICAL1=副        ~/css-logical-ja.html
CSSLISTS3=副          ~/css-lists-ja.html
CSSMASKING1=副        ~/css-masking-ja.html
CSSMULTICOL1=副       ~/css-multicol-ja.html●Level 2 日本語訳
CSSMULTICOL2=副       ~/css-multicol-ja.html
CSSNAMESPACES3=副     ~/css-namespaces-ja.html
CSSNAMESPACES3=副2    ~mitsue/css3-namespace/
CSSNAMESPACES3=副3    ~momdo/REC-css-namespaces-3-20140320.html
CSSOVERFLOW3=副       ~/css-overflow-ja.html
CSSPAGE3=副           ~/css-page-ja.html
CSSPOSITION3=副       ~/css-position-ja.html
CSSPOSITION4=副       ~/css-position4-ja.html
CSSRUBY1=副           ~/css-ruby-ja.html
CSSSHAPES1=副         ~/css-shapes-ja.html
CSSSHAPES2=副         ~/css-shapes2-ja.html
CSSSPEECH1=副         ~/css-speech-ja.html
CSSSIZING3=副         ~/css-sizing-ja.html
CSSOM1=副             ~/cssom-ja.html
CSSOMVIEW1=副         ~/cssom-view-ja.html
CSSPAINTAPI1=副       ~/css-paint-api-ja.html
CSSPROPERTIESVALUESAPI1=副  ~/css-properties-values-api-ja.html
CSSPSEUDO4=副         ~/css-pseudo-ja.html
CSSSCOPING1=副        ~/css-scoping-ja.html
CSSSHADOWPARTS1=副    ~/css-shadow-parts-ja.html
CSSSCROLLSNAP1=副     ~/css-scroll-snap-ja.html
CSSSTYLEATTR1=副      ~/css-style-attr-ja.html
CSSSTYLEATTR1=副2     ~mitsue/css-style-attr/
CSSSYNTAX3=副         ~/css-syntax-ja.html
CSSTEXT3=副           ~/css-text-ja.html●Level 4 日本語訳
CSSTEXT3=副2          suzukima.github.io/css-ja/css3-text/
CSSTEXT4=副           ~/css-text-ja.html
CSSTEXTDECOR3=副      ~/css-text-decor-ja.html
CSSTEXTDECOR3=副2     ~momdoG/css-text-decor-3/
CSSTYPEDOM1=副        ~/css-typed-om-ja.html
CSSTRANSFORMS1=副     ~/css-transforms-ja.html
CSSTRANSFORMS2=副     ~/css-transforms2-ja.html
CSSTRANSITIONS1=副    ~/css-transitions-ja.html
CSSUI3=副             ~momdoG/css-ui/
CSSUI3=副             ~/css-ui-ja.html●Level 4 日本語訳
CSSUI4=副             ~/css-ui-ja.html
CSSVALUES3=副         ~momdoG/css3-values/
CSSVALUES3=副         ~/css-values-ja.html●Level 4 日本語訳
CSSVALUES4=副         ~/css-values-ja.html
CSSVALUES5=副         ~/css-values5-ja.html
CSSVARIABLES1=副      ~/css-variables-ja.html
CSSVARIABLES2=副      ~/css-variables-ja.html●Level 1 日本語訳
CSSVIEWTRANSITIONS1=副 ~/css-view-transitions-ja.html
CSSVIEWTRANSITIONS2=副 ~/css-view-transitions2-ja.html
CSSWILLCHANGE1=副     ~/css-will-change-ja.html
CSSWRITINGMODES4=副   ~/css-writing-modes-ja.html
CSSWRITINGMODES3=副   ~/css-writing-modes3-ja.html
CSSWRITINGMODES3=副   suzukima.github.io/css-ja/css3-writing-modes/
MEDIAQUERIES3=副      ~mitsue/css3-mediaqueries/
MEDIAQUERIES3=副2     www.asahi-net.or.jp/~ax2s-kmtn/internet/css/REC-css3-mediaqueries-20120619.html
MEDIAQUERIES4=副      ~/mediaqueries-ja.html●Level 5 日本語訳
MEDIAQUERIES5=副      ~/mediaqueries-ja.html
FILTEREFFECTS1=副     ~/filter-effects-ja.html
MEDIAFRAG=・          ~TR/media-frags/
MEDIAFRAG=主          www.asahi-net.or.jp/~ax2s-kmtn/internet/media/REC-media-frags-10-20120925.html
COMPAT=副             ~/compat-ja.html
DESIGNPRINCIPLES=副   ~/design-principles-ja.html
DOM=副                ~/DOM4-ja.html
DOMPARSING=副         ~/DOM-Parsing-ja.html
DOMLEVEL2STYLE=副     ~adagio/tr_dom2_style/expanded-toc.html
ECMASCRIPT=副         ecmascript2020言語仕様.com/●日本語訳（2020）
ENCODING=副           ~/Encoding-ja.html
FETCH=副              ~/Fetch-ja.html
FILEAPI=副            ~/File_API-ja.html
FULLSCREEN=副         ~/fullscreen-ja.html
NOTIFICATIONS=副      ~/notifications-ja.html
GEOMETRY1=副          ~/geometry-ja.html
MOTION1=副            ~/motion-ja.html
HTML=副               ~/index.html#spec-list-html●日本語訳（このサイト）
HTML=副               ~momdoG/html/●日本語（部分）訳
HTML=副               ~momdoG/html/dev/●日本語訳（ Web 開発者向け）
HTML=副               jp.htmlspecs.com/●日本語訳
HTMLMICRODATA=・      ~HTMLLS/microdata.html
HTMLMICRODATA=主      ~momdoG/html/microdata.html
HTML401=副            www.asahi-net.or.jp/~sd5a-ucd/rec-html401j/cover.html
INDEXEDDB=副          ~/IndexedDB-ja.html
INTERSECTIONOBSERVER=副   ~/IntersectionObserver-ja.html
JLREQ=主              ~TR/jlreq/
JLREQ=副              w3c.github.io/jlreq/●日本語訳（編集者草案）
INFRA=副              ~/infra-ja.html
APPMANIFEST=副        ~/appmanifest-ja.html
HRTIME=副             ~/hr-time-ja.html
LONGTASKS=副          ~/longtasks-ja.html
LONGANIMATIONFRAMES=副  ~/long-animation-frames-ja.html
NAVIGATIONTIMING=副   ~/navigation-timing-ja.html●Level 2 日本語訳
NAVIGATIONTIMING2=副  ~/navigation-timing-ja.html
PERFORMANCETIMELINE=副     ~/performance-timeline-ja.html
USERTIMING2=副        ~/user-timing-ja.html
RESOURCETIMING2=副     ~/resource-timing-ja.html
RESOURCETIMING=副     ~/resource-timing-ja.html
BEACON=副             ~/beacon-ja.html
PERMISSIONSPOLICY1=副 ~/webappsec-permissions-policy-ja.html
REFERRERPOLICY=副     ~/webappsec-referrer-policy-ja.html
REPORTING1=副         ~/reporting1-ja.html
SCREENORIENTATION=副  ~/screen-orientation-ja.html
PERMISSIONS=副        ~/webappsec-permissions-ja.html
AMBIENTLIGHT=副       ~/ambient-light-ja.html
ACCELEROMETER=副      ~/accelerometer-ja.html
DEVICEORIENTATION=副  ~/deviceorientation-ja.html
GENERICSENSOR=副      ~/sensors-ja.html
GEOLOCATION=副        ~/geolocation-api-ja.html
GEOLOCATION=副2       www.asahi-net.or.jp/~ax2s-kmtn/internet/geo/REC-geolocation-20220901.html
GEOLOCATIONSENSOR=副  ~/geolocation-sensor-ja.html
GYROSCOPE=副          ~/gyroscope-ja.html
MAGNETOMETER=副       ~/magnetometer-ja.html
ORIENTATIONSENSOR=副  ~/orientation-sensor-ja.html
PROXIMITY=副          ~/proximity-ja.html
MOTIONSENSORS=副      ~/motion-sensors-ja.html
WEBBLUETOOTH=副       tkybpp.github.io/web-bluetooth-jp/

RFC1034=副            ＃srgia.com/docs/rfc1034j.html
RFC1123=副            hp.vector.co.jp/authors/VA002682/rfc1123j.htm
RFC1123=副2           ＃www2s.biglobe.ne.jp/~hig/tcpip/HostReq_Appl.html
RFC2046=副            ＃www.t-net.ne.jp/~cyfis/rfc/mime/rfc2046_ja-1.html
RFC2046=副            ~adagio/tr_mime-p2_2046/toc.htm
RFC2119=副            ~/bcp14-ja.html
RFC8174=副            ~/bcp14-ja.html
	RFC2119=副            ＃www.cam.hi-ho.ne.jp/mendoxi/rfc/rfc2119j.html
	RFC2119=副2           www.asahi-net.or.jp/~sd5a-ucd/rfc-j/rfc-2119j.html
	RFC2119=副3           ＃www.t-net.ne.jp/~cyfis/rfc/format/rfc2119_ja.html
	RFC2119=副4           ~ipa/RFC2119JA.html
RFC2397=・            ~RFCx/rfc2397
RFC2397=主            tily.hatenablog.com/entry/20071103/p1
RFC2616=・            ~RFCx/rfc2616
RFC2616=主            ~/rfc-others/RFC2616-ja.html
RFC2616=副2           ~suika/n/RFC%202616
RFC2817=副            ~ipa/RFC2817JA.html
RFC2817=・            ~RFCx/rfc2817
RFC2818=主            ~suika/n/RFC%202818
RFC2818=副2           ~ipa/RFC2818JA.html
RFC2818=・            ~RFCx/rfc2818
RFC3174=主            ~ipa/RFC3174JA.html
RFC3174=副2           ＃www7b.biglobe.ne.jp/~k-west/SSLandTLS/rfc3174-Ja.txt
RFC3490=副            ＃www5d.biglobe.ne.jp/stssk/rfc/rfc3490j.html
RFC3629=副            ＃www5d.biglobe.ne.jp/stssk/rfc/rfc3629j.html
RFC3629=副2           ＃www.akanko.net/marimo/data/rfc/rfc3629-jp.txt
RFC3986=主            ~/rfc-others/RFC3986-ja.html
RFC3986=・            ~RFCx/rfc3986
RFC3987=副            ~suika/n/RFC%203987
RFC4086=副            ~ipa/RFC4086JA.html
RFC4122=副            rui86.hatenablog.jp/entry/2013/07/18/065147
RFC4270=副            ~ipa/RFC4270JA.html
RFC4291=副            ＃srgia.com/docs/rfc4291j.html
RFC4648=副            ＃www5d.biglobe.ne.jp/stssk/rfc/rfc4648j.html
RFC5234=副            ＃www.cam.hi-ho.ne.jp/mendoxi/rfc/rfc5234j.html
RFC5246=副            ~ipa/RFC5246-00JA.html
RFC5321=副            ＃srgia.com/docs/rfc5321j.html
RFC5322=副            ＃srgia.com/docs/rfc5322j.html
RFC5789=副            ~/http-patch-ja.html
RFC5890=副            jprs.co.jp/idn/rfc5890j.txt
RFC5891=副            jprs.co.jp/idn/rfc5891j.txt
RFC5895=副            jprs.co.jp/idn/rfc5895j.txt
RFC5988=副            ~/http-web-linking-ja.html●日本語訳（RFC8288）
RFC8288=副            ~/http-web-linking-ja.html
RFC6066=副            ~ipa/RFC6066JA.html
RFC6265=副            ~/http-cookie-ja.html
RFC6454=副            ~/RFC6454-ja.html
RFC6454=副2           ~ipa/RFC6454JA.html
RFC6455=副            ~/RFC6455-ja.html
RFC6901=副            ~/RFC6901-ja.html
RFC6902=副            ~/RFC6902-ja.html
RFC7230=副            ~/RFC7230-ja.html
RFC7231=副            ~/RFC7231-ja.html
RFC7232=副            ~/RFC7232-ja.html
RFC7233=副            ~/RFC7233-ja.html
RFC7234=副            ~/RFC7234-ja.html
RFC7235=副            ~/RFC7235-ja.html
RFC7230=副            ~/http1-ja.html●日本語訳（RFC9112）
RFC7230=副            ~/http-semantics-ja.html●日本語訳（RFC9110）
RFC7231=副            ~/http-semantics-ja.html●日本語訳（RFC9110）
RFC7232=副            ~/http-semantics2-ja.html#conditional.requests●日本語訳（RFC9110）
RFC7233=副            ~/http-semantics2-ja.html#range.requests●日本語訳（RFC9110）
RFC7234=副            ~/http-cache-ja.html●日本語訳（RFC9111）
RFC7235=副            ~/http-semantics2-ja.html#authentication●日本語訳（RFC9110）
RFC7540=副            summerwind.jp/docs/rfc7540/
RFC7540=副            summerwind.jp/docs/rfc9113/●日本語訳（RFC9113）
RFC8259=副            www.asahi-net.or.jp/~ax2s-kmtn/internet/rfc8259j.html
RFC8470=副            ~/http-early-data-ja.html
RFC8941=副            ~/http-structured-fields-ja.html●日本語訳（RFC9651）
RFC8942=副            ~/http-client-hints-ja.html
RFC8949=副            ~/CBOR-ja.html
RFC9110=副            ~/http-semantics-ja.html
RFC9111=副            ~/http-cache-ja.html
RFC9112=副            ~/http1-ja.html
RFC9113=副            summerwind.jp/docs/rfc9113/
RFC9114=副            ~/http3-ja.html
RFC9218=副            ~/http-priority-ja.html
RFC9297=副            ~/http-datagram-ja.html
RFC9651=副            ~/http-structured-fields-ja.html
SELECTORS4=副         ~/selectors4-ja.html
SELECTORS3=副         ~mitsue/css3-selectors/
SELECTORS3=副2        ＃zng.info/specs/css3-selectors.html
SELECTORS3=副         ~/selectors4-ja.html●Level 4 日本語訳
SECURECONTEXTS=副     ~/webappsec-secure-contexts-ja.html
SECURECONTEXTS=副     hashedhyphen.github.io/webappsec-specjp/secure-contexts/index.html
SRI=副                ~/webappsec-subresource-integrity-ja.html
UPGRADEINSECUREREQUESTS=副 ~/webappsec-upgrade-insecure-requests-ja.html
MIXEDCONTENT=副       ~/webappsec-mixed-content-ja.html
SECURITYPRIVACYQUESTIONNAIRE=副 ~/security-questionnaire-ja.html
STREAMS=副            ~/Streams-ja.html
SVG2=副               ~/index.html#spec-list-svg
SVG11=副              ~/SVG11/
SVG11=副              ~/index.html#spec-list-svg●Level 2 日本語訳
MATHML=副             takamu.sakura.ne.jp/mathml3-ja/index.html●Version 3 日本語訳
MATHMLCORE=副         takamu.sakura.ne.jp/mathml-core-ja/index.html
SERVICEWORKERS=副     ~/service-workers-ja.html
URL=副                ~/URL-ja.html
URLPATTERN=副         ~/urlpattern-ja.html
UIEVENTS=副           ~/uievents-ja.html
POINTEREVENTS=副      ~/pointerevents-ja.html
POINTEREVENTS2=副     ~/pointerevents2-ja.html
POINTEREVENTS3=副     ~/pointerevents-ja.html●Level 4 日本語訳
WCAG20=・             ~TR/WCAG20/
WCAG20=主             waic.jp/translations/WCAG20/Overview.html
WCAG21=・             ~TR/WCAG21/
WCAG21=主             waic.jp/translations/WCAG21/
	WCAG21=主             waic.github.io/wcag21/guidelines/
WCAG22=・             ~TR/WCAG/
WCAG22=・             ~TR/WCAG22/
WCAG22=主             waic.jp/translations/WCAG22/
WEBANIMATIONS1=副     ~/web-animations-ja.html
WEBIDL=副             ~/WebIDL-ja.html
WEBSOCKETS=副         ~/WebSocket-ja.html
WEBSTORAGE=副         ~/WebStorage-ja.html
WORKERS=副            ~/Workers-ja.html
WORKLETS1=副          ~/worklets-ja.html
XHR=副                ~/XHR-ja.html
MIMESNIFF=副          ~/mimesniff-ja.html
XML11=副              ＃w4ard.eplusx.net/translation/W3C/REC-xml11-20060816/
XML10=・              ~TR/xml/
XML10=主              ＃w4ard.eplusx.net/translation/W3C/REC-xml-20081126/
XMLNS=副              ~/xml-names-ja.html
XMLSS=副              ~/xml-stylesheet-ja.html
XSLT=副               ~/XML/xslt10-ja.html
XSLT=副2              ~adagio/tr_xslt10/toc.htm
STORAGE=副            ~/storage-ja.html
`;

COMMON_DATA.REF_DATA2 = `
~TR/CSS22/●       ~momdoG/css2/
	~TR/SVG/●         triple-underscore.github.io/SVG11/
	~TR/SVG11/●       triple-underscore.github.io/SVG11/
	~HTMLLS/●          ~momdoG/html/
`;


// 文献 id 別名 -> 文献 id
COMMON_DATA.REF_KEY_MAP = `
DOM4:DOM
CSP:CSP3
CSS21:CSS2
CSS22:CSS2
CSSOM:CSSOM1
CSSOMVIEW:CSSOMVIEW1
GEOLOCATIONAPI:GEOLOCATION
HTTP:RFC9110
HTTPCACHING:RFC9111
HTTP1:RFC9112
JSON:RFC8259
MIX:MIXEDCONTENT
MEDIAFRAGS:MEDIAFRAG
SELECT:SELECTORS3
XMLHTTPREQUEST:XHR
STRUCTUREDFIELDS:RFC9651
HTML5:HTML
REPORTING:REPORTING1
SVG:SVG11
XML:XML10
XMLNAMES:XMLNS
XMLSTYLESHEET:XMLSS
ECMA262:ECMASCRIPT
URI:RFC3986
IDNA:RFC3490
IPV6:RFC4291
ABNF:RFC5234
COOKIES:RFC6265
TLS:RFC8446
SERVICEWORKERS1:SERVICEWORKERS
FEATUREPOLICY:PERMISSIONSPOLICY1
PERMISSIONSPOLICY:PERMISSIONSPOLICY1
PERFORMANCETIMELINE2:PERFORMANCETIMELINE
HRTIME2:HRTIME
HRTIME3:HRTIME
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
