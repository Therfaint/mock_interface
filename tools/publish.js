/**
 * Created by therfaint- on 15/11/2018.
 */
const { spawn } = require('child_process');
const path = require('path');

const fromPath = path.resolve(__dirname, '../README.md');

const ls = spawn('scp', [fromPath, 'admin@10.57.17.239:express']);

ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});
