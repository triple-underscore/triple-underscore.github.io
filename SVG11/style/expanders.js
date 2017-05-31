/* 
 element summary の表示を展開するためのスクリプト
各ページ共通の内容を圧縮するため、元ソースから改変して内容生成機能を追加
*/

function expand(event){
	var e = event.target;
	e.className = 'expanded';
	e.onclick = null;
	var key = e.previousSibling.getAttribute('href').split('#')[1];
	// 要素／属性のリストを生成してターゲットに追加
	var items = ELEMENT_SUMMARY_DATA[key];
	if(!items) return;
	var class_name = (key.indexOf('Element') >= 0) ?
		'element-name' : 'attr-name';
	var i = e.hasAttribute('title') ? 2 : 0;
		// i = 2: 唯一の例外（ a 要素の xlink 属性, TermXLinkAttributes）
	while(i < items.length){
		if(e.childNodes.length > 0){
			e.appendChild(document.createTextNode(', '));
		}
		var m = items[i++].split('=');
		var span = document.createElement('span');
		span.className = class_name;
		span.textContent = m[0];
		var a = document.createElement('a');
		a.setAttribute('href', m[1]);
		a.appendChild(span);
		e.appendChild(a);
	}
}

new function(){
	var l = document.getElementsByTagName('a');
	for(var i = 0; i < l.length; i++) {
		var a = l[i];
		if(a.className !== 'T-ex') continue;
		var span = a.nextSibling;
		if(!span || (span.nodeType !== 1)){
			span = document.createElement('span');
			a.parentNode.insertBefore(span, a.nextSibling);
		}
		span.className = 'expander';
		span.onclick = expand;
	}
}


