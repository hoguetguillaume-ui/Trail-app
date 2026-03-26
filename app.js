
// ─────────────────────────────────────────
//  CENTRAL USER DATA MODEL
// ─────────────────────────────────────────
const user = {
  name: 'John Smith',
  email: 'johnsmith@gmail.com',
  weeklyHours: null,
  sessionLength: null,
  terrain: [],
  apps: [],
  raceType: null,
  raceName: null,
  raceDate: null,
  timeObjectiveH: null,
  timeObjectiveM: null,
};

// ─────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────
let current = 's-login';
function goTo(id) {
  if (id === current) return;
  const c = document.getElementById(current);
  const n = document.getElementById(id);
  c.classList.add('exit');
  setTimeout(() => { c.classList.remove('active','exit'); n.classList.add('active'); current = id; }, 280);
}

// ─────────────────────────────────────────
//  ONBOARDING HELPERS
// ─────────────────────────────────────────
function adj(id, delta, min, max) {
  const el = document.getElementById(id);
  let v = parseInt(el.textContent) + delta;
  v = Math.min(max, Math.max(min, v));
  el.textContent = id === 'om' ? String(v).padStart(2,'0') : v;
}

function saveApps() {
  user.apps = [...document.querySelectorAll('.app-card.on')].map(c => c.querySelector('span').textContent);
}

function toggleTerrain(el, val) {
  el.classList.toggle('on');
  if (el.classList.contains('on')) { if (!user.terrain.includes(val)) user.terrain.push(val); }
  else { user.terrain = user.terrain.filter(t => t !== val); }
}

function pickRaceType(val, onId, offId) {
  user.raceType = val;
  document.getElementById(onId).classList.add('on');
  document.getElementById(offId).classList.remove('on');
}

function pickRace(el, name) {
  user.raceName = name;
  document.querySelectorAll('.race-result').forEach(r => r.classList.remove('on'));
  el.classList.add('on');
}

function filterRaces(val) {
  document.querySelectorAll('.race-result').forEach(r => {
    r.style.display = r.dataset.name.toLowerCase().includes(val.toLowerCase()) ? '' : 'none';
  });
}

// Calendar
let calY = 2026, calM = 8, calSel = null;
function buildCal() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const firstDay = new Date(calY, calM, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const total = new Date(calY, calM + 1, 0).getDate();
  const selStr = calSel ? new Date(calSel).toDateString() : null;
  let h = `<div class="cal-header"><button class="cal-arrow-btn" onclick="navCal(-1)">‹</button><div class="cal-month">${months[calM]} ${calY}</div><button class="cal-arrow-btn" onclick="navCal(1)">›</button></div>`;
  h += `<div class="cal-dh">${days.map(d=>`<span>${d}</span>`).join('')}</div><div class="cal-grid">`;
  for(let i=0;i<offset;i++) h+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=total;d++) {
    const date = new Date(calY, calM, d);
    const sel = selStr && date.toDateString() === selStr ? ' sel' : '';
    h+=`<div class="cal-day${sel}" onclick="selDay(${d})">${d}</div>`;
  }
  h+=`</div>`;
  document.getElementById('cal-widget').innerHTML = h;
}
function navCal(d) { calM+=d; if(calM>11){calM=0;calY++;} if(calM<0){calM=11;calY--;} buildCal(); }
function selDay(d) { calSel = new Date(calY, calM, d).toISOString(); user.raceDate = calSel; buildCal(); }

// ─────────────────────────────────────────
//  FINISH ONBOARDING → WRITE TO PROFILE
// ─────────────────────────────────────────
function finishOnboarding() {
  // Collect remaining picker values
  user.weeklyHours = user.weeklyHours ?? parseInt(document.getElementById('wh').textContent);
  user.sessionLength = user.sessionLength ?? parseInt(document.getElementById('sl').textContent);
  user.timeObjectiveH = parseInt(document.getElementById('oh').textContent);
  user.timeObjectiveM = parseInt(document.getElementById('om').textContent);

  // Collect terrain from DOM if not already stored
  if (user.terrain.length === 0) {
    document.querySelectorAll('#s-terrain .opt-card.on').forEach(el => {
      const key = el.querySelector('.ol').textContent.trim().replace(/\s+\(.*\)/, match => match);
      user.terrain.push(el.querySelector('.ol').textContent.replace(/\s+/g,' ').trim());
    });
  }

  // Collect race type if not set
  if (!user.raceType) {
    user.raceType = document.getElementById('rt-existing').classList.contains('on') ? 'Existing trail' : 'Custom one';
  }

  // Update training plan screen with race info
  if (user.raceName) {
    document.getElementById('plan-race-name').textContent = user.raceName.toUpperCase();
  }

  // Show generating screen then plan
  goTo('s-generating');
  setTimeout(() => {
    renderProfile();
    initPlan();
    goTo('s-plan');
  }, 2800);
}

// ─────────────────────────────────────────
//  RENDER PROFILE FROM user OBJECT
// ─────────────────────────────────────────
function renderProfile() {
  setField('weekly-hours', user.weeklyHours ? `${user.weeklyHours} hours / week` : null);
  setField('session-length', user.sessionLength ? `${user.sessionLength} hour${user.sessionLength!==1?'s':''}` : null);
  setField('terrain', user.terrain.length ? user.terrain.map(t=>t.split(' (')[0]).join(', ') : null);
  setField('apps', user.apps.length ? user.apps.join(', ') : null);
  setField('race-type', user.raceType);
  setField('race-name', user.raceName);

  if (user.raceDate) {
    const d = new Date(user.raceDate);
    setField('race-date', d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}));
  } else {
    setField('race-date', null, 'Not set — tap to add');
  }

  if (user.timeObjectiveH !== null) {
    const m = String(user.timeObjectiveM||0).padStart(2,'0');
    setField('time-objective', `${user.timeObjectiveH}h ${m}min`);
  } else {
    setField('time-objective', null, 'Not set — tap to add');
  }

  document.getElementById('v-personal').textContent = `${user.name} · ${user.email}`;
  document.getElementById('pf-name').textContent = user.name;
  document.getElementById('pf-email').textContent = user.email;

  updateCompletion();
}

