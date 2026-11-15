const test=require('node:test'),assert=require('node:assert/strict');
const {studioVideoFields}=require('../frontend/design/studio-video.ts');
test('video replacement removes stale sources in both preview and save payloads',()=>{
 const file='/api/platform/files/12345678-1234-1234-1234-123456789abc';
 const old={sourceUrl:file,embedUrl:'https://kavimo.com/old',mediaId:'OLDVIDEO0001'};
 const replacement='https://kavimo.com/new';
 const embed={...old,...studioVideoFields({source:replacement,original:old},replacement)};
 assert.equal(embed.sourceUrl,undefined);assert.equal(embed.mediaId,undefined);assert.equal(embed.embedUrl,replacement);
 const uploaded={...embed,...studioVideoFields({source:file,original:embed},'')};
 assert.equal(uploaded.sourceUrl,file);assert.equal(uploaded.embedUrl,undefined);assert.equal(uploaded.mediaId,undefined);
 assert.equal(studioVideoFields({source:'',requiresUrl:true,original:old},'').pendingMedia,true);
 assert.equal(studioVideoFields({source:'',original:{mediaId:'OLDVIDEO0001'}},'').mediaId,'OLDVIDEO0001');
 assert.equal(studioVideoFields({source:'https://invalid.example/video'},'').pendingMedia,true);
});
