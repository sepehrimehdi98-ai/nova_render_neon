import assert from 'node:assert/strict';
import {reportHtml,progressReport} from '../frontend/src/live/student-report.ts';
const body='یادداشت فارسی\n<script>alert(1)</script>\n=SUM(A1)\nEnglish text';
const note=reportHtml('Notes', [['Lesson','<img src=x onerror=bad()>']],body,'en');assert.ok(!note.includes('<script>'));assert.ok(note.includes('&lt;script&gt;'));assert.ok(note.includes('=SUM(A1)'));assert.ok(note.includes('English text'));assert.ok(note.includes('dir="ltr"'));
const selected={name:'سارا',lessons:3,completed:1,average:null,activity:125,results:[{title:'Hidden',score:null,submitted_at:'2026-11-16T00:00:00Z'},{title:'Zero',score:0}],daily:[{day:'2026-11-16',seconds:125}]};
for(const lang of ['fa','en']){const html=progressReport(selected,{course:'Python',days:7,since:'2026-11-09T00:00:00Z',generatedAt:'2026-11-16T00:00:00Z'},lang);assert.ok(html.includes('125'));assert.ok(html.includes('0 / 100'));assert.ok(html.includes('33.33333333333333'));assert.ok(html.includes('Python'));assert.ok(html.includes('2026-11-09'));assert.ok(!html.includes('NaN'));}
console.log('Student reports: Unicode, safe HTML, exact values, null/zero distinction, scope and timestamps passed.');
