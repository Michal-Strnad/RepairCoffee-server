const fs = require('fs')
const path = require('path');

const currentDate = new Date().toISOString().slice(0,10);
const logFile = path.join(__dirname,`../log` ,`log_${currentDate}.log`);

function writeLog(message) {
    const timeStamp = new Date().toLocaleString('cs-CZ', {
        dateStyle: 'short',
        timeStyle: 'medium'
    });

    const logLine = `[${timeStamp}] ${message}\n`;

    fs.appendFile(logFile, logLine, (err) => {
        if (err) {
            console.error("Error with log recording - Aborting...")
        }
    })
}

module.exports = writeLog;