function setField(key, val, emptyText = 'Not set') {
  const el = document.getElementById(`v-${key}`);
  const dot = document.getElementById(`dot-${key}`);
  const badge = document.getElementById(`badge-${key}`);
  if (!el) return;
  if (val) {
    el.textContent = val;
    el.classList.remove('empty');
    if (dot) { dot.className = 'dot-f'; }
    if (badge) { badge.textContent = 'Onboarding'; badge.classList.remove('miss'); }
  } else {
    el.textContent = emptyText;
    el.classList.add('empty');
    if (dot) { dot.className = 'dot-e'; }
    if (badge) { badge.textContent = 'Missing'; badge.classList.add('miss'); }
  }
}

function updateCompletion() {
  const fields = [user.weeklyHours, user.sessionLength, user.terrain.length||null, user.apps.length||null, user.raceType, user.raceName, user.raceDate, user.timeObjectiveH];
  const filled = fields.filter(f => f !== null && f !== undefined).length;
  const pct = Math.round(filled / fields.length * 100);
  document.getElementById('comp-pct').textContent = pct + '%';
  document.getElementById('comp-fill').style.width = pct + '%';
  const hints = {
    100: '✅ Profile complete — your training plan is fully personalised!',
    75: 'Almost done! Add your race date & time objective.',
    50: 'Add your race details to personalise your plan.',
    0: 'Complete onboarding to generate your training plan.',
  };
  const key = pct >= 100 ? 100 : pct >= 75 ? 75 : pct >= 50 ? 50 : 0;
  document.getElementById('comp-hint').textContent = hints[key];
}

function resetOnboarding() {
  Object.assign(user, { weeklyHours:null, sessionLength:null, terrain:[], apps:[], raceType:null, raceName:null, raceDate:null, timeObjectiveH:null, timeObjectiveM:null });
  renderProfile();
  goTo('s-intro');
}

// ─────────────────────────────────────────
//  PROFILE EDIT SHEETS
// ─────────────────────────────────────────
let sp = {};
const sheets = {
  'weekly-hours': {
    title:'Weekly training hours',
    render() { sp.h=user.weeklyHours??14; return `<p class="sh-lbl">Hours per week</p><div class="sh-pkr-row"><div class="sh-pkr"><button class="sh-pa" onclick="spa('h',1,1,40)">▲</button><div class="sh-pv" id="sph">${sp.h}</div><div class="sh-pu">hours</div><button class="sh-pa" onclick="spa('h',-1,1,40)">▼</button></div></div><button class="sh-save" onclick="saveSheet('weekly-hours')">Save</button>`; },
    save() { user.weeklyHours=sp.h; }
  },
  'session-length': {
    title:'Max session length',
    render() { sp.h=user.sessionLength??3; return `<p class="sh-lbl">Longest session</p><div class="sh-pkr-row"><div class="sh-pkr"><button class="sh-pa" onclick="spa('h',1,1,12)">▲</button><div class="sh-pv" id="sph">${sp.h}</div><div class="sh-pu">hours</div><button class="sh-pa" onclick="spa('h',-1,1,12)">▼</button></div></div><button class="sh-save" onclick="saveSheet('session-length')">Save</button>`; },
    save() { user.sessionLength=sp.h; }
  },
  'terrain': {
    title:'Training environments',
    render() {
      const opts=['Flat treadmill','Inclined treadmill','Flat running terrain','Gently sloped (100m+)','Moderately hilly (500m+)','Mountainous (1000m+)'];
      return `<p class="sh-lbl">Select all that apply</p><div class="sh-chips">${opts.map(o=>`<div class="sh-chip${user.terrain.includes(o)?' on':''}" onclick="stToggle(this,'${o}')">${o}</div>`).join('')}</div><button class="sh-save" onclick="saveSheet('terrain')">Save</button>`;
    },
    save() {}
  },
  'connected-apps': {
    title:'Connected apps',
    render() {
      const opts=['Strava','Nike Run','Garmin','Kiprun'];
      return `<p class="sh-lbl">Select apps to sync</p><div class="sh-chips">${opts.map(o=>`<div class="sh-chip${user.apps.includes(o)?' on':''}" onclick="saToggle(this,'${o}')">${o}</div>`).join('')}</div><button class="sh-save" onclick="saveSheet('connected-apps')">Save</button>`;
    },
    save() {}
  },
  'race-type': {
    title:'Race type',
    render() { return `<p class="sh-lbl">Type of race</p><div class="sh-chips" style="flex-direction:column;"><div class="sh-chip${user.raceType==='Existing trail'?' on':''}" style="text-align:center;" onclick="srtSet(this,'Existing trail')">🗺️ Existing trail</div><div class="sh-chip${user.raceType==='Custom one'?' on':''}" style="text-align:center;" onclick="srtSet(this,'Custom one')">✏️ Custom one</div></div><button class="sh-save" onclick="saveSheet('race-type')" style="margin-top:14px;">Save</button>`; },
    save() {}
  },
  'race-name': {
    title:'Race name',
    render() {
      const races=[{n:'UTMB Official Trail',m:'176 km · Chamonix',i:'🏔'},{n:'UTMB Short Trail',m:'72 km · Chamonix',i:'⛰'},{n:'UTMB XL Trail',m:'176 km · Chamonix',i:'🗻'},{n:'CCC – Courmayeur-Champex-Chamonix',m:'101 km · Courmayeur',i:'⛰'}];
      return `<p class="sh-lbl">Search race</p><div class="sh-search"><span style="color:var(--muted)">🔍</span><input type="text" placeholder="Search…" oninput="sRaceFilter(this.value)" value="${user.raceName||''}"></div><div id="sh-race-list">${races.map(r=>`<div class="sh-race-opt" onclick="sRacePick('${r.n}')"><div class="sh-rbadge">${r.i}</div><div><div class="sh-rn">${r.n}</div><div class="sh-rm">${r.m}</div></div>${user.raceName===r.n?'<span style="color:var(--accent);margin-left:auto">✓</span>':''}</div>`).join('')}</div><button class="sh-save" onclick="saveSheet('race-name')" style="margin-top:8px;">Confirm</button>`;
    },
    save() {}
  },
  'race-date': {
    title:'Race date',
    render() { return `<p class="sh-lbl">When is your race?</p><div id="mini-cal"></div><button class="sh-save" onclick="saveSheet('race-date')">Confirm date</button>`; },
    afterRender() { buildMiniCal(); },
    save() { user.raceDate = miniSel; }
  },
  'time-objective': {
    title:'Time objective',
    render() { sp.h=user.timeObjectiveH??29; sp.m=user.timeObjectiveM??30; return `<p class="sh-lbl">Goal finish time</p><div class="sh-pkr-row"><div class="sh-pkr"><button class="sh-pa" onclick="spa('h',1,0,99)">▲</button><div class="sh-pv" id="sph">${sp.h}</div><div class="sh-pu">hours</div><button class="sh-pa" onclick="spa('h',-1,0,99)">▼</button></div><div style="font-family:'Bebas Neue';font-size:58px;color:var(--border);line-height:1;">:</div><div class="sh-pkr"><button class="sh-pa" onclick="spa('m',5,0,55)">▲</button><div class="sh-pv" id="spm">${String(sp.m).padStart(2,'0')}</div><div class="sh-pu">mins</div><button class="sh-pa" onclick="spa('m',-5,0,55)">▼</button></div></div><button class="sh-save" onclick="saveSheet('time-objective')">Save</button>`; },
    save() { user.timeObjectiveH=sp.h; user.timeObjectiveM=sp.m; }
  },
  'personal-info': {
    title:'Personal info',
    render() { return `<p class="sh-lbl">Name</p><input class="sh-input" id="pi-name" type="text" value="${user.name}"><p class="sh-lbl">Email</p><input class="sh-input" id="pi-email" type="email" value="${user.email}"><button class="sh-save" onclick="saveSheet('personal-info')">Save</button>`; },
    save() {
      user.name = document.getElementById('pi-name').value || user.name;
      user.email = document.getElementById('pi-email').value || user.email;
      document.getElementById('pf-name').textContent = user.name;
      document.getElementById('pf-email').textContent = user.email;
      document.getElementById('av-initials').childNodes[0].textContent = user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    }
  }
};

