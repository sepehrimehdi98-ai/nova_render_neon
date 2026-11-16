const test=require('node:test'),assert=require('node:assert/strict');
const {serializeCsv}=require('../frontend/src/live/report-csv.ts');
const {progressReport}=require('../frontend/src/live/student-report.ts');
function parse(text){const rows=[];let row=[],cell='',quoted=false;for(let i=1;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(!quoted&&(c===','||c==='\r')){row.push(cell);cell='';if(c==='\r'){rows.push(row);row=[];i++}}else cell+=c}row.push(cell);rows.push(row);return rows}
test('CSV preserves Persian, quotes, line breaks, zero and missing values while neutralizing spreadsheet formulas',()=>{
 const value='درس "پایتون", مثال\nجلسه دوم',csv=serializeCsv([{name:value,score:0,hidden:null},{name:'\t=HYPERLINK("https://invalid")',score:20,extra:'later column'}]);assert.equal(csv[0],'\ufeff');const rows=parse(csv);assert.deepEqual(rows[0],['name','score','hidden','extra']);assert.deepEqual(rows[1],[value,'0','','']);assert.equal(rows[2][0][0],"'");assert.equal(rows[2][3],'later column');assert.equal(serializeCsv([]),'');
});
test('complete progress reports include snapshot context, exact score scale, completion and activity with escaped user text in both languages',()=>{
 const selected={name:'<script>bad()</script>',average:0,completed:2,lessons:4,activity:125,results:[{title:'آزمون پایتون',score:0,submitted_at:'2026-11-16T10:00:00Z'},{title:'Not taken',score:null}],daily:[{day:'2026-11-16',seconds:125}]},context={course:'Python & web',days:30,since:'2026-10-17T10:00:00Z',generatedAt:'2026-11-16T10:00:00Z'};
 for(const lang of ['fa','en']){const html=progressReport(selected,context,lang);assert.ok(html.includes('dir="'+(lang==='fa'?'rtl':'ltr')+'"'));for(const value of ['Python &amp; web','2026-10-17T10:00:00Z','2026-11-16T10:00:00Z','0 / 100','2 / 4','125','50'])assert.ok(html.includes(value),value);assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes(lang==='fa'?'ثبت نشده یا نتیجه پنهان است':'Not recorded or result withheld'))}
});
