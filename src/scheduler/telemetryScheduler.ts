import scheulder from 'node-schedule';
import { fetchAndCreateTelemetry } from '../services/telemetryService';

const telemetryJob = scheulder.scheduleJob('*/30 * * * * *',async ()=>{
    await fetchAndCreateTelemetry();
})
export default telemetryJob;