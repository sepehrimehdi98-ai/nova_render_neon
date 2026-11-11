import BuilderSources from '../BuilderSources';
import {BlockText} from '../BlockText';
import {LessonCover,CoverPicker} from '../LessonCover';
import CourseWorkspace from '../CourseWorkspace';
import LiveTickets from '../LiveTickets';
import {consult} from '../consult';
import {api,type Row} from '../../src/live/api';
import {useEffect} from 'react';
import { useMemo, useState } from "react";

type Page = "خانه" | "درس‌ها" | "آزمون‌ها" | "تحلیل‌ها" | "پیام‌ها";
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
          <span>نــوا</span>
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
            <strong>«نوا زمان بیشتری برای تدریس به من می‌دهد.»</strong>
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
            <span>نــوا</span>
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
            ورود به نوا <Icon name="arrow" size={18} />
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
  const nav: { label: Page; icon: IconName }[] = [
    { label: "خانه", icon: "home" },
    { label: "درس‌ها", icon: "book" },
    { label: "آزمون‌ها", icon: "exam" },
    { label: "تحلیل‌ها", icon: "chart" },
    { label: "پیام‌ها", icon: "inbox" },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">ن</span>
        <span>نــوا</span>
      </div>
      <nav>
        <span className="nav-label">فضای کاری</span>
        {nav.map((item) => (
          <button
            key={item.label}
            aria-label={item.label}
            className={page === item.label ? "active" : ""}
            onClick={() => setPage(item.label)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade">
          <span className="spark">
            <Icon name="sparkle" size={17} />
          </span>
          <strong>هوش مصنوعی نوا</strong>
          <p>۱۲ تولید محتوا باقی مانده</p>
          <div>
            <i style={{ width: "68%" }} />
          </div>
        </div>
        <button className="profile">
          <span className="avatar">ع‌م</span>
          <span>
            <strong>علی مرادی</strong>
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
  source?:string;
  id: number;
  type: "ویدیو" | "متن" | "کد" | "یادداشت" | "تصویر" | "تمرین" | "عنوان" | "فهرست" | "نقل‌قول" | "جداکننده";
  fontSize?:number;
  textMarks?:Row[];
  title: string;
  content: string;
};
const initialBlocks: Block[] = [
  {
    id: 1,
    type: "ویدیو",
    title: "تماشا کنید: وب چگونه کار می‌کند",
    content: "ویدیوی آموزشی · ۰۶:۴۲",
  },
  {
    id: 2,
    type: "متن",
    title: "اجزای سازنده وب",
    content:
      "هر وب‌سایتی که می‌بینید با سه فناوری اصلی ساخته شده است: HTML ساختار، CSS ظاهر و جاوااسکریپت پویایی آن را می‌سازد.",
  },
  {
    id: 3,
    type: "کد",
    title: "خودتان امتحان کنید",
    content: "<h1>سلام دنیا!</h1>\\n<p>اولین صفحه وب من.</p>",
  },
  {
    id: 4,
    type: "یادداشت",
    title: "به یاد داشته باشید",
    content: "HTML محتوای صفحه را تعریف می‌کند و CSS ظاهر آن را شکل می‌دهد.",
  },
  {
    id: 5,
    type: "تمرین",
    title: "یک صفحه معرفی ساده بسازید",
    content: "با استفاده از عنوان، پاراگراف و یک پیوند، صفحه معرفی خودتان را طراحی کنید.",
  },
];

function درس‌هاPage() {
  const [builder, setBuilder] = useState(false);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selected, setSelected] = useState(2);
  const [chat, setChat] = useState("");
  const [publicTopic,setPublicTopic]=useState("");
  const [toast, setToast] = useState("");
  const [aiMode, setAiMode] = useState<"chat" | "review">("chat");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "بلوک موردنظر را انتخاب کنید و پرسش خود را بفرستید؛ منابع تأییدشده به پاسخ کمک می‌کنند.",
    },
  ]);
  const [courses,setCourses]=useState<Row[]>([]);
  const [course,setCourse]=useState("");
  const [saved,setSaved]=useState<Row|null>(null);
  const [serverLessons,setServerLessons]=useState<Row[]>([]);
  const [title,setTitle]=useState("مقدمه‌ای بر توسعه وب");
  const [preview,setPreview]=useState(false);
  const [cover,setCover]=useState<Row|null>(null);
  const [references,setReferences]=useState<string[]>([]);
  const [examId,setExamId]=useState('');
  const [exams,setExams]=useState<Row[]>([]);
  const [aiBusy,setAiBusy]=useState(false);
  const [hasAiAnswer,setHasAiAnswer]=useState(false);
  const [textSelection,setTextSelection]=useState({blockId:0,start:0,end:0});
  const [loadedDoc,setLoadedDoc]=useState<Row|null>(null);
  const [media,setMedia]=useState<Row[]>([]);
  useEffect(()=>{api("/media").then(r=>setMedia(r.media)).catch(e=>setToast(e.message))},[]);
  const [question,setQuestion]=useState("HTML برای چه کاری استفاده می‌شود؟");
  const [right,setRight]=useState("ساختار صفحه");
  const [wrong,setWrong]=useState("مدیریت پایگاه داده");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{api("/courses").then(r=>{setCourses(r.courses);setCourse(r.courses[0]?.id||"")}).catch(e=>setToast(e.message))},[]);
  useEffect(()=>{if(!course)return;let active=true;api("/courses/"+course).then(r=>{if(active)setServerLessons(r.lessons)}).catch(e=>setToast(e.message));return()=>{active=false}},[course,builder]);
  useEffect(()=>{setExams([]);setExamId('');if(!course)return;const c=new AbortController();api('/courses/'+course+'/exams',undefined,c.signal).then(r=>setExams(r.exams)).catch(e=>{if(e.name!=='AbortError')setToast(e.message)});return()=>c.abort()},[course]);
  async function save(publish:boolean){
    if(busy)return;
    setBusy(true);
    try{
      if(!course)throw Error("ابتدا یک دوره انتخاب کنید.");
      const sampleVideo=media.find(m=>m.course_id===course&&m.status==='approved'&&m.mime.startsWith('video/'));
      const content=blocks.map(b=>{
        const base={...b.original,id:String(b.id),title:b.title,body:b.content,fontSize:b.fontSize,textMarks:b.textMarks,variant:b.type==='فهرست'?'list':b.type==='نقل‌قول'?'quote':b.type==='جداکننده'?'divider':undefined};
        if(b.type==="ویدیو"){
          if(b.original?.sourceUrl===b.source)return {...base,kind:'video',sourceUrl:b.source};
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
        return {...base,kind:b.type==='کد'?'code':b.type==='یادداشت'?'note':b.type==='عنوان'||b.original?.kind==='heading'?'heading':'text'};
      });
      const doc={...loadedDoc,title,cover,references:references.map(r=>r.trim()).filter(Boolean),examId:examId||null,blocks:content,exercise:{...loadedDoc?.exercise,prompt:blocks.find(b=>b.type==="تمرین")?.content||loadedDoc?.exercise?.prompt||"یک مثال از این درس بنویسید.",starter:blocks.find(b=>b.type==="کد")?.content||""},quiz:[{prompt:question,options:[right,wrong,...(loadedDoc?.quiz?.[0]?.options?.filter((o:string)=>o!==right&&o!==wrong)||[])],correct:0},...(loadedDoc?.quiz?.slice(1)||[])],passScore:loadedDoc?.passScore||70};
      const result=saved?await api('/lessons/'+saved.id,{...doc,draftRev:saved.rev}):await api('/courses/'+course+'/lessons',doc);
      const record={id:saved?.id||result.id,rev:result.draftRev||1};
      setSaved(record);
      if(publish)await api('/lessons/'+record.id+'/publish',{draftRev:record.rev});
      setToast(publish?"درس منتشر شد":"پیش‌نویس ذخیره شد");return record;
    }catch(error){setToast(String(error));return null}finally{setBusy(false)}
  }
  async function openSaved(id:string){try{const record=await api('/lessons/'+id);const d=record.content;setMessages([]);setHasAiAnswer(false);setChat('');setLoadedDoc(d);setCover(d.cover||null);setReferences(d.references||[]);setExamId(d.examId||'');setTitle(d.title);setSaved({id,rev:record.draftRev});setBlocks(d.blocks.map((b:Row,i:number)=>({id:i+1,original:b,fontSize:b.fontSize,textMarks:b.textMarks,type:b.kind==='heading'?'عنوان':b.variant==='list'?'فهرست':b.variant==='quote'?'نقل‌قول':b.variant==='divider'?'جداکننده':({video:'ویدیو',image:'تصویر',code:'کد',note:'یادداشت'} as Record<string,Block['type']>)[b.kind]||'متن',title:b.title,content:b.body,source:b.embedUrl||b.sourceUrl||b.imageUrl||''})));if(d.quiz?.[0]){setQuestion(d.quiz[0].prompt);setRight(d.quiz[0].options[d.quiz[0].correct]);setWrong(d.quiz[0].options.find((_:string,i:number)=>i!==d.quiz[0].correct)||'');}setBuilder(true);}catch(e){setToast(String(e));}}
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
      کد: ["تمرین کدنویسی", "// کد خود را اینجا وارد کنید"],
      یادداشت: ["نکته کوتاه", "یک یادآوری مفید اضافه کنید..."],
      تصویر: ["تصویر آموزشی", "برای تصویر، عنوان و توضیح جایگزین بنویسید."],
      تمرین: ["تمرین کلاسی", "دستورالعمل تمرین را برای دانش‌آموزان بنویسید."],
      عنوان:["عنوان بخش",""],فهرست:["فهرست نکات","نکته اول\nنکته دوم"],"نقل‌قول":["نقل‌قول","متن نقل‌قول"],جداکننده:["جداکننده",""],
    };
    const block = {
      id: Date.now(),
      type,
      title: map[type][0],
      content: map[type][1],
    };
    setBlocks([...blocks, block]);
    setSelected(block.id);
  };
  function renderMedia(b:Block){
    const video=b.type==='ویدیو';
    if(video&&/^\/api\/platform\/files\/[a-f0-9-]{36}$/.test(b.source||''))return <video controls preload="metadata" style={{width:'100%'}} src={b.source}/>;
    const src=mediaSource(b.source||'',video);
    if(!src&&video&&!b.source?.trim()){
      const sample=media.find(m=>m.course_id===course&&m.status==='approved'&&m.mime.startsWith('video/'));
      if(sample)return <video controls preload="metadata" style={{width:'100%'}} src={'/api/platform/files/'+sample.id}/>;
    }
    if(!src)return <small>{b.source?'نشانی معتبر نیست':'رسانه‌ای انتخاب نشده است'}</small>;
    return video?<iframe title={b.title} src={src} allowFullScreen style={{width:'100%',aspectRatio:'16/9',border:0}}/>:<img alt={b.title} src={src} style={{maxWidth:'100%'}}/>;
  }
  if(preview)return <section className="page-stack"><div className="builder-top"><h2>{title}</h2><LessonCover cover={cover} title={title}/><button className="outline-btn" onClick={()=>setPreview(false)}>بازگشت به ویرایش</button></div>{blocks.map(b=><article className="lesson-card" key={b.id}><div className="card-copy"><h3>{b.title}</h3>{(b.type==='ویدیو'||b.type==='تصویر')&&renderMedia(b)}{b.type==='کد'?<pre>{b.content}</pre>:<div style={{fontSize:(b.fontSize||16)+'px'}}><BlockText block={{body:b.content,textMarks:b.textMarks,variant:b.type==='فهرست'?'list':b.type==='نقل‌قول'?'quote':b.type==='جداکننده'?'divider':undefined}}/></div>}</div></article>)}<section><h3>{question}</h3>{[right,wrong].map((option,i)=><label key={i}><input type="radio" name="preview-quiz"/>{option}</label>)}</section></section>;
  if (!builder)
    return (
      <div className="page-stack">
        <section className="lessons-title">
          <div>
            <p className="eyebrow">کتابخانه محتوا</p>
            <h2>درس‌هایی بسازید که ماندگار شوند.</h2>
            <p>با کمک هوش مصنوعی نوا، درس‌هایی غنی و تعاملی بسازید.</p>
          </div>
          <button className="primary-btn big" onClick={() => {setSaved(null);setLoadedDoc(null);setCover(null);setReferences([]);setExamId('');setBlocks(initialBlocks);setBuilder(true)}}>
            <Icon name="sparkle" size={19} /> ساخت با هوش مصنوعی
          </button>
        </section>
        <div className="filter-row">
          <label className="search wide">
            <Icon name="search" size={17} />
            <input placeholder="جست‌وجوی درس‌ها..." />
          </label>
          <button className="filter active">
            همه درس‌ها <b>{serverLessons.length}</b>
          </button>
          <button className="filter">
            منتشرشده <b>{serverLessons.filter(l=>l.status==='published').length}</b>
          </button>
          <button className="filter">
            پیش‌نویس‌ها <b>{serverLessons.filter(l=>l.status==='draft').length}</b>
          </button>
        </div>
        <label>دوره آموزشی<select aria-label="دوره درس‌ها" value={course} onChange={e=>{setCourse(e.target.value);setSaved(null);setLoadedDoc(null)}}>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label><CourseWorkspace key={course} screen="structure" fixedCourseId={course}/><section className="lesson-cards">{serverLessons.map(l=><article className="lesson-card" key={l.id}><div className="card-copy"><LessonCover cover={l.cover} title={l.title}/><h3>{l.title}</h3><small>{l.status}</small><button onClick={()=>void openSaved(l.id)}>ویرایش و پیش‌نمایش</button></div></article>)}
          <button className="new-lesson" onClick={() => {setSaved(null);setLoadedDoc(null);setCover(null);setReferences([]);setExamId('');setBlocks(initialBlocks);setBuilder(true)}}>
            <span>
              <Icon name="plus" size={24} />
            </span>
            <strong>ساخت درس جدید</strong>
            <small>صفحه خالی یا همراه با هوش مصنوعی</small>
          </button>
          {!serverLessons.length&&lessons.map((l, i) => (
            <article className="lesson-card" key={l.title}>
              <div className={"cover c" + i}>
                <span>{i === 0 ? "</>" : i === 1 ? "JS" : "اتم"}</span>
                <b className={"status " + l.status.toLowerCase()}>{l.status}</b>
              </div>
              <div className="card-copy">
                <p>{l.class}</p>
                <h3>{l.title}</h3>
                <div>
                  <span>
                    <Icon name="users" size={15} />
                    {l.دانش‌آموز} دانش‌آموز
                  </span>
                  <span>به‌روزرسانی ۲ روز پیش</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  return (
    <div className="builder">
      {toast && (
        <div className="toast">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
      <div className="builder-top">
        <button className="back-btn" onClick={() => setBuilder(false)}>
          ← همه درس‌ها
        </button>
        <div>
          <button disabled={busy} onClick={()=>save(false)}>ذخیره پیش‌نویس</button>
        </div>
        <button className="outline-btn" onClick={()=>setPreview(true)}>
          <Icon name="eye" size={17} /> پیش‌نمایش
        </button>
        <button
          className="primary-btn"
          disabled={busy} onClick={()=>save(true)}
        >
          انتشار درس
        </button>
      </div>
      <div className="builder-layout">
        <aside className="builder-side">
          <p className="eyebrow">طرح کلی درس</p><CoverPicker value={cover} onChange={setCover}/><label>آزمون مرتبط<select aria-label="آزمون مرتبط درس" value={examId} onChange={e=>setExamId(e.target.value)}><option value="">بدون آزمون مرتبط</option>{exams.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label><button type="button" onClick={()=>window.open('/?page=exams&course='+encodeURIComponent(course),'_blank','noopener')}>ساخت یا ویرایش آزمون‌ها در تب جدید</button><button type="button" onClick={()=>api('/courses/'+course+'/exams').then(r=>setExams(r.exams)).catch(e=>setToast(e.message))}>تازه‌سازی آزمون‌ها</button>
          <label>دوره<select disabled={!!saved} value={course} onChange={e=>setCourse(e.target.value)}>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
          
          <label>پرسش آزمون<input value={question} onChange={e=>setQuestion(e.target.value)}/></label><label>پاسخ درست<input value={right} onChange={e=>setRight(e.target.value)}/></label><label>گزینه دیگر<input value={wrong} onChange={e=>setWrong(e.target.value)}/></label>
          <label>
            اتصال به یک درس
            <select>
              <option>مقدمه‌ای بر توسعه وب</option>
              <option>مبانی جاوااسکریپت</option>
              <option>ساختار اتم</option>
            </select>
          </label>
          <label>
            توضیح کلی
            <textarea defaultValue="دانش‌آموزان را با سازوکار وب و سه فناوری اصلی هر تجربه وب آشنا کنید." />
          </label>
          <label>
            موضوعات کلیدی
            <input defaultValue="HTML، CSS، جاوااسکریپت" />
          </label>
          <div className="lesson-meta-grid">
            <label>
              سطح دشواری
              <select defaultValue="متوسط">
                <option>مقدماتی</option>
                <option>متوسط</option>
                <option>پیشرفته</option>
              </select>
            </label>
            <label>
              زمان پیشنهادی
              <input defaultValue="۴۵ دقیقه" />
            </label>
          </div>
          <button className="ai-generate">
            <Icon name="sparkle" size={18} /> تولید دوباره پیش‌نویس
          </button>
          <div className="add-blocks">
            <p className="eyebrow">افزودن بلوک</p>
            <div>
              {(["ویدیو", "متن", "تصویر", "تمرین", "کد", "یادداشت", "عنوان", "فهرست", "نقل‌قول", "جداکننده"] as const).map((t) => (
                <button key={t} onClick={() => addBlock(t)}>
                  <Icon
                    name={
                      t === "ویدیو"
                        ? "play"
                        : t === "متن"
                          ? "متن"
                          : t === "کد"
                            ? "کد"
                            : t === "تمرین"
                              ? "check"
                              : "یادداشت"
                    }
                    size={17}
                  />
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
        <main className="canvas">
          <div className="canvas-head">
            <p className="eyebrow">علوم کامپیوتر · پایه دهم</p>
            <input value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea defaultValue="با سازوکار وب آشنا شوید و اولین صفحه خود را بسازید." />
          </div>
          <div className="blocks">
            {blocks.map((block, i) => (
              <article
                onClick={() => setSelected(block.id)}
                className={`content-block ${block.type} ${selected === block.id ? "selected" : ""}`}
                key={block.id}
                data-block-id={block.id}
                onDragOver={e=>{if(e.dataTransfer.types.includes('application/x-nova-block'))e.preventDefault()}}
                onDrop={e=>{const id=Number(e.dataTransfer.getData('application/x-nova-block'));if(id){e.preventDefault();dropBlock(id,block.id)}}}
              >
                <div className="block-handle">
                  <button type="button" className="block-drag" aria-label={'کشیدن بلوک '+block.title} draggable onDragStart={e=>{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('application/x-nova-block',String(block.id))}} onPointerDown={e=>{if(e.pointerType==='touch')e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(e.pointerType==='touch'&&e.currentTarget.hasPointerCapture(e.pointerId)){if(e.clientY>window.innerHeight-60)window.scrollBy(0,12);else if(e.clientY<80)window.scrollBy(0,-12)}}} onPointerUp={e=>{if(e.pointerType!=='touch')return;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-block-id]');if(target)dropBlock(block.id,Number(target.getAttribute('data-block-id')))}}><Icon name="grip" size={17}/></button>
                  <span>{block.type}</span><button type="button" aria-label={'حذف بلوک '+block.title} onClick={e=>{e.stopPropagation();setBlocks(bs=>bs.filter(b=>b.id!==block.id));setSelected(0)}}>حذف</button>
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        move(i, -1);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        move(i, 1);
                      }}
                    >
                      ↓
                    </button>
                  </div>
                </div>
                {(block.type==='ویدیو'||block.type==='تصویر')&&<div>
                  <label>{block.type==='ویدیو'?'کد iframe یا نشانی پخش کاویمو':'نشانی HTTPS تصویر'}
                    <textarea dir="ltr" value={block.source||''} onChange={e=>setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,source:e.target.value}:b))}/>
                  </label>{block.source&&renderMedia(block)}
                </div>}
                <h3 contentEditable suppressContentEditableWarning onBlur={e=>{const title=e.currentTarget.textContent||"";setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,title}:b))}}>
                  {block.title}
                </h3>
                {block.type==='جداکننده'?<hr/>:<textarea className="block-editor" aria-label={'متن بلوک '+block.title} dir={block.type==='کد'?'ltr':'rtl'} style={{fontSize:(block.fontSize||16)+'px'}} value={block.content} onSelect={e=>setTextSelection({blockId:block.id,start:e.currentTarget.selectionStart,end:e.currentTarget.selectionEnd})} onChange={e=>{const content=e.target.value;setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,content,textMarks:[]}:b))}}/>}
                {block.type === "تمرین" && (
                  <div className="exercise-meta">
                    <span>
                      <Icon name="clock" size={14} /> ۱۲ دقیقه
                    </span>
                    <span>
                      <Icon name="check" size={14} /> تحویل در کلاس
                    </span>
                  </div>
                )}
                {selected===block.id&&block.type==='متن'&&<div className="text-toolbar"><label>اندازه متن یا بخش انتخاب‌شده<select aria-label="اندازه فونت متن" value={block.fontSize||16} onChange={e=>{const fontSize=Number(e.target.value);setBlocks(bs=>bs.map(b=>{if(b.id!==block.id)return b;if(textSelection.blockId===b.id&&textSelection.end>textSelection.start){const mark={start:textSelection.start,end:textSelection.end,fontSize};return {...b,textMarks:[...(b.textMarks||[]).filter(m=>m.end<=mark.start||m.start>=mark.end),mark].sort((a,b)=>a.start-b.start)}}return {...b,fontSize}}))}}>{[12,14,16,18,20,24,28,32,36].map(n=><option key={n} value={n}>{n}</option>)}</select></label><small>متن را انتخاب کنید؛ بدون انتخاب، اندازه کل بلوک تغییر می‌کند. نتیجه در پیش‌نمایش دیده می‌شود.</small><BlockText block={{body:block.content,textMarks:block.textMarks}}/></div>}
              </article>
            ))}
          </div>
        </main>
        <aside className="ai-panel">
          <div className="ai-title">
            <span>
              <Icon name="sparkle" size={17} />
            </span>
            <div>
              <strong>دستیار نوا</strong>
              <small>همراه ساخت درس</small>
            </div>
            <i />
          </div>
          <BuilderSources key={course} course={course} references={references} onReferences={setReferences}/>
          <div className="ai-chat"><p>تمرکز پاسخ: بلوک انتخاب‌شده و آخرین پیش‌نویس ذخیره‌شده</p><div className="ai-conversation" aria-live="polite">{messages.map((m,i)=><div key={i} className={'ai-message '+m.role}>{m.text}</div>)}</div></div>
          <form onSubmit={async e=>{e.preventDefault();const question=chat.trim();if(!question||aiBusy)return;setAiBusy(true);try{const record=await save(false);if(!record)return;setMessages(m=>[...m,{role:'user',text:question}]);setChat('');const answer=await consult(course,record.id,question,'',selected?String(selected):'');setMessages(m=>[...m,{role:'ai',text:answer}]);setHasAiAnswer(true);}catch(error){setToast(String(error))}finally{setAiBusy(false)}}}>
           <label className="platform-input">گفتگو با دستیار<textarea aria-label="پرسش درباره بلوک درس" value={chat} onChange={e=>setChat(e.target.value)} maxLength={4000} placeholder="درباره بلوک انتخاب‌شده بپرسید…"/></label><button disabled={aiBusy||busy||!chat.trim()}>{aiBusy?'در حال دریافت پاسخ…':'ذخیره و ارسال پرسش'}</button>
          </form><button type="button" disabled={!hasAiAnswer||aiBusy} onClick={()=>{const suggestion=[...messages].reverse().find(m=>m.role==='ai');if(suggestion)setBlocks(bs=>[...bs,{id:Date.now(),type:'یادداشت',title:'پیشنهاد دستیار — نیازمند بازبینی',content:suggestion.text}])}}>افزودن آخرین پاسخ به درس</button>
        </aside>
      </div>
    </div>
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
              <p className="eyebrow">تحلیل هوشمند نوا</p>
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

function Dashboard() {
  const [page, setPage] = useState<Page>(()=>new URLSearchParams(location.search).get('page')==='exams'?'آزمون‌ها':'خانه');
  useEffect(()=>{const open=()=>setPage('آزمون‌ها');window.addEventListener('nova:teacher-exams',open);return()=>window.removeEventListener('nova:teacher-exams',open)},[]);
  const titles = useMemo(
    () => ({
      خانه: "نمای کلی",
      درس‌ها: "درس‌ها",
      آزمون‌ها: "آزمون‌ها",
      تحلیل‌ها: "تحلیل‌ها",
      پیام‌ها: "پیام‌ها",
    }),
    [],
  );
  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />
      <div className="main-shell">
        <Topbar title={titles[page]} onNew={() => setPage("درس‌ها")} />
        <div className="page">
          {page === "خانه" && <خانه goدرس‌ها={() => setPage("درس‌ها")} />}
          {page === "درس‌ها" && <درس‌هاPage />}
          {page === "آزمون‌ها" && <آزمون‌هاPage />}
          {page === "تحلیل‌ها" && <تحلیل‌هاPage />}
          {page === "پیام‌ها" && <پیام‌هاPage />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(()=>{api("/me").then(()=>setLoggedIn(true)).catch(()=>{})},[]);
  return (
    <div dir="rtl">{loggedIn ? <Dashboard /> : <Login onLogin={() => setLoggedIn(true)} />}</div>
  );
}
