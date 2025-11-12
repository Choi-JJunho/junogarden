import { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { Header } from "@/components/common/Header";
import { Card } from "@/components/common/Card";

export const metadata: Metadata = {
  title: "Projects",
  description: "만들고 실험한 프로젝트들",
  openGraph: {
    title: "Projects | junogarden",
    description: "만들고 실험한 프로젝트들",
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="min-h-screen">
      <Header backLink="/" backLabel="junogarden" />

      <main id="main-content" className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary hover:scale-105 transition-transform duration-300 inline-block">
            Projects
          </h1>

          {projects.length === 0 ? (
            <div className="bg-background/90 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-8 text-center hover:border-primary/40 transition-all duration-300">
              <p className="text-foreground/70">아직 등록된 프로젝트가 없습니다.</p>
              <p className="text-sm text-foreground/50 mt-2">
                content/projects 폴더에 마크다운 파일을 추가해보세요.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6" role="list">
              {projects.map((project, index) => (
                <div key={project.slug} role="listitem">
                  <Card
                    type="project"
                    title={project.title}
                    description={project.description}
                    href={`/projects/${project.slug}`}
                    date={project.date}
                    tags={project.tags}
                    index={index}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
