const source_data = {
	toc_main: 'MAIN0',
	init: EMPTY_FUNC,
};

Util.ready = () => {
	source_data.section_map = Util.get_mapping(PAGE_DATA.section_map || '');
	source_data.init();
	Util.switchWordsInit(source_data);

	/* 展開状態で保存されたページがこの script を読み込まないようにする */
	repeat('script[src="RFC723X.js"]', (e) => {
		e.remove();
	});
};


source_data.populate = function(){
	// header id を section から補完
	const section_map = this.section_map;
	repeat('section[id]', function(e){
		const h = e.firstElementChild;
		if(!h) return;
		const id = section_map[e.id.replace(/^(section-|appendix-)/, '')];
		if(id) h.id = id;
	});
};


source_data.generate = function(){
	const st_phrase = this.st_phrase;
	const section_map = this.section_map;

	const link_map = this.link_map || {};

	const class_map = this.class_map;
	const tag_map = this.tag_map;

	return this.html.replace(
		/`(.+?)([$@\^])(\w*)/g,
		create_html
	);

	function create_html(match, key, indicator, klass){

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
case '':
	break;
case 'r': // ref ( RFC 以外
	text = `[${key}]`;
	href = `~723X#${key}`;
//	if(!href) href = `~723X#ref-${key}`;
	break;
case 'R': // ref
	text = `[RFC${key}]`;
	href = `~723X#RFC${key}`;
	break;
case 'rfc': // RFC link
	{
		href = key.match(/^(\d+)-([\d\.]+)$/);
		if(!href) return match; // error
		key = href[1];
		text = `[RFC${key}] § ${href[2]} `;
		const href0 = (key.slice(0,2) === '72')
			? '~'
			: '~RFCx/rfc';
		href = `${href0}${key}#section-${href[2]}`;
	}
	break;
case 'sec': // 節（同一頁内）
	href = `#${section_map[key]}`;// || ('#section-${key);
	text = `§ ${key} `;
	break;
case 'st': // status code
	text = `<code class="status">${key}</code> <span class="phrase">(${st_phrase[key]||''})</span>`;
	break;
case 'st0':
	klass = 'st';
	break;
case 'errata': 
	text = `正誤表#${key} `;
	href = `https://www.rfc-editor.org/errata/eid${key}`;
	break;
case 'en': // english words
	return `<span lang="en">${key}</span>`;
	break;
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
	case '@':
		text = `<dfn id="${href.slice(1)}">${text}</dfn>`;
		break;
	}
}

return text;

	}
};

/** status phrase */
source_data.st_phrase = {
'1xx': 'Informational',
'2xx': 'Successful',
'3xx': 'Redirection',
'4xx': 'Client Error',
'5xx': 'Server Error',
'100': 'Continue',
'101': 'Switching Protocols',
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
'306': '(Unused)',
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
'413': 'Payload Too Large',
'414': 'URI Too Long',
'415': 'Unsupported Media Type',
'416': 'Range Not Satisfiable',
'417': 'Expectation Failed',
'422': 'Unprocessable Entity', // RFC4918
'426': 'Upgrade Required',
'451': 'Unavailable For Legal Reasons', // RFC7725
'500': 'Internal Server Error',
'501': 'Not Implemented',
'502': 'Bad Gateway',
'503': 'Service Unavailable',
'504': 'Gateway Timeout',
'505': 'HTTP Version Not Supported',
};

/** warning code / phrase
→ RFC7234 
*/

/** class/tag mapping */
COMMON_DATA.class_map = `
r:ref
t:type
p:production
P:token
st:status
st0:status
ph:phrase
wc:warn
h:header
m:method
dir:directive
qdir:directive
sdir:directive
com:comment
2119:rfc2119
`;

COMMON_DATA.tag_map = `
dfn:dfn
c:code
p:code
P:code
h:code
m:code
var:var
st0:code
wc:code
dir:code
qdir:code
sdir:code
ph:span
com:span
2119:em
`;

