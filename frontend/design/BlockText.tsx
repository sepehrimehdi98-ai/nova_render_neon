import type {Row} from '../src/live/api';
export function BlockText({block}:{block:Row}){
 if(block.variant==='divider')return <hr/>;
 const marks=block.textMarks||[];let cursor=0;const parts=[];
 for(const [i,m] of marks.entries()){parts.push(block.body.slice(cursor,m.start));parts.push(<span key={i} style={{fontSize:m.fontSize+'px'}}>{block.body.slice(m.start,m.end)}</span>);cursor=m.end;}
 parts.push(block.body.slice(cursor));
 return block.variant==='quote'?<blockquote style={{borderInlineStart:'3px solid #8c74bc',paddingInlineStart:14}}>{parts}</blockquote>:block.variant==='list'?<ul>{block.body.split('\n').filter(Boolean).map((s:string,i:number)=><li key={i}>{s}</li>)}</ul>:<span style={{whiteSpace:'pre-wrap'}}>{parts}</span>;
}
