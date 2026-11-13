import TeacherConversation from '../TeacherConversation';
import ClassEventEditor from '../ClassEventEditor';
import StudioBlockFields from '../StudioBlockFields';
import LessonExperience from '../LessonExperience';
import LessonCode from '../LessonCode';
import PlatformShell from '../PlatformShell';
import CourseCatalog from '../CourseCatalog';
import TeacherDocumentChat from '../TeacherDocumentChat';
import TeacherProgress from '../TeacherProgress';
import {BookOpen, Box, Video, FileText, Code2, Image as ImageIcon, ListChecks, Trash2, Pencil, Settings, Save, Upload, Sparkles, Send, Bot, Info, Plus, ArrowUp, ArrowDown, Home, GripVertical, Link as LinkIcon, Play, Heading2, Quote, Minus, List, ChevronLeft} from 'lucide-react';
import './lesson-studio.css';
import {BlockText} from '../BlockText';
import {LessonCover,CoverPicker} from '../LessonCover';
import CourseWorkspace from '../CourseWorkspace';
import LiveTickets from '../LiveTickets';
import {api,type Row} from '../../src/live/api';
import {useEffect} from 'react';
import { useMemo, useState } from "react";

type Page = "خانه" | "درس‌ها" | "آزمون‌ها" | "تحلیل‌ها" | "پیام‌ها" | "دستیار";
type IconName =
  | "home"
  | "book"
  | "exam"
  | "chart"
  | "inbox"
  | "plus"
  | "search"
  | "bell"
  | "arrow"
  | "sparkle"
  | "users"
  | "clock"
  | "more"
  | "play"
  | "متن"
  | "کد"
  | "یادداشت"
  | "grip"
  | "send"
  | "check"
  | "eye";

const icons: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 10.8 12 3l9 7.8" />
      <path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  exam: (
    <>
      <path d="M9 5h6M9 2h6v6H9z" />
      <path d="M9 18h6M9 14h6" />
      <path d="M5 4H3v18h18V4h-2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 5h16l2 10v4H2v-4L4 5Z" />
      <path d="M2 15h6l2 3h4l2-3h6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
      <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4V8Z" />
    </>
  ),
  متن: (
    <>
      <path d="M5 5h14M12 5v14M8 19h8" />
    </>
  ),
  کد: (
    <>
      <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />
    </>
  ),
  یادداشت: (
    <>
      <path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h3" />
    </>
  ),
  grip: (
    <>
      <circle cx="8" cy="7" r="1" />
      <circle cx="16" cy="7" r="1" />
      <circle cx="8" cy="12" r="1" />
      <circle cx="16" cy="12" r="1" />
      <circle cx="8" cy="17" r="1" />
      <circle cx="16" cy="17" r="1" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icons[name]}
    </svg>
  );
}

const lessons = [
  {
    title: "مقدمه‌ای بر توسعه وب",
    class: "علوم کامپیوتر · پایه دهم",
    دانش‌آموز: 28,
    progress: 76,
    color: "#dfff82",
    status: "منتشرشده",
  },
  {
    title: "مبانی جاوااسکریپت",
    class: "علوم کامپیوتر · پایه دهم",
    دانش‌آموز: 26,
    progress: 48,
    color: "#d9d2ff",
    status: "پیش‌نویس",
  },
  {
    title: "ساختار اتم",
    class: "علوم · پایه نهم",
    دانش‌آموز: 31,
    progress: 89,
    color: "#bfe8ff",
    status: "منتشرشده",
  },
];

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="brand brand-light">
          <span className="brand-mark">ن</span>
          <span>نووا</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow light">آموزش با وضوح و اطمینان</p>
          <h1>
            هر درس را به تجربه‌ای
            <br />
            تبدیل کنید؛ <em>بدون مرز.</em>
          </h1>
          <p>
            تجربه‌های یادگیری ماندگار بسازید، هر دانش‌آموز را بهتر بشناسید و کارهای تکراری را به هوش
            مصنوعی بسپارید.
          </p>
        </div>
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="login-quote">
          <div className="quote-avatar">م‌س</div>
          <div>
            <strong>«نووا زمان بیشتری برای تدریس به من می‌دهد.»</strong>
            <span>مریم سانتوس · دبیر زیست‌شناسی</span>
          </div>
        </div>
      </section>
      <section className="login-form-wrap">
        <form
          className="login-form"
          onSubmit={async (e) => {
            e.preventDefault();
            try {await api("/login",{username:email,password});onLogin()}catch(error){alert(String(error))}
          }}
        >
          <div className="mobile-brand brand">
            <span className="brand-mark">ن</span>
            <span>نووا</span>
          </div>
          <p className="eyebrow">پنل ویژه معلمان</p>
          <h2>خوش آمدید.</h2>
          <p className="muted">برای ورود به فضای کاری خود، وارد حساب شوید.</p>
          <label>
            نام کاربری
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" required />
          </label>
          <label>
            رمز عبور <span>رمز عبور را فراموش کرده‌اید؟</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          <button className="primary-btn login-btn">
            ورود به نووا <Icon name="arrow" size={18} />
          </button>
          <p className="login-help">
            به کمک نیاز دارید؟ <button type="button">با مدیر سامانه تماس بگیرید</button>
          </p>
        </form>
      </section>
    </main>
  );
}

