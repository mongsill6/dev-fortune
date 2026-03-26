import { execFile } from 'child_process';
import { describe, test, expect } from '@jest/globals';

function run(...args) {
  return new Promise((resolve, reject) => {
    execFile('node', ['/tmp/dev-fortune/bin/dev-fortune', ...args], { timeout: 10000 }, (err, stdout, stderr) => {
      resolve({ code: err?.code || 0, stdout, stderr });
    });
  });
}

describe('dev-fortune CLI', () => {
  test('default command outputs something (not empty)', async () => {
    const { code, stdout } = await run();
    expect(stdout.trim()).not.toBe('');
  }, 15000);

  test('`random` command outputs something', async () => {
    const { code, stdout } = await run('random');
    expect(stdout.trim()).not.toBe('');
  }, 15000);

  test('`random --style minimal` outputs plain format (no box chars)', async () => {
    const { code, stdout } = await run('random', '--style', 'minimal');
    expect(stdout).not.toMatch(/[┌┐└┘│─╔╗╚╝║═╭╮╰╯]/);
    expect(stdout.trim()).not.toBe('');
  }, 15000);

  test('`random --lang en` works', async () => {
    const { code, stdout } = await run('random', '--lang', 'en');
    expect(code).toBe(0);
    expect(stdout.trim()).not.toBe('');
  }, 15000);

  test('`list` outputs multiple lines', async () => {
    const { code, stdout } = await run('list');
    const lines = stdout.trim().split('\n').filter(l => l.trim() !== '');
    expect(lines.length).toBeGreaterThan(1);
  }, 15000);

  test('`list --style minimal` outputs numbered list', async () => {
    const { code, stdout } = await run('list', '--style', 'minimal');
    expect(stdout).toMatch(/\d+[.)]/);
  }, 15000);

  test('`search code` finds results', async () => {
    const { code, stdout } = await run('search', 'code');
    expect(stdout.trim()).not.toBe('');
    expect(stdout.toLowerCase()).not.toMatch(/no.*result|not found|0 result/i);
  }, 15000);

  test('`search xyznonexistent` shows no results message', async () => {
    const { code, stdout, stderr } = await run('search', 'xyznonexistent');
    const combined = (stdout + stderr).toLowerCase();
    expect(combined).toMatch(/no quotes found|no.*result|not found|0 result|없|found 0/i);
  }, 15000);

  test('`categories` lists category names', async () => {
    const { code, stdout } = await run('categories');
    expect(code).toBe(0);
    const lines = stdout.trim().split('\n').filter(l => l.trim() !== '');
    expect(lines.length).toBeGreaterThan(0);
  }, 15000);

  test('`languages` lists en, ko, ja', async () => {
    const { code, stdout } = await run('languages');
    expect(code).toBe(0);
    expect(stdout).toMatch(/en/);
    expect(stdout).toMatch(/ko/);
    expect(stdout).toMatch(/ja/);
  }, 15000);

  test('`--version` shows version', async () => {
    const { code, stdout, stderr } = await run('--version');
    const combined = stdout + stderr;
    expect(combined).toMatch(/\d+\.\d+\.\d+/);
  }, 15000);

  test('`--help` shows help text', async () => {
    const { code, stdout, stderr } = await run('--help');
    const combined = stdout + stderr;
    expect(combined.toLowerCase()).toMatch(/usage|help|command|option/i);
  }, 15000);
});
