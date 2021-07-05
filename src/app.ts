import express from "express";
import compression from "compression";  // compresses requests
import exportRouter from "./controllers/export-service";

// Create Express server
const app = express();


// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(express.json());

app.use("/api", exportRouter);
export default app;
