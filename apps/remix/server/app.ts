import { createRequestHandler } from 'react-router';

// @ts-ignore - virtual module provided by React Router at build time
import * as build from 'virtual:react-router/server-build';

import app from './router';

const handler = createRequestHandler(build);
app.mount('/', (req) => handler(req, {}));

export default app.fetch;
