import os

js_code = """
/* ── AUTH ── */
function initAuth() {
  if (localStorage.getItem('h75auth') === '1608') {
    document.getElementById('auth-screen').classList.add('hidden');
    checkProfileScreen();
  } else {
    document.body.classList.add('locked');
  }
}
function checkAuth() {
  const input = document.getElementById('auth-input');
  const err = document.getElementById('auth-error');
  if (input.value === '1608') {
    localStorage.setItem('h75auth', '1608');
    err.classList.remove('show');
    document.getElementById('auth-screen').classList.add('hidden');
    checkProfileScreen();
  } else {
    err.classList.add('show');
    const content = document.querySelector('.auth-content');
    content.classList.remove('shake');
    void content.offsetWidth;
    content.classList.add('shake');
    input.value = '';
  }
}
initAuth();

/* ── PROFILES ── */
let profiles = JSON.parse(localStorage.getItem('h75profiles') || '{}');
let myProfileId = localStorage.getItem('h75myId') || null;
let currentProfileId = myProfileId || null;
let isReadOnly = false;

function checkProfileScreen() {
  if (!myProfileId) {
    document.body.classList.add('locked');
    document.getElementById('profile-screen').classList.remove('hidden');
    renderProfileScreen();
  } else {
    document.body.classList.remove('locked');
    document.getElementById('profile-screen').classList.add('hidden');
    isReadOnly = false;
    currentProfileId = myProfileId;
    render();
  }
}

function renderProfileScreen() {
  const list = document.getElementById('profile-list');
  list.innerHTML = '';
  Object.keys(profiles).forEach(id => {
    const pr = profiles[id];
    list.innerHTML += `<div class="profile-card" onclick="openPinModal('${id}')">
      <div class="profile-avatar">${pr.name.substring(0,2).toUpperCase()}</div>
      <div class="profile-name">${pr.name}</div>
    </div>`;
  });
}

let pendingProfileId = null;
function openPinModal(id) {
  pendingProfileId = id;
  document.getElementById('pin-modal-sub').textContent = 'Profil: ' + profiles[id].name;
  document.getElementById('pin-modal').classList.remove('hidden');
  document.getElementById('pin-input').value = '';
  document.getElementById('pin-error').style.opacity = 0;
}
function closePinModal() {
  document.getElementById('pin-modal').classList.add('hidden');
}
function submitPin() {
  const pin = document.getElementById('pin-input').value;
  if (pin === profiles[pendingProfileId].pin) {
    localStorage.setItem('h75myId', pendingProfileId);
    myProfileId = pendingProfileId;
    currentProfileId = myProfileId;
    isReadOnly = false;
    closePinModal();
    document.getElementById('profile-screen').classList.add('hidden');
    document.body.classList.remove('locked');
    render();
  } else {
    document.getElementById('pin-error').style.opacity = 1;
  }
}
function showAddProfile() {
  const name = prompt("Yeni kişinin adı:");
  if (!name || !name.trim()) return;
  const pin = prompt("Bu profil için 4 haneli bir PIN belirleyin:");
  if (!pin || pin.length !== 4) return alert("4 haneli PIN girmelisiniz.");
  const id = 'p_' + Date.now();
  profiles[id] = { name: name.trim(), pin: pin, data: {} };
  saveProfiles();
  renderProfileScreen();
}

function renderProfilesBar() {
  const bar = document.getElementById('profiles-bar');
  if (!bar) return;
  bar.innerHTML = Object.keys(profiles).map(id => {
    const pr = profiles[id];
    const act = id === currentProfileId ? 'active' : '';
    const badge = id === myProfileId ? ' <span style="font-size:10px;opacity:0.6;">(Ben)</span>' : '';
    return `<button class="ptab ${act}" onclick="switchProfile('${id}')">${pr.name}${badge}</button>`;
  }).join('');
}
function switchProfile(id) {
  currentProfileId = id;
  isReadOnly = (currentProfileId !== myProfileId);
  render();
}
function saveProfiles() {
  localStorage.setItem('h75profiles', JSON.stringify(profiles));
  syncUp();
}

const SCHEDULE = ['Push','Pull','Leg','Recovery','Push','Pull','Leg'];
const SCHEDULE_TR = {'Push':'Push', 'Pull':'Pull', 'Leg':'Leg', 'Recovery':'Dinlenme'};
const TASKS = [
  {id:'run',   label:'Sabah koşusu (45+ dk, açık hava)', group:'sabah'},
  {id:'water', label:'3.8 litre su',                     group:'gün'},
  {id:'book',  label:'10 sayfa kitap',                   group:'gün'},
  {id:'diet',  label:'Diyete uymak',                     group:'gün'},
  {id:'photo', label:'İlerleme fotoğrafı',               group:'gün'},
  {id:'gym',   label:'Akşam antrenmanı (45+ dk)',        group:'akşam'},
];

let startDate = localStorage.getItem('h75start') || null;
let fbUrl     = localStorage.getItem('h75fb')    || '';
let selectedDay   = 0;
let syncTimer     = null;
let isSaving      = false;

/* ── Firebase REST ── */
function fbPath(path) { return `${fbUrl}/h75/${path}.json`; }

async function fbWrite(path, data) {
  if (!fbUrl) return;
  await fetch(fbPath(path), {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
}

async function fbPatch(path, data) {
  if (!fbUrl) return;
  await fetch(fbPath(path), {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
}

async function fbRead(path) {
  if (!fbUrl) return null;
  const r = await fetch(fbPath(path));
  if (!r.ok) return null;
  return r.json();
}

async function syncUp() {
  if (!fbUrl || isSaving) return;
  isSaving = true;
  try {
    await fbPatch('', { profiles, start: startDate });
    setSyncStatus('on');
  } catch(e) { setSyncStatus('err'); }
  isSaving = false;
}

async function syncDown() {
  if (!fbUrl) return;
  try {
    const data = await fbRead('');
    if (!data) return;
    if (data.profiles) {
      profiles = data.profiles;
      localStorage.setItem('h75profiles', JSON.stringify(profiles));
    }
    if (data.start) {
      startDate = data.start;
      localStorage.setItem('h75start', startDate);
    }
    
    if (document.getElementById('profile-screen').classList.contains('hidden') === false) {
      renderProfileScreen();
    } else {
      if (myProfileId && !profiles[myProfileId]) {
        myProfileId = null;
        localStorage.removeItem('h75myId');
        checkProfileScreen();
      } else {
        render();
      }
    }
    initSetupBar();
    setSyncStatus('on');
  } catch(e) { setSyncStatus('err'); }
}

function setSyncStatus(state) {
  const dot = document.getElementById('sync-dot');
  const txt = document.getElementById('sync-status');
  dot.className = 'sync-dot' + (state==='on' ? ' on' : state==='err' ? ' err' : '');
  txt.innerHTML = `<span class="sync-dot ${state==='on'?'on':state==='err'?'err':''}" id="sync-dot"></span>`
    + (state==='on' ? 'Bağlı — eşzamanlanıyor' : state==='err' ? 'Bağlantı hatası' : 'Bağlı değil');
}

function startSyncTimer() {
  if (syncTimer) clearInterval(syncTimer);
  if (fbUrl) syncTimer = setInterval(syncDown, 8000);
}

/* ── Firebase UI ── */
function connectFirebase() {
  const val = document.getElementById('firebase-url-input').value.trim().replace(/\\/+$/, '');
  if (!val.startsWith('https://')) { alert('Geçerli bir Firebase URL girin.'); return; }
  fbUrl = val;
  localStorage.setItem('h75fb', fbUrl);
  initFirebaseBar();
  syncDown();
  startSyncTimer();
}

function disconnectFirebase() {
  fbUrl = '';
  localStorage.removeItem('h75fb');
  if (syncTimer) clearInterval(syncTimer);
  initFirebaseBar();
}

function initFirebaseBar() {
  const input = document.getElementById('firebase-url-input');
  const disBtn = document.getElementById('firebase-disconnect-btn');
  if (fbUrl) {
    input.value = fbUrl;
    disBtn.style.display = '';
    setSyncStatus('on');
  } else {
    disBtn.style.display = 'none';
    setSyncStatus('off');
  }
}

function toggleFirebaseHelp() {
  document.getElementById('firebase-help').classList.toggle('open');
}

/* ── Başlangıç tarihi ── */
function getTodayIdx() {
  if (!startDate) return -1;
  const start = new Date(startDate); start.setHours(0,0,0,0);
  const today = new Date();          today.setHours(0,0,0,0);
  const diff = Math.floor((today - start) / 86400000);
  return (diff >= 0 && diff < 75) ? diff : -1;
}

function dayLabel(i) {
  if (!startDate) return SCHEDULE_TR[SCHEDULE[i%7]].slice(0,3).toUpperCase();
  const d = new Date(startDate);
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString('tr-TR', {day:'numeric', month:'short'});
}

function initSetupBar() {
  const input    = document.getElementById('start-date-input');
  const resetBtn = document.getElementById('reset-btn');
  const bar      = document.getElementById('setup-bar');
  if (startDate) {
    input.value = startDate;
    resetBtn.style.display = '';
    bar.style.background   = 'rgba(255,255,255,0.03)';
    bar.style.borderColor  = 'rgba(255,255,255,0.06)';
    bar.querySelector('p').textContent =
      `Başlangıç: ${new Date(startDate).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})}`;
  } else {
    resetBtn.style.display = 'none';
  }
}

function confirmStartDate() {
  const val = document.getElementById('start-date-input').value;
  if (!val) return;
  if (isReadOnly) return alert("Sadece okuma modundasınız.");
  startDate = val;
  localStorage.setItem('h75start', val);
  const ti = getTodayIdx();
  if (ti >= 0) selectedDay = ti;
  initSetupBar();
  syncUp();
  render();
}

function resetStartDate() {
  if (isReadOnly) return alert("Sadece okuma modundasınız.");
  if (!confirm('Başlangıç tarihini sıfırlamak istediğinizden emin misiniz?')) return;
  startDate = null;
  localStorage.removeItem('h75start');
  document.getElementById('start-date-input').value = '';
  initSetupBar();
  render();
}

/* ── Veri ── */
function getState() {
  if (!currentProfileId || !profiles[currentProfileId]) return {};
  return profiles[currentProfileId].data[selectedDay] || {};
}

function dayProgress(i) {
  if (!currentProfileId || !profiles[currentProfileId]) return { done: 0, total: TASKS.length };
  const d = profiles[currentProfileId].data[i] || {};
  return { done: TASKS.filter(t => d[t.id]).length, total: TASKS.length };
}

function isComplete(i) { return dayProgress(i).done === TASKS.length; }

function getStreak() {
  let s = 0;
  for (let i = 74; i >= 0; i--) { if (isComplete(i)) s++; else break; }
  return s;
}

/* ── Render ── */
function updateStats() {
  const complete = Array.from({length:75},(_,i)=>isComplete(i)).filter(Boolean).length;
  document.getElementById('t-complete').textContent = complete;
  document.getElementById('t-left').textContent     = 75 - complete;
  document.getElementById('t-streak').textContent   = getStreak();
  
  const pct = Math.round(complete/75*100);
  document.getElementById('t-pct').textContent = pct + '%';
  const circle = document.getElementById('t-pct-circle');
  if (circle) {
    const offset = 163.36 - (163.36 * pct / 100);
    circle.style.strokeDashoffset = offset;
  }
}

function renderGrid() {
  const ti   = getTodayIdx();
  const grid = document.getElementById('days-grid');
  grid.innerHTML = Array.from({length:75},(_,i) => {
    const p   = dayProgress(i);
    const cls = isComplete(i) ? 'complete' : p.done > 0 ? 'partial' : '';
    const sel = i === selectedDay ? 'selected' : '';
    const tod = i === ti ? 'today' : '';
    return `<div class="day-cell ${cls} ${sel} ${tod}" onclick="selectDay(${i})" title="${dayLabel(i)} · ${SCHEDULE_TR[SCHEDULE[i%7]]}">
      <div class="day-cell-num">${i+1}</div>
      <div class="day-cell-type">${dayLabel(i)}</div>
    </div>`;
  }).join('');
}

function renderDetail() {
  if (!currentProfileId) return;
  const i       = selectedDay;
  const type    = SCHEDULE[i%7];
  const typeTr  = SCHEDULE_TR[type];
  const state   = getState() || {};
  const pillCls = `pill-${type.toLowerCase()}`;
  const todayBadge = i === getTodayIdx()
    ? ' <span style="font-family:\\'DM Mono\\',monospace;font-size:11px;color:var(--white);background:rgba(255,255,255,0.1);padding:3px 10px;letter-spacing:0.08em;">BUGÜN</span>' : '';
  const dateLine = startDate
    ? `<div style="font-family:\\'DM Mono\\',monospace;font-size:11px;color:var(--muted);margin-bottom:16px;letter-spacing:0.08em;">${new Date(new Date(startDate).setDate(new Date(startDate).getDate()+i)).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})}</div>` : '';
  const groups = ['sabah','gün','akşam'];
  const groupLabels = {sabah:'Sabah', gün:'Gün boyu', akşam:'Akşam'};
  
  let html = `<div class="detail-day-title">Gün ${i+1}${todayBadge} <span class="type-pill ${pillCls}">${typeTr.toUpperCase()}</span></div>${dateLine}<div class="task-list">`;
  
  if (isReadOnly) {
    html = `<div style="background:rgba(255,76,76,0.1); color:#ff4c4c; padding:8px 16px; border-radius:4px; font-size:12px; font-weight:bold; margin-bottom:16px; border:1px solid rgba(255,76,76,0.2);">SADECE OKUMA MODU: Başka bir profili inceliyorsunuz.</div>` + html;
  }
  
  groups.forEach(g => {
    html += `<div class="task-group-label">${groupLabels[g]}</div>`;
    TASKS.filter(t=>t.group===g).forEach(t => {
      const done = state[t.id] ? 'done' : '';
      html += `<div class="task-item ${done}" onclick="toggleTask(${i},'${t.id}')">
        <div class="task-check"><svg class="check-svg" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#0a0a0a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg></div>
        <span class="task-name-t">${t.label}</span>
      </div>`;
    });
  });
  html += '</div>';
  const noteVal = state.note || '';
  html += `<textarea class="daily-note-area" placeholder="Günün notunu buraya yaz..." onchange="saveNote(${i}, this.value)" ${isReadOnly ? 'disabled' : ''}>${noteVal}</textarea>`;
  if (isComplete(i)) html += `<div class="complete-banner">GÜN TAMAMLANDI</div>`;
  document.getElementById('detail-panel').innerHTML = html;
}

function saveNote(day, text) {
  if (isReadOnly) return alert("Sadece okuma modundasınız.");
  if (!profiles[currentProfileId].data) profiles[currentProfileId].data = {};
  if (!profiles[currentProfileId].data[day]) profiles[currentProfileId].data[day] = {};
  profiles[currentProfileId].data[day].note = text;
  saveProfiles();
}

function selectDay(i)  { selectedDay = i; render(); }

function toggleTask(day, taskId) {
  if (isReadOnly) return alert("Sadece okuma modundasınız. Başkasının programına müdahale edemezsiniz.");
  if (!profiles[currentProfileId].data) profiles[currentProfileId].data = {};
  if (!profiles[currentProfileId].data[day]) profiles[currentProfileId].data[day] = {};
  const wasComplete = isComplete(day);
  profiles[currentProfileId].data[day][taskId] = !profiles[currentProfileId].data[day][taskId];
  saveProfiles();
  render();
  
  if (navigator.vibrate) navigator.vibrate(50);
  
  if (!wasComplete && isComplete(day)) {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), '#ffffff']
      });
    }
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  }
}

function render() { renderProfilesBar(); updateStats(); renderGrid(); renderDetail(); }

function showTab(t) {
  document.querySelectorAll('.program-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${t}`).classList.add('active');
  event.target.classList.add('active');
}

// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold: 0.1});
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Theme
function setTheme(main, dark) {
  document.documentElement.style.setProperty('--accent', main);
  document.documentElement.style.setProperty('--accent-dark', dark);
  document.getElementById('theme-color-meta').setAttribute('content', main);
  localStorage.setItem('h75theme', JSON.stringify({main, dark}));
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.style.backgroundColor === main || b.style.backgroundColor.replace(/ /g,'') === `rgb(${hexToRgb(main)})`);
  });
}
function hexToRgb(hex) {
  let r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

// Init
const savedTheme = JSON.parse(localStorage.getItem('h75theme'));
if (savedTheme) setTheme(savedTheme.main, savedTheme.dark);

initSetupBar();
initFirebaseBar();
if (fbUrl) { syncDown(); startSyncTimer(); }
const ti0 = getTodayIdx();
if (ti0 >= 0) selectedDay = ti0;
"""

import codecs

filepath = r"c:\\Users\\kadir\\OneDrive\\Masaüstü\\75hard-site\\index.html"
with codecs.open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("/* ── AUTH ── */")
end_idx = content.find("</script>", start_idx)

new_content = content[:start_idx] + js_code + "\n" + content[end_idx:]

with codecs.open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
