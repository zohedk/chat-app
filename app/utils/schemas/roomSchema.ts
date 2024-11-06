import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().optional(),
  users: z.string().array(),
  isGroupChat: z.boolean(),
});
