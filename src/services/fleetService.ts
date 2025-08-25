import {Request , Response} from 'express';
import * as fleetRepository from '../repositories/fleetRepository';
import * as ownerRepository from "../repositories/ownerRepository";
import { FleetSchema } from '../schemas/fleet.schema';

export async function getAllFleets(req:Request , res:Response){
    try{
        const fleets = await fleetRepository.getAllFleets();
        if(!fleets){
            return res.status(404).send("No fleets found");
        }
        return res.status(200).json(fleets);
    }
    catch(e){
        const errorMessage = (e instanceof Error) ? e.message : String(e);
        res.status(500).json({ error: errorMessage });
    }
    
}

export async function getFleetById(req:Request , res:Response){
    try{
        const fleetId = parseInt(req.params.fleetId);
        if(isNaN(fleetId)){
            return res.status(400).send("Invalid fleet ID");
        }
        const fleet = await fleetRepository.getFleetById(fleetId);
        if(!fleet){
            return res.status(404).send(`Fleet ${fleetId} not found`);
        }
        return res.status(200).json(fleet);
    }
    catch(e){
        const errorMessage = (e instanceof Error) ? e.message : String(e);
        res.status(500).json({ error: errorMessage });
    }
}

export async function createFleet(req:Request , res:Response){
    try{
        const requestData = req.body;
        const parsed = FleetSchema.safeParse(requestData);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.format() });
        }
        const owner = await ownerRepository.getOwnerById(parsed.data.ownerId);
        if (!owner) {
            throw new Error(`Owner ${parsed.data.ownerId} not found`);
        }
        const newFleet = await fleetRepository.createFleet(parsed.data);
        return res.status(201).json(newFleet);
    }
    catch(e){
        const errorMessage = (e instanceof Error) ? e.message : String(e);
        res.status(500).json({ error: errorMessage });
    }
}

