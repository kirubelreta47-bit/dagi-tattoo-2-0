const http = require('http');
const urls = ['http://localhost:3000', 'http://localhost:3000/admin'];
for (const url of urls) {
  http.get(url, (res) => {
    console.log(`${url} => ${res.statusCode}`);
    res.resume();
  }).on('error', (err) => console.log(`${url} => FAIL:${err.message}`));
}
const checkAdmin = () => new Promise((resolve) => {
  const req = http.request('http://localhost:3001/api/admin/check', { method: 'GET' }, (res) => {
    console.log('/api/admin/check => ' + res.statusCode);
    res.resume();
    resolve();
  });
  req.on('error', (err) => { console.log('/api/admin/check => FAIL:' + err.message); resolve(); });
  req.end();
});
const postBooking = () => new Promise((resolve) => {
  const data = JSON.stringify({ clientName: 'Test User', clientPhone: '+1234567890', date: '2026-07-01' });
  const req = http.request('http://localhost:3001/api/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
    console.log('POST /api/schedules => ' + res.statusCode);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => { console.log('POST body:', body); resolve(); });
  });
  req.on('error', (err) => { console.log('POST /api/schedules => FAIL:' + err.message); resolve(); });
  req.write(data);
  req.end();
});
(async () => { await checkAdmin(); await postBooking(); })();
