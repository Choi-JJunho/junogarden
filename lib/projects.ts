import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Project } from "@/types";

const projectsDirectory = path.join(process.cwd(), "content/projects");

export function getAllProjects(): Project[] {
  // content/projects 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);
  const allProjects = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        description: data.description || "",
        date: data.date || "",
        tags: data.tags || [],
        link: data.link || "",
        github: data.github || "",
        content,
      };
    });

  // 날짜순으로 정렬
  return allProjects.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getProjectBySlug(slug: string): Project | null {
  try {
    const fullPath = path.join(projectsDirectory, `${slug}.md`);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.warn(`Project not found: ${fullPath}`);
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Validate required fields
    if (!data.title || !content) {
      console.error(`Invalid project format: ${fullPath}`);
      return null;
    }

    return {
      slug,
      title: data.title,
      description: data.description || "",
      date: data.date || "",
      tags: data.tags || [],
      link: data.link || "",
      github: data.github || "",
      content,
    };
  } catch (error) {
    console.error(`Error reading project ${slug}:`, error);
    return null;
  }
}