function Sidebar({ page, setPage }: { page: Page; setPage: (page: Page) => void }) {
  const [profile,setProfile]=useState('');useEffect(()=>{api('/me').then(r=>setProfile(r.user.name)).catch(()=>{})},[]);
  const nav: { label: Page; icon: IconName }[] = [
    { label: "خانه", icon: "home" },
    { label: "درس‌ها", icon: "book" },
    { label: "آزمون‌ها", icon: "exam" },
    { label: "تحلیل‌ها", icon: "chart" },
    { label: "پیام‌ها", icon: "inbox" },
    { label: "دستیار", icon: "sparkle" },
  ];
  return (
    <aside className="sidebar">

      <nav>
        <span className="nav-label">فضای کاری</span>
        {nav.map((item) => (
          <button
            key={item.label}
            aria-label={item.label==='تحلیل‌ها'?'پیشرفت دانش‌آموزان':item.label==='پیام‌ها'?'تیکت‌ها':item.label}
            className={page === item.label ? "active" : ""}
            onClick={() => setPage(item.label)}
          >
            <Icon name={item.icon} />
            <span>{item.label==='تحلیل‌ها'?'پیشرفت دانش‌آموزان':item.label==='پیام‌ها'?'تیکت‌ها':item.label}</span>
            
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade">
          <span className="spark">
            <Icon name="sparkle" size={17} />
          </span>
          <strong>دستیار آموزشی</strong>
          <p>۱۲ تولید محتوا باقی مانده</p>
          <div>
            <i style={{ width: "68%" }} />
          </div>
        </div>
        <button className="profile">
          <span className="avatar">{profile.slice(0,1)||'م'}</span>
          <span>
            <strong>{profile||'مدرس'}</strong>
            <small>معلم</small>
          </span>
          <Icon name="more" size={18} />
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title, onNew }: { title: string; onNew: () => void }) {
  return (
    <header className="topbar">
      <div>
        <span>فضای کاری معلم</span>
        <h1>{title}</h1>
      </div>
      <div className="top-actions">
        <label className="search">
          <Icon name="search" size={17} />
          <input placeholder="جست‌وجو در همه‌جا..." />
        </label>
        <button className="icon-btn">
          <Icon name="bell" size={19} />
          <i />
        </button>
        <button className="primary-btn" onClick={onNew}>
          <Icon name="plus" size={18} /> ایجاد جدید
        </button>
      </div>
    </header>
  );
}

function خانه({ goدرس‌ها }: { goدرس‌ها: () => void }) {
  return (
    <div className="page-stack">
      <section className="hero">
        <div>
          <p className="eyebrow light">دوشنبه، ۶ اسفند</p>
          <h2>
            صبح بخیر، علی.
            <br />
            <em>آماده‌ای الهام‌بخش باشی؟</em>
          </h2>
          <p>امروز ۳ کلاس و ۸ تکلیف در انتظار بررسی دارید.</p>
          <button className="light-btn" onClick={goدرس‌ها}>
            ساخت درس <Icon name="arrow" size={18} />
          </button>
        </div>
        <div className="hero-art">
          <div className="sun" />
          <div className="book-art">
            <span />
            <span />
            <span />
          </div>
          <div className="float-card fc1">
            <Icon name="sparkle" size={16} /> هوش مصنوعی آماده است
          </div>
          <div className="float-card fc2">
            8 <small>برای بررسی</small>
          </div>
        </div>
      </section>
      <section className="stats-grid">
        <Stat
          icon="users"
          label="دانش‌آموز فعال"
          value="84"
          یادداشت="۶+ نفر در این ماه"
          tone="green"
        />
        <Stat
          icon="book"
          label="درس منتشرشده"
          value="12"
          یادداشت="۳ درس در حال تکمیل"
          tone="purple"
        />
        <Stat
          icon="exam"
          label="بررسی‌های معلق"
          value="8"
          یادداشت="مهلت تا پایان هفته"
          tone="orange"
        />
        <Stat
          icon="chart"
          label="میانگین نمره"
          value="82%"
          یادداشت="۴٫۲٪+ نسبت به ماه قبل"
          tone="blue"
        />
      </section>
      <div className="content-split">
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">محتوای شما</p>
              <h3>درس‌های اخیر</h3>
            </div>
            <button onClick={goدرس‌ها}>
              مشاهده همه <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="lesson-list">
            {lessons.map((lesson, i) => (
              <div className="lesson-row" key={lesson.title}>
                <span className="lesson-icon" style={{ background: lesson.color }}>
                  <Icon name={i === 2 ? "sparkle" : "book"} size={21} />
                </span>
                <div className="lesson-info">
                  <strong>{lesson.title}</strong>
                  <span>{lesson.class}</span>
                </div>
                <span className={"status " + lesson.status.toLowerCase()}>{lesson.status}</span>
                <div className="mini-progress">
                  <span>{lesson.progress}%</span>
                  <div>
                    <i style={{ width: `${lesson.progress}%` }} />
                  </div>
                </div>
                <button className="more-btn">
                  <Icon name="more" size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="panel agenda">
          <div className="panel-head">
            <div>
              <p className="eyebrow">امروز</p>
              <h3>برنامه امروز</h3>
            </div>
            <button className="date-box">24</button>
          </div>
          <div className="timeline">
            <Agenda time="09:00" color="#a6d65b" title="توسعه وب" room="پایه دهم · کلاس ۲۰۴" />
            <Agenda
              time="11:30"
              color="#8c7ceb"
              title="آزمایشگاه علوم"
              room="پایه نهم · آزمایشگاه ۲"
            />
            <Agenda time="14:00" color="#f0a76a" title="بررسی تکالیف" room="۸ تکلیف" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  یادداشت,
  tone,
}: {
  icon: IconName;
  label: string;
  value: string;
  یادداشت: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <span className={"stat-icon " + tone}>
        <Icon name={icon} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{یادداشت}</small>
      </div>
    </div>
  );
}
function Agenda({
  time,
  color,
  title,
  room,
}: {
  time: string;
  color: string;
  title: string;
  room: string;
}) {
  return (
    <div className="agenda-item">
      <span>{time}</span>
      <i style={{ background: color }} />
      <div>
        <strong>{title}</strong>
        <small>{room}</small>
      </div>
    </div>
  );
}

function mediaSource(raw:string,video:boolean){
  let value=raw.trim();
  if(video && value.startsWith('<')){
    const template=document.createElement('template');
    template.innerHTML=value;
    value=template.content.querySelector('iframe')?.getAttribute('src')||'';
  }
  if(video && /^[a-zA-Z0-9]{12}$/.test(value))return 'https://stream.novextech.ir/'+value;
  try{
    const url=new URL(value);
    if(url.protocol!=='https:'||url.username||url.password)return '';
    if(video&&(url.port||! /^(?:stream\.novextech\.ir|(?:[a-z0-9-]+\.)*kavimo\.(?:com|ir))$/.test(url.hostname)))return '';
    return url.href;
  }catch{return ''}
}
type Block = {
  original?:Row;
  source?:string;requiresUrl?:boolean;description?:string;
  starter?:string;sampleAnswer?:string;feedback?:string;options?:string[];correct?:number;explanation?:string;
  id: number;
  type: "ویدیو" | "متن" | "کد" | "یادداشت" | "تصویر" | "تمرین" | "عنوان" | "فهرست" | "نقل‌قول" | "جداکننده" | "توضیح تکمیلی" | "جمع‌بندی" | "سؤال";
  fontSize?:number;
  textMarks?:Row[];
  title: string;
  content: string;
};
const initialBlocks: Block[] = [
 {id:1,type:'ویدیو',title:'آشنایی با متغیرها',content:'ویدیوی آموزشی آشنایی با متغیرها'},
 {id:2,type:'متن',title:'متغیر چیست؟',content:'متغیر محلی برای نگهداری داده‌ها در برنامه است.'},
 {id:3,type:'کد',title:'مثال ساده از متغیر',content:'name = "Nova"\nprint(name)'},
];
const libraryBlocks = [
 {type:'ویدیو',label:'ویدیو',description:'افزودن ویدیوی آموزشی به درس',icon:Video},
 {type:'متن',label:'متن و یادداشت',description:'نوشتن توضیحات، نکات و آموزش‌ها',icon:FileText},
 {type:'کد',label:'کد نمونه',description:'توضیح مثال، کد قابل اجرا و نمایش خروجی',icon:Code2},
 {type:'تمرین',label:'تمرین عملی',description:'صورت تمرین، کد شروع، پاسخ نمونه و بازخورد',icon:ListChecks},
 {type:'تصویر',label:'تصویر',description:'افزودن تصویر و نمودار آموزشی',icon:ImageIcon},
 {type:'سؤال',label:'سوال چهار گزینه',description:'تعریف سؤال، گزینه‌ها، پاسخ صحیح و توضیح پاسخ',icon:ListChecks},
] as const;

function درس‌هاPage() {
  const [builder, setBuilder] = useState(()=>new URLSearchParams(location.search).get('newLesson')==='1');
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selected, setSelected] = useState(2);
  const [chapter,setChapter]=useState('');
  const [chapters,setChapters]=useState<Row[]>([]);
  const [playing,setPlaying]=useState<number|null>(null);
  const [dropActive,setDropActive]=useState(false);
  const [toast, setToast] = useState("");
  
  const [courses,setCourses]=useState<Row[]>([]);
  const [course,setCourse]=useState("");
  const [saved,setSaved]=useState<Row|null>(null);
  const [serverLessons,setServerLessons]=useState<Row[]>([]);
  const [title,setTitle]=useState("آشنایی با متغیرها");
  const [preview,setPreview]=useState(false);const [aiTarget,setAiTarget]=useState<Row|null>(null);const [completion,setCompletion]=useState({video:true,practice:true,quiz:true,gateNext:true});const [passScore,setPassScore]=useState(70);
  const [cover,setCover]=useState<Row|null>(null);
  const [references,setReferences]=useState<string[]>(['']);
  const [examId,setExamId]=useState('');
  const [summary,setSummary]=useState('در این درس با تعریف و کاربرد متغیرها آشنا می‌شوید.'),[keywords,setKeywords]=useState(''),[difficulty,setDifficulty]=useState('beginner'),[duration,setDuration]=useState(20);
  const [exams,setExams]=useState<Row[]>([]);
  const [textSelection,setTextSelection]=useState({blockId:0,start:0,end:0});
  const [loadedDoc,setLoadedDoc]=useState<Row|null>(null);
  const [media,setMedia]=useState<Row[]>([]);
  useEffect(()=>{api("/media").then(r=>setMedia(r.media)).catch(e=>setToast(e.message))},[]);
  const [question,setQuestion]=useState("متغیر در پایتون چه کاربردی دارد؟");
  const [right,setRight]=useState("نگهداری داده‌ها");
  const [wrong,setWrong]=useState("تنها نمایش تصویر");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{api("/courses").then(r=>{setCourses(r.courses);setCourse(r.courses[0]?.id||"")}).catch(e=>setToast(e.message))},[]);
  useEffect(()=>{if(!course)return;let active=true;api("/courses/"+course).then(r=>{if(active)setServerLessons(r.lessons)}).catch(e=>setToast(e.message));return()=>{active=false}},[course,builder]);
  useEffect(()=>{setExams([]);setExamId('');if(!course)return;const c=new AbortController();api('/courses/'+course+'/exams',undefined,c.signal).then(r=>setExams(r.exams)).catch(e=>{if(e.name!=='AbortError')setToast(e.message)});return()=>c.abort()},[course]);
  useEffect(()=>{if(!course)return;let active=true;api('/courses/'+course+'/structure').then(r=>{if(active){setChapters(r.modules);setChapter(r.modules[0]?.id||'')}}).catch(e=>{if(active)setToast(e.message)});return()=>{active=false}},[course]);
  function resetBuilder(){setSaved(null);setLoadedDoc(null);setCompletion({video:true,practice:true,quiz:true,gateNext:true});setPassScore(70);setCover(null);setReferences(['']);setExamId('');setSummary('در این درس با تعریف و کاربرد متغیرها آشنا می‌شوید.');setKeywords('');setDifficulty('beginner');setDuration(20);setTitle('آشنایی با متغیرها');setBlocks(initialBlocks.map(b=>({...b})));setSelected(2);setChapter(chapters[0]?.id||'');setPlaying(null);setBuilder(true)}
  function applyTextSize(fontSize:number){setBlocks(bs=>bs.map(b=>{if(b.id!==selected)return b;if(textSelection.blockId===b.id&&textSelection.end>textSelection.start){const mark={start:textSelection.start,end:textSelection.end,fontSize};return {...b,textMarks:[...(b.textMarks||[]).flatMap(m=>m.end<=mark.start||m.start>=mark.end?[m]:[...(m.start<mark.start?[{...m,end:mark.start}]:[]),...(m.end>mark.end?[{...m,start:mark.end}]:[])]),mark].sort((a,b)=>a.start-b.start)}}return {...b,fontSize}}))}
  async function save(publish:boolean){
    if(busy)return;
    setBusy(true);
    try{
      if(!course)throw Error("ابتدا یک دوره انتخاب کنید.");
      const sampleVideo=media.find(m=>m.course_id===course&&m.status==='approved'&&m.mime.startsWith('video/'));
      const content=blocks.map(b=>{
        const base={...b.original,pendingMedia:b.requiresUrl&&!b.source?true:undefined,description:b.description,starter:b.starter,sampleAnswer:b.sampleAnswer,feedback:b.feedback,options:b.options,correct:b.correct,explanation:b.explanation,id:String(b.original?.id||b.id),title:b.title,body:b.content,fontSize:b.fontSize,textMarks:b.textMarks,variant:b.type==='فهرست'?'list':b.type==='نقل‌قول'?'quote':b.type==='جداکننده'?'divider':undefined};
        if(b.type==="ویدیو"){if(b.requiresUrl&&!b.source?.trim())return {...base,kind:'video',pendingMedia:true};
          if(b.original?.sourceUrl&&b.original.sourceUrl===b.source)return {...base,kind:'video',sourceUrl:b.source};
          if(!b.source?.trim()&&b.original?.mediaId)return {...base,kind:'video',mediaId:b.original.mediaId};
          if(!b.source?.trim()&&sampleVideo)return {...base,kind:'video',sourceUrl:'/api/platform/files/'+sampleVideo.id};
          const embedUrl=mediaSource(b.source||'',true);
          if(!embedUrl)throw Error('کد iframe کاویمو را در بلوک ویدیو وارد کنید.');
          return {...base,kind:'video',embedUrl};
        }
        if(b.type==="تصویر"){
          const imageUrl=mediaSource(b.source||'',false);
          if(!imageUrl)throw Error('نشانی HTTPS تصویر را در بلوک تصویر وارد کنید.');
          return {...base,kind:'image',imageUrl};
        }
        return {...base,kind:b.type==='تمرین'?'exercise':b.type==='سؤال'?'mcq':b.type==='توضیح تکمیلی'?'explanation':b.type==='جمع‌بندی'?'summary':b.type==='کد'?'code':b.type==='یادداشت'?'note':b.type==='عنوان'||b.original?.kind==='heading'?'heading':'text'};
      });
      const doc={...loadedDoc,title,cover,completion,metadata:{summary,keywords,difficulty,durationMinutes:duration},references:references.map(r=>r.trim()).filter(Boolean),examId:examId||null,blocks:content,exercise:{...loadedDoc?.exercise,prompt:blocks.find(b=>b.type==="تمرین")?.content||loadedDoc?.exercise?.prompt||"یک مثال از این درس بنویسید.",starter:blocks.find(b=>b.type==="تمرین")?.starter||blocks.find(b=>b.type==="کد")?.content||""},quiz:[{prompt:question,options:[right,wrong,...(loadedDoc?.quiz?.[0]?.options?.filter((o:string)=>o!==right&&o!==wrong)||[])],correct:0},...(loadedDoc?.quiz?.slice(1)||[])],passScore};
      const result=saved?await api('/lessons/'+saved.id,{...doc,draftRev:saved.rev}):await api('/courses/'+course+'/lessons',doc);
      const record={id:saved?.id||result.id,rev:result.draftRev||1};
      setSaved(record);
      const structure=await api('/courses/'+course+'/structure');
      if((structure.layout.find((x:Row)=>x.lesson_id===record.id)?.module_id||'')!==chapter){await api('/courses/'+course+'/organize',{revision:structure.revision,order:structure.order,chapterOrder:structure.modules.map((m:Row)=>m.id),layout:[...structure.layout.filter((x:Row)=>x.lesson_id!==record.id).map((x:Row)=>({lessonId:x.lesson_id,moduleId:x.module_id})),{lessonId:record.id,moduleId:chapter||null}],prerequisites:structure.prerequisites.map((x:Row)=>({lessonId:x.lesson_id,requires:x.required_id}))});}
      if(publish)await api('/lessons/'+record.id+'/publish',{draftRev:record.rev});
      setToast(publish?"درس منتشر شد":"پیش‌نویس ذخیره شد");return record;
    }catch(error){setToast(String(error));return null}finally{setBusy(false)}
  }
  async function openSaved(id:string){try{const record=await api('/lessons/'+id);const d=record.content;setLoadedDoc(d);setCompletion(d.completion||{video:true,practice:true,quiz:true,gateNext:true});setPassScore(d.passScore||70);setCover(d.cover||null);setReferences(d.references||[]);setExamId(d.examId||'');setSummary(d.metadata?.summary||'');setKeywords(d.metadata?.keywords||'');setDifficulty(d.metadata?.difficulty||'beginner');setDuration(d.metadata?.durationMinutes||20);setTitle(d.title);setSaved({id,rev:record.draftRev});const layout=await api('/courses/'+course+'/structure');setChapter(layout.layout.find((x:Row)=>x.lesson_id===id)?.module_id||'');setBlocks(d.blocks.map((b:Row,i:number)=>({id:i+1,original:b,requiresUrl:b.pendingMedia===true,description:b.description,starter:b.starter,sampleAnswer:b.sampleAnswer,feedback:b.feedback,options:b.options,correct:b.correct,explanation:b.explanation,fontSize:b.fontSize,textMarks:b.textMarks,type:b.kind==='heading'?'عنوان':b.variant==='list'?'فهرست':b.variant==='quote'?'نقل‌قول':b.variant==='divider'?'جداکننده':({video:'ویدیو',image:'تصویر',code:'کد',note:'یادداشت',exercise:'تمرین',mcq:'سؤال',explanation:'توضیح تکمیلی',summary:'جمع‌بندی'} as Record<string,Block['type']>)[b.kind]||'متن',title:b.title,content:b.body,source:b.embedUrl||b.sourceUrl||b.imageUrl||''})));if(d.quiz?.[0]){setQuestion(d.quiz[0].prompt);setRight(d.quiz[0].options[d.quiz[0].correct]);setWrong(d.quiz[0].options.find((_:string,i:number)=>i!==d.quiz[0].correct)||'');}setBuilder(true);}catch(e){setToast(String(e));}}
  function dropBlock(from:number,to:number){setBlocks(prev=>{const next=[...prev],i=next.findIndex(b=>b.id===from),j=next.findIndex(b=>b.id===to);if(i<0||j<0||i===j)return prev;const [item]=next.splice(i,1);next.splice(j,0,item);return next});setSelected(from)}
  const move = (index: number, dir: number) => {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  };
  const addBlock = (type: Block["type"]) => {
    const map = {
      ویدیو: ["ویدیوی آموزشی جدید", "کد ویدیو را در تنظیمات بلوک وارد کنید"],
      متن: ["بلوک متنی جدید", "نوشتن محتوای درس را شروع کنید..."],
      کد: ["مثال کدنویسی", "# کد پایتون خود را اینجا بنویسید"],
      یادداشت: ["نکته کوتاه", "یک یادآوری مفید اضافه کنید..."],
      تصویر: ["تصویر آموزشی", "برای تصویر، عنوان و توضیح جایگزین بنویسید."],
      تمرین: ["تمرین کلاسی", "دستورالعمل تمرین را برای دانش‌آموزان بنویسید."],
      "توضیح تکمیلی":["توضیح تکمیلی","مفهوم را با یک مثال روشن توضیح دهید."],"جمع‌بندی":["جمع‌بندی هوشمند","نکات کلیدی و ارتباط مفاهیم این درس را بنویسید."],"سؤال":["سؤال چهارگزینه‌ای","کدام گزینه صحیح است؟"],
      عنوان:["عنوان بخش",""],فهرست:["فهرست نکات","نکته اول\nنکته دوم"],"نقل‌قول":["نقل‌قول","متن نقل‌قول"],جداکننده:["جداکننده",""],
    };
    const block = {
      id: Date.now(),
      type,
      title: map[type][0],
      content: map[type][1],description:type==='کد'?'':undefined,starter:type==='تمرین'?'# کد پاسخ را اینجا بنویسید':undefined,sampleAnswer:type==='تمرین'?'':undefined,feedback:type==='تمرین'?'پس از اجرا، نتیجه را با خواسته تمرین مقایسه کنید.':undefined,options:type==='سؤال'?['گزینه اول','گزینه دوم','گزینه سوم','گزینه چهارم']:undefined,correct:0,explanation:'',
    };
    setBlocks([...blocks, block]);
    setSelected(block.id);
  };
  const typeKinds:Record<string,string>={'ویدیو':'video','تصویر':'image','کد':'code','یادداشت':'note','عنوان':'heading','تمرین':'exercise','سؤال':'mcq','توضیح تکمیلی':'explanation','جمع‌بندی':'summary'};
  function draftBlocks(){return blocks.map(b=>({...b.original,pendingMedia:b.requiresUrl&&!b.source?true:undefined,id:String(b.original?.id||b.id),kind:typeKinds[b.type]||'text',title:b.title,body:b.content,fontSize:b.fontSize,textMarks:b.textMarks,description:b.description,starter:b.starter,sampleAnswer:b.sampleAnswer,feedback:b.feedback,options:b.options,correct:b.correct,explanation:b.explanation,...(b.type==='ویدیو'?{sourceUrl:b.source?.startsWith('/api/')?b.source:!b.requiresUrl&&!b.source&&!b.original?.mediaId&&media.find(m=>m.course_id===course&&m.status==='approved'&&m.mime.startsWith('video/'))?'/api/platform/files/'+media.find(m=>m.course_id===course&&m.status==='approved'&&m.mime.startsWith('video/'))!.id:undefined,embedUrl:mediaSource(b.source||'',true)||undefined}:b.type==='تصویر'?{imageUrl:mediaSource(b.source||'',false)||undefined}:{}),variant:b.type==='فهرست'?'list':b.type==='نقل‌قول'?'quote':b.type==='جداکننده'?'divider':undefined}));}
  function applyProposal(operations:Row[],snapshot:Row[]){const now=draftBlocks();if(JSON.stringify(now)!==JSON.stringify(snapshot))throw Error('محتوا پس از درخواست تغییر کرده است؛ دوباره پیشنهاد بگیرید.');setBlocks(previous=>{let next=[...previous];for(const op of operations){const b=op.block;const type=Object.keys(typeKinds).find(k=>typeKinds[k]===b.kind)||'متن';if(op.action==='update'){const index=next.findIndex(x=>String(x.original?.id||x.id)===op.target);if(index<0)continue;next[index]={...next[index],title:b.title,content:b.body,textMarks:undefined,description:b.description,starter:b.starter,sampleAnswer:b.sampleAnswer,feedback:b.feedback,options:b.options,correct:b.correct,explanation:b.explanation};}else next.push({id:Date.now()+next.length,requiresUrl:b.pendingMedia===true,type:type as Block['type'],title:b.title,content:b.body,textMarks:undefined,description:b.description,starter:b.starter,sampleAnswer:b.sampleAnswer,feedback:b.feedback,options:b.options,correct:b.correct,explanation:b.explanation});}return next});setToast('پیشنهاد با تأیید شما در پیش‌نویس اعمال شد؛ برای انتشار ذخیره کنید.');}
  function renderMedia(b:Block){
    const video=b.type==='ویدیو';
    if(video&&/^\/api\/platform\/files\/[a-f0-9-]{36}$/.test(b.source||''))return <video controls preload="metadata" style={{width:'100%'}} src={b.source}/>;
    const src=mediaSource(b.source||'',video);
    if(!src&&video&&!b.source?.trim()&&!b.requiresUrl){
      const sample=media.find(m=>m.course_id===course&&m.status==='approved'&&m.mime.startsWith('video/'));
      if(sample)return <video controls preload="metadata" style={{width:'100%'}} src={'/api/platform/files/'+sample.id}/>;
    }
    if(!src)return <small>{b.source?'نشانی معتبر نیست':'رسانه‌ای انتخاب نشده است'}</small>;
    return video?<iframe title={b.title} src={src} allowFullScreen style={{width:'100%',aspectRatio:'16/9',border:0}}/>:<img alt={b.title} src={src} style={{maxWidth:'100%'}}/>;
  }
  if(preview){const bs=draftBlocks();const qs=bs.filter(b=>b.kind==='mcq').map(b=>({prompt:b.body||b.title,options:b.options,correct:b.correct,explanation:b.explanation}));const doc={title,cover,metadata:{summary,durationMinutes:duration},blocks:bs,exercise:{prompt:bs.some(b=>b.kind==='exercise')?'':loadedDoc?.exercise?.prompt||'یک مثال از این درس بنویسید.',starter:loadedDoc?.exercise?.starter||''},quiz:qs.length?qs:loadedDoc?.quiz||[{prompt:question,options:[right,wrong],correct:0}],passScore};return <section className="lesson-studio studio-preview" dir="rtl"><header className="studio-header"><h1>پیش‌نمایش درس</h1><button className="studio-button" onClick={()=>setPreview(false)}>بازگشت به ویرایش</button></header><main className="studio-preview-content"><LessonExperience doc={doc} preview/></main></section>;}
  if(!builder)return <CourseCatalog role="teacher" courseId={course} onCourseChange={setCourse} onEditLesson={id=>void openSaved(id)} onCreateLesson={mid=>{resetBuilder();setChapter(mid)}}/>;
  return (
    <section className="lesson-studio" dir="rtl" aria-label="سازنده درس">
      <header className="studio-header">
        <button className="studio-brand" onClick={()=>setBuilder(false)} aria-label="بازگشت به مدیریت درس‌ها"><BookOpen size={38}/><strong>نووا</strong></button>
        <nav className="studio-breadcrumb" aria-label="مسیر صفحه"><Home size={17}/><span>‹</span><span>{courses.find(c=>c.id===course)?.title||'دوره پایتون'}</span><span>/</span><button onClick={()=>setBuilder(false)}>مدیریت درس‌ها</button></nav>
        <h1>{saved?'ویرایش درس':'ساخت درس جدید'}</h1>
        <div className="studio-header-actions"><button className="studio-button" onClick={()=>setPreview(true)}><Icon name="eye" size={20}/>پیش‌نمایش</button><button className="studio-button studio-primary" disabled={busy} onClick={()=>void save(false)}><Upload size={19}/>{busy?'در حال ذخیره…':'ذخیره پیش‌نویس'}</button></div>
      </header>
      {toast&&<div className="studio-notice" role="status">{toast}<button aria-label="بستن پیام" onClick={()=>setToast('')}>×</button></div>}
      <div className="studio-workspace">
        <aside className="studio-panel studio-library" aria-label="کتابخانه بلوک‌ها">
          <div className="studio-panel-heading"><span className="studio-heading-icon"><Box size={25}/></span><div><h2>بلوک‌های محتوا</h2><p>بکشید و به درس اضافه کنید</p></div></div>
          <div className="studio-library-list">
            {libraryBlocks.map(({type,label,description,icon:ItemIcon})=><button key={type} className="studio-library-item" draggable onDragStart={e=>{e.dataTransfer.effectAllowed='copy';e.dataTransfer.setData('application/x-nova-library',type)}} onClick={()=>addBlock(type)}><span className="studio-library-icon"><ItemIcon size={29}/></span><span><strong>{label}</strong><small>{description}</small></span><GripVertical size={23} className="studio-grip"/></button>)}
            <button className="studio-library-item" onClick={()=>document.getElementById('studio-exam')?.focus()}><span className="studio-library-icon"><ListChecks size={29}/></span><span><strong>آزمون</strong><small>افزودن آزمون و ارزیابی یادگیری</small></span><GripVertical size={23} className="studio-grip"/></button>
          </div>
          <div className="studio-library-help"><Info size={21}/><p>برای افزودن هر بلوک، آن را با موس بکشید و در بخش محتوای درس رها کنید. با کلیک هم می‌توانید اضافه کنید.</p></div>
          <details className="studio-more-blocks"><summary>بلوک‌های بیشتر <Plus size={16}/></summary><div>{([{type:'یادداشت',icon:FileText},{type:'عنوان',icon:Heading2},{type:'فهرست',icon:List},{type:'نقل‌قول',icon:Quote},{type:'جداکننده',icon:Minus},{type:'توضیح تکمیلی',icon:BookOpen},{type:'جمع‌بندی',icon:Sparkles}] as const).map(({type,icon:MoreIcon})=><button key={type} onClick={()=>addBlock(type)}><MoreIcon size={17}/>{type}</button>)}</div></details>
        </aside>
        <main className="studio-panel studio-canvas" aria-label="محتوای درس">
          <div className="studio-canvas-heading"><h2>محتوای درس</h2><span>{blocks.length.toLocaleString('fa-IR')} بلوک</span></div>
          <div className={'studio-blocks'+(dropActive?' is-dropping':'')} onDragOver={e=>{if(e.dataTransfer.types.includes('application/x-nova-library')){e.preventDefault();setDropActive(true)}}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setDropActive(false)}} onDrop={e=>{const type=e.dataTransfer.getData('application/x-nova-library');if(libraryBlocks.some(b=>b.type===type)){e.preventDefault();addBlock(type as Block['type'])}setDropActive(false)}}>
          {blocks.map((block,i)=>{
            const BlockIcon=block.type==='ویدیو'?Video:block.type==='کد'?Code2:block.type==='تصویر'?ImageIcon:block.type==='تمرین'?ListChecks:FileText;
            const isText=!['ویدیو','کد','تصویر','جداکننده'].includes(block.type);
            return <article key={block.id} data-block-id={block.id} className={'studio-block'+(selected===block.id?' is-selected':'')} onClick={()=>setSelected(block.id)} onDragOver={e=>{if(e.dataTransfer.types.includes('application/x-nova-block')){e.preventDefault();e.dataTransfer.dropEffect='move'}}} onDrop={e=>{const id=Number(e.dataTransfer.getData('application/x-nova-block'));if(id){e.preventDefault();e.stopPropagation();dropBlock(id,block.id)}}}>
              <div className="studio-block-heading"><button className="studio-icon-button studio-drag" aria-label={'کشیدن بلوک '+block.title} draggable onDragStart={e=>{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('application/x-nova-block',String(block.id))}} onPointerDown={e=>{if(e.pointerType==='touch')e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(e.pointerType==='touch'&&e.currentTarget.hasPointerCapture(e.pointerId)){if(e.clientY>window.innerHeight-60)window.scrollBy(0,12);else if(e.clientY<80)window.scrollBy(0,-12)}}} onPointerUp={e=>{if(e.pointerType==='touch'){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-block-id]');if(target)dropBlock(block.id,Number(target.getAttribute('data-block-id')))}}}><GripVertical size={21}/></button><BlockIcon size={23}/><strong>{block.type==='متن'||block.type==='یادداشت'?'متن و یادداشت':block.type==='ویدیو'?'ویدیو آموزشی':block.type==='کد'?'کد نمونه':block.type==='تمرین'?'تمرین عملی':block.type}</strong><div className="studio-block-actions"><button className="studio-icon-button" aria-label={'ویرایش با هوش مصنوعی '+block.title} title="ویرایش با هوش مصنوعی" onClick={e=>{e.stopPropagation();setAiTarget({id:String(block.original?.id||block.id),title:block.title,kind:typeKinds[block.type]||'text',nonce:Date.now()});document.getElementById('document-question-compact')?.focus()}}><Sparkles size={18}/></button><button className="studio-icon-button studio-move" disabled={i===0} aria-label={'انتقال '+block.title+' به بالا'} onClick={e=>{e.stopPropagation();move(i,-1)}}><ArrowUp size={16}/></button><button className="studio-icon-button studio-move" disabled={i===blocks.length-1} aria-label={'انتقال '+block.title+' به پایین'} onClick={e=>{e.stopPropagation();move(i,1)}}><ArrowDown size={16}/></button><button className="studio-icon-button" aria-label={'ویرایش '+block.title} onClick={e=>{setSelected(block.id);const details=e.currentTarget.closest('article')?.querySelector('details');if(details)details.open=true;document.getElementById('studio-title-'+block.id)?.focus()}}><Pencil size={20}/></button><button className="studio-icon-button studio-delete" aria-label={'حذف بلوک '+block.title} onClick={e=>{e.stopPropagation();setBlocks(bs=>bs.filter(b=>b.id!==block.id));setSelected(0)}}><Trash2 size={19}/></button></div></div>
              {block.type==='ویدیو'?<div className="studio-video-block">{playing===block.id?<div className="studio-playing">{renderMedia(block)}<button className="studio-button" onClick={()=>setPlaying(null)}>بازگشت به جلد ویدیو</button></div>:<button className="studio-video-poster" aria-label={'پخش '+block.title} onClick={()=>setPlaying(block.id)}><div className="studio-python-logo"><img src="/assets/python-logo.svg" alt="پایتون"/></div><span className="studio-play"><Play size={30} fill="currentColor"/></span><code dir="ltr">name = <em>"Nova"</em><br/><b>print</b>(name)</code><strong>{block.title}</strong></button>}<details className="studio-media-settings"><summary>تنظیم ویدیو و کد کاویمو</summary><label>عنوان ویدیو<input id={'studio-title-'+block.id} value={block.title} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,title:e.target.value}:b))}/></label><label>کد iframe یا نشانی پخش کاویمو<textarea dir="ltr" value={block.source||''} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,source:e.target.value}:b))}/></label><label>توضیح ویدیو<input value={block.content} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,content:e.target.value}:b))}/></label></details></div>:block.type==='تصویر'?<div className="studio-image-block"><label>عنوان تصویر<input id={'studio-title-'+block.id} value={block.title} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,title:e.target.value}:b))}/></label><label>نشانی HTTPS تصویر<input dir="ltr" type="url" value={block.source||''} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,source:e.target.value}:b))}/></label>{block.source&&renderMedia(block)}<label>توضیح جایگزین<textarea value={block.content} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,content:e.target.value}:b))}/></label></div>:block.type==='جداکننده'?<hr className="studio-divider"/>:<>
              {isText&&<div className="studio-text-toolbar"><label>اندازه متن<select aria-label={'اندازه فونت '+block.title} value={block.fontSize||16} onFocus={()=>setSelected(block.id)} onChange={e=>applyTextSize(Number(e.target.value))}>{[12,14,16,18,20,24,28,32,36].map(n=><option key={n} value={n}>{n.toLocaleString('fa-IR')}</option>)}</select></label><span>پاراگراف</span><button className="studio-icon-button" aria-label="تبدیل متن به فهرست" aria-pressed={block.type==='فهرست'} onClick={()=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,type:b.type==='فهرست'?'متن':'فهرست'}:b))}><List size={19}/></button><small>متن را انتخاب و اندازه را تنظیم کنید</small></div>}
              <div className={block.type==='کد'?'studio-code-body':'studio-text-body'}>{block.type==='کد'?<div className="studio-sample-code"><label>عنوان مثال<input id={'studio-title-'+block.id} value={block.title} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,title:e.target.value}:b))}/></label><label>توضیح مثال<textarea aria-label={'توضیح مثال '+block.title} value={block.description||''} maxLength={4000} placeholder="هدف مثال و نکته‌ای که دانش‌آموز باید یاد بگیرد…" onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,description:e.target.value}:b))}/></label><div className="studio-code-purpose"><Code2 size={16}/><span>مثال آموزشی · توضیح دهید، اجرا کنید و خروجی را بررسی کنید</span></div><LessonCode code={block.content} label={'کد نمونه '+block.title} filename="example.py" onChange={value=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,content:value}:b))}/></div>:<><input className="studio-block-title" id={'studio-title-'+block.id} aria-label={'عنوان بلوک '+block.title} value={block.title} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,title:e.target.value}:b))}/><textarea className="studio-body-editor" aria-label={(block.type==='تمرین'?'صورت تمرین ':'متن بلوک ')+block.title} placeholder={block.type==='تمرین'?'درخواست تمرین را توضیح دهید؛ کد اولیه را در ویرایشگر پایین وارد کنید.':undefined} value={block.content} style={{fontSize:(block.fontSize||16)+'px'}} onSelect={e=>setTextSelection({blockId:block.id,start:e.currentTarget.selectionStart,end:e.currentTarget.selectionEnd})} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,content:e.target.value,textMarks:[]}:b))}/>{!!block.textMarks?.length&&<div className="studio-formatted-text"><BlockText block={{body:block.content,textMarks:block.textMarks,variant:block.type==='فهرست'?'list':undefined}}/></div>}</>}</div></>}
            <StudioBlockFields block={block} change={patch=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,...patch}:b))}/>
            </article>
          })}
          <button className="studio-dropzone" onClick={()=>addBlock('متن')} onDragOver={e=>{if(e.dataTransfer.types.includes('application/x-nova-block'))e.preventDefault()}} onDrop={e=>{const id=Number(e.dataTransfer.getData('application/x-nova-block'));if(id&&blocks.length){e.preventDefault();e.stopPropagation();dropBlock(id,blocks[blocks.length-1].id)}}}><Plus size={23}/>بلوک جدید را اینجا رها کنید</button>
          </div>
        </main>
        <aside className="studio-panel studio-assistant"><TeacherDocumentChat key={course} blocks={draftBlocks()} editTarget={aiTarget} onApplyProposal={applyProposal} course={course} compact onApply={text=>{const id=Date.now();setBlocks(bs=>[...bs,{id,type:'یادداشت',title:'گزیده سند — نیازمند بازبینی',content:text}]);setSelected(id)}}/></aside>
      </div>
      <section className="studio-panel studio-settings" aria-labelledby="studio-settings-title"><h2 id="studio-settings-title"><Settings size={27}/>تنظیمات و ثبت درس</h2>
        <div className="studio-exam-row"><span>آزمون مرتبط</span><div className="studio-exam-actions"><label className="studio-exam-choice"><input type="radio" checked readOnly/>انتخاب آزمون آماده</label><button className="studio-button" onClick={()=>window.open('/?page=exams&course='+encodeURIComponent(course),'_blank','noopener')}><Plus size={18}/>ساخت آزمون جدید</button></div><div className="studio-exam-select"><select id="studio-exam" aria-label="آزمون مرتبط درس" value={examId} onChange={e=>setExamId(e.target.value)}><option value="">بدون آزمون مرتبط</option>{exams.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select><button className="studio-refresh" onClick={()=>api('/courses/'+course+'/exams').then(r=>setExams(r.exams)).catch(e=>setToast(e.message))}>تازه‌سازی</button></div></div>
        <div className="studio-settings-row"><label className="studio-setting-field"><span>نام درس</span><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={200}/></label><label className="studio-setting-field"><span>فصل</span><select aria-label="فصل درس" value={chapter} onChange={e=>setChapter(e.target.value)}><option value="">بدون فصل</option>{chapters.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select></label></div>
        <label className="studio-description"><span>توضیحات درس</span><textarea value={summary} maxLength={2000} onChange={e=>setSummary(e.target.value)} placeholder="توضیح کوتاهی درباره آنچه دانش‌آموز یاد می‌گیرد…"/></label>
        <details className="studio-advanced"><summary>تنظیمات بیشتر: دوره، جلد و پرسش درس</summary><div className="studio-advanced-grid"><label>دوره<select disabled={!!saved} value={course} onChange={e=>setCourse(e.target.value)}>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>لینک‌های مرجع درس<textarea value={references.join('\n')} onChange={e=>setReferences(e.target.value.split('\n'))} placeholder="هر لینک HTTPS در یک خط"/></label><label>موضوعات کلیدی<input value={keywords} maxLength={300} onChange={e=>setKeywords(e.target.value)}/></label><label>سطح<select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="beginner">مقدماتی</option><option value="intermediate">متوسط</option><option value="advanced">پیشرفته</option></select></label><label>زمان پیشنهادی به دقیقه<input type="number" min={1} max={600} value={duration} onChange={e=>setDuration(Number(e.target.value))}/></label><CoverPicker value={cover} onChange={setCover}/><div className="studio-quiz-fields"><label>پرسش آزمون درس<input value={question} onChange={e=>setQuestion(e.target.value)}/></label><label>پاسخ درست<input value={right} onChange={e=>setRight(e.target.value)}/></label><label>گزینه دیگر<input value={wrong} onChange={e=>setWrong(e.target.value)}/></label></div></div></details>
        <ClassEventEditor course={course} lesson={saved?.id}/><div className="studio-completion"><strong>شرایط تکمیل و ورود به جلسه بعد</strong>{(['video','practice','quiz','gateNext'] as const).map((k,i)=><label key={k}><input type="checkbox" checked={completion[k]} onChange={e=>setCompletion(c=>({...c,[k]:e.target.checked}))}/>{['تأیید مشاهده ویدیو','ارسال تمرین','قبولی آزمون','قفل جلسه بعد تا تکمیل این درس'][i]}</label>)}<label>حداقل قبولی<input type="number" min={1} max={100} value={passScore} onChange={e=>setPassScore(Number(e.target.value))}/></label></div><footer className="studio-bottom-actions"><span>{saved?'آخرین پیش‌نویس در حساب شما ذخیره شده است.':'پیش از انتشار، محتوا را در پیش‌نمایش بررسی کنید.'}</span><button className="studio-button" disabled={busy} onClick={()=>void save(false)}><Save size={20}/>ذخیره پیش‌نویس</button><button className="studio-button studio-primary" disabled={busy} onClick={()=>void save(true)}><Send size={20}/>{busy?'در حال ذخیره…':'ثبت و انتشار درس'}</button></footer>
      </section>
    </section>
  );
}

