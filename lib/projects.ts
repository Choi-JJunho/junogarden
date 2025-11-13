import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type { Project } from "@/types";
import { ProjectFrontmatterSchema, validateFrontmatter } from "./schemas";

const projectsDirectory = path.join(process.cwd(), "content/projects");

export function getAllProjects(): Project[] {
  // content/projects 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);
  const allProjects = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName): Project | null => {
      try {
        const slug = fileName.replace(/\.md$/, "");
        const fullPath = path.join(projectsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents, {
          engines: {
            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as Record<string, unknown>
          }
        });

        // Validate frontmatter with Zod
        const validation = validateFrontmatter(ProjectFrontmatterSchema, data, fileName);

        if (!validation.success) {
          // Log validation error and skip this file
          return null;
        }

        return {
          slug,
          title: validation.data.title,
          description: validation.data.description,
          date: validation.data.date,
          tags: validation.data.tags,
          link: validation.data.link || "",
          github: validation.data.github || "",
          content,
        };
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️  Skipping file with parsing error: ${fileName}`, error);
        }
        return null;
      }
    })
    .filter((project): project is Project => project !== null);

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
    const { data, content } = matter(fileContents, {
      engines: {
        yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as Record<string, unknown>
      }
    });

    // Validate frontmatter with Zod
    const validation = validateFrontmatter(ProjectFrontmatterSchema, data, `${slug}.md`);

    if (!validation.success) {
      console.error(`Invalid project format: ${fullPath}`);
      return null;
    }

    return {
      slug,
      title: validation.data.title,
      description: validation.data.description,
      date: validation.data.date,
      tags: validation.data.tags,
      link: validation.data.link || "",
      github: validation.data.github || "",
      content,
    };
  } catch (error) {
    console.error(`Error reading project ${slug}:`, error);
    return null;
  }
}