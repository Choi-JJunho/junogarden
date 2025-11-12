import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { Header } from "@/components/common/Header";

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      publishedTime: project.date,
      tags: project.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header backLink="/projects" backLabel="Projects" />

      <main id="main-content" className="p-6 md:p-8">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
              {project.title}
            </h1>

            <div className="flex flex-wrap gap-4 items-center mb-4">
              {project.date && (
                <time className="text-foreground/50" dateTime={project.date}>
                  {new Date(project.date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                  })}
                </time>
              )}

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-accent transition-colors text-sm inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded px-2 py-1"
                  aria-label="프로젝트 라이브 데모 보기 (새 창)"
                >
                  🔗 Live Demo
                </a>
              )}

              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-accent transition-colors text-sm inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded px-2 py-1"
                  aria-label="프로젝트 GitHub 보기 (새 창)"
                >
                  💻 GitHub
                </a>
              )}
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2" role="list" aria-label="태그 목록">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full"
                    role="listitem"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary prose-code:text-accent prose-pre:bg-primary/5 prose-pre:border-2 prose-pre:border-primary/20">
            <MDXRemote source={project.content} />
          </div>
        </article>
      </main>
    </div>
  );
}
