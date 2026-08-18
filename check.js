const fs=require('fs'),path=require('path');
const ROOT='/Users/Maxou/Supplements/store';
let problems=[];
function walk(d,out=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){
  if(e.name.startsWith('.'))continue;const p=path.join(d,e.name);
  e.isDirectory()?walk(p,out):out.push(p);}return out;}
const files=walk(ROOT);
const html=files.filter(f=>f.endsWith('.html'));
const js=files.filter(f=>f.endsWith('.js'));

// 1. links & assets
for(const f of html){
  const s=fs.readFileSync(f,'utf8');
  const rel=path.relative(ROOT,f);
  const dir=path.dirname(f);
  const depth=rel.includes(path.sep)?'../':'./';
  const declared=(s.match(/CADENCE_ROOT="([^"]*)"/)||[])[1];
  if(declared!==depth)problems.push(`${rel}: CADENCE_ROOT is "${declared}" expected "${depth}"`);
  if(!/<main id="main"/.test(s))problems.push(`${rel}: missing main#main`);
  if(!/id="site-header"/.test(s))problems.push(`${rel}: missing #site-header`);
  if(!/id="site-footer"/.test(s))problems.push(`${rel}: missing #site-footer`);
  if(!/<html lang=/.test(s))problems.push(`${rel}: missing lang`);
  const title=(s.match(/<title>([^<]*)<\/title>/)||[])[1];
  if(!title)problems.push(`${rel}: missing title`);
  if(!/name="description"/.test(s))problems.push(`${rel}: missing meta description`);
  // ids
  const ids=[...s.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  const dup=ids.filter((v,i)=>ids.indexOf(v)!==i);
  if(dup.length)problems.push(`${rel}: duplicate id ${[...new Set(dup)].join(', ')}`);
  // external resources
  for(const m of s.matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g))
    problems.push(`${rel}: external resource ${m[1]}`);
  // internal links
  for(const m of s.matchAll(/(?:href|src)="([^"#][^"]*)"/g)){
    const u=m[1];
    if(/^(https?:|mailto:|tel:|data:|#)/.test(u))continue;
    const target=path.resolve(dir,u.split('#')[0].split('?')[0]);
    if(!fs.existsSync(target))problems.push(`${rel}: broken link -> ${u}`);
  }
}
// 2. prices in catalog must match published grid
const store=fs.readFileSync(path.join(ROOT,'assets/js/store.js'),'utf8');
const expect={build:[29,34],ease:[29,34],flow:[24,28],rest:[37,44],intimate:[31,36],
              'cycle-kit':[72,89],'full-ritual':[118,145]};
for(const [id,[sub,once]] of Object.entries(expect)){
  const re=new RegExp(`id: "${id}"[\\s\\S]{0,600}?sub: (\\d+), once: (\\d+)`);
  const m=store.match(re);
  if(!m)problems.push(`catalog: ${id} not found`);
  else if(+m[1]!==sub||+m[2]!==once)problems.push(`catalog: ${id} is ${m[1]}/${m[2]} expected ${sub}/${once}`);
}
// 3. kit must be cheaper than its parts
const kitParts={'cycle-kit':['build','ease','flow'],'full-ritual':['build','ease','flow','rest','intimate']};
for(const [kit,parts] of Object.entries(kitParts)){
  const sumSub=parts.reduce((a,p)=>a+expect[p][0],0);
  const sumOnce=parts.reduce((a,p)=>a+expect[p][1],0);
  if(expect[kit][0]>=sumSub)problems.push(`pricing: ${kit} sub ${expect[kit][0]} >= parts ${sumSub}`);
  if(expect[kit][1]>=sumOnce)problems.push(`pricing: ${kit} once ${expect[kit][1]} >= parts ${sumOnce}`);
}
// 4. compliance scan
const BAD=[/PMS relief/i,/relieves?\s+cramps/i,/period pain/i,/menstrual pain/i,/dysmenorrh/i,
  /\bUTIs?\b/,/urinary tract infection/i,/bacterial vaginosis/i,/\bBV\b/,/yeast infection/i,/\bthrush\b/i,
  /balances?\s+(your\s+)?hormones/i,/hormone.balancing/i,/treats?\s+insomnia/i,/\bcures?\b/i,
  /flush(es)?\s+toxins/i,/\bdetox\b/i,/weight loss/i,/flat stomach/i,/before and after/i,
  /melatonin is (bad|unsafe|harmful)/i];
for(const f of [...html,...js]){
  const rel=path.relative(ROOT,f);
  if(rel==='check.js')continue; // the scanner contains the word list by definition
  const s=fs.readFileSync(f,'utf8');
  for(const re of BAD){const m=s.match(re);
    if(m)problems.push(`COMPLIANCE ${rel}: "${m[0]}"`);}
}
console.log(`Scanned ${html.length} HTML + ${js.length} JS files.`);
if(!problems.length)console.log('✅ no problems found');
else{console.log(`\n❌ ${problems.length} problem(s):`);problems.forEach(p=>console.log('  - '+p));}
