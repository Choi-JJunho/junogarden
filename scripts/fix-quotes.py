#!/usr/bin/env python3
import os
import glob

blog_dir = "content/blog"
files = glob.glob(f"{blog_dir}/*.md")

fixed_count = 0

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace curly quotes
    content = content.replace('"', '"')
    content = content.replace('"', '"')
    content = content.replace(''', "'")
    content = content.replace(''', "'")

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Fixed: {os.path.basename(file_path)}")
        fixed_count += 1

print(f"\n🔧 Fixed {fixed_count} files")