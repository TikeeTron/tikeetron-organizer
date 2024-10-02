import { z } from "zod";

const ticketTypeSchema = z.object({
  type: z.string(),
  price: z.number(),
  capacity: z.number(),
});

export const eventSchema = z.object({
  eventId: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  capacity: z.string(),
  category: z.string(),
  date: z.date(),
  ticketTypes: z.array(ticketTypeSchema),
});

export type Event = z.infer<typeof eventSchema>;
