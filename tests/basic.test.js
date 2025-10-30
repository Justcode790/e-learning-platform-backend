import http from 'http';

// Minimal smoke test guidance (run with: npm start, then node tests/basic.test.js)
const req = http.request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' }, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Health response:', data);
    process.exit(0);
  });
});
req.on('error', (e) => {
  console.error('Health check failed:', e.message);
  process.exit(1);
});
req.end();

// Basic sanity test placeholder; configure your preferred test runner (Jest/Vitest/Mocha)
function add(a, b) { return a + b; }

module.exports = { add };