let activeSheet = null;
function openSheet(key) {
  activeSheet = key;
  const s = sheets[key];
  document.getElementById('sh-title').textContent = s.title;
  document.getElementById('sh-body').innerHTML = s.render();
  document.getElementById('sheet-overlay').classList.add('open');
  if (s.afterRender) setTimeout(s.afterRender, 40);
}
function closeSheet() { document.getElementById('sheet-overlay').classList.remove('open'); activeSheet = null; }
function maybeClose(e) { if (e.target.id === 'sheet-overlay') closeSheet(); }
function saveSheet(key) { sheets[key].save(); closeSheet(); renderProfile(); }

function spa(k, d, min, max) {
  sp[k] = Math.min(max, Math.max(min, (sp[k]||0) + d));
  const el = document.getElementById('sp'+k);
  if (el) el.textContent = k==='m' ? String(sp[k]).padStart(2,'0') : sp[k];
}
function stToggle(el, v) { el.classList.toggle('on'); if(el.classList.contains('on')){if(!user.terrain.includes(v))user.terrain.push(v);}else{user.terrain=user.terrain.filter(t=>t!==v);} }
function saToggle(el, v) { el.classList.toggle('on'); if(el.classList.contains('on')){if(!user.apps.includes(v))user.apps.push(v);}else{user.apps=user.apps.filter(a=>a!==v);} }
function srtSet(el, v) { el.closest('.sh-chips').querySelectorAll('.sh-chip').forEach(c=>c.classList.remove('on')); el.classList.add('on'); user.raceType=v; }
function sRacePick(n) { user.raceName=n; document.querySelectorAll('.sh-race-opt').forEach(r=>{const tick=r.querySelector('span[style]');if(tick)tick.remove();if(r.querySelector('.sh-rn').textContent===n)r.insertAdjacentHTML('beforeend','<span style="color:var(--accent);margin-left:auto">✓</span>');}); }
function sRaceFilter(v) { document.querySelectorAll('.sh-race-opt').forEach(r=>{r.style.display=r.querySelector('.sh-rn').textContent.toLowerCase().includes(v.toLowerCase())?'':'none';}); }

// Mini calendar for sheet
let miniCalY=2026, miniCalM=8, miniSel=null;
function buildMiniCal() {
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days=['M','T','W','T','F','S','S'];
  const firstDay=new Date(miniCalY,miniCalM,1).getDay();
  const offset=firstDay===0?6:firstDay-1;
  const total=new Date(miniCalY,miniCalM+1,0).getDate();
  const selStr=miniSel?new Date(miniSel).toDateString():null;
  let h=`<div class="mini-cal-header"><button class="mini-cal-btn" onclick="mCalNav(-1)">‹</button><span class="mini-cal-month">${months[miniCalM]} ${miniCalY}</span><button class="mini-cal-btn" onclick="mCalNav(1)">›</button></div>`;
  h+=`<div class="mini-cal-dh">${days.map(d=>`<span>${d}</span>`).join('')}</div><div class="mini-cal-grid">`;
  for(let i=0;i<offset;i++) h+=`<div class="mini-day mcal-empty"></div>`;
  for(let d=1;d<=total;d++){const date=new Date(miniCalY,miniCalM,d);const sel=selStr&&date.toDateString()===selStr?' mcal-sel':'';h+=`<div class="mini-day${sel}" onclick="mCalSel(${d})">${d}</div>`;}
  h+=`</div>`;
  document.getElementById('mini-cal').innerHTML=h;
}
function mCalNav(d){miniCalM+=d;if(miniCalM>11){miniCalM=0;miniCalY++;}if(miniCalM<0){miniCalM=11;miniCalY--;}buildMiniCal();}
function mCalSel(d){miniSel=new Date(miniCalY,miniCalM,d).toISOString();buildMiniCal();}
// ─────────────────────────────────────────
//  TRAINING PLAN DATA & LOGIC
// ─────────────────────────────────────────

// Placeholder plan — 12 weeks, 3 runs each
// This will be replaced by the real algorithm later
const TOTAL_WEEKS = 12;
const TODAY_WEEK = 1; // Current week (1-indexed, would be dynamic in production)

// Generate placeholder plan data
function generatePlanData() {
  const types = [
    { type: 'VO2 max',                   dur: 50,  dist: 7,  elev: 500,  cal: 480  },
    { type: 'Endurance (volume)',         dur: 90,  dist: 14, elev: 200,  cal: 860  },
    { type: 'Aerobic threshold',          dur: 60,  dist: 10, elev: 300,  cal: 600  },
    { type: 'Long run',                   dur: 150, dist: 22, elev: 800,  cal: 1400 },
    { type: 'Recovery run',              dur: 40,  dist: 6,  elev: 100,  cal: 320  },
    { type: 'Hill repeats',              dur: 70,  dist: 9,  elev: 900,  cal: 720  },
  ];

  const weeks = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    // Volume ramps up weeks 1-9, tapers weeks 10-12
    const loadFactor = w <= 9 ? w / 9 : (TOTAL_WEEKS - w + 1) / 4;
    const runs = [
      { ...types[(w + 0) % types.length], completed: false },
      { ...types[(w + 2) % types.length], completed: false },
      { ...types[(w + 4) % types.length], completed: false },
    ];
    // Simulate: in past weeks, some runs are completed
    if (w < TODAY_WEEK) {
      runs.forEach(r => r.completed = true); // past weeks fully done
    }
    weeks.push({ week: w, runs, loadFactor: Math.max(0.2, loadFactor) });
  }
  return weeks;
}

