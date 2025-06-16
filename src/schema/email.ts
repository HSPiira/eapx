import { z } from "zod";

export const EmailInputSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
    attachments: z.array(z.object({
        filename: z.string(),
        content: z.string(),
        contentType: z.string()
    })).optional()
});

export type EmailInput = z.infer<typeof EmailInputSchema>; 