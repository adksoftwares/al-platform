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
  assert.match(user.isAdmin['.validate'], /auth\.token\.admin == true/);
  assert.match(user.isPremium['.validate'], /auth\.token\.admin == true/);
  assert.match(user.premiumExpiry['.validate'], /auth\.token\.admin == true/);
  assert.match(user.freeDownloadsCount['.validate'], /auth\.token\.admin == true/);
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
