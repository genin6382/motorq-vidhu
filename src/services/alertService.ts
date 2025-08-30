import * as alertRepository from '../repositories/alertRepository';
import * as telemetryRepository from '../repositories/telemetryRepository';
import {Request,Response} from 'express'; 
import { TelemetryCreateInput} from '../schemas/telemetry.schema';

export async function evaluateTelemetry(telemetryData:any){
    //Thresholds 
    const speedThreshold = 100;
    const fuelThreshold = 20;
    let alertGenerated = false;
    //check for  speed violation
    if(telemetryData.speed > speedThreshold){
        let severity:"Low" | "Medium" | "High" | "Critical" = "Low";
        alertGenerated = true;
        if(telemetryData.speed > speedThreshold+ speedThreshold*0.25){
            severity = "Medium";
        }
        else if(telemetryData.speed > speedThreshold + speedThreshold * 0.5) {
            severity = "High";
        }
        else if (telemetryData.speed > speedThreshold + speedThreshold * 0.75) {
            severity = "Critical";
        }
        await alertRepository.createAlert({
            vin: telemetryData.vin,
            alertType: "SpeedViolation",
            severity: severity,
            message: `Vehicle ${telemetryData.vin} is exceeding speed limit by ${telemetryData.speed - speedThreshold} km/hr`,
            actualValue: telemetryData.speed,
            thresholdValue: speedThreshold,
            isResolved: false,
        });
    }
    //check for low fuel
    if (telemetryData.fuel < fuelThreshold) {
        let severity:"Low" | "Medium" | "High" | "Critical" = "Low";
        alertGenerated = true;
        if (telemetryData.fuel < fuelThreshold - fuelThreshold * 0.25) {
            severity = "Medium";
        } else if (telemetryData.fuel < fuelThreshold - fuelThreshold * 0.5) {
            severity = "High";
        } else if (telemetryData.fuel < fuelThreshold - fuelThreshold * 0.75) {
            severity = "Critical";
        }
        await alertRepository.createAlert({
            vin: telemetryData.vin,
            alertType: "LowFuel",
            severity: severity,
            message: `Vehicle ${telemetryData.vin} is below fuel threshold by ${fuelThreshold - telemetryData.fuel} liters`,
            actualValue: telemetryData.fuel,
            thresholdValue: fuelThreshold,
            isResolved: false,
        });
    }
    //check for engine status
    if (telemetryData.engineStatus=="Off"){
        let severity:"Low" | "Medium" | "High" | "Critical" = "Low";
        if(telemetryData.fuel == 0){
            severity = "Medium";
        }
        else if(telemetryData.speed > 0){
            severity = "Critical";
        }
        await alertRepository.createAlert({
            vin: telemetryData.vin,
            alertType: "EngineStatus",
            severity: severity,
            message: `Vehicle ${telemetryData.vin} has engine status ${telemetryData.engineStatus}`,
            actualValue: telemetryData.engineStatus,
            thresholdValue: -1,
            isResolved: false,
        });
    }
    //check for engine idle for more than 10 minutes 
    if (telemetryData.engineStatus == "Idle"){
        const telemetryHistory = await telemetryRepository.getTelemetryHistory(telemetryData.vin);
        const idleThreholdMinutes = 10; //Equals last 20 records
        if(telemetryHistory.length >= 20){
            let count = 0;
            for (let i = telemetryHistory.length - 1; i >= 0 && count < 20; i--) {
                const record = telemetryHistory[i];
                if(record.engineStatus == "Idle"){
                    count++;
                }
                else break;
            }
            if(count >= 20){
                alertGenerated = true;
                await alertRepository.createAlert({
                    vin: telemetryData.vin,
                    alertType: "EngineStatus",
                    severity: "Medium",
                    message: `Vehicle ${telemetryData.vin} has been idle for ${idleThreholdMinutes} minutes`,
                    actualValue: telemetryData.engineStatus,
                    thresholdValue: -1,
                    isResolved: false,
                });
            }
        }   
    }
    return alertGenerated;
}

export async function resolveOldAlerts(){
    const UnResolvedAlerts = await alertRepository.getUnResolvedAlerts();
    //Using HashMap to map vehicle VIN to their latest telemetry data
    const vinMap : Map<number, TelemetryCreateInput> = new Map();
    for(const alert of UnResolvedAlerts){
        if(!vinMap.has(alert.vin)){
            const latestTelemetryData = await telemetryRepository.getLatestTelemetry(alert.vin);
            if(latestTelemetryData){
                vinMap.set(alert.vin, latestTelemetryData);
            }
        }
    }
    //Loop through previous alerts and change their status according to latest Telemetry data
    for(const alert of UnResolvedAlerts){
        const latestTelemetryData = vinMap.get(alert.vin);
        if(latestTelemetryData){
            if(alert.alertType == "SpeedViolation" && latestTelemetryData.speed <= 100){ 
                await alertRepository.resolveAlert(alert.alertId);
            }
            if(alert.alertType == "LowFuel" && latestTelemetryData.fuelLevel > 20){
                await alertRepository.resolveAlert(alert.alertId);
            }
            if(alert.alertType =="EngineStatus" && latestTelemetryData.engineStatus == "On"){
                await alertRepository.resolveAlert(alert.alertId);
            }
        }
    }
    return;
}

export async function getAllAlerts(req:Request,res:Response){
    const alerts = await alertRepository.getAllAlerts();
    if(alerts.length === 0){
        return res.status(404).json({ message: 'No alerts found' });
    }
    res.status(200).json(alerts);
}

export async function getAlertByVin(req:Request,res:Response){
    const vin = parseInt(req.params.vin);
    if (isNaN(vin)) {
        return res.status(400).json({ message: 'Invalid VIN' });
    }
    const alerts = await alertRepository.getAlertByVin(vin);
    if (alerts.length === 0) {
        return res.status(404).json({ message: 'No alerts found for the given VIN' });
    }
    res.status(200).json(alerts);
}
