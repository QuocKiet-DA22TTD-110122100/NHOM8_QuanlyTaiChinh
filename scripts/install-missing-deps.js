const { execSync } = require('child_process');

const missingDependencies = [
    'morgan',
    'compression', 
    'express-mongo-sanitize',
    'xss-clean',
    'hpp',
    'winston',
    'express-validator',
    'multer',
    'cookie-parser',
    'express-session',
    'connect-redis',
    'ioredis',
    'agenda',
    'node-cron',
    'sharp',
    'csv-parser',
    'csv-writer',
    'archiver',
    'unzipper',
    'qrcode',
    'speakeasy',
    'express-slow-down',
    'express-brute',
    'express-brute-redis',
    'joi',
    'lodash',
    'uuid',
    'crypto-js',
    'axios',
    'cheerio',
    'puppeteer'
];

console.log('🔧 Installing missing dependencies...');

missingDependencies.forEach(dep => {
    try {
        console.log(`📦 Installing ${dep}...`);
        execSync(`npm install ${dep}`, { stdio: 'inherit' });
        console.log(`✅ ${dep} installed successfully`);
    } catch (error) {
        console.error(`❌ Failed to install ${dep}:`, error.message);
    }
});

console.log('🎉 All dependencies installed!');