import { Router, type IRouter } from "express";
import { getLawyers } from "../data/store";

const router: IRouter = Router();

const STATIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/find-lawyers",
  "/legal-resources",
  "/legal-resources/know-your-rights",
  "/testimonials",
  "/faq",
  "/contact",
  "/privacy-policy",
  "/terms-conditions",
];

router.get("/sitemap.xml", async (_req, res): Promise<void> => {
  const base = process.env.FRONTEND_URL?.replace(/\/$/, "") ?? "https://nyayaconnect.in";
  const lawyers = await getLawyers().catch(() => []);
  const urls = [
    ...STATIC_PATHS,
    ...lawyers.map((l) => `/lawyers/${(l as unknown as { slug?: string }).slug ?? l.id}`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
    .map((p) => `<url><loc>${base}${p}</loc><changefreq>weekly</changefreq></url>`)
    .join("")}</urlset>`;
  res.setHeader("Content-Type", "application/xml");
  res.send(xml);
});

export default router;
