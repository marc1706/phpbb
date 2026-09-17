#!/usr/bin/env node

const { spawnSync } = require('child_process');

// Minify CSS: run postcss with MINIFY=1 on stylesheet.css -> stylesheet.min.css
const input = 'phpBB/styles/neptune/theme/stylesheet.css';
const output = 'phpBB/styles/neptune/theme/stylesheet.min.css';

const env = { ...process.env, MINIFY: '1' };
const res = spawnSync('postcss', [ input, '-o', output, '--map' ], { stdio: 'inherit', shell: true, env });
process.exit(res.status === null ? 1 : res.status);
