import { handle } from '@hono/node-server/vercel';
import handleReactRouter from 'hono-react-router-adapter/node';

import server from './hono/server/router.js';
import * as build from './index.js';

const handler = handleReactRouter(build, server);

export default handle(handler);
