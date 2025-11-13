import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">프로젝트를 찾을 수 없습니다</h2>
          <p className="text-gray-400">
            요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/projects"
            className="px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            프로젝트 목록으로
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
