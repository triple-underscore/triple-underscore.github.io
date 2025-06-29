'use strict';

const source_data = {
//	toc_main: 'MAIN',
	init: EMPTY_FUNC,
};

Util.ready = function(){
	source_data.init();

	Util.switchWordsInit(source_data);
	PAGE_DATA.ref_key_map = (PAGE_DATA.ref_key_map || '') + `
HTTP:RFC9110
CACHING:RFC9111
HTTP11:RFC9112
HTTP2:RFC9113
HTTP3:RFC9114
URI:RFC3986
COOKIE:RFC6265
`

	/* 展開状態で保存されたページがこの script を読み込まないようにする */
	repeat('script[src="http-common.js"]', (e) => {
		e.remove();
	});
};

// source_data.populate = function(){};

source_data.generate = function(){
	const class_map = this.class_map;
	const tag_map = this.tag_map;
	const link_map = this.link_map;
	const st_phrase = this.st_phrase;
	const ref_base = this.ref_base || '';

	return this.html.replace(
		/%[\w\-~一-鿆あ-ん]+|`(.+?)([$@\^§])(\w*)/g,
		create_html
	);

	function create_html(match, key, indicator, klass){

if(!key) {//%
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
let tag = tag_map[klass];

switch(klass){
case 'r':
	text = `[${key}]`;
	href = `${ref_base}#${key}`;
	break;
case 'rfc':
	{
		const [rfc, sec] = key.split('/');
		if(!sec) {
			return match;
		}
		return `<a href="${ref_base}#RFC${rfc}">[RFC${rfc}]</a> <a href="~RFCx/rfc${rfc}#section-${sec}">§ ${sec}</a> `;
	}
	break;
case 'st': // status code
	text = `<code class="status">${key}</code> <span class="phrase">(${st_phrase[key]})</span>`;
	break;
case 'st0': // TODO st/st0＊
	klass = 'st';
	break;
case 'ph':
	text = `:${key}`;
	break;
case 'X':
	text = `%x${key}`;
	break;
case 'errata':
	text = `正誤表 #${key} `;
	href = `https://www.rfc-editor.org/errata/eid${key}`;
	break;
case 'en': // english words
	return `<span lang="en">${key}</span>`;
	break;
default:
}

if(tag) {
	let classname = class_map[klass];
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
	case '§':
		text = ` <a href="${href}">§ ${text}</a> `;
		break;
	case '@':
		text = `<dfn id="${href.slice(1)}">${text}</dfn>`;
		break;
	}
}

return text;

	}
};

/** class/tag mapping */
COMMON_DATA.class_map += `
r:ref
t:type
p:production
P:token
st:status
st0:status
wc:warn
h:header
ph:pseudo-header
m:method
dir:directive
qdir:directive
sdir:directive
com:comment
2119:rfc2119
X:hex-value
`

COMMON_DATA.tag_map += `
dfn:dfn
c:code
p:code
P:code
h:code
ph:code
m:code
st:code
st0:code
wc:code
dir:code
qdir:code
sdir:code
com:span
X:span
V:var
i:i
em:em
cite:cite
2119:em
`


/** status phrase */
source_data.st_phrase = {
'1xx': 'Informational',
'2xx': 'Successful',
'3xx': 'Redirection',
'4xx': 'Client Error',
'5xx': 'Server Error',
'100': 'Continue',
'101': 'Switching Protocols',
'103': 'Early Hints',
'200': 'OK',
'201': 'Created',
'202': 'Accepted',
'203': 'Non-Authoritative Information',
'204': 'No Content',
'205': 'Reset Content',
'206': 'Partial Content',
'300': 'Multiple Choices',
'301': 'Moved Permanently',
'302': 'Found',
'303': 'See Other',
'304': 'Not Modified',
'305': 'Use Proxy',
'306': 'Unused',
'307': 'Temporary Redirect',
'308': 'Permanent Redirect',
'400': 'Bad Request',
'401': 'Unauthorized',
'402': 'Payment Required',
'403': 'Forbidden',
'404': 'Not Found',
'405': 'Method Not Allowed',
'406': 'Not Acceptable',
'407': 'Proxy Authentication Required',
'408': 'Request Timeout',
'409': 'Conflict',
'410': 'Gone',
'411': 'Length Required',
'412': 'Precondition Failed',
'413': 'Content Too Large',
'414': 'URI Too Long',
'415': 'Unsupported Media Type',
'416': 'Range Not Satisfiable',
'417': 'Expectation Failed',
'418': '(Unused)',
'421': 'Misdirected Request',
'422': 'Unprocessable Content',
'426': 'Upgrade Required',
'451': 'Unavailable For Legal Reasons', // RFC7725
'500': 'Internal Server Error',
'501': 'Not Implemented',
'502': 'Bad Gateway',
'503': 'Service Unavailable',
'504': 'Gateway Timeout',
'505': 'HTTP Version Not Supported',
};

