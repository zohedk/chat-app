import { z } from "zod";

export const updateMessageStatusSchema = z.object({
  messages: z.array(
    z.string({
      required_error: "messagesId shoudl be a provied",
      message: "messagesId shoud be string ",
    }),
    {
      required_error: "messagesId must be provided",
      message: "messageId shoud be array of string",
    }
  ),
});

export type UpdateMessageBody = z.infer<typeof updateMessageStatusSchema>;
