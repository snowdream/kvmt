const Koa = require('koa');
const app = new Koa();
const views = require('koa-views')(__dirname + '/views', {
    extension: 'pug'
});
const json = require('koa-json')();
const responseTime = require('koa-response-time')();
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')({
    enableTypes:['json', 'form', 'text']
});
const logger = require('koa-logger')();
const koa_static = require('koa-static')(__dirname + '/public')
const compose = require('koa-compose');

const index = require('./routes/index');
const users = require('./routes/users');

// error handler
onerror(app);

// composed middleware
const all = compose([
    responseTime,
    bodyparser,
    json,
    logger,
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
