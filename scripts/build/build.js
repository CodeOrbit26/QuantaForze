import { execSync } from 'child_process';

console.log('🚀 Starting production build for QuantaForze Web...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully into dist/');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
