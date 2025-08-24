import express from 'express';
import ownerRoutes from './routes/ownerRoutes';


const app = express();
app.use(express.json());


app.use('/owners', ownerRoutes);

export default app;