let planData = generatePlanData();
let currentWeek = TODAY_WEEK; // 1-indexed

// ─── RENDER WEEK TIMELINE ───
function renderTimeline() {
  const el = document.getElementById('week-timeline');
  if (!el) return;

  el.innerHTML = planData.map((wk, i) => {
    const wNum = i + 1;
    const isCurrent = wNum === currentWeek;
    const completedRuns = wk.runs.filter(r => r.completed).length;
    const hasAny = completedRuns > 0;
    const heightPct = Math.round(20 + wk.loadFactor * 80);

    // Colors
    let bg, border, opacity;
    if (isCurrent) {
      bg = hasAny ? 'var(--accent2)' : 'transparent';
      border = `2px solid var(--accent)`;
      opacity = 1;
    } else if (hasAny) {
      bg = 'var(--accent2)';
      border = '2px solid transparent';
      opacity = wNum < currentWeek ? 0.5 : 0.85;
    } else {
      bg = 'transparent';
      border = `2px solid var(--border2)`;
      opacity = wNum < currentWeek ? 0.3 : 0.7;
    }

    return `<div
      onclick="planGoTo(${wNum})"
      title="Week ${wNum}"
      style="
        flex:1; height:${heightPct}%; border-radius:4px 4px 2px 2px;
        background:${bg}; border:${border}; opacity:${opacity};
        transition:all 0.2s; cursor:pointer; box-sizing:border-box;
        ${isCurrent ? 'box-shadow:0 0 0 1px rgba(232,255,71,0.4);' : ''}
      "
    ></div>`;
  }).join('');
}

// ─── RENDER WEEK DETAIL ───
function renderWeekDetail() {
  const wk = planData[currentWeek - 1];
  if (!wk) return;

  const completedRuns = wk.runs.filter(r => r.completed).length;
  const totalRuns = wk.runs.length;

  // Header
  document.getElementById('wk-label').textContent = `Week ${currentWeek}/${TOTAL_WEEKS}`;
  document.getElementById('wk-sub').textContent = `${totalRuns} runs · ${completedRuns}/${totalRuns} completed`;

  // Arrow visibility
  document.getElementById('wk-prev').style.opacity = currentWeek <= 1 ? '0.3' : '1';
  document.getElementById('wk-next').style.opacity = currentWeek >= TOTAL_WEEKS ? '0.3' : '1';

  // Workout cards
  const cardsEl = document.getElementById('workout-cards');
  cardsEl.innerHTML = wk.runs.map((run, i) => {
    const isFirst = i === 0;
    const highlight = isFirst && !run.completed;
    return `
      <div class="wo-card" onclick="toggleRunComplete(${currentWeek - 1}, ${i})" style="
        ${run.completed ? 'opacity:0.5;' : ''}
        position:relative; overflow:hidden;
      ">
        ${run.completed ? `<div style="position:absolute;top:10px;right:40px;font-size:11px;color:var(--green);font-weight:600;">✓ Done</div>` : ''}
        <div>
          <div class="wo-type${highlight ? ' hl' : ''}" style="${run.completed ? 'text-decoration:line-through;' : ''}">
            ${run.type}
            ${highlight ? `<span style="font-size:10px;color:var(--muted);font-family:'DM Sans';">Start running!</span>` : ''}
          </div>
          <div class="wo-meta">
            <span><strong>${run.dur} mn</strong>Time</span>
            <span><strong>${run.dist} km</strong>Distance</span>
            <span><strong>${run.elev} m</strong>Elevation</span>
          </div>
        </div>
        <div class="chev">›</div>
      </div>`;
  }).join('');

  // Workload totals
  const totDist = wk.runs.reduce((s, r) => s + r.dist, 0);
  const totTime = wk.runs.reduce((s, r) => s + r.dur, 0);
  const totElev = wk.runs.reduce((s, r) => s + r.elev, 0);
  const totCal  = wk.runs.reduce((s, r) => s + r.cal, 0);
  const h = Math.floor(totTime / 60), m = totTime % 60;

  document.getElementById('wl-dist').textContent = `${totDist} km`;
  document.getElementById('wl-time').textContent = `${h}h ${m}mn`;
  document.getElementById('wl-elev').textContent = `${totElev} m`;
  document.getElementById('wl-cal').textContent = `${totCal} Kcal`;
}

// ─── NAVIGATE ───
function planNav(delta) {
  const next = currentWeek + delta;
  if (next < 1 || next > TOTAL_WEEKS) return;
  planGoTo(next);
}

function planGoTo(wNum) {
  currentWeek = wNum;
  renderTimeline();
  renderWeekDetail();
}

// ─── MARK RUN AS COMPLETE ───
function toggleRunComplete(weekIdx, runIdx) {
  planData[weekIdx].runs[runIdx].completed = !planData[weekIdx].runs[runIdx].completed;
  renderTimeline();
  renderWeekDetail();
}

// ─── INIT PLAN (called after onboarding finishes) ───
function initPlan() {
  planData = generatePlanData();
  currentWeek = TODAY_WEEK;
  renderTimeline();
  renderWeekDetail();
}

// ─────────────────────────────────────────
//  LEAFLET MAP — load CSS + JS dynamically
// ─────────────────────────────────────────
(function loadLeaflet() {
  if (document.getElementById('leaflet-css')) return;
  const css = document.createElement('link');
  css.id = 'leaflet-css';
  css.rel = 'stylesheet';
  css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  document.head.appendChild(css);
  const js = document.createElement('script');
  js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  js.onload = () => { window._leafletReady = true; };
  document.head.appendChild(js);
})();

let _leafletMap = null;
let _leafletPolyline = null;
let _leafletMarker = null;

function initLeafletMap() {
  if (!window.L || _leafletMap) return;
  const el = document.getElementById('rd-leaflet-map');
  if (!el || el.offsetHeight === 0) return;

  _leafletMap = L.map('rd-leaflet-map', {
    zoomControl: false, attributionControl: false,
    dragging: true, touchZoom: true, scrollWheelZoom: false,
  });

  // OpenTopoMap — free topographic tiles, perfect for trail
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 15, opacity: 0.92,
  }).addTo(_leafletMap);

  drawLeafletRoute();
}

