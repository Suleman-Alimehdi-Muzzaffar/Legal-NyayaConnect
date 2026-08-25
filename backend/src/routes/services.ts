import { Router, type IRouter } from "express";
import { GetServiceBySlugResponse, ListServicesResponse } from "@workspace/api-zod";
import { getServiceBySlug, getServices } from "../data/store";
import { paramString } from "../lib/params";

const router: IRouter = Router();

router.get("/services", async (_req, res): Promise<void> => {
  const data = ListServicesResponse.parse(await getServices());
  res.json(data);
});

router.get("/services/:slug", async (req, res): Promise<void> => {
  const slug = paramString(req.params.slug);
  const service = await getServiceBySlug(slug);
  if (!service) {
    res.status(404).json({ error: "not_found", message: "Service not found" });
    return;
  }
  const data = GetServiceBySlugResponse.parse(service);
  res.json(data);
});

export default router;
