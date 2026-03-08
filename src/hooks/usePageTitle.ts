import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — ReviewBoost`;
    return () => { document.title = "ReviewBoost — Get More Google Reviews"; };
  }, [title]);
}
