// Tracker Trophy Leonida — checklist 55 trophy GTA VI, tersimpan di localStorage.
// Semua data dibaca dari data/trophies.json (file lokal); app tidak memanggil network.
const KEY = 'gta6-trophy-checklist-v1';
const SETTINGS_KEY = 'gta6-trophy-settings-v1';
const EXOPHASE_URL = 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/';
const PSNPROFILES_URL = 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi';
const SOURCE_NAMES = { exophase: 'Exophase — daftar trophy resmi GTA VI', psn: 'PSNProfiles — daftar trophy resmi GTA VI' };

// Demo untuk screenshot: ?demo=1 menandai 13 trophy awal sebagai didapat (hanya bila belum ada progres).
const DEMO_EARNED = ['Just Like Paradise', 'Paradise Lost', 'Trust', 'Break the Bank', 'Master of None', 'Stick Fiddler', 'Baited My Tackle', 'Whip It Good', 'Treat Yo Self', 'On the Spot', 'Hot Together', 'In The Beginning…', 'Personal Best'];

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let settings = { spoiler: false };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')); } catch { /* abaikan settings rusak */ }
if (params.get('demo') === '1' && earned.size === 0) {
  earned = new Set(DEMO_EARNED);
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}
if (params.get('spoiler') === '1') settings.spoiler = true;
let selected = null;
let trophies = [];