function drawLeafletRoute() {
  if (!window.L || !_leafletMap) return;
  if (_leafletPolyline) { _leafletMap.removeLayer(_leafletPolyline); }
  if (_leafletMarker) { _leafletMap.removeLayer(_leafletMarker); }

  if (rdRoute.length < 2) return;

  _leafletPolyline = L.polyline(rdRoute, {
    color: '#3ddc84', weight: 4, opacity: 0.95,
    lineCap: 'round', lineJoin: 'round',
  }).addTo(_leafletMap);

  // Start marker
  L.circleMarker(rdRoute[0], { radius:6, fillColor:'#3ddc84', color:'#fff', weight:2, fillOpacity:1 }).addTo(_leafletMap);
  // End marker
  L.circleMarker(rdRoute[rdRoute.length-1], { radius:6, fillColor:'#ff4757', color:'#fff', weight:2, fillOpacity:1 }).addTo(_leafletMap);

  // Checkpoint markers
  [0.25, 0.5, 0.75].forEach(pct => {
    const idx = Math.floor(pct * (rdRoute.length-1));
    L.circleMarker(rdRoute[idx], { radius:4, fillColor:'#e8ff47', color:'#fff', weight:1.5, fillOpacity:1 }).addTo(_leafletMap);
  });

  _leafletMap.fitBounds(_leafletPolyline.getBounds(), { padding: [24, 24] });
  setTimeout(() => _leafletMap.invalidateSize(), 100);
}

function updateLeafletPosition(pct) {
  if (!window.L || !_leafletMap) return;
  const idx = Math.round(pct * (rdRoute.length-1));
  const pt = rdRoute[idx];
  if (!pt) return;
  if (_leafletMarker) _leafletMap.removeLayer(_leafletMarker);
  _leafletMarker = L.circleMarker(pt, {
    radius:8, fillColor:'#e8ff47', color:'#fff', weight:2, fillOpacity:1,
  }).addTo(_leafletMap);
}

// ─────────────────────────────────────────
//  RACE DAY DATA & LOGIC
// ─────────────────────────────────────────

// Default GPX route: simplified UTMB-like path (lat/lon pairs)
// Will be replaced when user imports a real GPX file
const DEFAULT_ROUTE = [
  [45.9237,6.8694],[45.9198,6.8750],[45.9150,6.8820],[45.9090,6.8900],
  [45.9020,6.8980],[45.8960,6.9060],[45.8900,6.9150],[45.8840,6.9250],
  [45.8780,6.9380],[45.8700,6.9500],[45.8640,6.9640],[45.8580,6.9780],
  [45.8520,6.9900],[45.8460,7.0050],[45.8400,7.0200],[45.8340,7.0380],
  [45.8300,7.0550],[45.8260,7.0720],[45.8220,7.0900],[45.8200,7.1100],
  [45.8230,7.1300],[45.8270,7.1500],[45.8310,7.1680],[45.8370,7.1850],
  [45.8430,7.2000],[45.8500,7.2150],[45.8570,7.2300],[45.8650,7.2420],
  [45.8740,7.2520],[45.8820,7.2600],[45.8900,7.2650],[45.8960,7.2680],
  [45.9030,7.2700],[45.9100,7.2680],[45.9160,7.2650],[45.9220,7.2600],
  [45.9270,7.2530],[45.9310,7.2450],[45.9330,7.2350],[45.9330,7.2240],
  [45.9310,7.2130],[45.9270,7.2020],[45.9230,7.1910],[45.9200,7.1800],
  [45.9180,7.1680],[45.9170,7.1550],[45.9180,7.1420],[45.9200,7.1300],
];

// Elevation profile (metres, one per point)
const DEFAULT_ELEVATION = [
  1035,1080,1200,1380,1560,1720,1840,1920,2100,2250,2380,2440,
  2300,2150,1980,1820,1640,1450,1280,1100,980,1050,1180,1350,
  1520,1680,1820,1940,2080,2200,2310,2380,2440,2350,2220,2080,
  1940,1820,1680,1520,1380,1220,1100,980,880,820,800,850,900,950
];

