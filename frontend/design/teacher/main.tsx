import {createRoot} from 'react-dom/client';
import Login from './Login';
import {api} from '../../src/live/api';
import './index.css';
const root=createRoot(document.getElementById('root')!);
async function start(){
 if(location.pathname==='/login'){root.render(<Login onLogin={()=>location.assign('/')}/>);return}
 try{const session=await api('/me').catch(e=>{if(e.status===401)return null;throw e});if(!session){root.render(<Login onLogin={()=>location.assign('/')}/>);return}const {default:App}=await import('./App');root.render(<App/>)}catch(e){root.render(<main dir="rtl" style={{padding:24}}><p role="alert">{e instanceof Error?e.message:'صفحه بارگذاری نشد.'}</p><a href="/login">بازگشت به ورود</a></main>)}
}
void start();