/** links */
COMMON_DATA.link_map = `

	request methods

m.GET:~7231#GET
m.HEAD:~7231#HEAD
m.POST:~7231#POST
m.PUT:~7231#PUT
m.DELETE:~7231#DELETE
m.CONNECT:~7231#CONNECT
m.OPTIONS:~7231#OPTIONS
m.TRACE:~7231#TRACE
m.PATCH:~HTTPpatch#patch

	header fields 

h.Accept:~7231#header.accept
h.Accept-Charset:~7231#header.accept-charset
h.Accept-Encoding:~7231#header.accept-encoding
h.Accept-Language:~7231#header.accept-language
h.Age:~7234#header.age
h.Allow:~7231#header.allow
h.Content-Encoding:~7231#header.content-encoding
h.Content-Language:~7231#header.content-language
h.Content-Location:~7231#header.content-location
h.Content-Type:~7231#header.content-type
h.Date:~7231#header.date
h.Expect:~7231#header.expect
h.From:~7231#header.from
h.Location:~7231#header.location
h.Max-Forwards:~7231#header.max-forwards
h.MIME-Version:~7231#header.mime-version
h.Referer:~7231#header.referer
h.Retry-After:~7231#header.retry-after
h.Server:~7231#header.server
h.User-Agent:~7231#header.user-agent
h.Vary:~7231#header.vary
h.Transfer-Encoding:~7230#header.transfer-encoding
h.Content-Length:~7230#header.content-length
h.TE:~7230#header.te
h.Trailer:~7230#header.trailer
h.Host:~7230#header.host
h.Via:~7230#header.via
h.Connection:~7230#header.connection
h.Upgrade:~7230#header.upgrade
h.Close:~7230#header.close
h.ETag:~7232#header.etag
h.Last-Modified:~7232#header.last-modified
h.If-Match:~7232#header.if-match
h.If-None-Match:~7232#header.if-none-match
h.If-Modified-Since:~7232#header.if-modified-since
h.If-Unmodified-Since:~7232#header.if-unmodified-since
h.If-Range:~7233#header.if-range
h.Range:~7233#header.range
h.Accept-Ranges:~7233#header.accept-ranges
h.Content-Range:~7233#header.content-range
h.Cache-Control:~7234#header.cache-control
h.Pragma:~7234#header.pragma
h.Authorization:~7235#header.authorization
h.Proxy-Authorization:~7235#header.proxy-authorization
h.WWW-Authenticate:~7235#header.www-authenticate
h.Proxy-Authenticate:~7235#header.proxy-authenticate
h.Warning:~7234#header.warning
h.Keep-Alive:~7230#header.keep-alive
h.Expires:~7234#header.expires

h.MIME-Version:~7231#mime-version
h.Keep-Alive:~7230#compatibility.with.http.1.0.persistent.connections
h.Set-Cookie:~HTTPcookie#sane-set-cookie
h.Cookie:~HTTPcookie#sane-cookie
h.Link:~HTTPweblink#field.link
	h.Link:~RFCx/rfc5988#section-5
h.Content-Transfer-Encoding:~RFCx/rfc2045#section-6
	h.URI
	h.Alternates:rfc2295#section-8.3

	status codes

st.1xx:~7231#status.1xx
st.2xx:~7231#status.2xx
st.3xx:~7231#status.3xx
st.4xx:~7231#status.4xx
st.5xx:~7231#status.5xx
st.100:~7231#status.100
st.101:~7231#status.101
st.200:~7231#status.200
st.201:~7231#status.201
st.202:~7231#status.202
st.203:~7231#status.203
st.204:~7231#status.204
st.205:~7231#status.205
st.206:~7233#status.206
st.214:~7234#status.214
st.300:~7231#status.300
st.301:~7231#status.301
st.302:~7231#status.302
st.303:~7231#status.303
st.304:~7232#status.304
st.305:~7231#status.305
st.306:~7231#status.306
st.307:~7231#status.307
st.400:~7231#status.400
st.401:~7235#status.401
st.402:~7231#status.402
st.403:~7231#status.403
st.404:~7231#status.404
st.405:~7231#status.405
st.406:~7231#status.406
st.407:~7235#status.407
st.408:~7231#status.408
st.409:~7231#status.409
st.410:~7231#status.410
st.411:~7231#status.411
st.412:~7232#status.412
st.413:~7231#status.413
st.414:~7231#status.414
st.415:~7231#status.415
st.416:~7233#status.416
st.417:~7231#status.417
st.426:~7231#status.426
st.500:~7231#status.500
st.501:~7231#status.501
st.502:~7231#status.502
st.503:~7231#status.503
st.504:~7231#status.504
st.505:~7231#status.505

	protocol elements

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


p.Accept:~7231#p.Accept
p.Accept-Charset:~7231#p.Accept-Charset
p.Accept-Encoding:~7231#p.Accept-Encoding
p.Accept-Language:~7231#p.Accept-Language
p.Accept-Ranges:~7233#p.Accept-Ranges
p.Age:~7234#p.Age
p.Allow:~7231#p.Allow
p.Authorization:~7235#p.Authorization
p.BWS:~7230#p.BWS
p.Cache-Control:~7234#p.Cache-Control
p.Connection:~7230#p.Connection
p.Content-Encoding:~7231#p.Content-Encoding
p.Content-Language:~7231#p.Content-Language
p.Content-Length:~7230#p.Content-Length
p.Content-Location:~7231#p.Content-Location
p.Content-Range:~7233#p.Content-Range
p.Content-Type:~7231#p.Content-Type
p.Date:~7231#p.Date
p.ETag:~7232#p.ETag
p.Expect:~7231#p.Expect
p.Expires:~7234#p.Expires
p.From:~7231#p.From
p.GMT:~7231#p.GMT

p.HTTP-date:~7231#p.HTTP-date
p.HTTP-message:~7230#p.HTTP-message
p.HTTP-name:~7230#p.HTTP-name
p.HTTP-version:~7230#p.HTTP-version
p.Host:~7230#p.Host
p.IMF-fixdate:~7231#p.IMF-fixdate
p.If-Match:~7232#p.If-Match
p.If-Modified-Since:~7232#p.If-Modified-Since
p.If-None-Match:~7232#p.If-None-Match
p.If-Range:~7233#p.If-Range
p.If-Unmodified-Since:~7232#p.If-Unmodified-Since
p.Last-Modified:~7232#p.Last-Modified
p.Location:~7231#p.Location
p.Max-Forwards:~7231#p.Max-Forwards
p.OWS:~7230#p.OWS
p.Pragma:~7234#p.Pragma
p.Proxy-Authenticate:~7235#p.Proxy-Authenticate
p.Proxy-Authorization:~7235#p.Proxy-Authorization
p.RWS:~7230#p.RWS
p.Range:~7233#p.Range
p.Referer:~7231#p.Referer
p.Retry-After:~7231#p.Retry-After
p.Server:~7231#p.Server
p.TE:~7230#p.TE
p.Trailer:~7230#p.Trailer
p.Transfer-Encoding:~7230#p.Transfer-Encoding
p.URI-reference:~7230#p.URI-reference
p.Upgrade:~7230#p.Upgrade
p.User-Agent:~7231#p.User-Agent
p.Vary:~7231#p.Vary
p.Via:~7230#p.Via
p.WWW-Authenticate:~7235#p.WWW-Authenticate
p.Warning:~7234#p.Warning
p.absolute-URI:~7230#p.absolute-URI
p.absolute-form:~7230#p.absolute-form
p.absolute-path:~7230#p.absolute-path
p.accept-ext:~7231#p.accept-ext
p.accept-params:~7231#p.accept-params
p.acceptable-ranges:~7233#p.acceptable-ranges
p.asctime-date:~7231#p.asctime-date
p.asterisk-form:~7230#p.asterisk-form
p.auth-param:~7235#p.auth-param
p.auth-scheme:~7235#p.auth-scheme
p.authority:~7230#p.authority
p.authority-form:~7230#p.authority-form
p.byte-content-range:~7233#p.byte-content-range
p.byte-range:~7233#p.byte-range
p.byte-range-resp:~7233#p.byte-range-resp
p.byte-range-set:~7233#p.byte-range-set
p.byte-range-spec:~7233#p.byte-range-spec
p.byte-ranges-specifier:~7233#p.byte-ranges-specifier
p.bytes-unit:~7233#p.bytes-unit
p.cache-directive:~7234#p.cache-directive
p.challenge:~7235#p.challenge
p.charset:~7231#p.charset
p.chunk:~7230#p.chunk
p.chunk-data:~7230#p.chunk-data
p.chunk-ext:~7230#p.chunk-ext
p.chunk-ext-name:~7230#p.chunk-ext-name
p.chunk-ext-val:~7230#p.chunk-ext-val
p.chunk-size:~7230#p.chunk-size
p.chunked-body:~7230#p.chunked-body
p.codings:~7231#p.codings
p.comment:~7230#p.comment
p.complete-length:~7233#p.complete-length
p.connection-option:~7230#p.connection-option
p.content-coding:~7231#p.content-coding
p.credentials:~7235#p.credentials
p.ctext:~7230#p.ctext
p.date1:~7231#p.date1
p.date2:~7231#p.date2
p.date3:~7231#p.date3
p.day:~7231#p.day
p.day-name:~7231#p.day-name
p.day-name-l:~7231#p.day-name-l
p.delay-seconds:~7231#p.delay-seconds
p.delta-seconds:~7234#p.delta-seconds
p.entity-tag:~7232#p.entity-tag
	p.entity-tag:~7233
p.etagc:~7232#p.etagc
p.extension-pragma:~7234#p.extension-pragma
p.field-content:~7230#p.field-content
p.field-name:~7230#p.field-name
p.field-value:~7230#p.field-value
p.field-vchar:~7230#p.field-vchar
p.first-byte-pos:~7233#p.first-byte-pos
p.fragment:~7230#p.fragment
p.header-field:~7230#p.header-field
p.hour:~7231#p.hour
p.http-URI:~7230#p.http-URI
p.https-URI:~7230#p.https-URI
p.language-range:~7231#p.language-range
p.language-tag:~7231#p.language-tag
p.last-byte-pos:~7233#p.last-byte-pos
p.last-chunk:~7230#p.last-chunk
p.mailbox:~7231#p.mailbox
p.media-range:~7231#p.media-range
p.media-type:~7231#p.media-type
p.message-body:~7230#p.message-body
p.method:~7230#p.method
	p.method:~7231
p.minute:~7231#p.minute
p.month:~7231#p.month
p.obs-date:~7231#p.obs-date
p.obs-fold:~7230#p.obs-fold
p.obs-text:~7230#p.obs-text
	p.obs-text:~7232
p.opaque-tag:~7232#p.opaque-tag
p.origin-form:~7230#p.origin-form
p.other-content-range:~7233#p.other-content-range
p.other-range-resp:~7233#p.other-range-resp
p.other-range-set:~7233#p.other-range-set
p.other-range-unit:~7233#p.other-range-unit
p.other-ranges-specifier:~7233#p.other-ranges-specifier
p.parameter:~7231#p.parameter
p.partial-URI:~7230#p.partial-URI
	p.partial-URI:~7231
p.path-abempty:~7230#p.path-abempty
p.path:~7230#p.path
p.port:~7230#p.port
	p.port:~7234
p.pragma-directive:~7234#p.pragma-directive
p.product:~7231#p.product
p.product-version:~7231#p.product-version
p.protocol:~7230#p.protocol
p.protocol-name:~7230#p.protocol-name
p.protocol-version:~7230#p.protocol-version
p.pseudonym:~7230#p.pseudonym
	p.pseudonym:~7234
p.qdtext:~7230#p.qdtext
p.query:~7230#p.query
p.quoted-pair:~7230#p.quoted-pair
p.quoted-string:~7230#p.quoted-string
	p.quoted-string:~7231
	p.quoted-string:~7234
	p.quoted-string:~7235
p.qvalue:~7231#p.qvalue
p.range-unit:~7233#p.range-unit
p.rank:~7230#p.rank
p.reason-phrase:~7230#p.reason-phrase
p.received-by:~7230#p.received-by
p.received-protocol:~7230#p.received-protocol
p.relative-part:~7230#p.relative-part
p.request-line:~7230#p.request-line
p.request-target:~7230#p.request-target
p.rfc850-date:~7231#p.rfc850-date
p.scheme:~7230#p.scheme
p.second:~7231#p.second
p.segment:~7230#p.segment
p.start-line:~7230#p.start-line
p.status-code:~7230#p.status-code
p.status-line:~7230#p.status-line
p.subtype:~7231#p.subtype
p.suffix-byte-range-spec:~7233#p.suffix-byte-range-spec
p.suffix-length:~7233#p.suffix-length
p.t-codings:~7230#p.t-codings
p.t-ranking:~7230#p.t-ranking
p.tchar:~7230#p.tchar
p.time-of-day:~7231#p.time-of-day
p.token:~7230#p.token
	p.token:~7231
	p.token:~7233
	p.token:~7234
	p.token:~7235
p.token68:~7235#p.token68
p.trailer-part:~7230#p.trailer-part
p.transfer-coding:~7230#p.transfer-coding
p.transfer-extension:~7230#p.transfer-extension
p.transfer-parameter:~7230#p.transfer-parameter
p.type:~7231#p.type
p.unsatisfied-range:~7233#p.unsatisfied-range
p.uri-host:~7230#p.uri-host
p.userinfo:~7230#p.userinfo
p.host:~7230#p.host
	p.uri-host:~7234
p.warn-agent:~7234#p.warn-agent
p.warn-code:~7234#p.warn-code
p.warn-date:~7234#p.warn-date
p.warn-text:~7234#p.warn-text
p.warning-value:~7234#p.warning-value
p.weak:~7232#p.weak
p.weight:~7231#p.weight
p.year:~7231#p.year
	p.reserved:~7231



	others
c.chunked:~7230#chunked.encoding
c.compress:~7230#compress.coding
c.deflate:~7230#deflate.coding
c.gzip:~7230#gzip.coding
c.message/http:~7230#internet.media.type.message.http
c.application/http:~7230#internet.media.type.application.http

	■XXXX
~IETFによる考査:~5226#section-4.1
著作者連絡先:~723X#authors-addresses
二重引用符:~HTTPcommon#P.DQUOTE
	■7230
~UA:~7230#user-agent
~URI:~7230#uri
~stateless:~7230#stateless
~chunked:~7230#chunked.encoding
~chunked転送~符号法:~7230#chunked.encoding
~chunk拡張:~7230#chunked.extension
~client:~7230#client
~gateway:~7230#gateway
~header:~7230#header.fields
~header値:~7230#header-value
~header名:~7230#header-name
~header節:~7230#header-section
~major:~7230#major-version
~major~version:~7230#major-version
~minor:~7230#minor-version
~minor~version:~7230#minor-version
~message:~7230#http.message
~message本体:~7230#message.body
~message本体~長さ:~7230#message.body.length
本体~長さ:~7230#body-length
~pipeline:~7230#pipelining
~pipeline化:~7230#pipelining
~proxy:~7230#proxy
~server:~7230#server
	~status行l:~7230#status.line
状態s行l:~7230#status.line
~target~URI:~7230#target-URI
~target資源:~7230#target-resource
~tunnel:~7230#tunnel
~version:~7230#http.version
~protocol~version:~7230#http.version
~version番号:~7230#version-number
上流:~7230#upstream
下流:~7230#downstream
不完全:~7230#incomplete
完全:~7230#incomplete
媒介者:~7230#intermediary
内方:~7230#inbound
受信者:~7230#recipient
外方:~7230#outbound
実効~要請~URI:~7230#effective.request.uri
形式変換-:~7230#message.transformations
形式変換:~7230#message.transformations
応答:~7230#response
応答~分割:~7230#response.splitting
持続的な接続:~7230#persistent.connections
接続~option:~7230#connection-option
最終~転送~符号法:~7230#final-transfer-coding
生成:~7230#generate
生成-:~7230#generate
生成する:~7230#generate
生成され:~7230#generate
生成し:~7230#generate
生成元~server:~7230#origin-server
空白:~7230#whitespace
端点:~7230#endpoint
端点間:~7230#end-to-end
端点間~header:~7230#end-to-end-header
結合-:~7230#combine-headers
	要請:~7230#request
要請:~7231#request
~HTTP要請:~7231#request
要請~target:~7230#request-target
要請~密入:~7230#request.smuggling
転送~符号法:~7230#transfer.codings
転送~符号法~名:~7230#p.transfer-coding
送信者:~7230#sender
連鎖:~7230#chain
隣点間:~7230#hop-by-hop
隣点間~header:~7230#hop-by-hop-header
~payload本体:~7230#payload-body
~payload:~7230#payload-body
形式変換ng~proxy:~7230#transforming-proxy
相対~参照:~7230#p.relative-part
	~3986#section-4.2
素片:~7230#p.fragment
素片~識別子:~7230#p.fragment
絶対~形:~7230#absolute-form
~close_接続~option:~7230#close-connection-option
~HTTP11:~7230#version-1.1
~list演算子:~7230#abnf.extension
圧縮~符号法:~7230#compression.codings

	■7231
事由~句:~7231#reason-phrase
既定で~cache可能である:~7231#cacheable-by-default
資源:~7231#resources
表現:~7231#representation
選定された表現:~7231#selected-representation
選定される表現:~7231#selected-representation
~metadata:~7231#representation.metadata
表現~metadata:~7231#representation.metadata
~MIME型:~7231#media.type
~MIME型~parameter:~7231#p.parameter
~charset:~7231#charset
内容~符号法:~7231#content.codings
内容~符号法~名:~7231#p.content-coding
言語~tag:~7231#language.tags
	資源の識別:~7231#identification
表現~data:~7231#representation.data
表現~header:~7231#representation.metadata
~payload~header:~7231#payload-headers
内容~折衝:~7231#content.negotiation
~proactive折衝:~7231#proactive.negotiation
~reactive折衝:~7231#reactive.negotiation
要請~method:~7231#methods
~method:~7231#methods
要請の意味論:~7231#methods
冪等~method:~7231#idempotent.methods
冪等:~7231#idempotent.methods
安全~method:~7231#safe.methods
安全:~7231#safe.methods
安全な:~7231#safe.methods
要請~header:~7231#request.header.fields
~server-wide:~7231#server-wide
~proactive折衝~header:~7231#request.conneg
	条件付き要請~header:~7231#section-5.2
	＊条件付き要請~header:~7232#section-3
~100cont 期待:~7231#100-continue
品質~値:~7231#quality.values
品質値:~7231#quality.values
	~status-code:~7231#status.codes
状態s~code:~7231#status.codes
応答~状態s~code:~7231#status.codes
応答~header:~7231#response.header.fields
制御~data:~7231#response.control.data
~messageの出生日時:~7231#origination-date
	日時~形式:~7231#section-7.1.1.1
日時:~7231#origination.date
時計:~7231#clock
首な資源:~7231#primary-resource
製品~識別子:~7231#product-identifier
検証子~header:~7231#response.validator
~cache可能:~7231#cacheable.methods
応答class:~7231#responce-class
制御~header:~7231#request.controls
指紋収集:~7231#fingerprinting
	＊条件付き~header:~7231#request.conditionals
選定用~header:~7231#selecting-header

	■7232
条件付き~header:~7232#preconditions
条件付き要請~header:~7232#preconditions
事前条件~header:~7232#preconditions
条件付き:~7232#conditional-request
条件付き要請:~7232#conditional-request
検証子:~7232#validators
強い検証子:~7232#strong-validator
弱い検証子:~7232#weak-validator
強い比較:~7232#strong-comparison
弱い比較:~7232#weak-comparison
評価-:~7232#evaluation
改変~日時:~7232#header.last-modified
条件付きに:~7232#make-conditional
事前条件:~7231#preconditions
	事前条件:~7232#preconditions

	■7233

範囲~単位:~7233#range.units
範囲~要請:~7233#range.requests
部分的~要請:~7233#range.requests
部分的~応答:~7233#status.206
部分的:~7233#status.206
c.multipart/byteranges:~7233#internet.media.type.multipart.byteranges

	■7234

鮮度~情報:~7234#calculating.freshness.lifetime
~cache:~7234#cache
~cache検証:~7234#validation.model
~cache検証~要請:~7234#validation.sent
共用~cache:~7234#shared-cache
私用~cache:~7234#private-cache
~cache制御~指令:~7234#cache-directive
警告~text:~7234#warning-text

	■7235

資格証:~7235#credentials
`;


