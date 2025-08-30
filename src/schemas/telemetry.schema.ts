import {z} from 'zod';

export const TelemetrySchema = z.object({
    vin: z.number().int().positive(),
    latitude: z.float32().min(-90).max(90),
    longitude: z.float32().min(-180).max(180),
    speed: z.float32().min(0).max(180),
    engineStatus: z.enum(['On', 'Off','Idle']),
    fuelLevel: z.float32().min(0).max(100),
    odometerReading: z.float32().min(0),
    timestamp: z.date(),
    diagnosticCodes: z.string().nullable().optional()
}).strict();

export type TelemetryCreateInput = z.infer<typeof TelemetrySchema>;