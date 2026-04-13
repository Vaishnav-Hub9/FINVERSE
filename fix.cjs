const fs = require('fs');
let data = fs.readFileSync('src/App.jsx', 'utf8');
data = data.replace(/\\\`/g, '`');
data = data.replace(/\\\$/g, '$');
fs.writeFileSync('src/App.jsx', data);
console.log('Fixed escape sequences');