/** Words */


COMMON_DATA.words_table1 += `
ERRATA:https://www.rfc-editor.org/errata_search.php
723X:RFC723X-ja.html
7230:RFC7230-ja.html
7231:RFC7231-ja.html
7232:RFC7232-ja.html
7233:RFC7233-ja.html
7234:RFC7234-ja.html
7235:RFC7235-ja.html
723Xabnf:RFC723X-ABNF-ja.html
HTTPpatch:http-patch-ja.html
	7238:https://www.rfc-editor.org/rfc/rfc7238
2045:https://www.rfc-editor.org/rfc/rfc2045
2068:https://www.rfc-editor.org/rfc/rfc2068
2616:https://www.rfc-editor.org/rfc/rfc2616
2817:https://www.rfc-editor.org/rfc/rfc2817
2818:https://www.rfc-editor.org/rfc/rfc2818
	3986:rfc-others/RFC3986-ja.html
3986:https://www.rfc-editor.org/rfc/rfc3986
4648:https://www.rfc-editor.org/rfc/rfc4648
5226:https://www.rfc-editor.org/rfc/rfc5226
5322:https://www.rfc-editor.org/rfc/rfc5322

ナラナイ:<em class="rfc2119">ならない</em>
ベキ:<em class="rfc2119">べき</em>
ヨイ:<em class="rfc2119">よい</em>
OUGHT:べき.である

HTTP09: HTTP/0.9 
HTTP10: HTTP/1.0 
HTTP11: HTTP/1.1 
100cont:<code>100-continue</code>
close_:"<code>close</code>" 
IETF-org: “IETF (iesg@ietf.org) — Internet Engineering Task Force” 
`;


