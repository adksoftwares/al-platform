import * as fs from 'fs';
import { autoFixNIETerms } from '../src/services/nieTerminologyMaster.ts';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a JSON file path');
  process.exit(1);
}

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixedContent = autoFixNIETerms(content);
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log('Applied NIE terminology corrections to ' + filePath);
} catch (e) {
  console.error('Failed to process ' + filePath, e);
  process.exit(1);
}
