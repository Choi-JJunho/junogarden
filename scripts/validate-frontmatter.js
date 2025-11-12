const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(process.cwd(), 'content/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

let errorCount = 0;

files.forEach(file => {
  try {
    const fullPath = path.join(blogDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    matter(content);
  } catch (err) {
    console.log(`❌ ${file}`);
    console.log(`   ${err.message}`);
    errorCount++;
  }
});

console.log(`\n✅ Valid: ${files.length - errorCount}`);
console.log(`❌ Errors: ${errorCount}`);