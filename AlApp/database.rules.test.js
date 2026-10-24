const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const rulesDocument = JSON.parse(fs.readFileSync(new URL('./database.rules.json', `file://${__filename}`), 'utf8'));
const rules = rulesDocument.rules;

test('database is closed by default and has no email-based admin shortcut', () => {
  assert.equal(rules['.read'], false);
  assert.equal(rules['.write'], false);
  assert.doesNotMatch(JSON.stringify(rules), /auth\.token\.email|child\('isAdmin'\)\.val\(\) == true/);
});

test('premium entitlements and download quotas cannot be client-modified', () => {
  const user = rules.users.$uid;
  for (const field of ['isAdmin', 'isPremium', 'premiumExpiry', 'premiumValidUntil', 'freeDownloadsCount', 'password']) {
    assert.doesNotMatch(user[field]['.validate'], /auth\.token\.admin/);
  }
  assert.match(user.isPremium['.validate'], /newData\.val\(\) == false/);
  assert.match(user.freeDownloadsCount['.validate'], /newData\.val\(\) == 0/);
  assert.match(user.password['.validate'], /!newData\.exists\(\)/);
});

test('premium codes are not readable by ordinary clients', () => {
  assert.equal(rules.admin_settings.premium_codes['.read'], false);
  assert.match(rules.admin_settings.premium_codes['.write'], /auth\.token\.admin == true/);
});

test('restricted study files do not inherit a broad authenticated read grant', () => {
  assert.equal(Object.hasOwn(rules.files, '.read'), false);
  assert.match(rules.files.$subject['past papers']['.read'], /isPremium/);
  assert.match(rules.files.$subject.Notes['.read'], /isPremium/);
});

test('signed-in students can check app updates but only trusted admins can publish them', () => {
  assert.equal(rules.admin_settings.app_version['.read'], 'auth != null');
  assert.match(rules.admin_settings.app_version['.write'], /auth\.token\.admin == true/);
});
