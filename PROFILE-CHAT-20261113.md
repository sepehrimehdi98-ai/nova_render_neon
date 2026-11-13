# نووا — پروفایل و گفت‌وگوی چندمنبعی دبیر
تاریخ: ۲۰۲۶-۱۱-۱۳. این یادداشت وضعیت جدیدتر از گزارش‌های قبلی این بسته را توضیح می‌دهد.

## امکانات
- پروفایل دانش‌آموز: اطلاعات شخصی، آواتارهای آماده یا PNG/JPEG، امتیاز و درجه، نشان‌های قفل‌دار/دریافت‌شده با شرایط واقعی. نام کاربری ورود با تغییر نام نمایشی عوض نمی‌شود. ایمیل این صفحه، اطلاعات پروفایل است و به‌معنای ایمیل تأییدشده احراز هویت نیست.
- تغییر رمز به مسیر موجود و امن account/password متصل است؛ پس از تغییر، تمام نشست‌های کاربر باطل می‌شوند. رمز حداقل ۱۲ نویسه است. رمز حساب واقعی در مرورگر تغییر داده نشد؛ آزمون‌های خودکار موجود، مسیر رمز را پوشش می‌دهند.
- محاسبه امتیاز: هر درس تکمیل‌شده جاری ۱۰۰، تمرین تأییدشده با نمره حداقل۷۰، ۵۰؛ آزمون قبول‌شده با نتیجه قابل نمایش۲۵؛ هر روز زنجیره فعلی۱۰. هر۲۵۰ امتیاز یک سطح. داده فقط از ثبت‌های همین دانش‌آموز و دوره‌های فعال می‌آید؛ نتایج مخفی آزمون نشان را باز نمی‌کنند.
- دستیار اصلی دبیر: گفت‌وگوهای خصوصی برای هر دوره، افزودن چند فایل و لینک از دکمه + در کادر پیام، انتخاب حداکثر۶ سند برای هر پیام، نمایش پیوست در گفتگو، نقل منبع و دریافت فایل اصلی. متن فایل و منابع، دستور سیستمی محسوب نمی‌شوند.
- فایل‌های PDF متنی، DOCX، TXT و MD تا۱٫۵ مگابایت؛ خطای روشن برای فرمت نامعتبر، فایل خالی و حجم زیاد. آواتار PNG/JPEG تا۵۰۰کیلوبایت و۱۰۲۴×۱۰۲۴.
- فایل‌های قبلی که پیش از این تغییر فقط متنشان ذخیره شده است، برای دانلود اصل فایل باید دوباره بارگذاری شوند؛ محتوای قبلی حذف نمی‌شود.
- درس‌ساز: انتخاب همزمان متن، توضیح، نکته، ویدیو، کد نمونه، تمرین عملی و سؤال چهارگزینه‌ای در کادر پیام؛ ارسال منابع و درخواست در گفت‌وگوی جاری؛ پیشنهاد افزودن/ویرایش فقط با تأیید دبیر در پیش‌نویس اعمال می‌شود، سپس ذخیره و انتشار صریح لازم است.
- ویدیو پیشنهادی AI فقط جایگاه و متن دارد؛ URL را دبیر می‌دهد. پیش‌نویس بدونURL ذخیره می‌شود اما انتشار تا ورود نشانی معتبر رد می‌شود. AI اجازه ساخت نشانی ویدیو/تصویر ندارد.

## پایگاه داده و امنیت
جدول‌های افزایشی nova_profile_extended، nova_document_files، nova_teacher_threads و nova_teacher_messages در راه‌اندازی schema ساخته می‌شوند؛ داده قبلی حفظ می‌شود. مالکیت سند، دوره و گفتگو در API و دوباره در worker بررسی می‌شود. دانش‌آموز به گفت‌وگوهای دبیر دسترسی ندارد. شناسه استناد پاسخ آنلاین باید به منابع همان درخواست تعلق داشته باشد. تأیید شناسه منبع به‌معنای تضمین صحت علمی پاسخ نیست.
منابع انتخاب‌شده در کادر می‌مانند تا حذف یا تغییر داده شوند و همراه هر پیام جدا ثبت می‌شوند. لینک‌های عمومی HTTPS قابل پیوست هستند؛ واکشی محتوا فقط برای دامنه‌های مستندات مجاز فعلی انجام می‌شود و برای بقیه محدودیت توضیح داده می‌شود. همه وب‌سایت‌ها قابل استخراج نیستند.

## راستی‌آزمایی
- npm test: ۳۴ تست موفق، صفر شکست (۲۸backend،۳demo،۳portal).
- npm run build:portals و npm run build و TypeScript موفق.
- آزمون جدید profile-conversation.test.js: ذخیره پروفایل و تعارض نسخه، کنترل نقش/مالکیت، آواتار معتبر/نامعتبر، محدودیت فایل، دو منبع و تغییر منبع بین پیام‌ها، تاریخچه و استناد با provider آزمایشی، پیشنهاد چندبلوکی، و رد انتشار ویدیوی بدونURL.
- سرویس‌های در حال اجرا: ارسال دو فایل از درگاه واقعی دبیر، ذخیره گفتگو/منابع/پاسخ محلی و دانلود اصل فایل تأیید شد.
- مرورگر: ذخیره درباره‌من و ماندگاری بعدازreload و نمای پروفایل مشاهده شد. نمای دستیار جدید در accessibility دیده شد اما مرورگر برای کلیک/تصویر دستیار timeout داد؛ تأیید کامل تعامل تصویری چت و اندازه موبایل ادعا نمی‌شود.
- API key آنلاین در محیط محلی تنظیم نشده؛ پاسخ محلی استخراج سند است، نه تولید مدل. مسیر تولید آنلاین با provider شبیه‌سازی‌شده آزموده شد. پاسخ واقعی OpenRouter و PostgreSQL زنده در این مرحله تأیید نشده‌اند.
- هیچ تغییری به GitHub/Render ارسال نشده؛ بسته قدیمی Liara تغییر نکرده است.

## اجرا
Node24+. npm run setup سپس npm run build:portals و npm run start:all.
دانش‌آموز http://127.0.0.1:3101/profile
دبیر http://127.0.0.1:3102/?page=assistant
درس‌ساز http://127.0.0.1:3102/?page=lessons
حساب دموی محلی تازه: student / teacher / admin، رمز NovaDemo-2026!
کلید API فقط در متغیر محیطی سرور؛ برای تولید آنلاین، worker مشترک همین دیتابیس باید اجرا شود.

## مسیرهای اصلی
frontend/design/student/profile/page.tsx و profile.css
frontend/design/SourceComposer.tsx و source-composer.css
frontend/design/TeacherConversation.tsx و teacher-conversation.css
frontend/design/BuilderChat.tsx
backend/lib/platform/student-profile.js
backend/lib/platform/teacher-conversation.js
backend/lib/platform/teacher-workspace.js
backend/lib/platform/rag-engine.js
backend/test/profile-conversation.test.js


## تحديث رابط دبیر — Full-page refinement
Teacher chat now fills the available viewport under the shared header, with separate private history, message reading, source references and composer regions. The sidebar brand/logo was removed. Practical exercises have a written task plus syntax-highlighted starter.py and solution.py editors; example-code blocks retain their design. Browser verification now succeeded: the plus menu opened; an exercise preview ran score = 20 / print(score) and returned 20. Portal and combined builds pass. This supersedes the earlier browser-timeout limitation for the desktop chat and exercise preview. Mobile and real online model output are still not claimed as verified.
