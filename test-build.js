const { execSync } = require('child_process');

console.log('🔍 Testing TypeScript compilation...');

try {
  // Test backend compilation
  console.log('📦 Testing backend build...');
  execSync('cd backend && npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ Backend TypeScript compilation successful!');
  
  // Test frontend compilation
  console.log('📦 Testing frontend build...');
  execSync('cd frontend && npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ Frontend TypeScript compilation successful!');
  
  console.log('🎉 All TypeScript checks passed!');
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}