function آزمون‌هاPage(){return <CourseWorkspace screen="exams"/>;}
function SampleExamsPage() {
  const [creating, setCreating] = useState(false);
  const [questions, setQuestions] = useState([
    { id: 1, type: "چندگزینه‌ای", text: "HTML مخفف چیست؟", points: 2 },
    { id: 2, type: "پاسخ کوتاه", text: "نقش CSS را در یک جمله توضیح دهید.", points: 3 },
    { id: 3, type: "درست یا نادرست", text: "جاوااسکریپت فقط برای طراحی ظاهر صفحه است.", points: 1 },
  ]);
  const addQuestion = (type: string) => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        type,
        text: type === "بخش توضیحات" ? "راهنمای بخش جدید را بنویسید" : "سؤال بدون عنوان",
        points: type === "بخش توضیحات" ? 0 : 2,
      },
    ]);
  };
  return (
    <div className="page-stack">
      <section className="lessons-title">
        <div>
          <p className="eyebrow">ارزیابی‌ها</p>
          <h2>{creating ? "آزمون جدید بسازید." : "آزمون‌ها و بررسی‌ها."}</h2>
          <p>
            {creating
              ? "یک ارزیابی شفاف را سؤال‌به‌سؤال طراحی کنید."
              : "ارزیابی بسازید و پاسخ‌های دانش‌آموزان را بررسی کنید."}
          </p>
        </div>
        <button className="primary-btn big" onClick={() => setCreating(!creating)}>
          <Icon name={creating ? "arrow" : "plus"} size={19} />
          {creating ? "بازگشت به آزمون‌ها" : "آزمون جدید"}
        </button>
      </section>
      {creating ? (
        <div className="exam-builder">
          <section className="panel exam-main">
            <p className="eyebrow">جزئیات آزمون</p>
            <input className="title-input" defaultValue="توسعه وب — ارزیابی فصل" />
            <div className="two-fields">
              <label>
                کلاس
                <select>
                  <option>علوم کامپیوتر · پایه دهم</option>
                </select>
              </label>
              <label>
                مدت آزمون
                <input defaultValue="۴۵ دقیقه" />
              </label>
            </div>
            <div className="exam-block-picker">
              <div>
                <p className="eyebrow">افزودن اجزای آزمون</p>
                <span>نوع سؤال یا محتوای موردنیاز را انتخاب کنید</span>
              </div>
              {[
                ["چندگزینه‌ای", "exam"],
                ["پاسخ کوتاه", "متن"],
                ["درست یا نادرست", "check"],
                ["بخش توضیحات", "یادداشت"],
              ].map(([type, icon]) => (
                <button key={type} onClick={() => addQuestion(type)}>
                  <Icon name={icon as IconName} size={17} />
                  {type}
                </button>
              ))}
            </div>
            <div className="question-list">
              {questions.map((q, i) => (
                <div
                  className={`question-block ${q.type === "بخش توضیحات" ? "section-block" : ""}`}
                  key={q.id}
                >
                  <span>{i + 1}</span>
                  <div>
                    <small>
                      {q.type}
                      {q.points > 0 ? ` · ${q.points} نمره` : ""}
                    </small>
                    <input
                      value={q.text}
                      onChange={(e) =>
                        setQuestions(
                          questions.map((old) =>
                            old.id === q.id ? { ...old, text: e.target.value } : old,
                          ),
                        )
                      }
                    />
                    {q.type === "چندگزینه‌ای" && (
                      <div className="answers">
                        {["الف", "ب", "ج", "د"].map((answer) => (
                          <label key={answer}>
                            <i>{answer}</i>
                            <input placeholder="گزینه پاسخ" />
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === "پاسخ کوتاه" && (
                      <div className="short-answer-placeholder">
                        پاسخ دانش‌آموز در این بخش نوشته می‌شود
                      </div>
                    )}
                    {q.type === "درست یا نادرست" && (
                      <div className="boolean-options">
                        <button>درست</button>
                        <button>نادرست</button>
                      </div>
                    )}
                  </div>
                  <Icon name="grip" />
                </div>
              ))}
            </div>
            <button className="add-question" onClick={() => addQuestion("چندگزینه‌ای")}>
              <Icon name="plus" size={18} /> افزودن سؤال
            </button>
          </section>
          <aside className="panel publish-card">
            <div className="stat-icon green">
              <Icon name="exam" />
            </div>
            <h3>آماده انتشار است؟</h3>
            <p>دانش‌آموزان مطلع می‌شوند و در زمان تعیین‌شده می‌توانند شروع کنند.</p>
            <label>
              زمان شروع
              <input type="date" defaultValue="2025-03-03" />
            </label>
            <button className="primary-btn">انتشار آزمون</button>
            <button className="outline-btn">ذخیره پیش‌نویس</button>
          </aside>
        </div>
      ) : (
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">همه آزمون‌ها</p>
              <h3>ارزیابی‌های اخیر</h3>
            </div>
            <button>مشاهده بایگانی</button>
          </div>
          <div className="exam-table">
            <div className="table-head">
              <span>آزمون</span>
              <span>کلاس</span>
              <span>پاسخ‌ها</span>
              <span>میانگین</span>
              <span>وضعیت</span>
            </div>
            {[
              ["ارزیابی HTML و CSS", "پایه دهم", "24 / 28", "84%", "نیازمند بررسی"],
              ["آزمون ساختار اتم", "پایه نهم", "31 / 31", "78%", "تکمیل‌شده"],
              ["مبانی جاوااسکریپت", "پایه دهم", "0 / 26", "—", "پیش‌نویس"],
            ].map((r) => (
              <div className="table-row" key={r[0]}>
                {r.map((c, i) => (
                  <span key={c}>
                    {i === 0 ? (
                      <>
                        <b>{c}</b>
                        <small>به‌روزرسانی ۲ روز پیش</small>
                      </>
                    ) : i === 4 ? (
                      <em className={"status " + c.toLowerCase()}>{c}</em>
                    ) : (
                      c
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function تحلیل‌هاPage(){return <CourseWorkspace screen="analytics"/>;}
function SampleAnalyticsPage() {
  const bars = [52, 68, 61, 77, 74, 88, 82];
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const students = [
    ["س‌ا", "سارا احمدی", "96%", "92%", "عالی"],
    ["م‌ر", "محمد رضایی", "89%", "86%", "خیلی خوب"],
    ["ه‌ک", "هلیا کریمی", "84%", "81%", "خوب"],
    ["آ‌م", "آرین محمدی", "72%", "76%", "نیازمند تمرین"],
  ];
  if (selectedStudent !== null) {
    const student = students[selectedStudent];
    const paths = [
      "M0 72 C45 68 58 48 98 55 S155 34 195 40 S252 18 310 23",
      "M0 78 C42 74 66 66 105 62 S172 52 210 46 S270 40 310 32",
      "M0 82 C38 80 72 71 110 72 S168 62 210 58 S268 54 310 45",
      "M0 85 C45 82 68 78 104 80 S160 68 202 72 S260 62 310 60",
    ];
    return (
      <div className="page-stack">
        <section className="student-profile-head">
          <button className="back-btn" onClick={() => setSelectedStudent(null)}>
            <Icon name="arrow" size={17} /> بازگشت به نمای کلاس
          </button>
          <div className={`student-avatar av${selectedStudent}`}>{student[0]}</div>
          <div>
            <p className="eyebrow">گزارش اختصاصی دانش‌آموز</p>
            <h2>{student[1]}</h2>
            <span>پایه دهم · علوم کامپیوتر · شماره دانش‌آموزی ۱۰۲۸</span>
          </div>
          <button className="outline-btn">دریافت گزارش</button>
        </section>
        <div className="analytics-stats student-stats">
          <Stat
            icon="chart"
            label="میانگین کل"
            value={student[3]}
            یادداشت="۶٪ رشد در این ماه"
            tone="green"
          />
          <Stat
            icon="check"
            label="تمرین‌های کامل"
            value="۲۴ از ۲۶"
            یادداشت="۹۲٪ تکمیل"
            tone="purple"
          />
          <Stat
            icon="clock"
            label="زمان یادگیری"
            value="۱۸ ساعت"
            یادداشت="۲٫۵ ساعت این هفته"
            tone="orange"
          />
          <Stat
            icon="users"
            label="رتبه در کلاس"
            value={`${selectedStudent + 1} از ۲۸`}
            یادداشت="براساس میانگین کل"
            tone="blue"
          />
        </div>
        <div className="student-report-grid">
          <section className="panel personal-trend">
            <div className="panel-head">
              <div>
                <p className="eyebrow">روند یادگیری شخصی</p>
                <h3>پیشرفت در ۸ هفته اخیر</h3>
              </div>
              <span className="positive-chip">۱۲٪ رشد</span>
            </div>
            <div className="line-chart">
              <div className="line-grid">
                <span>۱۰۰</span>
                <span>۷۵</span>
                <span>۵۰</span>
                <span>۲۵</span>
              </div>
              <svg viewBox="0 0 310 100" preserveAspectRatio="none" aria-label="نمودار پیشرفت فردی">
                <defs>
                  <linearGradient id="studentArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#a8c775" stopOpacity=".42" />
                    <stop offset="1" stopColor="#a8c775" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${paths[selectedStudent]} L310 100 L0 100 Z`} fill="url(#studentArea)" />
                <path d={paths[selectedStudent]} fill="none" stroke="#789b4b" strokeWidth="3" />
              </svg>
              <div className="line-labels">
                {[
                  "هفته ۱",
                  "هفته ۲",
                  "هفته ۳",
                  "هفته ۴",
                  "هفته ۵",
                  "هفته ۶",
                  "هفته ۷",
                  "هفته ۸",
                ].map((week) => (
                  <span key={week}>{week}</span>
                ))}
              </div>
            </div>
          </section>
          <section className="panel skill-panel">
            <p className="eyebrow">نقشه مهارت‌ها</p>
            <h3>تسلط بر موضوعات</h3>
            {[
              ["HTML و ساختار صفحه", 94],
              ["CSS و طراحی بصری", 86],
              ["جاوااسکریپت", 72],
              ["حل مسئله", 81],
            ].map(([skill, value]) => (
              <div className="skill-row" key={skill}>
                <span>
                  {skill} <b>{value}٪</b>
                </span>
                <div>
                  <i style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </section>
        </div>
        <div className="student-report-grid lower">
          <section className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">آزمون‌ها و تمرین‌ها</p>
                <h3>عملکرد اخیر</h3>
              </div>
            </div>
            {[
              ["ارزیابی HTML و CSS", "آزمون", "۹۲٪", "۲ روز پیش"],
              ["ساخت صفحه معرفی", "تمرین", "۸۸٪", "۵ روز پیش"],
              ["مبانی جاوااسکریپت", "آزمون", "۷۸٪", "۱ هفته پیش"],
            ].map((item) => (
              <div className="performance-item" key={item[0]}>
                <span className="performance-icon">
                  <Icon name="check" size={16} />
                </span>
                <div>
                  <strong>{item[0]}</strong>
                  <small>
                    {item[1]} · {item[3]}
                  </small>
                </div>
                <b>{item[2]}</b>
              </div>
            ))}
          </section>
          <section className="panel ai-student-note">
            <span>
              <Icon name="sparkle" size={19} />
            </span>
            <div>
              <p className="eyebrow">تحلیل هوشمند نووا</p>
              <h3>پیشنهاد آموزشی شخصی</h3>
              <p>
                این دانش‌آموز در ساختار HTML عملکرد بسیار خوبی دارد؛ برای تقویت جاوااسکریپت، تمرین‌های
                کوتاه و مرحله‌ای پیشنهاد می‌شود.
              </p>
              <button className="outline-btn">ساخت برنامه تمرینی</button>
            </div>
          </section>
        </div>
      </div>
    );
  }
  return (
    <div className="page-stack">
      <section className="lessons-title">
        <div>
          <p className="eyebrow">بینش دانش‌آموزان</p>
          <h2>پیشرفت، به‌صورت شفاف.</h2>
          <p>ببینید دانش‌آموزان کجا پیشرفت کرده‌اند و کجا به همراهی شما نیاز دارند.</p>
        </div>
        <div className="report-controls">
          <div className="view-switch">
            <button className="active">نمای کلاس</button>
            <button onClick={() => setSelectedStudent(0)}>گزارش فردی</button>
          </div>
          <select className="period">
            <option>۳۰ روز گذشته</option>
            <option>این نیم‌سال</option>
          </select>
        </div>
      </section>
      <div className="analytics-stats">
        <Stat icon="users" label="میزان حضور" value="91%" یادداشت="۳٫۴٪+ در این ماه" tone="green" />
        <Stat icon="chart" label="میانگین موفقیت" value="82%" یادداشت="۴٫۲٪+ بهبود" tone="purple" />
        <Stat icon="check" label="تکالیف تکمیل‌شده" value="376" یادداشت="۸۹٪ به‌موقع" tone="blue" />
      </div>
      <div className="analytics-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">پیوستگی</p>
              <h3>مشارکت هفتگی</h3>
            </div>
            <span className="chart-legend">
              <i /> میانگین کلاس
            </span>
          </div>
          <div className="bar-chart">
            <div className="y-axis">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            <div className="bars">
              {bars.map((b, i) => (
                <div key={i}>
                  <span style={{ height: `${b}%` }}>
                    <em>{b}%</em>
                  </span>
                  <small>{["ش", "ی", "د", "س", "چ", "پ", "ج"][i]}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="panel donut-panel">
          <div>
            <p className="eyebrow">وضعیت تکالیف</p>
            <h3>وضعیت تکمیل</h3>
          </div>
          <div className="donut">
            <div>
              <strong>84%</strong>
              <span>تکمیل</span>
            </div>
          </div>
          <ul>
            <li>
              <i className="green-dot" />
              تکمیل‌شده <b>376</b>
            </li>
            <li>
              <i className="purple-dot" />
              در حال انجام <b>48</b>
            </li>
            <li>
              <i className="gray-dot" />
              شروع‌نشده <b>23</b>
            </li>
          </ul>
        </section>
      </div>
      <section className="panel assessment-chart-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">مقایسه عملکرد کلاس</p>
            <h3>آزمون‌ها و تمرین‌های شش هفته اخیر</h3>
          </div>
          <div className="dual-legend">
            <span>
              <i className="exam-dot" /> آزمون‌ها
            </span>
            <span>
              <i className="task-dot" /> تمرین‌ها
            </span>
          </div>
        </div>
        <div className="grouped-chart">
          {[
            ["هفته ۱", 68, 75],
            ["هفته ۲", 72, 81],
            ["هفته ۳", 79, 84],
            ["هفته ۴", 76, 88],
            ["هفته ۵", 84, 91],
            ["هفته ۶", 87, 93],
          ].map(([week, exam, task]) => (
            <div className="chart-group" key={week}>
              <div className="group-bars">
                <i className="exam-bar" style={{ height: `${exam}%` }}>
                  <b>{exam}</b>
                </i>
                <i className="task-bar" style={{ height: `${task}%` }}>
                  <b>{task}</b>
                </i>
              </div>
              <span>{week}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">دانش‌آموزان</p>
            <h3>پیشرفت فردی</h3>
          </div>
          <label className="search">
            <Icon name="search" size={16} />
            <input placeholder="جست‌وجوی دانش‌آموز" />
          </label>
        </div>
        <div className="student-table">
          {students.map((s, i) => (
            <div className="student-row clickable" key={s[1]} onClick={() => setSelectedStudent(i)}>
              <span className={"student-avatar av" + i}>{s[0]}</span>
              <strong>
                {s[1]}
                <small>پایه دهم</small>
              </strong>
              <span>
                حضور <b>{s[2]}</b>
              </span>
              <span>
                تکالیف <b>{s[3]}</b>
              </span>
              <em>{s[4]}</em>
              <button>
                <Icon name="arrow" size={17} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function پیام‌هاPage() { return <LiveTickets role="teacher"/>; }

function TeacherAssistantPage(){const [courses,setCourses]=useState<Row[]>([]),[cid,setCid]=useState('');useEffect(()=>{api('/courses').then(r=>{setCourses(r.courses);const preferred=new URLSearchParams(location.search).get('course');setCid(r.courses.some((c:Row)=>c.id===preferred)?preferred:r.courses[0]?.id||'')})},[]);return <div className="teacher-modern-view teacher-assistant-full"><label className="document-course-select">دوره<select aria-label="دوره گفت‌وگو" value={cid} onChange={e=>setCid(e.target.value)}>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label><TeacherConversation key={cid} course={cid}/></div>}

function Dashboard() {
  const [page, setPage] = useState<Page>(()=>new URLSearchParams(location.search).get('page')==='exams'?'آزمون‌ها':new URLSearchParams(location.search).get('page')==='lessons'?'درس‌ها':new URLSearchParams(location.search).get('page')==='assistant'?'دستیار':new URLSearchParams(location.search).get('page')==='progress'?'تحلیل‌ها':new URLSearchParams(location.search).get('page')==='tickets'?'پیام‌ها':'خانه');
  useEffect(()=>{const pages:Record<string,string>={'خانه':'','درس‌ها':'lessons','آزمون‌ها':'exams','تحلیل‌ها':'progress','پیام‌ها':'tickets','دستیار':'assistant'};const url=new URL(location.href);if(pages[page])url.searchParams.set('page',pages[page]);else url.searchParams.delete('page');if(page!=='درس‌ها')url.searchParams.delete('newLesson');if(page!=='آزمون‌ها')url.searchParams.delete('exam');history.replaceState(null,'',url);window.dispatchEvent(new Event('nova:navigation'))},[page]);
  useEffect(()=>{const open=()=>setPage('آزمون‌ها');window.addEventListener('nova:teacher-exams',open);return()=>window.removeEventListener('nova:teacher-exams',open)},[]);
  const titles = useMemo(
    () => ({
      خانه: "نمای کلی",
      درس‌ها: "درس‌ها",
      آزمون‌ها: "آزمون‌ها",
      تحلیل‌ها: "تحلیل‌ها",
      پیام‌ها: "تیکت‌ها",
      دستیار: "گفت‌وگو با دستیار",
    }),
    [],
  );
  return (
    <div className={"app-shell"+(page==="دستیار"?" teacher-chat-shell":"")}>
      {page!=="دستیار"&&<Sidebar page={page} setPage={setPage} />}
      <div className="main-shell">
        {page!=="دستیار"&&<Topbar title={titles[page]} onNew={() => setPage("درس‌ها")} />}
        <div className={page==="دستیار"?"teacher-chat-page":"page"}>
          {page === "خانه" && <خانه goدرس‌ها={() => setPage("درس‌ها")} />}
          {page === "درس‌ها" && <درس‌هاPage />}
          {page === "آزمون‌ها" && <آزمون‌هاPage />}
          {page === "تحلیل‌ها" && <TeacherProgress/>}
          {page === "دستیار" && <TeacherAssistantPage/>}
          {page === "پیام‌ها" && <پیام‌هاPage />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState<boolean|null>(null);
  useEffect(()=>{api("/me").then(()=>setLoggedIn(true)).catch(()=>setLoggedIn(false))},[]);
  return (
    <div dir="rtl">{loggedIn===null ? <p role="status" style={{padding:24}}>در حال بررسی حساب…</p> : loggedIn ? <PlatformShell role="teacher"><Dashboard /></PlatformShell> : <Login onLogin={() => setLoggedIn(true)} />}</div>
  );
}
