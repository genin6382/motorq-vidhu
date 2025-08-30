import prisma from '../database/prisma';
import { CreateAlertInput } from '../schemas/alert.Schema';

export async function createAlert(alertData: CreateAlertInput){
    return await prisma.alert.create({
        data: alertData
    })
}

export async function getUnResolvedAlerts(){
    return await prisma.alert.findMany({
        where: {
            isResolved: false
        }
    });
}

export async function resolveAlert(alertId: number){
    return await prisma.alert.update({
       where :{
            alertId: alertId
       },
       data :{
            isResolved: true
       }

    });
}

export async function getAllAlerts(){
    return await prisma.alert.findMany();
}

export async function getAlertByVin(vin: number){
    return await prisma.alert.findMany({
        where :{
            vin : vin
        }
    })
}
