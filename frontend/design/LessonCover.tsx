import type {Row} from '../src/live/api';
const symbols:Record<string,string>={python:'Py',code:'</>',book:'▤',science:'⚛'};
export function LessonCover({cover,title}:{cover?:Row|null;title:string}){
 if(!cover)return null;
 return cover.kind==='image'?<img src={cover.url} alt={cover.alt||title} style={{width:'100%',height:170,objectFit:'cover',borderRadius:18}}/>:<div aria-label={'جلد '+title} style={{height:170,display:'grid',placeItems:'center',background:cover.color,borderRadius:18,color:'white',fontSize:48,fontWeight:800}}>{symbols[cover.element]||'Py'}</div>;
}
export function CoverPicker({value,onChange}:{value:Row|null;onChange:(v:Row|null)=>void}){
 return <fieldset><legend>جلد درس</legend><label>نوع جلد<select value={value?.kind||''} onChange={e=>onChange(e.target.value==='image'?{kind:'image',url:'',alt:''}:e.target.value==='element'?{kind:'element',element:'python',color:'#6847b2'}:null)}><option value="">بدون جلد</option><option value="image">تصویر</option><option value="element">عنصر گرافیکی</option></select></label>{value?.kind==='image'?<><label>نشانی HTTPS تصویر<input type="url" value={value.url} onChange={e=>onChange({...value,url:e.target.value})}/></label><label>توضیح تصویر<input value={value.alt} onChange={e=>onChange({...value,alt:e.target.value})}/></label></>:value?.kind==='element'?<><label>عنصر<select value={value.element} onChange={e=>onChange({...value,element:e.target.value})}>{Object.keys(symbols).map(k=><option key={k} value={k}>{k}</option>)}</select></label><label>رنگ<input type="color" value={value.color} onChange={e=>onChange({...value,color:e.target.value})}/></label></>:null}<LessonCover cover={value?.kind==='image'&&!value.url?null:value} title="پیش‌نمایش جلد"/></fieldset>;
}
