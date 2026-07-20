const fs = require('fs');

const src = fs.readFileSync('index.html', 'utf8');

// ─── Verify source ──────────────────────────────────────────────────────────
if (src.split('\n').length < 3300) {
  console.error('ERROR: index.html seems incomplete (' + src.split('\n').length + ' lines). Aborting.');
  process.exit(1);
}

// ─── Locate HTML section boundaries ────────────────────────────────────────
const M_PROGRESS_VIEW = '<!-- ========== VIEW: DASHBOARD PROGRESS ========== -->';
const M_ANOMALI_VIEW  = '<!-- ========== VIEW: MONITORING ANOMALI ========== -->';
const M_FOOTER        = '<footer';
const M_SETUP         = '<!-- ========== SETUP PANEL ========== -->';
const M_EMPTY         = '<!-- ========== EMPTY STATE ========== -->';
const M_MAIN_NAV      = '<!-- MAIN NAVIGATION TABS -->';

const posNav           = src.indexOf(M_MAIN_NAV);
const posSetup         = src.indexOf(M_SETUP);
const posEmpty         = src.indexOf(M_EMPTY);
const posProgressView  = src.indexOf(M_PROGRESS_VIEW);
const posAnomaliView   = src.indexOf(M_ANOMALI_VIEW);
const posFooter        = src.indexOf(M_FOOTER);

console.log('Markers found at:');
console.log('  M_MAIN_NAV:', posNav);
console.log('  M_SETUP:', posSetup);
console.log('  M_EMPTY:', posEmpty);
console.log('  M_PROGRESS_VIEW:', posProgressView);
console.log('  M_ANOMALI_VIEW:', posAnomaliView);
console.log('  M_FOOTER:', posFooter);

if ([posNav,posSetup,posEmpty,posProgressView,posAnomaliView,posFooter].includes(-1)) {
  console.error('ERROR: Some markers not found.');
  process.exit(1);
}

// ─── Extract sections ──────────────────────────────────────────────────────
// Everything before nav tabs (head + header up to nav)
const beforeNav        = src.slice(0, posNav);
// Setup + empty state (shared)
const setupAndEmpty    = src.slice(posSetup, posProgressView);
// Dashboard Progress view
const progressView     = src.slice(posProgressView, posAnomaliView);
// Monitoring Anomali view
const anomaliView      = src.slice(posAnomaliView, posFooter);
// Footer + all scripts
const footerAndScripts = src.slice(posFooter);

// ─── Nav HTML templates ─────────────────────────────────────────────────────
const navForProgress = `      ${M_MAIN_NAV}
      <div class="flex gap-6 mt-1">
        <a href="index.html"
          class="nav-tab-active pb-3 text-sm transition-colors flex items-center gap-2">
          <i class="fa-solid fa-bars-progress"></i> Dashboard Progress
        </a>
        <a href="anomali.html"
          class="nav-tab-inactive pb-3 text-sm transition-colors flex items-center gap-2 relative">
          <i class="fa-solid fa-triangle-exclamation"></i> Monitoring Anomali
        </a>
      </div>
    </div>
  </header>`;

const navForAnomali = `      ${M_MAIN_NAV}
      <div class="flex gap-6 mt-1">
        <a href="index.html"
          class="nav-tab-inactive pb-3 text-sm transition-colors flex items-center gap-2">
          <i class="fa-solid fa-bars-progress"></i> Dashboard Progress
        </a>
        <a href="anomali.html"
          class="nav-tab-active pb-3 text-sm transition-colors flex items-center gap-2 relative">
          <i class="fa-solid fa-triangle-exclamation"></i> Monitoring Anomali
        </a>
      </div>
    </div>
  </header>`;

// ─── JS modifications ──────────────────────────────────────────────────────
// We need to modify the footerAndScripts for each page.
// Key changes:
// 1. Progress page: don't fetch anomali, don't call anomali render functions
// 2. Anomali page: don't fetch progress, don't call progress render functions
// Strategy: patch fetchDataAll and the "after fetch" calls

function makeScriptsForProgress(scripts) {
  let s = scripts;

  // 1. Remove anomali fetch blocks  
  s = s.replace(
    /\/\/ 2\. Fetch Anomali Keluarga \(Smart Cleanup BPS\)[\s\S]*?\/\/ 3\. Fetch Anomali Usaha \(Smart Cleanup BPS\)[\s\S]*?\}\),\s*\}\)/,
    '// Anomali data not loaded on Progress page'
  );

  // 2. Remove anomali post-fetch calls
  // Replace the block that calls anomali-related things
  s = s.replace(
    /updateBadgeAnomali\(\);[\s\S]*?\/\/ Re-apply filters\s*applyFiltersAnomali\(null\);/,
    '// (Anomali render skipped on Progress page)'
  );

  // 3. Fix the "show view" logic - only show progress view
  s = s.replace(
    /\/\/ Only force default view tab visibility[\s\S]*?viewProg\.classList\.remove\("hidden"\);\s*\}/,
    `// Show progress view on load
      document.getElementById("view-progress").classList.remove("hidden");`
  );

  // 4. The switchMainTab function is no longer needed but keep a stub to avoid errors
  s = s.replace(
    /function switchMainTab\(tabId\) \{[\s\S]*?\n    \}/,
    `function switchMainTab(tabId) {
      // Navigation handled by <a> links between pages
    }`
  );

  return s;
}

