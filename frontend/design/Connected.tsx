import {useEffect,useState} from 'react';
import {api,type User} from '../src/live/api';
import {Session,useResource} from '../src/live/shared';
import {Courses,Lesson} from '../src/live/Learning';
import {Builder,Structure} from '../src/live/Authoring';
import {Accounts,Analytics,Assistant,Library,Media,Operations,Profile} from '../src/live/Management';
import {Exams} from '../src/live/Exams';
import {Tickets} from '../src/live/Tickets';
import '../src/live/live.css';

export function Connected({screen}:{screen:string}){
 const [user,setUser]=useState<User|null>(null);
 const [course,setCourse]=useState(''),[lesson,setLesson]=useState(''),[editing,setEditing]=useState(false),[notice,notify]=useState('');
 const courses=useResource('/courses');
 async function refreshUser(){const result=await api('/me');setUser(result.user)}
 async function logout(){await api('/logout',{});location.assign('/')}
 useEffect(()=>{refreshUser().catch(e=>notify(e.message))},[]);
 useEffect(()=>{
   const expired=()=>location.replace('/login');
   window.addEventListener('nova:session-expired',expired);
   return ()=>window.removeEventListener('nova:session-expired',expired);
 },[]);
 const list=courses.data?.courses||[];
 const courseId=list.some((item:any)=>item.id===course)?course:list[0]?.id||'';
 function selectCourse(id:string){setCourse(id);setLesson('');setEditing(false)}
 function openLesson(id:string,edit=false){setLesson(id);setEditing(edit)}
 if(!user)return <p role="status">{notice||'در حال دریافت حساب…'}</p>;
 return <Session.Provider value={{user,courseId,setCourseId:selectCourse,notify,refreshUser,logout}}>
 <div className="live-stack" dir="rtl"><div className="actions"><select aria-label="دوره" value={courseId} onChange={e=>selectCourse(e.target.value)}>{list.map((item:any)=><option key={item.id} value={item.id}>{item.title}</option>)}</select><button onClick={()=>logout().catch(e=>notify(e.message))}>خروج</button></div>
 {courses.error&&<p role="alert">{courses.error}</p>}
 {notice&&<p role="status" onClick={()=>notify('')}>{notice}</p>}
 {screen==='courses'&&(editing?<><button onClick={()=>openLesson('')}>بازگشت به درس‌ها</button><Builder key={lesson||courseId} lessonId={lesson} onSaved={id=>openLesson(id,true)}/></>:lesson?<Lesson id={lesson} back={()=>openLesson('')}/>:<>{user.role!=='student'&&courseId&&<button className="primary-btn" onClick={()=>openLesson('',true)}>ایجاد درس</button>}<Courses openLesson={openLesson}/></>)}
 {screen==='courses'&&!editing&&!lesson&&user.role!=='student'&&courseId&&<><Structure/><Media/><Library/><Assistant/></>}
 {screen==='analytics'&&<Analytics/>}{screen==='assistant'&&<Assistant/>}{screen==='profile'&&<Profile/>}{screen==='tickets'&&<Tickets/>}{screen==='exams'&&<Exams/>}{screen==='accounts'&&<Accounts/>}{screen==='operations'&&<Operations/>}
 </div></Session.Provider>
}
