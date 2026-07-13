const fs = require('fs');
const path = require('path');

const STYLE_PATH = path.join(__dirname, '../../public/css/style.css');

describe('style.css (Milestone 5)', () => {
  let css;

  beforeAll(() => {
    css = fs.readFileSync(STYLE_PATH, 'utf8');
  });

  test('defines shared layout classes', () => {
    expect(css).toMatch(/\.container/);
    expect(css).toMatch(/\.page-auth/);
    expect(css).toMatch(/\.page-dashboard/);
  });

  test('includes tablet and desktop media queries', () => {
    expect(css).toMatch(/@media\s*\(\s*min-width:\s*640px\s*\)/);
    expect(css).toMatch(/@media\s*\(\s*min-width:\s*1024px\s*\)/);
  });

  test('ensures touch-friendly minimum tap targets', () => {
    expect(css).toMatch(/--tap-target:\s*48px/);
    expect(css).toMatch(/min-height:\s*var\(--tap-target\)/);
    expect(css).toMatch(/min-width:\s*var\(--tap-target\)/);
  });

  test('styles forms and validation states', () => {
    expect(css).toMatch(/\.form-group/);
    expect(css).toMatch(/\.form-error/);
    expect(css).toMatch(/input:invalid/);
  });

  test('styles dashboard stat cards', () => {
    expect(css).toMatch(/\.stats-grid/);
    expect(css).toMatch(/\.stat-card/);
  });

  test('styles task list and button states', () => {
    expect(css).toMatch(/\.task-list/);
    expect(css).toMatch(/\.task-item/);
    expect(css).toMatch(/\.btn-primary/);
    expect(css).toMatch(/\.btn:hover/);
  });

  test('prevents horizontal scrolling on small screens', () => {
    expect(css).toMatch(/overflow-x:\s*hidden/);
  });
});
