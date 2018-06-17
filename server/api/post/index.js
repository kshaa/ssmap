const Router = require('koa-router')
const fetch = require('node-fetch');
const URL = require('url-parse')
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const postParser = require('./postParser')

const post = new Router()

function isHostnameSS(hostname) {
	return hostname.match(/^(www\.)?ss\.(com|lv)$/)
}

function validateUrl(url) {
    const parsedUrl = new URL(url);

    if (!isHostnameSS(parsedUrl.hostname)) {
        throw new Exception('Sludinājuma saitei kaut kas nav')
    }
    
    return parsedUrl.toString().replace(/\/ru\//, '/lv/'); // Parse only LV ss.com (too lazy to implement both) :D
}

post.post('/post', async (ctx, next) => {
    let url;

    try {
        try {
            url = validateUrl(ctx.request.body.url);
        } catch (err) {
            url = validateUrl('https://' + ctx.request.body.url);
        }
    } catch (err) {
        ctx.status = 500
        ctx.body = {
            status: 'fail',
            message: 'Sludinājuma saite neizskatās pareizi',
            stack: err.stack.split("\n").map(x => x.trim())
        }

        return null;
    }

    await fetch(url)
        .then(response => {
            if (response.status === 404) {
                throw new Exception('Sludinājums nav atrasts')
            }

            return response.text()
        })
        .then(response => {
            const ssdom = new JSDOM(response, {
                contentType: "text/html"
            });
        
            try {
                genericInfo = postParser.getPostGenericInfo(ssdom.window.document)
                addressInfo = postParser.getPostAddressInfo(ssdom.window.document)
                price = postParser.getPostPrice(ssdom.window.document)
                title = postParser.getPostTitle(ssdom.window.document)

                ctx.body = {
                    status: 'success',
                    addressInfo,
                    genericInfo,
                    price,
                    title,
                    url
                }
            } catch (err) {
                ctx.status = 500
                ctx.body = {
                    status: 'fail',
                    message: 'Neizdevās apstrādāt sludinājumu',
                    stack: err.stack.split("\n").map(x => x.trim())
                }
            }
        })
        .catch(err => {
            ctx.status = 500
            ctx.body = {
                status: 'fail',
                message: 'Sludinājums nav atrasts',
                stack: err.stack.split("\n").map(x => x.trim())
            }
        })
});

module.exports = post