// ── Smart section splitting from elevation profile ──
// Instead of fixed number of sections, detects meaningful terrain changes:
// a long climb becomes one section, a descent becomes another, flat stretches group together.
function generateSectionsFromElevation(elev, route) {
  if (!elev || elev.length < 2) return [];

  const totalKm = route.length || elev.length;
  const kmPerPt = totalKm / elev.length;

  // Step 1: Smooth elevation slightly to avoid noise
  const smoothed = elev.map((e, i) => {
    const w = 3;
    let sum = 0, count = 0;
    for (let j = Math.max(0, i-w); j <= Math.min(elev.length-1, i+w); j++) {
      sum += elev[j]; count++;
    }
    return sum / count;
  });

  // Step 2: Classify each point as UP / DOWN / FLAT
  const GRADE_THRESH = 0.04; // 4% grade = boundary between flat and climb/descent
  const classify = (i) => {
    if (i === 0) return 'flat';
    const grade = (smoothed[i] - smoothed[i-1]) / (kmPerPt * 1000);
    if (grade > GRADE_THRESH) return 'up';
    if (grade < -GRADE_THRESH) return 'down';
    return 'flat';
  };

  // Step 3: Group consecutive same-type points into raw segments
  const rawSegments = [];
  let curType = classify(1);
  let curStart = 0;
  for (let i = 1; i < smoothed.length; i++) {
    const t = classify(i);
    if (t !== curType) {
      rawSegments.push({ type: curType, start: curStart, end: i - 1 });
      curType = t;
      curStart = i;
    }
  }
  rawSegments.push({ type: curType, start: curStart, end: smoothed.length - 1 });

  // Step 4: Merge tiny segments (< 3% of total) into neighbours
  const MIN_PTS = Math.max(2, Math.floor(smoothed.length * 0.03));
  const merged = [];
  for (const seg of rawSegments) {
    const len = seg.end - seg.start;
    if (merged.length > 0 && len < MIN_PTS) {
      merged[merged.length - 1].end = seg.end;
    } else {
      merged.push({ ...seg });
    }
  }

  // Step 5: Build section objects with dynamic pacing
  const basePaceMinKm = (() => {
    const h = (typeof user !== 'undefined' && user.timeObjectiveH != null) ? user.timeObjectiveH : 29;
    const m = (typeof user !== 'undefined' && user.timeObjectiveM != null) ? user.timeObjectiveM : 32;
    return (h * 60 + m) / Math.max(totalKm, 1);
  })();

  const TERRAINS = ['Rocky', 'Road', 'Single track', 'Trail', 'Rocky'];
  const sections = [];
  let cpEvery = Math.max(2, Math.floor(merged.length / 3));
  let cpCount = 0;

  merged.forEach((seg, idx) => {
    // Insert checkpoint before every ~3rd section
    if (idx > 0 && idx % cpEvery === 0 && cpCount < 3) {
      const atKm = Math.round(seg.start * kmPerPt);
      sections.push({ checkpoint: true, name: 'Checkpoint w/ assistance · ' + atKm + ' km', gels: 3, bananas: 1, water: '2×500ml' });
      cpCount++;
    }

    const segKm = Math.max(0.5, Math.round((seg.end - seg.start) * kmPerPt * 10) / 10);
    const elevStart = smoothed[seg.start];
    const elevEnd = smoothed[seg.end];
    const elevDiff = Math.round(elevEnd - elevStart);
    const elevStr = elevDiff >= 0 ? '+' + elevDiff + 'm' : elevDiff + 'm';

    // Pace multiplier based on type + steepness
    const avgGrade = Math.abs(elevDiff) / (segKm * 1000);
    let paceMult;
    if (seg.type === 'up') {
      paceMult = 1.0 + Math.min(avgGrade * 12, 2.0); // max 3× base pace uphill
    } else if (seg.type === 'down') {
      paceMult = Math.max(0.5, 1.0 - avgGrade * 6); // min 0.5× base pace downhill
    } else {
      paceMult = 0.88; // flat is slightly faster than average (average includes climbs)
    }

    const paceMinKm = basePaceMinKm * paceMult;
    const pMin = Math.floor(paceMinKm);
    const pSec = Math.round((paceMinKm - pMin) * 60);
    const paceStr = pMin + "'" + String(pSec).padStart(2, '0') + '"/km';

    const typeLabel = seg.type === 'up' ? 'Climbing' : seg.type === 'down' ? 'Descending' : 'Flat and easy';
    const terrain = TERRAINS[idx % TERRAINS.length];

    sections.push({
      dist: segKm, elev: elevStr, elevDiff,
      type: typeLabel, typeDir: seg.type,
      pace: paceStr, terrain, conditions: 'Cold & dry',
      startKm: Math.round(seg.start * kmPerPt),
    });
  });

  return sections;
}

const WEATHER = [
  {h:'8h',icon:'⛅'},{h:'9h',icon:'🌤'},{h:'10h',icon:'☀️'},{h:'11h',icon:'☀️'},
  {h:'12h',icon:'🌤'},{h:'13h',icon:'⛅'},{h:'14h',icon:'🌧'},{h:'15h',icon:'⛈'},
  {h:'16h',icon:'🌧'},{h:'17h',icon:'⛅'},{h:'18h',icon:'🌤'},{h:'19h',icon:'☀️'},
];
const GEAR = ['👟','🧢','🧤','💧','🎽','🩹','🔦','🥜','🧴','🪝','🥾','🩱'];

let rdRoute = DEFAULT_ROUTE;
let rdElevation = DEFAULT_ELEVATION;

function projectRoute(route) {
  const lats = route.map(p=>p[0]), lons = route.map(p=>p[1]);
  const minLat=Math.min(...lats), maxLat=Math.max(...lats);
  const minLon=Math.min(...lons), maxLon=Math.max(...lons);
  const W=390, H=380, pad=28;
  return route.map(([lat,lon]) => ({
    x: pad + (lon-minLon)/(maxLon-minLon||1)*(W-pad*2),
    y: H-pad - (lat-minLat)/(maxLat-minLat||1)*(H-pad*2),
  }));
}

function renderMap() {
  if (window.L && _leafletMap) { drawLeafletRoute(); return; }
  const pts = projectRoute(rdRoute);
  const line = document.getElementById('rd-route-line');
  if (!line) return;
  line.setAttribute('points', pts.map(p => p.x.toFixed(1)+','+p.y.toFixed(1)).join(' '));
  const dotsG = document.getElementById('rd-section-dots');
  if (!dotsG) return;
  dotsG.innerHTML = '';
  if (pts.length > 0) {
    const s=pts[0], e=pts[pts.length-1];
    dotsG.innerHTML += `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="5" fill="#3ddc84" stroke="#fff" stroke-width="1.5"/>`;
    dotsG.innerHTML += `<circle cx="${e.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="5" fill="#ff4757" stroke="#fff" stroke-width="1.5"/>`;
  }
}

// Cache sections so elevation can reference them
let _cachedSections = [];

function renderElevation(highlightIdx) {
  const canvas = document.getElementById('rd-elev-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const el = rdElevation;
  const minE = Math.min(...el), maxE = Math.max(...el);
  const range = maxE - minE || 1;
  ctx.clearRect(0,0,W,H);

  const pts = el.map((e,i) => ({ x:(i/(el.length-1))*W, y:H-((e-minE)/range)*(H-8)-4 }));

  // Draw section bands behind the elevation fill
  const totalKm = rdRoute.length || el.length;
  const runSections = _cachedSections.filter(s => !s.checkpoint);
  if (runSections.length > 0) {
    runSections.forEach((s, i) => {
      const x1 = (s.startKm / totalKm) * W;
      const nextSec = runSections[i + 1];
      const endKm = nextSec ? nextSec.startKm : totalKm;
      const x2 = (endKm / totalKm) * W;
      const isHighlighted = (i === highlightIdx);

      // Background band — tinted by type
      let bandColor;
      if (s.typeDir === 'up')        bandColor = isHighlighted ? 'rgba(255,107,53,0.35)' : 'rgba(255,107,53,0.12)';
      else if (s.typeDir === 'down') bandColor = isHighlighted ? 'rgba(116,185,255,0.35)' : 'rgba(116,185,255,0.12)';
      else                           bandColor = isHighlighted ? 'rgba(232,255,71,0.25)'  : 'rgba(232,255,71,0.08)';

      ctx.fillStyle = bandColor;
      ctx.fillRect(x1, 0, x2 - x1, H);

      // Divider line
      if (i > 0) {
        ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, H);
        ctx.strokeStyle = isHighlighted ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = isHighlighted ? 1.5 : 1;
        ctx.setLineDash([]); ctx.stroke();
      }

      // Section label — icon + distance
      const icon = s.typeDir === 'up' ? '↑' : s.typeDir === 'down' ? '↓' : '→';
      const bandW = x2 - x1;
      if (bandW > 18) {
        ctx.font = `bold ${Math.min(10, bandW * 0.18)}px DM Sans, sans-serif`;
        ctx.fillStyle = isHighlighted ? '#fff' : 'rgba(255,255,255,0.55)';
        ctx.textAlign = 'center';
        const cx = x1 + bandW / 2;
        ctx.fillText(icon, cx, 12);
        if (bandW > 32) {
          ctx.font = `${Math.min(8, bandW * 0.14)}px DM Sans, sans-serif`;
          ctx.fillStyle = isHighlighted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)';
          ctx.fillText(s.dist + 'km', cx, 22);
        }
      }
    });
  }

  // Elevation gradient fill
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'rgba(255,107,53,0.75)');
  grad.addColorStop(0.6,'rgba(255,71,87,0.4)');
  grad.addColorStop(1,'rgba(255,71,87,0.02)');
  ctx.beginPath(); ctx.moveTo(pts[0].x, H);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length-1].x, H); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  // Elevation top line
  ctx.beginPath(); pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
  ctx.strokeStyle = '#ff6b35'; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.stroke();

  // Labels
  const elevMaxEl = document.getElementById('rd-elev-max');
  if (elevMaxEl) elevMaxEl.textContent = maxE.toLocaleString() + ' m';
  const midEl = document.getElementById('rd-dist-mid');
  if (midEl) midEl.textContent = Math.round(rdRoute.length/2) + ' km';
  const totEl = document.getElementById('rd-dist-total');
  if (totEl) totEl.textContent = rdRoute.length + ' km';
}

