type VideoBlock = {source?:string;requiresUrl?:boolean;original?:{sourceUrl?:string;embedUrl?:string;mediaId?:string}};
// Both preview and persistence must use exactly one source, never a stale original URL.
export function studioVideoFields(block:VideoBlock,embedUrl:string,fallbackId?:string){
 const source=block.source?.trim()||'';
 const clear={sourceUrl:undefined,embedUrl:undefined,mediaId:undefined,pendingMedia:undefined};
 if(block.requiresUrl&&!source)return {...clear,pendingMedia:true};
 if(/^\/api\/platform\/files\/[a-f0-9-]{36}$/.test(source))return {...clear,sourceUrl:source};
 if(source&&embedUrl)return {...clear,embedUrl};
 if(!source&&block.original?.mediaId)return {...clear,mediaId:block.original.mediaId};
 if(!source&&fallbackId)return {...clear,sourceUrl:'/api/platform/files/'+fallbackId};
 return {...clear,pendingMedia:true};
}