function makeScriptsForAnomali(scripts) {
  let s = scripts;

  // 1. Remove progress fetch block
  s = s.replace(
    /\/\/ 1\. Fetch Progress \(Standard\)\s*if \(urls\.progress\) \{[\s\S]*?\}\),\s*\}/,
    '// Progress data not loaded on Anomali page'
  );

  // 2. Remove progress post-fetch calls
  s = s.replace(
    /buildKecTabsProgress\(\);\s*applyFiltersProgress\(\);\s*applyFiltersRealisasi\(\);/,
    '// (Progress render skipped on Anomali page)'
  );

  // 3. Fix the "show view" logic - only show anomali view
  s = s.replace(
    /\/\/ Only force default view tab visibility[\s\S]*?viewProg\.classList\.remove\("hidden"\);\s*\}/,
    `// Show anomali view on load
      document.getElementById("view-anomali").classList.remove("hidden");`
  );

  // 4. The switchMainTab function is no longer needed but keep a stub
  s = s.replace(
    /function switchMainTab\(tabId\) \{[\s\S]*?\n    \}/,
    `function switchMainTab(tabId) {
      // Navigation handled by <a> links between pages
    }`
  );

  return s;
}

// ─── Build Progress page ────────────────────────────────────────────────────
let progressPage = [
  beforeNav,
  navForProgress,
  '\n\n',
  setupAndEmpty,
  '\n',
  progressView,
  '\n',
  makeScriptsForProgress(footerAndScripts)
].join('');

// Update title
progressPage = progressPage.replace(
  '<title>Monitoring Terpadu FASIH &amp; Anomali SE2026</title>',
  '<title>Dashboard Progress FASIH SE2026</title>'
);
progressPage = progressPage.replace(
  '<title>Monitoring Terpadu FASIH & Anomali SE2026</title>',
  '<title>Dashboard Progress FASIH SE2026</title>'
);

// ─── Build Anomali page ─────────────────────────────────────────────────────
// Make view-anomali NOT hidden by default in HTML
const anomaliViewVisible = anomaliView.replace(
  '<main id="view-anomali" class="hidden ',
  '<main id="view-anomali" class="'
);

let anomaliPage = [
  beforeNav,
  navForAnomali,
  '\n\n',
  setupAndEmpty,
  '\n',
  anomaliViewVisible,
  '\n',
  makeScriptsForAnomali(footerAndScripts)
].join('');

// Update title
anomaliPage = anomaliPage.replace(
  '<title>Monitoring Terpadu FASIH &amp; Anomali SE2026</title>',
  '<title>Monitoring Anomali SE2026</title>'
);
anomaliPage = anomaliPage.replace(
  '<title>Monitoring Terpadu FASIH & Anomali SE2026</title>',
  '<title>Monitoring Anomali SE2026</title>'
);

// ─── Write output files ─────────────────────────────────────────────────────
fs.writeFileSync('index.html', progressPage, 'utf8');
fs.writeFileSync('anomali.html', anomaliPage, 'utf8');

// ─── Final checks ───────────────────────────────────────────────────────────
function checkPage(name, content, checks) {
  console.log('\n=== ' + name + ' (' + content.split('\n').length + ' lines) ===');
  checks.forEach(([label, fn, expected]) => {
    const result = fn(content);
    const ok = result === expected;
    console.log((ok ? '  ✓' : '  ✗') + ' ' + label + ': ' + result + (ok ? '' : ' (expected ' + expected + ')'));
  });
}

checkPage('index.html', progressPage, [
  ['Has <html>', c => c.includes('<html'), true],
  ['Has </html>', c => c.includes('</html>'), true],
  ['Has view-progress HTML element', c => c.includes('id="view-progress"'), true],
  ['No view-anomali HTML element', c => !c.includes('id="view-anomali"'), true],
  ['Fetches progress data', c => c.includes('fetchStandardCSV(urls.progress)'), true],
  ['Does NOT fetch anomali', c => !c.includes('fetchBPSCSV(urls.anoKel)'), true],
  ['Has link to anomali.html', c => c.includes('href="anomali.html"'), true],
  ['Title updated', c => c.includes('Dashboard Progress'), true],
]);

checkPage('anomali.html', anomaliPage, [
  ['Has <html>', c => c.includes('<html'), true],
  ['Has </html>', c => c.includes('</html>'), true],
  ['Has view-anomali HTML element', c => c.includes('id="view-anomali"'), true],
  ['No view-progress HTML element', c => !c.includes('id="view-progress"'), true],
  ['Fetches anomali data', c => c.includes('fetchBPSCSV(urls.anoKel)'), true],
  ['Does NOT fetch progress', c => !c.includes('fetchStandardCSV(urls.progress)'), true],
  ['Has link to index.html', c => c.includes('href="index.html"'), true],
  ['Title updated', c => c.includes('Monitoring Anomali'), true],
]);

console.log('\nDone!');
