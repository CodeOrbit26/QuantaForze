import { execSync } from 'child_process';

console.log('⚡ Starting development server for QuantaForze Web...');
execSync('npx vite', { stdio: 'inherit' });
