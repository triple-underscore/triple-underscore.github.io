'use strict';

const source_data = {
	toc_main: 'MAIN',
	persisted_parts: Object.create(null),
	init: EMPTY_FUNC,
};

Util.ready = function(){
//	source_data.section_map = Util.get_mapping(PAGE_DATA.section_map || '');
	source_data.init();
	Util.switchWordsInit(source_data);

	/* 展開状態で保存されたページがこの script を読み込まないようにする */
	repeat('script[src="svg-common.js"]', (e) => {
		e.remove();
	});
};

// source_data.populate = function(){};

source_data.generate = function(){
	const class_map = this.class_map;
	const tag_map = this.tag_map;

	const link_map = this.link_map;

	let context_ifc0 = '#';
	let context_ifc1 = '#';

	return this.html.replace(
		/%[\w\-~一-鿆あ-ん]+|`(.+?)([$@\^])(\w*)/g,
		create_html
	);

	function create_html(match, key, indicator, klass){
if(!indicator) {//%
	return `<var>${match.slice(1)}</var>`;
}

let href = '';
let href1 = '';
{
	const n = key.indexOf('＠');
	if(n > 0) {
		href1 = key.slice(n + 1);
		key = key.slice(0, n);
	}
}
let text = key;
let classname = class_map[klass] || '';

switch(klass){
case 'r':
	text = `[${key}]`;
	href = `svg-refs.html#ref-${key.toLowerCase()}`;
	break;
case 't':
	text = `&lt;${text}&gt;`;
	break;
case 'tp':
	text = `&lt;'<code class="property">${key}</code>'&gt;`;
	href = link_map[`p.${key}`];
	break;
case 'ps':
	text = `:${text}`;
	break;
case 'pe':
	text = `::${text}`;
	break;
case 'at':
	text = `@${text}`;
	break;
case 'l':
	text = `"<code class="literal">${text}</code>"`;
	break;
case 'U':
	text = `U+${key}`;
	break;
case 'sec':
	text = `§ ${text}`;
	break;
case 'viewAs':
	return `<p><a href="~SVG2/images/${key}">~viewAs</a></p>`
	break;
case 'dgm':
	return `<a id="_dgm-${key}">＊</a>`;
	break;
case 'issue':
	text = `課題 #${key}`;
	href = `~SVGissue/${key}`;
	break;
case 'I0':
	context_ifc0 = `#__svg__${key}__`;
	klass = 'I';
	break;
case 'I1':
	href = link_map[`I.${key}`];
	if(href){
		context_ifc1 = `${href.slice(0, href.indexOf('#'))}#__svg__${key}__`;
	}
	klass = 'I';
	break;
case 'ACTION':
	text = `ACTION-${key}`;
	href = `https://www.w3.org/Graphics/SVG/WG/track/actions/${key}`;
	break;
case 'en': // english words
	return `<span lang="en">${key}</span>`;
	break;
default:
	if(classname.slice(0, 3) === 'dom'){
		const n = text.indexOf('(');
		if(n > 0){
			key = text.slice(0, n);
			text = key + text.slice(n).replace(/\w+/g, '<var>$&</var>');
		}
		if(classname === 'dom0'){
			href = context_ifc0 + key;
		} else if(classname === 'dom1'){
			href = context_ifc1 + key;
		}
		classname = '';
	}
}

let tag = tag_map[klass];
if(tag) {
	classname = classname ? ` class="${classname}"` : '';
	text = `<${tag}${classname}>${text}</${tag}>`;
}

if(indicator !== '^'){
	href = href1 || link_map[ klass ? `${klass}.${key}` : key ] || href;
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
tp:type
et:event-type
at:at-rule
ps:pseudo
pe:pseudo
css:css
f:func
P:production
xl:ex-label
u:unit
U:code-point
op:op
E:error
`

COMMON_DATA.tag_map += `
I:code
I0:code
I1:code
E:code
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
dfn:dfn
b:b
t:var
tp:var
u:code
css:code
P:var
V:var
xl:i
U:span
op:span
i:i
em:em
cite:cite
`

// ●link
COMMON_DATA.link_map += `

	●IDL

E.NoModificationAllowedError:~WEBIDL#nomodificationallowederror
E.IndexSizeError:~WEBIDL#indexsizeerror
E.TypeError:~WEBIDL#exceptiondef-typeerror

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
I.SVGUseElement:~SVGstruct#InterfaceSVGUseElement
I.SVGUseElementShadowRoot:~SVGstruct#InterfaceSVGUseElementShadowRoot
I.SVGViewElement:~SVGlinking#InterfaceSVGViewElement

I.Animation:~WANIMapi#the-animation-interface
	~TR/web-animations-1/#the-animation-interface
I.ShadowAnimation:~SVGstruct#InterfaceShadowAnimation
I.DOMMatrix:~GEOMETRY#dommatrix
	~TR/geometry-1/#dom-dommatrix
I.DOMMatrixReadOnly:~GEOMETRY#dommatrixreadonly
	~TR/geometry-1/#dom-dommatrixreadonly
I.DOMMatrix2DInit:~GEOMETRY#dictdef-dommatrix2dinit
I.DOMPoint:~GEOMETRY#dompoint
	~TR/geometry-1/#dom-dompoint
I.DOMPointInit:~GEOMETRY#dictdef-dompointinit
I.DOMPointReadOnly:~GEOMETRY#dompointreadonly
	~TR/geometry-1/#dom-dompointreadonly
I.DOMRect:~GEOMETRY#domrect
	~TR/geometry-1/#dom-domrect
I.DOMRectReadOnly:~GEOMETRY#domrectreadonly
	~TR/geometry-1/#dom-domrectreadonly
I.DOMTokenList:~DOM4#interface-domtokenlist
I.Document:~DOM4#document
	廃）I.DocumentAndElementEventHandlers:~WAPI#documentandelementeventhandlers
I.DocumentAndElementEventHandlers:~SVGchanges#documentandelementeventhandlers
I.Element:~DOM4#element
I.CSSPseudoElement:~CSSPSEUDO#csspseudoelement
I.GlobalEventHandlers:~WAPI#globaleventhandlers
I.HTMLHyperlinkElementUtils:~HTMLlinks#htmlhyperlinkelementutils
I.HTMLOrSVGElement:~HTMLdom#htmlorsvgelement
I.LinkStyle:~CSSOM1#the-linkstyle-interface
I.NodeList:~DOM4#interface-nodelist
I.ShadowRoot:~DOM4#interface-shadowroot
I.Window:~WINDOW#window
I.WindowEventHandlers:~WAPI#windoweventhandlers

	●e
	（要素を指す href は §に代えて要素 dfn id を指すように変更）
e.a:~SVGlinking#elementdef-a
e.circle:~SVGshapes#elementdef-circle
e.defs:~SVGstruct#elementdef-defs
e.desc:~SVGstruct#elementdef-desc
e.ellipse:~SVGshapes#elementdef-ellipse
e.foreignObject:~SVGembedded#elementdef-foreignObject
e.g:~SVGstruct#elementdef-g
e.image:~SVGembedded#elementdef-image
e.line:~SVGshapes#elementdef-line
e.linearGradient:~SVGpservers#elementdef-linearGradient
e.marker:~SVGpainting#elementdef-marker
e.metadata:~SVGstruct#elementdef-metadata
e.path:~SVGpaths#elementdef-path
e.pattern:~SVGpservers#elementdef-pattern
e.polygon:~SVGshapes#elementdef-polygon
e.polyline:~SVGshapes#elementdef-polyline
e.radialGradient:~SVGpservers#elementdef-radialGradient
e.rect:~SVGshapes#elementdef-rect
e.script:~SVGinteract#elementdef-script
e.stop:~SVGpservers#elementdef-stop
e.style:~SVGstyling#elementdef-style
e.svg:~SVGstruct#elementdef-svg
e.switch:~SVGstruct#elementdef-switch
e.symbol:~SVGstruct#elementdef-symbol
e.text:~SVGtext#elementdef-text
e.textPath:~SVGtext#elementdef-textPath
e.title:~SVGstruct#elementdef-title
e.tspan:~SVGtext#elementdef-tspan
e.use:~SVGstruct#elementdef-use
e.view:~SVGlinking#elementdef-view

e.clipPath:~MASKING1#elementdef-clippath
e.mask:~MASKING1#elementdef-mask

	（ SVGanim の要素は元のまま）
e.animate:~SVGanim#AnimateElement
e.animateMotion:~SVGanim#AnimateMotionElement
e.animateTransform:~SVGanim#AnimateTransformElement
e.discard:~SVGanim#DiscardElement
e.mpath:~SVGanim#MPathElement
e.set:~SVGanim#SetElement

	（FILTERS の要素 id は小文字化）
e.feBlend:~FILTERS#elementdef-feblend
e.feColorMatrix:~FILTERS#elementdef-fecolormatrix
e.feComponentTransfer:~FILTERS#elementdef-fecomponenttransfer
e.feComposite:~FILTERS#elementdef-fecomposite
e.feConvolveMatrix:~FILTERS#elementdef-feconvolvematrix
e.feDiffuseLighting:~FILTERS#elementdef-fediffuselighting
e.feDisplacementMap:~FILTERS#elementdef-fedisplacementmap
e.feDistantLight:~FILTERS#elementdef-fedistantlight
e.feDropShadow:~FILTERS#elementdef-fedropshadow
e.feFlood:~FILTERS#elementdef-feflood
e.feFuncA:~FILTERS#elementdef-fefunca
e.feFuncB:~FILTERS#elementdef-fefuncb
e.feFuncG:~FILTERS#elementdef-fefuncg
e.feFuncR:~FILTERS#elementdef-fefuncr
e.feGaussianBlur:~FILTERS#elementdef-fegaussianblur
e.feImage:~FILTERS#elementdef-feimage
e.feMerge:~FILTERS#elementdef-femerge
e.feMergeNode:~FILTERS#elementdef-femergenode
e.feMorphology:~FILTERS#elementdef-femorphology
e.feOffset:~FILTERS#elementdef-feoffset
e.fePointLight:~FILTERS#elementdef-fepointlight
e.feSpecularLighting:~FILTERS#elementdef-fespecularlighting
e.feSpotLight:~FILTERS#elementdef-fespotlight
e.feTile:~FILTERS#elementdef-feytile
e.feTurbulence:~FILTERS#elementdef-feturbulence
e.filter:~FILTERS#elementdef-filter

	HTML 要素
eH.a:~HEtextlevel#the-a-element
eH.base:~HEmetadata#the-base-element
eH.link:~HEmetadata#the-link-element
eH.meta:~HEmetadata#the-meta-element
eH.script:~HEscripting#the-script-element
eH.source:~HEimages#the-source-element
eH.style:~HEmetadata#the-style-element

	●p

p.alignment-baseline:~SVGtext#AlignmentBaselineProperty
p.baseline-shift:~SVGtext#BaselineShiftProperty
p.clip-path:~MASKING1#propdef-clip-path
p.clip-rule:~MASKING1#propdef-clip-rule
p.clip:~MASKING1#propdef-clip
p.color-interpolation-filters:~FILTERS#propdef-color-interpolation-filters
p.color-interpolation:~SVGpainting#ColorInterpolationProperty
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
p.filter:~FILTERS#propdef-filter
p.flood-color:~FILTERS#propdef-flood-color
p.flood-opacity:~FILTERS#propdef-flood-opacity
p.font:~CSSFONT#propdef-font
p.font-feature-settings:~CSSFONT#propdef-font-feature-settings
p.font-kerning:~CSSFONT#propdef-font-kerning
p.font-family:~CSSFONT#propdef-font-family
p.font-size-adjust:~CSSFONT#propdef-font-size-adjust
p.font-size:~CSSFONT#propdef-font-size
p.font-stretch:~CSSFONT#propdef-font-stretch
p.font-style:~CSSFONT#propdef-font-style
p.font-variant:~CSSFONT#propdef-font-variant
p.font-weight:~CSSFONT#propdef-font-weight
p.glyph-orientation-horizontal:~SVGtext#GlyphOrientationHorizontalProperty
p.glyph-orientation-vertical:~SVGtext#GlyphOrientationVerticalProperty
p.height:~SVGgeometry#Sizing
p.image-rendering:~SVGpainting#ImageRenderingProperty
p.inline-size:~SVGtext#InlineSizeProperty
p.letter-spacing:~CSSTEXT#propdef-letter-spacing
p.lighting-color:~FILTERS#propdef-lighting-color
p.line-height:~SVGtext#LineHeightProperty
p.isolation:~COMPOSITING#isolation
p.marker:~SVGpainting#MarkerProperty
p.marker-end:~SVGpainting#MarkerEndProperty
p.marker-mid:~SVGpainting#MarkerMidProperty
p.marker-start:~SVGpainting#MarkerStartProperty
p.mask:~MASKING1#propdef-mask
p.mask-type:~MASKING1#propdef-mask-type
p.object-fit:~CSSIMAGE#propdef-object-fit
p.object-position:~CSSIMAGE#propdef-object-position
p.opacity:~SVGrender#ObjectAndGroupOpacityProperties
p.overflow:~SVGrender#OverflowAndClipProperties
p.paint-order:~SVGpainting#PaintOrderProperty
p.pointer-events:~SVGinteract#PointerEventsProperty
p.r:~SVGgeometry#RProperty
p.rx:~SVGgeometry#RxProperty
p.ry:~SVGgeometry#RyProperty
p.shape-inside:~SVGtext#ShapeInsideProperty
p.shape-image-threshold:~SVGtext#TextShapeImageThreshold
p.shape-margin:~SVGtext#ShapeMarginProperty
p.shape-padding:~SVGtext#TextShapePadding
p.shape-rendering:~SVGpainting#ShapeRenderingProperty
p.shape-subtract:~SVGtext#ShapesubtractProperty
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
p.text-decoration-line:~SVGtext#TextDecorationProperties
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

	●t
t.number:~CSSVAL#number-value
t.integer:~CSSVAL#integer-value
t.length:~CSSVAL#length-value
t.percentage:~CSSVAL#percentage-value
	t.percentage:~CSSVAL#percentages
t.angle:~CSSVAL#angle-value
t.length-percentage:~CSSVAL#typedef-length-percentage
t.url:~CSSVAL#url-value
t.color:~CSSVAL#colors
t.paint:~SVGpainting#DataTypePaint
	t.paint:~SVGpainting#SpecifyingPaint
t.marker-ref:~SVGpainting#DataTypeMarkerRef
t.dasharray:~SVGpainting#DataTypeDasharray

~URLt:~SVGtypes#attribute-url


	●#Terms
	■conform
~UA:~SVGconform#TermUserAgent
~SVG~UA:~SVGconform#TermSVGUserAgent
~SVG著作~tool:~SVGconform#TermSVGAuthoringTool
~SVG~server:~SVGconform#TermSVGServer
~SVG生成器:~SVGconform#TermSVGGenerator
~SVG解釈器:~SVGconform#TermSVGInterpreter
~SVG~viewer:~SVGconform#TermSVGViewer


処理~mode:~SVGconform#processing-modes
~animate化~mode:~SVGconform#animated-mode
動的かつヤリトリあり~mode:~SVGconform#dynamic-interactive-mode
~secure~animate化~mode:~SVGconform#secure-animated-mode
~secure静的~mode:~SVGconform#secure-static-mode
静的~mode:~SVGconform#static-mode

適合~SVG~DOM下位tree:~SVGconform#ConformingSVGDOMSubtrees
適合~SVG生成器:~SVGconform#ConformingSVGGenerators
適合~SVG解釈器:~SVGconform#ConformingSVGInterpreters
適合~SVG~markup素片:~SVGconform#ConformingSVGFragments
適合~SVG自立的~file:~SVGconform#ConformingSVGStandAloneFiles
適合~SVG~viewer:~SVGconform#ConformingSVGViewers
適合~XML互換~SVG~markup素片:~SVGconform#ConformingSVGXMLFragments
適合~高品質~SVG~viewer:~SVGconform#ConformingHighQualitySVGViewers


	■render
描画~tree:~SVGrender#TermRenderingTree
描画される要素:~SVGrender#TermRenderedElement
描画されない要素:~SVGrender#TermNonRenderedElement
再利用される~graphic:~SVGrender#TermReusedGraphics
決して描画されない要素:~SVGrender#TermNeverRenderedElement
描画-可能な要素:~SVGrender#TermRenderableElement
積層~文脈:~SVGrender#TermStackingContext

	■types
反映する:~SVGtypes#TermReflect
無効な値:~SVGtypes#TermInvalidValue
初期~値:~SVGtypes#TermInitialValue
数量-型~値:~SVGtypes#TermNumericTypeValue
~list~interface:~SVGtypes#TermListInterface

基底~値:~SVGtypes#_base-value
関連な要素:~SVGtypes#_relevant-element
読専~flag:~SVGtypes#_read-only-flag
必要なら内容~属性を直列化し直す:~SVGtypes#_reserialize-reflected-attribute
反映を継承する:~SVGtypes#_inherit-reflected
反映先の属性:~SVGtypes#_reflected-attribute


	■struct
~SVG名前空間:~SVGstruct#Namespace
~SVG要素:~SVGstruct#TermSVGElements
~graphics要素:~SVGstruct#TermGraphicsElement
容器~要素:~SVGstruct#TermContainerElement
構造上の要素:~SVGstruct#TermStructuralElement
構造的に外部の要素:~SVGstruct#TermStructurallyExternalElement
記述的~要素:~SVGstruct#TermDescriptiveElement
~graphicを参照する要素:~SVGstruct#TermGraphicsReferencingElement
中核~属性:~SVGstruct#TermCoreAttribute
条件付き処理~属性:~SVGstruct#TermConditionalProcessingAttribute
~ARIA属性:~SVGstruct#TermARIAAttribute

最外縁の~svg要素:~SVGstruct#TermOutermostSVGElement
~SVG文書片:~SVGstruct#TermSVGDocumentFragment
現在の~SVG文書片:#TermCurrentSVGDocumentFragment
~use要素の~shadow~tree:~SVGstruct#TermUseElementShadowTree
~instance根:~SVGstruct#TermInstanceRoot
~instance:~SVGstruct#TermElementInstance
要素~instance:~SVGstruct#TermElementInstance
対応している要素:~SVGstruct#TermCorrespondingElement
対応している~use要素:~SVGstruct#TermCorrespondingUseElement
参照先の~graphic:~SVGstruct#TermReferencedDocumentSubtree
参照先の文書~下位tree:~SVGstruct#TermReferencedDocumentSubtree
参照先の要素:~SVGstruct#TermReferencedElement

	■coords
~canvas:~SVGcoords#TermCanvas
~SVG表示域:~SVGcoords#TermSVGViewport
初期~表示域:~SVGcoords#TermInitialViewport
表示域~座標系:~SVGcoords#TermViewportCoordinateSystem
利用元~単位:~SVGcoords#TermUserUnits
限界~box:~SVGcoords#TermBoundingBox
~obj限界~box:~SVGcoords#TermObjectBoundingBox
~stroke限界~box:~SVGcoords#TermStrokeBoundingBox
装飾d限界~box:~SVGcoords#TermDecoratedBoundingBox
最も遠い先祖の~SVG表示域:~SVGcoords#TermFurthestAncestorSVGViewport
正規化-済み対角線長さ:~SVGcoords#_normalized-diagonal

	■path
区分を完了して~pathを閉じる:~SVGpaths#TermSegment-CompletingClosePath
等価な~path:~SVGpaths#TermEquivalentPath
初期~点:~SVGpaths#TermInitialPoint
~pathの方向:~SVGpaths#TermPathDirection
~path区分:~SVGpaths#TermPathSegment

	■painting
~fill:~SVGpainting#TermFill
~stroke:~SVGpainting#TermStroke
~stroke図形:~SVGpainting#TermStrokeShape
塗り:~SVGpainting#TermPaint
塗り~server要素:~SVGpainting#TermPaintServerElement
文脈~要素:~SVGpainting#TermContextElement

	■linking
同一-文書~URL参照:~SVGlinking#TermSameDocumentURL
外部~資源~参照:~SVGlinking#TermExternalReference
~data~URL参照:~SVGlinking#TermDataURL
~URL参照:~SVGlinking#TermURLReference
未解決な参照:~SVGlinking#TermUnresolvedReference
素片~識別子~付き~URL参照:~SVGlinking#TermURLReferenceWithFragmentIdentifier
無効な参照:~SVGlinking#TermInvalidReference
無効な循環-参照:~SVGlinking#TermCircularReference

	■#Term 他

図形:~SVGshapes#TermShapeElement
図形~要素:~SVGshapes#TermShapeElement
基本~図形:~SVGshapes#TermBasicShapeElement

幾何~prop:~SVGgeometry#geometry-properties

~gradient要素:~SVGpservers#TermGradientElement

接触判定:~SVGinteract#TermHitTesting
~focus可能:~SVGinteract#TermFocusable
~event属性:~SVGinteract#TermEventAttribute

~prop:~SVGstyling#TermProperty
呈示~属性:~SVGstyling#TermPresentationAttribute

~text内容~要素:~SVGtext#TermTextContentElement

~animation要素:~SVGanim#TermAnimationElement
~animation~event属性:~SVGanim#TermAnimationEventAttribute

画像~描画~用の矩形:~SVGembedded#TermImageRenderingRectangle
位置決め矩形:~SVGembedded#TermPositioningRectangle


	■用語
非推奨にされた~XLink属性:~SVGlinking#XLinkRefAttrs
~URL参照~属性:~SVGlinking#linkRefAttrs
	~URL参照:~SVGlinking#URLReference → ~SVGlinking#TermURLReference
~UA~stylesheet:~SVGstyling#UAStyleSheet

	■用語（外部
加法的でない:~CSSVAL#not-additive
無視する:~CSSSYN#css-ignored
既定の~sizing~algo:~CSSIMAGE#default-sizing-algorithm
大域~event属性:~WAPI#globaleventhandlers
文書~要素~event属性:~WAPI#documentandelementeventhandlers
~CORS設定群~属性:~HTMLurl#cors-settings-attribute

`

// ●PREMAP
COMMON_DATA.PREMAP += `
要素名:<table class="def-table elemdef"><tbody><tr><th>名前<td>
分類:<tr><th>分類<td>
内容:<tr><th>内容~model<td>
属性:<tr><th>属性<td>
幾何:<tr><th>幾何~prop<td>
界面:<tr><th>~DOM~interface<td>

属名:<table class="def-table attrdef"><tbody><tr><th colspan="2">
属値:<tr><th>値<td>
属初:<tr><th>初期~値<td>
属ア:<tr><th>~animate可？<td>

`

// ●words_table

COMMON_DATA.words_table1 += `
	SVGintro:https://svgwg.org/svg2-draft/intro.html
SVGconform:svg-conform-ja.html
	~SVG2/conform.html
	~SVG2/render.html→common0.js
	~SVG2/types.html→common0.js
	~SVG2/struct.html→common0.js
	~SVG2/styling.html→common0.js
	~SVG2/geometry.html→common0.js
	~SVG2/coords.html→common0.js
	~SVG2/paths.html→common0.js
	~SVG2/shapes.html→common0.js
	~SVG2/text.html→common0.js
	~SVG2/embedded.html→common0.js
	~SVG/painting.html→common0.js
	~SVG2/pservers.html→common0.js
	~SVG2/interact.html→common0.js
	~SVG2/linking.html→common0.js
SVGmisc:svg-misc-ja.html
	~SVG2/Overview.html
SVGchanges:svg-changes-ja.html
	~SVG2/implnote.html
	~SVG2/access.html
	~SVG2/animate.html
	~SVG2/mimereg.html

SVGanim:https://svgwg.org/specs/animations/
	GEOMETRY→common0.js
	GEOMETRY:https://www.w3.org/TR/geometry-1/
	GEOMETRY:https://www.w3.org/TR/2014/WD-geometry-1-20140522/
	GEOMETRY:https://www.w3.org/TR/2014/CR-geometry-1-20141125/

ARIA11:https://www.w3.org/TR/wai-aria-1.1/
SVGissue:https://github.com/w3c/svgwg/issues
xml_space:xml:space
xlink_href:xlink:href
xlink_title:xlink:title
use: <code class="element">use</code> 
svg: <code class="element">svg</code> 
URLt:[URL]

`

COMMON_DATA.words_table += `


●●words_table
	●略称
	~HTML:HTML5
MathML:
ECMAScript:
SVG-2:SVG 2
SVG-11:SVG 1.1
ARIA:
DTD:
SMIL:
XHTML:
XLink:
2D:
3D:
attrdef:<p>Attribute definitions</p>:<p>attribute 定義：</p>:<p>属性定義：</p>
viewAs:View this example as SVG (SVG-enabled browsers only):この例を SVG で見る（要ブラウザ対応）

	●データ／型／演算
公式:formula:~
数量-:numeric:~
数量的:numerical:~

	●構文
展開-:expand::~
内包-:include::~
内包:inclusion::~
	妥当でない:invalid
解釈器:interpreter::~::インタープリタ


	●処理／IDL／event
nullable:::null 可能
変異不能:immutable::~

	●構造
	~group化する:grouping
svg:
	子孫:descendent
不可分:atomic::~
構造化-:structure::~
外来:foreign::~
下位-:sub-:~
部位:portion:~
最外縁の:outermost::~
最外縁:outermost::~
最内縁の:innermost::~

	●幾何
CTM:
幾何:geometry::~
幾何-:geometric::~
幾何的:geometric::~
下位path:subpath:::下位パス
区分:segment::~
span:
重合して:overlapして::重なり合って
重合しな:overlapしな::重なり合わな
限界:bounding::~
限界域:bounds::~
外形線:outline::~
内域:interior::~

切取られ:clipされ::切り取られ
切取った:clipした::切り取った
切抜かれ:clipされ::切り抜かれ
切抜き:clipping::切り抜き
切抜く:clipする::切り抜く

変形:transform::~
変形-:transform::~
変形n:transformation::変換
座標系変換:transformation::~
行列:matrix::~

拡縮-:scale::~
拡縮率:scale::~
拡縮:scaling::~
	拡縮-可能:scalable
並進-:translate::~
並進:translation::~
回転-:rotate::~
回転:rotation::~
斜傾:skew::~

平面:plane::~
図形:shape::~
中心:center::~
半径:radius::~
	半径:radii
縦方向:vertical::~
横方向:horizontal::~
縦横比:aspect ratio::~
側:side:~
直線:straight line::~
曲線:curve::~
真円:circle::~
真円な:circularな::~
矩形:rectangle::~
矩形な:rectangularな::~
接触判定:hit-testing::~
対角線長さ:diagonal::~

	●塗り／色／効果
sRGB:
RGB:
RGBA:
raster::::ラスター
	~raster化-:rasterize
bitmap::::ビットマップ
alpha::::アルファ
fill::::フィル
stroke::::ストローク
	~stroke時の:stroking
gradient:
graphics::::グラフィックス
grayscale::::グレイスケール
mask::::マスク
masking::::マスク法
	~maskされ見えなくなる:masked out
	~raster化-:rasterize
	~screen上の:onscreen
symbol::::シンボル
red:
blue:
green:
色停:color stop::~
黒:black::~
白:white::~
不透明度:opacity::~
塗られ:paintされ::塗られ
塗り:paint::~
塗る:paintする::~
塗れる:paintできる::~
塗らな:paintしな::~
塗ng:painting::塗り
後景:backdrop::~
遮る:obscureする:~
描く:drawする::~
描ける:drawできる::~
描かれ:drawされ::~
描かせ:drawさせ::~
描いて:drawして::~
描かな:drawしな::~
描き:drawing::~
描直す:redrawする::描き直す
描直し:redraw::描き直し
絵図:drawing:~
	描画されない:non-rendered
原始filter:filter primitive:::原始フィルタ
混色-:blend::~
混色:blending::~
組成-:composite::~
組成:compositing::~
積層-:stack::~
積層:stacking::~
解像度:resolution::~
装飾d:decorated::装飾


	●呈示／UI
	~animate化:animated
	非~animate化:non-animated
viewer::::ビューア
zoom::::ズーム
pan::::パン
隠され:hideされ::~
隠す:hideする::~
隠せば:hideすれば::~
隠して:hideして::~
選択-:select::~
選択:selection::~

	●資源
URI:
WOFF:
OpenType:
JPEG:
PNG:
multimedia::::マルチメディア

	●仕様
	~program的:programmatical
一様:uniform:~
品質:quality:~
高品質:high-quality::~
	〜品質:-quality
基礎的:fundamental:~
役割:role::~
道具:tool:~
共通しな:commonでな:~
自立的:standalone:~
	自立的:stand-alone
多彩:rich:~
	ものとする:shall
	させる:cause

	●仕様（動詞
並行して:parallelに:~
再構成-:rearrange:~
参考:informative:~
寄与-:contribute:~
尊重-:respect:~
強調-:highlight:~
指示書き:instructions:~
採用-:adopt:~
禁制-:prohibit:~
義務:mandatory:~
未解決:unresolved::~
警告:warning:~
給-:supply:~
指名-:designate:~
分類:category:~
設置-:place:~
補足-:supplement:~
補足的:supplemental:~
	適合する:are conformant
	見よ:refer to

	●未分類（動詞
反映先の:reflected:~
アテガえな:assignできな::あてがえな
アテガおう:assignしよう:あてがおう
参照先の:referenced::~
参照元の:referencing::~
参照ng:referencing::参照
域外参照:cross-references::~

	現れる:appear

	●未分類
ナシ:none:なし
時機:timing::~


	●指示語／機能語
	まで:at most
	章:chapter
	左:left
	最も近い:nearest
	まったく:at all
	各種:various

●●
`
