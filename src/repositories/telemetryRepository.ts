import prisma from '../database/prisma';
import { TelemetryCreateInput } from '../schemas/telemetry.schema';



export async function getAllTelemetry() {
    return await prisma.telemetry.findMany();
}

export async function getTelemetryHistory(vin: number){
    return await prisma.telemetry.findMany({
        where: {
            vin: vin
        }
    });
}

export async function getLatestTelemetry(vin: number) {
    return await prisma.telemetry.findFirst({
        where: {
            vin: vin
        },
        orderBy: {
            timestamp: 'desc'
        }
    });
}

export async function createTelemetry(data: TelemetryCreateInput) {
    return await prisma.telemetry.create({
        data
    });
}

export async function createBatchTelemetry(data: TelemetryCreateInput[]) {
    return await prisma.telemetry.createMany({
        data
    });
}
