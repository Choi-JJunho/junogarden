import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost } from "@/types";

const blogDirectory = path.join(process.cwd(), "content/blog");

function createSlug(fileName: string): string {
  // Remove .md extension first
  const nameWithoutExt = fileName.replace(/\.md$/, "");
  // Use filename as-is for slug (Next.js will handle encoding in URLs)
  return nameWithoutExt;
}

export function getAllPosts(): BlogPost[] {
  // content/blog 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName): BlogPost | null => {
      try {
        const slug = createSlug(fileName);
        const fullPath = path.join(blogDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        return {
          slug,
          fileName: fileName.replace(/\.md$/, ""),
          title: data.title || fileName.replace(/\.md$/, ""),
          date: data.date || "",
          description: data.description,
          content,
          tags: data.tags || [],
        };
      } catch (error) {
        console.error(`Error parsing ${fileName}:`, error);
        return null;
      }
    })
    .filter((post): post is BlogPost => post !== null);

  // 날짜순으로 정렬
  return allPosts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    // Decode the slug from URL format
    const decodedSlug = decodeURIComponent(slug);
    const fullPath = path.join(blogDirectory, `${decodedSlug}.md`);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.warn(`Blog post not found: ${decodedSlug}`);
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Validate required fields
    if (!data.title || !content) {
      console.error(`Invalid blog post format: ${decodedSlug}`);
      return null;
    }

    return {
      slug: decodedSlug,
      fileName: decodedSlug,
      title: data.title,
      date: data.date || "",
      description: data.description,
      content,
      tags: data.tags || [],
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagsSet = new Set<string>();

  posts.forEach((post) => {
    post.tags?.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

export function getPostsByTag(tag: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter((post) => post.tags?.includes(tag));
}

export function searchPosts(query: string): BlogPost[] {
  const posts = getAllPosts();
  const lowerQuery = query.toLowerCase();

  return posts.filter((post) => {
    return (
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description?.toLowerCase().includes(lowerQuery) ||
      post.content.toLowerCase().includes(lowerQuery) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}