'use strict';

const source_data = {
	toc_main: 'MAIN',
	collectParts: Util.collectParts,
	init: EMPTY_FUNC,
};

Util.ready = function(){
//	source_data.section_map = Util.get_mapping(PAGE_DATA.section_map || '');
	source_data.init();
	Util.switchWordsInit(source_data);

	/* 展開状態で保存されたページがこの script を読み込まないようにする */
	repeat('script[src="svg-common.js"]', function(e){
		e.parentNode.removeChild(e);
	});
};

// source_data.populate = function(){};

source_data.generate = function(){
	const class_map = this.class_map;
	const tag_map = this.tag_map;

	const link_map = this.link_map;

	return this.html.replace(
		/%[\w\-~一-鿆]+|`(.+?)([$@\^])(\w*)/g,
		create_html
	);

	function create_html(match, key, indicator, klass){
if(!indicator) {//%
	return '<var>' + match.slice(1) + '</var>';
}

let text = key;
let href = '';
let classname = class_map[klass];
let tag = tag_map[klass];

switch(klass){
case 'r': // ref
	text = '[' + key + ']';
	href = 'svg-refs.html#ref-' + key.toLowerCase();
	break;
case 't': // type
	text = '&lt;' + text + '&gt;';
	break;
case 'ps': // pseudo-class
	text = ':' + text;
	break;
case 'pe': // pseudo-element
	text = '::' + text;
	break;
case 'at': // at-rule
	text = '@' + text;
	break;
case 'l': // literal
	text = '"<code class="literal">' + text + '</code>"';
	break;
case 'U': // 
	text = 'U+' + key;
	break;
case 'sec':
	text = '§ ' + text;
	break;
case 'viewAs':
	return `<p><a href="~SVG2/images/${key}">~viewAs</a></p>`
	break;
case 'dgm':
	return '<a id="_dgm-' + key + '">＊</a>';
	break;
case 'refer':
	text = '~~参照先';
	href = key;
	break;
case 'ACTION':
	text = 'ACTION-' + key;
	href = 'http://www.w3.org/Graphics/SVG/WG/track/actions/' + key;
	break;
case 'en': // english words
	return '<span lang="en-x-a0">' + key + '</span>'
	break;
default:
	if(classname === 'dom'){
		classname = '';
		const n = text.indexOf('(');
		if(n > 0){
			key = text.slice(0, n);
			text = key + text.slice(n).replace(/\w+/g, '<var>$&</var>');
		}
		break;
	}
}

if(tag) {
	classname = classname ? ' class="' + classname + '"' : '';
	text = `<${tag}${classname}>${text}</${tag}>`;
}


if(indicator !== '^'){
	href = link_map[klass ? (klass + '.' + key) : key] || href;
	if(!href){
		console.log(match); // check error
		return match;
	}

	switch(indicator){
	case '$':
		text = `<a href="${href}">${text}</a>`;
		break;
	case '@':
		text = `<dfn id="${href.slice(1)}">${text}</dfn>`;
		break;
	default:
		console.log(match);
		return match;
	}
}

return text;

	}
};

/** class/tag mapping */
COMMON_DATA.class_map += `
e:element
eH:element
a:attr
p:property
v:value
t:type
et:event-type
at:at-rule
ps:pseudo
pe:pseudo
css:css
f:func
xl:ex-label
`

COMMON_DATA.tag_map += `
I:code
m:code
p:code
v:code
e:code
eH:code
a:code
c:code
et:code
at:code
ps:code
pe:code
t:var
css:code
V:var
xl:i
`

// ●link
COMMON_DATA.link_map += `

	●IDL
I.Document:~DOM4#document
I.Window:~WINDOW#window
I.Element:~DOM4#element

I.GetSVGDocument:~SVGstruct#InterfaceGetSVGDocument
I.SVGAElement:~SVGlinking#InterfaceSVGAElement
I.SVGAngle:~SVGtypes#InterfaceSVGAngle
I.SVGAnimatedAngle:~SVGtypes#InterfaceSVGAnimatedAngle
I.SVGAnimatedBoolean:~SVGtypes#InterfaceSVGAnimatedBoolean
I.SVGAnimatedEnumeration:~SVGtypes#InterfaceSVGAnimatedEnumeration
I.SVGAnimatedInteger:~SVGtypes#InterfaceSVGAnimatedInteger
I.SVGAnimatedLength:~SVGtypes#InterfaceSVGAnimatedLength
I.SVGAnimatedLengthList:~SVGtypes#InterfaceSVGAnimatedLengthList
I.SVGAnimatedNumber:~SVGtypes#InterfaceSVGAnimatedNumber
I.SVGAnimatedNumberList:~SVGtypes#InterfaceSVGAnimatedNumberList
I.SVGAnimatedPoints:~SVGshapes#InterfaceSVGAnimatedPoints
I.SVGAnimatedPreserveAspectRatio:~SVGcoords#InterfaceSVGAnimatedPreserveAspectRatio
I.SVGAnimatedRect:~SVGtypes#InterfaceSVGAnimatedRect
I.SVGAnimatedString:~SVGtypes#InterfaceSVGAnimatedString
I.SVGAnimatedTransformList:~SVGcoords#InterfaceSVGAnimatedTransformList
I.SVGBoundingBoxOptions:~SVGtypes#SVGBoundingBoxOptions
I.SVGCircleElement:~SVGshapes#InterfaceSVGCircleElement
I.SVGDefsElement:~SVGstruct#InterfaceSVGDefsElement
I.SVGDescElement:~SVGstruct#InterfaceSVGDescElement
I.SVGDocument:~SVGstruct#InterfaceDocumentExtensions
I.SVGElement:~SVGtypes#InterfaceSVGElement
I.SVGElementInstance:~SVGstruct#InterfaceSVGElementInstance
I.SVGEllipseElement:~SVGshapes#InterfaceSVGEllipseElement
I.SVGFitToViewBox:~SVGtypes#InterfaceSVGFitToViewBox
I.SVGForeignObjectElement:~SVGembedded#InterfaceSVGForeignObjectElement
I.SVGGElement:~SVGstruct#InterfaceSVGGElement
I.SVGGeometryElement:~SVGtypes#InterfaceSVGGeometryElement
I.SVGGradientElement:~SVGpservers#InterfaceSVGGradientElement
I.SVGGraphicsElement:~SVGtypes#InterfaceSVGGraphicsElement
I.SVGImageElement:~SVGembedded#InterfaceSVGImageElement
I.SVGLength:~SVGtypes#InterfaceSVGLength
I.SVGLengthList:~SVGtypes#InterfaceSVGLengthList
I.SVGLineElement:~SVGshapes#InterfaceSVGLineElement
I.SVGLinearGradientElement:~SVGpservers#InterfaceSVGLinearGradientElement
I.SVGMarkerElement:~SVGpainting#InterfaceSVGMarkerElement
I.SVGMetadataElement:~SVGstruct#InterfaceSVGMetadataElement
I.SVGNameList:~SVGtypes#ListInterfaces
I.SVGNumber:~SVGtypes#InterfaceSVGNumber
I.SVGNumberList:~SVGtypes#InterfaceSVGNumberList
I.SVGPathElement:~SVGpaths#InterfaceSVGPathElement
I.SVGPatternElement:~SVGpservers#InterfaceSVGPatternElement
I.SVGPointList:~SVGshapes#InterfaceSVGPointList
I.SVGPolygonElement:~SVGshapes#InterfaceSVGPolygonElement
I.SVGPolylineElement:~SVGshapes#InterfaceSVGPolylineElement
I.SVGPreserveAspectRatio:~SVGcoords#InterfaceSVGPreserveAspectRatio
I.SVGRadialGradientElement:~SVGpservers#InterfaceSVGRadialGradientElement
I.SVGRectElement:~SVGshapes#InterfaceSVGRectElement
I.SVGSVGElement:~SVGstruct#InterfaceSVGSVGElement
I.SVGScriptElement:~SVGinteract#InterfaceSVGScriptElement
I.SVGStopElement:~SVGpservers#InterfaceSVGStopElement
I.SVGStringList:~SVGtypes#InterfaceSVGStringList
I.SVGStyleElement:~SVGstyling#InterfaceSVGStyleElement
I.SVGSwitchElement:~SVGstruct#InterfaceSVGSwitchElement
I.SVGSymbolElement:~SVGstruct#InterfaceSVGSymbolElement
I.SVGTSpanElement:~SVGtext#InterfaceSVGTSpanElement
I.SVGTests:~SVGtypes#InterfaceSVGTests
I.SVGTextContentElement:~SVGtext#InterfaceSVGTextContentElement
I.SVGTextElement:~SVGtext#InterfaceSVGTextElement
I.SVGTextPathElement:~SVGtext#InterfaceSVGTextPathElement
I.SVGTextPositioningElement:~SVGtext#InterfaceSVGTextPositioningElement
I.SVGTitleElement:~SVGstruct#InterfaceSVGTitleElement
I.SVGTransform:~SVGcoords#InterfaceSVGTransform
I.SVGTransformList:~SVGcoords#InterfaceSVGTransformList
I.SVGURIReference:~SVGtypes#InterfaceSVGURIReference
I.SVGUnitTypes:~SVGtypes#InterfaceSVGUnitTypes
I.SVGUnknownElement:~SVGstruct#InterfaceSVGUnknownElement
I.SVGUseElement:~SVGstruct#InterfaceSVGUseElement
I.SVGUseElementShadowRoot:~SVGstruct#InterfaceSVGUseElementShadowRoot
I.SVGViewElement:~SVGlinking#InterfaceSVGViewElement
I.SVGZoomAndPan:~SVGtypes#InterfaceSVGZoomAndPan
I.ShadowAnimation:~SVGstruct#InterfaceShadowAnimation


I.LinkStyle:~CSSOM1#the-linkstyle-interface

	●e
e.a:~SVGlinking#AElement
e.animate:~SVGanim#AnimateElement
e.animateMotion:~SVGanim#AnimateMotionElement
e.animateTransform:~SVGanim#AnimateTransformElement
e.audio:~SVGembedded#HTMLElements
e.canvas:~SVGembedded#HTMLElements
e.circle:~SVGshapes#CircleElement
e.clipPath:~MASKING1#ClipPathElement
e.defs:~SVGstruct#DefsElement
e.desc:~SVGstruct#DescElement
e.discard:~SVGanim#DiscardElement
e.ellipse:~SVGshapes#EllipseElement
e.foreignObject:~SVGembedded#ForeignObjectElement
e.g:~SVGstruct#GElement
e.iframe:~SVGembedded#HTMLElements
e.image:~SVGembedded#ImageElement
e.line:~SVGshapes#LineElement
e.linearGradient:~SVGpservers#LinearGradientElement
e.marker:~SVGpainting#MarkerElement
e.mask:~MASKING1#MaskElement
e.metadata:~SVGstruct#MetadataElement
e.mpath:~SVGanim#MPathElement
e.path:~SVGpaths#PathElement
e.pattern:~SVGpservers#PatternElement
e.polygon:~SVGshapes#PolygonElement
e.polyline:~SVGshapes#PolylineElement
e.radialGradient:~SVGpservers#RadialGradientElement
e.rect:~SVGshapes#RectElement
e.script:~SVGinteract#ScriptElement
e.set:~SVGanim#SetElement
e.stop:~SVGpservers#StopElement
e.style:~SVGstyling#StyleElement
e.svg:~SVGstruct#SVGElement
e.switch:~SVGstruct#SwitchElement
e.symbol:~SVGstruct#SymbolElement
e.text:~SVGtext#TextElement
e.textPath:~SVGtext#TextPathElement
e.title:~SVGstruct#TitleElement
e.tspan:~SVGtext#TextElement
e.unknown:~SVGstruct#UnknownElement
e.use:~SVGstruct#UseElement
e.video:~SVGembedded#HTMLElements
e.view:~SVGlinking#ViewElement

e.feBlend:~FILTEREFFECTS1#feBlendElement
e.feColorMatrix:~FILTEREFFECTS1#feColorMatrixElement
e.feComponentTransfer:~FILTEREFFECTS1#feComponentTransferElement
e.feComposite:~FILTEREFFECTS1#feCompositeElement
e.feConvolveMatrix:~FILTEREFFECTS1#feConvolveMatrixElement
e.feDiffuseLighting:~FILTEREFFECTS1#feDiffuseLightingElement
e.feDisplacementMap:~FILTEREFFECTS1#feDisplacementMapElement
e.feDistantLight:~FILTEREFFECTS1#feDistantLightElement
e.feDropShadow:~FILTEREFFECTS1#feDropShadowElement
e.feFlood:~FILTEREFFECTS1#feFloodElement
e.feFuncA:~FILTEREFFECTS1#feFuncAElement
e.feFuncB:~FILTEREFFECTS1#feFuncBElement
e.feFuncG:~FILTEREFFECTS1#feFuncGElement
e.feFuncR:~FILTEREFFECTS1#feFuncRElement
e.feGaussianBlur:~FILTEREFFECTS1#feGaussianBlurElement
e.feImage:~FILTEREFFECTS1#feImageElement
e.feMerge:~FILTEREFFECTS1#feMergeElement
e.feMergeNode:~FILTEREFFECTS1#elementdef-femergenode
e.feMorphology:~FILTEREFFECTS1#feMorphologyElement
e.feOffset:~FILTEREFFECTS1#feOffsetElement
e.fePointLight:~FILTEREFFECTS1#fePointLightElement
e.feSpecularLighting:~FILTEREFFECTS1#feSpecularLightingElement
e.feSpotLight:~FILTEREFFECTS1#feSpotLightElement
e.feTile:~FILTEREFFECTS1#feTileElement
e.feTurbulence:~FILTEREFFECTS1#feTurbulenceElement
e.filter:~FILTEREFFECTS1#FilterElement



	●p

p.alignment-baseline:~SVGtext#AlignmentBaselineProperty
p.baseline-shift:~SVGtext#BaselineShiftProperty
p.clip-path:~MASKING1#propdef-clip-path
p.clip-rule:~MASKING1#propdef-clip-rule
p.clip:~MASKING1#propdef-clip
p.color-interpolation-filters:~FILTEREFFECTS1#propdef-color-interpolation-filters
p.color-interpolation:~SVGpainting#ColorInterpolationProperty
p.color-rendering:~SVGpainting#ColorRenderingProperty
p.color:~SVGpainting#ColorProperty
p.cursor:~CSSUI#propdef-cursor
p.cx:~SVGgeometry#CxProperty
p.cy:~SVGgeometry#CyProperty
p.d:~SVGpaths#DProperty
p.direction:~SVGtext#DirectionProperty
p.display:~SVGrender#VisibilityControl
p.dominant-baseline:~SVGtext#DominantBaselineProperty
p.fill-opacity:~SVGpainting#FillOpacityProperty
p.fill-rule:~SVGpainting#FillRuleProperty
p.fill:~SVGpainting#FillProperty
p.filter:~FILTEREFFECTS1#propdef-filter
p.flood-color:~FILTEREFFECTS1#propdef-flood-color
p.flood-opacity:~FILTEREFFECTS1#propdef-flood-opacity
p.font:~CSSFONT#propdef-font
p.font-feature-settings:~CSSFONT#propdef-font-feature-settings
p.font-kerning:~CSSFONT#propdef-font-kerning
p.font-family:~CSSFONT#propdef-font-family
p.font-size-adjust:~CSSFONT#propdef-font-size-adjust
p.font-size:~CSSFONT#propdef-font-size
p.font-stretch:~CSSFONT#propdef-font-stretch
p.font-style:~CSSFONT#propdef-font-style
p.font-variant:~SVGtext#FontVariantProperty
p.font-weight:~CSSFONT#propdef-font-weight
p.glyph-orientation-horizontal:~SVGtext#GlyphOrientationHorizontalProperty
p.glyph-orientation-vertical:~SVGtext#GlyphOrientationVerticalProperty
p.height:~SVGgeometry#Sizing
p.image-rendering:~SVGpainting#ImageRenderingProperty
p.inline-size:~SVGtext#InlineSizeProperty
p.letter-spacing:~CSSTEXT#propdef-letter-spacing
p.lighting-color:~FILTEREFFECTS1#propdef-lighting-color
p.isolation:~COMPOSITING#isolation
p.marker-end:~SVGpainting#MarkerEndProperty
p.marker-mid:~SVGpainting#MarkerMidProperty
p.marker-start:~SVGpainting#MarkerStartProperty
p.mask:~MASKING1#propdef-mask
p.object-fit:~CSSIMAGE#propdef-object-fit
p.object-position:~CSSIMAGE#propdef-object-position
p.opacity:~SVGrender#ObjectAndGroupOpacityProperties
p.overflow:~SVGrender#OverflowAndClipProperties
p.paint-order:~SVGpainting#PaintOrderProperty
p.pointer-events:~SVGinteract#PointerEventsProperty
p.property:~SVGstyling#TermProperty
p.r:~SVGgeometry#RProperty
p.rx:~SVGgeometry#RxProperty
p.ry:~SVGgeometry#RyProperty
p.shape-inside:~SVGtext#TextShapeInside
p.shape-rendering:~SVGpainting#ShapeRenderingProperty
p.shape-subtract:~SVGtext#TextShapeSubtract
p.stop-color:~SVGpservers#StopColorProperty
p.stop-opacity:~SVGpservers#StopOpacityProperty
p.stroke-dasharray:~SVGpainting#StrokeDasharrayProperty
p.stroke-dashoffset:~SVGpainting#StrokeDashoffsetProperty
p.stroke-linecap:~SVGpainting#StrokeLinecapProperty
p.stroke-linejoin:~SVGpainting#StrokeLinejoinProperty
p.stroke-miterlimit:~SVGpainting#StrokeMiterlimitProperty
p.stroke-opacity:~SVGpainting#StrokeOpacityProperty
p.stroke-width:~SVGpainting#StrokeWidthProperty
p.stroke:~SVGpainting#StrokeProperty
p.text-align-last:~CSSTEXT#propdef-text-align-last
p.text-align:~CSSTEXT#propdef-text-align
p.text-anchor:~SVGtext#TextAnchorProperty
p.text-decoration-color:~SVGtext#TextDecorationProperties
p.text-decoration-fill:~SVGtext#TextDecorationFillProperty
p.text-decoration-line:~SVGtext#TextDecorationProperties
p.text-decoration-stroke:~SVGtext#TextDecorationStrokeProperty
p.text-decoration-style:~SVGtext#TextDecorationProperties
p.text-decoration:~SVGtext#TextDecorationProperties
p.text-indent:~CSSTEXT#propdef-text-indent
p.text-orientation:~CSSWM#propdef-text-orientation
p.text-overflow:~SVGtext#TextOverflowProperty
p.text-rendering:~SVGpainting#TextRenderingProperty
p.transform-box:~TRANSFORM#transform-box
p.transform-origin:~TRANSFORM#propdef-transform-origin
p.transform:~SVGcoords#TransformProperty
p.unicode-bidi:~CSSWM#propdef-unicode-bidi
p.vector-effect:~SVGcoords#VectorEffectProperty
p.vertical-align:~CSSINLINE#propdef-vertical-align
p.visibility:~SVGrender#VisibilityControl
p.white-space:~CSSTEXT#propdef-white-space
p.width:~SVGgeometry#Sizing
p.word-spacing:~CSSTEXT#propdef-word-spacing
p.writing-mode:~SVGtext#WritingModeProperty
p.x:~SVGgeometry#XProperty
p.y:~SVGgeometry#YProperty


t.angle:~CSSVAL#angle-value
t.integer:~CSSVAL#integer-value
t.length:~CSSVAL#length-value
t.length-percentage:~CSSVAL#typedef-length-percentage
t.number:~CSSVAL#number-value
t.paint:~SVGpainting#SpecifyingPaint

t.URL:~SVGtypes#attribute-url


	●#Terms
	■conform
~UA:~SVGconform#TermUserAgent
~SVG~UA:~SVGconform#TermUserAgent
~SVG~viewer:~SVGconform#TermSVGViewer
適合~SVG~viewer:~SVGconform#ConformingSVGViewers

	■render
描画~木:~SVGrender#TermRenderingTree
描画される要素:~SVGrender#TermRenderedElement
描画されない要素:~SVGrender#TermNonRenderedElement
再~利用される~graphic:~SVGrender#TermReusedGraphics
決して描画されない要素:~SVGrender#TermNeverRenderedElement
描画-可能な要素:~SVGrender#TermRenderableElement
積層~文脈:~SVGrender#TermStackingContext

	■struct
~SVG文書片:~SVGstruct#TermSVGDocumentFragment
~SVG要素:~SVGstruct#TermSVGElements
対応している要素:~SVGstruct#TermCorrespondingElement
~graphics要素:~SVGstruct#TermGraphicsElement
~instance根:~SVGstruct#TermInstanceRoot
~instance:~SVGstruct#TermElementInstance
要素~instance:~SVGstruct#TermElementInstance
最外縁の~svg要素:~SVGstruct#TermOutermostSVGElement
容器~要素:~SVGstruct#TermContainerElement
~use-要素~shadow木:~SVGstruct#TermUseElementShadowTree
未知の要素:~SVGstruct#UnknownElement
構造的に外部の要素:~SVGstruct#TermStructurallyExternalElement
記述的~要素:~SVGstruct#TermDescriptiveElement
~graphicを参照する要素:~SVGstruct#TermGraphicsReferencingElement
中核~属性:~SVGstruct#TermCoreAttribute
条件付き処理~属性:~SVGstruct#TermConditionalProcessingAttribute
~ARIA属性:~SVGstruct#TermARIAAttribute

	■painting
~fill:~SVGpainting#TermFill
~stroke:~SVGpainting#TermStroke
塗り:~SVGpainting#TermPaint
塗り~server要素:~SVGpainting#TermPaintServerElement
~stroke:~SVGpainting#TermStroke
~fill:~SVGpainting#TermFill
文脈~要素:~SVGpainting#TermContextElement

	■#Term 他
反映する:~SVGtypes#TermReflect
無効な値:~SVGtypes#TermInvalidValue

図形:~SVGshapes#TermShapeElement
図形~要素:~SVGshapes#TermShapeElement
基本~図形:~SVGshapes#TermBasicShapeElement

幾何~prop:~SVGgeometry#geometry-properties

~SVG表示域:~SVGcoords#TermSVGViewport
限界~box:~SVGcoords#TermBoundingBox

接触判定:~SVGinteract#TermHitTesting
~focus可能:~SVGinteract#TermFocusable
~event属性:~SVGinteract#TermEventAttribute
~graphic的~event属性:~SVGinteract#EventAttributes

~prop:~SVGstyling#TermProperty
呈示~属性:~SVGstyling#TermPresentationAttribute

~text内容~要素:~SVGtext#TermTextContentElement

~animation要素:~SVGanim#TermAnimationElement
~animation~event属性:~SVGanim#TermAnimationEventAttribute

~address可能~文字:~SVGtext#TermAddressableCharacter

画像~描画~用の矩形:~SVGembedded#TermImageRenderingRectangle
位置決め矩形:~SVGembedded#TermPositioningRectangle

	■用語
非推奨にされた~XLink属性:~SVGlinking#XLinkRefAttrs
~URL参照~属性:~SVGlinking#linkRefAttrs
~URL参照:~SVGlinking#URLReference
~UA~stylesheet:~SVGstyling#UAStyleSheet

	■用語（外部

大域~event属性:~WAPI#globaleventhandlers
文書~要素~event属性:~WAPI#documentandelementeventhandlers
~CORS設定群~属性:~HTMLurl#cors-settings-attribute

`

// ●PREMAP
COMMON_DATA.PREMAP += `
要素名:<table class="elemdef"><tbody><tr><th>名前<td>
分類:<tr><th>分類<td>
内容:<tr><th>内容~model<td>
属性:<tr><th>属性<td>
界面:<tr><th>~DOM~interface<td>
ア:\uE007<a href="~SVGanim#Animatable">~animate可？</a>\uE005

名値初ア:<table class="attrdef"><thead><tr><th>名前<th>値<th>初期~値<th>~animate可能？</thead><tbody><tr><td>
欄:<td>

`

// ●words_table

COMMON_DATA.words_table1 += `
	SVGintro:https://svgwg.org/svg2-draft/intro.html
SVGconform:https://svgwg.org/svg2-draft/conform.html
SVGrender:svg-render-ja.html
	~SVG2/render.html
SVGtypes:https://svgwg.org/svg2-draft/types.html
SVGstruct:https://svgwg.org/svg2-draft/struct.html
SVGstyling:svg-styling-ja.html
	~SVG2/styling.html
SVGgeometry:svg-geometry-ja.html
	~SVG2/geometry.html
SVGcoords:https://svgwg.org/svg2-draft/coords.html
SVGpaths:https://svgwg.org/svg2-draft/paths.html
SVGshapes:https://svgwg.org/svg2-draft/shapes.html
SVGtext:https://svgwg.org/svg2-draft/text.html
SVGembedded:svg-embedded-ja.html
	~SVG2/embedded.html
SVGpainting:https://svgwg.org/svg2-draft/painting.html
SVGpservers:https://svgwg.org/svg2-draft/pservers.html
SVGinteract:svg-interact-ja.html
	~SVG2/interact.html
SVGlinking:https://svgwg.org/svg2-draft/linking.html

SVGanim:https://svgwg.org/specs/animations/

xml_space:xml:space
xlink_href:xlink:href
xlink_title:xlink:title
use-:<code class="element">use</code>-
svg: <code class="element">svg</code> 

`

COMMON_DATA.words_table += `

	●略称
CSS:
DOM:
HTML:
	~HTML:HTML5
MathML:
SVG:
SVG-2:SVG 2
SVG-11:SVG 1.1
ARIA:
IDL:
WebIDL:Web IDL
	WebIDL:WebIDL
DTD:
SMIL:
XML:
XHTML:
XLink:
2D:
3D:
Web:
web:
API:
attrdef:<p>Attribute definitions</p>:<p>attribute 定義：</p>:<p>属性定義：</p>
viewAs:View this example as SVG (SVG-enabled browsers only):この例を SVG で見る（要ブラウザ対応）

	●データ／型／演算
class:
data::::データ
item::::アイテム
list::::リスト
member::::メンバ
作成-:create::~
値:value::~
初期:initial::~
初期化-:initialize::~
	初期化-:initialise
名:name::~
名前:name::~
型:type::~
変化-:change:~
変化:change:~
変更-:change:~
変更:change:~
属性:attribute::~
挿入-:insert::~
改変-:modify::~
改称-:rename:~
新たな:new:~
演算-:operate::~
演算:operation::~
種別:type::~
空:empty:~
範囲:range::~
clone::::クローン
複製:copy::~
取得-:get::~
設定-:set::~
設定:setting::~
設定群:settings::~
除去-:remove:~
除去:removal:~
置換-:replace::~
辞書:dictionary::~::ディクショナリ
配列:array::~
集合:set::~
整数:integer::~


	●構文
space:
keyword::::キーワード
token::::トークン
markup::::マークアップ
code::::コード
構文解析-:parse::~::パース
構文解析器:parser::~::パーサ
直列化-:serialize::~::シリアル化
直列化:serialization::~::シリアル化
文字:character::~
文字列:string::~
形式:format::~
成分:component::~
展開-:expand::~
形成-:form::~
合致-:match::~
内包-:include::~
内包:inclusion::~
構文:syntax:~
空白:whitespace::~
文法:grammar:~
識別子:identifier::~
妥当:valid::~
	妥当でない:invalid
妥当性:validity::~
無効:invalid::~


	●処理／IDL／event
flag::::フラグ
mode::::モード
call:
parameter::::パラメタ
event::::イベント
listener::::リスナ
target::::ターゲット
subject::対象
handler::::ハンドラ
interface::::インタフェース
method::::メソッド
mixin:
nullable:::null 可能
error::::エラー
構築子:constructor::~::コンストラクタ
入力:input::~
出力:output::~
失敗-:fail:~
生成-:generate::~
生産-:produce::~
変異:mutation::~
同期-:synchronize::~
	同期-:synchronise::~
例外:exception::~
投出:throw::~
発火-:fire::~
関数:function::~
誘発-:trigger::~
読専:read-only::~
引数:argument::~
状態:state::~
破棄-:discard:~
変換-:convert:~
完全:complete:~
開始-:start::~
評価-:evaluate::~
識別-:identify::~
呼出す:invoke する:呼び出す
呼出され:invoke され:呼び出され
呼出した:invoke した:呼び出した
実行-:execute:~
実行:execution:~
走らす:run する:~
走らせ:run し:~
走って:run して:~
起動-:initiate:~
環境:environment:~
即時に:immediate に:~
中止-:abort::~
停止-:stop::~
完遂-:finish::~
反復-:iterate::~
反復:iteration::~
繰返され:repeat され:繰り返され
繰返す:repeat する:繰り返す


	●構造
shadow:
node::::ノード
instance::::インスタンス
top-level::::トップレベル
obj:object:::オブジェクト
group::::グループ
	~group化する:grouping
host::::ホスト
svg:
木:tree::~
根:root::~
子:child::~
先祖:ancestor::~
子孫:descendant::~
素片:fragment::~
文書:document::~
文書片:document fragment::~
視野:scope::~
文脈:context::~
内容:content::~
容器:container:::コンテナ
包含-:contain::~
不可分:atomic::~
下層の:underlying::~
要素:element::~
親:parent::~
構造化-:structure::~
構造的:structural::~
構造:structure::~
構造的:structural::~
入子に:nest:入れ子に
部分木:subtree::~
隔離-:isolate::~
順序:order::~
並替られ:reorder され::並び替えられ
名前空間:namespace::~
外来の:foreign::~
包装-:wrap:~
下位-:sub-:~
部位:portion:~
内縁:inner::~
外縁:outer::~
最外縁の:outermost::~
最外縁:outermost::~
最内縁の:innermost::~

	●幾何
幾何:geometry::~
幾何的:geometric::~
path::::パス
下位path:subpath:::下位パス
size::::サイズ
sizing::::サイズ法
offset::::オフセット
vector::::ベクター
span:
重合して:overlap して::重なり合って
重合しな:overlap しな::重なり合わな

限界:bounding::~
限界域:bounds::~
領域:region::~
交差-:intersect::~
交差:intersection::~
内側:inside::~
外側:outside::~
区画:area::~
外形線:outline::~
内域:interior::~

切取られ:clip され::切り取られ
切抜かれ:clip され::切り抜かれ
切抜き:clipping::切り抜き
切抜く:clip する::切り抜く
境界:boundary::~

変形:transform::~
変形-:transform::~
変形n:transformation::変形
拡縮-:scale::~
拡縮率:scale::~
並進-:translate::~
並進:translation::~

平面:plane::~
原点:origin::~
座標:coordinate::~
座標系:coordinate system::~
利用元:user::~
図形:shape::~
寸法:dimension::~
次元:dimension::~
距離:distance::~
中心:center::~
半径:radius::~
始端:start::~
終端:end::~
縦方向:vertical::~
横方向:horizontal::~
横幅:width::~
縦幅:height::~
縦横比:aspect ratio::~
側:side:~
配置-:place:~
位置-:position::~
位置:position::~
位置決め:positioning::~
方位:orientation::~
直線:straight line::~
曲線:curve::~
真円:circle::~
真円の:circular な::~
矩形:rectangle::~
矩形の:rectangular な::~
空間:space::~
軸:axis::~
無限:infinite:~
接触判定:hit-testing::~

	●塗り／色／効果
RGB:
RGBA:
buffer::::バッファ
raster::::ラスター
	~raster化-:rasterize
bitmap::::ビットマップ
alpha::::アルファ
channel::::チャネル
canvas::::キャンバス
fill::::フィル
stroke::::ストローク
	~stroke時の:stroking
filter::::フィルタ
	~filter法:filtering
gradient:
graphic::::グラフィック
graphics::::グラフィックス
	~graphic的:graphical
grayscale::::グレイスケール
marker::::マーカ
mask::::マスク
masking::::マスク法
	~maskされ見えなくなる:masked out
pattern::::パタン
	~raster化-:rasterize
overflow::::過フロー
server::::サーバ
screen::::スクリーン
symbol::::シンボル
text::::テキスト
glyph::::グリフ
font::::フォント
red:
blue:
green:

背景:background::~
色:color::~
色停:color stop::~
黒:black::~
白:white::~
不透明:opaque::~
不透明度:opacity::~
透明:transparent::~
塗られ:paint され::塗られ
塗り:paint::~
塗る:paint する::~
塗ng:painting::塗り
前景:foreground::~
後景:backdrop::~
遮る:obscure する:~
描く:draw する::~
描ける:draw できる::~
描かれ:draw され::~
絵図:drawing:~
描画-:render::~
描画:rendering::~
	描画-可能:renderable
	描画され:rendered
	描画されない:non-rendered
効果:effect::~
原始filter:filter primitive:::原始フィルタ
混色-:blend::~
混色:blending::~
組成-:composite::~
組成:compositing::組成
画像:image::~
層:layer::~::レイヤ
積層-:stack::~
積層:stacking::~
画素:pixel::~

	● CSS
prop:property:::プロパティ
下位prop:subproperty::下位 property:下位プロパティ
styling::::スタイル付け
style::::スタイル
stylesheet:style sheet:::スタイルシート
cascade::::カスケード
宣言-:declare::~
宣言:declaration::~
宣言的:declarative::~
指定d:specifid:指定
算出d:computed::算出
算出:computation::~
算出-:compute::~
置換d:replaced::置換
疑似要素:pseudo-element::~
疑似類:pseudo-class::疑似 class:疑似クラス
使用:used::~
継承-:inherit::~
継承:inheritance::~
適用対象:applies to:~
	媒体:media:::~:メディア
視覚的:visual::~
内在的:intrinsic::~
百分率:percentage::~
絶対:absolute::~
絶対的:absolute::~
相対:relative::~
相対的:relative::~
長さ:length:~
	単位:unit::~
整形-:format::~
box::::ボックス
lay-out:lay out:::レイアウト
layout::::レイアウト
包含塊:containing block::包含 block:包含ブロック

	●呈示／UI
UI:
border::::ボーダー
animate::::アニメート
	~animate化:animated
animation::::アニメーション
pointer::::ポインタ
access::::アクセス
accessibility:::access 性:アクセス性:アクセシビリティ
keyboard::::キーボード
message::::メッセージ
title::::タイトル
view::::ビュー
viewer::::ビューア
focus::::フォーカス
	~focus可能:focusable
scroll::::スクロール
scrollbar::::スクロールバー
呈示-:present::~
呈示:presentation::~
呈示hint:presentational hint::呈示 hint:呈示ヒント
静的:static::~
動的:dynamic::~
音声:audio::~
装置:device::~
可視:visible::~
可視の:visible な::~
可視性:visibility::~
視覚的:visual::~
表示-:display::~
表示:display::~
表示域:viewport::~::ビューポート
外観:appearance::~
対話:interaction::~
対話性:interactivity::~
対話的:interactive::~
隠され:hide され::~
隠す:hide する::~


	●資源
URL:
WOFF:
CORS:
JPEG:
PNG:
MIME:
fetch:
download::::ダウンロード
媒体:media::~::メディア
link::::リンク
linking:::リンク法
inline::::インライン
source::::ソース
secure::::セキュア
page::::ページ
資源:resource::~:リソース
multimedia::::マルチメディア
file::::ファイル
address::::アドレス
page::::ページ
埋込まれ:embed され::埋め込まれ
埋込む:embed する::埋め込む
埋込んで:embed して::埋め込んで
埋込d:embedded::埋め込み
読込み:loading::読み込み::ローディング
読込む:load する::読み込む::ロードする
読込まれ:load され::読み込まれ::ロードされ
読込んで:load して::読み込んで::ロードして
動画:video::~::ビデオ

	●仕様
UA:user agent:UA
algo:algorithm:::アルゴリズム
level::::レベル
metadata::::メタデータ
model::::モデル
module::::モジュール
option::::オプション
risk::::リスク
custom::::カスタム
version::::バージョン
system::::システム
一様:uniform:~
不良:bad:~
中核:core:~
事例:case:~
仕方:way:~
仕組み:mechanism:~
付録:Appendix:~
判定基準:criteria:~
単純:simple:~
品質:quality:~
基本:basic:~
基礎的:fundamental:~
実施:practice:~
実用上の:practical な:~
実質的:effective:~
実際:actual:~
実際の:actual な:~
将来:future:~
将来の:future:~
役割:role::~
後方互換:backwards-compatible:~
後方互換性:backwards compatibility:~
手引き:guidance:~
手法:method:~
手続き:steps:~
旧来の:legacy な:~
有意:significant:~
条件:condition:~
条件付き:conditional:~
概念:concept:~
概念的:conceptual:~
正確:exact:~
特色機能:feature:~
状況:situation:~
理由:reason:~
用語:term:~
目的:purpose:~
直に:direct に:~
直接的:direct:~
能:ability:~
課題:issue:~
通常:normal:~
通常の:normal な:~
通常は:normal では:~
	normally
通常通り:as normal に:通常どおり
通例的:usual:~
道具:tool:~
関連する:relevant な:~
自動的:automatic:~
違法:illegal::~
共通の:common な:~
共通的に:common に:よく
共通的な:common な:よくある
詳細:details:~
詳細な:detailed:~
可用:available:~
意味論:semantics:~
適切:appropriate:~
側面:aspect:~
言語:language:~
歴史的:historical:~
特徴:characteristic:~
一意:unique:~
明瞭:clear:~
類似する:similar な:~
	同様に:similarly／:similar
互換:compatible:~
互換性:compatibility:~
アリ:possible:可能
情報:information:~
自立的:standalone:~
	自立的:stand-alone
多彩:rich:~
能力:capability:~
適正:proper:~
手動:manual:~
安全:safe:~
基本的:basic:~
複階的:complex:~
概観:overview:~
相応しい:suitable な:~
望む:wish する:~
望まれ:wish され:~
求める:want する:~
求めら:want さ:~
容易:easy:~
	より容易に:easier
恣意的:arbitrary:~

	決して:never
	例:example
	例えば:for example
	例：:e.g.,
	場合によっては:possibly
	すなわち:i.e.,
	具体例として:for instance
	しかしながら，:however
	したがって:therefore
	したがって:thus
	べき:should
	因る:due to
	特に:in particular
	特に:particularly
	に注意:note／note that
	が:although
	であっても:even if
	と違って:unlike
	少なくとも:at least
	など:such as
	様に:like
	するためには:in order to
	少し:slightly
	に関して:with respect to
	方法:how to
	同様に:likewise
	呼応して:in response to
	させる:cause

	●仕様（動詞
browser::::ブラウザ
support::::サポート
test::::テスト
fallback::::フォールバック
上書き:override:~
不正:incorrect:~
並行して:parallel に:~
付録:appendix:~
供-:provide:~
依存-:depend:~
依拠-:rely:~
保全-:preserve:~
保守-:maintain:~
先送り:defer:~
再利用:reuse:~
再構成-:rearrange:~
処理-:process:~
処理:processing:~
処理能:performance:~
利用-:use:~
	利用して:using
利用者:user:~
有用:useful:~
制御-:control:~
制御:control:~
制約:restriction:~
制限-:limit:~
制限:limitation:~
勧告:Recommendation:~
勧告候補:Candidate Recommendation:~
参考:informative:~
取扱い:handling:取り扱い
取扱う:handle する:取り扱う
取扱われ:handle され:取り扱われ
取扱って:handle して:取り扱って
含意-:imply:~
変更点:changes:~
孕む:involve する:~
定義-:define:~
定義:definition:~
実装-:implement:~
実装:implementation:~
寄与-:contribute:~
尊重-:respect:~
序論:introduction:~
強調-:highlight:~
影響-:affect:~
意味-:mean:~
意味:meaning:~
意図-:intend:~
拘束-:constrain:~
拡張-:extend:~
拡張:extension:~
拡張性:extensibility:~
指定-:specify:~
特定の:specific:~
特有の:specific な:~
特有な:-specific な:特有の
特有:specific:~
仕様:spec:~
特定的:specifical:具体的
特別:special:~
指示書き:instructions:~
挙動:behavior:ふるまい
挙動する:behave する:ふるまう
採用-:adopt:~
推奨-:recommend:~
推奨:recommendation:~
改めら:alter さ:~
改善-:improve:~
明確化-:clarify:~
明確化:clarification:~
明示的:explicit:~
暗黙的:implicit:~
更新-:update:~
期待-:expect:~
予期-:expect:~
標準:standard:~
標準の:standard な:~
正しく:correct に:~
正した:correct した:~
決定-:determine:~
注釈:annotation:~
無視-:ignore:~
独立:independent:~
相互作用-:interact:~
示唆-:suggest:~
禁制-:prohibit:~
移動-:move:~
組込みの:built-in:~
統合-:integrate:~
統治-:govern:~
義務:mandatory:~
考慮-:consider:~
要件:requirement:~
要旨-:outline:~
要求-:require:~
要約-:summarize:~
見なさ:consider さ:~
規範的:normative:~
解決-:resolve:~
解決:resolution:~
解釈-:interpret:~
言及:mention:~
記述:description:~
記述的:descriptive:~
許容-:allow:~
説明-:explain:~
論じら:discuss さ:~
論点:discussion:~
警告:warning:~
述べら:describe さ:~
述べる:describe する:~
述べた:describe した:~
遂行-:perform:~
適合-:conform:~
適合:conforming:~
適合性:conformance:~
適用-:apply:~
	適用-可能:applicable
応用:application:~
関係-:relate:~
関係:relation:~
関係性:relationship:~
阻止-:block::~
非推奨に:deprecate:~
既知:known:~
既知の:known な:~
未知の:unknown:~
作者:author:~
確保-:ensure:~
給-:supply:~
公開-:expose:~
調整:adjustment:~
指名-:designate:~
存在-:exist:~
既存の:existing:~
分類:category:~
見做され:assume され:~
見做す:assume する:~
見做して:assume して:~
代替-:alternate:~
代替:alternative:~
組入れる:incorporate する:組み入れる
解-:understand:~
不能化-:disable:~
設計-:design:~
認識-:recognize:~
避ける:avoid:~
導入-:introduce:~
指示-:indicate:~
指示:indication:~
受容-:accept:~
検査-:check:~
防止-:prevent:~
試みる:attempt する:~
試みて:attempt して:~
裁定-:decide:~
裁定:decision:~
検分-:inspect:~

	則って:according
	則って:in accordance with
	〜に基づく:based
	扱う:treat
	見よ:see
	関わらず:regardless
	必要:need
	扱う:treat
	足る:sufficient
	含まれ／含む／含め:include
	除く／除いて／...:except
	従う:follow
	次のような:as follows
	次の:the following

	●未分類（動詞
表現-:represent:~
表現:representation:~
除外-:exclude:~
導出-:derive:~
反映-:reflect:~
反映:reflection:~
共有-:share:~
共用:shared:~
伝播-:propagate::~
伝播:propagation::~
確立-:establish::~
所有者:owner::~
計算-:calculate::~
計算:calculation::~
関与-:participate::~
アテガう:assign する:あてがう
アテガえる:assign できる:あてがえる
アテガわれ:assign され:あてがわれ
アテガって:assign して:あてがって
アテガおう:assign しよう:あてがおう
対応付け:mapping::~
対応付けら:map さ::~
対応付ける:map する::~
追加-:add:~
追加:addition:~
追加的な:additional な:追加の
追加的に:additional に:追加で
	加えて:in addition
	加えて:additionally
参照-:reference::~
参照:reference::~
参照先の:referenced::~
参照元の:referencing::~
参照ng:referencing::参照
結付けら:associate さ:結び付けら
結付けて:associate して:結び付けて
登録-:register::~
登録:registration::~

	対応-:correspond
	現れる:appear
	示す:show
	起こる:happen
	生じ:occur

	●未分類
script::::スクリプト
scripting::::スクリプト処理

時列線:timeline::~
時刻:time::~
時機:timing::~
遷移:transition::~
等価:equivalent::~
精確:precise::~
既定の:default::~::デフォルト
既定:default::~::デフォルト
規則:rule::~
単位:unit:~
別名:alias:~
大域:global::~::グローバル
大域的:global::~::グローバル
局所:local::~::ローカル
選定-:select:~
選定:selection:~


	●指示語／機能語
元の:original:~
現在の:current:~
	現在:currently
自前の:own:~
単独の:single:~
外部:external:~
外部の:external な:~
特定0の:particular:ある特定の
全部的:full:~

	0 :zero
	もの:one
	個:one／:two／:three／:four／:five／...
	個目:first／:second／:third／:fourth／:fifth／...
	〜の代わりに:instead
	いくつかの:several
	今や:now
	すでに:already
	常に:always
	ほぼ:almost
	ほとんどの:most
	まで:at most
	ここ:here
	この:this
	これらの:these
	それらの:their
	すべての:all
	全体:entire
	何らかの:some
	一部の:some
	~~任意の:any
	任意の:arbitrary
	〜以上:or more
	その:that
	以前の／前の:previous
	それまで:previously
	そのような:such
	その他:others
	他の:other
	以外の:other than
	それら:they
	それらを:them
	自身:itself／:themselves
	など:such as
	代わりに:instead
	依然として:still
	個々の:individual
	別の:another
	別々の:separate
	別個の:distinct
	単独の:single
	各:each
	同じ:same
	多い:often
	多くの:many
	対応:correspond
	前:before
	後:after
	所与の:given
	最初の:first
	最後の:last
	異なる:different
	章:chapter
	節:section
	等々:etc
	結果:result
	複数の:multiple
	複数の:more than one
	通して:through
	残りの:remaining
	上:above
	下:below
	両／両者:both
	一部／一部を成す:part of
	介:via
	超えて:beyond
	当の:in question
	他所:elsewhere
	間:during


`
