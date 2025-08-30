import * as telemetryRepository from '../repositories/telemetryRepository';
import * as vehicleRepository from '../repositories/vehicleRepository';
import * as alertService from './alertService';
import { TelemetrySchema } from '../schemas/telemetry.schema';
import {Request,Response} from 'express';


//Helper function for generating random data
export async function fetchAndCreateTelemetry(){
    const vehicles = await vehicleRepository.getAllVehicles();
    for(const vehicle of vehicles){
        const vin = vehicle.vin;
        const latestTelemetry = await telemetryRepository.getLatestTelemetry(vin); 
       //Math.random() -> generates a random number between 0 and 1
        if(latestTelemetry){
            const newspeed = latestTelemetry.speed + (Math.random() - 0.5) * 25;
            const clampedSpeed = Math.min(180, Math.max(0, newspeed)); // to keep it in the range 0 to 120
            const newfuelLevel = latestTelemetry.fuelLevel + (Math.random() - 0.5) * 5;
            const clampedFuel = Math.min(100, Math.max(0, newfuelLevel));
            const telemetryData = {
                vin : vin , 
                latitude : latestTelemetry.latitude + (Math.random() - 0.5) * 0.01,
                longitude : latestTelemetry.longitude + (Math.random() - 0.5) * 0.01,
                speed: clampedSpeed,
                fuelLevel: clampedFuel < 5 ? 100 : clampedFuel,
                engineStatus: latestTelemetry.engineStatus,
                odometerReading: latestTelemetry.odometerReading + (Math.random() * 2),
                timestamp: new Date(),
                diagnosticCodes: Math.random() < 0.1 ? "P0420" : null
            }
            console.log("Generated telemetry data:", telemetryData);
            await telemetryRepository.createTelemetry(telemetryData);
        }
        else{
            const telemetryData = {
                vin : vin , 
                latitude : Math.random() * 180 - 90,
                longitude : Math.random() * 360 - 180,
                speed: 0,
                fuelLevel: 100,
                engineStatus: 'On' as "On" | "Off" | "Idle" , //Helps prevent enum error 
                odometerReading: 1,
                timestamp: new Date(),
                diagnosticCodes: Math.random() < 0.1 ? "P0420" : null //helps prevent string error
            }
            console.log("Generated telemetry data:", telemetryData);
            await telemetryRepository.createTelemetry(telemetryData);
        }
    }
    console.log("Telemetry data generated for all vehicles.");
}


export async function getAllTelemetry(req:Request,res:Response){
    const telemetryData = await telemetryRepository.getAllTelemetry();
    if (telemetryData.length==0) {
        return res.status(404).json({ message: 'No telemetry data found' });
    }
    res.status(200).json(telemetryData);
}

export async function getTelemetryHistory(req:Request,res:Response){
    const vin = parseInt(req.params.vin);
    if (isNaN(vin)) {
        return res.status(400).json({ message: 'Invalid VIN' });
    }
    const telemetryData = await telemetryRepository.getTelemetryHistory(vin);
    if (telemetryData.length==0) {
        return res.status(404).json({ message: 'No telemetry data found for the given VIN' });
    }
    res.status(200).json(telemetryData);
}

export async function getLatestTelemetry(req:Request , res: Response){
    const vin = parseInt(req.params.vin);
    if(isNaN(vin)){
        return res.status(400).json({ message: 'Invalid VIN' });
    }
    const telemetryData = await telemetryRepository.getLatestTelemetry(vin);
    if (!telemetryData) {
        return res.status(404).json({ message: 'No telemetry data found for the given VIN' });
    }
    res.status(200).json(telemetryData);
}

export async function createTelemetry(req:Request,res:Response){
    const telemetryData = req.body;
    const parsed = TelemetrySchema.safeParse(telemetryData);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid telemetry data', errors: parsed.error.format() });
    }
    const vin = parsed.data.vin;
    if (await vehicleRepository.getVehicleById(vin) === null) {
        return res.status(400).send("Invalid Vin .Vehicle not found");
    }
    const latestTelemetry= await telemetryRepository.getLatestTelemetry(vin);
    if (latestTelemetry && latestTelemetry.timestamp > telemetryData.timestamp) {
        if(latestTelemetry.timestamp.getTime() - telemetryData.timestamp.getTime() > 2 * 60 * 1000) {
           return res.status(409).json({ message: 'Telemetry data delay is too high' }); 
        } 
    }
    //record created inside db
    const newTelemetry = await telemetryRepository.createTelemetry(telemetryData);
    //checking for alerts
    const alertGenerated = await alertService.evaluateTelemetry(telemetryData);

    await alertService.resolveOldAlerts();    

    if(alertGenerated){
        return res.status(201).json({ message: 'Telemetry data created and alert generated', data: newTelemetry });
    }
    else{
        return res.status(201).json({ message: 'Telemetry data created without alerts', data: newTelemetry });
    }
}

export async function createBatchTelemetry(req:Request,res:Response){
    const telemetryDataArray = req.body;
    const results = [];

    for(const telemetryData of telemetryDataArray){
        const parsed = TelemetrySchema.safeParse(telemetryData);
        if(!parsed.success){
            results.push({status:"failed",message:"Invalid telemetry data",errors:parsed.error.format()});
            continue;
        }
        const vin = parsed.data.vin;
        if (await vehicleRepository.getVehicleById(vin) === null) {
            results.push({status:"failed",message:"Invalid Vin"});
            continue;
        }
        const newTelemetry = await telemetryRepository.createTelemetry(telemetryData);
        results.push({status:"success",data:newTelemetry});
    }
    res.status(207).json(results);
}
