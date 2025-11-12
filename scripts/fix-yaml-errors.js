const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(process.cwd(), 'content/blog');

function fixFrontmatter() {
  const files = fs.readdirSync(blogDir);
  let fixed = 0;
  let skipped = 0;

  files.forEach(fileName => {
    if (!fileName.endsWith('.md')) return;

    try {
      const filePath = path.join(blogDir, fileName);
      const content = fs.readFileSync(filePath, 'utf8');

      // Try to parse
      matter(content);
      console.log(`✓ ${fileName}`);
    } catch (error) {
      console.log(`\n❌ Error in: ${fileName}`);
      console.log(`   ${error.message}\n`);

      try {
        const filePath = path.join(blogDir, fileName);
        const content = fs.readFileSync(filePath, 'utf8');

        // Extract frontmatter manually
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

        if (fmMatch) {
          const [, frontmatterRaw, bodyContent] = fmMatch;

          // Parse frontmatter line by line
          const lines = frontmatterRaw.split('\n');
          const fixedLines = lines.map(line => {
            // Fix title line if it has special characters
            if (line.startsWith('title:')) {
              const titleValue = line.substring(6).trim();
              // Remove existing quotes
              const cleanTitle = titleValue.replace(/^["']|["']$/g, '');
              // Re-quote with single quotes and escape internal quotes
              return `title: '${cleanTitle.replace(/'/g, "''")}'`;
            }
            // Fix description line
            if (line.startsWith('description:')) {
              const descValue = line.substring(12).trim();
              const cleanDesc = descValue.replace(/^["']|["']$/g, '');
              return `description: '${cleanDesc.replace(/'/g, "''")}'`;
            }
            return line;
          });

          // Reconstruct file
          const fixedContent = `---\n${fixedLines.join('\n')}\n---\n${bodyContent}`;

          // Test if it parses now
          matter(fixedContent);

          // Write back
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          console.log(`   ✓ Fixed!`);
          fixed++;
        }
      } catch (fixError) {
        console.log(`   ⚠️  Could not auto-fix: ${fixError.message}`);
        skipped++;
      }
    }
  });

  console.log(`\n✅ Fixed: ${fixed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`✓ Total checked: ${files.filter(f => f.endsWith('.md')).length}`);
}

fixFrontmatter();
