export interface Frontmatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

// Blog uses base Frontmatter without additional fields
export type BlogFrontmatter = Frontmatter;

export interface ProjectFrontmatter extends Frontmatter {
  link?: string;
  github?: string;
}

export interface ContentItem {
  slug: string;
  content: string;
}

export interface BlogPost extends ContentItem {
  fileName: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

export interface Project extends ContentItem {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  link?: string;
  github?: string;
}

export interface CardProps {
  title: string;
  description?: string;
  href: string;
  icon?: string;
  tags?: string[];
  date?: string;
  index?: number;
}

export interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}