// 生成データ（要素/属性名=リンク先）
var ELEMENT_SUMMARY_DATA = {
	//記述要素 
	TermDescriptiveElement: [
'desc=struct.html#DescElement',
'metadata=metadata.html#MetadataElement',
'title=struct.html#TitleElement'
],
	//アニメーション要素 
	TermAnimationElement: [
'animate=animate.html#AnimateElement',
'animateColor=animate.html#AnimateColorElement',
'animateMotion=animate.html#AnimateMotionElement',
'animateTransform=animate.html#AnimateTransformElement',
'set=animate.html#SetElement'
],
	//図形要素 
	TermShapeElement: [
'circle=shapes.html#CircleElement',
'ellipse=shapes.html#EllipseElement',
'line=shapes.html#LineElement',
'path=paths.html#PathElement',
'polygon=shapes.html#PolygonElement',
'polyline=shapes.html#PolylineElement',
'rect=shapes.html#RectElement'
],
	//構造要素
	TermStructuralElement: [
'defs=struct.html#DefsElement',
'g=struct.html#GElement',
'svg=struct.html#SVGElement',
'symbol=struct.html#SymbolElement',
'use=struct.html#UseElement'
],
	//グラデーション要素 
	TermGradientElement: [
'linearGradient=pservers.html#LinearGradientElement',
'radialGradient=pservers.html#RadialGradientElement'
],
	//原始フィルタ要素 
	TermFilterPrimitiveElement: [
'feBlend=filters.html#feBlendElement',
'feColorMatrix=filters.html#feColorMatrixElement',
'feComponentTransfer=filters.html#feComponentTransferElement',
'feComposite=filters.html#feCompositeElement',
'feConvolveMatrix=filters.html#feConvolveMatrixElement',
'feDiffuseLighting=filters.html#feDiffuseLightingElement',
'feDisplacementMap=filters.html#feDisplacementMapElement',
'feFlood=filters.html#feFloodElement',
'feGaussianBlur=filters.html#feGaussianBlurElement',
'feImage=filters.html#feImageElement',
'feMerge=filters.html#feMergeElement',
'feMorphology=filters.html#feMorphologyElement',
'feOffset=filters.html#feOffsetElement',
'feSpecularLighting=filters.html#feSpecularLightingElement',
'feTile=filters.html#feTileElement',
'feTurbulence=filters.html#feTurbulenceElement'
],
	//テキスト内容子要素 
	TermTextContentChildElement: [
'altGlyph=text.html#AltGlyphElement',
'textPath=text.html#TextPathElement',
'tref=text.html#TRefElement',
'tspan=text.html#TSpanElement'
],
	//条件付き処理属性 
	TermConditionalProcessingAttribute: [
'requiredFeatures=struct.html#RequiredFeaturesAttribute',
'requiredExtensions=struct.html#RequiredExtensionsAttribute',
'systemLanguage=struct.html#SystemLanguageAttribute'
],
	//コア属性 
	TermCoreAttributes: [
'id=struct.html#IDAttribute',
'xml:base=struct.html#XMLBaseAttribute',
'xml:lang=struct.html#XMLLangAttribute',
'xml:space=struct.html#XMLSpaceAttribute'
],
	//アニメーション属性対象属性 
	TargetAttributes: [
'attributeType=animate.html#AttributeTypeAttribute',
'attributeName=animate.html#AttributeNameAttribute'
],
	//アニメーションタイミング属性 
	TimingAttributes: [
'begin=animate.html#BeginAttribute',
'dur=animate.html#DurAttribute',
'end=animate.html#EndAttribute',
'min=animate.html#MinAttribute',
'max=animate.html#MaxAttribute',
'restart=animate.html#RestartAttribute',
'repeatCount=animate.html#RepeatCountAttribute',
'repeatDur=animate.html#RepeatDurAttribute',
'fill=animate.html#FillAttribute'
],
	//アニメーション値属性 
	ValueAttributes: [
'calcMode=animate.html#CalcModeAttribute',
'values=animate.html#ValuesAttribute',
'keyTimes=animate.html#KeyTimesAttribute',
'keySplines=animate.html#KeySplinesAttribute',
'from=animate.html#FromAttribute',
'to=animate.html#ToAttribute',
'by=animate.html#ByAttribute'
],
	//アニメーション加法属性 
	AdditionAttributes: [
'additive=animate.html#AdditiveAttribute',
'accumulate=animate.html#AccumulateAttribute'
],
	//アニメーションイベント属性 
	TermAnimationEventAttribute: [
'onbegin=script.html#OnBeginEventAttribute',
'onend=script.html#OnEndEventAttribute',
'onrepeat=script.html#OnRepeatEventAttribute',
'onload=script.html#OnLoadEventAttribute'
],

	//グラフィカルイベント属性 
	TermGraphicalEventAttribute: [
'onfocusin=script.html#OnFocusInEventAttribute',
'onfocusout=script.html#OnFocusOutEventAttribute',
'onactivate=script.html#OnActivateEventAttribute',
'onclick=script.html#OnClickEventAttribute',
'onmousedown=script.html#OnMouseDownEventAttribute',
'onmouseup=script.html#OnMouseUpEventAttribute',
'onmouseover=script.html#OnMouseOverEventAttribute',
'onmousemove=script.html#OnMouseMoveEventAttribute',
'onmouseout=script.html#OnMouseOutEventAttribute',
'onload=script.html#OnLoadEventAttribute'
],
	//プレゼンテーション属性 
	TermPresentationAttribute: [
'alignment-baseline=text.html#AlignmentBaselineProperty',
'baseline-shift=text.html#BaselineShiftProperty',
'clip=masking.html#ClipProperty',
'clip-path=masking.html#ClipPathProperty',
'clip-rule=masking.html#ClipRuleProperty',
'color=color.html#ColorProperty',
'color-interpolation=painting.html#ColorInterpolationProperty',
'color-interpolation-filters=painting.html#ColorInterpolationFiltersProperty',
'color-profile=color.html#ColorProfileProperty',
'color-rendering=painting.html#ColorRenderingProperty',
'cursor=interact.html#CursorProperty',
'direction=text.html#DirectionProperty',
'display=painting.html#DisplayProperty',
'dominant-baseline=text.html#DominantBaselineProperty',
'enable-background=filters.html#EnableBackgroundProperty',
'fill=painting.html#FillProperty',
'fill-opacity=painting.html#FillOpacityProperty',
'fill-rule=painting.html#FillRuleProperty',
'filter=filters.html#FilterProperty',
'flood-color=filters.html#FloodColorProperty',
'flood-opacity=filters.html#FloodOpacityProperty',
'font-family=text.html#FontFamilyProperty',
'font-size=text.html#FontSizeProperty',
'font-size-adjust=text.html#FontSizeAdjustProperty',
'font-stretch=text.html#FontStretchProperty',
'font-style=text.html#FontStyleProperty',
'font-variant=text.html#FontVariantProperty',
'font-weight=text.html#FontWeightProperty',
'glyph-orientation-horizontal=text.html#GlyphOrientationHorizontalProperty',
'glyph-orientation-vertical=text.html#GlyphOrientationVerticalProperty',
'image-rendering=painting.html#ImageRenderingProperty',
'kerning=text.html#KerningProperty',
'letter-spacing=text.html#LetterSpacingProperty',
'lighting-color=filters.html#LightingColorProperty',
'marker-end=painting.html#MarkerEndProperty',
'marker-mid=painting.html#MarkerMidProperty',
'marker-start=painting.html#MarkerStartProperty',
'mask=masking.html#MaskProperty',
'opacity=masking.html#OpacityProperty',
'overflow=masking.html#OverflowProperty',
'pointer-events=interact.html#PointerEventsProperty',
'shape-rendering=painting.html#ShapeRenderingProperty',
'stop-color=pservers.html#StopColorProperty',
'stop-opacity=pservers.html#StopOpacityProperty',
'stroke=painting.html#StrokeProperty',
'stroke-dasharray=painting.html#StrokeDasharrayProperty',
'stroke-dashoffset=painting.html#StrokeDashoffsetProperty',
'stroke-linecap=painting.html#StrokeLinecapProperty',
'stroke-linejoin=painting.html#StrokeLinejoinProperty',
'stroke-miterlimit=painting.html#StrokeMiterlimitProperty',
'stroke-opacity=painting.html#StrokeOpacityProperty',
'stroke-width=painting.html#StrokeWidthProperty',
'text-anchor=text.html#TextAnchorProperty',
'text-decoration=text.html#TextDecorationProperty',
'text-rendering=painting.html#TextRenderingProperty',
'unicode-bidi=text.html#UnicodeBidiProperty',
'visibility=painting.html#VisibilityProperty',
'word-spacing=text.html#WordSpacingProperty',
'writing-mode=text.html#WritingModeProperty'
],
	//原始フィルタ属性 
	TermFilterPrimitiveAttributes: [
'x=filters.html#FilterPrimitiveXAttribute',
'y=filters.html#FilterPrimitiveYAttribute',
'width=filters.html#FilterPrimitiveWidthAttribute',
'height=filters.html#FilterPrimitiveHeightAttribute',
'result=filters.html#FilterPrimitiveResultAttribute'
],
	//転写関数要素属性 
	TransferFunctionElementAttributes: [
'type=filters.html#feComponentTransferTypeAttribute',
'tableValues=filters.html#feComponentTransferTableValuesAttribute',
'slope=filters.html#feComponentTransferSlopeAttribute',
'intercept=filters.html#feComponentTransferInterceptAttribute',
'amplitude=filters.html#feComponentTransferAmplitudeAttribute',
'exponent=filters.html#feComponentTransferExponentAttribute',
'offset=filters.html#feComponentTransferOffsetAttribute'
],
	//文書イベント属性 
	TermDocumentEventAttribute: [
'onunload=script.html#OnUnloadEventAttribute',
'onabort=script.html#OnAbortEventAttribute',
'onerror=script.html#OnErrorEventAttribute',
'onresize=script.html#OnResizeEventAttribute',
'onscroll=script.html#OnScrollEventAttribute',
'onzoom=script.html#OnZoomEventAttribute'
],
	//xlink 属性
/*
	xlink:href は要素ごとにリンク先が別々なのでインラインに記述
	'a' 要素は (linking.html#AElementXLinkHrefAttribute) は
	show, actuate のリンク先も異なるのでインラインに記述／特別扱い
*/
	TermXLinkAttributes: [
'xlink:show=linking.html#XLinkShowAttribute',
'xlink:actuate=linking.html#XLinkActuateAttribute',
'xlink:type=linking.html#XLinkTypeAttribute',
'xlink:role=linking.html#XLinkRoleAttribute',
'xlink:arcrole=linking.html#XLinkArcRoleAttribute',
'xlink:title=linking.html#XLinkTitleAttribute'
]
}


