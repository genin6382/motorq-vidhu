import { VehicleCreateInput } from "../schemas/vehicle.schema";
import prisma from "../database/prisma";

export async function getAllVehicles(){
    return await prisma.vehicle.findMany();
}

export async function getVehicleById(vin: number){
    return await prisma.vehicle.findUnique({
        where :{ vin: vin }
    })
}

export async function createVehicle(data : VehicleCreateInput){
    return await prisma.vehicle.create({
        data
    })
}

export async function deleteVehicle(vin: number){
    return await prisma.vehicle.deleteMany({
        where : {vin:vin}
    })
}
