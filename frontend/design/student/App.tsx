import CourseWorkspace from '../CourseWorkspace';
import {useEffect,useState} from 'react';
import {api,type Row} from '../../src/live/api';
import Page0 from './page';
import Page1 from './assistant/page';
import Page2 from './lessons/page';
import Page3 from './login/page';
import Page4 from './profile/page';
import Page5 from './progress/page';
import Page6 from './lessons/python-basics/page';
import {DashboardShell} from './nova-ui';
export default function App(){
 const pages:Record<string,React.ComponentType>={'/':Page0,'/assistant':Page1,'/lessons':Page2,'/login':Page3,'/profile':Page4,'/progress':Page5,'/exams':()=> <CourseWorkspace screen="exams"/>,'/lessons/python-basics':Page6};
 const Page=pages[location.pathname.replace(/\/$/,'')||'/']||pages['/'];
 return <DashboardShell>{location.pathname==="/lessons/view"?<StoredLesson/>:<Page/>}</DashboardShell>;
}
function StoredLesson(){
 const [doc,setDoc]=useState<Row|null>(null),[error,setError]=useState('');
 useEffect(()=>{api('/lessons/'+encodeURIComponent(new URLSearchParams(location.search).get('id')||'')).then(r=>setDoc(r.content)).catch(e=>setError(e.message))},[]);
 return <article className="rounded-2xl bg-white p-6"><h1>{doc?.title||error}</h1>{doc?.blocks.map((b:Row)=><section key={b.id}><h2>{b.title}</h2>{b.kind==='video'?(b.sourceUrl?<video controls src={b.sourceUrl}/>:<iframe title={b.title} src={b.embedUrl||'https://stream.novextech.ir/'+encodeURIComponent(b.mediaId)}/>):b.kind==='image'?<img src={b.imageUrl} alt={b.title}/>:b.kind==='code'?<pre>{b.body}</pre>:<p>{b.body}</p>}</section>)}</article>
}
