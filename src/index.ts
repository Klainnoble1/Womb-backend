import 'dotenv/config';
import app from './app';
import { initDatabase } from './database/db';
const PORT = process.env.PORT || 4000;

// Start Server & Initialize Database
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`[Womb API] Express server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]', err);
});
