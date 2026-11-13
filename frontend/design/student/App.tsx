import {LessonCover} from '../LessonCover';
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
 if(location.pathname==='/profile')return <Page4/>;
 if(location.pathname==='/lessons/view')return <StoredLesson/>;
 if(location.pathname==='/lessons')return <Page2/>;
 if(location.pathname==='/exams')return <CourseWorkspace screen="exams"/>;
 return <DashboardShell>{location.pathname==="/lessons/view"?<StoredLesson/>:<Page/>}</DashboardShell>;
}
function StoredLesson(){return <CourseWorkspace screen="lesson" lessonId={new URLSearchParams(location.search).get('id')||''}/>;}
