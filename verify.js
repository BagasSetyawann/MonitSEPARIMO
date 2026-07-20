const fs = require('fs');

// Check index.html
const idx = fs.readFileSync('index.html', 'utf8');
console.log('=== index.html checks ===');
console.log('Has <html>:', idx.includes('<html'));
console.log('Has </html>:', idx.includes('</html>'));
console.log('Has view-progress:', idx.includes('view-progress'));
console.log('Has view-anomali (should be FALSE):', idx.includes('view-anomali'));
console.log('Has fetch progress:', idx.includes('fetchStandardCSV(urls.progress)'));
console.log('Has fetch anomali kel (should be FALSE):', idx.includes('fetchBPSCSV(urls.anoKel)'));
console.log('Has nav link to anomali.html:', idx.includes('href="anomali.html"'));
console.log('Lines:', idx.split('\n').length);

// Check anomali.html
const ano = fs.readFileSync('anomali.html', 'utf8');
console.log('\n=== anomali.html checks ===');
console.log('Has <html>:', ano.includes('<html'));
console.log('Has </html>:', ano.includes('</html>'));
console.log('Has view-anomali:', ano.includes('view-anomali'));
console.log('Has view-progress (should be FALSE):', ano.includes('view-progress'));
console.log('Has fetch anoKel:', ano.includes('fetchBPSCSV(urls.anoKel)'));
console.log('Has fetch progress (should be FALSE):', ano.includes('fetchStandardCSV(urls.progress)'));
console.log('Has nav link to index.html:', ano.includes('href="index.html"'));
console.log('Lines:', ano.split('\n').length);
