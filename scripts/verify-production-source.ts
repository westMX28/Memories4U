import { execFileSync } from 'node:child_process';

function git(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const branch = git(['branch', '--show-current']);
if (branch !== 'main') {
  fail(`Production deploys must run from main, not ${branch || 'detached HEAD'}.`);
}

git(['fetch', 'origin', 'main', '--prune']);

const status = git(['status', '--porcelain']);
if (status) {
  fail('Production deploys must run from a clean worktree.');
}

const head = git(['rev-parse', 'HEAD']);
const originMain = git(['rev-parse', 'origin/main']);
if (head !== originMain) {
  fail(`Production deploys must use origin/main. HEAD=${head} origin/main=${originMain}`);
}

console.log(`Production source verified: main at ${head}.`);
