import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, '..', 'content', 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

let fixedCount = 0;

files.forEach(file => {
  const fullPath = path.join(blogDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // Replace curly quotes with straight quotes
  content = content.replace(/"/g, '"');
  content = content.replace(/"/g, '"');
  content = content.replace(/'/g, "'");
  content = content.replace(/'/g, "'");

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    fixedCount++;
  }
});

console.log(`\n🔧 Fixed ${fixedCount} files`);