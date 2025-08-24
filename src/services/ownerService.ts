import { Request, Response } from 'express';
import * as ownerRepository from '../repositories/ownerRepository';


export async function getAllOwners(req: Request , res: Response){
  try{
    const owners = await ownerRepository.getAllOwners();
    if(!owners || owners.length === 0) {
      return res.status(404).json({ error: "No owners found" });
    }
    res.json(owners);
  }
  catch(e){
    const errorMessage = (e instanceof Error) ? e.message : String(e);
    res.status(500).json({ error: errorMessage });
  }
}

export async function getOwnerById(req:Request , res:Response){
  try{
    const ownerId:number = parseInt(req.params.ownerId);
    if(isNaN(ownerId)){
      return res.status(400).json({ error: "Invalid owner ID" });
    }
    const owner = await ownerRepository.getOwnerById(ownerId);
    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }
    res.json(owner);
  }
  catch(e){
    const errorMessage = (e instanceof Error) ? e.message : String(e);
    res.status(500).json({ error: errorMessage });
  }
}

export async function createOwner(req:Request , res:Response){
  try{
    const newOwner = await ownerRepository.createOwner(req.body);
    if (!newOwner) {
      return res.status(400).json({ error: "Failed to create owner" });
    }
    res.status(201).json(newOwner);
  }
  catch(e){
    const errorMessage = (e instanceof Error) ? e.message : String(e);
    res.status(500).json({ error: errorMessage });
  }
}