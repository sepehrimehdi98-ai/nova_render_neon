import {useEffect,useState} from 'react';
import {api,type User} from '../src/live/api';
import {Session,useResource} from '../src/live/shared';
import {Exams} from '../src/live/Exams';
import {Analytics} from '../src/live/Management';
import '../src/live/live.css';

export default function CourseWorkspace({screen}:{screen:'exams'|'analytics'}){
 const [user,setUser]=useState<User|null>(null),[selected,setSelected]=useState(''),[notice,setNotice]=useState('');
 const courses=useResource('/courses');
 useEffect(()=>{const controller=new AbortController();api('/me',undefined,controller.signal).then(r=>setUser(r.user)).catch(e=>{if(e.name!=='AbortError')setNotice(e.message)});return()=>controller.abort()},[]);
 const list=courses.data?.courses||[];
 const courseId=list.some((c:any)=>c.id===selected)?selected:list[0]?.id||'';
 if(!user)return <p role="status">{notice||'در حال دریافت حساب…'}</p>;
 return <Session.Provider value={{user,courseId,setCourseId:setSelected,notify:setNotice,refreshUser:async()=>{setUser((await api('/me')).user)},logout:async()=>{await api('/logout',{});location.assign('/')}}}>
  <div className="live-stack" dir="rtl">
   <div className="panel-head"><h2>{screen==='exams'?'آزمون‌های دوره':'تحلیل یادگیری'}</h2><label>دوره <select aria-label="انتخاب دوره" value={courseId} onChange={e=>{setSelected(e.target.value);setNotice('')}}>{list.map((c:any)=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
   {courses.error&&<p role="alert">{courses.error}</p>}{notice&&<p role="status">{notice}</p>}
   {screen==='exams'?<Exams/>:<Analytics/>}
  </div>
 </Session.Provider>;
}
