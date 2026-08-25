import { Router, type IRouter } from "express";
import {
  ListActivitiesResponse,
  ListNotificationsResponse,
  MarkNotificationReadResponse,
} from "@workspace/api-zod";
import { getActivities, getNotifications, markNotificationRead } from "../data/store";
import { paramString } from "../lib/params";
import { isChannelEnabled } from "../lib/notify";
import { bearerUserOptional } from "../lib/admin";

const router: IRouter = Router();

router.get("/notifications", async (req, res): Promise<void> => {
  const user = await bearerUserOptional(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Login required." });
    return;
  }
  const all = await getNotifications();
  const filtered: typeof all = [];
  for (const n of all) {
    const type = (n as unknown as { type?: string }).type ?? "";
    const emailOn = await isChannelEnabled(user.id, type, "email");
    const smsOn = await isChannelEnabled(user.id, type, "sms");
    if (!emailOn && !smsOn) continue;
    filtered.push(n);
  }
  const data = ListNotificationsResponse.parse(filtered);
  res.json(data);
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const user = await bearerUserOptional(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Login required." });
    return;
  }
  const id = paramString(req.params.id);
  const notification = await markNotificationRead(id);
  if (!notification) {
    res.status(404).json({ error: "not_found", message: "Notification not found" });
    return;
  }
  const data = MarkNotificationReadResponse.parse(notification);
  res.json(data);
});

router.get("/activities", async (req, res): Promise<void> => {
  const user = await bearerUserOptional(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Login required." });
    return;
  }
  const data = ListActivitiesResponse.parse(await getActivities());
  res.json(data);
});

export default router;
