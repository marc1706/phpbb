#!/usr/bin/env node

const { spawnSync } = require('child_process');

// Build CSS: phpBB/styles/neptune/theme/main.css -> stylesheet.css
const input = 'phpBB/styles/neptune/theme/main.css';
const output = 'phpBB/styles/neptune/theme/stylesheet.css';

const res = spawnSync('postcss', [ input, '-o', output, '--map' ], { stdio: 'inherit', shell: true, env: process.env });
process.exit(res.status === null ? 1 : res.status);

