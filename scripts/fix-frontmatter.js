const fs = require('fs');
const path = require('path');

const blogDir = path.join(process.cwd(), 'content/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

let fixedCount = 0;

files.forEach(file => {
  const fullPath = path.join(blogDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace curly quotes with straight quotes in frontmatter
  const lines = content.split('\n');
  let inFrontmatter = false;
  let modified = false;

  const fixedLines = lines.map(line => {
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter;
      return line;
    }

    if (inFrontmatter) {
      const originalLine = line;
      // Replace " and " with "
      line = line.replace(/[""]/g, '"');
      // Replace ' and ' with '
      line = line.replace(/['']/g, "'");

      if (line !== originalLine) {
        modified = true;
      }
    }

    return line;
  });

  if (modified) {
    fs.writeFileSync(fullPath, fixedLines.join('\n'), 'utf8');
    console.log(`✅ Fixed: ${file}`);
    fixedCount++;
  }
});

console.log(`\n🔧 Fixed ${fixedCount} files`);