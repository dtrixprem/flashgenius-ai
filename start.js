const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FlashGenius AI...\n');
console.log('📊 Using MongoDB Atlas (cloud database)...\n');

// Start backend
console.log('🔧 Starting backend server...');
const backend = spawn('npm', ['run', 'dev:backend'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname)
});

// Start frontend after a short delay
setTimeout(() => {
  console.log('🎨 Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev:frontend'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname)
  });
}, 2000);

console.log('\n📝 Application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:3001');
console.log('\n⏳ Please wait for both servers to start...\n');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down FlashGenius AI...');
  process.exit(0);
});