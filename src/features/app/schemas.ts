import { z } from 'zod';

export type Thread = z.infer<ReturnType<typeof zThread>>;
export const zThread = () =>
  z.object({
    id: z.string(),
    title: z.string(),
    body: z.string(),
  });
