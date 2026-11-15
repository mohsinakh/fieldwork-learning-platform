'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const uid = () => crypto.randomUUID();
const storageKey = 'fieldwork.v1';
const preferences = { theme: document.documentElement.dataset.theme || 'dark', language: document.documentElement.dataset.language || 'en' };
function savePreferences() {
  try { localStorage.setItem('fieldwork.preferences.v1', JSON.stringify(preferences)); }
  catch { notify('Browser storage is unavailable. Changes will last for this session.'); }
}
function syncPreferences() {
  document.documentElement.dataset.theme = preferences.theme;
  document.documentElement.dataset.language = preferences.language;
  document.documentElement.lang = preferences.language === 'hinglish' ? 'hi-Latn' : 'en';
  $('#language-toggle').setAttribute('aria-checked', String(preferences.language === 'hinglish'));
  $('#language-toggle').setAttribute('aria-label', ui('Read in Hinglish'));
  $('#theme-toggle').setAttribute('aria-checked', String(preferences.theme === 'dark'));
  $('#theme-toggle').setAttribute('aria-label', ui('Dark mode'));
  $('#theme-label').textContent = ui(preferences.theme === 'dark' ? 'Dark' : 'Light');
  document.querySelector('meta[name="theme-color"]').content = preferences.theme === 'dark' ? '#101114' : '#ffffff';
}
function selectBookLanguage() {
  const translation = languages[preferences.language] || {};
  book = { ...originalBook, title: translation.title || originalBook.title,
    chapters: originalBook.chapters.map(chapter => ({ ...chapter, ...translation.chapters?.[chapter.id] })),
    sources: originalBook.sources.map((source, i) => ({ ...source, note: translation.sourceNotes?.[i] || source.note })) };
}
$('#theme-toggle').addEventListener('click', () => {
  preferences.theme = preferences.theme === 'dark' ? 'light' : 'dark';
  syncPreferences(); savePreferences();
});
$('#language-toggle').addEventListener('click', () => {
  preferences.language = preferences.language === 'en' ? 'hinglish' : 'en';
  syncPreferences(); savePreferences();
  if (originalBook) {
    const draft = $('#add-task input')?.value;
    selectBookLanguage(); render();
    if (draft !== undefined && $('#add-task input')) $('#add-task input').value = draft;
  }
  localizeUI(document.body);
});
syncPreferences();
localizeUI(document.body);
const routes = { overview: 'Overview', booklet: 'Job-ready playbook', planner: 'My study plan', applications: 'Application tracker' };
const defaultTasks = [
  { id: 'learn', title: 'Study a concept', detail: 'Read the explanation, then try an exercise.', duration: '45 min' },
  { id: 'proof', title: 'Improve your work', detail: 'Update a project or strengthen a resume bullet.', duration: '45 min' },
  { id: 'apply', title: 'Review a relevant opening', detail: 'Read the requirements and tailor your application.', duration: '30 min' }
];
let state = { saved: [], completed: [], chapterChecks: [], reading: 0, days: {}, customTasks: [], applications: [], focusTimer: null };
try {
  const stored = JSON.parse(localStorage.getItem(storageKey));
  if (stored && typeof stored === 'object') {
    for (const key of ['saved', 'completed', 'chapterChecks']) if (Array.isArray(stored[key])) state[key] = stored[key].filter(v => typeof v === 'string');
    for (const key of ['customTasks', 'applications']) if (Array.isArray(stored[key])) state[key] = stored[key].filter(v => v && typeof v.id === 'string');
    if (stored.focusTimer && typeof stored.focusTimer === 'object') state.focusTimer = stored.focusTimer;
    if (Number.isInteger(stored.reading)) state.reading = Math.max(0, stored.reading);
    if (stored.days && typeof stored.days === 'object' && !Array.isArray(stored.days)) state.days = stored.days;
  }
} catch { /* The platform also works for the current session without browser storage. */ }
let book, originalBook, languages = {}, resources = [], toastTimeout;
let selectedDate = todayKey();
let timer = { end: Number.isFinite(state.focusTimer?.end) ? state.focusTimer.end : null, remaining: Number.isFinite(state.focusTimer?.remaining) ? Math.max(0, Math.min(1500, state.focusTimer.remaining)) : 1500, interval: null };

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function dateLabel(date = new Date()) { return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); }
function dateText(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '—';
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function route() { const path=location.hash.slice(1).split('/')[0];return path==='resources'?'booklet':Object.hasOwn(routes,path)?path:'overview'; }
function notify(message) {
  const el = $('#toast'); el.textContent = ui(message); el.classList.add('visible');
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove('visible'), 3500);
}
function persist() {
  state.focusTimer = { end: timer.end, remaining: timer.remaining };
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { notify('Browser storage is unavailable. Changes will last for this session.'); }
}
function doneFor(date = selectedDate) { return Array.isArray(state.days[date]) ? state.days[date] : []; }
function tasksFor(date = selectedDate) { return [...defaultTasks, ...state.customTasks.filter(t => t.date === date)]; }
function completedToday() { return tasksFor(todayKey()).filter(t => doneFor(todayKey()).includes(t.id)).length; }
function stat(value, suffix, label, glyph, href) {
  return `<a class="summary-item" href="#${href}"><span class="summary-icon">${icon(glyph)}</span><div><div class="summary-value">${esc(value)}<span>${esc(suffix)}</span></div><div class="summary-label">${esc(label)}</div></div>${icon('up', 'summary-arrow')}</a>`;
}
function heading(eyebrow, title, subtitle, aside = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>${aside}</div>`;
}
function bookArt() {
  return `<div class="chapter-cover" aria-hidden="true"><div class="cover-top"><span>Career preparation</span><span>2026</span></div><div class="cover-number">${book.chapters.length}<span>chapters</span></div><div class="cover-index" style="--chapter-count:${book.chapters.length}">${book.chapters.map((c,i)=>`<span class="${state.completed.includes(c.id)?'complete':''}">${String(i+1).padStart(2,'0')}</span>`).join('')}</div><div class="cover-bottom"><span>${book.chapters.reduce((s,c)=>s+c.minutes,0)} min read</span><span>${state.completed.length} / ${book.chapters.length} complete</span></div></div>`;
}
function taskList(date = selectedDate, limit = Infinity) {
  return tasksFor(date).slice(0, limit).map(t => {
    const done = doneFor(date).includes(t.id);
    return `<div class="task-item ${done ? 'done' : ''}"><input type="checkbox" id="task-${esc(t.id)}" data-task="${esc(t.id)}" data-date="${date}" ${done ? 'checked' : ''}><label class="task-info" ${t.date ? 'data-user-content' : ''} for="task-${esc(t.id)}">${esc(t.title)}${t.detail ? `<small>${esc(t.detail)}</small>` : ''}</label><span class="task-duration">${esc(t.duration || '')}</span>${t.date ? `<button class="icon-button danger" data-delete-task="${esc(t.id)}" data-user-content aria-label="${esc(ui('Delete task: ') + t.title)}">${icon('trash')}</button>` : ''}</div>`;
  }).join('');
}

function overview() {
  const started = state.completed.length > 0 || state.reading > 0;
  return `${heading('Fieldwork', 'Your guides.', 'Open the job preparation guide or work through today’s study tasks.', `<div class="date-label">${esc(dateLabel())}</div>`)}
    <section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><span class="tag">For freshers and experienced applicants</span><h2 id="hero-title"><span>The job-ready</span><span>playbook.</span></h2><p>Help with your resume, job search, and interviews.<br class="desktop-break"> Templates are included in the chapters.</p><div class="button-row"><a href="#booklet" class="btn">${started ? 'Continue reading' : 'Open guide'} ${icon('arrow')}</a><a href="resources/files/job-ready-playbook.pdf" class="btn secondary" download>${icon('download')} Download PDF</a></div><div class="hero-meta"><span>${book.chapters.length} chapters</span><span>${book.chapters.reduce((sum,c)=>sum+c.minutes,0)} min read</span></div><button class="text-link fresher-shortcut" data-chapter="${book.chapters.findIndex(chapter=>chapter.id==='fresher-actions')}">Fresher action checklist ${icon('arrow')}</button></div>${bookArt()}</section>
    <div class="summary-row">${stat(state.completed.length, `/ ${book.chapters.length}`,  'Chapters finished', 'book', 'booklet')}${stat(completedToday(), `/ ${tasksFor(todayKey()).length}`, 'Today’s tasks checked', 'check', 'planner')}${stat(state.applications.length, 'roles', 'Applications tracked', 'case', 'applications')}</div>
    <section class="home-study"><div class="section-heading"><h2>Today’s study tasks</h2><a class="text-link" href="#planner">Open study plan ${icon('arrow')}</a></div><div class="task-panel"><div class="task-panel-header"><span>Daily tasks</span><span>2 hours</span></div>${taskList(todayKey(),3)}</div></section>`;
}
function prose(text) { return esc(text).replace(/\[S(\d+)\]/g, (_, n) => `<a href="#source-S${n}" data-source="S${n}" aria-label="Source ${n}">[${n}]</a>`); }
function reader() {
  const c = book.chapters[state.reading], done = state.completed.includes(c.id);
  const files = resources.filter(r => r.chapters.includes(c.id));
  const checked = c.checklist.filter((_,i)=>state.chapterChecks.includes(`${c.id}:${i}`)).length;
  return `${heading('Job preparation guide', book.title + '.', 'Read a chapter, use its checklist, and come back when you need it.', `<div class="button-row"><a class="btn secondary" href="resources/files/job-ready-playbook.pdf" download>${icon('download')} Download PDF</a></div>`)}
    <div class="reader-layout"><label class="mobile-chapter-picker">Choose a chapter<select id="chapter-picker" aria-label="Choose chapter">${book.chapters.map((ch,i)=>`<option value="${i}" ${i===state.reading?'selected':''}>${String(i+1).padStart(2,'0')}. ${esc(ch.title)}</option>`).join('')}</select></label><nav class="contents" aria-label="Guide chapters"><div class="eyebrow">Contents</div>${book.chapters.map((ch,i)=>`<button class="chapter-nav ${i===state.reading?'active':''}" data-chapter="${i}" ${i===state.reading?'aria-current="step"':''}><span class="chapter-no ${state.completed.includes(ch.id)?'complete':''}">${state.completed.includes(ch.id)?icon('check'):String(i+1).padStart(2,'0')}</span>${esc(ch.title)}</button>`).join('')}<button class="chapter-nav" data-action="view-sources">${icon('file')} Sources</button><div class="reader-progress">${state.completed.length} of ${book.chapters.length} chapters finished<div class="progress-track" role="progressbar" aria-label="Guide progress" aria-valuenow="${state.completed.length}" aria-valuemin="0" aria-valuemax="${book.chapters.length}"><span style="width:${state.completed.length/book.chapters.length*100}%"></span></div></div></nav>
    <article class="article"><header class="article-header" data-guide-content><div class="article-title-row"><span class="article-folio" aria-hidden="true">${String(state.reading+1).padStart(2,'0')}</span><div><div class="eyebrow">${esc(c.label)}<span>${esc(ui(`${c.minutes} min read`))}</span></div><h2>${esc(c.title)}</h2></div></div><p>${esc(c.intro)}</p></header><div class="article-body">${c.sections.map(section=>`<section class="article-section" data-guide-content><h3>${esc(section.title)}</h3><p>${prose(section.text)}</p></section>`).join('')}${c.example?`<aside class="example-box" data-guide-content><div class="eyebrow">${esc(c.example.label)}</div><p>${esc(c.example.text)}</p></aside>`:''}
    ${c.copyBlocks?`<section class="copy-templates"><h3>Templates to save on your phone</h3><p class="reading-note" data-guide-content>${esc(c.copyNote)}</p>${c.copyBlocks.map(block=>`<div class="copy-template"><div class="section-heading"><h4 data-guide-content>${esc(block.label)}</h4><button class="btn secondary small" data-copy-block="${esc(block.id)}">Copy template ${icon('file')}</button></div><p data-guide-content>${esc(block.text)}</p></div>`).join('')}</section>`:''}
    ${files.length?`<section class="chapter-downloads"><h3>Files for this chapter</h3>${files.map(file=>`<a class="chapter-download" href="${esc(file.path)}" download><span>${icon('file')}<span><strong>${esc(file.title)}</strong><small>${esc(file.description)}</small></span></span><span class="download-meta">${esc(file.format)} ${icon('download')}</span></a>`).join('')}</section>`:''}
    <section class="chapter-checklist"><div class="section-heading"><h3>Things to do</h3><span class="check-count">${checked} of ${c.checklist.length} checked</span></div><ul>${c.checklist.map((text,i)=>{const key=`${c.id}:${i}`;return `<li><input type="checkbox" id="check-${c.id}-${i}" data-chapter-check="${key}" ${state.chapterChecks.includes(key)?'checked':''}><label data-guide-content for="check-${c.id}-${i}">${esc(text)}</label></li>`;}).join('')}</ul><p class="reading-note">Your checks are saved in this browser.</p></section>${state.reading===book.chapters.length-1?`<div class="source-list">${sourcesHTML()}</div>`:''}</div><div class="reader-controls"><button class="btn secondary" data-chapter="${state.reading-1}" ${state.reading===0?'disabled':''}>${icon('arrow','arrow-back')} Previous</button><div class="button-row">${done?`<button class="icon-button" data-action="uncomplete" aria-label="Mark chapter unfinished" title="Mark unfinished">${icon('check')}</button>`:''}<button class="btn" data-action="complete-chapter">${done ? state.reading===book.chapters.length-1?'Back to overview':'Next chapter' : state.reading===book.chapters.length-1?'Finish guide':'Finish chapter & continue'} ${icon('arrow')}</button></div></div></article></div>`;
}
function sourcesHTML(includeTitle = true) {
  return `${includeTitle?'<h3>Sources</h3>':''}<p>These pages were checked on 15 November 2026. Job sites can change their filters. Follow the instructions in the listing you are applying to. The study routine and application targets in this guide are suggestions you can adjust.</p>${book.sources.map(source=>`<div class="source-item" id="source-${source.id}"><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">[${source.id.slice(1)}] ${esc(source.title)} ${icon('up')}</a><p data-guide-content>${esc(source.note)}</p></div>`).join('')}`;
}
function searchGuide(query) {
  if(!query) { focusSearch(); return; }
  const needle=query.toLowerCase();
  const matches=book.chapters.map((chapter,index)=>({chapter,index})).filter(({chapter})=>[chapter.title,chapter.intro,...chapter.sections.flatMap(section=>[section.title,section.text]),...chapter.checklist,chapter.example?.text||'',...(chapter.copyBlocks||[]).flatMap(block=>[block.label,block.text])].join(' ').toLowerCase().includes(needle));
  openModal('Search the guide',`<p class="modal-desc">${matches.length} ${matches.length===1?'chapter':'chapters'} found for “${esc(query)}”.</p><div class="guide-search-results">${matches.length?matches.map(({chapter,index})=>`<button data-chapter="${index}"><span>${String(index+1).padStart(2,'0')}</span><span><strong>${esc(chapter.title)}</strong><small>${esc(chapter.intro)}</small></span>${icon('arrow')}</button>`).join(''):'<p>Try a word such as resume, projects, or interviews.</p>'}</div><div class="form-actions"><button class="btn secondary" data-action="close-modal">Close</button></div>`);
}
function planner() {
  const tasks = tasksFor(), done = tasks.filter(t=>doneFor().includes(t.id)).length;
  return `${heading('Daily practice', 'My study plan.', 'Check off what you finish. You can add tasks for any date.')}
    <div class="planner-grid"><section class="panel"><div class="section-heading"><h2>Daily tasks</h2><input class="input" id="plan-date" aria-label="Choose study plan date" type="date" value="${selectedDate}"></div><div class="daily-progress"><strong>${done}<small> / ${tasks.length}</small></strong><div class="progress-track" role="progressbar" aria-label="Daily tasks" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${tasks.length}"><span style="width:${done/tasks.length*100}%"></span></div><small>tasks completed</small></div>${taskList()}<form class="inline-form" id="add-task"><input class="input" name="title" aria-label="New study task" placeholder="Add a study task" required maxlength="120"><button class="btn" aria-label="Add study task">${icon('plus')}</button></form><p class="reading-note">The three daily prompts repeat each day. Extra tasks belong to the date you choose.</p></section>
    <div><section class="panel"><h2>A two-hour study session</h2><div class="plan-step"><span>01</span><div><h3>Study a concept</h3><p>Choose a concept from the requirements of your target roles.</p><small>45 MINUTES</small></div></div><div class="plan-step"><span>02</span><div><h3>Use it in a project or exercise</h3><p>Build an example, debug a feature, or improve a project.</p><small>45 MINUTES</small></div></div><div class="plan-step"><span>03</span><div><h3>Explain what you learned</h3><p>Close your notes. Explain what you learned and choose your next step.</p><small>20 + 10 MINUTES</small></div></div></section><section class="panel"><div class="eyebrow">25-minute timer</div><h2>Focus timer</h2><p>Set aside 25 minutes for one task. Pause the timer if you need a break.</p><div class="timer-number" id="timer-display" role="timer" aria-label="Focus time remaining">${timerText()}</div><div class="button-row"><button class="btn" data-action="timer-toggle" id="timer-toggle">${timer.end?'Pause session':timer.remaining===1500?'Start a session':'Resume session'} ${icon('clock')}</button><button class="btn secondary" data-action="timer-reset">Reset</button></div><p class="timer-status" id="timer-status" aria-live="polite">${timer.end?'Your focus session is running.':''}</p></section></div></div>`;
}
function safeURL(value) { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
function applications() {
  const apps = state.applications;
  return `${heading('Your job search', 'Application tracker.', 'Record the roles you apply for and when you want to follow up.', `<div class="button-row"><button class="btn" data-action="add-job">${icon('plus')} Add application</button></div>`)}
    <div class="summary-row tracker-summary">${stat(apps.length, 'roles', 'Roles you are tracking', 'case', 'applications')}${stat(apps.filter(a=>a.status==='Interview').length, 'interviews', 'Currently interviewing', 'calendar', 'applications')}${stat(apps.filter(a=>a.status==='Offer').length, 'offers', 'Offers received', 'leaf', 'applications')}</div>
    <div class="tracker-toolbar"><p>${apps.length?'Keep notes on your resume version and next step.':'Add a role when you find one you want to apply for.'}</p><button class="btn secondary small" data-action="export-jobs" ${apps.length?'':'disabled'}>${icon('download')} Export CSV</button></div>
    ${apps.length?`<div class="table-wrap"><table><thead><tr><th>Role / company</th><th>Added</th><th>Status</th><th>Follow up</th><th>Next step / resume</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${apps.map(a=>`<tr><td data-user-content>${safeURL(a.url)?`<a href="${esc(safeURL(a.url))}" target="_blank" rel="noopener noreferrer">${esc(a.role)} ${icon('up')}</a>`:esc(a.role)}<small>${esc(a.company)}</small></td><td>${dateText(a.date)}</td><td><select data-user-content aria-label="${esc(ui(`Status for ${a.role} at ${a.company}`))}" data-status="${esc(a.id)}">${['Saved','Applied','Interview','Offer','Closed'].map(s=>`<option value="${s}" ${a.status===s?'selected':''}>${esc(ui(s))}</option>`).join('')}</select></td><td>${dateText(a.followup)}</td><td data-user-content style="white-space:normal;min-width:150px;max-width:240px">${esc(a.notes||'—')}</td><td><button class="icon-button" data-edit-job="${esc(a.id)}" data-user-content aria-label="${esc(ui('Edit ') + a.role)}">${icon('file')}</button><button class="icon-button danger" data-remove-job="${esc(a.id)}" data-user-content aria-label="${esc(ui('Remove ') + a.role)}">${icon('trash')}</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty-state">${icon('case')}<h3>No applications yet.</h3><p>Save an opening here, then update its status as you hear back.</p><button class="btn" data-action="add-job">Add an application ${icon('arrow')}</button></div>`}
    <p class="storage-note">Adding a role here does not apply for the job. Your records stay in this browser; export a copy if you want a backup.</p>`;
}
function render(focus = false) {
  if (!book) return;
  const current = route();
  document.title = `${ui(routes[current])} · Fieldwork`;
  $('#breadcrumb').textContent = ui(routes[current]);
  document.querySelectorAll('[data-nav]').forEach(el=>{el.classList.toggle('active',el.dataset.nav===current); if(el.dataset.nav===current)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  $('#main').innerHTML = ({ overview, booklet: reader, planner, applications })[current]();
  localizeUI(document.body);
  if (focus) { $('#main').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
}
function showChapter(index) {
  if (!Number.isInteger(index) || index < 0 || index >= book.chapters.length) return;
  if($('#modal').open)$('#modal').close();
  state.reading = index; persist();
  const hash=`#booklet/${book.chapters[index].id}`;
  if(location.hash!==hash)location.hash=hash;else render(true);
}
function openModal(title, body) {
  const modal = $('#modal');
  modal.innerHTML = `<div class="modal-header"><h2 id="modal-title">${title}</h2><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div>${body}`;
  localizeUI(modal);
  modal.showModal();
}

function jobModal(id) {
  const a = state.applications.find(a=>a.id===id) || {};
  openModal(id?'Edit application':'Add application', `<p class="modal-desc">Add the role and any details you want to keep.</p><form id="job-form" data-id="${esc(id || '')}"><label class="form-field">Job title<input class="input" name="role" value="${esc(a.role || '')}" placeholder="e.g. Software Engineer" required maxlength="100"></label><label class="form-field">Company<input class="input" name="company" value="${esc(a.company || '')}" placeholder="Company name" required maxlength="100"></label><label class="form-field">Job posting URL <small>Optional · an http or https link</small><input class="input" name="url" type="url" value="${esc(a.url || '')}" placeholder="https://…" maxlength="2000"></label><div class="form-row"><label class="form-field">Status<select class="input" name="status">${['Saved','Applied','Interview','Offer','Closed'].map(s=>`<option value="${s}" ${(a.status||'Saved')===s?'selected':''}>${esc(ui(s))}</option>`).join('')}</select></label><label class="form-field">Follow-up date<input class="input" name="followup" type="date" value="${esc(a.followup || '')}"></label></div><label class="form-field">Notes / resume version<textarea class="input" name="notes" rows="2" maxlength="500" placeholder="Resume version, contact details, or the next step">${esc(a.notes || '')}</textarea></label><p class="form-error" id="job-error" role="alert"></p><div class="form-actions"><button class="btn secondary" type="button" data-action="close-modal">Cancel</button><button class="btn" type="submit">Save application ${icon('arrow')}</button></div></form>`);
}


function download(blob,name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href=url; link.download=name; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}

function saveJob(form) {
  const d = new FormData(form), id = form.dataset.id, existing = state.applications.find(a=>a.id===id);
  const role = d.get('role').trim(), company = d.get('company').trim(), url = d.get('url').trim();
  if (!role || !company) { $('#job-error').textContent=ui('Add both the job title and company.'); return; }
  if (url && !safeURL(url)) { $('#job-error').textContent=ui('Use a complete http or https job posting URL.'); return; }
  const job = {id:existing?.id || uid(),date:existing?.date || todayKey(),role,company,url,status:d.get('status'),followup:d.get('followup'),notes:d.get('notes').trim()};
  if(existing)state.applications=state.applications.map(a=>a.id===id?job:a);else state.applications.unshift(job);
  persist(); $('#modal').close(); render(); notify(existing?'Application updated.':'Application saved.');
}
function timerRemaining() { return timer.end ? Math.max(0,Math.ceil((timer.end-Date.now())/1000)) : timer.remaining; }
function timerText() { const t=timerRemaining(); return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`; }
function tick() {
  if ($('#timer-display')) $('#timer-display').textContent=timerText();
  if (timer.end && timerRemaining()===0) {
    clearInterval(timer.interval);timer.end=null;timer.remaining=0;persist();
    notify('Focus session complete. Take a break when you are ready.');
    if(route()==='planner'){render();$('#timer-status').textContent=ui('Session complete. Take a break, then reset when you are ready.');}
  }
}
function toggleTimer() {
  if(timer.end){timer.remaining=timerRemaining();timer.end=null;clearInterval(timer.interval);}
  else {if(timer.remaining===0)timer.remaining=1500;timer.end=Date.now()+timer.remaining*1000;timer.interval=setInterval(tick,1000);}
  persist();render();
}
function exportJobs() {
  // Neutralise spreadsheet formulas in user-entered cells before CSV export.
  const cell = value => {let s=String(value||'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return `"${s.replace(/"/g,'""')}"`;};
  const rows = [['Company','Role','URL','Added','Status','Follow-up','Notes'],...state.applications.map(a=>[a.company,a.role,a.url,a.date,a.status,a.followup,a.notes])];
  download(new Blob(['\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'fieldwork-applications.csv');
}

document.addEventListener('click',async event=>{
  const el = event.target.closest('button, a'); if(!el)return;
  if(el.classList.contains('skip-link')){event.preventDefault();$('#main').focus();$('#main').scrollIntoView();return;}
  if(el.dataset.copyBlock){const block=book.chapters[state.reading].copyBlocks?.find(item=>item.id===el.dataset.copyBlock);if(block){try{await navigator.clipboard.writeText(block.text);notify('Template copied. Replace the brackets with your details.');}catch{openModal('Copy template',`<label class="form-field">Select and copy this text<textarea class="input" rows="7" readonly>${esc(block.text)}</textarea></label><div class="form-actions"><button class="btn secondary" data-action="close-modal">Close</button></div>`);}}return;}
  if(el.dataset.chapter!==undefined){showChapter(Number(el.dataset.chapter));return;}
  if(el.dataset.editJob){jobModal(el.dataset.editJob);return;}
  if(el.dataset.removeJob){
    const id=el.dataset.removeJob;
    openModal('Remove this application?',`<p class="modal-desc">This removes the entry from your personal tracker. It does not withdraw an application submitted to an employer.</p><div class="form-actions"><button class="btn secondary" data-action="close-modal">Keep it</button><button class="btn" data-confirm-remove-job="${esc(id)}">Remove entry</button></div>`);return;
  }
  if(el.dataset.confirmRemoveJob){state.applications=state.applications.filter(a=>a.id!==el.dataset.confirmRemoveJob);persist();$('#modal').close();render();notify('Tracker entry removed.');return;}
  if(el.dataset.deleteTask){state.customTasks=state.customTasks.filter(t=>t.id!==el.dataset.deleteTask);persist();render();return;}
  if(el.dataset.source){event.preventDefault();openModal('Sources',`<div class="source-list">${sourcesHTML(false)}</div><div class="form-actions"><button class="btn" data-action="close-modal">Close</button></div>`);setTimeout(()=>$(`#source-${el.dataset.source}`,$('#modal'))?.scrollIntoView({block:'nearest'}),0);return;}
  switch(el.dataset.action){
    case 'close-modal':$('#modal').close();break;
    case 'complete-chapter':{
      const c=book.chapters[state.reading];if(!state.completed.includes(c.id))state.completed.push(c.id);persist();
      if(state.reading<book.chapters.length-1)showChapter(state.reading+1);else{location.hash='overview';notify(state.completed.length===book.chapters.length?`You have finished all ${book.chapters.length} chapters.`:'Chapter marked as finished.');}break;
    }
    case 'uncomplete':state.completed=state.completed.filter(id=>id!==book.chapters[state.reading].id);persist();render();break;
    case 'view-sources':openModal('Sources',`<div class="source-list">${sourcesHTML(false)}</div><div class="form-actions"><button class="btn" data-action="close-modal">Close</button></div>`);break;
    case 'add-job':jobModal();break;
    case 'export-jobs':exportJobs();break;
    case 'timer-toggle':toggleTimer();break;
    case 'timer-reset':clearInterval(timer.interval);timer={end:null,remaining:1500,interval:null};persist();render();break;
  }
});
document.addEventListener('change',event=>{
  const el=event.target;
  if(el.dataset.chapterCheck){const key=el.dataset.chapterCheck;state.chapterChecks=el.checked?[...new Set([...state.chapterChecks,key])]:state.chapterChecks.filter(value=>value!==key);persist();render();$(`[data-chapter-check="${CSS.escape(key)}"]`)?.focus({preventScroll:true});}
  if(el.dataset.task){const date=el.dataset.date,done=doneFor(date);state.days[date]=el.checked?[...new Set([...done,el.dataset.task])]:done.filter(id=>id!==el.dataset.task);persist();render();$(`[data-task="${CSS.escape(el.dataset.task)}"]`)?.focus({preventScroll:true});}
  if(el.dataset.status){state.applications=state.applications.map(a=>a.id===el.dataset.status?{...a,status:el.value}:a);persist();notify('Application status updated.');}
  if(el.id==='chapter-picker')showChapter(Number(el.value));
  if(el.id==='plan-date' && el.value){selectedDate=el.value;render();}

});
document.addEventListener('submit',event=>{
  if(event.target.id==='global-search'){event.preventDefault();searchGuide(new FormData(event.target).get('q').trim());}
  if(event.target.id==='job-form'){event.preventDefault();saveJob(event.target);}
  if(event.target.id==='add-task'){event.preventDefault();const title=new FormData(event.target).get('title').trim();if(!title)return;state.customTasks.push({id:uid(),title,date:selectedDate});persist();render();$('input[name="title"]')?.focus();}
});
const mobileViewport = matchMedia('(max-width:700px)');
function syncNavigation(){ $('#sidebar').inert=mobileViewport.matches && !$('#sidebar').classList.contains('open'); }
function closeNavigation(){ $('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');syncNavigation(); }
mobileViewport.addEventListener('change',()=>{ closeNavigation(); });
syncNavigation();
$('#menu-toggle').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));syncNavigation();});
document.addEventListener('click',event=>{if($('#sidebar').classList.contains('open') && !event.target.closest('#sidebar, #menu-toggle'))closeNavigation();});
function focusSearch(){ $('#global-search').classList.add('expanded'); $('#global-search input').focus(); }
$('.search-trigger').addEventListener('click',focusSearch);
document.addEventListener('keydown',event=>{
  if(event.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName) && !$('#modal').open){event.preventDefault();focusSearch();}
  if(event.key==='Escape'){closeNavigation();}
});
function chapterFromHash(){if(!book||route()!=='booklet')return;const id=location.hash.slice(1).split('/')[1],index=book.chapters.findIndex(chapter=>chapter.id===id);if(index>=0){state.reading=index;persist();}}
window.addEventListener('hashchange',()=>{chapterFromHash();closeNavigation();$('#global-search').classList.remove('expanded');if($('#modal').open)$('#modal').close();render(true);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden && timer.end)tick();});

