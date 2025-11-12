import Link from "next/link";

interface HeaderProps {
  backLink?: string;
  backLabel?: string;
}

export function Header({ backLink = "/", backLabel = "junogarden" }: HeaderProps) {
  return (
    <header className="p-6 md:p-8 border-b-2 border-primary/20 backdrop-blur-sm bg-background/80 sticky top-0 z-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href={backLink}
          className="text-primary hover:text-secondary transition-all duration-300 inline-flex items-center gap-2 group"
          aria-label={`${backLabel}로 돌아가기`}
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300" aria-hidden="true">
            ←
          </span>
          <span>{backLabel}</span>
        </Link>
      </div>
    </header>
  );
}
