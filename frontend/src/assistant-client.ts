import type { AskResponse } from './api';
export const MAINTENANCE = "PRISM\u2019s assistant is currently under maintenance. Please try again later.";
export const maintenanceResponse = (): AskResponse => ({answer: MAINTENANCE, sources: [], mode: 'assistant', status: 'maintenance'});
type History = {role: 'user' | 'assistant'; content: string};
type Turn = History & {response?: AskResponse; error?: boolean};
export function historyFromTurns(turns: Turn[]): History[] {
 const history: History[] = [];
 for (const turn of turns) {
  if (turn.error || turn.response?.status === 'maintenance' || turn.content === MAINTENANCE || turn.response?.answer === MAINTENANCE) continue;
  const content = turn.role === 'user' ? turn.content : turn.response?.answer;
  if (typeof content === 'string' && content.trim()) history.push({role:turn.role,content:content.slice(0,8000)});
 }
 const bounded = history.slice(-12); let length = bounded.reduce((sum,turn)=>sum+turn.content.length,0);
 while (length>8000 && bounded.length) {length-=bounded[0].content.length;bounded.shift();}
 return bounded;
}
export async function requestPublicAssistant(payload: {question:string; history?: History[]; mode?:string; record_ids?:string[]}): Promise<AskResponse> {
 const configured = import.meta.env.VITE_ASSISTANT_API_ORIGIN;
 if (!configured) return maintenanceResponse();
 try {
  const origin = new URL(configured);
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) return maintenanceResponse();
  const response = await fetch(new URL('/api/ask',origin).href,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(payload),signal:AbortSignal.timeout(150000)});
  if (response.status===400 || response.status===422) throw new Error('422: Invalid question or conversation');
  if (!response.ok) return maintenanceResponse();
  const result = await response.json();
  if (result.status !== 'ok' || typeof result.answer !== 'string' || !result.answer.trim() || !Array.isArray(result.sources)) return maintenanceResponse();
  return {answer:result.answer,sources:result.sources,mode:'assistant',status:'ok',...(typeof result.search_suggestions==='string'&&result.search_suggestions.length<=20000?{search_suggestions:result.search_suggestions}:{})};
 } catch(error) {
  if (error instanceof Error && error.message.startsWith('422:')) throw error;
  return maintenanceResponse();
 }
}