// ●link
COMMON_DATA.link_map += `

	●fields

	//Semantics
h.Content-Encoding:~HTTPsem#field.content-encoding
h.Connection:~HTTPsem#field.connection
h.Content-Language:~HTTPsem#field.content-language
h.Content-Length:~HTTPsem#field.content-length
h.Content-Location:~HTTPsem#field.content-location
h.Content-Range:~HTTPsem#field.content-range
h.Content-Type:~HTTPsem#field.content-type
h.Host:~HTTPsem#field.host
h.TE:~HTTPsem#field.te
h.Trailer:~HTTPinfra#field.trailer
h.Upgrade:~HTTPsem#field.upgrade
h.Via:~HTTPsem#field.via

h.Accept:~HTTPsem#field.accept
h.Accept-Charset:~HTTPsem#field.accept-charset
h.Accept-Encoding:~HTTPsem#field.accept-encoding
h.Accept-Language:~HTTPsem#field.accept-language
h.Authorization:~HTTPsem#field.authorization
h.Expect:~HTTPsem#field.expect
h.From:~HTTPsem#field.from
h.If-Match:~HTTPsem#field.if-match
h.If-Modified-Since:~HTTPsem#field.if-modified-since
h.If-None-Match:~HTTPsem#field.if-none-match
h.If-Range:~HTTPsem#field.if-range
h.If-Unmodified-Since:~HTTPsem#field.if-unmodified-since
h.Max-Forwards:~HTTPsem#field.max-forwards
h.Proxy-Authorization:~HTTPsem#field.proxy-authorization
h.Range:~HTTPsem#field.range
h.Referer:~HTTPsem#field.referer
h.User-Agent:~HTTPsem#field.user-agent

h.Accept-Ranges:~HTTPsem#field.accept-ranges
h.Allow:~HTTPsem#field.allow
h.Authentication-Info:~HTTPsem#field.authentication-info
h.Date:~HTTPinfra#field.date
h.ETag:~HTTPsem#field.etag
h.Last-Modified:~HTTPsem#field.last-modified
h.Location:~HTTPsem#field.location
h.Proxy-Authenticate:~HTTPsem#field.proxy-authenticate
h.Proxy-Authentication-Info:~HTTPsem#field.proxy-authentication-info
h.Retry-After:~HTTPsem#field.retry-after
h.Server:~HTTPsem#field.server
h.Vary:~HTTPsem#field.vary
h.WWW-Authenticate:~HTTPsem#field.www-authenticate

	//Cache
h.Age:~HTTPcache#field.age
h.Cache-Control:~HTTPcache#field.cache-control
h.Expires:~HTTPcache#field.expires
h.Pragma:~HTTPcache#field.pragma
h.Warning:~HTTPcache#field.warning

	//Messaging
h.Transfer-Encoding:~HTTPv1#field.transfer-encoding

	//他
h.Cookie:~HTTPcookie#sane-cookie
h.Set-Cookie:~HTTPcookie#sane-set-cookie
h.Link:~HTTPweblink#field.link

	h.URI
	h.Alternates:rfc2295#section-8.3

	●request methods
m.GET:~HTTPsem#GET
m.HEAD:~HTTPsem#HEAD
m.POST:~HTTPsem#POST
m.PUT:~HTTPsem#PUT
m.DELETE:~HTTPsem#DELETE
m.CONNECT:~HTTPsem#CONNECT
m.OPTIONS:~HTTPsem#OPTIONS
m.TRACE:~HTTPsem#TRACE
m.PATCH:~HTTPpatch#patch

	●status codes

st.1xx:~HTTPsem#status.1xx
st.2xx:~HTTPsem#status.2xx
st.3xx:~HTTPsem#status.3xx
st.4xx:~HTTPsem#status.4xx
st.5xx:~HTTPsem#status.5xx
st.100:~HTTPsem#status.100
st.101:~HTTPsem#status.101
st.103:~HTTPearlyhints#early-hints
st.200:~HTTPsem#status.200
st.201:~HTTPsem#status.201
st.202:~HTTPsem#status.202
st.203:~HTTPsem#status.203
st.204:~HTTPsem#status.204
st.205:~HTTPsem#status.205
st.206:~HTTPsem#status.206
st.300:~HTTPsem#status.300
st.301:~HTTPsem#status.301
st.302:~HTTPsem#status.302
st.303:~HTTPsem#status.303
st.304:~HTTPsem#status.304
st.305:~HTTPsem#status.305
st.306:~HTTPsem#status.306
st.307:~HTTPsem#status.307
st.308:~HTTPsem#status.308
st.400:~HTTPsem#status.400
st.401:~HTTPsem#status.401
st.402:~HTTPsem#status.402
st.403:~HTTPsem#status.403
st.404:~HTTPsem#status.404
st.405:~HTTPsem#status.405
st.406:~HTTPsem#status.406
st.407:~HTTPsem#status.407
st.408:~HTTPsem#status.408
st.409:~HTTPsem#status.409
st.410:~HTTPsem#status.410
st.411:~HTTPsem#status.411
st.412:~HTTPsem#status.412
st.413:~HTTPsem#status.413
st.414:~HTTPsem#status.414
st.415:~HTTPsem#status.415
st.416:~HTTPsem#status.416
st.417:~HTTPsem#status.417
st.418:~HTTPsem#status.418
st.421:~HTTPsem#status.421
st.422:~HTTPsem#status.422
st.426:~HTTPsem#status.426
st.500:~HTTPsem#status.500
st.501:~HTTPsem#status.501
st.502:~HTTPsem#status.502
st.503:~HTTPsem#status.503
st.504:~HTTPsem#status.504
st.505:~HTTPsem#status.505

	●protocol elements

	//5234
P.ALPHA:~HTTPcommon#P.ALPHA
P.CR:~HTTPcommon#P.CR
P.CRLF:~HTTPcommon#P.CRLF
P.CTL:~HTTPcommon#P.CTL
P.DIGIT:~HTTPcommon#P.DIGIT
P.DQUOTE:~HTTPcommon#P.DQUOTE
P.HEXDIG:~HTTPcommon#P.HEXDIG
P.HTAB:~HTTPcommon#P.HTAB
P.LF:~HTTPcommon#P.LF
P.OCTET:~HTTPcommon#P.OCTET
P.SP:~HTTPcommon#P.SP
P.VCHAR:~HTTPcommon#P.VCHAR
		TODO
		P.CHAR = %x01-7F
		P.NUL:

	//3986
p.URI-reference:~HTTPinfra#p.URI-reference
p.absolute-URI:~HTTPinfra#p.absolute-URI
p.relative-part:~HTTPinfra#p.relative-part
p.authority:~HTTPinfra#p.authority
p.uri-host:~HTTPinfra#p.uri-host
p.path-abempty:~HTTPinfra#p.path-abempty
p.segment:~HTTPinfra#p.segment
p.query:~HTTPinfra#p.query

p.scheme:~HTTPinfra#p.scheme
p.host:~HTTPinfra#p.host
p.port:~HTTPinfra#p.port
p.path:~HTTPinfra#p.path
p.fragment:~HTTPinfra#p.fragment

	//Semantics（infra

p.absolute-path:~HTTPinfra#p.absolute-path
p.partial-URI:~HTTPinfra#p.partial-URI
p.http-URI:~HTTPinfra#p.http-URI
p.https-URI:~HTTPinfra#p.https-URI
p.userinfo:~HTTPinfra#p.userinfo
p.field-name:~HTTPinfra#p.field-name
p.field-value:~HTTPinfra#p.field-value
p.field-content:~HTTPinfra#p.field-content
p.field-vchar:~HTTPinfra#p.field-vchar
p.token:~HTTPinfra#p.token
p.tchar:~HTTPinfra#p.tchar
p.BWS:~HTTPinfra#p.BWS
p.OWS:~HTTPinfra#p.OWS
p.RWS:~HTTPinfra#p.RWS
p.quoted-string:~HTTPinfra#p.quoted-string
p.qdtext:~HTTPinfra#p.qdtext
p.obs-text:~HTTPinfra#p.obs-text
p.quoted-pair:~HTTPinfra#p.quoted-pair
p.comment:~HTTPinfra#p.comment
p.ctext:~HTTPinfra#p.ctext
p.parameters:~HTTPinfra#p.parameters
p.parameter:~HTTPinfra#p.parameter
p.parameter-name:~HTTPinfra#p.parameter-name
p.parameter-value:~HTTPinfra#p.parameter-value

p.HTTP-date:~HTTPinfra#p.HTTP-date
p.IMF-fixdate:~HTTPinfra#p.IMF-fixdate
p.day-name:~HTTPinfra#p.day-name
p.date1:~HTTPinfra#p.date1
p.day:~HTTPinfra#p.day
p.month:~HTTPinfra#p.month
p.year:~HTTPinfra#p.year
p.GMT:~HTTPinfra#p.GMT
p.time-of-day:~HTTPinfra#p.time-of-day
p.hour:~HTTPinfra#p.hour
p.minute:~HTTPinfra#p.minute
p.second:~HTTPinfra#p.second
p.obs-date:~HTTPinfra#p.obs-date
p.rfc850-date:~HTTPinfra#p.rfc850-date
p.date2:~HTTPinfra#p.date2
p.day-name-l:~HTTPinfra#p.day-name-l
p.asctime-date:~HTTPinfra#p.asctime-date
p.date3:~HTTPinfra#p.date3


	//Semantics
p.byte-content-range:~HTTPsem#p.byte-content-range
p.byte-range-resp:~HTTPsem#p.byte-range-resp
p.complete-length:~HTTPsem#p.complete-length
p.connection-option:~HTTPsem#p.connection-option
p.content-coding:~HTTPsem#p.content-coding
p.first-pos:~HTTPsem#p.first-pos
p.incl-range:~HTTPsem#p.incl-range
p.int-range:~HTTPsem#p.int-range
p.language-tag:~HTTPsem#p.language-tag
p.last-pos:~HTTPsem#p.last-pos
p.media-type:~HTTPsem#p.media-type
p.method:~HTTPsem#p.method
p.other-content-range:~HTTPsem#p.other-content-range
p.other-range:~HTTPsem#p.other-range
p.protocol-name:~HTTPsem#p.protocol-name
p.protocol-version:~HTTPsem#p.protocol-version
p.protocol:~HTTPsem#p.protocol
p.pseudonym:~HTTPsem#p.pseudonym
p.qvalue:~HTTPsem#p.qvalue
p.range-resp:~HTTPsem#p.range-resp
p.range-set:~HTTPsem#p.range-set
p.range-spec:~HTTPsem#p.range-spec
p.range-unit:~HTTPsem#p.range-unit
p.ranges-specifier:~HTTPsem#p.ranges-specifier
p.received-by:~HTTPsem#p.received-by
p.received-protocol:~HTTPsem#p.received-protocol
p.subtype:~HTTPsem#p.subtype
p.suffix-length:~HTTPsem#p.suffix-length
p.suffix-range:~HTTPsem#p.suffix-range
p.transfer-coding:~HTTPsem#p.transfer-coding
p.transfer-parameter:~HTTPsem#p.transfer-parameter
p.t-codings:~HTTPsem#p.t-codings
p.type:~HTTPsem#p.type
p.unsatisfied-range:~HTTPsem#p.unsatisfied-range
p.weight:~HTTPsem#p.weight

p.auth-param:~HTTPsem#p.auth-param
p.auth-scheme:~HTTPsem#p.auth-scheme
p.challenge:~HTTPsem#p.challenge
p.codings:~HTTPsem#p.codings
p.credentials:~HTTPsem#p.credentials
p.expectation:~HTTPsem#p.expectation
p.language-range:~HTTPsem#p.language-range
p.mailbox:~HTTPsem#p.mailbox
p.media-range:~HTTPsem#p.media-range
p.product-version:~HTTPsem#p.product-version
p.product:~HTTPsem#p.product
p.token68:~HTTPsem#p.token68

p.acceptable-ranges:~HTTPsem#p.acceptable-ranges
p.delay-seconds:~HTTPsem#p.delay-seconds
p.entity-tag:~HTTPsem#p.entity-tag
p.etagc:~HTTPsem#p.etagc
p.opaque-tag:~HTTPsem#p.opaque-tag
p.weak:~HTTPsem#p.weak

	//Cache
p.Age:~HTTPcache#p.Age
p.Cache-Control:~HTTPcache#p.Cache
p.Expires:~HTTPcache#p.Expires

p.cache-directive:~HTTPcache#p.cache-directive
p.delta-seconds:~HTTPcache#p.delta-seconds

	●code 他
c.http:~HTTPinfra#http.uri
c.https:~HTTPinfra#https.uri

c.chunked:~HTTPv1#chunked.encoding
c.compress:~HTTPsem#compress.coding
c.deflate:~HTTPsem#deflate.coding
c.gzip:~HTTPsem#gzip.coding
c.identity:~HTTPsem#identity-token
c.100-continue:~HTTPsem#100-continue

c.multipart/byteranges:~HTTPsem#multipart.byteranges
c.multipart:~HTTPsem#multipart.types

c.realm:~HTTPsem#realm


	●用語

	// -> semantics

	§#conformance
適合性:~HTTPinfra#conformance
生成-:~HTTPinfra#generate

~protocol~version:~HTTPinfra#protocol.version
	~version番号:~HTTPinfra#version-number
~major~version:~HTTPinfra#major-version
~minor~version:~HTTPinfra#minor-version

	§#terminology
資源:~HTTPinfra#resource
表現:~HTTPinfra#representation
選定された表現:~HTTPinfra#selected-representation
選定される表現:~HTTPinfra#selected-representation
~client:~HTTPinfra#client
~server:~HTTPinfra#server
	役割
	参加者
	接続
~message:~HTTPinfra#message
要請:~HTTPinfra#request
要請~message:~HTTPinfra#request
応答:~HTTPinfra#response
応答~message:~HTTPinfra#response
連鎖:~HTTPinfra#chain
端点:~HTTPinfra#endpoint
端点間:~HTTPinfra#end-to-end
隣点間:~HTTPinfra#hop-by-hop
上流:~HTTPinfra#upstream
下流:~HTTPinfra#downstream
内方:~HTTPinfra#inbound
外方:~HTTPinfra#outbound
送信者:~HTTPinfra#sender
受信者:~HTTPinfra#recipient
~UA:~HTTPinfra#user-agent
生成元~server:~HTTPinfra#origin-server
媒介者:~HTTPinfra#intermediary
~proxy:~HTTPinfra#proxy
回送-~proxy:~HTTPinfra#forward-proxy
~gateway:~HTTPinfra#gateway
逆~proxy:~HTTPinfra#reverse-proxy
透過的~proxy:~HTTPinfra#transparent-proxy
横取n~proxy:~HTTPinfra#interception-proxy
~tunnel:~HTTPinfra#tunnel
~stateless:~HTTPinfra#stateless
~cache:~HTTPinfra#cache
~cache可能:~HTTPinfra#cacheable

	§#uri
~URI:~HTTPinfra#uri
~URI参照:~HTTPinfra#uri-reference
~secure化:~HTTPinfra#secured
	生成元:~HTTPinfra#origin

	§#fields
~field:~HTTPinfra#field
~field節:~HTTPinfra#field-section
~field名:~HTTPinfra#field-name
~field値:~HTTPinfra#field-value
~field行l:~HTTPinfra#field-line
~field行l値:~HTTPinfra#field-line-value
単数~field:~HTTPinfra#singleton-field
~listに基づく~field:~HTTPinfra#list-based-field
結合-:~HTTPinfra#combine-headers

	~token:
空白:~HTTPinfra#whitespace
	~comment:~HTTPinfra#comments
~parameter:~HTTPinfra#parameter
	日時:~HTTPinfra#http.date
	素片~識別子:~HTTPinfra#uri.fragment.identifiers

	§#message.abstraction

	~message:~HTTPinfra#message
自己-記述的:~HTTPinfra#self-descriptive
完全:~HTTPinfra#complete
不完全:~HTTPinfra#complete
制御~data:~HTTPinfra#control-data
~header:~HTTPinfra#header-field
~header節:~HTTPinfra#header-section
~trailer:~HTTPinfra#trailer-field
~trailer節:~HTTPinfra#trailer-section
~message内容:~HTTPinfra#message-content
内容:~HTTPinfra#message-content
~messageの出生日時:~HTTPinfra#origination-date
時計:~HTTPinfra#clock

	§#routing
~target~URI:~HTTPsem#target-URI
~target資源:~HTTPsem#target-resource
要請~target:~HTTPsem#request-target
	接続~option:~HTTPsem#connection-option
形式変換-:~HTTPsem#message-transformation
形式変換:~HTTPsem#message-transformation

	§#representation.data.and.metadata
表現~data:~HTTPsem#representation-data
表現~header:~HTTPsem#representation-header
表現~metadata:~HTTPsem#representation-metadata
~MIME型:~HTTPsem#media-type
~MIME型~parameter:~HTTPsem#media-type-parameter
~charset:~HTTPsem#charset
内容~符号法:~HTTPsem#content.codings
内容~符号法の名前:~HTTPsem#p.content-coding
言語~tag:~HTTPsem#language-tag
検証子~field:~HTTPsem#validator-field
検証子:~HTTPsem#validator
強い検証子:~HTTPsem#strong-validator
弱い検証子:~HTTPsem#weak-validator
	強い:~HTTPsem#strong-validator
	弱い:~HTTPsem#weak-validator
強い比較~関数:~HTTPsem#strong-comparison
弱い比較~関数:~HTTPsem#weak-comparison
改変~日時:~HTTPsem#modification-date
実体~tag:~HTTPsem#entity-tag

	§#methods
~method:~HTTPsem#methods
要請~method:~HTTPsem#methods
安全:~HTTPsem#safe-method
冪等:~HTTPsem#idempotent-method
冪等~method:~HTTPsem#idempotent-method
~server-wide:~HTTPsem#server-wide

	§#context
期待:~HTTPsem#expectation
製品~識別子:~HTTPsem#product-identifier
要請~header:~HTTPsem#request.context
応答~header:~HTTPsem#response.context

	§#authentication
認証~scheme:~HTTPsem#auth.scheme
認証~parameter:~HTTPsem#authentication-parameter
資格証:~HTTPsem#credential
保護~空間:~HTTPsem#protection-space

	§#content.negotiation
内容~折衝:~HTTPsem#content-negotiation
~proactive折衝:~HTTPsem#proactive-negotiation
~proactive折衝~header:~HTTPsem#proactive-negotiation
~reactive折衝:~HTTPsem#reactive-negotiation
要請~内容~折衝:~HTTPsem#request-content-negotiation
品質値:~HTTPsem#quality-value
品質~値:~HTTPsem#quality-value
	既定の重み
	~wildcard値

	§#conditional.requests
条件付き要請:~HTTPsem#conditional-request
条件付き要請~header:~HTTPsem#conditional-request-header
事前条件~header:~HTTPsem#conditional-request-header
事前条件:~HTTPsem#precondition
更新喪失:~HTTPsem#lost-update

	§#field.range
範囲~要請:~HTTPsem#range-request
	範囲~指定子
範囲~単位:~HTTPsem#range-unit
~byte範囲:~HTTPsem#byte-range

	§#status.codes
応答~状態s~code:~HTTPsem#status-code
状態s~code:~HTTPsem#status-code
~class:~HTTPsem#status-code-class

非最終-応答:~HTTPsem#interim-response
最終-応答:~HTTPsem#final-response
	#final.interim
事由~句:~HTTPsem#reason-phrase

部分的な応答:~HTTPsem#status.206
部分的:~HTTPsem#status.206

	§#extending

	§#security.considerations
指紋収集:~HTTPinfra#fingerprinting
	権限的な応答



	●HTTPcache
~cache指令:~HTTPcache#cache-directive
経験的に~cache可能:~HTTPcache#heuristically-cacheable
~cache検証:~HTTPcache#validation.model
~cache検証~要請:~HTTPcache#validation.sent
鮮度~情報:~HTTPcache#calculating.freshness.lifetime
共用~cache:~HTTPcache#shared-cache
私用~cache:~HTTPcache#private-cache
	~cache:~HTTPcache#cache

	●HTTPv1
~HTTP11:~HTTPv1#version-1.1
転送~符号法:~HTTPv1#transfer.codings
転送~符号法の名前:~HTTPv1#transfer-coding-name
~message本体:~HTTPv1#message.body

	●
~IETFによる考査:~RFCx/rfc8126#section-4.8

`

