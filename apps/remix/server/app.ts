import { createRequestHandler } from 'react-router';

// @ts-ignore - virtual module provided by React Router at build time
import * as build from 'virtual:react-router/server-build';

import app from './router';

// Catch unhandled rejections so they don't crash the serverless function.
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

const handler = createRequestHandler(build);
app.mount('/', (req) => handler(req, {}));

export default app.fetch;