COMMON_DATA.words_table += `
●●words_table

伝え:informし:~
伝える:informする:~
切替:switching::切り替え
切替わる:switchする::切り替わる
切替え:switchし::切り替え
切替えら:switchさ::切り替えら
切替える:switchする::切り替える
割振ら:allocateさ:割り振ら
割振る:allocateする::割り振る
含ま:includeし:~
含ませ:includeさせ:~
含まれ:includeされ:~
含む:includeする:~
含めて:includeして:~
内包-:include:~

呼出し:invoking:呼び出し
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

充足さ:satisfyさ:満たさ
充足し:satisfyし:満たし
充足しな:satisfyしな:満たさな
充足しよ:satisfyしよ:満たそ
充足する:satisfyする:満たす
充足でき:satisfyでき:満たせ

結付法:associating:結び付け
見出させ:findさせ:~

運ばせ:carryさせ::~
運ばれ:carryされ::~
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

	HTTP09:
	HTTP10:
	HTTP11:
	HTTP1x:
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
reset::::リセット
schedule::::スケジュール
subset::::サブセット
textによる／~textからなる
major::::主:メジャー
minor::::副:マイナー

	●指示語
一時的:temporary:~
余分な:extra:~
側:side:~
尾部:trailing:~
頭部:leading:~
巨大:large:~
広範:wide:~
広範囲:extensive:~
最終:final:~
末尾:end:~
版:edition:~
近過去:recent::~
近過去の:recentな::~
重複:duplicate:~
節:section:~

	●仕様

programmatic::::プログラム的
based:-based:に基づく:::ベースの
proprietary::::プロプライエタリ
十分:enough:~
記述:description:説明
導かれ:leadされ:~
導き:leadし:~
メモ:memo::~
扱い:treatment:~
望まず:wishせず:~
回避法:avoidance:~
agent::::エージェント
app:application:::アプリケーション
	~app~levelの:application-level
	応用-:apply:::
	適用すること:application
一般用:general-purpose:~
事実:fact:~
見越す:anticipateする:~
見越して:anticipateして:~
見越され:anticipateされ:~
上品:graceful::~
不利:disadvantage:~
不可欠:crucial:~
依存:dependent:~
保守的:conservative:~
	適合:conformant:~
適時:timely:~
選好順:descending preference の order:選好度の高い順
有利:advantageous:~
有意度:significance:~
有意性:significance:~
利点:advantage:~
用立てる:make useする:~
利用e:usage:利用
再利用性:reusability:~
誤用-:misuse:~
濫用:abuse:~
上限:limit:~
副次的:secondary:~
創出-:mint:~
実効:effective::~
参照文献:references:~
同意-:agree:~
回答:answer:~
失われ:lostし:~
対処-:work around:~
対処法:workaround:~
堅牢:robust:~
堅牢性:robustness:~
図:figure:~
増強-:enhance:~

古い:older:~
可用性:availability:~
不可能:impossible:~
同義語:synonym:~
大概は:presumably:~
	〜ないことを奨励:discourage
実用性:practicality:~
遂行:performing:~
導入:introduction:~
履行-:fulfill:~
必要十分:adequate:~
必要性:needs:~
恒久的:permanent:~
早期の:early:~
暫定的:interim:~
	本質的でない:nonessential
柔軟:flexible:~
柔軟性:flexibility:~
根本的:fundamental:~
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
位置付け:status:~
相互運用-:interoperate:~
	相互運用-可能:interoperable
相当:substantial:~
禁制-:prohibit::~
競合-:conflict:~
競合:conflict:~
精緻化:refinement:~
結論:conclusion:~
統一的:uniform:~
網羅的:exhaustive:~
総集的:collective:~
緩めら:relaxさ:~
緩める:relaxする:~
義務化-:mandate:~
翻訳-:translate::~
翻訳:translation::~
衝突-:collide:~
衝突:collision:~
補助:help:~
複雑化-:complicate:~
設置-:place:~
設置しな:placeしな:課さな
設置する:placeする:課す
不許可に:disallow:~
診断:diagnostic:~
承認-:acknowledge:~
未認識:unrecognized:認識できない
誤解:mistake:~
責務:responsibility:~
誤解釈:misinterpret:~
性向:nature:~
関心:interest:~
限度:extent:~
公共:public:~
表記法:notation:~
解決策:solution:~
英語:English:~
偶発的:accidental:~
偽:false:~
理論:theory:~
透過性:transparency::~
透過的:transparent::~
類別:category:~
維持-:retain:~
維持させ:sustainし:~

背後:behind:~
協調的:collaborative:~
相違化-:differentiate:区別
運用-:operate:~
運用:operation:~
運用者:operator:~
稀:rare:~

	●保安
sensitive:
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
欠陥:flaw:~
汚染-:poison::~
汚染:poisoning::~
特権拡大:privilege escalation:~
盗聴:theft:~
脆弱:vulnerable::~
署名:signature:~
露呈-:reveal:露わに
中間者:man-in-the-middle::~
相関-:correlate:~
相関:correlation:~
	追跡:trace::~::トレース

	●HTTP／構文／data／stream

hypertext::::ハイパーテキスト
messaging::::メッセージ処理
zero:::ゼロ
ゼロ:zero::~
pathname::::パス名
スキーム:scheme::~
	~frame法:framing
packet::::パケット
payload::::ペイロード
percent::::パーセント
subtag::::下位タグ
trailer::::トレイラ
chunk::::チャンク
chunked:::chunk 化:チャンク化
hex::16 進
hexadecimal::16 進数
asterisk::::アスタリスク
backslash::::バックスラッシュ
decimal::10 進
escaping::::エスケープ処理
	引用符~付き:quoted
二重引用符:double quote::~
区切られ:delimitされ::~
区切り:delimitation::~
区切る:delimitする::~
区切子:delimiter::~
実数:real number:~
桁:digit::~
番号:number:~
圧縮-:compress::~
圧縮:compression::~
下位成分:subcomponent::~
折返-:fold::~
折返さな:foldしな::~
折返し:folding::~
記号:symbol:~
符号法:coding::~::コーディング
暗号化-:encrypt::~
暗号化:encryption::~
暗号用の:cryptographic::~
形式変換ng:transforming::形式変換
形式変換-:transform::~
形式変換:transformation::~
	符号化-済み:encoded

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
portal::::ポータル
provider::::プロバイダ
server-wide::server 全般::サーバ全般
spider::::スパイダー
robot::::ロボット
robotic::::ロボット的
transaction::::トランザクション
tunnel::::トンネル
close:
closure:
open:
経路制御-:route::~:ルート
経路制御:routing::~:ルーティング
direct::::ダイレクト
	ディレクティブ
指令-:direct::~
	directional:
双方向:bidirectional::~
上流:upstream::~
下流:downstream::~
中継-:relay::~
媒介:intermediate::~
介在-:intervene:~
伝送処理:transmitting::~
回送-:forward::~
回送:forwarding::~
	回送-法:forwarding
伝送路:wire::~
分散-:balance:~
分散型の:distributed::~
参加-:engage:~
参加者:participant:~
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
応答class:class:::クラス

所在-:locate::~
経路:path:~

	●未分類
個人-:personal:~
不定:indefinite:~
中断:interruption:~

交換:exchange:~
付随-:accompany:~
遊休:idle:~
	遊休~中:idle
併合-:merge:~
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
区分-:partition:~
事前条件:precondition::~
取込まれ:importされ:取り込まれ
同一性:identity:~
同封-:enclose::~
同時:simultaneous:~
品質:quality::~
品質値:qvalue::~
回復-:recover::~
固定的な:fixed:~
固定長:fixed-length:~
下位型:subtype::~
増分:increment:~
増分的:incremental:~
増加-:increase:~
増大-:increase:~
回復:recovery::~
失効:expiration:~
失効-:expire:~
弱い:weakな::~
弱さ:weakness::~
強い:strongな::~
強さ:strength::~
検証y-:verify::検証°
検証y:verification::検証°
検証子:validator::~
有効:valid::~
有効性:validity:~
無効化:invalidate::~
妥当でない:invalidな::~
提示-:present:~
容量:capacity:~
対応-:correspond:~
対応ng:corresponding:対応する
対応関係:mapping:~:::マッピング
尚早:premature:~
	局所的な
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
日付時刻:date and time::~
日時:date::~
時計:clock::~::クロック
昇順:ascending order:~
降順:decreaseing order:~
更新喪失:lost update::~
格納域:store::~
再構築-:reconstruct:~
再構築:reconstruction:~
段階:stage:~
活動:activity::~
消去-:erase:~
消費量:consumption:~
状態変更:state-changing::~::ステート変更
stateless::::ステートレス
	無状態の:statelessな:::ステートレスな
	状態を持たない
生の:raw:~
疑似:pseudo:~
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

短縮-:shorten:~
確立:establishing:~
種類:kind:~
稼働-:run:~
組織:organization:~
節約-:save:~
部分範囲:subrange:~
続行-:proceed:~

記憶-:remember:~
再試行-:retry::~
再試行:retrying::~
	識別-法:identifying
	識別されない:unidentified
	識別-可能:identifyable
警告:warning::~
警告-:warn::~

負荷:load:~
過負荷:overload:~
超過-:exceed:~
近似:approximation:~
演算子:operator:~
過去:past:~
過度の:excessiveな:~
遭遇-:encounter:~
選定用:selecting::~
被選定:selected::~
選択的:selective::~
選択-:choose:~
選択:choice:~
選択肢:choice:~
部位:portion:~
重み:weight::~
量:amount:~

開く:openする::~
鮮度:freshness::~

	別の:another
	一定の:certain
	今後の:later
	以前の:previous

●●

`;


