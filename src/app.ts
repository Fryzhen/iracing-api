import express from 'express';
import routes from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

// Routes
app.use('/', routes);

export default app;