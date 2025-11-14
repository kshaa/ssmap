import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { Server } from 'http';
import postRouter from '@src/api/post/index.js';

const app = new Koa();

// Middleware - post requests
app.use(bodyParser({
    onerror: (err: Error, ctx: Koa.Context) => {
        ctx.throw('Failed parsing request body.', 422);
    }
}));  

// Register all API endpoints
const routers = [postRouter];

for (const router of routers) {
    router.prefix('/api');
    app.use(router.routes());
}

// Go live!
const PORT = process.env.PORT || 3001;
const server: Server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

export default server;

