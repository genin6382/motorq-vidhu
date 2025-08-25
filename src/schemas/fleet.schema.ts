import {z} from "zod";

export const FleetSchema = z.object({
    fleetType: z.enum(['Corporate', 'Rental', 'Personal']),
    ownerId: z.number().int().positive()
}).strict();// disallow extra fields

export type FleetCreateInput = z.infer<typeof FleetSchema>;