/*
	●指示語
最後に:finally
最終的:eventual
先立つ:prior
〜に先立って／先に／事前に／~~直前:prior to〜
次:next
残りの部分:remainder
前後:around
全面的に:entire に
一部分
一部／部分
大部分の:most
多種多様な:variety
何であれ:whichever
数種の:several
部分:part
よく:often
多い:frequently
時には:occasionally
各所／他所
沿いにある:along the chain
逆:reverse
近い:near
総:total
小さな:small

	●動詞
高める:increase させる
予め:in advance
括って:surround:
考慮-:regard
置-
置く／場所:place
考え:thinking／suggested
高める:increase させる
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
記す／表す:denote する
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
締めくくるconclude
say
seem
cause
note

	●
何故なら:because
意識-:be aware
~logをとる:~logging
	高い:high
思しきもの:supposedly:
よって:hence
その時々:on occasion
~~目的:sake:目的
おそれ:fear
し得ない:incapable
保つ
年:year
秒数:seconds
優先される:precedence を take する
能力を備えている:be capable of
（〜に備わる能力）
量:amount
類い
見込みが高い:likely
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
sameness
through
事前動作
受動的
出来事
及ぼす
宛先
期間:period／period of time
表~table
誤り:wrong
長く／長い~long
電網
一式:set
〜に利するため:on behalf of

*/




