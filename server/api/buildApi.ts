import { Config } from '@src/services/config/getConfig';
import { Services } from '@src/services/bootstrap/initServices';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import postRouter from './post/extract';
import { BaseError } from '@src/services/errors/base';
import { UnknownError } from '@src/services/errors/unknownError';
import { NotFoundError } from '@src/services/errors/notFoundError';
import { logger } from '@src/services/logging/logger';
import { ParseError } from '@src/services/errors/parseError';

export interface Context {
    config: Config;
    services: Services;
}

export type App = Koa<Koa.DefaultState, Context>

const attachEndpoints = (app: App) => {
    const routers = [postRouter];

    for (const router of routers) {
        router.prefix('/api');
        app.use(router.routes());
    }
}

export const buildApp = (config: Config, services: Services): App => {
    const app: App = new Koa();

    // Custom error logging with prefix
    app.on('error', (err, ctx) => {
        const isUserError = err instanceof BaseError && err.code >= 400 && err.code < 500;
        const log = isUserError ? logger.warn.bind(logger) : logger.error.bind(logger);
        log(err, `${ctx.method} ${ctx.path} Api endpoint error`);
    });

    // Setup context
    app.use(async (ctx, next) => {
        ctx.config = config;
        ctx.services = services;
        await next();
    });

    // Request logging middleware - logs start and end of each request
    app.use(async (ctx, next) => {
        const startTime = Date.now();
        logger.info(`${ctx.method} ${ctx.path} <- ${ctx.ip}:${ctx.request.socket.remotePort}`);

        await next();

        const duration = Date.now() - startTime;
        logger.info(`${ctx.method} ${ctx.path} ${ctx.status} -> ${ctx.ip}:${ctx.request.socket.remotePort} (${duration}ms)`);
    });

    // Error handling middleware to ensure consistent JSON errors and handle BaseError
    // MUST be registered before bodyParser to catch parsing errors
    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (err: any) {
            const error = err instanceof BaseError ? err : new UnknownError('Unhandled API error', err, {});
            ctx.status = error.code;
            ctx.body = error.serialize();
            ctx.app.emit('error', err, ctx);
        }
    });

    // JSON & etc request body parser
    app.use(bodyParser({
        onerror: (err: Error, _ctx: Koa.Context) => {
            const error = new ParseError({ entity: 'request body', isUserError: true }, err)
            throw error;
        }
    }));

    // 404 handler which throws NotFoundError
    app.use(async (ctx, next) => {
        await next();
        if (ctx.status === 404) {
            throw new NotFoundError({ entity: 'endpoint', id: ctx.path, secondaryEntity: 'method', secondaryId: ctx.method });
        }
    });

    // Register all API endpoints
    attachEndpoints(app);

    // Return app
    return app
}

export const initApp = (config: Config, app: App) => {
    // Go live!
    const port = config.api.port;
    app.listen(port, () => {
        logger.info(`Server is listening to requests`);
    });    
}
