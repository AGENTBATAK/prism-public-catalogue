import {render,screen,cleanup} from '@testing-library/react';
import {describe,it,expect,afterEach} from 'vitest';
import {AssistantAnswer,SourceLink} from './AssistantAnswer';
describe('source-backed assistant formatting',()=>{
 afterEach(cleanup);
 it('renders paragraphs, bold, lists and verified citations without executing HTML',()=>{
  render(<AssistantAnswer answer={'**Maitri [1]** is a station.\n\n- Polar research\n- <script>alert(1)</script>\n\n[Official source](https://ncpor.res.in/)'} sources={[{citation:1,document_name:'NCPOR',location:'Web source',excerpt:'',url:'https://ncpor.res.in/'}]} />);
  expect(screen.getByText((text,element)=>element?.tagName==='STRONG'&&text.includes('Maitri')).tagName).toBe('STRONG');
  expect(screen.getByRole('link',{name:'Source 1'}).getAttribute('href')).toBe('https://ncpor.res.in/');
  expect(screen.getByRole('link',{name:'Official source'}).getAttribute('rel')).toContain('noreferrer');
  expect(document.querySelectorAll('li').length).toBe(2);expect(document.querySelector('script')).toBeNull();
 });
 it('does not make invented, unsafe or credential-bearing links clickable',()=>{
  render(<><AssistantAnswer answer={'[Unverified](https://invented.example) [Bad](javascript:alert) [2]'} sources={[]} /><SourceLink source={{citation:2,document_name:'Unsafe',url:'https://secret@example.com'}} /></>);
  expect(screen.queryByRole('link')).toBeNull();
 });
});
