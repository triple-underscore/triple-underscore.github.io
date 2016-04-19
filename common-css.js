
COMMON_DATA.page_state_key = '___CSS';

var source_data = {
	init: function(spec_num){
		this.words_table1 += Util.textData('words_table1');
		this.words_table += Util.textData('words_table');

		var data = this.href_data + Util.textData('_link_map');
		var spec_rxp = new RegExp('~' + spec_num, 'g');
		this.href_data_map = Util.get_mapping(data.replace(spec_rxp, ''));

		this.html = E('MAIN').innerHTML;

//		Util.switchWords(3, this);
//		Util.createWordSwitch(this);
	},

	html: '',
	levels: '英語主体:英語寄り:漢字+英語:漢字主体:カナ主体',

	class_map: {
		r: 'ref',
		t: 'type',
		p: 'property',
		prod: 'production', // protocol element
		_: 'trans-note',
	},

	tag_map: {
		c: 'code',
		var: 'var',
		p: 'code',
		t: 'code',
		_: 'span',
	},

	rxp2:
/◎[^<◎`]*|`(.+?)([$@\^])(\w*)(?::([\w\-]+))?/g,

	callback: function(mapping1){
		var st_phrase = this.st_phrase;
		var st_hrefs = this.st_hrefs;
		var href_data_map = this.href_data_map || {};

		var class_map = this.class_map;
		var tag_map = this.tag_map;

		E('MAIN').innerHTML = Util.replaceWords1(
			this.html.replace(this.rxp2, create_html),
			mapping1
		);

		// 目次構築
		rebuildToc('MAIN', '_toc_list0');
		return;

		function create_html(match, key, indicator, klass, values){

if(!indicator) {//◎
	return '<span lang="en">' + match.slice(1) + '<\/span>';
}

var text = key;
var href = href_data_map[klass ? (klass + '.' + key) : key] || '';
var classname = class_map[klass];
var tag = tag_map[klass];

switch(klass){
case '': // plain
	if(indicator === '^') return mapping1[key];// remap
//		href = href_data_map[key];
	break;
case 'r': // ref
	text = '[' + key + ']';
	href = '~723X#ref-' + key;
	break;
case 'sec': //
	href = '#section-' + key;
	text = key + ' ~~節';
	break;
case 'p':
	href += '#p.' + key;
	break;
case 'c': //
	break;
case 'var':
	break;
//typedef-integer, number-value
case '_':
	text = '【' + key + '】';
	break;
default:
	if(!classname) return match;
//		text = key;
}

classname = classname ? ' class="' + classname + '"' : '';
if(tag) {
	text = '<' + tag + classname + '>' + text + '</' + tag + '>';
}

if(href){
	switch(indicator){
	case '^':
		break;
	case '$':
		text = '<a href="' + href + '">' + text + '<\/a>';
		break;
	case '@':
//		href = href_data_map[key] || href;
		text = '<dfn id="' + href.slice(1) + '">' + text + '<\/dfn>';
		break;
	default:
		console.log(match);
		return match;
	}
}
if(!href && indicator === '$') console.log(match); // check error

//	if(!href) console.log(match); // check error
return text;


		}
	},

/** links */
	href_data: '\n\
\n\
	propertis \n\
\n\
display:~DISPLAY#propdef-display\n\
\n\
\n\
	value-types\n\
\n\
t.integer:~CSSVAL#typedef-integer\n\
\n\
\n\
	＊\n\
	■XXXX\n\
	■CSSVAL\n\
算出値:~CSSVAL#user-agent\n\
\n\
',

/** words */

	words_table1: '\
\n\
CSSVAL:css-values-ja.html\n\
\n\
',

/** Words */

	words_table: '\n\
such::そのような\n\
常に:always:~\n\
	伝え:inform し:~\n\
	伝える:inform する:~\n\
	例:example:~\n\
	例えば:for example:~\n\
	促す:prompt する:~\n\
内包-:include:~\n\
切替:switching::切り替え\n\
切替わる:switch する::切り替わる\n\
切替え:switch し::切り替え\n\
切替えら:switch さ::切り替えら\n\
切替える:switch する::切り替える\n\
割当てら:allocate さ:割り当てら\n\
割当てる:allocate する::割り当てる\n\
	取戻せ:reclaim でき:取り戻せ\n\
	取戻され:reclaim され:取り戻され\n\
取扱い:handling:取り扱い\n\
取扱う:handle する:取り扱う\n\
取扱え:handle でき:取り扱え\n\
取扱える:handle できる:取り扱える\n\
取扱っ:handle し:取り扱っ\n\
取扱わ:handle し:取り扱わ\n\
取扱われ:handle され:取り扱われ\n\
含ま:include し:~\n\
含ませ:include させ:~\n\
含まれ:include され:~\n\
含む:include する:~\n\
含めて:include して:~\n\
	呼ばれ:call され:~\n\
呼出す:invoke する:呼び出す\n\
呼出し:invoking:呼び出し\n\
	呼出し:invocation:~\n\
埋込まれ:embed され:~\n\
埋込む:embed する:~\n\
埋込み:embedded:~\n\
	始まる:begin する:~\n\
孕む:involve する:~\n\
孕まな:involve しな:~\n\
孕んで:involve して:~\n\
導かれ:lead され:~\n\
導き:lead し:~\n\
	導く:lead する:~\n\
	扱い:treatment:~\n\
扱う:treat する:~\n\
扱え:treat でき:~\n\
扱っ:treat し:~\n\
扱わ:treat し:~\n\
扱われ:treat され:~\n\
	指す:refer する:~\n\
	指し:refer し:~\n\
	指され:refer され:~\n\
挙動:behavior:ふるまい\n\
挙動する:behave する:ふるまう\n\
改め:alterでき:~\n\
改めら:alterされ:~\n\
改める:alterする:~\n\
書込み:write::書き込み\n\
書込め:write でき::書き込め\n\
書換え:rewrite し::書き換え\n\
書換えて:rewrite して::書き換えて\n\
書換える:rewrite する::書き換える\n\
書換られ:rewrite され::書き換られ\n\
読取っ:read し::読み取っ\n\
読取ら:read し::読み取ら\n\
読取られ:read され::読み取られ\n\
読取り:read::読み取り\n\
読取る:read する::読み取る\n\
読取れ:read でき::読み取れ\n\
読取可能:readable::読み取り可能\n\
望まず:wish せず:~\n\
望まれ:wish され:~\n\
望む:wish する:~\n\
望んで:wish して:~\n\
	求めてwant して:~\n\
	望ましく(un)desirable\n\
	求めら:desire さ:~\n\
欲され:desire され:~\n\
欲して:desire して:~\n\
欲する:desire する:~\n\
	残っ:remain し:~\n\
決めた:decide した:~\n\
決める:decide する:~\n\
決めれ:decide でき:~\n\
渡され:pass され:~\n\
渡す:pass する:~\n\
	満たさ:satisfy さ:~\n\
	満たす:satisfy する:~\n\
	満たせ:satisfy でき:~\n\
	満たそ:satisfy しよ:~\n\
充足さ:satisfy さ:満たさ\n\
充足し:satisfy し:満たし\n\
充足しな:satisfy しな:満たさな\n\
充足しよ:satisfy しよ:満たそ\n\
充足する:satisfy する:満たす\n\
充足でき:satisfy でき:満たせ\n\
	知らせ:know させ:~\n\
	知らな:know しな:~\n\
	知る:know する:~\n\
	知れる:know できる:~\n\
結付け:association:結び付け\n\
結付けて:associate して:結び付けて\n\
結付けら:associate さ:結び付けら\n\
結付ける:associate する:結び付ける\n\
結付法:associating:結び付け\n\
	落とさ:drop さ:~\n\
	行う:perform する:~\n\
	行える:perform できる:~\n\
	行っ:perform し:~\n\
	行わ:perform さ:~\n\
見なさ:consider さ:~\n\
見なし:consider し:~\n\
見なす:consider する:~\n\
見なせ:~consider でき:~\n\
	見よ:see:~\n\
	前提:assumption:~\n\
見出され:find され:~\n\
見出す:find する:~\n\
見出せ:find でき:~\n\
見出して:find して:~\n\
見出させ:find させ:~\n\
試み:attempt:~\n\
試みた:attempt した:~\n\
試みて:attempt して:~\n\
試みら:attempt さ:~\n\
試みる:attempt する:~\n\
論じる:discuss する:~\n\
論じた:discuss した:~\n\
論じら:discuss さ:~\n\
論点:discussion:~\n\
	足る:enough:~\n\
述べ:describe し:~\n\
述べら:describe さ:~\n\
述べる:describe する:~\n\
説明0:description:説明\n\
記述:description:~\n\
記述-:describe:~\n\
	運ばせ:carry させ::~\n\
	運ばれ:carry され::~\n\
	運ぶ:carry する::~\n\
	運べる:carry できる:~\n\
避けら:avoid さ:~\n\
避ける:avoid する:~\n\
	回避法:avoidance:~\n\
重なっ:overlap し:~\n\
隠す:hide する:~\n\
隠され:hide され:~\n\
隠し:hide し:~\n\
	騙す:trick する:~\n\
	騙せ:trick でき:~\n\
\n\
\n\
\n\
\n\
方向:direction::~\n\
直接的:direct:~\n\
	直接的に:directly:~\n\
間接的:indirect:~\n\
間接的な:indirect:~\n\
双方向:bidirectional::~\n\
	指図-:instruct:~\n\
member::::メンバ\n\
	subject::対象\n\
access::::アクセス\n\
accessibility::::アクセス容易性\n\
	agent::::エージェント\n\
algo:algorithm:::アルゴリズム\n\
app:application:::アプリケーション\n\
応用:application::~::アプリケーション\n\
	応用-:apply:::\n\
適切:appropriate:~\n\
適用:apply:~\n\
適用可能:applicable:~\n\
適用性:applicability:~\n\
	approach::::アプローチ\n\
	archive::::アーカイヴ\n\
	asterisk::::アスタリスク\n\
authoring::::オーサリング\n\
	backslash::::バックスラッシュ\n\
based:-based:に基づく::ベースの\n\
	binary::::バイナリ\n\
block::::ブロック\n\
	bookmark::::ブックマーク\n\
browser::::ブラウザ\n\
byte::::バイト\n\
	cache::::キャッシュ\n\
	cached:::cache 済み:キャッシュ済み\n\
	cacheable:::cache 可能:キャッシュ可能\n\
	caching:::cache 処理:キャッシュ処理\n\
	class::::クラス\n\
	clear::::クリア\n\
	client::::クライアント\n\
code::::コード\n\
colon::::コロン\n\
comma::::カンマ\n\
	comma区切りの:comma-separated\n\
comment::::コメント\n\
	component::::コンポーネント\n\
computer::::コンピュータ\n\
container:::コンテナ\n\
cost::::コスト\n\
crash::::クラッシュ\n\
custom::::カスタム\n\
data::::データ\n\
database::::データベース\n\
dialog::::ダイアログ\n\
domain::::ドメイン\n\
	encapsulate::::カプセル化\n\
	encapsulation::::カプセル化\n\
entry::::エントリ\n\
error::::エラー\n\
	~err::\n\
escaping::::エスケープ処理\n\
escape::::エスケープ\n\
event::::イベント\n\
	族:family:~:::ファミリ\n\
	fetch::::取得\n\
field::::フィールド\n\
file::::ファイル\n\
filter::::フィルタ\n\
	firewall::::ファイアウォール\n\
flow::::フロー\n\
	流れる:flow する:~\n\
focus::::フォーカス\n\
folder::::フォルダ\n\
form::::フォーム\n\
group::::グループ\n\
guide::::ガイド\n\
handler::::ハンドラ\n\
header::::ヘッダ\n\
	hex::16 進\n\
	hexadecimal::16 進数\n\
host::::ホスト\n\
instance::::インスタンス\n\
interface::::インタフェース\n\
key::::キー\n\
keyword::::キーワード\n\
label::::ラベル\n\
level::::レベル\n\
library::::ライブラリ\n\
link::::リンク\n\
list::::リスト\n\
	listen::::リッスン\n\
	listener::::リスナ\n\
literal::::リテラル\n\
	log::::ログ\n\
loop::::ループ\n\
	machine::::マシン\n\
	機械:machine:~:::マシン\n\
	mail::::メール\n\
	malicious:::悪意のある\n\
mark::::マーク\n\
memory::::メモリ\n\
metadata::::メタデータ\n\
method::::メソッド\n\
mode::::モード\n\
model::::モデル\n\
native::::ネイティブ\n\
network::::ネットワーク\n\
	normative::::規範的\n\
object::::オブジェクト\n\
	octet::::オクテット\n\
option::::オプション\n\
	桁溢れ:overflow::~::オーバーフロー\n\
padding::::パディング\n\
pair::::ペア\n\
parameter::::パラメタ\n\
path::::パス\n\
pattern::::パタン\n\
	percent::::パーセント\n\
	句:phrase:::フレーズ\n\
	pipe-and-filter:パイプ＆フィルタ\n\
pointer::::ポインタ\n\
	policy::::ポリシー\n\
port::::ポート\n\
privacy::::プライバシー\n\
私的:private:~:::プライベート\n\
program::::プログラム\n\
	programmatic::::プログラム的\n\
	programming::::プログラミング\n\
prop::::プロパティ\n\
	proprietary::::プロプライエタリ\n\
protocol::::プロトコル\n\
proxy::::プロキシ\n\
	query::::クエリ\n\
	quote::::クォート\n\
引用符:quote:::~:クォート\n\
二重引用符:double quote::~::ダブルクォート\n\
	括る:quote する:~::クォートする\n\
	括られ:quote され:~::クォートされ\n\
random::::ランダム\n\
	render::::レンダー\n\
	rendering::::レンダリング\n\
reset::::リセット\n\
risk::::リスク\n\
	scalability::::スケーラビリティ\n\
	schedule::::スケジュール\n\
scheme::::スキーム\n\
スキーム:scheme::~\n\
script::::スクリプト\n\
scripting::::スクリプティング\n\
	serve::::サービス供与\n\
	server::::サーバ\n\
	service::::サービス\n\
site::::サイト\n\
size::::サイズ\n\
software::::ソフトウェア\n\
source::::ソース\n\
	明言:state:~\n\
	位置付け:status:~\n\
	status::::ステータス\n\
stream::::ストリーム\n\
	subset::::サブセット\n\
	subtag::::下位タグ\n\
support::::サポート\n\
system::::システム\n\
table::::テーブル\n\
tag::::タグ\n\
target::::ターゲット\n\
task::::タスク\n\
test::::テスト\n\
text::::テキスト\n\
	textual:~textによる／~textからなる\n\
時間制限:timeout::~::タイムアウト\n\
token::::トークン\n\
tool::::ツール\n\
version::::バージョン\n\
view::::ビュー\n\
web:\n\
zero:::ゼロ\n\
ゼロ:zero::~\n\
\n\
\n\
	やりとり:interaction:~\n\
	例:example:~\n\
	例えば:for example:~\n\
	複数の:multiple:~\n\
一定の:certain:~\n\
一意的:unique:~\n\
一掃-:purge:~\n\
一時的:temporary:~\n\
一時的な:temporary:~\n\
汎的:generic:一般\n\
汎用:general-purpose:~\n\
汎用の:general-purpose:~\n\
一般的:general:~\n\
一般:common:~\n\
一般に:common に:~\n\
共通の:common:~\n\
共通して:common に:~\n\
共通する:common な:~\n\
共通的:common:~\n\
	commonly\n\
共通的な:common:~\n\
三字の:three-letter:~\n\
三桁の:three-digit:~\n\
三番目の:third:~\n\
二層:two-layer:~\n\
二桁:two-digit:~\n\
二番目の:second:~\n\
二番目:second:~\n\
上品:graceful::~\n\
上書き:override::~\n\
下層:underlying::~\n\
下層の:underlying::~\n\
不利:disadvantage:~\n\
不十分:insufficient:~\n\
不可欠:crucial:~\n\
不定:indefinite:~\n\
不明瞭に:obscure:~\n\
不法な:bogus:~\n\
不良:bad:~\n\
不要な:unwanted:~\n\
不透明:opaque::~\n\
不透明な:opaque::~\n\
不適正:improper:~\n\
並列的:parallel:~\n\
中断-:interrupt:~\n\
中断:interruption:~\n\
中核:core:~\n\
中止:abort:~\n\
中立的:neutral:~\n\
中継-:relay::~\n\
中継者:intermediary::~\n\
中間:intermediation:~\n\
主:primary::~\n\
主体:party::~\n\
主張:claim:~\n\
主流に:prevalent に:~\n\
乏しい:poor な:~\n\
予期-:expect:~\n\
期待-:expect:~\n\
期待:expectation::~\n\
予測:anticipate:~\n\
予約-:reserve::~\n\
予約済み:reserved::~\n\
予見-:believe:~\n\
	確信でき:believe する:~\n\
事例:case:~\n\
事前fetch:pre-fetch::事前 fetch:事前取得\n\
事実:fact:~\n\
理由:reason:~\n\
理由付け:reasoning:~\n\
事由:reason::~\n\
互換:compatible::~\n\
互換性:compatibility::~\n\
後方:backwards::~\n\
後方互換:backwards-compatible::~\n\
交換:exchange:~\n\
今や:now:~\n\
今後の:later:~\n\
介入-:intervene:~\n\
介在者:man-in-the-middle::~\n\
	中間者\n\
仕方:way:~\n\
仕様:spec:~\n\
仕組み:mechanism:~\n\
付加:append:~\n\
付録:Appendix:~\n\
付随-:accompany:~\n\
代わりに:instead:~\n\
代替:alternative:~\n\
代替の:alternate:~\n\
代用:substitute:~\n\
	代わるもの:replacement:~\n\
代表的な:typical:~\n\
以前:previous:~\n\
遊休:idle:~\n\
仮想:virtual::~\n\
仮装-:masquerade:~\n\
中継:intermediate::~\n\
仲介の:interveneing:~\n\
企業:corporate:~\n\
伝送-:transmit::~\n\
伝送:transmission::~\n\
伝送処理:transmitting::~\n\
回送-:forward::回送\n\
回送:forwarding::~\n\
転送:transfer::~\n\
伝送路:wire::~\n\
送達-:deliver::~\n\
送達:delivery::~\n\
伝達-:convey::~\n\
	何故なら:because:~\n\
余分な:extra:~\n\
作動中:active::~::アクティブ\n\
作動中の:active::~::アクティブな\n\
作成:create::~\n\
置換-:replace::~\n\
除去-:remove::~\n\
削除-:delete::~\n\
削除:deletion::~\n\
併合-:merge:~\n\
使役-:employ:~\n\
例外:exception:~\n\
供給-:supply:~\n\
依存-:depend:~\n\
依存:dependent:~\n\
依存関係:dependency:~\n\
独立:independent:~\n\
	依存しない:independent:~\n\
依拠-:rely:~\n\
依拠可能:reliable:~\n\
信頼性:reliability:~\n\
依然として:still:~\n\
係数:factor:~\n\
促進-:promote:~\n\
保全-:preserve:~\n\
保存:save:~\n\
保守的:conservative:~\n\
保安:security::~:セキュリティ\n\
保安上の:security::~:セキュリティ上の\n\
保安化:secure 化::~:セキュア化\n\
保安的:secure::~:セキュア\n\
保安穴:security hole::保安上の穴:セキュリティホール\n\
穴:hole::穴:ホール\n\
保管-:keep:~\n\
保持-:hold:~\n\
保証-:guarantee:~\n\
保証:assure:~\n\
保護-:protect:~\n\
保護:protection:~\n\
未保護の:unprotected:~\n\
信用-:trust::~\n\
	信用できない:untrusted:~\n\
修正:fix:~\n\
修飾-:modify:~\n\
修飾:modify:~\n\
	修飾するもの:modifier:~\n\
個々の:individual:~\n\
個人:personal:~\n\
値:value:~\n\
停止:stop:~\n\
側:side:~\n\
側面:aspect:~\n\
偶発的:accidental:~\n\
偽:false:~\n\
優先度:priority:~\n\
優先順:precedence:~\n\
元:original:~\n\
元々は:originally:~\n\
元の:original:~\n\
先行-:precede:~\n\
入力:input:~\n\
公共:public:~\n\
公開-:public 化:~\n\
公開:public:~\n\
共有-:share:~\n\
共有:shared:~\n\
内側:inside:~\n\
内包-:include:~\n\
内容:content::~\n\
内来的:inherent:~\n\
内部:internal:~\n\
冪等:idempotent::~\n\
冪等性:idempotent property::~\n\
処理-:process:処理\n\
処理:processing:~\n\
処理器:processor:~\n\
処理能力:performance:~\n\
出力:output:~\n\
	出現-:appear:~\n\
出現:appearance:~\n\
出現し:appear し:現れ\n\
出現する:appear する:現れる\n\
出生-:originate::~\n\
出生日時:origination date::~\n\
出生時:origination::~\n\
分割-:split:分割\n\
分割:splitting:~\n\
分岐:divergent:~\n\
分散-:balance:~\n\
分散型の:distributed::~\n\
分解-:decompose:~\n\
分離-:separate:~\n\
分離子:separator:~\n\
分類上の:categorization:~\n\
初期:initial:~\n\
判定基準:criteria:~\n\
判断-:deem:~\n\
別の:another:~\n\
別個の:distinct:~\n\
別名:alias::~::エイリアス\n\
利点:advantage:~\n\
利用:use:~\n\
用立てる:make use する:~\n\
利用e:usage:利用\n\
利用者:user::~::ユーザ\n\
有用:useful:~\n\
再利用:reuse:~\n\
再利用性:reusability:~\n\
誤用-:misuse:~\n\
濫用:abuse:~\n\
	濫用:abusive:~\n\
到着-:arrive:~\n\
制定-:prescribe:~\n\
制御:control::~\n\
	制御し得る:controllable:~\n\
制約-:restrict:~\n\
制約:restriction:~\n\
制限-:limit:~\n\
上限:limit:~\n\
制限:limitation:~\n\
	前後:around:~\n\
事前条件:precondition::~\n\
前者:former:~\n\
前者の:former:~\n\
副作用:side effect:~\n\
副次的:secondary:~\n\
割合:percentage:~\n\
割当-:allocate:~\n\
創出:mint:~\n\
効果:effect:~\n\
効率性:efficiency:~\n\
効率的:efficient:~\n\
効果的:effective:~\n\
実効:effective::~\n\
実効性:effectiveness:~\n\
動作-:act:~:::アクト\n\
動作:action:~:::アクション\n\
動的:dynamic:~\n\
動詞:verb:~\n\
包含-:contain:~\n\
包括的:comprehensive:~\n\
包装:wrap:~:::ラップ\n\
区分-:partition:~\n\
区切られ:delimit され::~\n\
区切り:delimitation::~\n\
区切りの:-separated:~\n\
区切る:delimit する::~\n\
区切子:delimiter::~\n\
区別-:distinguish:~\n\
十分:sufficient:~\n\
協調的:collaborative:~\n\
	単に:merely:~\n\
	単位:unit:~\n\
単独の:single:~\n\
単純:simple:~\n\
単純に:simple に:~\n\
単純化:simplify:~\n\
単語:word:~\n\
即時:immediate:~\n\
却下:reject::~\n\
厳密に:strictly:~\n\
参加-:engage:~\n\
参加者:participant:~\n\
referrer::::リファラ\n\
参照:reference::~\n\
参照元:referring:refer 元:~\n\
参照文献:references:~\n\
参考:informative:~\n\
反映:reflect:~\n\
収束:converge:~\n\
収集:gather:~\n\
取消:cancel:~\n\
取組まれ:address され:取り組まれ\n\
取組む:address する:~\n\
取込まれ:import され:取り込まれ\n\
受信-:receive::受信\n\
受信:receiving::~\n\
受信者:recipient::~\n\
受領:receipt::~\n\
送信-:send::~\n\
送信:sending::~\n\
送信者:sender::~\n\
受容:accept::~\n\
受容可能:acceptable::~\n\
受理:accept::~\n\
古い:older:~\n\
可用:available:~\n\
可用性:availability:~\n\
可能0:possible:可能\n\
不可能:impossible:~\n\
可能化-:enable:~\n\
可能化:enable:可能に\n\
不能化-:disable:不能化\n\
	無効化-／無力化:disable:無効化\n\
	可能性:possibility:~\n\
可視:visible:~\n\
可視性:visibility:~\n\
合意:consensus:~\n\
合致:match::~::マッチ\n\
照合:matching::~::マッチング\n\
同じ:same:~\n\
同一:identical:~\n\
同一性:identity:~\n\
同封-:enclose::~\n\
同意-:agree:~\n\
同時:simultaneous:~\n\
同時性:concurrency:~\n\
同時的:concurrent:~\n\
同期-:synchronize:~\n\
同期的:synchronous:~\n\
	同様に:likewise:~\n\
同義語:synonym:~\n\
名:name:~\n\
名前:name:~\n\
名前空間:namespace::~\n\
向上:improve:~\n\
改善:improve:~\n\
含意-:imply:~\n\
含意:implications:~\n\
告知:advertise:~\n\
命名-:name:~\n\
命名:naming:~\n\
品質:quality::~\n\
品質値:qvalue::~\n\
	問い:question:~\n\
問題:problem:~\n\
損なう:lose する:~\n\
損失:loss:~\n\
失われ:lost し:~\n\
回復-:recover::~\n\
回復:recovery::~\n\
回復不能:unrecoverable::~\n\
回答:answer:~\n\
対処-:work around:~\n\
対処法:workaround:~\n\
因子:factor:~\n\
困難:difficult:~\n\
図:figure:~\n\
図式:diagram:~\n\
固定的な:fixed:~\n\
固定長:fixed-length:~\n\
国別:national:~\n\
圧縮-:compress::~\n\
圧縮済み:compressed::~\n\
圧縮:compression::~\n\
下位型:subtype::~\n\
型:type::~\n\
型付け:typing:~\n\
基底:base:~\n\
堅牢:robust:~\n\
堅牢性:robustness:~\n\
報告:report:~\n\
境界:boundary::~\n\
増分:increment:~\n\
増分的:incremental:~\n\
増加-:increase:~\n\
増大-:increase:~\n\
増強-:enhance:~\n\
増強:enhance:~\n\
壊す:breakする:~\n\
壊れ:break され:~\n\
壊れた:broken:~\n\
壊れて:corrupt して:~\n\
	変わら:changeし:~\n\
	変わり:changeし:~\n\
変化-:change:~\n\
変化:changes:~\n\
変更s:changes:変更\n\
変更:change::~\n\
変更点:changes:~\n\
変換-:convert:~\n\
変換:conversion:~\n\
外側:outside:~\n\
	外部:outside:~\n\
外向けの:outgoing:~\n\
外的:external:~\n\
多様:diverse:~\n\
多様性:diversity:~\n\
多量:large amount:~\n\
大文字:uppercase::~\n\
小文字:lowercase::~\n\
大概は:presumably:~\n\
失効:expiration:~\n\
失効-:expire:~\n\
失効した:expired:~\n\
弱い:weak::~\n\
弱さ:weakness::~\n\
強い:strong::~\n\
強さ:strength::~\n\
失敗-:fail:~\n\
失敗:failure:~\n\
奨励-:encourage:~\n\
discouraged:discourageされる:奨励されない\n\
	〜ないを奨励discourage:\n\
	立証-:verify:~\n\
	立証:verification:~\n\
検証y-:verify:検証°\n\
検証y:verification:検証°\n\
検証-:validate::検証\n\
検証:validation::~\n\
検証子:validator::~\n\
妥当:valid::~\n\
有効:valid::~\n\
有効性:validity:~\n\
無効:invalid::~\n\
無効化:invalidate::~\n\
妥当でない:invalid な::~\n\
妥当性:validity::~\n\
媒体:media::~::メディア\n\
	無い:present しない:~\n\
在る:present する:~\n\
存在-:present:~\n\
不在:absence:~\n\
存在:presence:~\n\
提示-:present:~\n\
提示:presentation:~\n\
存在e-:exist:存在\n\
存在e:existence:存在\n\
安全:safe::~\n\
安全な:safe::~\n\
	安全でない:unsafe:~\n\
完了-:complete::~\n\
完了:completion::~\n\
完全:complete::~\n\
完全な:complete::~\n\
不完全:incomplete::~\n\
不完全な:incomplete::~\n\
全部的:full:~\n\
全部的な:full:~\n\
完全修飾:fully qualified:~\n\
完全性:integrity::~\n\
定義-:define:~\n\
定義:definition:~\n\
定義済みの:predefined:~\n\
再定義-:redefine:~\n\
実体:entity:~\n\
実施:practice:~\n\
実施上:practice 上:~\n\
実用性:practicality:~\n\
実用的:practical:~\n\
遂行-:perform:~\n\
遂行:performing:~\n\
実行-:execute:~\n\
実行済みで:enact されて:~\n\
実装-:implement:~\n\
実装:implementation:~\n\
実装者:implementer:~\n\
実際:actual:~\n\
実際の:actual:~\n\
宣言-:declare:~\n\
宣言的:declarative:~\n\
害:harm:~\n\
有害:harmful:~\n\
無害:harmless:~\n\
容易:easy:~\n\
容量:capacity:~\n\
寛容な:lenient:~\n\
対応-:correspond:~\n\
対応0:corresponding:対応する\n\
対応付け:mapping:~:::マッピング\n\
対応関係:mapping:~:::マッピング\n\
対話-:interact::やりとり::インタラクト\n\
対話:interaction::やりとり::インタラクション\n\
対話的:interactive::~::インタラクティブ\n\
将来の:future:~\n\
将来:future:~\n\
未来:future:~\n\
未来の:future:~\n\
尊守-:honor:~\n\
導入-:introduce:~\n\
導入:introduction:~\n\
序論:introduction:~\n\
導出-:derive:~\n\
小さな:small:~\n\
少数の:few:~\n\
尚早:premature:~\n\
尾部:trailing:~\n\
頭部:leading:~\n\
局所的:local::~::ローカル\n\
局所的な:local::~::ローカルな\n\
展開-:expand:~\n\
属性:attribute:~\n\
層:layer::~\n\
履歴:history::~\n\
履行:fulfill:~\n\
巨大0:huge:巨大\n\
巨大:large:~\n\
帯域幅:bandwidth::~::バンド幅\n\
帰結:consequence:~\n\
干渉-:interfere:~\n\
干渉:interfere:~\n\
広範:wide:~\n\
広範囲:extensive:~\n\
廃用:obsolete::~\n\
弱体化:compromise:~\n\
強化-:enhance:~\n\
強要-:insist:~\n\
形:form:~\n\
形式:format::~::フォーマット\n\
形式変換-:transform::形式変換\n\
形式変換:transformation::~\n\
形成-:form:~\n\
形成:form:~\n\
影響0:impact:~\n\
影響-:affect:影響\n\
影響:implications:~\n\
役割:role::~::ロール\n\
往来:round trip:~:::ラウンドトリップ\n\
待時間:latency:待ち時間\n\
待機-:wait::~\n\
待機:wait::~\n\
後処理:post-processing:~\n\
	後続-:follow:~\n\
後続の:subsequent:~\n\
後者:latter:~\n\
後者の:latter:~\n\
復帰-:revert:~\n\
心配:fear:~\n\
必要十分:adequate:~\n\
必要性:needs:~\n\
	不必要な:unnecessary:~\n\
	不必要に:needlessly:~\n\
	必要:need:~\n\
必須:required:~\n\
応答-:respond::~::レスポンド\n\
応答:response::~::レスポンス\n\
要請:request::~::リクエスト\n\
要請修飾:request-modifying::~::リクエスト修飾\n\
応答class:class:::クラス\n\
応答待ちの:outstanding::~\n\
	勧める:advise する:~\n\
恒久的:permanent:~\n\
悪化-:exacerbate:~\n\
悪用-:exploit:~\n\
情報:information:~\n\
意味-:mean:~\n\
意味:meaning:~\n\
意味論:semantics::~::セマンティクス\n\
意味論的:semantic::~::セマンティック\n\
意向:intention:~\n\
意図-:intend:~\n\
意図:intent:~\n\
意図ion:intention:意図\n\
意図的:intentional:~\n\
慎重:careful:~\n\
慎重に:careful に:~\n\
慣行:convention::~\n\
懸念:concern:~\n\
成分:component::~\n\
下位成分:subcomponent::~\n\
成功-:succeed::~\n\
成功:success::~\n\
成功裡:successful::~\n\
成功裡の:successful::~\n\
所在-:locate::~\n\
所在:location::~\n\
所属-:belong:~\n\
所属:belong:~\n\
自前の:own::~\n\
	所有-:own:~\n\
所有者:owner::~\n\
	手が加えられず:intact:~\n\
手動:manual:~\n\
手引き:guidance:~\n\
手引きす:guide す:~\n\
指針:guideline:~\n\
手段:means:~\n\
手続き:procedure:~\n\
手順:steps:~\n\
技法:technique:~\n\
技術:technology:~\n\
抑制:reduce:~\n\
折衝-:negotiate::~::ネゴシエート\n\
折衝:negotiation::~::ネゴシエーション\n\
折返-:fold::~\n\
折返さな:fold しな::~\n\
折返し:folding::~\n\
抽出-:extract:~\n\
抽象化-:abstract 化:~\n\
抽象化:abstraction:~\n\
拒否-:refuse:~\n\
拘束-:constrain:~\n\
拘束:constraints:~\n\
拡張-:extend::~\n\
拡張0-:expand:拡張\n\
拡張:extension::~\n\
	拡張し得る:extensible:~\n\
拡張可能な:extensible::~\n\
拡張性:extensibility::~\n\
持続:persist::~\n\
持続性:persistence::~\n\
持続的:persistent::~\n\
指向0:-oriented:指向\n\
指定子:specifier:~\n\
指定-:specify:~\n\
指定:specification:~\n\
指示-:indicate:~\n\
指示:indication:~\n\
指示子:indicator:~\n\
挿入:insert:~\n\
注入:injection::~::インジェクション\n\
注入-:inject::~::インジェクト\n\
排他的:mutually exclusive:~\n\
採用-:adopt:~\n\
採用:adoption:~\n\
接尾辞:suffix:~\n\
接続-:connect::~::コネクト\n\
接続:connection::~::コネクション\n\
接続法:connecting::~::コネクティング\n\
接頭辞:prefix:~\n\
推奨-:recommend:~\n\
推奨:recommendation:~\n\
勧告:recommendation:~\n\
推測-:guess:~\n\
推測:guess:~\n\
提供-:provide:~\n\
提供者:provider:::プロバイダ\n\
提案-:propose:~\n\
提案:proposal:~\n\
操作-:manipulate:~\n\
操作:manipulation:~\n\
支援-:assist:~:::アシスト\n\
支配的な:prevailing:~\n\
改変-:modify::~\n\
改変:modification::~\n\
改訂-:revise::~\n\
改訂:revision::~::リビジョン\n\
改訂履歴:revision::~::リビジョン\n\
攻撃:attack::~\n\
攻撃者:attacker::~\n\
故意:deliberate:~\n\
数字:numeral:~\n\
数的:numeric:~\n\
一貫性:consistency:~\n\
整合させ:consistent にす:~\n\
整合しな:consistent でな:~\n\
整合する:consistent である:~\n\
一貫する:consistent である:~\n\
一貫しな:consistent でな:~\n\
一貫して:consistent に:~\n\
	inconsistent:\n\
整数:integer::~\n\
計算-:calculate:~\n\
	計算:calculating:~\n\
計算:calculation:~\n\
文字:character::~\n\
文字列:string::~\n\
文字大小:case::~\n\
文字大小区別:case-sensitive::~\n\
文字大小無視:case-insensitive::~\n\
文書:document:~\n\
文書化:document 化:~\n\
文法:grammar:~\n\
文脈:context::~\n\
	コンテクスト\n\
新たな:new:~\n\
方法:how:~\n\
方針:strategy:~\n\
施行-:enforce:~\n\
族:family::~::ファミリ\n\
既存の:existing:~\n\
既定:default::~::デフォルト\n\
既定の:default::~::デフォルト\n\
既知:known:~\n\
既知の:known:~\n\
日付時刻:date and time::~\n\
日時:date::~\n\
時刻:time::~\n\
時刻印:timestamp::~::タイムスタンプ\n\
時間:time:~\n\
時計:clock::~::クロック\n\
旧式の:ancient:~\n\
旧来の:legacy::~\n\
早期の:early:~\n\
昇格:upgrade::~::アップグレード\n\
降格:downgrade::~::ダウングレード\n\
昇順:ascending order:~\n\
降順:decreaseing order:~\n\
明らか:obvious:~\n\
明白:clear:~\n\
明確化-:clarify:明確化\n\
明確化:clarification:~\n\
明示的:explicit:~\n\
明示的な:explicit:~\n\
暗黙的:implicit:~\n\
暗黙的な:implicit:~\n\
暫定的:interim:~\n\
更新:update::~::アップデート\n\
更新喪失:lost update::~\n\
最初の:first:~\n\
最大:maximum:~\n\
最大化-:maximize:~\n\
最小:minimum:~\n\
最後に:finally:~\n\
最後の:last:~\n\
最終:final:~\n\
最終的:eventual:~\n\
最良:best:~\n\
最適化-:optimize:~\n\
最適化:optimization:~\n\
有利:advantageous:~\n\
有意:significant:~\n\
有意度:significance:~\n\
有意性:significance:~\n\
有意義:meaningful:~\n\
木目細かい:fine-grained:~\n\
未定義:undefined:~\n\
未知の:unknown:~\n\
未知:unknown:~\n\
未認識:unrecognized:認識できない\n\
末尾:end:~\n\
本体:body::~::ボディ\n\
本体長:body length:body 長:~::ボディ長\n\
本物の:real:~\n\
本質的:essential:~\n\
本質的でない:nonessential:~\n\
条件:condition::~\n\
条件付き:conditional::~\n\
条態:condition::~\n\
柔軟:flexible:~\n\
柔軟性:flexibility:~\n\
根本的:fundamental:~\n\
根本的な:fundamental:~\n\
格納法:storing::~\n\
格納-:store::~\n\
記憶域:storage::~::ストレージ\n\
蓄積:storage::~::ストレージ\n\
格納域:store::~\n\
格納:storing::~\n\
	格納済みの:stored::~\n\
格納済み:stored::~\n\
桁:digit::~\n\
梱包:packaging:~\n\
検出:detection:~\n\
検分-:inspect:~\n\
検知-:detect:~\n\
検分:inspection:~\n\
検査-:check:~\n\
検査:check:~\n\
検索:search:~\n\
検索取得-:retrieve::~\n\
検索取得:retrieval::~\n\
極小:minimal:~\n\
概して:typically:~\n\
概念:concept:~\n\
概観:overview:~\n\
構文:syntax::~::シンタックス\n\
構文解析:parse::~::パース\n\
構文解析処理:parsing::~::パース処理\n\
構文解析器:parser::~::パーサ\n\
構築0:building:構築\n\
構成子:construct::~\n\
構築-:construct:~\n\
構築法:constructing:~\n\
再構築-:reconstruct:~\n\
再構築:reconstruction:~\n\
構造:structure:~\n\
様々な:various:~\n\
標準:standard::~\n\
標準化-:standardize::~\n\
権利:right:~\n\
権限:authority::~\n\
権限付与-:authorize::権限を付与\n\
権限付与され:authorizeされ::権限が付与され\n\
権限付与:authorization::~\n\
権限的:authoritative::~\n\
未認証:unauthorized::~\n\
認証済み:authenticated::~\n\
認証-:authenticate::~\n\
認証:authentication::~\n\
認証用の:authentication::~\n\
策定者:author:~\n\
著者:author:~\n\
機会:chance:~\n\
	~~機会:opportunity:~\n\
機器:device:~:::デバイス\n\
機密性:confidentiality::~\n\
機密的:confidential::~\n\
	機能:function:~\n\
機能性:functionality:~\n\
欠如:lack:~\n\
欠如する:lack する:欠く\n\
欠陥:flaw:~\n\
次0の:next:次の\n\
次元:dimension:~\n\
正しく:correct に:~\n\
不正:incorrect:~\n\
不正な:incorrect:~\n\
正しい:correct:~\n\
正準:canonical::~\n\
正準化:canonicalization::~\n\
正確0:accurate:正確\n\
正確:exact:~\n\
正規化-:normalize::~\n\
正規化:normalization::~\n\
正誤表:errata::~\n\
歴史的:historical:~\n\
	残りの:remaining:~\n\
	残りの部分:remainder:~\n\
段階:stage:~\n\
比較-:compare::~\n\
比較:comparison::~\n\
汚染-:poison::~\n\
汚染:poisoning::~\n\
決定-:determine:~\n\
決定:determination:~\n\
決断:decision:~\n\
	注記-:note:~\n\
	注記:Note:~\n\
活動:activity::~\n\
消去-:erase:~\n\
消費-:consume:~\n\
消費量:consumption:~\n\
深刻:serious:~\n\
混同-:confuse:~\n\
混同:confusion:~\n\
準備-:prepare:~\n\
準拠-:comply::~\n\
準拠:compliant::~\n\
無視-:ignore::~\n\
無視0:disregard:無視\n\
無限:infinite:~\n\
版:edition:~\n\
	特に，:particularly:~\n\
	特に:specifically:~\n\
特別:special:~\n\
特別な:special:~\n\
特化-:specialize:~\n\
特定0の:particular:特定の\n\
特定の:specific:~\n\
特性:characteristic:~\n\
	特徴:characteristic:~\n\
特有:specific:~\n\
特有の:specific な:~\n\
	特段:especial:~\n\
特色機能:feature::~::フィーチャ\n\
特権拡大:privilege escalation:~\n\
状態:state::~::ステート\n\
状態変更:state-changing::~::ステート変更\n\
状況:situation:~\n\
状況下:circumstance:~\n\
現在の:current:~\n\
	現在，:currently:~\n\
理論:theory:~\n\
理論上は:theory 上は:~\n\
環境:environment:~\n\
環境設定-:configure::~\n\
環境設定:configuration::~\n\
生の:raw:~\n\
生成-:generate::生成\n\
生成:generation::~\n\
生成元:origin::~::オリジン\n\
生成規則:production::~\n\
生産-:produce:~\n\
用語0:terminology:用語\n\
用語:term:~\n\
画像:image:~\n\
番号:number:~\n\
疑似:pseudo:~\n\
発行-:publish:~\n\
発行0-:make:発行\n\
発行0:making:発行\n\
発行:publication:~\n\
登録-:register::~\n\
登録済みの:registered::~\n\
登録:registration::~\n\
登記簿:registry:::レジストリ\n\
盗聴:theft:~\n\
監視-:monitor::~::モニタ\n\
監視器:monitor::~::モニタ\n\
監視用:monitoring::~::モニタ用\n\
目標:goal:~\n\
目的:purpose:~\n\
盲目的:blind::~\n\
近過去:recent::~\n\
相互運用:interoperate::~\n\
相互運用上の:interoperability::~\n\
相互運用可能:interoperable::~\n\
相互運用性:interoperability::~\n\
相似的:analogous:~\n\
相対:relative::~\n\
相対的:relative::~\n\
相当:substantial:~\n\
	相当するもの:counterpart:~\n\
相応しい:suitable:~\n\
相応しく:suitable で:~\n\
	unsuitable:~\n\
相違-:differ:~\n\
相違化-:differentiate:区別\n\
相違す:differ す:異な\n\
	相違し:differ し:異なり\n\
相違点:differences:~\n\
相違:differences:~\n\
相関-:correlate:~\n\
相関:correlation:~\n\
省略:omit:~\n\
任意選択の:optional::~::オプションの\n\
省略可:optional::~::オプション\n\
省略可能:optional::~::オプションの\n\
瞬間:moment:~\n\
知覚-:perceive:~\n\
知識:knowledge:~\n\
	短い:short:~\n\
短縮-:shorten:~\n\
破壊-:destroy::~\n\
破棄-:discard::~\n\
確保-:ensure:~\n\
確立-:establish::~\n\
確立:establishing::~\n\
確立0:establishment::確立\n\
示唆-:suggest:~\n\
禁止-:forbid::~\n\
禁制:prohibit::~\n\
移動-:move:~\n\
移行:transition::~\n\
稀:rare:~\n\
種類:kind:~\n\
稼働-:run:~\n\
稼働中の:running:~\n\
稼働時:run-time:~\n\
空:empty:~\n\
空行:blank line::~\n\
空白:whitespace::~\n\
空間:space:~\n\
端点:endpoint::~::エンドポイント\n\
端点間:end-to-end::~::エンドツーエンド\n\
隣点間:hop-by-hop::~::ホップバイホップ\n\
競合-:conflict:~\n\
競合:conflict:~\n\
復号-:decode::~::デコード\n\
復号:decoding::~::デコーディング\n\
暗号化-:encrypt::暗号化\n\
暗号化:encryption::~\n\
暗号用の:cryptographic::~\n\
符号化-:encode::~::エンコード\n\
符号化:encoding::~::エンコーディング\n\
符号化済み:encoded::~::エンコード済み\n\
符号化方式:encoding::~::エンコーディング\n\
再符号化:recode::~::再コード化\n\
符号変換:transcoding::~::トランスコーディング\n\
符号変換器:transcoder::~::トランスコーダー\n\
符号法:coding::~::コーディング\n\
第三者主体:third-party::~::サードパーティ\n\
等価:equivalent:~\n\
算出-:compute:~\n\
算術的:arithmetic:~\n\
算術:arithmetic:~\n\
管理-:manage:~\n\
管理:management:~\n\
変更管理者:change controller:~\n\
節:section:~\n\
節約-:save:~\n\
範囲:range::~\n\
範囲単位:range unit::~\n\
部分範囲:subrange::~\n\
簡潔:compact:~\n\
精確な:precise:~\n\
精緻化-:refine:~\n\
精緻化:refinement:~\n\
素片:fragment::~::フラグメント\n\
終了-:terminate:~\n\
終了:termination:~\n\
終端:end:~\n\
組織:organization:~\n\
経路:path:~\n\
経験:experience:~\n\
経験則:heuristics::~::ヒューリスティックス\n\
経験的:heuristic::~::ヒューリスティック\n\
経験的な:heuristic::~::ヒューリスティック\n\
結合-:combine:結合\n\
結合法:combining:~\n\
再結合:recomposition:~\n\
組合わせ:combination:組み合わせ\n\
組合わさ:combine さ:組み合わさ\n\
結果:result:~\n\
結論:conclusion:~\n\
統一的:uniform:~\n\
統合:incorporate:~\n\
統治-:govern:~\n\
絶対:absolute::~\n\
継承-:inherit:~\n\
継承:inheritance:~\n\
継続-:continue:~\n\
続行-:proceed:~\n\
維持-:retain:~\n\
維持させ:sustain し:~\n\
	維持し:retain し:~\n\
維持管理-:maintain:~\n\
維持管理:maintenance:~\n\
網羅的:exhaustive:~\n\
総集的:collective:~\n\
	総:total:~\n\
編集0:edit:編集\n\
編集:editing:~\n\
編集上の:editorial:~\n\
緩めら:relax さ:~\n\
緩める:relax する:~\n\
緩和策:mitigation:~\n\
軽減-:mitigate:~\n\
縛られ:tie され:~\n\
繰返し:repetition:繰り返し\n\
繰返され:repeat され:繰り返され\n\
繰返した:repeat した:繰り返した\n\
繰返して:repeat して:繰り返して\n\
繰返す:repeat する:繰り返す\n\
繰返せ:repeat でき:繰り返せ\n\
署名:signature:~\n\
義務付けな:mandate しな:~\n\
義務付ける:mandate する:~\n\
義務化:mandate:~\n\
翻訳-:translate::~\n\
転化-:translate::~\n\
翻訳:translation::~\n\
考慮:consider:~\n\
考慮点:consideration:~\n\
背後:behind:~\n\
能力0:ability::能力\n\
能力:capability::~\n\
脆弱:vulnerable::~\n\
脆弱性:vulnerability::~\n\
自動:automatic:~\n\
自動化:automated:~\n\
自動的:automatic:~\n\
自由:free:~\n\
	良い:good:~\n\
英字:letter::~\n\
英語:English:~\n\
草案:draft::~\n\
行0:line::行\n\
行先:destination:~\n\
衝突-:collide:~\n\
衝突:collision:~\n\
表出-:express:~\n\
表現-:represent::~\n\
表現:representation::~\n\
表示:display:~\n\
表記法:notation:~\n\
補助:help:~\n\
複製:copy:~\n\
複雑化-:complicate:~\n\
要件:requirements:~\n\
要求-:require:~\n\
要約-:summarize:~\n\
要素:element::~\n\
見なさ:consider さ:~\n\
見なし:consider し:~\n\
見なす:consider する:~\n\
見なせ:consider でき:~\n\
見做さ:assume さ:~\n\
見做し:assume し:~\n\
見做す:assume する:~\n\
見做せ:assume でき:~\n\
見積もり:estimate::~\n\
見積もら:estimateさ::~\n\
見積もる:estimateする::~\n\
規則:rule:~:::ルール\n\
規約:convention:~\n\
視野:scope:~\n\
観測-:observe:~\n\
観測可能:observable:~\n\
解-:understand:~\n\
解さな:understand しな:~\n\
解決0:solve:解決\n\
解決-:resolve::~\n\
解決:resolution::~\n\
解決策:solution:~\n\
解釈-:interpret:~\n\
解釈:interpretation:~\n\
誤解釈:misinterpret:~\n\
言明-:assert::~\n\
言明:assertion::~\n\
言語:language:~\n\
計測:measure:~\n\
記号:symbol:~\n\
記憶-:remember:~\n\
記録-:record:~\n\
設定-:set:~\n\
設定:setting:~\n\
設置-:place:~\n\
設置しな:place しな:課さな\n\
設置する:place する:課す\n\
	課す:impose する:~\n\
設計:design::~::デザイン\n\
許可:permit:~\n\
許容-:allow:~\n\
不許可に:disallow:~\n\
	許容されない:disallowed:~\n\
許諾:permission:~\n\
診断:diagnostic:~\n\
評価-:evaluate:評価\n\
評価:evaluation:~\n\
試行-:try:~\n\
再試行-:retry::再試行\n\
再試行:retrying::~\n\
試験:test::~::テスト\n\
試験的:experimental:~\n\
詳細:details:~\n\
詳細な:detailed:~\n\
認知-:acknowledge:認知\n\
認知:acknowledgement:認知\n\
謝辞:acknowledgement:~\n\
認識-:recognize:~\n\
認識しない:unrecognized:~\n\
誘発-:trigger:~\n\
誤解:mistake:~\n\
説明-:explain:~\n\
説明:explanation:~\n\
課題:issue:~\n\
調整:adjust:~\n\
考査:examination:~\n\
調査-:examine:~\n\
調査:examining:~\n\
識別-:identify::~\n\
識別:identifying::~\n\
	識別されない:unidentified:~\n\
識別処理:identification::~\n\
識別可能:identifyable::~\n\
識別子:identifier::~\n\
警告:warning:~\n\
	負:negative:~\n\
負荷:load:~\n\
読込まれ:load され:~\n\
過負荷:overload:~\n\
	責を負う:responsible:~\n\
責任主体:responsible party:~\n\
責務:responsibility:~\n\
資格証:credentials::資格証明情報::クレデンシャル\n\
資源:resource::~:リソース\n\
主資源:primary resource:主 resource:~::主リソース\n\
資質:nature:~\n\
性向:nature:~\n\
起動-:initiate:~\n\
起動させ:initiate し:~\n\
超過-:exceed:~\n\
	近い:near:~\n\
近似:approximation:~\n\
追加-:add:~\n\
追加:addition:~\n\
追加の:additional:~\n\
追尾:tracking::~::トラッキング\n\
追跡:trace::~::トレース\n\
	逆:reverse:~\n\
透過性:transparency::~\n\
透過的:transparent::~\n\
逐語的:verbatim:~\n\
通例的に:usually:~\n\
通例的には:usually:~\n\
通信-:communicate::~\n\
通信:communication::~\n\
通常:normal:~\n\
通常の:normal:~\n\
通常は:normal では:~\n\
	normally\n\
通知-:signal:~\n\
通知0-:notify:通知\n\
通知:signal:~\n\
連絡-:contact:~\n\
連絡:contact:~\n\
連合-:federate:~\n\
連結-:concatenate:~\n\
連鎖:chain::~::チェイン\n\
進捗:progress:~\n\
進捗状況:progress:~\n\
	遅い:slow な:~\n\
遅延:delay::~\n\
演算:operation:~\n\
演算子:operator:~\n\
運用-:operate:~\n\
運用:operation:~\n\
運用上の:operational:~\n\
運用者:operator:~\n\
過去:past:~\n\
過度の:excessive:~\n\
過程:process:~\n\
達成-:accomplish:~\n\
違反:violate:~\n\
遠隔:remote::~::リモート\n\
適合-:conform:~\n\
適合:conformant:~\n\
適合性:conformance:~\n\
適度:reasonable:~\n\
	理に適った:reasonable:~\n\
見合う:reasonable な:~\n\
適応的:adaptive:~\n\
適時:timely:~\n\
適正:proper:~\n\
遭遇-:encounter:~\n\
遮断:block:~:::ブロック\n\
選好-:prefer:~\n\
選好:preference:~\n\
選好順:descending preference の order:選好度の高い順\n\
選定-:select::~\n\
選定用:selecting::~\n\
選定:selection::~\n\
被選定:selected::~\n\
選択的:selective::~\n\
選択-:choose:~\n\
選択:choice:~\n\
部位:portion:~\n\
部分的:partial::~\n\
配備-:deploy:~\n\
配備:deployment:~\n\
重み:weight::~\n\
重複:duplicate:~\n\
重要:important:~\n\
量:amount:~\n\
長さ:length:~\n\
	長さゼロ:zero-length:~\n\
開く:open する::~\n\
開始-:start:~\n\
開発-:develop:~\n\
開発:development:~\n\
開発者:developer:~\n\
開示-:disclose:~\n\
開示:disclosure:~\n\
関係-:relate:~\n\
	関係する:related:~\n\
関係ない:unrelated:~\n\
関係性:relationship:~\n\
関心:interest:~\n\
関数:function:~\n\
関連する:relevant な:~\n\
閲覧-:browse:~:::ブラウズ\n\
閲覧:browsing:~:::ブラウジング\n\
	防が:prevent し:~\n\
	防ぐ:prevent する:~\n\
防止-:prevent:~\n\
防御策:defense:~\n\
限度:extent:~\n\
	除いて:except して:~\n\
除外-:exclude:~\n\
階層:hierarchy:~\n\
階層的:hierarchical:~\n\
隔離:isolate:~\n\
隣接点:neighbor::~\n\
集合:set:~\n\
露に:reveal:~\n\
露呈-:expose:~\n\
公開0-:expose:公開\n\
非公式的:informal:~\n\
非効率:inefficient:~\n\
非同期的:asynchronous:~\n\
非同期的な:asynchronous:~\n\
非推奨:deprecated::~\n\
頁:page:ページ\n\
順守-:obey:~\n\
順序:order:~\n\
領域:region:~\n\
頻繁:frequent:~\n\
類似した:similar な:~\n\
類似する:similar な:~\n\
類似的:similar:~\n\
	~similarly::\n\
類別:category:~\n\
高度:advance:~\n\
鮮度:freshness::~\n\
'
}


/*
両者:both:~
両:both:~
大部分／大多数:most:~
意識-:be aware:~\n\

先立つ／〜に先立って／先に／事前に／~~直前:prior
生じ:occur し:~\n\
生じる:occur する:~\n\
加えて，In addition
条件付きでない:unconditional:
言い換えれば、in other words
しかしながら:however:~\n\
以外のother than
に注意。~note~that
〜に関する／関して~regarding／~regard／with respect to
〜に関わらず~regardless
〜するつもりがある~willing
〜するつもりがない~unwilling
何であれwhichever
則ってin~accordance~with／accord with
最早〜ない~no~longer
次の~the~following
OS~operateing~system~s
実数~real~number
すでに:already:~\n\
その:that:~\n\
一部分\n\
一部／部分\n\
一つの:one:~\n\
二つの:two:~\n\
三つの:three:~\n\
四つの:four:~\n\
予め:in advance:~\n\
例：:e.g.:~\n\
再び:again:~\n\
同様に:likewise:~\n\
思しきもの:supposedly:\n\
括ってsurround:\n\
挙げる~list\n\
大多数／大部分の:most:~\n\
〜を超えて~beyond
おそらく:perhaps#3
しかしながら:however#29
したがって:therefore#6
すでに:already#3
その:that#96
ほぼ:almost#3
よって:hence#4
代わりに:instead#11
何か:something#2
何故なら:because#8
依然として:still#2
再び:again#2
多くの:many#11
大部分の:most#11
ほとんどの
少しばかり:slightly#1
持-:have#70
数種の:several#2
方法:how#13
その時々:on occasion#1
最も:most0#4
自身:itself#3
起因して:due to
働かな:work しな:~\n\
働ける:work でき:~\n\
~~目的:sake:目的\n\
おそれ:fear:~\n\
が可能になる\n\
し得ないincapable\n\
一つの:one:~\n\
三つの:three:~\n\
二つの:two:~\n\
五つの:five:~\n\
人:human:~\n\
保つ
優先され:precedence を take す
別々の:separate:~\n\
多種多様な:variety:~\n\
始-／~~開始:begin:~\n\
差し向け／指し向く\n\
年:year:~\n\
挙-:mention:~\n\
望ましいdesirable
考慮-:regard:~\n\
知-:know:~\n\
秒数:seconds:~\n\
等しく:equal に:~\n\
置-\n\
置く／場所:place
考え:thinking／suggested:~\n\
能力を備えている~be~capable~of::\n\
量:amount:~\n\
類い
高める:increase させる:~\n\
（〜に備わる能力）
依頼ask
見込みが高い:likely::\n\
■
unwise
sequence
close
open

~fall::\n\
~left::\n\
~like::\n\
~part:\n\
~play::\n\
~potential:\n\
note::\n\
~named::\n\
~old::\n\
operate:\n\
~readily::\n\
~remain::\n\
~respective::\n\
sequence:\n\
vary::\n\
~take:\n\
~tell::\n\
~greater::\n\
~missing:\n\
~long::\n\
~held::\n\
記す／表す:denote する:~\n\
~lead:\n\
得られ／取得~obtain され:~\n\
~remain:\n\
よく／ことが多い~often
一般に:commonly
与え-give
得る:obtainする:~
応える~meet する\n\
求めに応じて\n\
行っ
行われ
通して渡され:~pass~through
除いて:exceptして:\n\
accountable::#1
actor::#1
agent駆動の:agent-driven#1
あてがう:assignする:~
あてがわれ:assignされ:~
securedでない:unsecured#1
必要とされnecessary
締めくくるconclude
draw::#1
その他の~miscellaneous::#1
render←rendition::#1
sameness::#1
say::#1
seem::#1
through::#5
~cause::#12
~~望-:want::#4
全体:entire
一部の:some
事前動作
受動的
出来事
及ぼす
各所／他所
宛先
強くstrong::#1
意図されずに:unintentional::#1
期間:period／period of time::#1
源:source:ソース
示-:show
表~table::#1
誤り:wrong:~#1
部分:part:~
長く／長い~long
電網
一式:set
時には~occasionally
利益を代表して~on~behalf~of
等々~etc.
一つ以上はat least one

*/

/*
		１	２
	w	？	？	mapping[kan？？]
	w	で	き	mapping[kan-]１２
	w	？	＊	mapping[kan？]２
	w	？	／	mapping[kan？]
	w	さ	＊	mapping[kan-]１２
	w	さ	／	mapping[kan-]１
	w	＊	＊	mapping[kan]１２
	w	／	／	mapping[kan]

*/