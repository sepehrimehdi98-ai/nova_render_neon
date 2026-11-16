'use strict';
function responseStyle(question,purpose='auto'){
 const q=String(question||'');
 const explicit=[...q.matchAll(/(?:answer|reply|respond|write|explain)\s+(?:to me\s+)?in\s+(English|Persian|Farsi)|به\s+(?:زبان\s+)?(انگلیسی|فارسی)\s*(?:پاسخ|جواب|بنویس|توضیح)?|(انگلیسی|فارسی)\s+(?:پاسخ|جواب|بنویس)/gi)].at(-1);
 const language=explicit?(/English|انگلیسی/i.test(explicit[0])?'English':'Persian'):/[\u0600-\u06ff]/.test(q)?'Persian':'English';
 const length=[...q.matchAll(/\b(?:brief(?:ly)?|concise|short(?:er)?|detailed|comprehensive|in depth)\b|کوتاه(?:‌تر|تر)?|مختصر|خلاصه|مفصل|تفصیلی|با جزئیات|کامل/gi)].at(-1)?.[0]||'';
 const detail=/detailed|comprehensive|in depth|مفصل|تفصیلی|جزئیات|کامل/i.test(length)?'detailed':length?'brief':'balanced';
 const greeting=/^\s*(?:hi|hello|hey|thanks|thank you|سلام|درود|ممنون|مرسی)[!.،؟?\s]*$/i.test(q);
 return {language,detail,greeting,purpose,approach:'Answer the actual latest request first; resolve follow-ups from the current conversation. Respect the requested level, format and constraints. Ask one focused clarification only when essential. Separate known facts from uncertainty; never invent source contents or claim code execution.'};
}
module.exports={responseStyle};
