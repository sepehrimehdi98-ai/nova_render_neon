import {ArrowUpLeft,BookOpen,ChartNoAxesCombined,ClipboardCheck,ChevronDown} from 'lucide-react';
import type {Row} from '../../src/live/api';
import './student-exam-polish.css';

export default function StudentExamHeader({courses,courseId,onCourseChange,disabled=false}:{courses:Row[];courseId:string;onCourseChange:(id:string)=>void;disabled?:boolean}){
 return <header className="student-exam-header">
  <div className="seh-intro"><span className="seh-icon" aria-hidden="true"><ClipboardCheck size={30}/></span><div><h1>آزمون‌های من</h1><p>آزمون‌های منتشرشده، زمان شرکت و نتایج ثبت‌شده شما</p></div></div>
  <a className="seh-performance" href="/progress"><ChartNoAxesCombined size={18}/>عملکرد من<ArrowUpLeft size={17}/></a>
  <div className="seh-course"><label htmlFor="student-exam-course"><BookOpen size={17}/>دوره موردنظر</label><div className="seh-select"><select id="student-exam-course" aria-label="انتخاب دوره آزمون" value={courseId} disabled={disabled||!courses.length} onChange={e=>onCourseChange(e.target.value)}>{!courses.length&&<option value="">دوره‌ای در دسترس نیست</option>}{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select><ChevronDown size={18} aria-hidden="true"/></div></div>
 </header>;
}
