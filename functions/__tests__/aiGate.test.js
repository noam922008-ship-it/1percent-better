'use strict';

// AI callables must not be exported (= deployed) unless ENABLE_AI_FUNCTIONS=true.
// index.js is loaded in a plain Node process (as the Firebase CLI does when it analyses
// the code before a deploy) — jest's module loader can't load firebase-admin's ESM deps.
const { execFileSync } = require('child_process');
const path = require('path');

const ACTIVE = ['broadcastUpdate', 'dailyStats', 'igAutoDm', 'localScheduler', 'sendTestNotification'];

function exportedNames(flag) {
  const env = { ...process.env };
  delete env.ENABLE_AI_FUNCTIONS;
  if (flag !== undefined) env.ENABLE_AI_FUNCTIONS = flag;
  const out = execFileSync(process.execPath,
    ['-e', "process.stdout.write(JSON.stringify(Object.keys(require('./index')).sort()))"],
    { cwd: path.join(__dirname, '..'), env, encoding: 'utf8' });
  return JSON.parse(out);
}

describe('AI functions are opt-in for deploy', () => {
  it('without the flag only the active functions are exported', () => {
    expect(exportedNames(undefined)).toEqual(ACTIVE);
  });

  it('any value other than "true" keeps them out', () => {
    for (const v of ['false', '1', 'TRUE', '']) expect(exportedNames(v)).toEqual(ACTIVE);
  });

  it('with ENABLE_AI_FUNCTIONS=true they are exported next to the active ones', () => {
    expect(exportedNames('true')).toEqual([...ACTIVE, 'analyzeBoxingSession', 'analyzeWithGemini'].sort());
  });
});
