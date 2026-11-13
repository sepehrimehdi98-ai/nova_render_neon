import {PythonRunner} from '../src/live/PythonRunner';
import './lesson-reading.css';
export default function LessonCode({code,onChange,label,filename}:{code:string;onChange?:(code:string)=>void;label?:string;filename?:string}){return <div className="lesson-code-box lesson-code-compact"><PythonRunner initialCode={code} onCodeChange={onChange} label={label} filename={filename}/></div>}
