/**
 * Web Server for Claude Code Console
 * Serves the web-based UI and provides WebSocket communication
 */

import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { WebSocketServer } from 'ws';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { compat } from '../runtime-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getAdminScriptsHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Engine — /admin/scripts</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d1117; --surface: #161b22; --border: #21262d;
      --text: #e6edf3; --muted: #8b949e; --accent: #58a6ff;
      --green: #3fb950; --purple: #bc8cff; --orange: #d29922;
      --red: #f85149; --pink: #ff7b72;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg); color: var(--text); min-height: 100vh; }
    header { background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 14px 24px; display: flex; align-items: center; gap: 12px; }
    header h1 { font-size: 1.1rem; font-weight: 600; color: var(--accent); }
    header span { font-size: 0.75rem; color: var(--muted);
      background: var(--border); padding: 2px 8px; border-radius: 12px; }
    .stats-bar { display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 1px; background: var(--border); border-bottom: 1px solid var(--border); }
    .stat { background: var(--surface); padding: 12px 20px; text-align: center; }
    .stat-val { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
    .stat-lbl { font-size: 0.7rem; color: var(--muted); text-transform: uppercase;
      letter-spacing: 0.05em; margin-top: 2px; }
    main { display: grid; grid-template-columns: 380px 1fr; gap: 0;
      height: calc(100vh - 101px); overflow: hidden; }
    .panel { padding: 20px; overflow-y: auto; }
    .panel-left { border-right: 1px solid var(--border); }
    section { margin-bottom: 20px; }
    label { display: block; font-size: 0.75rem; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    textarea, input[type=text], select {
      width: 100%; background: var(--bg); border: 1px solid var(--border);
      border-radius: 6px; color: var(--text); padding: 10px 12px;
      font-size: 0.875rem; font-family: inherit; resize: vertical; }
    textarea:focus, input:focus, select:focus { outline: none; border-color: var(--accent); }
    .chip-group { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip { padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border);
      background: var(--bg); color: var(--muted); font-size: 0.75rem; cursor: pointer;
      transition: all .15s; user-select: none; }
    .chip.active { border-color: var(--accent); background: rgba(88,166,255,.12); color: var(--accent); }
    .chip.format-pinnwand.active { border-color: var(--purple); background: rgba(188,140,255,.12); color: var(--purple); }
    .chip.format-guide.active { border-color: var(--green); background: rgba(63,185,80,.12); color: var(--green); }
    .chip.format-pov.active { border-color: var(--pink); background: rgba(255,123,114,.12); color: var(--pink); }
    .chip.hook-secret.active { border-color: #ffa657; background: rgba(255,166,87,.12); color: #ffa657; }
    .chip.hook-conflict.active { border-color: var(--red); background: rgba(248,81,73,.12); color: var(--red); }
    .chip.hook-pov.active { border-color: var(--purple); background: rgba(188,140,255,.12); color: var(--purple); }
    .chip.hook-list.active { border-color: var(--green); background: rgba(63,185,80,.12); color: var(--green); }
    .chip.hook-emotion.active { border-color: var(--pink); background: rgba(255,123,114,.12); color: var(--pink); }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
      border-radius: 6px; border: none; font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: opacity .15s; }
    .btn-primary { background: var(--accent); color: #0d1117; }
    .btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
    .btn-danger { background: rgba(248,81,73,.15); color: var(--red); border: 1px solid var(--red); }
    .btn:hover { opacity: 0.85; } .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
    .tab { padding: 10px 16px; font-size: 0.8rem; cursor: pointer; color: var(--muted);
      border-bottom: 2px solid transparent; transition: all .15s; }
    .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .scripts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .script-card { background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 14px; }
    .script-card:hover { border-color: var(--accent); }
    .card-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 10px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-format-pinnwand { background: rgba(188,140,255,.2); color: var(--purple); }
    .badge-format-guide { background: rgba(63,185,80,.2); color: var(--green); }
    .badge-format-pov { background: rgba(255,123,114,.2); color: var(--pink); }
    .badge-male { background: rgba(88,166,255,.2); color: var(--accent); }
    .badge-female { background: rgba(255,166,87,.2); color: #ffa657; }
    .badge-couple { background: rgba(63,185,80,.2); color: var(--green); }
    .script-hook { font-size: 0.7rem; color: var(--muted); margin-bottom: 8px;
      padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .script-hook strong { color: var(--orange); }
    .script-body { font-size: 0.825rem; line-height: 1.6; white-space: pre-wrap; }
    .card-actions { display: flex; gap: 6px; margin-top: 12px; }
    .card-actions .btn { padding: 5px 10px; font-size: 0.75rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    th { text-align: left; padding: 8px 12px; color: var(--muted);
      font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border); }
    td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:hover td { background: rgba(255,255,255,.02); }
    .perf-bar { height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
    .perf-fill { height: 100%; border-radius: 3px; background: var(--accent); transition: width .4s; }
    .multiplier { background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .mult-row { display: flex; justify-content: space-between; align-items: center;
      padding: 6px 0; border-bottom: 1px dotted var(--border); font-size: 0.8rem; }
    .mult-row:last-child { border-bottom: none; }
    .mult-val { font-weight: 700; color: var(--accent); }
    .total-val { font-size: 1.4rem; font-weight: 800; color: var(--green); }
    .spinner { display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.2); border-top-color: #fff;
      border-radius: 50%; animation: spin .6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    #toast { position: fixed; bottom: 24px; right: 24px; background: var(--surface);
      border: 1px solid var(--border); border-radius: 8px; padding: 12px 18px;
      font-size: 0.825rem; transform: translateY(80px); opacity: 0;
      transition: all .25s; z-index: 999; max-width: 320px; }
    #toast.show { transform: translateY(0); opacity: 1; }
    #toast.success { border-color: var(--green); } #toast.error { border-color: var(--red); }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
    .empty-state p { font-size: 0.875rem; margin-top: 12px; }
    .accounts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .account-card { background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 14px; text-align: center; }
    .account-icon { font-size: 1.8rem; margin-bottom: 8px; }
    .account-name { font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .account-posts { font-size: 0.75rem; color: var(--muted); }
    .account-bar { margin-top: 10px; }
  </style>
</head>
<body>
<header>
  <h1>&#9889; Content Engine</h1>
  <span>/admin/scripts</span>
  <span id="queue-count" style="margin-left:auto">Queue: 0</span>
</header>
<div class="stats-bar">
  <div class="stat"><div class="stat-val" id="s-insights">0</div><div class="stat-lbl">Insights</div></div>
  <div class="stat"><div class="stat-val" id="s-scripts">0</div><div class="stat-lbl">Scripts</div></div>
  <div class="stat"><div class="stat-val" id="s-formats">3</div><div class="stat-lbl">Formats</div></div>
  <div class="stat"><div class="stat-val" id="s-perspectives">3</div><div class="stat-lbl">Perspectives</div></div>
  <div class="stat"><div class="stat-val" id="s-hooks">5</div><div class="stat-lbl">Hook Types</div></div>
</div>
<main>
  <div class="panel panel-left">
    <section>
      <label>SEO Insight / Topic</label>
      <textarea id="insight-input" rows="4" placeholder="e.g. silence often means emotional overwhelm"></textarea>
    </section>
    <section>
      <label>Formats</label>
      <div class="chip-group">
        <span class="chip format-pinnwand active" data-group="format" data-val="pinnwand">Pinnwand</span>
        <span class="chip format-guide active" data-group="format" data-val="guide">Mini Guide</span>
        <span class="chip format-pov active" data-group="format" data-val="pov">POV</span>
      </div>
    </section>
    <section>
      <label>Perspectives</label>
      <div class="chip-group">
        <span class="chip active" data-group="perspective" data-val="male">Male</span>
        <span class="chip active" data-group="perspective" data-val="female">Female</span>
        <span class="chip active" data-group="perspective" data-val="couple">Couple</span>
      </div>
    </section>
    <section>
      <label>Hook Types</label>
      <div class="chip-group">
        <span class="chip hook-secret active" data-group="hook" data-val="secret">Secret</span>
        <span class="chip hook-conflict active" data-group="hook" data-val="conflict">Conflict</span>
        <span class="chip hook-pov active" data-group="hook" data-val="pov">POV</span>
        <span class="chip hook-list active" data-group="hook" data-val="list">List</span>
        <span class="chip hook-emotion active" data-group="hook" data-val="emotion">Emotion</span>
      </div>
    </section>
    <section>
      <label>Multiplier Preview</label>
      <div class="multiplier">
        <div class="mult-row"><span>Formats selected</span><span class="mult-val" id="m-formats">3</span></div>
        <div class="mult-row"><span>Perspectives</span><span class="mult-val" id="m-persp">3</span></div>
        <div class="mult-row"><span>Hook variants</span><span class="mult-val" id="m-hooks">5</span></div>
        <div class="mult-row"><span>Scripts per insight</span><span class="mult-val" id="m-scripts">9</span></div>
        <div class="mult-row"><span>Videos per insight</span><span class="mult-val" id="m-videos">45</span></div>
        <div class="mult-row" style="border-top:1px solid var(--border);margin-top:6px;padding-top:10px">
          <span>100 Insights &rarr; Videos</span><span class="total-val" id="m-total">4,500</span>
        </div>
      </div>
    </section>
    <div class="btn-row">
      <button class="btn btn-primary" id="btn-generate">&#9733; Generate Scripts</button>
      <button class="btn btn-secondary" id="btn-clear-queue">Clear Queue</button>
    </div>
  </div>

  <div class="panel">
    <div class="tabs">
      <div class="tab active" data-tab="scripts">Scripts</div>
      <div class="tab" data-tab="queue">Queue</div>
      <div class="tab" data-tab="performance">Hook Performance</div>
      <div class="tab" data-tab="scheduler">Scheduler</div>
    </div>

    <div class="tab-content active" id="tab-scripts">
      <div id="scripts-container">
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>
          <p>Enter an insight and click Generate Scripts</p>
        </div>
      </div>
    </div>

    <div class="tab-content" id="tab-queue">
      <div style="display:flex;gap:8px;margin-bottom:14px">
        <button class="btn btn-secondary" id="btn-export">Export JSON</button>
        <button class="btn btn-danger" id="btn-clear-all">Clear All</button>
      </div>
      <table><thead><tr><th>#</th><th>Hook</th><th>Format</th><th>Perspective</th><th>Account</th><th>Post Time</th><th>Action</th></tr></thead>
      <tbody id="queue-body"><tr><td colspan="7" style="text-align:center;color:var(--muted);padding:40px">Queue is empty</td></tr></tbody></table>
    </div>

    <div class="tab-content" id="tab-performance">
      <table><thead><tr><th>Hook</th><th>Type</th><th>Views</th><th>Saves</th><th>Completion</th><th>Score</th></tr></thead>
      <tbody id="perf-body"><tr><td colspan="6" style="text-align:center;color:var(--muted);padding:40px">No performance data yet</td></tr></tbody></table>
    </div>

    <div class="tab-content" id="tab-scheduler">
      <p style="color:var(--muted);font-size:.8rem;margin-bottom:16px">3 accounts &times; 3 posts/day = 9 videos daily</p>
      <div class="accounts-grid">
        <div class="account-card">
          <div class="account-icon">&#9794;</div>
          <div class="account-name" style="color:var(--accent)">@male_account</div>
          <div class="account-posts" id="male-posts">0 queued</div>
          <div class="account-bar" id="male-bar"><div class="perf-bar"><div class="perf-fill" style="width:0%"></div></div></div>
        </div>
        <div class="account-card">
          <div class="account-icon">&#9792;</div>
          <div class="account-name" style="color:#ffa657">@female_account</div>
          <div class="account-posts" id="female-posts">0 queued</div>
          <div class="account-bar" id="female-bar"><div class="perf-bar"><div class="perf-fill" style="width:0%"></div></div></div>
        </div>
        <div class="account-card">
          <div class="account-icon">&#9825;</div>
          <div class="account-name" style="color:var(--green)">@couple_account</div>
          <div class="account-posts" id="couple-posts">0 queued</div>
          <div class="account-bar" id="couple-bar"><div class="perf-bar"><div class="perf-fill" style="width:0%"></div></div></div>
        </div>
      </div>
      <div style="margin-top:20px">
        <label style="margin-bottom:10px">Daily Format Mix (Recommended)</label>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          <div class="multiplier" style="text-align:center"><div class="stat-val" style="color:var(--purple)">4</div><div class="stat-lbl">Pinnwand</div></div>
          <div class="multiplier" style="text-align:center"><div class="stat-val" style="color:var(--green)">3</div><div class="stat-lbl">Mini Guide</div></div>
          <div class="multiplier" style="text-align:center"><div class="stat-val" style="color:var(--pink)">2</div><div class="stat-lbl">POV</div></div>
        </div>
      </div>
      <div style="margin-top:20px">
        <label style="margin-bottom:8px">Scheduled Queue</label>
        <table><thead><tr><th>Account</th><th>Format</th><th>Hook</th><th>Time</th></tr></thead>
        <tbody id="sched-body"><tr><td colspan="4" style="text-align:center;color:var(--muted);padding:40px">No scripts queued</td></tr></tbody></table>
      </div>
    </div>
  </div>
</main>
<div id="toast"></div>

<script>
(function(){
  let scripts=[],queue=[],perfData={},insightCount=0;
  function toast(msg,type='success'){const t=document.getElementById('toast');t.textContent=msg;t.className='show '+type;setTimeout(()=>{t.className='';},3000);}
  function getSelected(g){return[...document.querySelectorAll('.chip[data-group="'+g+'"].active')].map(c=>c.dataset.val);}
  document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{c.classList.toggle('active');updateMult();}));
  function updateMult(){const f=getSelected('format').length,p=getSelected('perspective').length,h=getSelected('hook').length,s=f*p,v=s*h;
    document.getElementById('m-formats').textContent=f;document.getElementById('m-persp').textContent=p;
    document.getElementById('m-hooks').textContent=h;document.getElementById('m-scripts').textContent=s;
    document.getElementById('m-videos').textContent=v;document.getElementById('m-total').textContent=(100*v).toLocaleString();}
  updateMult();
  document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');document.getElementById('tab-'+t.dataset.tab).classList.add('active');}));
  const HOOKS={secret:['Nobody talks about this part of relationships','This is the secret nobody tells you'],
    conflict:['Why this confuses most people','This is where couples get it wrong'],
    pov:['POV: {topic}','POV: you finally understand {topic}'],
    list:['3 things {topic} actually means','5 signs you need to know'],
    emotion:['This hit different','Men need to hear this']};
  const BODIES={
    pinnwand:{male:i=>i+'\\n\\nShe is not angry\\nShe is overwhelmed\\nSilence is how she resets',
      female:i=>'You are not too much\\n'+i+'\\nYour feelings make sense',
      couple:i=>'Silence is not distance\\n'+i+'\\nSpace can be closeness too'},
    guide:{male:i=>'If she goes quiet:\\n\\n1. Don\\'t push\\n2. Say "I\\'m here"\\n3. Give space\\n\\nShe will open up when she feels safe',
      female:i=>'When '+i+'\\n\\n1. Name it gently\\n2. Breathe first\\n3. Come back\\n\\nYou don\\'t owe an explanation',
      couple:i=>'When '+i+'\\n\\n1. Pause\\n2. Agree to reconnect\\n3. Listen\\n\\nUnderstanding beats winning'},
    pov:{male:i=>'POV: she goes quiet\\n\\nYou think she\\'s angry\\nShe\\'s overwhelmed\\n\\n'+i,
      female:i=>'POV: you shut down\\n\\nNot because you don\\'t care\\nBecause you care too much\\n\\n'+i,
      couple:i=>'POV: conversation stops\\n\\nNeither of you is wrong\\nBoth overwhelmed\\n\\n'+i}};
  function genHook(type,insight){const t=HOOKS[type],r=t[Math.floor(Math.random()*t.length)];return r.replace('{topic}',insight.split(' ').slice(0,4).join(' '));}
  function fmtLabel(f){return{pinnwand:'Pinnwand',guide:'Mini Guide',pov:'POV'}[f]||f;}
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function postTime(i){return['09:00','12:00','18:00','21:00'][i%4];}
  document.getElementById('btn-generate').addEventListener('click',()=>{
    const insight=document.getElementById('insight-input').value.trim();
    if(!insight){toast('Enter an insight first','error');return;}
    const formats=getSelected('format'),perspectives=getSelected('perspective'),hooks=getSelected('hook');
    if(!formats.length||!perspectives.length||!hooks.length){toast('Select at least one from each group','error');return;}
    const btn=document.getElementById('btn-generate');
    btn.disabled=true;btn.innerHTML='<span class="spinner"></span> Generating\u2026';
    const newS=[];
    for(const f of formats)for(const p of perspectives)for(const h of hooks){
      const body=(BODIES[f]&&BODIES[f][p])?BODIES[f][p](insight):insight;
      newS.push({format:f,perspective:p,hookType:h,hook:genHook(h,insight),body,insight});}
    scripts=[...scripts,...newS];insightCount++;
    document.getElementById('s-insights').textContent=insightCount;
    document.getElementById('s-scripts').textContent=scripts.length;
    newS.forEach((s,i)=>queue.push({id:Date.now()+i,hook:s.hook,format:s.format,perspective:s.perspective,
      account:s.perspective+'_account',postTime:postTime(queue.length+i),script:s.body,hookType:s.hookType}));
    document.getElementById('queue-count').textContent='Queue: '+queue.length;
    renderScripts(newS);renderQueue();renderScheduler();
    setTimeout(()=>{btn.disabled=false;btn.innerHTML='&#9733; Generate Scripts';toast('Generated '+newS.length+' scripts');},400);});
  function renderScripts(list){
    const c=document.getElementById('scripts-container');
    const g=document.createElement('div');g.className='scripts-grid';
    list.forEach(s=>{const d=document.createElement('div');d.className='script-card';
      d.innerHTML='<div class="card-meta"><span class="badge badge-format-'+s.format+'">'+fmtLabel(s.format)+'</span>'+
        '<span class="badge badge-'+s.perspective+'">'+s.perspective+'</span>'+
        '<span class="badge" style="background:rgba(200,200,200,.1);color:var(--muted)">'+s.hookType+'</span></div>'+
        '<div class="script-hook">Hook: <strong>'+esc(s.hook)+'</strong></div>'+
        '<div class="script-body">'+esc(s.body)+'</div>'+
        '<div class="card-actions"><button class="btn btn-secondary" onclick="copyS(this,'+JSON.stringify(esc(s.hook+'\\n\\n'+s.body))+')">Copy</button>'+
        '<button class="btn btn-primary" onclick="trackH('+JSON.stringify(s.hookType)+','+JSON.stringify(s.hook)+')">Track</button></div>';
      g.appendChild(d);});
    if(c.querySelector('.empty-state'))c.innerHTML='';c.prepend(g);}
  window.copyS=function(btn,text){navigator.clipboard.writeText(text.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"'));btn.textContent='Copied!';setTimeout(()=>btn.textContent='Copy',1500);};
  window.trackH=function(type,hook){if(!perfData[hook])perfData[hook]={type,hook,views:0,saves:0,completion:0};
    const d=perfData[hook];d.views+=Math.floor(Math.random()*8000+2000);d.saves+=Math.floor(Math.random()*500+100);
    d.completion=Math.round(Math.random()*40+50);renderPerf();toast('Hook tracked');};
  function renderPerf(){const tbody=document.getElementById('perf-body');
    const rows=Object.values(perfData).sort((a,b)=>b.views-a.views);if(!rows.length)return;
    const mx=Math.max(...rows.map(r=>r.views));
    tbody.innerHTML=rows.map(r=>'<tr><td style="max-width:160px;font-size:.75rem">'+esc(r.hook)+'</td>'+
      '<td><span class="badge" style="background:rgba(200,200,200,.1);color:var(--muted)">'+r.type+'</span></td>'+
      '<td>'+r.views.toLocaleString()+'</td><td>'+r.saves.toLocaleString()+'</td>'+
      '<td><div style="display:flex;align-items:center;gap:8px"><div class="perf-bar" style="flex:1"><div class="perf-fill" style="width:'+r.completion+'%;background:var(--green)"></div></div><span style="font-size:.75rem">'+r.completion+'%</span></div></td>'+
      '<td><div style="display:flex;align-items:center;gap:8px"><div class="perf-bar" style="flex:1"><div class="perf-fill" style="width:'+Math.round(r.views/mx*100)+'%"></div></div><span style="font-size:.75rem;color:var(--accent)">'+Math.round(r.views/mx*100)+'</span></div></td></tr>').join('');}
  function renderQueue(){const tbody=document.getElementById('queue-body');
    if(!queue.length){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:40px">Queue is empty</td></tr>';return;}
    tbody.innerHTML=queue.map((item,i)=>'<tr><td style="color:var(--muted)">'+(i+1)+'</td>'+
      '<td style="font-size:.75rem;max-width:160px">'+esc(item.hook)+'</td>'+
      '<td><span class="badge badge-format-'+item.format+'">'+fmtLabel(item.format)+'</span></td>'+
      '<td><span class="badge badge-'+item.perspective+'">'+item.perspective+'</span></td>'+
      '<td style="font-size:.75rem;color:var(--muted)">@'+item.account+'</td>'+
      '<td style="font-size:.75rem">'+item.postTime+'</td>'+
      '<td><button class="btn btn-danger" style="padding:3px 8px;font-size:.7rem" onclick="rmQ('+item.id+')">Remove</button></td></tr>').join('');}
  window.rmQ=function(id){queue=queue.filter(q=>q.id!==id);document.getElementById('queue-count').textContent='Queue: '+queue.length;renderQueue();renderScheduler();};
  function renderScheduler(){
    ['male','female','couple'].forEach(p=>{const acc=p+'_account';const items=queue.filter(q=>q.account===acc);
      document.getElementById(p+'-posts').textContent=items.length+' queued';
      const pct=Math.min(100,Math.round(items.length/3*100));
      document.getElementById(p+'-bar').innerHTML='<div class="perf-bar"><div class="perf-fill" style="width:'+pct+'%"></div></div>';});
    const tbody=document.getElementById('sched-body');
    if(!queue.length){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:40px">No scripts queued</td></tr>';return;}
    tbody.innerHTML=queue.map(q=>'<tr><td style="font-size:.75rem;color:var(--muted)">@'+q.account+'</td>'+
      '<td><span class="badge badge-format-'+q.format+'">'+fmtLabel(q.format)+'</span></td>'+
      '<td style="font-size:.75rem;max-width:150px">'+esc(q.hook)+'</td>'+
      '<td style="font-size:.75rem">'+q.postTime+'</td></tr>').join('');}
  document.getElementById('btn-clear-queue').addEventListener('click',()=>{queue=[];document.getElementById('queue-count').textContent='Queue: 0';renderQueue();renderScheduler();toast('Queue cleared');});
  document.getElementById('btn-export').addEventListener('click',()=>{const b=new Blob([JSON.stringify(queue,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='content-queue-'+new Date().toISOString().slice(0,10)+'.json';a.click();toast('Exported '+queue.length+' items');});
  document.getElementById('btn-clear-all').addEventListener('click',()=>{queue=[];document.getElementById('queue-count').textContent='Queue: 0';renderQueue();renderScheduler();toast('Queue cleared');});
})();
</script>
</body></html>`;
}

export class ClaudeCodeWebServer {
  constructor(port = 3000) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.connections = new Set();
    this.uiPath = join(__dirname, '../../ui/console');
    this.isRunning = false;
  }

  async createAPIRoutes() {
    const express = await import('express');
    const router = express.Router();

    // Health check endpoint
    router.get('/health', (req, res) => {
      res.json({ status: 'ok', uptime: process.uptime() });
    });

    // System status endpoint
    router.get('/status', (req, res) => {
      res.json({
        connections: this.connections.size,
        isRunning: this.isRunning,
        port: this.port,
      });
    });

    return router;
  }

  /**
   * Start the web server
   */
  async start() {
    if (this.isRunning) {
      printWarning('Web server is already running');
      return;
    }

    try {
      // Create HTTP server with express
      const express = await import('express');
      const app = express.default();

      // Enable CORS
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
      });

      // Serve static files
      app.use('/console', express.static(this.uiPath));
      app.use('/api', await this.createAPIRoutes());

      // Default route redirects to console
      app.get('/', (req, res) => {
        res.redirect('/console');
      });

      // ── TikTok Content Engine UI ────────────────────────────────────────────
      app.get('/admin/scripts', (req, res) => {
        res.send(getAdminScriptsHTML());
      });

      app.post('/admin/scripts/api/generate', express.json(), (req, res) => {
        const { insight, formats = ['pinnwand','guide','pov'],
                perspectives = ['male','female','couple'],
                hookTypes = ['secret','conflict','pov','list','emotion'] } = req.body || {};
        if (!insight) return res.status(400).json({ error: 'insight is required' });
        const hookTemplates = {
          secret: ['Nobody talks about this part of relationships','This is the secret nobody tells you'],
          conflict: ['Why this confuses most people','This is where couples get it wrong'],
          pov: ['POV: {topic}','POV: you finally understand {topic}'],
          list: ['3 things {topic} actually means','5 signs you need to know'],
          emotion: ['This hit different','Men need to hear this'],
        };
        const scripts = [];
        for (const format of formats) for (const perspective of perspectives) for (const hookType of hookTypes) {
          const hooks = hookTemplates[hookType] || [];
          const hook = (hooks[Math.floor(Math.random() * hooks.length)] || '')
            .replace('{topic}', insight.split(' ').slice(0, 4).join(' '));
          scripts.push({ format, perspective, hookType, hook, insight,
            account: perspective + '_account', generatedAt: new Date().toISOString() });
        }
        res.json({ scripts, count: scripts.length,
          multiplier: { formats: formats.length, perspectives: perspectives.length,
            hookTypes: hookTypes.length, scriptsPerInsight: formats.length * perspectives.length,
            videosPerInsight: formats.length * perspectives.length * hookTypes.length } });
      });
      // ───────────────────────────────────────────────────────────────────────

      this.server = createServer(app);

      // Create WebSocket server
      this.wss = new WebSocketServer({
        server: this.server,
        path: '/ws',
      });

      this.setupWebSocketServer();

      // Start listening
      await new Promise((resolve, reject) => {
        this.server.listen(this.port, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      this.isRunning = true;
      printSuccess(`🌐 Claude Code Web UI started successfully`);
      console.log(`📍 Web Interface: http://localhost:${this.port}/console`);
      console.log(`🔗 WebSocket: ws://localhost:${this.port}/ws`);
      console.log(`📁 Serving UI from: ${this.uiPath}`);
      console.log();
    } catch (error) {
      printError(`Failed to start web server: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop the web server
   */
  async stop() {
    if (!this.isRunning) return;

    // Close all WebSocket connections
    this.connections.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.close(1000, 'Server shutting down');
      }
    });

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }

    // Close HTTP server
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
    }

    this.isRunning = false;
    printInfo('Web server stopped');
  }

  /**
   * Handle HTTP requests
   */
  handleRequest(req, res) {
    const url = req.url;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Route handling
    if (url === '/' || url === '/console' || url === '/console/') {
      this.serveConsoleHTML(res);
    } else if (url.startsWith('/console/')) {
      // Remove /console prefix and serve static files
      const filePath = url.substring('/console/'.length);
      this.serveStaticFile(res, filePath);
    } else if (url === '/health') {
      this.handleHealthCheck(res);
    } else if (url === '/api/status') {
      this.handleStatusAPI(res);
    } else if (url === '/favicon.ico') {
      this.handleFavicon(res);
    } else {
      this.handle404(res);
    }
  }

  /**
   * Serve the console HTML with corrected paths
   */
  serveConsoleHTML(res) {
    const filePath = join(this.uiPath, 'index.html');

    if (!existsSync(filePath)) {
      this.handle404(res);
      return;
    }

    try {
      let content = readFileSync(filePath, 'utf8');

      // Fix relative paths to be relative to /console/
      content = content.replace(/href="styles\//g, 'href="/console/styles/');
      content = content.replace(/src="js\//g, 'src="/console/js/');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch (error) {
      this.handle500(res, error);
    }
  }

  /**
   * Serve a specific file from the UI directory
   */
  serveFile(res, filename, contentType) {
    const filePath = join(this.uiPath, filename);

    if (!existsSync(filePath)) {
      this.handle404(res);
      return;
    }

    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (error) {
      this.handle500(res, error);
    }
  }

  /**
   * Serve static files (CSS, JS, etc.)
   */
  serveStaticFile(res, requestPath) {
    // Security: prevent directory traversal
    if (requestPath.includes('..') || requestPath.includes('\0')) {
      this.handle403(res);
      return;
    }

    const filePath = join(this.uiPath, requestPath);

    if (!existsSync(filePath)) {
      this.handle404(res);
      return;
    }

    // Determine content type
    const contentType = this.getContentType(requestPath);

    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (error) {
      this.handle500(res, error);
    }
  }

  /**
   * Get content type based on file extension
   */
  getContentType(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();

    const contentTypes = {
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      woff: 'font/woff',
      woff2: 'font/woff2',
      ttf: 'font/ttf',
      eot: 'application/vnd.ms-fontobject',
    };

    return contentTypes[ext] || 'text/plain';
  }

  /**
   * Handle health check endpoint
   */
  handleHealthCheck(res) {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      connections: this.connections.size,
      memory: process.memoryUsage(),
      platform: compat.platform,
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
  }

  /**
   * Handle status API endpoint
   */
  handleStatusAPI(res) {
    const status = {
      server: {
        running: this.isRunning,
        port: this.port,
        connections: this.connections.size,
      },
      claudeFlow: {
        initialized: true,
        version: '1.0.72',
      },
      runtime: compat.runtime,
      platform: compat.platform,
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status, null, 2));
  }

  /**
   * Handle favicon request
   */
  handleFavicon(res) {
    // Simple SVG favicon
    const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#1f6feb"/>
      <text x="16" y="20" text-anchor="middle" fill="white" font-family="monospace" font-size="18">⚡</text>
    </svg>`;

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(favicon);
  }

  /**
   * Handle 403 Forbidden
   */
  handle403(res) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
  }

  /**
   * Handle 404 Not Found
   */
  handle404(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }

  /**
   * Handle 500 Internal Server Error
   */
  handle500(res, error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }

  /**
   * Setup WebSocket server
   */
  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      this.handleWebSocketConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  }

  /**
   * Handle new WebSocket connection
   */
  handleWebSocketConnection(ws, req) {
    const clientIP = req.socket.remoteAddress;
    console.log(`🔗 New WebSocket connection from ${clientIP}`);

    this.connections.add(ws);

    // Send welcome message
    this.sendMessage(ws, {
      jsonrpc: '2.0',
      method: 'connection/established',
      params: {
        server: 'claude-flow-web-server',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      },
    });

    // Handle messages
    ws.on('message', (data) => {
      this.handleWebSocketMessage(ws, data);
    });

    // Handle close
    ws.on('close', (code, reason) => {
      console.log(`❌ WebSocket connection closed: ${code} ${reason}`);
      this.connections.delete(ws);
    });

    // Handle error
    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connections.delete(ws);
    });

    // Setup ping/pong for connection health
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleWebSocketMessage(ws, data) {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received WebSocket message:', message.method, message.id);

      // Handle different message types
      switch (message.method) {
        case 'initialize':
          this.handleInitialize(ws, message);
          break;

        case 'ping':
          this.handlePing(ws, message);
          break;

        case 'tools/call':
          this.handleToolCall(ws, message);
          break;

        case 'tools/list':
          console.log('Handling tools/list request');
          this.handleToolsList(ws, message);
          break;

        default:
          console.log('Unknown method:', message.method);
          this.handleUnknownMethod(ws, message);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      this.sendError(ws, null, 'Invalid JSON message');
    }
  }

  /**
   * Handle initialize request
   */
  handleInitialize(ws, message) {
    const response = {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        protocolVersion: { major: 2024, minor: 11, patch: 5 },
        serverInfo: {
          name: 'claude-flow-web-server',
          version: '2.0.0',
        },
        capabilities: {
          logging: { level: 'info' },
          tools: { listChanged: true },
          resources: { listChanged: false, subscribe: false },
          prompts: { listChanged: false },
        },
      },
    };

    this.sendMessage(ws, response);
  }

  /**
   * Handle ping request
   */
  handlePing(ws, message) {
    this.sendMessage(ws, {
      jsonrpc: '2.0',
      method: 'pong',
      params: {
        timestamp: Date.now(),
        original: message.params,
      },
    });
  }

  /**
   * Handle tool call request
   */
  handleToolCall(ws, message) {
    const { name, arguments: args } = message.params;

    // Mock tool execution for demonstration
    const result = this.executeMockTool(name, args);

    const response = {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      },
    };

    this.sendMessage(ws, response);
  }

  /**
   * Handle tools list request
   */
  handleToolsList(ws, message) {
    const tools = [
      {
        name: 'claude-flow/execute',
        description: 'Execute Claude Flow commands (start, stop, status, modes)',
        inputSchema: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'Command to execute' },
            args: { type: 'object', description: 'Command arguments' },
          },
          required: ['command'],
        },
      },
      {
        name: 'swarm/orchestrate',
        description: 'Manage swarm orchestration (create, start, stop, status)',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', description: 'Action to perform' },
            args: { type: 'array', description: 'Action arguments' },
          },
          required: ['action'],
        },
      },
      {
        name: 'system/health',
        description: 'Get comprehensive system health status',
        inputSchema: {
          type: 'object',
          properties: {
            detailed: { type: 'boolean', description: 'Include detailed metrics' },
          },
        },
      },
      {
        name: 'memory/manage',
        description: 'Manage persistent memory and storage',
        inputSchema: {
          type: 'object',
          properties: {
            operation: { type: 'string', description: 'Operation: store, retrieve, list, delete' },
            key: { type: 'string', description: 'Memory key' },
            value: { type: 'string', description: 'Value to store' },
          },
          required: ['operation'],
        },
      },
      {
        name: 'agents/manage',
        description: 'Manage AI agents and their coordination',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', description: 'Action: list, create, start, stop, status' },
            agentType: { type: 'string', description: 'Agent type for creation' },
            agentId: { type: 'string', description: 'Agent ID for operations' },
          },
          required: ['action'],
        },
      },
      {
        name: 'sparc/execute',
        description: 'Execute SPARC mode operations',
        inputSchema: {
          type: 'object',
          properties: {
            mode: { type: 'string', description: 'SPARC mode: coder, architect, analyzer, etc.' },
            task: { type: 'string', description: 'Task description' },
            options: { type: 'object', description: 'Additional options' },
          },
          required: ['mode'],
        },
      },
      {
        name: 'benchmark/run',
        description: 'Run performance benchmarks',
        inputSchema: {
          type: 'object',
          properties: {
            suite: { type: 'string', description: 'Benchmark suite to run' },
            iterations: { type: 'number', description: 'Number of iterations' },
          },
        },
      },
    ];

    const response = {
      jsonrpc: '2.0',
      id: message.id,
      result: { tools },
    };

    this.sendMessage(ws, response);
  }

  /**
   * Handle unknown method
   */
  handleUnknownMethod(ws, message) {
    this.sendError(ws, message.id, `Unknown method: ${message.method}`);
  }

  /**
   * Execute mock tool for demonstration
   */
  executeMockTool(name, args) {
    switch (name) {
      case 'claude-flow/execute':
        return this.executeClaudeFlowCommand(args.command, args.args);

      case 'system/health':
        const healthData = {
          status: 'healthy',
          uptime: Math.floor(process.uptime()),
          memory: process.memoryUsage(),
          connections: this.connections.size,
          platform: compat.platform,
          timestamp: new Date().toISOString(),
        };

        if (args.detailed) {
          healthData.detailed = {
            nodeVersion: process.version,
            architecture: process.arch,
            pid: process.pid,
            cpuUsage: process.cpuUsage(),
            resourceUsage: process.resourceUsage ? process.resourceUsage() : 'N/A',
          };
        }

        return JSON.stringify(healthData, null, 2);

      case 'swarm/orchestrate':
        return this.executeSwarmCommand(args.action, args.args);

      case 'swarm/status':
        return this.executeSwarmCommand('status', args.args);

      case 'memory/manage':
        return this.executeMemoryCommand(args.operation, args.key, args.value);

      case 'agents/manage':
        return this.executeAgentsCommand(args.action, args.agentType, args.agentId);

      case 'sparc/execute':
        return this.executeSPARCCommand(args.mode, args.task, args.options);

      case 'benchmark/run':
        return this.executeBenchmarkCommand(args.suite, args.iterations);

      default:
        return `Tool '${name}' executed successfully with args: ${JSON.stringify(args)}`;
    }
  }

  /**
   * Execute Claude Flow command simulation
   */
  executeClaudeFlowCommand(command, args = {}) {
    switch (command) {
      case 'status':
        return `Claude Flow Status:
  Version: 2.0.0
  Mode: Web Console
  Active Processes: 3
  Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
  Uptime: ${Math.floor(process.uptime())}s`;

      case 'init':
        return `Claude Flow initialization complete:
  ✅ Project structure created
  ✅ Configuration files generated
  ✅ Memory bank initialized
  ✅ Ready for development`;

      case 'agents':
        return `Active Agents:
  • Research Agent (idle) - 0 tasks
  • Code Developer (working) - 2 tasks  
  • Data Analyst (idle) - 0 tasks
  
  Total: 3 agents`;

      default:
        return `Claude Flow command '${command}' executed successfully`;
    }
  }

  /**
   * Execute swarm command simulation
   */
  executeSwarmCommand(action = 'status', args = []) {
    switch (action) {
      case 'status':
        return `Swarm Orchestration Status:
  🐝 Swarm: ACTIVE
  🏗️ Topology: hierarchical
  👥 Agents: 5/8 active
  📊 Tasks: 12 total (4 complete, 6 in-progress, 2 pending)
  ⚡ Mode: parallel execution
  🧠 Memory: 15 coordination points stored
  📈 Efficiency: 78%`;

      case 'init':
        return `Swarm initialization complete:
  ✅ Hierarchical topology established
  ✅ 5 agents spawned successfully
  ✅ Coordination protocols active
  ✅ Memory synchronization enabled`;

      case 'agents':
        return `Swarm Agent Status:
  🟢 architect: Designing system components...
  🟢 coder-1: Implementing user authentication...
  🟢 coder-2: Building API endpoints...
  🟡 analyst: Analyzing performance metrics...
  🔴 tester: Waiting for code completion...`;

      case 'test':
        return `Swarm Test Results:
  ✅ Agent communication: PASS
  ✅ Task distribution: PASS  
  ✅ Memory coordination: PASS
  ✅ Error handling: PASS
  📊 Overall health: 95%`;

      default:
        return `Swarm ${action} completed successfully`;
    }
  }

  /**
   * Execute memory command simulation
   */
  executeMemoryCommand(operation, key, value) {
    switch (operation) {
      case 'store':
        return `Memory stored successfully:\n  Key: ${key}\n  Value: ${value}\n  Timestamp: ${new Date().toISOString()}`;

      case 'retrieve':
        return `Memory retrieved:\n  Key: ${key}\n  Value: "example stored value"\n  Last Modified: ${new Date().toISOString()}`;

      case 'list':
        return `Memory Keys:\n  • project/settings\n  • swarm/topology\n  • agents/coordination\n  • session/state\n  • benchmark/results\n  \n  Total: 5 entries`;

      case 'delete':
        return `Memory deleted:\n  Key: ${key}\n  Status: Success`;

      default:
        return `Memory operation '${operation}' completed`;
    }
  }

  /**
   * Execute agents command simulation
   */
  executeAgentsCommand(action, agentType, agentId) {
    switch (action) {
      case 'list':
        return `Active Agents:\n  🟢 agent-001 (architect) - Designing system components\n  🟢 agent-002 (coder) - Implementing features\n  🟡 agent-003 (analyst) - Analyzing performance\n  🔴 agent-004 (tester) - Waiting for code\n  🟢 agent-005 (coordinator) - Managing workflow\n  \n  Total: 5 agents`;

      case 'create':
        return `Agent created successfully:\n  Type: ${agentType}\n  ID: agent-${Math.floor(
          Math.random() * 1000,
        )
          .toString()
          .padStart(3, '0')}\n  Status: Active\n  Capabilities: Full ${agentType} functionality`;

      case 'start':
        return `Agent started:\n  ID: ${agentId}\n  Status: Running\n  Tasks: Ready to accept work`;

      case 'stop':
        return `Agent stopped:\n  ID: ${agentId}\n  Status: Stopped\n  Tasks: Completed gracefully`;

      case 'status':
        return `Agent Status:\n  ID: ${agentId}\n  Status: Active\n  Type: researcher\n  Current Task: Data analysis\n  Uptime: 2h 15m\n  Tasks Completed: 12\n  Efficiency: 92%`;

      default:
        return `Agent ${action} completed for ${agentId || agentType}`;
    }
  }

  /**
   * Execute SPARC command simulation
   */
  executeSPARCCommand(mode, task, options = {}) {
    const modes = {
      coder: 'Code development and implementation',
      architect: 'System design and architecture',
      analyzer: 'Data analysis and insights',
      researcher: 'Research and information gathering',
      reviewer: 'Code review and quality assurance',
      tester: 'Testing and validation',
      debugger: 'Bug finding and resolution',
      documenter: 'Documentation and specifications',
      optimizer: 'Performance optimization',
      designer: 'UI/UX design and prototyping',
    };

    return `SPARC Mode Execution:\n  Mode: ${mode} (${modes[mode] || 'Unknown mode'})\n  Task: ${task || 'No task specified'}\n  Status: Initialized\n  Estimated Duration: 15-30 minutes\n  Resources Allocated: 2 agents\n  Options: ${JSON.stringify(options)}\n  \n  Ready to begin execution...`;
  }

  /**
   * Execute benchmark command simulation
   */
  executeBenchmarkCommand(suite = 'default', iterations = 10) {
    const suites = {
      default: 'General performance benchmark',
      memory: 'Memory usage and allocation',
      cpu: 'CPU intensive operations',
      network: 'Network communication speed',
      swarm: 'Swarm coordination efficiency',
    };

    return `Benchmark Results:\n  Suite: ${suite} (${suites[suite] || 'Custom suite'})\n  Iterations: ${iterations}\n  \n  📊 Results:\n  • Average Response Time: 245ms\n  • Memory Usage: 128MB\n  • CPU Utilization: 15%\n  • Success Rate: 98.5%\n  • Throughput: 420 ops/sec\n  \n  🏆 Performance Grade: A+\n  ⚡ Optimization Suggestions: Enable caching for 12% improvement`;
  }

  /**
   * Send message to WebSocket client
   */
  sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error response
   */
  sendError(ws, id, errorMessage) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32600,
        message: errorMessage,
      },
    };

    this.sendMessage(ws, response);
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message) {
    this.connections.forEach((ws) => {
      this.sendMessage(ws, message);
    });
  }

  /**
   * Start heartbeat to check connection health
   */
  startHeartbeat() {
    setInterval(() => {
      this.connections.forEach((ws) => {
        if (ws.isAlive === false) {
          ws.terminate();
          this.connections.delete(ws);
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      running: this.isRunning,
      port: this.port,
      connections: this.connections.size,
      uiPath: this.uiPath,
    };
  }
}

/**
 * Start web server command
 */
export async function startWebServer(port = 3000) {
  const server = new ClaudeCodeWebServer(port);

  try {
    await server.start();

    // Setup graceful shutdown
    const shutdown = async () => {
      console.log('\n⏹️  Shutting down web server...');
      await server.stop();
      process.exit(0);
    };

    compat.terminal.onSignal('SIGINT', shutdown);
    compat.terminal.onSignal('SIGTERM', shutdown);

    // Keep server running
    return server;
  } catch (error) {
    printError(`Failed to start web server: ${error.message}`);
    process.exit(1);
  }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;
  await startWebServer(port);
}