function saveProgress() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
  updateProgress();
}
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
function trophyById(id) { return trophies.find((t) => String(t.id) === String(id)); }
function isHidden(t) { return t.hidden === true; }
function isSpoilerMasked(t) {
  return settings.spoiler && isHidden(t) && !earned.has(t.name) && t.kind !== 'platinum';
}
function kindLabel(kind) {
  return { story: 'Story', mission: 'Misi cerita', activity: 'Aktivitas', collectible: 'Koleksi', combat: 'Combat', exploration: 'Eksplorasi', economy: 'Ekonomi', completion: '100% Completion', platinum: 'Platinum', misc: 'Lainnya' }[kind] ?? kind;
}
function matchesFilters(t) {
  const q = $('search').value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.guide ?? '').toLowerCase().includes(q))) return false;
  if ($('grade').value !== 'all' && t.grade !== $('grade').value) return false;
  if ($('kind').value !== 'all' && t.kind !== $('kind').value) return false;
  if ($('missableOnly').checked && !t.missable) return false;
  if ($('earnedOnly').checked && !earned.has(t.name)) return false;
  return true;
}
function updateProgress() {
  const total = trophies.length || 55;
  const n = earned.size;
  $('earnedCount').textContent = String(n);
  $('progressLabel').textContent = `${Math.round((n / total) * 100)}% menuju platinum`;
  $('progressFill').style.width = `${(n / total) * 100}%`;
  $('progressBar').setAttribute('aria-valuenow', String(n));
  const byGrade = (g) => trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
  const totals = (g) => trophies.filter((t) => t.grade === g).length;
  $('gradeCounts').textContent = `Platinum ${byGrade('platinum')}/${totals('platinum')} · Gold ${byGrade('gold')}/${totals('gold')} · Silver ${byGrade('silver')}/${totals('silver')} · Bronze ${byGrade('bronze')}/${totals('bronze')}`;
  document.title = n > 0 ? `(${n}/55) Tracker Trophy Leonida — GTA VI` : 'Panduan Trophy GTA VI — Tracker Leonida';
}
function renderList() {
  const list = $('rows');
  list.replaceChildren();
  const shown = trophies.filter(matchesFilters);
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy-card' + (earned.has(t.name) ? ' earned' : '') + (selected === t.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Tandai ${t.name} sudah didapat`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      saveProgress();
      renderList();
      renderMissable();
      if (selected === t.id) renderDetail();
    });
    const body = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = isSpoilerMasked(t) ? 'Trophy cerita tersembunyi' : t.name;
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = isSpoilerMasked(t) ? 'Nama dan deskripsi disembunyikan oleh mode spoiler sampai trophy ini didapat.' : t.description;
    const meta = document.createElement('p');
    meta.className = 'meta';
    const kind = document.createElement('span');
    kind.textContent = kindLabel(t.kind);
    meta.append(kind);
    if (t.target) {
      const target = document.createElement('span');
      target.textContent = `Target: ${t.target.toLocaleString('id-ID')} ${t.targetUnit ?? ''}`.trim();
      meta.append(target);
    }
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag';
      flag.textContent = 'MISSABLE';
      meta.append(flag);
    }
    if (isHidden(t)) {
      const flag = document.createElement('span');
      flag.className = 'flag hidden-flag';
      flag.textContent = 'HIDDEN';
      meta.append(flag);
    }
    body.append(h, desc, meta);
    const grade = document.createElement('span');
    grade.className = `grade ${t.grade}`;
    grade.textContent = t.grade;
    li.append(box, body, grade);
    li.addEventListener('click', (event) => {
      if (event.target === box) return;
      selected = t.id;
      renderDetail();
      renderList();
    });
    list.append(li);
  }
  $('resultCount').textContent = `Menampilkan ${shown.length} dari ${trophies.length} trophy · ${earned.size} sudah didapat`;
}
function renderDetail() {
  const pane = $('detail');
  const t = selected == null ? null : trophyById(selected);
  pane.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'Pilih salah satu trophy di daftar untuk membaca panduannya, sumbernya, dan kapan trophy itu bisa terlewat.';
    pane.append(p);
    return;
  }
  const masked = isSpoilerMasked(t);
  const title = document.createElement('h2');
  title.textContent = masked ? 'Trophy cerita tersembunyi' : t.name;
  const grade = document.createElement('span');
  grade.className = `grade ${t.grade}`;
  grade.textContent = t.grade;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = masked ? 'Detail disembunyikan oleh mode spoiler.' : `“${t.description}”`;
  const flags = document.createElement('div');
  flags.className = 'flags';
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = kindLabel(t.kind);
  flags.append(kind);
  if (t.missable) {
    const f = document.createElement('span');
    f.className = 'flag';
    f.textContent = 'MISSABLE — perhatikan saat momennya tiba';
    flags.append(f);
  }
  if (isHidden(t)) {
    const f = document.createElement('span');
    f.className = 'flag hidden-flag';
    f.textContent = 'HIDDEN di PlayStation';
    flags.append(f);
  }
  const earnedState = document.createElement('p');
  earnedState.textContent = earned.has(t.name) ? 'Status: sudah didapat.' : 'Status: belum didapat.';
  const guideTitle = document.createElement('h4');
  guideTitle.textContent = 'Panduan';
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = masked ? 'Selesaikan trophy ini untuk membuka panduannya.' : t.guide;
  const srcTitle = document.createElement('h4');
  srcTitle.textContent = 'Sumber';
  const srcList = document.createElement('ul');
  srcList.className = 'sources';
  const srcItems = [
    { label: SOURCE_NAMES.exophase, url: EXOPHASE_URL },
    { label: SOURCE_NAMES.psn, url: PSNPROFILES_URL },
  ];
  for (const s of srcItems) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    li.append(a, document.createTextNode(' — nama, deskripsi, dan grade resmi.'));
    srcList.append(li);
  }
  const own = document.createElement('li');
  own.textContent = 'Panduan di atas ditulis dengan kata-kata sendiri dari deskripsi resmi; langkah spesifik yang belum terverifikasi di dalam game dinyatakan apa adanya di panduan.';
  srcList.append(own);
  pane.append(title, grade, desc, flags, earnedState, guideTitle, guide, srcTitle, srcList);
}
function renderMissable() {
  const list = $('missableList');
  list.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const li = document.createElement('li');
    li.className = 'trophy-card' + (earned.has(t.name) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Tandai ${t.name} sudah didapat`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      saveProgress();
      renderList();
      renderMissable();
    });
    const body = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = isSpoilerMasked(t) ? 'Trophy cerita tersembunyi' : t.name;
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = isSpoilerMasked(t) ? 'Disembunyikan oleh mode spoiler.' : t.description;
    body.append(h, desc);
    const grade = document.createElement('span');
    grade.className = `grade ${t.grade}`;
    grade.textContent = t.grade;
    li.append(box, body, grade);
    list.append(li);
  }
  $('missableCount').textContent = String(trophies.filter((x) => x.missable).length);
}
function showView(view) {
  for (const v of ['tracker', 'roadmap', 'missable']) {
    $('view' + v[0].toUpperCase() + v.slice(1)).classList.toggle('hidden', v !== view);
    $('tab' + v[0].toUpperCase() + v.slice(1)).classList.toggle('active', v === view);
  }
}
function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
async function importProgress(file) {
  if (!file) return;
  const data = JSON.parse(await file.text());
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) throw new Error('File import tidak dikenali: harus berisi daftar nama trophy.');
  const known = new Set(trophies.map((t) => t.name));
  earned = new Set(names.filter((n) => known.has(n)));
  saveProgress();
  renderList();
  renderMissable();
  renderDetail();
}

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
$('spoiler').checked = settings.spoiler;
// Deep-link filter dari URL (berguna untuk screenshot dan berbagi tampilan): ?grade= & ?kind=.
if (params.get('grade') && [...$('grade').options].some((o) => o.value === params.get('grade'))) $('grade').value = params.get('grade');
if (params.get('kind') && [...$('kind').options].some((o) => o.value === params.get('kind'))) $('kind').value = params.get('kind');
$('search').addEventListener('input', renderList);
$('grade').addEventListener('change', renderList);
$('kind').addEventListener('change', renderList);
$('missableOnly').addEventListener('change', renderList);
$('earnedOnly').addEventListener('change', renderList);
$('spoiler').addEventListener('change', () => {
  settings.spoiler = $('spoiler').checked;
  saveSettings();
  renderList();
  renderMissable();
  renderDetail();
});
$('export').addEventListener('click', exportProgress);
$('import').addEventListener('change', async (event) => {
  try { await importProgress(event.target.files[0]); }
  catch (error) { alert(`Import gagal: ${error.message}`); }
  event.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (!confirm('Hapus semua progres yang ditandai?')) return;
  earned = new Set();
  saveProgress();
  renderList();
  renderMissable();
  renderDetail();
});
for (const button of document.querySelectorAll('#tabs .tab')) {
  button.addEventListener('click', () => showView(button.dataset.view));
}
const sourceLinks = $('sourceLinks');
sourceLinks.replaceChildren();
const exoLink = document.createElement('a');
exoLink.href = EXOPHASE_URL;
exoLink.target = '_blank';
exoLink.rel = 'noopener';
exoLink.textContent = 'Exophase';
const psnLink = document.createElement('a');
psnLink.href = PSNPROFILES_URL;
psnLink.target = '_blank';
psnLink.rel = 'noopener';
psnLink.textContent = 'PSNProfiles';
sourceLinks.append(exoLink, document.createTextNode(' dan '), psnLink, document.createTextNode('.'));
if (params.get('trophy')) {
  const t = trophyById(params.get('trophy'));
  if (t) selected = t.id;
}
showView(params.get('view') === 'roadmap' ? 'roadmap' : params.get('view') === 'missable' ? 'missable' : 'tracker');
updateProgress();
renderList();
renderMissable();
renderDetail();
