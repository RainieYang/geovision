import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
export function render(path: string) {
  return renderToString(
    <StaticRouter location={path}>
      <App />
    </StaticRouter>,
  );
}
export { seo } from "./content/seo";
export { site } from "./content/site";
export { media } from "./content/media";
export { pageMetadata, canonicalUrl } from "./content/pageMetadata";
