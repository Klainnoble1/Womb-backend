import 'dotenv/config';
import app from '../src/app';
import { initDatabase } from '../src/database/db';

void initDatabase();

export default app;
