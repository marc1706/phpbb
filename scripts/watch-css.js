#!/usr/bin/env node

const { spawn } = require('child_process');

// Watch CSS: watch source main.css and output stylesheet.css
const input = 'phpBB/styles/chameleon/theme/main.css';
const output = 'phpBB/styles/chameleon/theme/stylesheet.css';

const ps = spawn('postcss', [ input, '-o', output, '--watch', '--map' ], { stdio: 'inherit', shell: true, env: process.env });

ps.on('close', (code) => process.exit(code));
ps.on('error', (err) => {
	console.error(err);
	process.exit(1);
});

