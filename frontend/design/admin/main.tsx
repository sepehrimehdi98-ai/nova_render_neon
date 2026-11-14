import PlatformShell from '../PlatformShell';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

import {api} from '../../src/live/api';
const root=createRoot(document.getElementById('root')!);
async function start(){
 try{
 if(location.pathname==='/login'){const {Login}=await import('../../src/App');await import('../../src/index.css');root.render(<Login onEnter={()=>location.assign('/')}/>);return}
 const session=await api('/me').catch(e=>{if(e.status===401)return null;throw e});
 if(!session){const {Login}=await import('../../src/App');await import('../../src/index.css');root.render(<Login onEnter={()=>location.reload()}/>);return}
 root.render(<PlatformShell role="admin"><App/></PlatformShell>);
 }catch(e){root.render(<p role="alert">{String(e)}</p>)}
}
void start();
