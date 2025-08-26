import app from "./app";
import dotenv from "dotenv";
import telemetryJob from './scheduler/telemetryScheduler';

dotenv.config();

const PORT = process.env.EXPRESS_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Starting Telemetry Job");
  telemetryJob;
});