/* 原文表示制御用 */
function toggle_view(event){
	var target = (event && event.target) || window.event.srcElement;
	while(target){
		if(!target.getAttribute) return;
		if(target.getAttribute('lang') === 'en') return;
		if(/^T($|\s)/.test(target.className)) {
// http://www.w3.org/TR/ElementTraversal/
			var en = target.lastElementChild;
			if(!en || en.getAttribute('lang') !== 'en') return;
			en.style.display = en.style.display ? '' : 'block';
			return;
		}
		target = target.parentNode;
	}
}

// 原文のみ表示（ diff 比較用）
function repeat(selector, callback){
	var elements = document.querySelectorAll(selector);
	var L = elements.length;
	for(var i = 0; i < L; i++){
		callback(elements.item(i));
	}
}

window.onload = 
function init(){
	// 原文表示開閉イベントハンドラ
	document.body.ondblclick = toggle_view;

	// 表示モード（デフォルト： 0）
	var view_mode = 0;
	var view_options = ['hide_original', 'show_original'];
	var view_desc = ['常に隠す（本文ダブルクリックで開閉）', '常に表示'];
	// DOM Storage オプション（利用者設定保存用）
	var storage_available = true;
	var storage_key = 'svg11-2nd-view_mode';

	//コントロール構築
	var div = document.createElement('div');
	div.id = 'view_control';
	div.innerHTML = 

'<input type="button" tabindex="1" accesskey="Z" value="原文" />' + 
'<span id="view_options" style="font-size:smaller;"> 表示モード: <span id="view_desc">-</span>' + 
'<span style="color:gray;" >（変更はクリック／アクセスキー(Z)）</span></span>';

	// 表示モード切替イベントハンドラ
	div.firstChild.onclick = function(){
		switch_mode((view_mode + 1) % view_options.length);
	}
	document.body.appendChild(div);
	div = null;
	switch_mode(load_mode());

	// 表示モード切替
	function switch_mode(mode){
		if(mode === view_mode) return;
		// 表示中の要素をあらかじめ取得
		var pos = get_scroll_position(document.body);
		view_mode = mode;
		document.body.className = view_options[mode];
		document.getElementById('view_desc').textContent = view_desc[mode];
		save_mode(view_mode);
		// 切替後に直前に表示されていた場所へスクロール
		if(pos) resore_scroll_position(pos);
	}


// 現在中央付近に表示中の要素とそのウィンドウ上端からのオフセットを取得
	function get_scroll_position(p){
		if(! p.getBoundingClientRect) return null;
//		var h = (window.innerHeight || screen.availHeight || 600) / 2;
		var e = p.firstElementChild;
		var offset = 0;
		while(e){
			var r = rect(e);
			if(r) {
				offset = r.top;
				p = e;
				if(r.bottom > 0) {
					e = p.firstElementChild;
					continue;
				}
			}
			e = e.nextElementSibling;
		}
//		p.style.outline = 'solid red 1px';
		return {element: p, offset: offset};
	}

// 表示切替後に直前に表示されていた場所へスクロール
	function resore_scroll_position(pos){
		var e = pos.element;
		for(var e = pos.element; ! rect(e); e = e.nextElementSibling){
			while(! e.nextElementSibling) {
				e = e.parentNode;
				if(! e) return;
			}
		}
		e.scrollIntoView();
		window.scrollBy(0, - pos.offset);
	}

// 要素のウィンドウ内の表示位置
// 表示位置が文書順と整合していない場合は null を返す
	function rect(e){
		if(e.id == 'view_control') return null;// position: fixed
// http://www.w3.org/TR/cssom-view/#dom-range-getboundingclientrect
		var r = e.getBoundingClientRect();
		if(r.top || r.bottom) return r;
		return null; // 未表示
	}


	// 表示モード設定を DOM Storage から読み込む
	// http://dev.w3.org/html5/webstorage/
	function load_mode(){
		var mode;
		try {
// FF ではページがローカル上のときは sessionStorage が無効
			mode = window.sessionStorage.getItem(storage_key);
		}
		catch(e){
			storage_available = false;
		}
		mode = parseInt(mode);
		if(isNaN(mode) || mode < 0 || mode >= view_options.length) return 0;
		return mode;
	}
	// 表示モード設定を DOM Storage に保存
	function save_mode(mode){
		if(!storage_available) return;
		try {
			window.sessionStorage.setItem(storage_key, view_mode);
		}
		catch(e){
			storage_available = false;
		}
	};
}

