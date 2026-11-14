import PlatformShell from '../PlatformShell';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';

import {api} from '../../src/live/api';
const root=createRoot(document.getElementById('root')!);
async function start(){
 try{
 if(location.pathname==='/login'){root.render(<App/>);return}
 const session=await api('/me').catch(e=>{if(e.status===401)return null;throw e});
 if(!session&&location.pathname!=='/login'){location.replace('/login');return}
 root.render(location.pathname==='/login'?<App/>:<PlatformShell role="student"><App/></PlatformShell>);
 }catch(e){root.render(<p role="alert">{String(e)}</p>)}
}
void start();
