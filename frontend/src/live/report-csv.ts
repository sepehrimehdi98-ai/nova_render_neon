export function serializeCsv(rows:Record<string,unknown>[]){
 if(!rows.length)return '';
 const columns=[...new Set(rows.flatMap(row=>Object.keys(row)))];
 const cell=(value:unknown)=>'"'+String(value??'').replace(/^[\s\uFEFF]*[=+@-]/,"'$&").replace(/"/g,'""')+'"';
 return '\ufeff'+[columns.map(cell).join(','),...rows.map(row=>columns.map(key=>cell(row[key])).join(','))].join('\r\n');
}
