const Router = require('koa-router')
const router = new Router()
const { register, login } = require('../用户操作/user.controller')
const {
    userValidator,
    verifyUser,
    crpytPassword,
    verifyLogin,
    auth,
    SensitiveWords,
    testdb,
    getBucket,
    ObjectCopy,
    deleteObject,
    img2webp,
    moment
} = require('../中间件/user.middleware');
// const {
//     // getBucket,
//     // deleteObject,
//     ObjectCopy
// } = require('../test/test')

// console.log()
/**
 * 注册接口
 */
// GET /users/
/**
 * !如果用户名和密码这样的敏感信息通过URL参数（即`ctx.params`）传递，
 * !这是不安全的，因为URL可能会被记录在浏览器历史、服务器日志或通过referer头泄露。
 * !正确的做法是始终使用POST请求的请求体来传递这类数据。
 * *在微信小程序中wx.cloud.callContainer,
 * *get请求方法是通过params传送数据的,post是通过body传送数据的。
*/
router.post('/user/register', userValidator, SensitiveWords, verifyUser, crpytPassword, register)
//预先颁发了token,不像之前自己设计的,只有登录成功了在颁发token,可以改造login接口,在其后面添加await next方法
router.post('/user/login', userValidator, verifyLogin, login)

// ?修改密码接口,除了get,post,delete,put等方法，还有patch,等等20个请求方法
router.patch('/user', auth, (ctx, next) => {
    console.log(ctx.state.user)
    ctx.body = '修改密码成功'
})


router.post('/user/test', async (ctx, next) => {

    const body = ctx.request.body;
    console.log(JSON.stringify(body, null, 2), 'ddddddddddd')

    // const headers = ctx.request.headers;
    // console.log(JSON.stringify(headers, null, 2), '11111111111111111111')
    // const headers2 = ctx.headers;
    // console.log(JSON.stringify(headers2, null, 2), '2222222222222222222222')
    // ctx.body = {  }
    // ctx.body = { msg: "你好,这是一个测试,微信小程序后台2222" };
    // Object.assign(ctx.body, { msg: "你好,这是一个测试,微信小程序后台2222" })


    await next()
    // Object.assign(ctx.body, { msg: "你好,这是一个测试,微信小程序后台3333333" })
    // ctx.body = { msg: "你好,这是一个测试,微信小程序后台1111" }
    // console.log(JSON.stringify(ctx.body, null, 2), 'sssssssssssss')

}, testdb)

router.post('/test', async (ctx, next) => {
    const { cloud, } = ctx.request.body

    ctx.body = {
        code: 0, msg: '测试成功',
        contents: await getBucket(),
        moment: await moment()
        // deleteObject: await deleteObject(cloud),
        // ObjectCopy: await ObjectCopy(cloud)
    }
})

router.post('/', async (ctx, next) => {
    ctx.body = { msg: 'Hello World', ObjectCopy: await ObjectCopy() }


})

router.post('/made', async (ctx, next) => {
    const { fileid, admin } = ctx.request.body
    const openid = admin != null ? '' : ctx.headers['x-wx-openid']
    // console.log(fileid, openid, admin == null, 'ppppppppppppppppppppppp');

    const data = await img2webp(fileid, openid)
    console.log(data, 'dddddddddddddddddddddd');
    ctx.body = data
})

module.exports = router