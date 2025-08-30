import express from 'express';
import ownerRoutes from './routes/ownerRoutes';
import fleetRoutes from './routes/fleetRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import telemetryRoutes from './routes/telemetryRoutes';
import alertRoutes from './routes/alertRoutes';

const app = express();
app.use(express.json());

app.use('/owners', ownerRoutes);
app.use('/fleets', fleetRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/telemetry', telemetryRoutes);
app.use('/alerts', alertRoutes);

export default app;