function initElevScrub() {
  const canvas = document.getElementById('rd-elev-canvas');
  const tip = document.getElementById('rd-scrub-tip');
  if (!canvas) return;
  canvas.removeEventListener('mousemove', canvas._scrub);
  canvas.removeEventListener('mouseleave', canvas._hide);
  canvas.removeEventListener('touchmove', canvas._touch);
  canvas.removeEventListener('touchend', canvas._hide);

  canvas._scrub = function(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(pct * (rdElevation.length - 1));
    if (tip) {
      tip.style.display = 'block';
      tip.style.left = (pct * 100) + '%';
      const kmEl = document.getElementById('rd-scrub-km');
      const elevEl = document.getElementById('rd-scrub-elev');
      if (kmEl) kmEl.textContent = Math.round(pct * rdRoute.length) + ' km';
      if (elevEl) elevEl.textContent = (rdElevation[idx] || 0) + ' m';
    }
    updateLeafletPosition(pct);
    renderElevation();
    const ctx = canvas.getContext('2d');
    const x = pct * canvas.width;
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height);
    ctx.strokeStyle = 'rgba(232,255,71,0.8)'; ctx.lineWidth = 1.5; ctx.stroke();
    const minE=Math.min(...rdElevation), maxE=Math.max(...rdElevation);
    const y = canvas.height - ((rdElevation[idx]-minE)/(maxE-minE||1))*(canvas.height-8)-4;
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle='#e8ff47'; ctx.fill();
  };
  canvas._hide = function() {
    if (tip) tip.style.display = 'none';
    if (_leafletMarker && _leafletMap) _leafletMap.removeLayer(_leafletMarker);
    _leafletMarker = null;
    renderElevation();
  };
  canvas._touch = function(e) { e.preventDefault(); canvas._scrub(e); };

  canvas.addEventListener('mousemove', canvas._scrub);
  canvas.addEventListener('mouseleave', canvas._hide);
  canvas.addEventListener('touchmove', canvas._touch, {passive:false});
  canvas.addEventListener('touchend', canvas._hide);
}

function importGPX(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(e.target.result, 'application/xml');
      const trkpts = xml.querySelectorAll('trkpt');
      if (trkpts.length === 0) { alert('No track points found in GPX file.'); return; }
      rdRoute = []; rdElevation = [];
      trkpts.forEach(pt => {
        const lat = parseFloat(pt.getAttribute('lat'));
        const lon = parseFloat(pt.getAttribute('lon'));
        const eleEl = pt.querySelector('ele');
        const ele = eleEl ? parseFloat(eleEl.textContent) : 1000;
        if (!isNaN(lat) && !isNaN(lon)) { rdRoute.push([lat,lon]); rdElevation.push(Math.round(ele)); }
      });
      if (rdRoute.length > 300) {
        const step = Math.floor(rdRoute.length / 300);
        rdRoute = rdRoute.filter((_,i) => i % step === 0);
        rdElevation = rdElevation.filter((_,i) => i % step === 0);
      }
      const raceName = file.name.replace('.gpx','').replace(/[_-]/g,' ').toUpperCase();
      const nameEl = document.getElementById('rd-race-name-map');
      const planEl = document.getElementById('plan-race-name');
      if (nameEl) nameEl.textContent = raceName;
      if (planEl) planEl.textContent = raceName;
      renderMap(); renderElevation(); renderSections();
      const btn = document.getElementById('gpx-import-btn');
      if (btn) { btn.style.borderColor = 'var(--green)'; btn.style.color = 'var(--green)'; }
      setTimeout(() => {
        if (btn) { btn.style.borderColor = 'var(--border2)'; btn.style.color = 'var(--text)'; }
      }, 2500);
    } catch(err) { alert('Could not parse GPX file.'); }
  };
  reader.readAsText(file);
}

function renderWeather() {
  const el = document.getElementById('rd-weather-strip');
  if (!el) return;
  el.innerHTML = WEATHER.map(w => `
    <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:3px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:7px 10px;min-width:44px;">
      <div style="font-size:10px;color:var(--muted);">${w.h}</div>
      <div style="font-size:18px;">${w.icon}</div>
    </div>`).join('');
}

// Leaflet layer for section highlight on map
let _sectionHighlightLayer = null;

