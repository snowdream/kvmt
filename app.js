const Koa = require('koa');
const app = new Koa();
const views = require('koa-views')(__dirname + '/views', {
    extension: 'pug'
});
const env = require('get-env')();
const json = require('koa-json')(({ pretty: env === 'dev', param: 'pretty' }));
const responseTime = require('koa-response-time')();
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')({
    enableTypes:['json', 'form', 'text']
});

//logger
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');
const logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
const accessLogStream = rfs('access.log', {
    size:     '10M', // rotate every 10 MegaBytes written
    interval: '1d',  // rotate daily
    compress: 'gzip', // compress rotated files
    path: logDirectory
});
const logger = require('koa-morgan')('combined', {stream: accessLogStream});

const koa_static = require('koa-static')(__dirname + '/public');
const staticCache = require('koa-static-cache')((__dirname + '/public'), {
    maxAge: 24 * 60 * 60
});
const convert_staticCache = require('koa-convert')(staticCache);

const compose = require('koa-compose');
const compressible = require('compressible');
const compress = require('koa-compress')({
    filter: function (content_type) {
        return compressible(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
});

const index = require('./routes/index');
const users = require('./routes/users');

// error handler
onerror(app);

// composed middleware
const all = compose([
    responseTime,
    compress,
    bodyparser,
    json,
    logger,
    convert_staticCache,
    koa_static,
    views
]);

// routes
app.use(all);

app.use(index.routes());
app.use(index.allowedMethods());
app.use(users.routes());
app.use(users.allowedMethods());

module.exports = app;
