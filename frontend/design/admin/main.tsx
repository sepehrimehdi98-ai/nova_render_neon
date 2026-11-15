import AdminLogin from './Login';
import PlatformShell from '../PlatformShell';
import {createRoot} from 'react-dom/client';

import './index.css';

import {api} from '../../src/live/api';
const root=createRoot(document.getElementById('root')!);
async function start(){
 try{
 if(location.pathname==='/login'){root.render(<AdminLogin onEnter={()=>location.assign('/')}/>);return}
 const session=await api('/me').catch(e=>{if(e.status===401)return null;throw e});
 if(!session){root.render(<AdminLogin onEnter={()=>location.assign('/')}/>);return}
 const {default:App}=await import('./App');root.render(<PlatformShell role="admin"><App/></PlatformShell>);
 }catch(e){root.render(<p role="alert">{String(e)}</p>)}
}
void start();
