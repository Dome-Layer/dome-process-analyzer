import SavedAnalysisClient from "./SavedAnalysisClient";

// Static export (Sprint H phase 2): one prebuilt page, /saved/_, serves every analysis id. The
// Worker maps /saved/<id> to it (worker/site.ts), and SavedAnalysisClient reads the id from the
// URL. Any other id 404s at build time, which is why dynamicParams is off.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function SavedAnalysisPage() {
  return <SavedAnalysisClient />;
}
