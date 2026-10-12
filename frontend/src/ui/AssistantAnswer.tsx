import type {ReactNode} from 'react';
import type {AskResponse} from '../api';
type Source = NonNullable<AskResponse['sources']>[number];
export function safeSourceUrl(value: unknown): string | undefined {
 if(typeof value!=='string')return;
 try {const url=new URL(value);if(['https:','http:'].includes(url.protocol)&&!url.username&&!url.password)return url.href;}catch{ /* keep unsupported URLs as text */ }
}
export function SourceLink({source}: {source: Pick<Source,'citation'|'document_name'|'url'>}) {
 const url=safeSourceUrl(source.url);
 return url?<a href={url} target="_blank" rel="noreferrer noopener">{source.document_name}</a>:<span>{source.document_name}</span>;
}
export function AssistantAnswer({answer,sources=[]}: {answer:string;sources?:Source[]}) {
 const byCitation=new Map(sources.map(source=>[String(source.citation),source]));
 const urls=new Set(sources.map(source=>safeSourceUrl(source.url)).filter(Boolean));
 const inline=(text:string):ReactNode[]=>text.split(/(\*\*[^*]+\*\*|\[[^\]\n]+\]\([^\s)]+\)|\[\d+\])/g).map((part,index)=>{
  if(part.startsWith('**')&&part.endsWith('**'))return <strong key={index}>{inline(part.slice(2,-2))}</strong>;
  const link=part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if(link){const url=safeSourceUrl(link[2]);if(url&&urls.has(url))return <a key={index} href={url} target="_blank" rel="noreferrer noopener">{link[1]}</a>;return part;}
  const citation=part.match(/^\[(\d+)\]$/);
  const source=citation&&byCitation.get(citation[1]),url=source&&safeSourceUrl(source.url);
  return url?<a key={index} className="chat-citation" href={url} target="_blank" rel="noreferrer noopener" aria-label={`Source ${citation![1]}`}>{part}</a>:part;
 });
 return <div className="chat-answer">{answer.split(/\n\s*\n/).map((block,index)=>{
  const lines=block.split('\n');
  if(lines.every(line=>/^\s*[-*]\s+/.test(line)))return <ul key={index}>{lines.map((line,i)=><li key={i}>{inline(line.replace(/^\s*[-*]\s+/,''))}</li>)}</ul>;
  if(lines.every(line=>/^\s*\d+[.)]\s+/.test(line)))return <ol key={index}>{lines.map((line,i)=><li key={i}>{inline(line.replace(/^\s*\d+[.)]\s+/,''))}</li>)}</ol>;
  if(/^#{1,3}\s+/.test(block))return <p key={index}><strong>{inline(block.replace(/^#{1,3}\s+/,''))}</strong></p>;
  return <p key={index}>{inline(block)}</p>;
 })}</div>;
}
