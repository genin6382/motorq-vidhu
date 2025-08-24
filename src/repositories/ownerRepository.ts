import prisma from "../database/prisma";
import { OwnerCreateInput } from "../schemas/owner.schema";


export async function getAllOwners(){
    return await prisma.owner.findMany();
}

export async function getOwnerById(ownerId: number){
    return await prisma.owner.findUnique({
        where: { ownerId }
    });
}

export async function createOwner(data: OwnerCreateInput){
    return await prisma.owner.create({
        data
    });
}