async function init(){
  try {
    const responses=await Promise.all([fetch('resources/booklet.json'),fetch('resources/manifest.json'),fetch('resources/languages.json')]);
    if(responses.some(response=>!response.ok))throw new Error('Guide files could not be loaded');
    [originalBook,resources,languages]=await Promise.all(responses.map(response=>response.json()));
    selectBookLanguage();
    state.reading=Math.min(state.reading,book.chapters.length-1);
    chapterFromHash();
    state.completed=state.completed.filter(id=>book.chapters.some(chapter=>chapter.id===id));
    state.chapterChecks=state.chapterChecks.filter(key=>book.chapters.some(chapter=>chapter.checklist.some((_,i)=>key===`${chapter.id}:${i}`)));
    if(location.hash==='#resources')history.replaceState(null,'','#booklet');
    render();
    if(timer.end){tick();if(timer.end)timer.interval=setInterval(tick,1000);}
  } catch(error) {
    $('#main').innerHTML=`<div class="empty-state">${icon('book')}<h3>The guide could not be loaded</h3><p>To preview the files locally, run <code>npm start</code> in the project folder and open <code>http://localhost:4173</code>.</p><a class="btn secondary" href="resources/files/job-ready-playbook.pdf">Open the PDF ${icon('arrow')}</a></div>`;
    localizeUI(document.body);
    console.error('Could not load the guide:',error);
  }
}
init();
