import {useState} from 'react';
import {ArrowLeft,ShieldCheck} from 'lucide-react';
import {api} from '../../src/live/api';
import {LoginBrand,DesignerCredit} from '../LoginBrand';
import AccountRecovery from '../AccountRecovery';
export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [loginBusy,setLoginBusy]=useState(false),[loginError,setLoginError]=useState(''),[recoveryOpen,setRecoveryOpen]=useState(false);
  const [password, setPassword] = useState("");
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="brand brand-light">
          <LoginBrand />
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
          <div className="quote-avatar" aria-hidden="true"><ShieldCheck size={20} strokeWidth={1.75}/></div>
          <div>
            <strong>هوش مصنوعی پیشنهاد می‌دهد؛ تصمیم نهایی با شماست.</strong>
            <span>هیچ محتوایی بدون تأیید شما به درس اضافه یا منتشر نمی‌شود.</span>
          </div>
        </div>
      </section>
      <section className="login-form-wrap">
        <form
          className="login-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if(loginBusy)return;setLoginBusy(true);setLoginError('');try {await api("/login",{username:email.trim(),password});onLogin()}catch(error){setLoginError(error instanceof Error?error.message:'ورود انجام نشد.')}finally{setLoginBusy(false)}
          }}
        >
          <div className="mobile-brand brand">
            <LoginBrand />
          </div>
          <p className="eyebrow">پنل ویژه معلمان</p>
          <h2>خوش آمدید.</h2>
          <p className="muted">برای ورود به فضای کاری خود، وارد حساب شوید.</p>
          <label>
            نام کاربری
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" autoComplete="username" dir="ltr" required />
          </label>
          <label>
            رمز عبور
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {loginError&&<p className="teacher-login-error" role="alert">{loginError}</p>}
          <button type="submit" disabled={loginBusy} className="primary-btn login-btn">
            {loginBusy?'در حال ورود…':'ورود به نووا'} <ArrowLeft size={18}/>
          </button>
          <p className="login-help">در صورت فراموشی رمز، درخواست بررسی هویت را برای مدیر بفرستید.</p><AccountRecovery open={recoveryOpen} onToggle={setRecoveryOpen}/>
          <DesignerCredit />
        </form>
      </section>
    </main>
  );
}

