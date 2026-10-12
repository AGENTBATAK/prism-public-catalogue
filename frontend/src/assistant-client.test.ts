import { afterEach, describe, expect, it, vi } from 'vitest';
describe('neutral assistant client',()=>{
 afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();vi.resetModules();});
 it('returns maintenance with no hosted endpoint and no network request',async()=>{
  vi.stubEnv('VITE_ASSISTANT_API_ORIGIN','');vi.stubGlobal('fetch',vi.fn());
  const {requestPublicAssistant}=await import('./assistant-client');
  expect((await requestPublicAssistant({question:'Polar science?',history:[]})).status).toBe('maintenance');expect(fetch).not.toHaveBeenCalled();
 });
 it('uses only the configured server and removes provider metadata',async()=>{
  vi.stubEnv('VITE_ASSISTANT_API_ORIGIN','https://assistant.example');
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({answer:'Polar answer',sources:[],status:'ok',mode:'assistant',generation_model:'private-model',provider:'private-provider'}))));
  const {requestPublicAssistant}=await import('./assistant-client');
  const result=await requestPublicAssistant({question:'Polar science?',history:[]});
  expect(result).toEqual({answer:'Polar answer',sources:[],status:'ok',mode:'assistant'});
  expect(vi.mocked(fetch).mock.calls[0][0]).toBe('https://assistant.example/api/ask');
 });
 it('maps outages and quota errors to maintenance',async()=>{
  vi.stubEnv('VITE_ASSISTANT_API_ORIGIN','https://assistant.example');
  const {requestPublicAssistant}=await import('./assistant-client');
  for(const response of [new Response('{}',{status:429}),new Response('bad'),new Response('{}',{status:503})]){
   vi.stubGlobal('fetch',vi.fn(async()=>response));expect((await requestPublicAssistant({question:'Polar science?',history:[]})).status).toBe('maintenance');
  }
 });
 it('excludes maintenance, error and upload turns and bounds history',async()=>{
  const {historyFromTurns,MAINTENANCE}=await import('./assistant-client');
  const turns=[{role:'user' as const,content:'Polar science?'},{role:'assistant' as const,content:MAINTENANCE,response:{answer:MAINTENANCE,status:'maintenance' as const,mode:'assistant'}},{role:'assistant' as const,content:'error',error:true},{role:'assistant' as const,content:'file.txt'}];
  expect(historyFromTurns(turns)).toEqual([{role:'user',content:'Polar science?'}]);
  expect(historyFromTurns(Array.from({length:15},()=>({role:'user' as const,content:'x'.repeat(1000)}))).reduce((n,t)=>n+t.content.length,0)).toBeLessThanOrEqual(8000);
 });
});
