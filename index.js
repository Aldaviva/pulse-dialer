var Dialer = require('./Dialer');

var dialer = new Dialer(7, 11, 13);

process.on('SIGINT', close);
process.on('SIGTERM', close);

function close() {
    dialer.close();
    process.exit(0);
}
