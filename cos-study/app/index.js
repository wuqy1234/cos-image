const Koa = require('koa')
const app = new Koa()
const userRouter = require('../路由/user.route')
const bodyParser = require('koa-bodyparser');
// 导入错误处理的方法
const errHandler = require('./errHandler')

//bodyParser用来解析请求体
app.use(bodyParser());
//挂载路由
app.use(userRouter.routes())
//捕获错误
app.on('error', errHandler)

module.exports = app;





// 中间件1
// app.use(async (ctx, next) => {
//     console.log("<<<1");//遇到next()会执行下一个中间件
//     await next();//执行下一个中间件,等待下一个中间件执行完
//     console.log("1>>>");//下一个执行完了才执行
// });

// 中间件 2
// app.use(async (ctx, next) => {
//     console.log("<<<2");
//     const axios = require('axios')
//     const res = await axios.get('http://www.baidu.com')
//     next();
//     console.log("2>>>");
// });

// 中间件 3
// app.use((ctx, next) => {
//     console.log("<<<3");
//     //next();//假设没有下一个中间件
//     console.log("3>>>");
// });

//为了方便理解,去掉next,相当于下面的嵌套
// app.use(async (ctx, next) => {
//     console.log("<<<1")
//     app.use(async (ctx, next) => {
//         console.log("<<<2");
//         const axios = require('axios')
//         const res = await axios.get('http://www.baidu.com')
//         app.use( (ctx, next) => {
//             console.log("<<<3");
//             console.log("3>>>");
//         })
//       console.log("2>>>")
//     })
//     console.log("1>>>")
// })

/** 不过在这个嵌套中存在问题如下(GPT-4):
    1. 动态注册中间件问题： 在某个中间件中动态地向 Koa 应用注册新的中间件（通过 app.use()）
    通常不是一个好做法。Koa 设计上是预期你在应用启动之前注册所有中间件的。当请求进入 Koa 应用时，
    Koa 构建了中间件的执行链。如果在处理一个请求时动态添加中间件，这些新添加的中间件不会影响到当前
    请求的中间件执行链，只会影响之后发出的请求。这可能会导致非常难以追踪和理解的行为。

    2. 中间件执行顺序问题： 在您的代码中，每次请求到达时，都会试图向应用动态添加更多中间件。
    这意味着对于每个后续的请求，中间件的数量和执行的深度都会逐渐增加，这是非预期且无效率的。
    这可能会导致性能问题和逻辑错误。

    3. async/await 使用问题： 在 app.use() 中使用 async 函数是没问题的，但是在这个方案中，
    您试图在第一个中间件的过程中，动态添加更多的异步中间件，这不仅对性能有着负面影响，而且也使
    得代码逻辑变得复杂和难以理解。此外，每次请求处理都尝试添加新的中间件到应用中，这也是不合理的做法。
 */