import express from 'express';
import ownerRoutes from './routes/ownerRoutes';
import fleetRoutes from './routes/fleetRoutes';


const app = express();
app.use(express.json());


app.use('/owners', ownerRoutes);
app.use('/fleets', fleetRoutes);


export default app;