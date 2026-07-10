// ddeuzm 랭킹 데이터 아카이브: index.html의 현재 CATS/BREAKING을 날짜별 JSON 스냅샷으로 저장.
// 갱신(덮어쓰기) 전에 실행해 이전 순위를 보존한다. 나중에 일/주/월 단위 조회·순위변화 페이지의 원천.
// 사용:  node archive.js 2026-07-08     (아카이브할 데이터의 날짜=갱신 전 LASTDATE)
const fs = require('fs');
const date = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) { console.error('usage: node archive.js YYYY-MM-DD'); process.exit(1); }
const html = fs.readFileSync('index.html', 'utf8');
const CATS = eval('(' + html.match(/var CATS\s*=\s*(\{[\s\S]*?\n\});/)[1] + ')');
const BREAKING = eval('(' + html.match(/var BREAKING\s*=\s*(\[[\s\S]*?\n\]);/)[1] + ')');
if (!fs.existsSync('archive')) fs.mkdirSync('archive');
const out = { date, month: date.slice(0, 7), savedAt: new Date().toISOString(), catCount: Object.keys(CATS).length, CATS, BREAKING };
fs.writeFileSync('archive/' + date + '.json', JSON.stringify(out, null, 1));
// 인덱스(월 단위 조회용) 갱신
const idxPath = 'archive/index.json';
let idx = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, 'utf8')) : [];
idx = idx.filter(e => e.date !== date);
idx.push({ date, month: date.slice(0, 7), catCount: Object.keys(CATS).length, top: Object.fromEntries(Object.entries(CATS).map(([k, v]) => [k, (v.items[0] || [])[0] || null])) });
idx.sort((a, b) => a.date < b.date ? 1 : -1);
fs.writeFileSync(idxPath, JSON.stringify(idx, null, 1));
console.log('archived archive/' + date + '.json — ' + Object.keys(CATS).length + ' cats, index ' + idx.length + ' snapshots');
