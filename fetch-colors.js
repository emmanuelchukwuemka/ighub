const https = require('https');
https.get('https://ighub.ng/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const hexRegex = /#[0-9a-fA-F]{3,6}\b/g;
    const colors = data.match(hexRegex) || [];
    const uniqueColors = [...new Set(colors.map(c => c.toLowerCase()))];
    console.log("Found Colors:", uniqueColors);
  });
}).on('error', (e) => {
  console.error(e);
});
