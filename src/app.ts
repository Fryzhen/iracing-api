import express from 'express';
import routes from './routes/routes';
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/', routes);
app.listen();