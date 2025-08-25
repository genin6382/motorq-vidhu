import {z} from "zod";

export const VehicleSchema = z.object({
    vin: z.number().int().positive().min(4),
    manufacturer: z.string().min(3).max(20),
    model : z.string().min(1).max(20),
    fleetId: z.number().int().positive().min(1),
    registrationStatus: z.enum(["Active","Registered","Decommissioned"]),
    
}).strict();

export type VehicleCreateInput = z.infer<typeof VehicleSchema>;