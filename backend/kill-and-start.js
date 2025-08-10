const { exec } = require('child_process');
const os = require('os');

const killPort = (port) => {
  return new Promise((resolve) => {
    let command;
    
    if (os.platform() === 'win32') {
      command = `netstat -ano | findstr :${port}`;
    } else {
      command = `lsof -ti:${port}`;
    }
    
    exec(command, (error, stdout) => {
      if (stdout) {
        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
          if (os.platform() === 'win32') {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) {
              exec(`taskkill /PID ${pid} /F`, () => {});
            }
          } else {
            const pid = line.trim();
            if (pid && !isNaN(pid)) {
              exec(`kill -9 ${pid}`, () => {});
            }
          }
        });
      }
      setTimeout(resolve, 1000);
    });
  });
};

const startServer = async () => {
  console.log('🔄 Killing processes on port 5000...');
  await killPort(5000);
  console.log('🚀 Starting server...');
  
  const { spawn } = require('child_process');
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
};

startServer();