/*
h.Accept:~7231#section-5.3.2
h.Accept-Charset:~7231#section-5.3.3
h.Accept-Encoding:~7231#section-5.3.4
h.Accept-Language:~7231#section-5.3.5
h.Age:~7234#section-5.1
h.Allow:~7231#section-7.4.1
h.Content-Encoding:~7231#section-3.1.2.2
h.Content-Language:~7231#section-3.1.3.2
h.Content-Location:~7231#section-3.1.4.2
h.Content-Type:~7231#section-3.1.1.5
h.Date:~7231#section-7.1.1.2
h.Expect:~7231#section-5.1.1
h.From:~7231#section-5.5.1
h.Location:~7231#section-7.1.2
h.Max-Forwards:~7231#section-5.1.2
h.MIME-Version:~7231#appendix-A.1
h.Referer:~7231#section-5.5.2
h.Retry-After:~7231#section-7.1.3
h.Server:~7231#section-7.4.2
h.User-Agent:~7231#section-5.5.3
h.Vary:~7231#section-7.1.4
h.Transfer-Encoding:~7230#section-3.3.1
h.Content-Length:~7230#section-3.3.2
h.TE:~7230#section-4.3
h.Trailer:~7230#section-4.4
h.Host:~7230#section-5.4
h.Via:~7230#section-5.7.1
h.Connection:~7230#section-6.1
h.Upgrade:~7230#section-6.7
h.Close:~7230#section-8.1
h.ETag:~7232#section-2.3
h.Last-Modified:~7232#section-2.2
h.If-Match:~7232#section-3.1
h.If-None-Match:~7232#section-3.2
h.If-Modified-Since:~7232#section-3.3
h.If-Unmodified-Since:~7232#section-3.4
h.If-Range:~7233#section-3.2
h.Range:~7233#section-3.1
h.Accept-Ranges:~7233#section-2.3
h.Content-Range:~7233#section-4.2
h.Cache-Control:~7234#section-5.2
h.Pragma:~7234#section-5.4
h.Authorization:~7235#section-4.2
h.Proxy-Authorization:~7235#section-4.4
h.WWW-Authenticate:~7235#section-4.1
h.Proxy-Authenticate:~7235#section-4.3
h.Warning:~7234#section-5.5
h.Keep-Alive:~7230#appendix-A.1.2
h.Expires:~7234#section-5.3

	status code
st.1xx:~7231#section-6.2
st.2xx:~7231#section-6.3
st.3xx:~7231#section-6.4
st.4xx:~7231#section-6.5
st.5xx:~7231#section-6.6
st.100:~7231#section-6.2.1
st.101:~7231#section-6.2.2
st.200:~7231#section-6.3.1
st.201:~7231#section-6.3.2
st.202:~7231#section-6.3.3
st.203:~7231#section-6.3.4
st.204:~7231#section-6.3.5
st.205:~7231#section-6.3.6
st.206:~7233#section-4.1
st.214:~7234#section-5.5
st.300:~7231#section-6.4.1
st.301:~7231#section-6.4.2
st.302:~7231#section-6.4.3
st.303:~7231#section-6.4.4
st.304:~7232#section-4.1
st.305:~7231#section-6.4.5
st.306:~7231#section-6.4.6
st.307:~7231#section-6.4.7
st.308:~7538#section-3
st.400:~7231#section-6.5.1
st.401:~7235#section-3.1
st.402:~7231#section-6.5.2
st.403:~7231#section-6.5.3
st.404:~7231#section-6.5.4
st.405:~7231#section-6.5.5
st.406:~7231#section-6.5.6
st.407:~7235#section-3.2
st.408:~7231#section-6.5.7
st.409:~7231#section-6.5.8
st.410:~7231#section-6.5.9
st.411:~7231#section-6.5.10
st.412:~7232#section-4.2
st.413:~7231#section-6.5.11
st.414:~7231#section-6.5.12
st.415:~7231#section-6.5.13
st.416:~7233#section-4.4
st.417:~7231#section-6.5.14
st.426:~7231#section-6.5.15
st.500:~7231#section-6.6.1
st.501:~7231#section-6.6.2
st.502:~7231#section-6.6.3
st.503:~7231#section-6.6.4
st.504:~7231#section-6.6.5
st.505:~7231#section-6.6.6

m.CONNECT:~7231#section-4.3.6
m.DELETE:~7231#section-4.3.5
m.GET:~7231#section-4.3.1
m.HEAD:~7231#section-4.3.2
m.OPTIONS:~7231#section-4.3.7
m.POST:~7231#section-4.3.3
m.PUT:~7231#section-4.3.4
m.TRACE:~7231#section-4.3.8

wc.110:~7234#section-5.5.1
wc.111:~7234#section-5.5.2
wc.112:~7234#section-5.5.3
wc.113:~7234#section-5.5.4
wc.199:~7234#section-5.5.5
wc.214:~7234#section-5.5.6
wc.299:~7234#section-5.5.7

qdir.max-age:~7234#section-5.2.1.1
sdir.max-age:~7234#section-5.2.2.8
qdir.max-stale:~7234#section-5.2.1.2
qdir.min-fresh:~7234#section-5.2.1.3
sdir.must-revalidate:~7234#section-5.2.2.1
qdir.no-cache:~7234#section-5.2.1.4
sdir.no-cache:~7234#section-5.2.2.2
qdir.no-store:~7234#section-5.2.1.5
sdir.no-store:~7234#section-5.2.2.3
qdir.no-transform:~7234#section-5.2.1.6
sdir.no-transform:~7234#section-5.2.2.4
qdir.only-if-cached:~7234#section-5.2.1.7
sdir.private:~7234#section-5.2.2.6
sdir.proxy-revalidate:~7234#section-5.2.2.7
sdir.public:~7234#section-5.2.2.5
sdir.s-maxage:~7234#section-5.2.2.9


／c.chunked:~7230#section-4.1
／c.compress:~7230#section-4.2.1
／c.deflate:~7230#section-4.2.2
／c.gzip:~7230#section-4.2.3
／c.application/https:~7230#section-8.3.2
／c.message/https:~7230#section-8.3.1
／c.multipart/byteranges:~7233#multipart/byteranges
	■XXXX
IETF Review:~5226#section-4.1
著作者連絡先:~723X#authors-addresses
二重引用符:~HTTPcommon#P.DQUOTE
	■7230
〜~UA:~7230#user-agent
~URI:~7230#URI
〜~stateless:~7230#stateless
／~chunked:~7230#chunked-transfer-coding
／~chunked転送~符号法:~7230#chunked-transfer-coding
／~chunk拡張:~7230#chunk-extension
〜~client:~7230#client
〜~gateway:~7230#gateway
／~header:~7230#section-3.2
〜~header値:~7230#header-value
〜~header名:~7230#header-name
〜~header節:~7230#header-section
〜~major:~7230#major-version
〜~major~version:~7230#major-version
〜~minor:~7230#minor-version
〜~minor~version:~7230#minor-version
／~message:~7230#section-3
／~message本体:~7230#message-body
／~message本体~長さ:~7230#body-length
／~pipeline:~7230#pipeline
／~pipeline化:~7230#pipeline
〜~proxy:~7230#proxy
〜~server:~7230#server
／	~status行l:~7230#status-line
〜~target~URI:~7230#target-URI
〜~target資源:~7230#target-resource
〜~trailer:~7230#trailer
〜~tunnel:~7230#tunnel
／~version:~7230#version
／~protocol~version:~7230#version
〜~version番号:~7230#version-number
〜上流:~7230#upstream
〜下流:~7230#downstream
不完全:~7230#incomplete
完全:~7230#incomplete
〜媒介者:~7230#intermediary
〜内方:~7230#inbound
〜受信者:~7230#recipient
〜外方:~7230#outbound
／実効~要請~URI:~7230#effective-request-URI
／形式変換-:~7230#transform
／形式変換:~7230#transform
〜応答:~7230#response
／応答~分割:~7230#response-splitting
／持続的な接続:~7230#persistent-connection
〜接続~option:~7230#connection-option
〜最終~転送~符号法:~7230#final-transfer-coding
〜本体~長さ:~7230#body-length
〜生成:~7230#generate
〜生成-:~7230#generate
〜生成する:~7230#generate
〜生成され:~7230#generate
〜生成し:~7230#generate
〜生成元~server:~7230#origin-server
／空白:~7230#linear-whitespace
	線形空白:~7230#section-3.2.3
〜端点:~7230#endpoint
〜端点間:~7230#end-to-end
〜端点間~header:~7230#end-to-end-header
〜結合-:~7230#combine-headers
	要請:~7230#request
〜要請:~7231#request
〜~HTTP要請:~7231#request
／要請~target:~7230#request-target
／要請~密入:~7230#request-smuggling
／転送~符号法:~7230#transfer-coding
〜転送~符号法~名:~7230#p.transfer-coding
〜送信者:~7230#sender
〜連鎖:~7230#chain
〜隣点間:~7230#hop-by-hop
〜隣点間~header:~7230#hop-by-hop-header
〜~payload本体:~7230#payload-body
〜~payload:~7230#payload-body
〜形式変換proxy:~7230#transforming-proxy
〜相対~参照:~7230#p.relative-part
	~3986#section-4.2
〜素片:~7230#p.fragment
〜素片~識別子:~7230#p.fragment
／絶対~形:~7230#section-5.3.2
〜~close_接続~option:~7230#close-connection-option
〜~HTTP11:~7230#version-1.1
／~list演算子:~7230#section-7
／圧縮~符号法:~7230#compression-codings
〜事由~句:~7231#reason-phrase
〜既定で~cache可能である:~7231#cacheable-by-default

	■7231
／資源:~7231#resource
〜表現:~7231#representation
〜選定された表現:~7231#selected-representation
／~metadata:~7231#section-3.1
／表現~metadata:~7231#section-3.1
／~MIME型:~7231#media-type
／~charset:~7231#section-3.1.1.2
／内容~符号法:~7231#content-coding
〜内容~符号法~名:~7231#p.content-coding
言語~tag:~7231#language-tag
〜~MIME型~parameter:~7231#p.parameter
	資源の識別処理:~7231#section-3.1.4
／表現~data:~7231#representation-data
／表現~header:~7231#representation-header
〜~payload~header:#payload-headers
〜内容~折衝:~7231#content-negotiation
／~proactive折衝:~7231#proactive-negotiation
／~reactive折衝:~7231#reactive-negotiation
／要請~method:~7231#section-4
／冪等~method:~7231#idempotent-mehtod
／冪等:~7231#idempotent-mehtod
／安全~method:~7231#safe-mehtod
／安全:~7231#safe-mehtod
／安全な:~7231#safe-mehtod
／要請~header:~7231#request-header
〜~server-wide:~7231#server-wide
／~proactive折衝~header:~7231#section-5.3
	条件付き要請~header:~7231#section-5.2
	＊条件付き要請~header:~7232#section-3
〜~100cont 期待:~7231#100-continue
／品質~値:~7231#qvalue
／品質値:~7231#qvalue
／	~status-code:~7231#status-code
／状態s~code:~7231#status-code
／応答~状態s~code:~7231#status-code
／応答~header:~7231#responce-header
／制御~data:~7231#control-data
〜~messageの出生日時:~7231#origination-date
	日時~形式:~7231#section-7.1.1.1
／日時:~7231#section-7.1.1
〜時計:~7231#clock
〜首な資源:~7231#primary-resource
〜製品~識別子:~7231#product-identifier
／検証子~header:~7231#validator-header
／~cache可能:~7231#cacheable
〜応答class:~7231#responce-class
／~method:~7231#section-4
／要請の意味論:~7231#section-4
／制御~header:~7231#section-5.1
／指紋収集:~7231#section-9.7
	＊条件付き~header:~7231#section-5.2
〜選定用~header:~7231#selecting-header

	■7232
／条件付き~header:~7232#conditional-request-header
／条件付き要請~header:~7232#conditional-request-header
／事前条件~header:~7232#conditional-request-header
〜条件付き:~7232#conditional-request
〜条件付き要請:~7232#conditional-request
／検証子:~7232#validator
〜強い検証子:~7232#strong-validator
〜弱い検証子:~7232#weak-validator
〜強い比較:~7232#strong-comparison
〜弱い比較:~7232#weak-comparison
〜評価-:~7232#section-5
／改変~日時:~7232#section-2.2
〜条件付きに:~7232#make-conditional
／事前条件:~7231#preconditions
	事前条件:~7232#preconditions

	■7233

／範囲単位:~7233#p.range-unit
／範囲~要請:~7233#section-3
／部分的~要請:~7233#section-3
／部分的~応答:~7233#partial-responce
〜部分的:~7233#partial-responce

	■7234

／鮮度~情報:~7234#section-4.2.1
〜~cache:~7234#cache
／~cache検証:~7234#section-4.3
／~cache検証~要請:~7234#section-4.3.1
〜共用~cache:~7234#shared-cache
〜私用~cache:~7234#private-cache
〜~cache制御~指令:~7234#cache-directive
〜警告~text:~7234#warning-text

	■7235

〜資格証:~7235#credentials
*/
