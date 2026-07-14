const fs = require('fs');
const idx = fs.readFileSync('index.html','utf8');
const ano = fs.readFileSync('anomali.html','utf8');

console.log('=== index.html (Progress page) ===');
console.log('Fetches progress data:', idx.includes('fetchStandardCSV(urls.progress)'));
console.log('Does NOT fetch anomali kel:', !idx.includes('fetchBPSCSV(urls.anoKel)'));
console.log('Does NOT fetch anomali usa:', !idx.includes('fetchBPSCSV(urls.anoUsaha)'));
console.log('Has nav link to anomali.html:', idx.includes('href="anomali.html"'));
console.log('Title is Progress:', idx.includes('Dashboard Progress'));
console.log('Has </html>:', idx.includes('</html>'));

console.log('\n=== anomali.html (Anomali page) ===');
console.log('Fetches anomali kel:', ano.includes('fetchBPSCSV(urls.anoKel)'));
console.log('Fetches anomali usa:', ano.includes('fetchBPSCSV(urls.anoUsaha)'));
console.log('Does NOT fetch progress:', !ano.includes('fetchStandardCSV(urls.progress)'));
console.log('Has nav link to index.html:', ano.includes('href="index.html"'));
console.log('Title is Anomali:', ano.includes('Monitoring Anomali'));
console.log('Has </html>:', ano.includes('</html>'));

// Check that view-anomali is NOT hidden in anomali.html
console.log('\nAnomali page view-anomali starts hidden?', ano.includes('<main id="view-anomali" class="hidden'));
console.log('Anomali page view-anomali NOT hidden (correct):', ano.includes('<main id="view-anomali" class="max-w'));

// Check that view-progress is visible in index.html
console.log('\nProgress page view-progress NOT hidden:', idx.includes('<main id="view-progress" class="max-w'));
console.log('Progress page view-progress hidden?', idx.includes('<main id="view-progress" class="hidden'));

// Check emptyState is present
console.log('\nindex.html has emptyState:', idx.includes('id="emptyState"'));
console.log('anomali.html has emptyState:', ano.includes('id="emptyState"'));

// Check anomali-specific DOM elements
const anomaliSpecific = ['filterAKec', 'filterADesa', 'tableBodyAnomali', 'kAnomaliTotal'];
console.log('\nAnomali-specific DOM elements in anomali.html:');
anomaliSpecific.forEach(id => {
  console.log('  ' + id + ':', ano.includes('id="' + id + '"'));
});

console.log('\nProgress-specific DOM elements in index.html:');
const progressSpecific = ['tableBodyProgress', 'kTarget', 'kProgress', 'mainChart', 'kecTabs'];
progressSpecific.forEach(id => {
  console.log('  ' + id + ':', idx.includes('id="' + id + '"'));
});
