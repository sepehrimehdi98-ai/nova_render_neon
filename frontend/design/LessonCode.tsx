import {PythonRunner} from '../src/live/PythonRunner';
import './lesson-reading.css';
export default function LessonCode({code,onChange}:{code:string;onChange?:(code:string)=>void}){return <div className="lesson-code-box lesson-code-compact"><PythonRunner initialCode={code} onCodeChange={onChange}/></div>}
