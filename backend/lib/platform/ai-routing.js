'use strict';
const ULTRA='nvidia/nemotron-3-ultra-550b-a55b:free';
function configured(env=process.env){return env.AI_PROVIDER==='openrouter'?Boolean(env.OPENROUTER_CHAT_API_KEY||env.OPENROUTER_CONTENT_API_KEY||env.OPENROUTER_API_KEY):Boolean(env.LIARA_AI_API_KEY&&env.LIARA_AI_CHAT_MODEL);}
function contentTask(kind,input={}){return ['document','author','review','index'].includes(kind)||Boolean(input.documentIds?.length)||kind==='block'&&Boolean(input.intent==='proposal'||input.intent==='summary'||input.blockTypes?.length||input.target);}
function contentRequest(instruction,data={}){return require('./response-style').responseStyle(data.question,data.purpose).language==='Persian'||/^(Independently|Check source|Refine|Act as a teacher author)/.test(instruction)||data.intent==='proposal'||data.intent==='summary'||Boolean(data.blockTypes?.length||data.selectedDocuments?.length||data.document)||Boolean(Array.isArray(data.evidence)&&data.evidence.some(e=>e.documentId));}
function routedProvider(env,signal,create){
 if(env.AI_PROVIDER!=='openrouter'||!env.OPENROUTER_CHAT_API_KEY&&!env.OPENROUTER_CONTENT_API_KEY)return create(env,signal);
 const clients=new Map();
 function route(name){
  if(clients.has(name))return clients.get(name);
  const specific=name==='content'?env.OPENROUTER_CONTENT_API_KEY:env.OPENROUTER_CHAT_API_KEY;
  const key=name==='ultra'?env.OPENROUTER_API_KEY:specific||env.OPENROUTER_API_KEY||env.OPENROUTER_CHAT_API_KEY||env.OPENROUTER_CONTENT_API_KEY;
  const model=name==='ultra'?(env.OPENROUTER_FALLBACK_MODEL||ULTRA):name==='content'?(env.OPENROUTER_CONTENT_MODEL||'nvidia/nemotron-3.5-super-vl:free'):(env.OPENROUTER_CHAT_MODEL||'nvidia/nemotron-3.5-lightning:free');
  const client=create({...env,OPENROUTER_API_KEY:key,OPENROUTER_CHAT_MODEL:model,OPENROUTER_FREE_FALLBACK:'off',__novaRouted:true},signal);
  const value={client,model,key};clients.set(name,value);return value;
 }
 // Validate configured routes at startup, including the free-only guard.
 route('chat');route('content');
 function view(task){return {
  embeddingModel:route('chat').client.embeddingModel,
  embed:texts=>route('chat').client.embed(texts),
  search:topic=>route('chat').client.search(topic),
  forTask:(kind,input)=>view(contentTask(kind,input)?'content':'chat'),
  async json(instruction,data,online=false){
   const name=contentRequest(instruction,data)?'content':task||'chat',primary=route(name);
   try{return await primary.client.json(instruction,data,online)}catch(error){
    const transient=['TimeoutError','AbortError'].includes(error.name)||['AI_RATE_LIMITED','AI_PROVIDER_UNAVAILABLE','AI_MODEL_UNAVAILABLE'].includes(error.message);
    if(!transient||signal?.aborted||!env.OPENROUTER_API_KEY||env.OPENROUTER_FREE_FALLBACK==='off')throw error;
    const fallback=route('ultra');if(fallback.model===primary.model&&fallback.key===primary.key)throw error;
    const result=await fallback.client.json(instruction,data,online);
    const routing={...result.__routing,requestedModel:primary.model,route:name,usedFreeFallback:true,fallbackReason:error.message};
    // Return only safe model metadata, never account keys or request headers.
    const copy={...result};Object.defineProperty(copy,'__routing',{value:routing,enumerable:false});return copy;
   }
  }
 };}
 return view();
}
module.exports={configured,contentTask,contentRequest,routedProvider};
