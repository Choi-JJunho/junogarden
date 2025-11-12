import InteractiveBackground from "@/components/InteractiveBackground";

interface PageLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

export function PageLayout({ children, showBackground = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {showBackground && <InteractiveBackground />}
      {children}
    </div>
  );
}
