const { execSync } = require('child_process');

const dependencies = [
    'express-mongo-sanitize',
    'xss-clean', 
    'hpp',
    'winston',
    'express-validator',
    'bcryptjs',
    'jsonwebtoken',
    'multer'
];

console.log('Installing missing dependencies...');

dependencies.forEach(dep => {
    try {
        console.log(`Installing ${dep}...`);
        execSync(`npm install ${dep}`, { stdio: 'inherit' });
        console.log(`✅ ${dep} installed`);
    } catch (error) {
        console.error(`❌ Failed to install ${dep}:`, error.message);
    }
});

console.log('Done!');