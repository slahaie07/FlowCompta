import fs from 'fs';

const content = fs.readFileSync('api/app.ts', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('sendSupremeEmail')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
