const Koa = require('koa')

const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const glob = require('glob')
const path = require('path');

const app = new Koa()

// Middleware - post requests
app.use(bodyParser({
    onerror: (err, ctx) => {
        ctx.throw('Failed parsing request body.', 422);
    }
}));  

// Register all API endpoints
for (const routerFile of glob.sync('./api/*/index.js')) {
    const router = require(path.resolve(routerFile));
    router.prefix('/api')
    app.use(router.routes())
}

// Go live!
const PORT = process.env.PORT || 3001
const server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});

module.exports = server
