import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="eyebrow mb-5 justify-center">
          <span className="eyebrow-dot" />
          404
        </p>
        <h1 className="h-display text-display-lg mb-4">Trail goes cold here.</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          That route isn&apos;t mapped. The page may have moved, or the URL is mistyped.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors duration-fast"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
