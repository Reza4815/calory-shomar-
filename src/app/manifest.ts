import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "رفا — سلامت و سبک زندگی",
    short_name: "رفا",
    description:
      "دستیار هوشمند سلامت؛ پیگیری غذا، آب، وزن، خواب، فعالیت و حال روزانه",
    lang: "fa",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0D1014",
    theme_color: "#0D1014",
    categories: ["health", "lifestyle", "fitness"],
    icons: [
      {
        src: "/icons/icon-512.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
