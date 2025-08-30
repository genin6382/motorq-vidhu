import {z} from 'zod';

export const AlertSchema = z.object({
    vin: z.number().int().positive(),
    alertType: z.enum([ "SpeedViolation" ,"LowFuel","Maintenance" ,"EngineStatus"]),
    severity: z.enum([ "Low" ,"Medium","High","Critical"]),
    message: z.string().min(5).max(255),
    actualValue : z.float32(),
    thresholdValue: z.float32(),
    isResolved: z.boolean(),
    resolvedAt : z.date().optional()
}).strict()

export type CreateAlertInput = z.infer<typeof AlertSchema>;