/** 外部リンク日本語訳表示

*/

new function(){
	var JA_LINKS = {
// SMIL Animation
'http://www.w3.org/TR/2001/REC-smil-animation-20010904/':
	'smil-animation.html',
// SVG2
// 'http://www.w3.org/TR/2012/WD-SVG2-20120828/':
// 'http://www.w3.org/TR/2013/WD-SVG2-20130409/':
'http://www.w3.org/TR/SVG2/':
	'./',
// CSS2
'http://www.w3.org/TR/CSS2/':
	'https://momdo.github.io/css2/Overview.html',
	//'http://www.y-adagio.com/public/standards/tr_css2/toc.html',
'http://www.w3.org/TR/2008/REC-CSS2-20080411/':
	'https://momdo.github.io/css2/Overview.html',
/*	colors.html generate.html media.html cascade.html
	visufx.html visudet.html about.html aural.html colors.html
	conform.html text.html ui.html visuren.html
*/

'http://www.w3.org/TR/2008/REC-CSS2-20080411/fonts.html':
	'http://www.y-adagio.com/public/standards/tr_css2/fonts.html',
'http://www.w3.org/TR/2008/REC-CSS2-20080411/syndata.html':
	'http://www.y-adagio.com/public/standards/tr_css2/syndata.html',
//		#q4, #q8, #x66
'http://www.w3.org/TR/2008/REC-CSS2-20080411/grammar.html':
	'http://www.y-adagio.com/public/standards/tr_css2/grammar.html',
'http://www.w3.org/TR/2008/REC-CSS2-20080411/selector.html':
	'http://www.y-adagio.com/public/standards/tr_css2/selector.html',
'http://www.w3.org/TR/2008/REC-CSS2-20080411/tables.html':
	'http://www.y-adagio.com/public/standards/tr_css2/tables.html',

//DOM2Core
'http://www.w3.org/TR/DOM-Level-2-Core/':
	'http://www.y-adagio.com/public/standards/tr_dom2_core/Overview.html',
	//http://www2u.biglobe.ne.jp/~oz-07ams/2003/Core/index.html
'http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/':
	'http://www.y-adagio.com/public/standards/tr_dom2_core/Overview.html',

//DOM2Style/css
'http://www.w3.org/TR/2000/REC-DOM-Level-2-Style-20001113/css.html':
	'http://www2u.biglobe.ne.jp/~oz-07ams/2001/CSS/index.html',
	// css.html#XXX -> CSS/XXX.html

//DOM2Events
'http://www.w3.org/TR/DOM-Level-2-Events/':
	'http://www.y-adagio.com/public/standards/tr_dom2_events/Overview.html',
'http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/':
	'http://www.y-adagio.com/public/standards/tr_dom2_events/Overview.html',
	// events.html, ecma-script-binding.html
	//http://www2u.biglobe.ne.jp/~oz-07ams/2001/Events/index.html

// XML
'http://www.w3.org/TR/REC-xml/':
	'http://w4ard.s26.xrea.com/translation/W3C/REC-xml-20081126/',
'http://www.w3.org/TR/2008/REC-xml-20081126/':
	'http://w4ard.s26.xrea.com/translation/W3C/REC-xml-20081126/',

'http://www.w3.org/1999/06/REC-xml-stylesheet-19990629/':
	'https://triple-underscore.github.io/XML/xml-stylesheet-ja.html',

'http://www.w3.org/TR/xmlbase/':
//	'http://www.toyfish.net/docs/xmlbase/',
	'https://triple-underscore.github.io/XML/xml-base-ja.html',
'http://www.w3.org/TR/2009/REC-xmlbase-20090128/':
//	'http://www.toyfish.net/docs/xmlbase/',
	'https://triple-underscore.github.io/XML/xml-base-ja.html',

'http://www.w3.org/TR/2006/REC-xml-names-20060816/':
	'https://triple-underscore.github.io/XML/xml-ns-ja.html',
'http://www.w3.org/TR/REC-xml-names/':
	'https://triple-underscore.github.io/XML/xml-ns-ja.html',
'http://www.w3.org/TR/xml-names11/':
	'https://triple-underscore.github.io/XML/xml-ns-ja.html?1.1'

	};
	var ja_link = document.createElement('a');
	ja_link.textContent = '【訳】';
	ja_link.style.backgroundColor = '#FF3';
	ja_link.style.color = 'green';
	
	var rxp = /^(http:\/\/[\w\.\-\/]+\/)([\w\.\-]+)?(#.*)?/;
	
	function insert_ja_link(event){
		var a = event.target;
		if(a.tagName !== 'A') {
			a = a.parentNode;
			if(a.tagName !== 'A') return;
		}
		var m = (a.getAttribute('href') || '').match(rxp);
		if(!m) return;
		var path = m[1];
		var name = m[2] || '';
		var hash = m[3] || '';
		var ja_url = JA_LINKS[path + name];
		if(! ja_url ) {
			ja_url = JA_LINKS[path];
			if(!ja_url) return;
			// replace name part
			ja_url = ja_url.replace(/[^\/]*$/, name);
		}
		ja_link.setAttribute('href', ja_url + hash);
		a.parentNode.insertBefore(ja_link, a.nextSibling);
	}
	
	window.addEventListener('load', function(){
		document.body.addEventListener('mouseover', insert_ja_link, false);
		document.body.addEventListener('focus', insert_ja_link, true);
	}, false);

}

/* for text diff 

function del_j(){
	repeat('span[lang="en"]', function(en){
		var p = en.parentNode;
		p.textContent = en.textContent.trim();
	});
}

window.onload = del_j;
*/
