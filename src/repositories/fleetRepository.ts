import prisma from '../database/prisma'
import { FleetCreateInput } from '../schemas/fleet.schema'

export async function getAllFleets(){
    return await prisma.fleet.findMany()
}

export async function getFleetById(fleetId: number){
    return await prisma.fleet.findUnique({
        where:{
            fleetId:fleetId
        }
    })
}

export async function createFleet(data:FleetCreateInput){
    return await prisma.fleet.create({
        data
    })
}