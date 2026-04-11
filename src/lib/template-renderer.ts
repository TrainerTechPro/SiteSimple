import { readFile } from "fs/promises";
import path from "path";

/**
 * Renders an HTML template by:
 * 1. Reading the template file from /public
 * 2. Replacing {{KEY}} placeholders with values from templateData
 * 3. Rewriting relative asset paths to absolute /imported/... paths
 * 4. Rewriting internal page links to /sites/[slug]/... paths
 */
export async function renderTemplate(
  templatePath: string,
  templateData: Record<string, string>,
  siteSlug: string
): Promise<string> {
  // Read the template from the public folder
  const absolutePath = path.join(process.cwd(), "public", templatePath);
  let html = await readFile(absolutePath, "utf-8");

  // Derive the asset base path from the template path
  // e.g. /imported/professor-tony/index.template.html -> /imported/professor-tony
  const assetBase = path.dirname(templatePath);

  // Replace all {{KEY}} placeholders with values from templateData
  html = html.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key: string) => {
    const value = templateData[key];
    if (value === undefined || value === null) {
      return match; // Leave placeholder if no value provided
    }
    // Escape HTML-sensitive characters in values to prevent injection
    return escapeHtml(String(value));
  });

  // Rewrite relative asset paths (CSS, JS, images, favicon)
  // These appear in href="css/..." or src="js/..." etc.
  html = html.replace(
    /(href|src)="(?!https?:\/\/|mailto:|#|\/)([^"]+)"/g,
    (match, attr: string, relPath: string) => {
      // If the path ends in .html, rewrite to /sites/[slug]/path (internal nav)
      if (relPath.endsWith(".html")) {
        // index.html should go to /sites/[slug]
        if (relPath === "index.html") {
          return `${attr}="/sites/${siteSlug}"`;
        }
        // Other .html files stay in the imported folder for now
        return `${attr}="${assetBase}/${relPath}"`;
      }
      // All other relative paths (css, js, images, svg) → absolute imported path
      return `${attr}="${assetBase}/${relPath}"`;
    }
  );

  // Also rewrite the manifest.json reference
  html = html.replace(/href="manifest\.json"/g, `href="${assetBase}/manifest.json"`);

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
