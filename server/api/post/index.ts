import Router from 'koa-router';
import fetch from 'node-fetch';
import URL from 'url-parse';
import { JSDOM } from 'jsdom';
import * as postParser from '@src/api/post/postParser.js';
import { Context, Next } from 'koa';

const post = new Router();

function isHostnameSS(hostname: string): boolean {
    return !!hostname.match(/^(www\.)?ss\.(com|lv)$/);
}

function validateUrl(url: string): string {
    const parsedUrl = new URL(url);

    if (!isHostnameSS(parsedUrl.hostname)) {
        throw new Error('Sludinājuma saitei kaut kas nav');
    }
    
    return parsedUrl.toString().replace(/\/ru\//, '/lv/'); // Parse only LV ss.com (too lazy to implement both) :D
}

post.post('/post', async (ctx: Context, next: Next) => {
    let url: string;
    const body: any = ctx.request.body;

    try {
        try {
            url = validateUrl(body.url);
        } catch (err) {
            url = validateUrl('https://' + body.url);
        }
    } catch (err: any) {
        ctx.status = 500;
        ctx.body = {
            status: 'fail',
            message: 'Sludinājuma saite neizskatās pareizi',
            stack: err.stack?.split("\n").map((x: string) => x.trim())
        };

        return null;
    }

    await fetch(url)
        .then((response: any) => {
            if (response.status === 404) {
                throw new Error('Sludinājums nav atrasts');
            }

            return response.text();
        })
        .then((response: string) => {
            const ssdom = new JSDOM(response, {
                contentType: "text/html"
            });
        
            try {
                const genericInfo = postParser.getPostGenericInfo(ssdom.window.document);
                const addressInfo = postParser.getPostAddressInfo(ssdom.window.document);
                const price = postParser.getPostPrice(ssdom.window.document);
                const title = postParser.getPostTitle(ssdom.window.document);

                ctx.body = {
                    status: 'success',
                    addressInfo,
                    genericInfo,
                    price,
                    title,
                    url
                };
            } catch (err: any) {
                ctx.status = 500;
                ctx.body = {
                    status: 'fail',
                    message: 'Neizdevās apstrādāt sludinājumu',
                    stack: err.stack?.split("\n").map((x: string) => x.trim())
                };
            }
        })
        .catch((err: any) => {
            ctx.status = 500;
            ctx.body = {
                status: 'fail',
                message: 'Sludinājums nav atrasts',
                stack: err.stack?.split("\n").map((x: string) => x.trim())
            };
        });
});

export default post;