function highlightSectionOnMap(s, runSections, idx) {
  // Remove previous highlight
  if (_sectionHighlightLayer && _leafletMap) {
    _leafletMap.removeLayer(_sectionHighlightLayer);
    _sectionHighlightLayer = null;
  }
  if (!s || !window.L || !_leafletMap || rdRoute.length < 2) return;

  const totalKm = rdRoute.length;
  const startPct = s.startKm / totalKm;
  const nextSec = runSections[idx + 1];
  const endKm = nextSec ? nextSec.startKm : totalKm;
  const endPct = endKm / totalKm;

  const startIdx = Math.floor(startPct * (rdRoute.length - 1));
  const endIdx = Math.min(Math.ceil(endPct * (rdRoute.length - 1)), rdRoute.length - 1);
  const segment = rdRoute.slice(startIdx, endIdx + 1);
  if (segment.length < 2) return;

  const color = s.typeDir === 'up' ? '#ff6b35' : s.typeDir === 'down' ? '#74b9ff' : '#e8ff47';
  _sectionHighlightLayer = L.polyline(segment, {
    color, weight: 6, opacity: 1,
    lineCap: 'round', lineJoin: 'round',
  }).addTo(_leafletMap);

  // Pan map to show this section
  _leafletMap.fitBounds(_sectionHighlightLayer.getBounds(), { padding: [40, 40], maxZoom: 13 });
}

function clearSectionHighlight() {
  if (_sectionHighlightLayer && _leafletMap) {
    _leafletMap.removeLayer(_sectionHighlightLayer);
    _sectionHighlightLayer = null;
  }
  // Restore full route view
  if (_leafletPolyline && _leafletMap) {
    _leafletMap.fitBounds(_leafletPolyline.getBounds(), { padding: [24, 24] });
  }
  renderElevation();
}

function renderSections() {
  const el = document.getElementById('rd-sections-list');
  if (!el) return;
  const sections = generateSectionsFromElevation(rdElevation, rdRoute);
  _cachedSections = sections; // cache for elevation rendering
  const runSections = sections.filter(s => !s.checkpoint);
  const sectionCount = runSections.length;
  const countEl = document.getElementById('rd-section-count');
  if (countEl) countEl.textContent = sectionCount + ' sections';

  // Draw section bands on elevation canvas
  renderElevation();

  el.innerHTML = sections.map((s, rawIdx) => {
    // Compute the run-section index (excludes checkpoints)
    const runIdx = runSections.indexOf(s);

    if (s.checkpoint) {
      return `
        <div style="background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius);padding:13px 15px;margin-bottom:9px;display:flex;align-items:flex-start;gap:12px;">
          <div style="font-size:18px;flex-shrink:0;margin-top:2px;">✅</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:6px;">${s.name}</div>
            <div style="display:flex;gap:16px;">
              <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Gels</div><div style="font-size:12px;color:var(--text);">${s.gels}</div></div>
              <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Water</div><div style="font-size:12px;color:var(--text);">${s.water}</div></div>
              <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Snack</div><div style="font-size:12px;color:var(--text);">${s.bananas} banana</div></div>
            </div>
          </div>
        </div>`;
    }

    const typeIcon  = s.typeDir === 'flat' ? '→' : (s.typeDir === 'down' ? '↓' : '↑');
    const typeColor = s.typeDir === 'flat' ? 'var(--accent)' : (s.typeDir === 'down' ? '#74b9ff' : 'var(--accent2)');

    return `
      <div class="rd-section-card"
           data-run-idx="${runIdx}"
           style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:13px 15px;margin-bottom:9px;cursor:pointer;transition:border-color 0.2s,box-shadow 0.2s;"
           onclick="onSectionClick(${runIdx})">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:28px;height:28px;border-radius:50%;background:${typeColor}33;border:1px solid ${typeColor};display:flex;align-items:center;justify-content:center;font-size:14px;color:${typeColor};flex-shrink:0;">${typeIcon}</div>
          <div style="font-size:13px;font-weight:600;color:#fff;flex:1;">${s.dist} km · ${s.elev} · ${s.type}</div>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Pace</div><div style="font-size:12px;color:var(--text);margin-top:1px;font-weight:600;">${s.pace}</div></div>
          <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Terrain</div><div style="font-size:12px;color:var(--text);margin-top:1px;">${s.terrain}</div></div>
          <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Conditions</div><div style="font-size:12px;color:var(--text);margin-top:1px;">${s.conditions}</div></div>
          <div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">From</div><div style="font-size:12px;color:var(--text);margin-top:1px;">${s.startKm} km</div></div>
        </div>
      </div>`;
  }).join('');
}

let _activeSection = null;

function onSectionClick(runIdx) {
  const runSections = _cachedSections.filter(s => !s.checkpoint);
  const s = runSections[runIdx];
  if (!s) return;

  // Toggle off if clicking the same section again
  if (_activeSection === runIdx) {
    _activeSection = null;
    document.querySelectorAll('.rd-section-card').forEach(el => {
      el.style.borderColor = 'var(--border)';
      el.style.boxShadow = 'none';
    });
    clearSectionHighlight();
    return;
  }

  _activeSection = runIdx;

  // Highlight the clicked card, reset all others
  document.querySelectorAll('.rd-section-card').forEach(el => {
    const idx = parseInt(el.dataset.runIdx);
    const sec = runSections[idx];
    const typeColor = sec
      ? (sec.typeDir === 'flat' ? 'var(--accent)' : sec.typeDir === 'down' ? '#74b9ff' : 'var(--accent2)')
      : 'var(--border)';
    el.style.borderColor = (idx === runIdx) ? typeColor : 'var(--border)';
    el.style.boxShadow = (idx === runIdx) ? `0 0 0 1px ${typeColor}44` : 'none';
  });

  // Highlight on elevation canvas
  renderElevation(runIdx);

  // Highlight on map
  highlightSectionOnMap(s, runSections, runIdx);
}

function renderGear() {
  const el = document.getElementById('rd-gear-grid');
  if (!el) return;
  el.innerHTML = GEAR.map(g => `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;">${g}</div>
  `).join('');
}

function syncRaceDayFromUser() {
  if (typeof user !== 'undefined' && user.timeObjectiveH != null) {
    const m = String(user.timeObjectiveM || 0).padStart(2,'0');
    const el = document.getElementById('rd-time-obj');
    if (el) el.textContent = user.timeObjectiveH + 'h' + m;
  }
  if (typeof user !== 'undefined' && user.raceName) {
    const nameEl = document.getElementById('rd-race-name-map');
    if (nameEl) nameEl.textContent = user.raceName.toUpperCase();
  }
}

function initRaceDay() {
  syncRaceDayFromUser();
  renderElevation();
  initElevScrub();
  renderWeather();
  renderSections();
  renderGear();
  if (window.L) { initLeafletMap(); }
  else {
    const poll = setInterval(() => { if (window.L) { clearInterval(poll); initLeafletMap(); } }, 200);
  }
}

// Init race day when navigating there — called directly from tab button
