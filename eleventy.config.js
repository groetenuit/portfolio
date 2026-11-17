import path from "node:path";
import Image from "@11ty/eleventy-img";

// Op GitHub Pages (project-site) staat de site onder /repo-naam/.
// De workflow zet PATH_PREFIX; lokaal en met eigen domein blijft het "/".
const pathPrefix = process.env.PATH_PREFIX || "/";

export default function (eleventyConfig) {
  // Bestanden die ongewijzigd naar de uitvoermap gaan
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  // Afbeeldingen: automatisch WebP + JPEG in meerdere breedtes.
  // Werkt met bestandsnamen ("foto.jpg") en met paden zoals Pages CMS ze schrijft ("/img/foto.jpg").
  const optimaliseer = async (src, alt, sizes = "100vw") => {
    if (!alt) throw new Error(`Alt-tekst ontbreekt voor afbeelding: ${src}`);
    const schoon = String(src).replace(/^\/+/, "").replace(/^(src\/)?img\//, "");
    const metadata = await Image(path.join("src/img", schoon), {
      widths: [400, 800, 1400],
      formats: ["webp", "jpeg"],
      outputDir: "_site/img/",
      urlPath: `${pathPrefix}img/`.replace("//", "/"),
    });
    return Image.generateHTML(metadata, { alt, sizes, loading: "lazy", decoding: "async" });
  };

  // Gebruik in Markdown/Nunjucks: {% image "projecten/foto.jpg", "Beschrijving", "(min-width: 800px) 50vw, 100vw" %}
  eleventyConfig.addShortcode("image", optimaliseer);

  // Gewone Markdown-afbeeldingen (zoals de editor van Pages CMS ze invoegt: ![alt](/img/foto.jpg))
  // worden na het renderen vervangen door de geoptimaliseerde versie.
  eleventyConfig.addTransform("markdown-afbeeldingen", async function (content) {
    if (!this.page.outputPath?.endsWith(".html")) return content;
    const regex = /<img src="(\/img\/[^"]+)" alt="([^"]*)"\s*\/?>/g;
    const treffers = [...content.matchAll(regex)];
    for (const [volledig, src, alt] of treffers) {
      content = content.replace(volledig, await optimaliseer(src, alt));
    }
    return content;
  });

  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  // Projecten gesorteerd op het veld "volgorde" (laagste eerst)
  eleventyConfig.addCollection("projecten", (api) =>
    api
      .getFilteredByGlob("src/projecten/*.md")
      .sort((a, b) => (a.data.volgorde ?? 99) - (b.data.volgorde ?? 99))
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    pathPrefix,
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
