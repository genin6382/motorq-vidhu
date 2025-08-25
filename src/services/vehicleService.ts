import { VehicleSchema } from "../schemas/vehicle.schema";
import {Request , Response} from "express";
import * as vehicleRepository from "../repositories/vehicleRepository";
import * as fleetRepository from "../repositories/fleetRepository";

export async function getAllVehicles(req: Request, res: Response) {
    try{
        const vehicles = await vehicleRepository.getAllVehicles();
        if(vehicles.length === 0){
            return res.status(404).send("No vehicles found");
        }
        return res.status(200).json(vehicles);
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

export async function getVehicleById(req: Request, res: Response) {
   try{
        const vin = parseInt(req.params.vin);

        if(isNaN(vin)){
            return res.status(400).send("VIN must be a number");
        }
        const vehicle = await vehicleRepository.getVehicleById(vin);
        if(!vehicle){
            return res.status(404).send("Vehicle not found");
        }
        return res.status(200).json(vehicle);
   }
   catch(e){
       const errorMessage = (e instanceof Error) ? e.message : String(e);
       res.status(500).json({ error: errorMessage });
   }
}

export async function createVehicle(req: Request, res: Response) {
    try{
        const requestData = req.body;
        const parsed = VehicleSchema.safeParse(requestData);
        if(!parsed.success){
            return res.status(400).json({ error: parsed.error.format() });
        }

        const fleetId = await fleetRepository.getFleetById(parsed.data.fleetId);

        if(!fleetId){
            return res.status(404).json({ error: "Fleet does not exist" });
        }

        if(await vehicleRepository.getVehicleById(parsed.data.vin)){
            return res.status(409).json({ error: "Vehicle with this VIN already exists"});
        }

        const newVehicle = await vehicleRepository.createVehicle(parsed.data);
        return res.status(201).json(newVehicle);
    }
    catch(e){
        const errorMessage = (e instanceof Error) ? e.message : String(e);
        res.status(500).json({ error: errorMessage });
    }
}

export async function deleteVehicle(req:Request , res: Response){
    try{
        const vin = parseInt(req.params.vin);

        if(isNaN(vin)){
            return res.status(400).send("VIN must be a number");
        }

        const result = await vehicleRepository.deleteVehicle(vin);  // returns {count:0} or {count:1}

        if(result.count > 0){
            return res.status(200).json({ message: "Vehicle deleted successfully" });
        }
        return res.status(404).json({ error: "Vehicle not found" });
    }
    catch(e){
        const errorMessage = (e instanceof Error) ? e.message : String(e);
        res.status(500).json({ error: errorMessage });
    }
}