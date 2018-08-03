Util.ready = function(){
	source_data.init(PAGE_DATA.options.rfc_num);
	Util.switchWordsInit(source_data);
};

const source_data = {
	toc_main: 'MAIN0',
};

source_data.init = function(spec_num){
	PAGE_DATA.words_table1
	= this.words_table1 + PAGE_DATA.words_table1;
	delete this.words_table1;

	PAGE_DATA.words_table
	= this.words_table + PAGE_DATA.words_table;
	delete this.words_table;

	this.href_data_map = Util.get_mapping(
		( this.href_data + PAGE_DATA.link_map)
		.replace( new RegExp('~' + spec_num, 'g'), '' )
	);
	delete PAGE_DATA.link_map;

	this.section_map = Util.get_mapping(PAGE_DATA.section_map || '');

	/* 展開状態で保存されたページがこの script を読み込まないようにする */
	repeat('script[src="RFC723X.js"]', function(e){
		e.parentNode.removeChild(e);
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

source_data.class_map = {
	r: 'ref',
	t: 'type',
	p: 'production', // protocol element
	P: 'token',
	st: 'status',
	st0: 'status',
	ph: 'phrase',
	wc: 'warn',
	h: 'header',
	m: 'method',
	dir: 'directive',
	qdir: 'directive',
	sdir: 'directive',
	com: 'comment',
};

source_data.tag_map = {
	dfn: 'dfn',
	c: 'code',
//		l: 'code',
	p: 'code',
	P: 'code',
	h: 'code',
	m: 'code',
	var: 'var',
	st0: 'code',
	wc: 'code',
	dir: 'code',
	qdir: 'code',
	sdir: 'code',
	ph: 'span',
	com: 'span',
};

source_data.generate = function(){
	const st_phrase = this.st_phrase;
	const st_hrefs = this.st_hrefs;
	const header_hrefs = this.header_hrefs;
	const section_map = this.section_map;

	const href_data_map = this.href_data_map || {};

	const class_map = this.class_map;
	const tag_map = this.tag_map;

	return this.html.replace(
		/`(.+?)([$@\^])(\w*)/g,
		create_html
	);

//		return;

	function create_html(match, key, indicator, klass){

let text = key;
let href = href_data_map[klass ? (klass + '.' + key) : key] || '';
let classname = class_map[klass];
let tag = tag_map[klass];

switch(klass){
case '':
	break;
case 'r': // ref
	text = '[' + key + ']';
	if(!href) href = '~723X#ref-' + key;
	break;
case 'R': // ref
	text = '[RFC' + key + ']';
	href = '~723X#ref-RFC' + key;
	break;
case 'RFC': // ref
	text = 'RFC ' + key;
	href = '~IETF/rfc' + key;
	break;
case 'rfc': // ref
	href = key.match(/^(\d+)-([\d\.]+)$/);
	if(!href) {href='#'; console.log(key);break;}
	key = href[1];
	text = `RFC ${key}, ${href[2]} ~~節`;
	href = ((key.slice(0,2) === '72') ? '~' : '~IETF/rfc') + key +
		'#section-' + href[2];
	break;
case 'sec': // 節（同一頁内）
	href = '#' + section_map[key];// || ('#section-' + key);
	text = key + ' ~~節';
	break;
case 'P':
//	href = 'RFC723X-ABNF-ja.html#p.' + key;
	href += '#P.' + key;
	break;
case 'p':
	href += '#p.' + key;
	break;
case 'st': // status code
	text = `<code class="status">${key}</code> <span class="phrase">(${st_phrase[key]})</span>`;
case 'st0':
	href = (st_hrefs[key] || '~7231') + '#status.' + key;
	break;
case 'wc': // warn code
	if(!href) href = '~7234#warn.' + key;
	break;
case 'dir': // directive
	break;
case 'qdir': // request cache control directive
	if(!href) href = '~7234#cache-request-directive.' + key;
	break;
case 'sdir': // response cache control directive
	if(!href) href = '~7234#cache-response-directive.' + key;
	break;
case 'c': //
	break;
/*
case 'l': // literal
	text = '"<code>' + key + '</code>"';
	break;
*/
case 'h': // header
	if(!href) href = header_hrefs[key] + '#header.' + key.toLowerCase();
	break;
case 'm': // method
	if(!href) href = '~7231#' + key;
	break;
case 'ph': // bare phrase
	break;
case 'com': // comments in code block
	break;
case 'dfn':
/*	href = href_data_map[key];
	if(href) {
		return (
'<dfn id="_' + href.slice(1) + '_" data-cycling="a[href=\'' + href + '\']">'
+ text + '</dfn>'
		);
	}
*/
	break;
case 'var':
	break;
//typedef-integer, number-value
case 'en': // english words
	return `<span lang="en-x-a0">${key}</span>`;
	break;
default:
	if(!classname) return match;
//		text = key;
}

if(tag) {
	classname = classname ? ' class="' + classname + '"' : '';
	text = `<${tag}${classname}>${text}</${tag}>`;
}

if(href){
	switch(indicator){
	case '^':
		break;
	case '$':
		text = `<a href="${href}">${text}</a>`;
		break;
	case '@':
//		href = href_data_map[key] || href;
		text = `<dfn id="${href.slice(1)}">${text}</dfn>`;
		break;
	default:
		console.log(match);
		return match;
	}
} else if(indicator !== '^'){
	console.log(match); // check error
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
'426': 'Upgrade Required',
'451': 'Unavailable For Legal Reasons', // RFC7725
'500': 'Internal Server Error',
'501': 'Not Implemented',
'502': 'Bad Gateway',
'503': 'Service Unavailable',
'504': 'Gateway Timeout',
'505': 'HTTP Version Not Supported',
};

/** status codes (default ~7231)*/
source_data.st_hrefs = {
'206': '~7233',
'214': '~7234',
'304': '~7232',
'308': '~7538',
'401': '~7235',
'407': '~7235',
'412': '~7232',
'416': '~7233',
};

/** warning code phrase */
source_data.wc_phrase = {
'110': 'Response is Stale',
'111': 'Revalidation Failed',
'112': 'Disconnected Operation',
'113': 'Heuristic Expiration',
'199': 'Miscellaneous Warning',
'214': 'Transformation Applied',
'299': 'Miscellaneous Persistent Warning',
};

/** headers */
source_data.header_hrefs ={
'Accept': '~7231',
'Accept-Charset': '~7231',
'Accept-Encoding': '~7231',
'Accept-Language': '~7231',
'Age': '~7234',
'Allow': '~7231',
'Content-Encoding': '~7231',
'Content-Language': '~7231',
'Content-Location': '~7231',
'Content-Type': '~7231',
'Date': '~7231',
'Expect': '~7231',
'From': '~7231',
'Location': '~7231',
'Max-Forwards': '~7231',
'MIME-Version': '~7231',
'Referer': '~7231',
'Retry-After': '~7231',
'Server': '~7231',
'User-Agent': '~7231',
'Vary': '~7231',
'Transfer-Encoding': '~7230',
'Content-Length': '~7230',
'TE': '~7230',
'Trailer': '~7230',
'Host': '~7230',
'Via': '~7230',
'Connection': '~7230',
'Upgrade': '~7230',
'Close': '~7230',
'ETag': '~7232',
'Last-Modified': '~7232',
'If-Match': '~7232',
'If-None-Match': '~7232',
'If-Modified-Since': '~7232',
'If-Unmodified-Since': '~7232',
'If-Range': '~7233',
'Range': '~7233',
'Accept-Ranges': '~7233',
'Content-Range': '~7233',
'Cache-Control': '~7234',
'Pragma': '~7234',
'Authorization': '~7235',
'Proxy-Authorization': '~7235',
'WWW-Authenticate': '~7235',
'Proxy-Authenticate': '~7235',
'Warning': '~7234',
'Keep-Alive': '~7230',
'Expires': '~7234',
};


/** links */
source_data.href_data = `

	header fields 

h.MIME-Version:~7231#mime-version
h.Keep-Alive:~7230#compatibility.with.http.1.0.persistent.connections
h.Set-Cookie:~HTTPcookie#section-4.1
h.Cookie:~HTTPcookie#section-4.2
h.Link:~HTTPweblink#section-3
	h.Link:~IETF/rfc5988#section-5
h.Content-Transfer-Encoding:~IETF/rfc2045#section-6
	h.URI
	h.Alternates:rfc2295#section-8.3

	request methods

m.PATCH:~IETF/rfc5789#section-2

	warning codes

wc.1xx:~7234#warn.1xx
wc.2xx:~7234#warn.2xx

	directives

qdir.stale-if-error:~5861#section-4
sdir.stale-if-error:~5861#section-4
sdir.stale-while-revalidate:~5861#section-3

	protocol elements

P.ALPHA:~723X
P.CR:~723X
P.CRLF:~723X
P.CTL:~723X
P.DIGIT:~723X
P.DQUOTE:~723X
P.HEXDIG:~723X
P.HTAB:~723X
P.LF:~723X
P.OCTET:~723X
P.SP:~723X
P.VCHAR:~723X
p.Accept:~7231
p.Accept-Charset:~7231
p.Accept-Encoding:~7231
p.Accept-Language:~7231
p.Accept-Ranges:~7233
p.Age:~7234
p.Allow:~7231
p.Authorization:~7235
p.BWS:~7230
p.Cache-Control:~7234
p.Connection:~7230
p.Content-Encoding:~7231
p.Content-Language:~7231
p.Content-Length:~7230
p.Content-Location:~7231
p.Content-Range:~7233
p.Content-Type:~7231
p.Date:~7231
p.ETag:~7232
p.Expect:~7231
p.Expires:~7234
p.From:~7231
p.GMT:~7231
p.HTTP-date:~7231
p.HTTP-message:~7230
p.HTTP-name:~7230
p.HTTP-version:~7230
p.Host:~7230
p.IMF-fixdate:~7231
p.If-Match:~7232
p.If-Modified-Since:~7232
p.If-None-Match:~7232
p.If-Range:~7233
p.If-Unmodified-Since:~7232
p.Last-Modified:~7232
p.Location:~7231
p.Max-Forwards:~7231
p.OWS:~7230
p.Pragma:~7234
p.Proxy-Authenticate:~7235
p.Proxy-Authorization:~7235
p.RWS:~7230
p.Range:~7233
p.Referer:~7231
p.Retry-After:~7231
p.Server:~7231
p.TE:~7230
p.Trailer:~7230
p.Transfer-Encoding:~7230
p.URI-reference:~7230
p.Upgrade:~7230
p.User-Agent:~7231
p.Vary:~7231
p.Via:~7230
p.WWW-Authenticate:~7235
p.Warning:~7234
p.absolute-URI:~7230
p.absolute-form:~7230
p.absolute-path:~7230
p.accept-ext:~7231
p.accept-params:~7231
p.acceptable-ranges:~7233
p.asctime-date:~7231
p.asterisk-form:~7230
p.auth-param:~7235
p.auth-scheme:~7235
p.authority:~7230
p.authority-form:~7230
p.byte-content-range:~7233
p.byte-range:~7233
p.byte-range-resp:~7233
p.byte-range-set:~7233
p.byte-range-spec:~7233
p.byte-ranges-specifier:~7233
p.bytes-unit:~7233
p.cache-directive:~7234
p.challenge:~7235
p.charset:~7231
p.chunk:~7230
p.chunk-data:~7230
p.chunk-ext:~7230
p.chunk-ext-name:~7230
p.chunk-ext-val:~7230
p.chunk-size:~7230
p.chunked-body:~7230
p.codings:~7231
p.comment:~7230
p.complete-length:~7233
p.connection-option:~7230
p.content-coding:~7231
p.credentials:~7235
p.ctext:~7230
p.date1:~7231
p.date2:~7231
p.date3:~7231
p.day:~7231
p.day-name:~7231
p.day-name-l:~7231
p.delay-seconds:~7231
p.delta-seconds:~7234
p.entity-tag:~7232
	p.entity-tag:~7233
p.etagc:~7232
p.extension-pragma:~7234
p.field-content:~7230
p.field-name:~7230
p.field-value:~7230
p.field-vchar:~7230
p.first-byte-pos:~7233
p.fragment:~7230
p.header-field:~7230
p.hour:~7231
p.http-URI:~7230
p.https-URI:~7230
p.language-range:~7231
p.language-tag:~7231
p.last-byte-pos:~7233
p.last-chunk:~7230
p.mailbox:~7231
p.media-range:~7231
p.media-type:~7231
p.message-body:~7230
p.method:~7230
	p.method:~7231
p.minute:~7231
p.month:~7231
p.obs-date:~7231
p.obs-fold:~7230
p.obs-text:~7230
	p.obs-text:~7232
p.opaque-tag:~7232
p.origin-form:~7230
p.other-content-range:~7233
p.other-range-resp:~7233
p.other-range-set:~7233
p.other-range-unit:~7233
p.other-ranges-specifier:~7233
p.parameter:~7231
p.partial-URI:~7230
	p.partial-URI:~7231
p.path-abempty:~7230
p.path:~7230
p.port:~7230
	p.port:~7234
p.pragma-directive:~7234
p.product:~7231
p.product-version:~7231
p.protocol:~7230
p.protocol-name:~7230
p.protocol-version:~7230
p.pseudonym:~7230
	p.pseudonym:~7234
p.qdtext:~7230
p.query:~7230
p.quoted-pair:~7230
p.quoted-string:~7230
	p.quoted-string:~7231
	p.quoted-string:~7234
	p.quoted-string:~7235
p.qvalue:~7231
p.range-unit:~7233
p.rank:~7230
p.reason-phrase:~7230
p.received-by:~7230
p.received-protocol:~7230
p.relative-part:~7230
p.request-line:~7230
p.request-target:~7230
p.rfc850-date:~7231
p.scheme:~7230
p.second:~7231
p.segment:~7230
p.start-line:~7230
p.status-code:~7230
p.status-line:~7230
p.subtype:~7231
p.suffix-byte-range-spec:~7233
p.suffix-length:~7233
p.t-codings:~7230
p.t-ranking:~7230
p.tchar:~7230
p.time-of-day:~7231
p.token:~7230
	p.token:~7231
	p.token:~7233
	p.token:~7234
	p.token:~7235
p.token68:~7235
p.trailer-part:~7230
p.transfer-coding:~7230
p.transfer-extension:~7230
p.transfer-parameter:~7230
p.type:~7231
p.unsatisfied-range:~7233
p.uri-host:~7230
p.userinfo:~7230
p.host:~7230
	p.uri-host:~7234
p.warn-agent:~7234
p.warn-code:~7234
p.warn-date:~7234
p.warn-text:~7234
p.warning-value:~7234
p.weak:~7232
p.weight:~7231
p.year:~7231
	p.reserved:~7231



	＊
c.chunked:~7230#chunked.encoding
c.compress:~7230#compress.coding
c.deflate:~7230#deflate.coding
c.gzip:~7230#gzip.coding
c.message/http:~7230#internet.media.type.message.http
c.application/http:~7230#internet.media.type.application.http
	■XXXX
IETF Review:~5226#section-4.1
著作者連絡先:~723X#authors-addresses
二重引用符:~723X#P.DQUOTE
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
	~status行0:~7230#status.line
状態行:~7230#status.line
~target~URI:~7230#target-URI
~target資源:~7230#target-resource
~trailer:~7230#trailer
~tunnel:~7230#tunnel
~version:~7230#http.version
~protocol~version:~7230#http.version
~version番号:~7230#version-number
上流:~7230#upstream
下流:~7230#downstream
不完全:~7230#incomplete
完全:~7230#incomplete
中継者:~7230#intermediary
内方:~7230#inbound
受信者:~7230#recipient
外方:~7230#outbound
実効~要請~URI:~7230#effective.request.uri
形式変換-:~7230#message.transformations
形式変換:~7230#message.transformations
応答:~7230#response
応答~分割:~7230#response.splitting
持続的~接続:~7230#persistent.connections
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
形式変換proxy:~7230#transforming-proxy
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
媒体~型:~7231#media.type
媒体~型~parameter:~7231#p.parameter
~charset:~7231#charset
内容~符号法:~7231#content.codings
内容~符号法~名:~7231#p.content-coding
言語~tag:~7231#language.tags
媒体~範囲:~7231#p.media-range
	資源の識別:~7231#identification
表現~data:~7231#representation.data
表現~header:~7231#representation.metadata
~payload~header:#payload-headers
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
状態code:~7231#status.codes
	応答~status-code:~7231#status.codes
応答~状態code:~7231#status.codes
応答~header:~7231#response.header.fields
制御~data:~7231#response.control.data
~messageの出生日時:~7231#origination-date
	日時~形式:~7231#section-7.1.1.1
日時:~7231#origination.date
時計:~7231#clock
首~資源:~7231#primary-resource
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

範囲単位:~7233#range.units
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
共有~cache:~7234#shared-cache
私用~cache:~7234#private-cache
~cache制御~指令:~7234#cache-directive
警告~text:~7234#warning-text

	■7235

資格証:~7235#credentials
`;

/** words */

source_data.words_table1 = `
IETF:https://tools.ietf.org/html
IANA-a:https://www.iana.org/assignments
ERRATA:https://www.rfc-editor.org/errata_search.php
723X:RFC723X-ja.html
7230:RFC7230-ja.html
7231:RFC7231-ja.html
7232:RFC7232-ja.html
7233:RFC7233-ja.html
7234:RFC7234-ja.html
7235:RFC7235-ja.html
7538:http-status-code-308-ja.html
	7238:https://tools.ietf.org/html/rfc7238
2045:https://tools.ietf.org/html/rfc2045
2068:https://tools.ietf.org/html/rfc2068
2616:https://tools.ietf.org/html/rfc2616
2817:https://tools.ietf.org/html/rfc2817
2818:https://tools.ietf.org/html/rfc2818
	3986:RFC3986-ja.html
3986:https://tools.ietf.org/html/rfc3986
4648:https://tools.ietf.org/html/rfc4648
5226:https://tools.ietf.org/html/rfc5226
5322:https://tools.ietf.org/html/rfc5322

MUST0:<em class="rfc2119">ならない</em>
MUST:なければ<em class="rfc2119">ならない</em>
MUST_NOT:ては<em class="rfc2119">ならない</em>
REQUIRED:<em class="rfc2119">要求される</em>
SHOULD:<em class="rfc2119">べき</em>である
SHOULD_NOT:<em class="rfc2119">べき</em>でない
RECOMMENDED:<em class="rfc2119">推奨される</em>
MAY:<em class="rfc2119">よい</em>
OPTIONAL:<em class="rfc2119">任意選択</em>
OUGHT:べき.である

HTTP09: HTTP/0.9 
HTTP10: HTTP/1.0 
HTTP11: HTTP/1.1 
HTTP1x: HTTP/1.x 
100cont:<code>100-continue</code>
close_:"<code>close</code>" 
IETF-org: “IETF (iesg@ietf.org) — Internet Engineering Task Force” 
共通頁:RFC723X 共通ページ
Status-of-This-Mamo:<h2 title="Status of This Mamo">このメモの位置付け</h2><p class="trans-note">【この節の内容は、著作権の告知も含め，<a href="RFC723X-ja.html#status">RFC723X 共通ページ</a>に委譲。】</p></section>
`;

/** Words */

source_data.words_table = `
伝え:inform し:~
伝える:inform する:~
切替:switching::切り替え
切替わる:switch する::切り替わる
切替え:switch し::切り替え
切替えら:switch さ::切り替えら
切替える:switch する::切り替える
割振ら:allocate さ:割り振ら
割振る:allocate する::割り振る
割当てら:assign さ:あてがわ
割当てる:assign する::あてがう
割当てて:assign して::あてがって
割当てた:assign した::あてがった
含ま:include し:~
含ませ:include させ:~
含まれ:include され:~
含む:include する:~
含めて:include して:~
内包-:include:~
除外-:exclude:~
	呼ばれ:call され:~
呼出す:invoke する:呼び出す
呼出し:invoking:呼び出し
	呼出し:invocation:~
埋込まれ:embed され:埋め込まれ
埋込む:embed する:埋め込む
埋込み:embedded:埋め込み
埋込ん:embed し:埋め込ん
始まる:begin する:~
指す:refer する:~
指し:refer し:~
指され:refer され:~
書込み:write::書き込み
書込め:write でき::書き込め
書換え:rewrite し::書き換え
書換える:rewrite する::書き換える
読取っ:read し::読み取っ
読取ら:read し::読み取ら
読取られ:read され::読み取られ
読取り:read::読み取り
読取る:read する::読み取る
読取れ:read でき::読み取れ
読取可能:readable::読み取り可能
繰返し:repetition:繰り返し
繰返され:repeat され:繰り返され
繰返した:repeat した:繰り返した
繰返して:repeat して:繰り返して
繰返す:repeat する:繰り返す
繰返せ:repeat でき:繰り返せ
	止めさ:cease さ:~
	止めた:cease した:~
	残っ:remain し:~
渡され:pass され:~
渡す:pass する:~
	満たさ:satisfy さ:~
	満たす:satisfy する:~
	満たせ:satisfy でき:~
	満たそ:satisfy しよ:~
充足さ:satisfy さ:満たさ
充足し:satisfy し:満たし
充足しな:satisfy しな:満たさな
充足しよ:satisfy しよ:満たそ
充足する:satisfy する:満たす
充足でき:satisfy でき:満たせ
	知らせ:know させ:~
	知らな:know しな:~
	知る:know する:~
	知れる:know できる:~
結付け:association:結び付け
結付けて:associate して:結び付けて
結付けら:associate さ:結び付けら
結付ける:associate する:結び付ける
結付法:associating:結び付け
落とす:drop する:~
落とさ:drop さ:~
見出され:find され:~
見出す:find する:~
見出せ:find でき:~
見出して:find して:~
見出させ:find させ:~
	単に:merely:~
	単位:unit:~
運ばせ:carry させ::~
運ばれ:carry され::~
運ぶ:carry する::~
運べる:carry できる:~
運んで:carry して:~
重なっ:overlap し:~
隠す:hide する:~
隠され:hide され:~
隠し:hide し:~
見積もり:estimate::~
見積もら:estimateさ::~
見積もる:estimateする::~
促す:prompt する:~



	HTTP09:
	HTTP10:
	HTTP11:
	HTTP1x:
ABNF:
API:
Cookie:
DoS:denial-of-service:DoS
HTTP:
HTTPS:
IANA:
Internet:
MIME:
TCP:
TLS:
UA:user agent:UA
URI:
UTC:
Web:

charset:
overhead::::オーバーヘッド
拡充-:populate:~
member::::メンバ
subject::対象
	~~渡る:span:
access::::アクセス
accessibility:::access 性:アクセス性:アクセシビリティ
指図-:instruct:~
account::::アカウント
archive::::アーカイブ
bookmark::::ブックマーク
class::::クラス
clear::::クリア
comment::::コメント
component::::コンポーネント
computer::::コンピュータ
container:::コンテナ
cookie:
cost::::コスト
crash::::クラッシュ
custom::::カスタム
database::::データベース
dialog::::ダイアログ
encapsulate::::カプセル化
encapsulation::::カプセル化
entry::::エントリ
error::::エラー
	~err::
event::::イベント
file::::ファイル
browser::::ブラウザ
folder::::フォルダ
form::::フォーム
group::::グループ
guide::::ガイド
handler::::ハンドラ
	~hypertext:hypertext note
instance::::インスタンス
interface::::インタフェース
key::::キー
keyword::::キーワード
label::::ラベル
level::::レベル
library::::ライブラリ
link::::リンク
list::::リスト
listen::::リッスン
listener::::リスナー
literal::::リテラル
log::::ログ
loop::::ループ
machine::::マシン
mail::::メール
mark::::マーク
memory::::メモリ
email:
mode::::モード
object::::オブジェクト
option::::オプション
句:phrase::~::フレーズ
	pipe-and-filter:パイプ＆フィルタ
pointer::::ポインタ
property::::プロパティ
	特質
command::::コマンド
random::::ランダム
具現化-:render:~
具現化:rendering:~
	render::::レンダー
	rendering::::レンダリング
repository::::リポジトリ
reset::::リセット
schedule::::スケジュール
script::::スクリプト
scripting::::スクリプティング
session::::セッション
source::::ソース
源:source::~:ソース
storage::::ストレージ
subset::::サブセット
table::::テーブル
target::::ターゲット
task::::タスク
test::::テスト
	textual:~textによる／~textからなる
tool::::ツール
major::::主:メジャー
minor::::副:マイナー
view::::ビュー

	●指示語

個々の:individual:~
一定の:certain:~
以前:previous:~
以前の:previous:~
首:primary::主
一時的:temporary:~
余分な:extra:~
一意:unique:~
今後の:later:~
単独の:single:~
全部的:full:~
全部的な:full:~
側:side:~
元の:original:~
	元:original:~
	元々は:originally:~
尾部:trailing:~
頭部:leading:~
巨大:large:~
広範:wide:~
広範囲:extensive:~
最大:maximum:~
最大化-:maximize:~
最小:minimum:~
最終:final:~
末尾:end:~
版:edition:~
特定0の:particular:ある特定の
近過去:recent::~
近過去の:recent な::~
現在の:current:~
	現在，:currently:~
自前の:own::~
	所有-:own:~
所有者:owner::~
重複:duplicate:~
類似した:similar な:~
類似する:similar である:~
類似的:similar:~
	~similarly::
節:section:~

	●仕様

system::::システム
model::::モデル
native::::ネイティブ
program::::プログラム
programmatic::::プログラム的
programming::::プログラミング
software::::ソフトウェア
based:-based:に基づく:::ベースの
proprietary::::プロプライエタリ
	やりとり:interaction:~
見なさ:consider さ:~
見なし:consider し:~
見なす:consider する:~
見なせ:consider でき:~
前提:assumption:~
見做さ:assume さ:~
見做し:assume し:~
見做す:assume する:~
見做せ:assume でき:~
	見よ:see:~
試み:attempt:~
試みた:attempt した:~
試みて:attempt して:~
試みら:attempt さ:~
試みる:attempt する:~
論じる:discuss する:~
論じて:discuss して:~
論じた:discuss した:~
論じら:discuss さ:~
論点:discussion:~
十分:enough:~
	足る／足りる:sufficient:~
	足らない:insufficient:~
述べ:describe し:~
述べら:describe さ:~
述べる:describe する:~
説明0:description:説明
記述:description:~
記述-:describe:~
取戻せ:reclaim でき:取り戻せ
取戻され:reclaim され:取り戻され
取扱い:handling:取り扱い
取扱う:handle する:取り扱う
取扱え:handle でき:取り扱え
取扱っ:handle し:取り扱っ
取扱わ:handle し:取り扱わ
取扱われ:handle され:取り扱われ
孕む:involve する:~
孕まな:involve しな:~
孕んで:involve して:~
導かれ:lead され:~
導き:lead し:~
	導く:lead する:~
扱い:treatment:~
扱う:treat する:~
扱え:treat でき:~
扱っ:treat し:~
扱わ:treat し:~
扱われ:treat され:~
望まず:wish せず:~
望まれ:wish され:~
望む:wish する:~
望まな:wish しな:~
求めて:want して:~
求まれ:want され:~
	望ましく(un)desirable
欲され:desire され:~
欲して:desire して:~
欲する:desire する:~
決めた:decide した:~
決める:decide する:~
決めれ:decide でき:~
挙動:behavior:ふるまい
挙動する:behave する:ふるまう
改め:alter でき:~
改めら:alter さ:~
改める:alter する:~
避けら:avoid さ:~
避ける:avoid する:~
避けた:avoid した:~
回避法:avoidance:~
供-:provide:~
供せ:provide でき:~
供さな:provide しな:~
解-:understand:~
解さな:understand しな:~
解せ:understand でき:~
agent::::エージェント
algo:algorithm:::アルゴリズム
app-level:application-level:::アプリケーションレベル
app:application:::アプリケーション
調査研究:research::~::リサーチ
	調査
scalability::::スケーラビリティ
support::::サポート
version::::バージョン
応用:application::~::アプリケーション
	応用-:apply:::
適切:appropriate:~
適用-:apply:~
	適用すること:application
	適用-可能:applicable:~
適用性:applicability:~
approach::::アプローチ
architecture::::アーキテクチャ
汎用:generic:~
汎用の:generic な:~
一般:general:~
一般的:general:~
一般用:general-purpose:~
共通の:common:~
共通する:common な:~
共通的に:common に:よく
共通的な:common な:よくある
中立的:neutral:~
予見-:believe:~
事例:case:~
事実:fact:~
理由:reason:~
理由付け:reasoning:~
事由:reason::~
互換:compatible::~
互換性:compatibility::~
後方:backwards::~
後方互換:backwards-compatible::~
主張:claim:~
乏しい:poor な:~
予期-:expect:~
期待-:expect:~
期待:expectation::~
予測-:anticipate:~
上品:graceful::~
不利:disadvantage:~
不可欠:crucial:~
不明瞭に:obscure:~
付録:Appendix:~
代替:alternative:~
代替-:alternate:~
代表的:typical:~
仕方:way:~
仕様:spec:~
仕組み:mechanism:~
使役-:employ:~
例外:exception:~
依存-:depend:~
依存:dependent:~
依存関係:dependency:~
独立:independent:~
	依存しない:independent:~
依拠-:rely:~
	依拠-可能:reliable:~
信頼性:reliability:~
保守的:conservative:~
保証-:guarantee:~
最良:best:~
最適化-:optimize:~
最適化:optimization:~
適合-:conform:~
適合:conformant:~
適合性:conformance:~
適度:reasonable:~
見合う:reasonable な:~
	理に適った:reasonable:~
適応的:adaptive:~
適時:timely:~
適正:proper:~
不適正:improper:~
選好-:prefer:~
選好:preference:~
選好順:descending preference の order:選好度の高い順
有利:advantageous:~
有意:significant:~
有意度:significance:~
有意性:significance:~
有意義:meaningful:~
未定義:undefined:~
分類上の:categorization:~
判定基準:criteria:~
判断-:deem:~
別の:another:~
別個の:distinct:~
利点:advantage:~
利用:use:~
利用-:use:~
用立てる:make use する:~
利用e:usage:利用
利用者:user::~::ユーザ
有用:useful:~
再利用:reuse:~
再利用性:reusability:~
誤用-:misuse:~
濫用:abuse:~
制定-:prescribe:~
制御:control::~
制約-:restrict:~
制約:restriction:~
制限-:limit:~
上限:limit:~
制限:limitation:~
副作用:side effect:~
副次的:secondary:~
創出-:mint:~
効果:effect:~
効率性:efficiency:~
非効率:inefficient:~
効率的:efficient:~
効果的:effective:~
実効:effective::~
実効性:effectiveness:~
単純:simple:~
単純に:simple に:~
単純化-:simplify:~
包括的:comprehensive:~
参照文献:references:~
参考:informative:~
厳密に:strict に:~
合意:consensus:~
同意-:agree:~
回答:answer:~
向上-:improve:~
改善-:improve:~
含意-:imply:~
含意:implications:~
	問い:question:~
問題:problem:~
損なう:lose する:~
損失:loss:~
失われ:lost し:~
対処-:work around:~
対処法:workaround:~
堅牢:robust:~
堅牢性:robustness:~
困難:difficult:~
図:figure:~
図式:diagram:~
増強-:enhance:~
強化-:enhance:~
受容-:accept:~
	受容-可能:acceptable:~
古い:older:~
可用:available:~
可用性:availability:~
可能0:possible:可能
不可能:impossible:~
可能化-:enable:~
可能化:enable:可能に
不能化-:disable:~
	無効化-／無力化:disable:無効化
	可能性:possibility:~
同義語:synonym:~
多様:diverse:~
多様性:diversity:~
大概は:presumably:~
奨励-:encourage:~
	〜ないことを奨励discouraged
定義-:define:~
定義:definition:~
定義済みの:predefined:~
再定義-:redefine:~
実施:practice:~
実用性:practicality:~
実用的:practical:~
実装-:implement:~
実装:implementation:~
実装者:implementer:~
実際:actual:~
実際の:actual な:~
遂行-:perform:~
遂行:performing:~
将来:future:~
将来の:future:~
尊守-:honor:~
導入-:introduce:~
導入:introduction:~
序論:introduction:~
導出-:derive:~
履行-:fulfill:~
帰結:consequence:~
干渉-:interfere:~
廃用:obsolete::~
廃用に:obsolete::~
強要-:insist:~
影響:impact:~
影響-:affect:~
必要十分:adequate:~
必要性:needs:~
	不必要な:unnecessary:~
	不必要に:needlessly:~
	必要:need:~
必須:required:~
恒久的:permanent:~
情報:information:~
意味-:mean:~
意味:meaning:~
意味論:semantics::~::セマンティクス
意味論的:semantic::~::セマンティック
意向:intention:~
意図-:intend:~
意図:intent:~
意図的:intentional:~
注意深く:careful に:~
慣行:convention::~
懸念:concern:~
旧式の:ancient:~
旧来の:legacy な::~
早期の:early:~
明らか:obvious:~
明白:clear:~
明確化-:clarify:~
明確化:clarification:~
明示的:explicit:~
暗黙的:implicit:~
暫定的:interim:~
本質的:essential:~
本質的でない:nonessential:~
柔軟:flexible:~
柔軟性:flexibility:~
根本的:fundamental:~
木目細かい:fine-grained:~
極小:minimal:~
概して:typical に:~
概念:concept:~
概観:overview:~
標準:standard::~
権利:right:~
欠如:lack:~
欠如する:lack する:欠く
正しく:correct に:~
正しい:correct な:~
正した:correct した:~
不正:incorrect:~
正確0:accurate:正確
正確:exact:~
正誤表:errata::~
歴史:history:~
歴史的:historical:~
手動:manual:~
手引き:guidance:~
手引きす:guide す:~
指針:guideline:~
手段:means:~
手続き:procedure:~
手順:steps:~
技法:technique:~
技術:technology:~
抑制-:reduce:~
抽象化-:abstract 化:~
抽象化:abstraction:~
拘束-:constrain:~
拘束:constraints:~
拡張-:extend::~
拡張0-:expand:拡張
拡張:extension::~
	拡張-可能:extensible::~
拡張性:extensibility::~
指向0:-oriented:指向
採用-:adopt:~
採用:adoption:~
推奨-:recommend:~
推奨:recommendation:~
勧告:recommendation:~
推測-:guess:~
推測:guess:~
提供-:offer:~
提案-:propose:~
提案:proposal:~
支援-:assist:~:::アシスト
故意:deliberate:~
指定-:specify:~
指定:specification:~
指定子:specifier:~
指示-:indicate:~
指示:indication:~
指示子:indicator:~
新たな:new:~
方法:how:~
方針:strategy:~
施行-:enforce:~
既存の:existing:~
既定:default::~::デフォルト
既定の:default::~::デフォルト
既知:known:~
既知の:known:~
未知:unknown:~
未知の:unknown:~
決定-:determine:~
決定:determination:~
裁定:decision:~
	注記-:note:~
	注記:Note:~
深刻:serious:~
混同-:confuse:~
混同:confusion:~
準拠-:comply::~
準拠:compliant::~
	特に，:particularly:~
	特に:specifically:~
特別:special:~
特化-:specialize:~
特定の:specific な:~
特性:characteristic:~
	特徴:characteristic:~
特有:specific:~
特有の:specific な:~
特色機能:feature::~::フィーチャ
確保-:ensure:~
位置付け:status:~
状況:situation:~
状況下:circumstance:~
各種用語:terminology:~
用語:term:~
目標:goal:~
目的:purpose:~
相互運用-:interoperate::~
	相互運用-可能:interoperable::~
相互運用上の:interoperability::~
相互運用性:interoperability::~
相似的:analogous:~
相当:substantial:~
	相当するもの:counterpart:~
相応しい:suitable な:~
相応しく:suitable で:~
	unsuitable:~
任意選択の:optional::~::オプションの
省略可:optional::~::オプション
省略可能:optional::~::オプションの
示唆-:suggest:~
示唆:suggestion:~
禁止-:forbid::~
禁制-:prohibit::~
競合-:conflict:~
競合:conflict:~
簡潔:compact:~
精確:precise:~
精緻化-:refine:~
精緻化:refinement:~
終端:end:~
経験:experience:~
経験則:heuristics::~::ヒューリスティックス
経験的:heuristic::~::ヒューリスティック
結果:result:~
結論:conclusion:~
統一的:uniform:~
統治-:govern:~
網羅的:exhaustive:~
総集的:collective:~
緩めら:relax さ:~
緩める:relax する:~
義務付けな:mandate しな:~
義務付ける:mandate する:~
義務付けて:mandate して:~
義務化:mandate:~
翻訳-:translate::~
翻訳:translation::~
転化-:translate::~
考慮-:consider:~
考慮点:consideration:~
能力:capability::~
自由:free:~
	良い:good:~
草案:draft::~
衝突-:collide:~
衝突:collision:~
補助:help:~
複雑化-:complicate:~
要件:requirements:~
要求-:require:~
要約-:summarize:~
規則:rule:~
規約:convention:~
表記規約:notational conventions:~
策定者:author:~
著者:author:~
機会:chance:~
	~~機会:opportunity:~
	機能:function:~
機能性:functionality:~
設置-:place:~
設置しな:place しな:課さな
設置する:place する:課す
	課す:impose する:~
設計:design::~::デザイン
許可-:permit:~
許可:permission:~
許容-:allow:~
不許可に:disallow:~
	許容されない:disallowed:~
診断:diagnostic:~
試験:test::~::テスト
試験的:experimental:~
詳細:details:~
詳細な:detailed:~
承認-:acknowledge:~
謝辞:acknowledgement:~
認識-:recognize:~
未認識:unrecognized:認識できない
誤解:mistake:~
説明-:explain:~
説明:explanation:~
課題:issue:~
責務:responsibility:~
解釈-:interpret:~
解釈:interpretation:~
誤解釈:misinterpret:~
資質:nature:~
性向:nature:~
通例的に:usual に:~
通例的には:usual に:~
通常:normal:~
通常の:normal な:~
通常は:normal では:~
	normally
達成-:accomplish:~
違反-:violate:~
違反:violation:~
重要:important:~
開発-:develop:~
開発:development:~
開発者:developer:~
開示-:disclose:~
開示:disclosure:~
関係-:relate:~
	関係する:related:~
関係ない:unrelated:~
関係性:relationship:~
関心:interest:~
関連する:relevant な:~
防止-:prevent:~
	防が:prevent し:~
	防ぐ:prevent する:~
限度:extent:~
	除いて:except して:~
公共:public:~
公開-:expose:~
非公式的:informal:~
非推奨:deprecated::~
非推奨に:deprecate::~
順守-:obey:~
一貫性:consistency:~
整合させ:consistent にす:~
整合しな:consistent でな:~
整合でな:consistent でな:整合しな
整合な:consistent な:整合する
整合する:consistent になる:~
一貫する:consistent である:~
一貫しな:consistent でな:~
一貫して:consistent に:~
	inconsistent:
表記法:notation:~
解決0:solve:解決
解決-:resolve::~
解決:resolution::~
解決策:solution:~
英語:English:~
側面:aspect:~
偶発的:accidental:~
偽:false:~
収束-:converge:~
取組まれ:address され:取り組まれ
取組む:address する:取り組む
壊す:breakする:~
壊れ:break され:~
壊れた:broken:~
理論:theory:~
知識:knowledge:~

	●保安

risk::::リスク
sensible:
sensitive:
privacy::::プライバシー
私的:private:~:::プライベート
policy::::ポリシー
騙す:trick する:~
騙せ:trick でき:~
保安:security::~:セキュリティ
保安上の:security::~:セキュリティ上の
保安化:secure 化::~:セキュア化
保安的:secure::~:セキュア
穴:hole::穴:ホール
保持-:hold:~
保護-:protect:~
保護:protection:~
未保護の:unprotected:~
信用-:trust::~
	信用できない:untrusted:~
弱体化-:compromise:~
悪用-:exploit:~
悪用:exploitation:~
悪意的な:malicious::悪意のある
害:harm:~
有害:harmful:~
無害:harmless:~
権限:authority::~
権限付与-:authorize::~
権限付与され:authorize され::権限が付与され
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
攻撃:attack::~
攻撃者:attacker::~
注入:injection::~::インジェクション
注入-:inject::~::インジェクト
特権拡大:privilege escalation:~
盗聴:theft:~
脆弱:vulnerable::~
脆弱性:vulnerability::~
軽減策:mitigation:~
軽減-:mitigate:~
署名:signature:~
防御策:defense:~
露に:reveal:~
露呈-:expose:~
中間者:man-in-the-middle::~
相関-:correlate:~
相関:correlation:~
隔離:isolate:~
追跡:trace::~::トレース

	●HTTP／構文／data／stream

header::::ヘッダ
hypertext::::ハイパーテキスト
metadata::::メタデータ
message::::メッセージ
messaging::::メッセージ処理
zero:::ゼロ
ゼロ:zero::~
pair::::ペア
parameter::::パラメタ
path::::パス
pathname::::パス名
pattern::::パタン
port::::ポート
query::::クエリ
scheme::::スキーム
スキーム:scheme::~
protocol::::プロトコル
binary::::バイナリ
code::::コード
data::::データ
frame::::フレーム
	~frame法:framing
packet::::パケット
padding::::パディング
payload::::ペイロード
percent::::パーセント
size::::サイズ
stream::::ストリーム
tag::::タグ
subtag::::下位タグ
text::::テキスト
token::::トークン
trailer::::トレイラ
chunked:::chunk 化:チャンク化
octet::::オクテット
hex::16 進
hexadecimal::16 進数
field::::フィールド
asterisk::::アスタリスク
backslash::::バックスラッシュ
byte::::バイト
chunk::::チャンク
本体:body::~::ボディ
colon::::コロン
comma::::カンマ
	comma区切りの:comma-separated
decimal::10 進
escaping::::エスケープ処理
escape::::エスケープ
quote::::クォート
引用符:quote:::~:クォート
二重引用符:double quote::~::ダブルクォート
	括る:quote する:~::クォートする
	括られ:quote され:~::クォートされ
不良:bad:~
区切られ:delimit され::~
区切り:delimitation::~
区切りの:-separated:~
区切る:delimit する::~
区切子:delimiter::~
合致:match::~::マッチ
照合-:match::~::マッチ
照合:matching::~::マッチング
大文字:uppercase::~
小文字:lowercase::~
文字:character::~
文字列:string::~
文字大小:case::~
文字大小区別:case-sensitive::~
文字大小無視:case-insensitive::~
文字大小無視の:case-insensitive な::~
数字:numeral:~
数的:numeric:~
整数:integer::~
実数:real number:~
	時間:time:~
桁:digit::~
構文:syntax::~::シンタックス
構文解析-:parse::~::パース
構文解析:parsing::~::パース処理
構文解析器:parser::~::パーサ
正準:canonical::~
正準化:canonicalization::~
正規化-:normalize::~
正規化:normalization::~
移行:transition::~
稀:rare:~
番号:number:~
空:empty:~
空行:blank line::~
空白:whitespace::~
素片:fragment::~::フラグメント
英字:letter::~
行0:line::行
圧縮-:compress::~
圧縮:compression::~
成分:component::~
下位成分:subcomponent::~
接尾辞:suffix:~
接頭辞:prefix:~
折返-:fold::~
折返さな:fold しな::~
折返し:folding::~
記号:symbol:~
符号化-:encode::~::エンコード
符号化:encoding::~::エンコーディング
	符号化-済み:encoded
符号化法:encoding::~::エンコーディング
符号変換:transcoding::~::トランスコーディング
符号変換器:transcoder::~::トランスコーダ
符号法:coding::~::コーディング
復号-:decode::~::デコード
復号:decoding::~::デコーディング
暗号化-:encrypt::~
暗号化:encryption::~
暗号用の:cryptographic::~
形式変換proxy:transforming proxy::形式変換 proxy:形式変換プロキシ
形式変換-:transform::~
形式変換:transformation::~
形式:format::~::フォーマット
生成規則:production::~
生成-:generate::~
生成:generation::~
分割-:split:~
分割:splitting:~
分解-:decompose:~
分離-:separate:~
分離子:separator:~

	●network

address::::アドレス
challenge::::チャレンジ
digest::::ダイジェスト
hash::::ハッシュ
filter::::フィルタ
firewall::::ファイアウォール
桁溢れ:overflow::~::オーバーフロー
password::::パスワード
cache::::キャッシュ
	~cache済み:cached
	~cache可能:cacheable
caching:::cache 処理:キャッシュ処理
client::::クライアント
fetch:
事前fetch:pre-fetch::事前 fetch
gateway::::ゲートウェイ
domain::::ドメイン
host::::ホスト
内方:inbound::~::インバウンド
外方:outbound::~::アウトバウンド
network::::ネットワーク
method::::メソッド
portal::::ポータル
web:
provider::::プロバイダ
proxy::::プロキシ
serve::::サーブ
server::::サーバ
server-wide::server 全般::サーバ全般
service::::サービス
site::::サイト
spider::::スパイダー
robot::::ロボット
robotic::::ロボット的
traffic::::トラフィック
transaction::::トランザクション
transport::::トランスポート
tunnel::::トンネル
close:
closure:
open:
連鎖:chain::~::チェイン
経路制御-:route::~:ルート
経路制御:routing::~:ルーティング
接続-:connect::~::コネクト
接続:connection::~::コネクション
direct:::指図
	指向ける／ダイレクト／ディレクト
redirect::::リダイレクト
redirection::::リダイレクト
指令:directive::~
	ディレクティブ
指令-:direct::~
方向:direction::~
	directional:
直接的:direct:~
	直に:direct に:~
間接的:indirect:~
双方向:bidirectional::~
主体:party::~
第三者主体:third-party::~::サードパーティ
責任主体:responsible party:~
上流:upstream::~
下流:downstream::~
中継:intermediate::~
中継-:relay::~
中継者:intermediary::~
介在-:intervene:~
伝送-:transmit::~
伝送:transmission::~
伝送処理:transmitting::~
回送-:forward::~
回送:forwarding::~
	回送-法:forwarding
転送:transfer::~
伝送路:wire::~
送達-:deliver::~
送達:delivery::~
伝達-:convey::~
分散-:balance:~
分散型の:distributed::~
到着-:arrive:~
参加-:engage:~
参加者:participant:~
referrer::::リファラ
参照:reference::~
参照元:referring:refer 元:~
受信-:receive::~
受信:receiving::~
受信者:recipient::~
受領:receipt::~
送信-:send::~
送信:sending::~
送信者:sender::~
広告-:advertise:~
広告:advertisement:~
往来:round trip:~:::ラウンドトリップ
折衝-:negotiate::~::ネゴシエート
折衝:negotiation::~::ネゴシエーション
昇格:upgrade::~::アップグレード
降格:downgrade::~::ダウングレード
生成元:origin::~::オリジン
端点:endpoint::~::エンドポイント
端点間:end-to-end::~::エンドツーエンド
隣点間:hop-by-hop::~::ホップバイホップ
通信-:communicate::~
通信:communication::~
通達-:signal:~
通達:signal:~
連絡-:contact:~
連絡:contact:~
連結-:concatenate:~
実体:entity:~
応答-:respond::~::レスポンド
応答:response::~::レスポンス
要請:request::~::リクエスト
要請-:request::~::リクエスト
応答class:class:::クラス
応答待ちの:outstanding::~
	勧める:advise する:~
所在-:locate::~
所在:location::~
経路:path:~
行先:destination:~
資源:resource::~:リソース
遠隔:remote::~::リモート

	●未分類

企業:corporate:~
個人:personal:~
人:human:~
一掃-:purge:~
上書き:override::~
下層:underlying::~
下層の:underlying::~
不定:indefinite:~
不透明:opaque::~
並列的:parallel:~
中断-:interrupt:~
中断:interruption:~
中核:core:~
中止-:abort:~
予約-:reserve::~
	予約-済み:reserved::~
交換:exchange:~
付加-:append:~
付随-:accompany:~
遊休:idle:~
	遊休~中:idle
作動中:active::~::アクティブ
作動中の:active な::~::アクティブな
作成-:create::~
作成:creation::~
置換-:replace::~
除去-:remove::~
除去:removal::~
削除-:delete::~
削除:deletion::~
併合-:merge:~
係数:factor:~
促進-:promote:~
保全-:preserve:~
保存-:save:~
修正:fix:~
値:value:~
停止-:stop:~
優先度:priority:~
優先順:precedence:~
先行-:precede:~
入力:input:~
共有-:share:~
共有:shared:~
内側:inside:~
内容:content::~
内来的:inherent:~
内部:internal:~
冪等:idempotent::~
冪等性:idempotent property::~
処理-:process:~
処理:processing:~
処理器:processor:~
処理能:performance:~
出力:output:~
	出現-:appear:~
出現:appearance:~
出現し:appear し:現れ
出現する:appear する:現れる
出生-:originate::~
出生日時:origination date::~
出生時:origination::~
出生時の:origination::~
分岐:divergent:~
初期:initial:~
別名:alias::~::エイリアス
割合:percentage:~
割当-:allocate:~
動作-:act:~:::アクト
動作:action:~:::アクション
動的:dynamic:~
包含-:contain:~
区分-:partition:~
判別-:distinguish:~
事前条件:precondition::~
協調的:collaborative:~
即時:immediate:~
却下-:reject::~
反映-:reflect:~
取消:cancel:~
取込まれ:import され:取り込まれ
可視:visible:~
可視性:visibility:~
同一性:identity:~
同封-:enclose::~
同時:simultaneous:~
同時性:concurrency:~
同時的:concurrent:~
同期-:synchronize:~
同期的:synchronous:~
非同期的:asynchronous:~
名:name:~
名前:name:~
名前空間:namespace::~
命名-:name:~
命名:naming:~
品質:quality::~
品質値:qvalue::~
回復-:recover::~
固定的な:fixed:~
固定長:fixed-length:~
下位型:subtype::~
型:type::~
基底:base:~
報告:report:~
境界:boundary::~
増分:increment:~
増分的:incremental:~
増加-:increase:~
増大-:increase:~
回復:recovery::~
	変わら:changeし:~
	変わり:changeし:~
変化-:change:~
変化:changes:~
変更-:change::~
変更:change::~
変更s:changes:変更
変更点:changes:~
変換-:convert:~
変換:conversion:~
外側:outside:~
	外部:outside:~
外向けの:outgoing:~
失効:expiration:~
失効-:expire:~
弱い:weak::~
弱さ:weakness::~
強い:strong::~
強さ:strength::~
失敗-:fail::~
失敗:failure::~
成功-:succeed::~
成功:success::~
成功裡:successful::~
成功裡の:successful な::~
	立証-:verify:~
	立証:verification:~
検証y-:verify:検証°
検証y:verification:検証°
検証-:validate::~
検証:validation::~
検証子:validator::~
妥当:valid::~
有効:valid::~
有効性:validity:~
無効:invalid::~
無効化:invalidate::~
妥当でない:invalid な::~
妥当性:validity::~
媒体:media::~::メディア
在する:present する:在る
在さな:present しな:無
不在:absence:~
存在:presence:~
提示-:present:~
提示:presentation:~
存在e-:exist:存在
存在e:existence:存在
安全:safe::~
安全な:safe::~
	安全でない:unsafe:~
完了-:complete::~
完了:completion::~
完全:complete::~
完全な:complete::~
不完全:incomplete::~
不完全な:incomplete::~
完全性:integrity::~
実行-:execute:~
宣言-:declare:~
宣言的:declarative:~
容易:easy:~
容量:capacity:~
対応-:correspond:~
対応0:corresponding:対応する
対応付け:mapping:~:::マッピング
対応関係:mapping:~:::マッピング
対話-:interact::やりとり::インタラクト
対話:interaction::やりとり::インタラクション
対話的:interactive::~::インタラクティブ
未来:future:~
未来の:future:~
尚早:premature:~
局所的:local::~::ローカル
	局所的な
展開-:expand:~
抽出-:extract:~
属性:attribute:~
層:layer::~
履歴:history::~
帯域幅:bandwidth::~::バンド幅
形:form:~
形成-:form:~
役割:role::~::ロール
後処理:post-processing:~
復帰-:revert:~
所属-:belong:~
所属:belong:~
拒否-:refuse:~
持続-:persist::~
持続性:persistence::~
持続的:persistent::~
挿入-:insert:~
給-:supply:~
給せ:supply でき:~
給さな:supply しな:~
操作-:manipulate:~
操作:manipulation:~
改変-:modify::~
改変子:modifier::~
改変:modification::~
改訂-:revise::~
改訂:revision::~::リビジョン
改訂履歴:revision::~::リビジョン
計算-:calculate:~
	計算:calculating:~
計算:calculation:~
文書:document:~
文書化:document 化:~
文法:grammar:~
文脈:context::~
族:family::~::ファミリ
日付時刻:date and time::~
日時:date::~
時刻:time::~
時刻印:timestamp::~::タイムスタンプ
時間制限:timeout::~::タイムアウト
待時間:latency:待ち時間
待機-:wait::~
時計:clock::~::クロック
昇順:ascending order:~
降順:decreaseing order:~
更新:update::~::アップデート
更新喪失:lost update::~
条件:condition::~
条件付き:conditional::~
	〜でない:unconditional~
条態:condition::~
格納-:store::~
	格納-済み:stored::~
	格納-法:storing::~
格納域:store::~
記憶域:storage::~::ストレージ
蓄積:storage::~::ストレージ
検出-:detect:~
検出:detection:~
検分-:inspect:~
検分:inspection:~
検査-:check:~
検査:check:~
検索:search:~
検索取得-:retrieve::~
検索取得:retrieval::~
構成子:construct::~
構築-:construct:~
再構築-:reconstruct:~
再構築:reconstruction:~
構造:structure:~
機器:device:~:::デバイス
次元:dimension:~
段階:stage:~
比較-:compare::~
比較:comparison::~
活動:activity::~
消去-:erase:~
消費-:consume:~
消費量:consumption:~
準備-:prepare:~
無視-:ignore::~
無限:infinite:~
状態:state::~::ステート
状態変更:state-changing::~::ステート変更
stateless::::ステートレス
	無状態の:stateless な:::ステートレスな
	状態を持たない
状態0:status::状態°::ステータス
状態code:status code::状態° code:状態°コード:ステータスコード
状態行:status line::状態°行::ステータス行
	状態指示〜／状態識別〜
環境:environment:~
環境設定-:configure::~
環境設定:configuration::~
生の:raw:~
生産-:produce:~
画像:image:~
疑似:pseudo:~
発行-:publish:~
発行:publication:~
発行0-:make:発行
発行0:making:発行
登録-:register::~
	登録-済み:registered
登録:registration::~
登記簿:registry:::レジストリ
監視-:monitor::~::モニタ
監視器:monitor::~::モニタ
盲目的:blind::~
相対:relative::~
相対的:relative::~
相違-:differ:~
相違化-:differentiate:区別
相違す:differ す:異な
	相違し:differ し:異なり
相違点:differences:~
相違:differences:~
	異なる:different:~
省略:omit:~
瞬間:moment:~
知覚-:perceive:~
	短い:short:~
短縮-:shorten:~
破壊-:destroy::~
破棄-:discard::~
確立-:establish::~
確立:establishing::~
移動-:move:~
種類:kind:~
稼働-:run:~
稼働中の:running:~
空間:space:~
等価:equivalent:~
算出-:compute:~
算術的:arithmetic:~
算術:arithmetic:~
管理-:manage:~
管理:management:~
変更管理者:change controller:~
組織:organization:~
節約-:save:~
範囲:range::~
範囲単位:range unit::~
部分範囲:subrange::~
終了-:terminate:~
	終端-:terminate:~
終了:termination:~
再結合-:recombine:~
結合-:combine:~
組合わせ:combination:組み合わせ
組合わさ:combine さ:組み合わさ
絶対:absolute::~
継承-:inherit:~
継承:inheritance:~
継続-:continue:~
続行-:proceed:~
維持-:retain:~
維持させ:sustain し:~
	維持し:retain し:~
保守-:maintain:~
保守:maintenance:~
縛られ:tie され:~
背後:behind:~
自動:automatic:~
自動化-:automate:~
自動化:automated:~
自動的:automatic:~
表出し:express:表し
表出され:express され:表され
表出する:express する:表す
表現-:represent::~
表現:representation::~
表示:display:~
複製:copy:~
要素:element::~
視野:scope:~
観測-:observe:~
	観測-可能:observable:~
言語:language::~
計測:measure:~
記憶-:remember:~
記録-:record:~
設定-:set:~
設定:setting:~
評価-:evaluate:~
評価:evaluation:~
試行-:try:~
再試行-:retry::~
再試行:retrying::~
誘発-:trigger:~
調整-:adjust:~
識別:identification::~
識別-:identify::~
	識別-法:identifying
	識別されない:unidentified
	識別-可能:identifyable
識別子:identifier::~
警告:warning::~
警告-:warn::~
	負:negative:~
負荷:load:~
過負荷:overload:~
	責を負う:responsible:~
資格証:credentials::資格証明情報::クレデンシャル
起動-:initiate:~
起動させ:initiate し:~
超過-:exceed:~
近似:approximation:~
追加-:add:~
追加:addition:~
追加の:additional:~
透過性:transparency::~
透過的:transparent::~
逐語的:verbatim:~
連合-:federate:~
進捗:progress:~
進捗状況:progress:~
	遅い:slow な:~
遅延:delay::~
演算:operation:~
演算子:operator:~
運用-:operate:~
運用:operation:~
運用上の:operational:~
運用者:operator:~
過去:past:~
過度の:excessive な:~
過程:process:~
遭遇-:encounter:~
選定-:select::~
選定用:selecting::~
選定:selection::~
被選定:selected::~
選択的:selective::~
選択-:choose:~
選択:choice:~
選択肢:choice:~
部位:portion:~
部分的:partial::~
配備-:deploy:~
配備:deployment:~
重み:weight::~
量:amount:~
長さ:length:~
	長さゼロ:zero-length:~
開く:open する::~
開始-:start:~
関数:function:~
閲覧-:browse:~:::ブラウズ
閲覧:browsing:~:::ブラウジング
階層:hierarchy:~
階層的:hierarchical:~
隣接点:neighbor::~
集合:set:~
頁:page:ページ
順序:order:~
領域:region:~
頻繁:frequent:~
類別:category:~
高度:advance:~
鮮度:freshness::~
`;


/*
	●指示語
常に:always
今や:now
再び:again
すでに:already
最後に:finally
最終的:eventual
先立つ:prior
〜に先立って／先に／事前に／~~直前:prior to〜
最早〜ない:no longer
後続の:subsequent
両／両者:both
次:next
残りの:remaining
残りの部分:remainder
少数の:few
後続-:follow
前後:around
前者:former
後者:latter
最初:first
最後:last
次の:the following
この:this
その:that
それらの:those
それらの:their
これらの:these
それら:they
すべての:all
そのような:such／:these／...
全面的に:entire に
一部分
一部／部分
個／つ:one／two／three／four／five
2 〜:two-
3 〜:three-
個目／番目:first／second／third
複数:more than one
各:each
ほぼ:almost
多くの:many
ほとんど／大部分の:most
少しばかり:slightly
最も:most
多種多様な:variety
様々な:variety
何であれ:whichever
自身:itself
同じ:same
一致:identical
別々の:separate
他の:other
以外の:other than
他の場合:otherwise
〜を超えて:beyond
数種の:several
全体:entire
何か:something
一部の:some
の一部:some of
部分:part
等々:etc
1 つ以上は:at least one
よく／ことが多い:often
時には:occasionally
各所／他所
沿いにある:along the chain
逆:reverse
近い:near
総:total
小さな:small
様々な:various
〜越しの:over
下:below
上:above
通:through
間:during
時経過:over time

	●動詞
高める:increase させる
生じ:occur し
生じる:occur する
加えて，In addition
予め:in advance
括って:surround:
挙げる:list
望ましい:desirable
考慮-:regard
知-:know
置-
置く／場所:place
考え:thinking／suggested
高める:increase させる
持-:have
働かな:work しな
働ける:work でき
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
得られ／取得:obtain され
remain
所与の:given
与え:give
得る:obtain
応える:meet
求めに応じて
行っ
行われ
通して渡され:pass through
除いて:except
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
依頼:ask
note
示-:show

	●
何故なら:because
とりわけ:especial
違って、:Unlike
〜に基づく:based
べき:should
意識-:be aware
~logをとる:~logging
場合によっては:possibly
	高い:high
言い換えれば、in other words
しかしながら:however
に注意。~note~that
〜に関する／関して:regarding／regard／with respect to
〜に関わらず:regardless
〜するつもりがある:willing
〜するつもりがない:unwilling
則ってin accordance with／accord with／according to
OS:operateing system
例：:e.g.
同様に:likewise／:similarly
思しきもの:supposedly:
おそらく:perhaps
しかしながら:however
したがって:thus
したがって:therefore
よって:hence
代わりに:instead
何故なら:because
その時々:on occasion
因る:due to
~~目的:sake:目的
おそれ:fear
が可能になる
し得ないincapable
保つ
年:year
秒数:seconds
等しく:equal に
依然として:still
例えば:for example
例:example
例：:e.g.
優先される:precedence を take する
能力を備えている:be capable of
（〜に備わる能力）
決して:never

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
必要とされ:necessary
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
意図されずに:unintentional
期間:period／period of time
源:source:ソース
表~table
誤り:wrong
長く／長い~long
電網
一式:set
〜に利するため:on behalf of

*/




/*
h.Accept:~7231#section-5.3.2\n\
h.Accept-Charset:~7231#section-5.3.3\n\
h.Accept-Encoding:~7231#section-5.3.4\n\
h.Accept-Language:~7231#section-5.3.5\n\
h.Age:~7234#section-5.1\n\
h.Allow:~7231#section-7.4.1\n\
h.Content-Encoding:~7231#section-3.1.2.2\n\
h.Content-Language:~7231#section-3.1.3.2\n\
h.Content-Location:~7231#section-3.1.4.2\n\
h.Content-Type:~7231#section-3.1.1.5\n\
h.Date:~7231#section-7.1.1.2\n\
h.Expect:~7231#section-5.1.1\n\
h.From:~7231#section-5.5.1\n\
h.Location:~7231#section-7.1.2\n\
h.Max-Forwards:~7231#section-5.1.2\n\
h.MIME-Version:~7231#appendix-A.1\n\
h.Referer:~7231#section-5.5.2\n\
h.Retry-After:~7231#section-7.1.3\n\
h.Server:~7231#section-7.4.2\n\
h.User-Agent:~7231#section-5.5.3\n\
h.Vary:~7231#section-7.1.4\n\
h.Transfer-Encoding:~7230#section-3.3.1\n\
h.Content-Length:~7230#section-3.3.2\n\
h.TE:~7230#section-4.3\n\
h.Trailer:~7230#section-4.4\n\
h.Host:~7230#section-5.4\n\
h.Via:~7230#section-5.7.1\n\
h.Connection:~7230#section-6.1\n\
h.Upgrade:~7230#section-6.7\n\
h.Close:~7230#section-8.1\n\
h.ETag:~7232#section-2.3\n\
h.Last-Modified:~7232#section-2.2\n\
h.If-Match:~7232#section-3.1\n\
h.If-None-Match:~7232#section-3.2\n\
h.If-Modified-Since:~7232#section-3.3\n\
h.If-Unmodified-Since:~7232#section-3.4\n\
h.If-Range:~7233#section-3.2\n\
h.Range:~7233#section-3.1\n\
h.Accept-Ranges:~7233#section-2.3\n\
h.Content-Range:~7233#section-4.2\n\
h.Cache-Control:~7234#section-5.2\n\
h.Pragma:~7234#section-5.4\n\
h.Authorization:~7235#section-4.2\n\
h.Proxy-Authorization:~7235#section-4.4\n\
h.WWW-Authenticate:~7235#section-4.1\n\
h.Proxy-Authenticate:~7235#section-4.3\n\
h.Warning:~7234#section-5.5\n\
h.Keep-Alive:~7230#appendix-A.1.2\n\
h.Expires:~7234#section-5.3\n\

	st_hrefs: {
'1xx': '~7231#section-6.2',
'2xx': '~7231#section-6.3',
'3xx': '~7231#section-6.4',
'4xx': '~7231#section-6.5',
'5xx': '~7231#section-6.6',
'100': '~7231#section-6.2.1',
'101': '~7231#section-6.2.2',
'200': '~7231#section-6.3.1',
'201': '~7231#section-6.3.2',
'202': '~7231#section-6.3.3',
'203': '~7231#section-6.3.4',
'204': '~7231#section-6.3.5',
'205': '~7231#section-6.3.6',
'206': '~7233#section-4.1',
'214': '~7234#section-5.5',
'300': '~7231#section-6.4.1',
'301': '~7231#section-6.4.2',
'302': '~7231#section-6.4.3',
'303': '~7231#section-6.4.4',
'304': '~7232#section-4.1',
'305': '~7231#section-6.4.5',
'306': '~7231#section-6.4.6',
'307': '~7231#section-6.4.7',
'308': '~7538#section-3',
'400': '~7231#section-6.5.1',
'401': '~7235#section-3.1',
'402': '~7231#section-6.5.2',
'403': '~7231#section-6.5.3',
'404': '~7231#section-6.5.4',
'405': '~7231#section-6.5.5',
'406': '~7231#section-6.5.6',
'407': '~7235#section-3.2',
'408': '~7231#section-6.5.7',
'409': '~7231#section-6.5.8',
'410': '~7231#section-6.5.9',
'411': '~7231#section-6.5.10',
'412': '~7232#section-4.2',
'413': '~7231#section-6.5.11',
'414': '~7231#section-6.5.12',
'415': '~7231#section-6.5.13',
'416': '~7233#section-4.4',
'417': '~7231#section-6.5.14',
'426': '~7231#section-6.5.15',
'500': '~7231#section-6.6.1',
'501': '~7231#section-6.6.2',
'502': '~7231#section-6.6.3',
'503': '~7231#section-6.6.4',
'504': '~7231#section-6.6.5',
'505': '~7231#section-6.6.6'

m.CONNECT:~7231#section-4.3.6\n\
m.DELETE:~7231#section-4.3.5\n\
m.GET:~7231#section-4.3.1\n\
m.HEAD:~7231#section-4.3.2\n\
m.OPTIONS:~7231#section-4.3.7\n\
m.POST:~7231#section-4.3.3\n\
m.PUT:~7231#section-4.3.4\n\
m.TRACE:~7231#section-4.3.8\n\

wc.110:~7234#section-5.5.1\n\
wc.111:~7234#section-5.5.2\n\
wc.112:~7234#section-5.5.3\n\
wc.113:~7234#section-5.5.4\n\
wc.199:~7234#section-5.5.5\n\
wc.214:~7234#section-5.5.6\n\
wc.299:~7234#section-5.5.7\n\

qdir.max-age:~7234#section-5.2.1.1\n\
sdir.max-age:~7234#section-5.2.2.8\n\
qdir.max-stale:~7234#section-5.2.1.2\n\
qdir.min-fresh:~7234#section-5.2.1.3\n\
sdir.must-revalidate:~7234#section-5.2.2.1\n\
qdir.no-cache:~7234#section-5.2.1.4\n\
sdir.no-cache:~7234#section-5.2.2.2\n\
qdir.no-store:~7234#section-5.2.1.5\n\
sdir.no-store:~7234#section-5.2.2.3\n\
qdir.no-transform:~7234#section-5.2.1.6\n\
sdir.no-transform:~7234#section-5.2.2.4\n\
qdir.only-if-cached:~7234#section-5.2.1.7\n\
sdir.private:~7234#section-5.2.2.6\n\
sdir.proxy-revalidate:~7234#section-5.2.2.7\n\
sdir.public:~7234#section-5.2.2.5\n\
sdir.s-maxage:~7234#section-5.2.2.9\n\


／c.chunked:~7230#section-4.1\n\
／c.compress:~7230#section-4.2.1\n\
／c.deflate:~7230#section-4.2.2\n\
／c.gzip:~7230#section-4.2.3\n\
／c.application/https:~7230#section-8.3.2\n\
／c.message/https:~7230#section-8.3.1\n\
／c.multipart/byteranges:~7233#multipart/byteranges\n\
	■XXXX\n\
IETF Review:~5226#section-4.1\n\
著作者連絡先:~723X#authors-addresses\n\
二重引用符:~723X#P.DQUOTE\n\
	■7230\n\
〜~UA:~7230#user-agent\n\
~URI:~7230#URI\n\
〜~stateless:~7230#stateless\n\
／~chunked:~7230#chunked-transfer-coding\n\
／~chunked転送~符号法:~7230#chunked-transfer-coding\n\
／~chunk拡張:~7230#chunk-extension\n\
〜~client:~7230#client\n\
〜~gateway:~7230#gateway\n\
／~header:~7230#section-3.2\n\
〜~header値:~7230#header-value\n\
〜~header名:~7230#header-name\n\
〜~header節:~7230#header-section\n\
〜~major:~7230#major-version\n\
〜~major~version:~7230#major-version\n\
〜~minor:~7230#minor-version\n\
〜~minor~version:~7230#minor-version\n\
／~message:~7230#section-3\n\
／~message本体:~7230#message-body\n\
／~message本体~長さ:~7230#body-length\n\
／~pipeline:~7230#pipeline\n\
／~pipeline化:~7230#pipeline\n\
〜~proxy:~7230#proxy\n\
〜~server:~7230#server\n\
／	~status行0:~7230#status-line\n\
〜~target~URI:~7230#target-URI\n\
〜~target資源:~7230#target-resource\n\
〜~trailer:~7230#trailer\n\
〜~tunnel:~7230#tunnel\n\
／~version:~7230#version\n\
／~protocol~version:~7230#version\n\
〜~version番号:~7230#version-number\n\
〜上流:~7230#upstream\n\
〜下流:~7230#downstream\n\
不完全:~7230#incomplete\n\
完全:~7230#incomplete\n\
〜中継者:~7230#intermediary\n\
〜内方:~7230#inbound\n\
〜受信者:~7230#recipient\n\
〜外方:~7230#outbound\n\
／実効~要請~URI:~7230#effective-request-URI\n\
／形式変換-:~7230#transform\n\
／形式変換:~7230#transform\n\
〜応答:~7230#response\n\
／応答~分割:~7230#response-splitting\n\
／持続的~接続:~7230#persistent-connection\n\
〜接続~option:~7230#connection-option\n\
〜最終~転送~符号法:~7230#final-transfer-coding\n\
〜本体~長さ:~7230#body-length\n\
〜生成:~7230#generate\n\
〜生成-:~7230#generate\n\
〜生成する:~7230#generate\n\
〜生成され:~7230#generate\n\
〜生成し:~7230#generate\n\
〜生成元~server:~7230#origin-server\n\
／空白:~7230#linear-whitespace\n\
	線形空白:~7230#section-3.2.3\n\
〜端点:~7230#endpoint\n\
〜端点間:~7230#end-to-end\n\
〜端点間~header:~7230#end-to-end-header\n\
〜結合-:~7230#combine-headers\n\
	要請:~7230#request\n\
〜要請:~7231#request\n\
〜~HTTP要請:~7231#request\n\
／要請~target:~7230#request-target\n\
／要請~密入:~7230#request-smuggling\n\
／転送~符号法:~7230#transfer-coding\n\
〜転送~符号法~名:~7230#p.transfer-coding\n\
〜送信者:~7230#sender\n\
〜連鎖:~7230#chain\n\
〜隣点間:~7230#hop-by-hop\n\
〜隣点間~header:~7230#hop-by-hop-header\n\
〜~payload本体:~7230#payload-body\n\
〜~payload:~7230#payload-body\n\
〜形式変換proxy:~7230#transforming-proxy\n\
〜相対~参照:~7230#p.relative-part\n\
	~3986#section-4.2\n\
〜素片:~7230#p.fragment\n\
〜素片~識別子:~7230#p.fragment\n\
／絶対~形:~7230#section-5.3.2\n\
〜~close_接続~option:~7230#close-connection-option\n\
〜~HTTP11:~7230#version-1.1\n\
／~list演算子:~7230#section-7\n\
／圧縮~符号法:~7230#compression-codings\n\
〜事由~句:~7231#reason-phrase\n\
〜既定で~cache可能である:~7231#cacheable-by-default\n\
\n\
	■7231\n\
／資源:~7231#resource\n\
〜表現:~7231#representation\n\
〜選定された表現:~7231#selected-representation\n\
／~metadata:~7231#section-3.1\n\
／表現~metadata:~7231#section-3.1\n\
／媒体~型:~7231#media-type\n\
／~charset:~7231#section-3.1.1.2\n\
／内容~符号法:~7231#content-coding\n\
〜内容~符号法~名:~7231#p.content-coding\n\
言語~tag:~7231#language-tag\n\
〜媒体~型~parameter:~7231#p.parameter\n\
〜媒体~範囲:~7231#p.media-range\n\
	資源の識別処理:~7231#section-3.1.4\n\
／表現~data:~7231#representation-data\n\
／表現~header:~7231#representation-header\n\
〜~payload~header:#payload-headers\n\
〜内容~折衝:~7231#content-negotiation\n\
／~proactive折衝:~7231#proactive-negotiation\n\
／~reactive折衝:~7231#reactive-negotiation\n\
／要請~method:~7231#section-4\n\
／冪等~method:~7231#idempotent-mehtod\n\
／冪等:~7231#idempotent-mehtod\n\
／安全~method:~7231#safe-mehtod\n\
／安全:~7231#safe-mehtod\n\
／安全な:~7231#safe-mehtod\n\
／要請~header:~7231#request-header\n\
〜~server-wide:~7231#server-wide\n\
／~proactive折衝~header:~7231#section-5.3\n\
	条件付き要請~header:~7231#section-5.2\n\
	＊条件付き要請~header:~7232#section-3\n\
〜~100cont 期待:~7231#100-continue\n\
／品質~値:~7231#qvalue\n\
／品質値:~7231#qvalue\n\
／	~status-code:~7231#status-code\n\
／状態code:~7231#status-code\n\
／応答~状態code:~7231#status-code\n\
／応答~header:~7231#responce-header\n\
／制御~data:~7231#control-data\n\
〜~messageの出生日時:~7231#origination-date\n\
	日時~形式:~7231#section-7.1.1.1\n\
／日時:~7231#section-7.1.1\n\
〜時計:~7231#clock\n\
〜首~資源:~7231#primary-resource\n\
〜製品~識別子:~7231#product-identifier\n\
／検証子~header:~7231#validator-header\n\
／~cache可能:~7231#cacheable\n\
〜応答class:~7231#responce-class\n\
／~method:~7231#section-4\n\
／要請の意味論:~7231#section-4\n\
／制御~header:~7231#section-5.1\n\
／指紋収集:~7231#section-9.7\n\
	＊条件付き~header:~7231#section-5.2\n\
〜選定用~header:~7231#selecting-header\n\
\n\
	■7232\n\
／条件付き~header:~7232#conditional-request-header\n\
／条件付き要請~header:~7232#conditional-request-header\n\
／事前条件~header:~7232#conditional-request-header\n\
〜条件付き:~7232#conditional-request\n\
〜条件付き要請:~7232#conditional-request\n\
／検証子:~7232#validator\n\
〜強い検証子:~7232#strong-validator\n\
〜弱い検証子:~7232#weak-validator\n\
〜強い比較:~7232#strong-comparison\n\
〜弱い比較:~7232#weak-comparison\n\
〜評価-:~7232#section-5\n\
／改変~日時:~7232#section-2.2\n\
〜条件付きに:~7232#make-conditional\n\
／事前条件:~7231#preconditions\n\
	事前条件:~7232#preconditions\n\
\n\
	■7233\n\
\n\
／範囲単位:~7233#p.range-unit\n\
／範囲~要請:~7233#section-3\n\
／部分的~要請:~7233#section-3\n\
／部分的~応答:~7233#partial-responce\n\
〜部分的:~7233#partial-responce\n\
\n\
	■7234\n\
\n\
／鮮度~情報:~7234#section-4.2.1\n\
〜~cache:~7234#cache\n\
／~cache検証:~7234#section-4.3\n\
／~cache検証~要請:~7234#section-4.3.1\n\
〜共有~cache:~7234#shared-cache\n\
〜私用~cache:~7234#private-cache\n\
〜~cache制御~指令:~7234#cache-directive\n\
〜警告~text:~7234#warning-text\n\
\n\
	■7235\n\
\n\
〜資格証:~7235#credentials\n\
*/