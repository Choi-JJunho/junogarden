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
            <p className="text-lg md:text-xl text-foreground/80 mb-12 leading-relaxed">
              개인 프로젝트와 생각을 기록하는 곳
            </p>

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
