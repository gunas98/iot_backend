const os = require('node:os');

console.log(os.networkInterfaces().networkInterfaces);
console.log(os.networkInterfaces().WiFi.length);
console.log(os.networkInterfaces().WiFi.at(1));