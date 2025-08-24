import {z} from "zod";

export const OwnerSchema = z.object({
    name: z.string().min(1).max(100)
})

export type OwnerCreateInput = z.infer<typeof OwnerSchema>;