// 
COMMON_DATA.words_table1 += `

●●words_table1

RFC8246:http-immutable-response-ja.html
HTTPpatch:http-patch-ja.html
HTTPearlyhints:http-status-code-103-ja.html

	ERRATA:https://www.rfc-editor.org/errata_search.php
ERRATA:https://www.rfc-editor.org/errata

ナラナイ:<em class="rfc2119">ならない</em>
ベキ:<em class="rfc2119">べき</em>
ヨイ:<em class="rfc2119">よい</em>
OUGHT:べき.である

Ps:%s
	Pi:%i

`

COMMON_DATA.words_table += `

●●words_table
HTTP09:HTTP/0.9
HTTP10:HTTP/1.0
HTTP11:HTTP/1.1
	HTTP1x:
伝え:informし:~
伝える:informする:~
切替:switching::切り替え
切替わる:switchする::切り替わる
切替え:switchし::切り替え
切替えら:switchさ::切り替えら
切替える:switchする::切り替える
割振ら:allocateさ:割り振ら
割振る:allocateする::割り振る
アテガえな:assignできな:あてがえな
含まな:includeしな:~
含ませ:includeさせ:~
含まれ:includeされ:~
含む:includeする:~
含めて:includeして:~
含めな:includeしな:~
含めら:includeさ:~
含める:includeする:~
含んで:includeして:~
内包-:include:~
内包:inclusion:~

始まる:beginする:~
指す:referする:~
指し:referし:~
指され:referされ:~
書換え:rewriteし::書き換え
書換える:rewriteする::書き換える
繰返し:repetition:繰り返し
繰返した:repeatした:繰り返した
繰返して:repeatして:繰り返して
繰返せ:repeatでき:繰り返せ


渡され:passされ:~
渡す:passする:~

満足さ:satisfyさ:満たさ
満足し:satisfyし:満たし
満足しな:satisfyしな:満たさな
満足しよ:satisfyしよ:満たそ
満足する:satisfyする:満たす
満足でき:satisfyでき:満たせ
結付法:associating:結び付け
見出させ:findさせ:~
運ばせ:carryさせ::~
運ばれ:carryされ::~
運ばな:carryしな::~
運ぶ:carryする::~
運べる:carryできる:~
運んで:carryして:~
重なっ:overlapし:~
隠す:hideする:~
隠され:hideされ:~
隠し:hideし:~
見積もり:estimate::~
見積もら:estimateさ::~
見積もる:estimateする::~
促す:promptする:~

Cookie:
DoS:denial-of-service:DoS
Internet:
TCP:
TLS:
URI:
UTC:

charset:
overhead::::オーバーヘッド
	~~渡る:span:
指図-:instruct:~
account::::アカウント
archive::::アーカイブ
bookmark::::ブックマーク
component::::コンポーネント
container:::コンテナ
crash::::クラッシュ
database::::データベース
folder::::フォルダ
guide::::ガイド
	~hypertext:hypertext note
	key::::キー
machine::::マシン
mail::::メール
email:
句:phrase::~::フレーズ
	pipe-and-filter:パイプ＆フィルタ
property::::プロパティ
	特質
	render::::レンダー
	rendering::::レンダリング
repository::::リポジトリ
schedule::::スケジュール
major::::主:メジャー
minor::::副:マイナー

	●指示語
一定の:certain:~
一時的:temporary:~
余分な:extra:~
今後の:later:~
側:side:~
尾部:trailing:~
頭部:leading:~
巨大:large:~
非最終-:interim:~
最終-:final:~
近過去:recent::~
重複:duplicate:~

	●仕様
proprietary::::プロプライエタリ
十分:enough:~
導かれ:leadされ:~
導き:leadし:~
導く:leadする:~

扱い:treatment:~
望まず:wishせず:~
回避法:avoidance:~
agent::::エージェント
応用-:apply::~
一般用:general-purpose:~
	事実:In fact
見越す:anticipateする:~
見越して:anticipateして:~
見越され:anticipateされ:~
見越さな:anticipateしな:~
上品:graceful::~
不可欠:crucial:~
保守的:conservative:~
適時:timely:~
有意度:significance:~
有意性:significance:~
不利:disadvantage:~
利点:advantage:~
有利:advantageous:~
利用e:usage:利用
誤用-:misuse:~
濫用:abuse:~
上限:limit:~
創出-:mint:~
同意-:agree:~
回答:answer:~

損失:loss:~
対処-:work around:~
対処法:workaround:~
堅牢:robust:~
堅牢性:robustness:~
図:figure:~
増強-:enhance:~
可用性:availability:~
不可能:impossible:~
同義語:synonym:~
大概は:presumableに:~
実用性:practicality:~
遂行:performing:~
導入:introduction:~
履行-:fulfill:~
必要十分:adequate:~
必要性:needs:~
恒久的:permanent:~
慣行:convention::~
早期の:early:~
柔軟:flexible:~
柔軟性:flexibility:~
欠如:lack:~
欠如する:lackする:欠く
採用-:adopt:~
採用:adoption:~
推測-:guess:~
推測:guess:~
支援-:assist:~
故意:deliberate:~
深刻:serious:~
準拠-:comply::~
準拠:compliant::~
相互運用-:interoperate:~
相当:substantial:~
禁制-:prohibit::~
競合-:conflict:~
競合:conflict:~
精緻化:refinement:~
経験的:heuristic::~::ヒューリスティック
結論-:conclude:~
結論:conclusion:~
統一的:uniform:~
網羅的:exhaustive:~
総集的:collective:~
緩めら:relaxさ:~
緩める:relaxする:~
緩めた:relaxした:~
義務化-:mandate:~
翻訳-:translate::~
翻訳:translation::~
補助:help:~
複雑化-:complicate:~
表記規約:notational conventions:~
版:edition:~

設置-:place:~
設置しな:placeしな:課さな
設置する:placeする:課す
誤解:mistake:~
責務:responsibility:~
開示-:disclose:~
開示:disclosure:~
関心:interest:~
限度:extent:~
公共:public:~
表記法:notation:~
解決策:solution:~
英語:English:~
偶発的:accidental:~
理論:theory:~
類別:category:~
維持-:retain:~
維持させ:sustainし:~
背後:behind:~
協調的:collaborative:~
相違化-:differentiate:区別
運用-:operate:~
運用:operation:~
運用者:operator:~
警告:warning::~
警告-:warn::~
組織:organization:~
再試行:retry::~
再試行-:retry::~
	再試行-法:retrying
確約-:assure:~
メモ:memo:::~
稀:rare:~

	:be aware of
	適切でない:inappropriate
	適用すること:application
	認識できない／自身が認識しない:unrecognized

	●保安
私的:private:~:::プライベート
騙す:trickする:~
騙せ:trickでき:~
穴:hole::~::ホール
弱体化-:compromise:~
悪用-:exploit:~
悪用:exploitation:~
害:harm:~
有害:harmful:~
無害:harmless:~
権限:authority::~
権限付与-:authorize::~
権限付与され:authorizeされ::権限が付与され
権限付与:authorization::~
権限的:authoritative::~
認証-:authenticate::~
	認証-済み:authenticated
認証:authentication::~
認証用の:authentication::~
機密性:confidentiality::~
機密的:confidential::~
汚染-:poison::~
汚染:poisoning::~
脆弱:vulnerable::~
署名:signature:~
防御策:defense:~
露呈-:reveal:露わに
経路上の:on-path::~
相関-:correlate:~
相関:correlation:~

	●HTTP／構文／data／stream

hypertext::::ハイパーテキスト
pathname::::パス名
packet::::パケット
content:
payload::::ペイロード
percent::::パーセント
subtag::::下位タグ
trailer::::トレイラ
	trailer節:trailers
chunked:::chunk 化:チャンク化
hex::16 進
hexadecimal::16 進数
asterisk::::アスタリスク
backslash::::バックスラッシュ
chunk::::チャンク
decimal::10 進
escaping::::エスケープ処理
	引用符~付き:quoted
	~message法:messaging:
	~frame法:framing
二重引用符:double quote::~
区切られ:delimitされ:~
区切り:delimitation:~
区切る:delimitする:~
実数:real number:~
単数:singleton:::~
桁:digit::~
番号:number:~
圧縮-:compress::~
圧縮:compression::~
下位成分:subcomponent::~
記号:symbol:~
	符号化-済み:encoded
符号法:coding::~::コーディング
暗号化-:encrypt::~
暗号化:encryption::~
暗号用の:cryptographic::~
形式変換-:transform::~
形式変換:transformation::~
形式変換ng:transforming::形式変換
分解-:decompose:~
節:section::~::セクション

	●network

challenge::::チャレンジ
digest::::ダイジェスト
hash::::ハッシュ
firewall::::ファイアウォール
桁溢れ:overflow::~::オーバーフロー
password::::パスワード
	~cache済み:cached
	~cache可能:cacheable
caching:::cache 処理:キャッシュ処理
事前fetch:pre-fetch::事前 fetch
gateway::::ゲートウェイ
内方:inbound::~::インバウンド
外方:outbound::~::アウトバウンド
provider::::プロバイダ
server-wide::server 全般::サーバ全般
spider::::スパイダー
robot::::ロボット
transaction::::トランザクション
tunnel::::トンネル
close:
closure:
open:
route::::ルート
	~route法:routing
direct::::ダイレクト
	ディレクティブ
指令-:direct::~
	directional:
双方向:bidirectional::~
上流:upstream::~
下流:downstream::~
中継-:relay::~
介在-:intervene:~
伝送処理:transmitting::~
回送-:forward::~
回送:forwarding::~
	回送-法:forwarding
伝送路:wire::~
分散型の:distributedな::~
携わる:engageする:~
携わっ:engageし:~
参加者:participant:~
参照元:referring:refer 元:~
受領:receipt::~
広告-:advertise:~
広告:advertisement:~
昇格:upgrade::~::アップグレード
降格:downgrade::~::ダウングレード
端点:endpoint::~::エンドポイント
端点間:end-to-end::~::エンドツーエンド
隣点間:hop-by-hop::~::ホップバイホップ
連結-:concatenate:~
実体:entity:~

所在-:locate::~
経路:path::~
横取n:interception::横取り

	●未分類
root::::ルート
個人-:personal:~
不定:indefinite:~
中断:interruption:~

交換:exchange:~
付随-:accompany:~
遊休:idle:~
	遊休~中:idle
proactive::::プロアクティブ
reactive::::リアクティブ
併合-:merge:~
促進-:promote:~
保存-:save:~
優先度:priority:~
優先順:precedence:~
先行-:precede:~
内来的:inherent:~
冪等:idempotent::~

出現:appearance:~
出現し:appearし:現れ
出現する:appearする:現れる
出生-:originate::~
出生日時:origination date::~
出生時:origination::~
出生時の:origination::~
割合:percentage:~
割当-:allocate:~
事前条件:precondition::~
取込まれ:importされ:取り込まれ
同一性:identity:~
同封-:enclose::~
同時:simultaneous:~
品質:quality::~
品質値:qvalue::~
回復-:recover::~
固定的な:fixed:~
下位型:subtype::~
回復:recovery::~
失効:expiration:~
失効-:expire:~
弱い:weakな::~
弱さ:weakness::~
強い:strongな::~
強さ:strength::~
検証y-:verify:検証°
検証y:verification:検証°
検証子:validator::~
有効:valid::~
有効性:validity:~
無効化-:invalidate::~
無効化:invalidation::~
容量:capacity:~
対応-:correspond:~
尚早:premature:~
展開-:expand:~
帯域幅:bandwidth::~::バンド幅
役割:role::~::ロール
後処理:post-processing:~
復帰-:revert:~
所属-:belong:~
所属:belong:~
拒否-:refuse:~
持続-:persist::~
持続性:persistence::~
持続的:persistent::~
給-:supply:~
給せ:supplyでき:~
給さな:supplyしな:~
改変子:modifier::~
族:family::~::ファミリ
日付時刻:date and time::日時
日時:date::~
時計:clock::~::クロック
昇順:ascending order:~
降順:decreaseing order:~
更新喪失:lost update::~
格納域:store::~
再構築-:reconstruct:~
再構築:reconstruction:~
	＊構築し直す
段階:stage:~
活動:activity::~
消去-:erase:~
状態変更:state-changing::~::ステート変更
stateless::::ステートレス
stateful::::ステートフル
生の:raw:~
疑似:pseudo-:~
為す:makeする:~
為され:makeされ:~
為さな:makeしな:~
為して:makeして:~
為した:makeした:~
為せる:makeできる:~
為せな:makeできな:~
	登録-済み:registered
盲目的:blind::~
知覚-:perceive:~
知覚:perception:~

短縮-:shorten:~
種類:kind:~
稼働-:run:~
節約-:save:~
続行-:proceed:~
記憶-:remember:~
	識別-法:identifying
	識別されない:unidentified
	識別-可能:identifyable
負荷:load:~
過負荷:overload:~
超過-:exceed:~
近似:approximation:~
演算子:operator:~
過去:past:~
過去の:pastな:~
遭遇-:encounter:~
選択的:selective::~
選択:choice:~
選択肢:choice:~
	選ぶ／選ばれ／選ん／選べ／ことにする:choice
部位:portion:~
部位t:part::部位
重み:weight::~
量:amount:~
開く:openする::~
鮮度:freshness::~
新鮮:fresh::~
	新鮮~化-:freshen
	新鮮~化法:freshening
非新鮮:stale::~
重合する:overlapする:重なり合う
重合しな:overlapしな:重なり合わな
重合して:overlapして:重なり合って
重合した:overlapした:重なり合った
合体-:coalesce:~

`
/*
	●仕様（他
logging
	高い:high
	〜する用意がない:unwilling
	思しきもの:supposedly:
	よって:hence
	何故なら:because
	その時々:on occasion
	~~目的:sake:目的
	おそれ:fear
	が可能になる
	し得ないincapable
	保つ
	年:year
	秒数:seconds
	等しく:equalに
	優先される:precedenceを takeする
	能力を備えている:be capable of
	（〜に備わる能力）
	あり得る／なり得る:potential
	いずれにせよ、:nevertheless
	適切でない:inappropriate
	書いている:writing
	必要がある:have to
	好ましい:preferably
	見込みが高い:likely to
	見込みが低い:not likely to
	〜に従って:-
	いわゆる:a.k.a.
	〜に関係する:in relation to

	●指示語
	一連の:sequence
	〜に従って:-
	より容易に:easier
	なり得る:potential
	1 個以上の:(s)
	〜されたなら、／一度:once
	誰も:anyone
	もたらす／:cause
	いつでも:at any time
	時点:at the time
	いわゆる:a.k.a.
	またがって:acrossして
	またがる:acrossする

	最後に:finally
	最終的:eventual
	先立つ:prior
	〜に先立って／先に／事前に／~~直前:prior to〜
	次:next
	残りの部分:remainder
	後続-:follow
	前後:around
	そのような:such／:these／...
	全面的に:entirely
	一部分
	一部／部分
	多種多様な:variety
	数種の:several
	の一部:some of
	よく:often
	時には:occasionally
	各所／他所
	沿いにある:along the chain
	逆:reverse
	近い:near
	総:total
	小さな:small

	●動詞
	高める:increaseさせる
	括って:surround
	挙げる:list
	考慮-:regard
	置-
	置く／場所:place
	考え:thinking／suggested
	高める:increaseさせる
	持-:have
	始-／~~開始:begin
	close
	open
	fall
	left
	play
	named
	operate:
	remain
	vary
	-:take
	:tell
	記す／表す:denoteする
	保持-:held
	remain
	応える:meet
	求めに応じて
	行っ
	行われ
	通して渡され:pass through
	あてがう:assignする
	あてがわれ:assignされ
	securedでない:unsecured
	accountable
	actor
	agent駆動の:agent-driven
	render←rendition
	締めくくる:conclude
	say
	seem
	cause
	note
	示-:show
	
	●
	
	量:amount
	類い
	■
	
	unwise
	sequence
	potential
	like
	old
	readily
	respective
	sequence
	
	greater
	long
	missing
	commonly
	draw
	その他の:miscellaneous
	sameness
	through
	事前動作
	受動的
	出来事
	及ぼす
	宛先
	強くstrong
	期間:period／period of time
	誤り:wrong
	長く／長い~long
	電網
	一式:set
	〜に利するため:on behalf of
	~~広-:broad／broaden／broader

	＊追加
	~frame法:framing
	~message法:messaging
	~version法:versioning
	〜外:outside
	他方の:one of the two
	種々の:varying
	種々の:variety of
	一連の:sequence
	なり得る:potential
	1 個以上の:(s)
	〜されたなら、／一度:once
	誰も:anyone
	もたらす／:cause
	いつでも:at any time
	時点:at the time
	〜~levelの:〜-level
	〜されたなら、:once
	並び:sequence
	の他に／は別として，:aside from
	変わる:vary
	何故なら:because
	何故:why
	施す:make
	下す:make
	為す:make
	~~行われた:make
	ときには:occasional
	様々になる:vary
	二重に:a second time
	一連の:a series of
	回数:the number of times
	要する:requireする
	のように:as in the
	一連の:successive
	先立つ:prior
	各部:parts

●●

*/