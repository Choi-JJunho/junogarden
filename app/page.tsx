import { PageLayout } from "@/components/common/PageLayout";
import { Card } from "@/components/common/Card";
import { Footer } from "@/components/common/Footer";

export default function Home() {
  return (
    <PageLayout showBackground>
      {/* Header */}
      <header className="p-6 md:p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-primary transition-all hover:scale-105 inline-block cursor-default">
            junogarden
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-4xl w-full">
          <div className="bg-background/90 backdrop-blur-xl border-2 border-primary/30 rounded-2xl p-8 md:p-12 shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:scale-[1.02]">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-primary animate-float">
              실험 공간
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed">
              개인 프로젝트와 생각을 기록하는 곳
            </p>

            {/* About Me Section */}
            <div className="mb-12 p-6 bg-primary/5 border border-primary/20 rounded-xl space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-secondary flex items-center gap-2">
                  <span>👋</span> About Me
                </h3>
                <div className="text-foreground/90 leading-relaxed space-y-4">
                  <p className="text-lg font-medium text-primary">
                    조직의 회색지대를 찾아 해결하는 백엔드 개발자 최준호입니다.
                  </p>
                  <p>
                    명시되지 않은 비효율을 발견하고 주도적으로 해소하는 개발자입니다.
                    팀의 반복 작업을 자동화하고, 공통 라이브러리를 만들어 코드 중복을 제거하며,
                    필요시 프론트엔드 어드민까지 개발해 업무 효율을 높입니다.
                  </p>
                  <p>
                    <span className="font-semibold text-secondary">꼼꼼한 문서화</span>를 통해 지식을 체계적으로 공유하며,
                    <span className="font-semibold text-secondary"> 이유 없는 기술은 없다</span>는 신념으로
                    코드의 의도를 명확히 기록하고, 지속 가능한 시스템을 만듭니다.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-lg border border-primary/10">
                  <h4 className="font-bold text-accent mb-2 flex items-center gap-2">
                    <span>💼</span> Current
                  </h4>
                  <p className="text-sm text-foreground/80">
                    한국신용데이터 장부팀<br/>
                    Backend Engineer (2025.01 ~)
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg border border-primary/10">
                  <h4 className="font-bold text-accent mb-2 flex items-center gap-2">
                    <span>🎓</span> Education
                  </h4>
                  <p className="text-sm text-foreground/80">
                    한국기술교육대학교<br/>
                    컴퓨터공학부 (2019 ~ 2026)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-secondary mb-3 flex items-center gap-2">
                  <span>🛠️</span> Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Kotlin', 'Java', 'Spring Boot', 'TypeScript', 'React', 'MySQL', 'Redis', 'Docker', 'Jenkins'].map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 hover:bg-primary/20 transition-colors">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-secondary mb-3 flex items-center gap-2">
                  <span>✨</span> Core Values
                </h4>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-background/50 p-3 rounded-lg border border-primary/10">
                    <div className="font-semibold text-accent mb-1">주도성</div>
                    <div className="text-foreground/70">문제를 발견하고 해결책을 제시</div>
                  </div>
                  <div className="bg-background/50 p-3 rounded-lg border border-primary/10">
                    <div className="font-semibold text-accent mb-1">리더십</div>
                    <div className="text-foreground/70">팀과 함께 성장하는 문화 조성</div>
                  </div>
                  <div className="bg-background/50 p-3 rounded-lg border border-primary/10">
                    <div className="font-semibold text-accent mb-1">지속적 성장</div>
                    <div className="text-foreground/70">기본기부터 새 기술까지 탐구</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-primary/10">
                <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
                  <a href="https://github.com/Choi-JJunho" target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 hover:text-primary transition-colors">
                    <span>🔗</span> GitHub
                  </a>
                  <a href="https://velog.io/@junho5336" target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 hover:text-primary transition-colors">
                    <span>📝</span> Velog
                  </a>
                  <a href="mailto:junho5336@gmail.com"
                     className="flex items-center gap-2 hover:text-primary transition-colors">
                    <span>✉️</span> junho5336@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                type="navigation"
                title="Blog"
                description="생각과 경험을 기록합니다"
                href="/blog"
                icon="✍️"
                index={0}
              />

              <Card
                type="navigation"
                title="Projects"
                description="만들고 실험한 것들"
                href="/projects"
                icon="🚀"
                index={1}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </PageLayout>
  );
}
