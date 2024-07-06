const { getUerInfo } = require('../数据库/user.service')
const {
    userFormateError,
    userAlreadyExited,
    userRegisterError,
    userDoesNotExist,
    userLoginError,
    invalidPassword,
    tokenExpiredError,
    invalidToken,
    SensitiveWordserror
} = require('../返回消息/err.type')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../配置文件/config.default')
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const webp = require('webp-converter');
const { initcos, call } = require('../初始化cos/index')
let cos;
initcos.then(res => {
    cos = res
})
const cosConfig = {
    //建议写在环境变量中，避免泄露敏感信息。
    Bucket: process.env.Bucket || '7072-prod-8gcmr08s23190b5f-1326387808', // 填写云托管对象存储桶名称
    Region: process.env.Region || 'ap-shanghai' // 存储桶地域，默认是上海，其他地域环境对应填写
}
//判断用户信息是否为空
const userValidator = async (ctx, next) => {
    const { username, password } = ctx.request.body
    const headers = ctx.request.headers;
    console.log(JSON.stringify(headers, null, 2), 'kkkkkkkkkkkkkkkkk')
    // 合法性
    if (!username || !password) {
        console.error('用户名或密码为空', ctx.request.body)
        // 抛出给下方报错的地方
        ctx.app.emit('error', userFormateError, ctx)
        return
    }

    await next()
}
//判断用户是否存在
const verifyUser = async (ctx, next) => {
    const { username } = ctx.request.body

    // if (await getUerInfo({ user_name })) {
    //   ctx.app.emit('error', userAlreadyExited, ctx)
    //   return
    // }
    try {
        const res = await getUerInfo({ user_name: username })

        if (res) {
            console.error('用户名已经存在', { username })
            //ctx.app.emit('error', err, ctx),'error'是错误类型,err和ctx会传给app.on('error',( err, ctx)=>{})
            ctx.app.emit('error', userAlreadyExited, ctx)
            return
        }
    } catch (err) {
        console.error('获取用户信息错误', err)
        ctx.app.emit('error', userRegisterError, ctx)
        return
    }



    await next()
}
//给密码加密
const crpytPassword = async (ctx, next) => {
    const { password } = ctx.request.body

    const salt = bcrypt.genSaltSync(10)
    // hash保存的是 密文
    //即使密码是一样的,输出的hash都会不一样
    const hash = bcrypt.hashSync(password, salt)

    ctx.request.body.password = hash

    await next()
}


//验证登录,和这个verifyUser中间件差不多,查询数据库,解密密码,然后和前端传来的密码进行对比
const verifyLogin = async (ctx, next) => {
    // 1. 判断用户是否存在(不存在:报错)
    const { username, password } = ctx.request.body

    try {
        const res = await getUerInfo({ user_name: username })
        // console.log(res, 'rrrrrrrrrrrrrrrrrrrr');
        if (!res) {
            console.error('用户名不存在', { username })
            ctx.app.emit('error', userDoesNotExist, ctx)
            return
        }

        // 2. 密码是否匹配(不匹配: 报错)
        //只要密码匹配,不管hash是否不一样, 都会返回true
        if (!bcrypt.compareSync(password, res.password)) {
            ctx.app.emit('error', invalidPassword, ctx)
            return
        }
    } catch (err) {
        console.error(err)
        return ctx.app.emit('error', userLoginError, ctx)
    }

    await next()
}

// 3. 验证通过, 放行,获得临时操作权限,当token过期了,就需要重新登录,重新生成token
const auth = async (ctx, next) => {
    const { authorization } = ctx.request.header
    const token = authorization.replace('Bearer ', '')
    console.log(token)

    try {
        // user中包含了payload的信息(id, user_name, is_admin)
        //通过JWT_SECRET秘钥解析token, 获取负载信息,即加密进去的信息.
        const user = jwt.verify(token, JWT_SECRET)
        ctx.state.user = user
    } catch (err) {
        switch (err.name) {
            case 'TokenExpiredError':
                console.error('token已过期', err)
                return ctx.app.emit('error', tokenExpiredError, ctx)
            case 'JsonWebTokenError':
                console.error('无效的token', err)
                return ctx.app.emit('error', invalidToken, ctx)
        }
    }

    await next()
}


const SensitiveWords = async (ctx, next) => {
    const { username } = ctx.request.body
    const sensitiveWords = ['敏感词1', '敏感词2']
    for (const word of sensitiveWords) {

        //用来判断一个字符串是否包含另一个字符串，并根据情况返回 `true` 或 `false`。
        // let sentence = 'Hello world, welcome to the universe.';
        // let word = 'world';
        // console.log(sentence.includes(word)); // 输出：true


        if (username.includes(word)) {
            ctx.app.emit('error', SensitiveWordserror, ctx)
            return
        }
    }
    await next()
}


const testdb = async (ctx, next) => {


    const { code } = ctx.request.body

    console.log(code, 'mmmmmmmmmmmmmmmmm');

    const axios = require('axios');

    const aa = await axios.post('http://api.weixin.qq.com/wxa/business/getuserphonenumber', {
        // openid: `${ctx.headers['x-wx-openid']}`, // 可以从请求的header中直接获取 req.headers['x-wx-openid']
        // version: 2,
        // scene: 2,
        // content: `${username}`
        code: `${code}`,
    })
    // .then(response => {

    //     console.log('检测成功,接口返回内容',response.data);//ctx.body=response.data
    //     return response.data;
    // })
    // .catch(error => {
    //     console.error('请求出错', error);
    // });
    console.log(aa.data, 'hhhhhhhhhhhhhhhhhhhhh')
    ctx.body = aa.data
    // Object.assign(ctx.body, aa.data)
}

/**
 * 封装的文件下载函数
 * @param {*} cloudpath 前端传入的cloudid
 * @param {*} filepath 保存本地路径
 */
async function getFile(cloudpath, filepath) {
    // console.log(this.cos, cosConfig.Bucket, cosConfig.Region, 'bbbbbbbbbbbbbbbbb')
    try {
        const res = await cos.getObject({
            Bucket: cosConfig.Bucket,
            Region: cosConfig.Region,
            Key: cloudpath,//前端传入的cloudid
            //将当前工作目录的路径./与给定的filepath参数连接起来，形成一个完整的文件路径。
            Output: path.join('./', filepath)//保存到本地
        })
        // console.log(res,'yyyyyyyyyyyyyyyyyyy');
        if (res.statusCode === 200) {
            return {
                code: 0,
                file: path.join('./', filepath)
            }
        } else {
            return {
                code: 1,
                msg: JSON.stringify(res)
            }
        }
    } catch (e) {
        console.log('下载文件失败', e.toString())
        return {
            code: -1,
            msg: e.toString()
        }
    }
}


/**
 * 封装的上传文件函数
 * @param {*} cloudpath 上传的云上路径
 * @param {*} filepath 本地文件路径
 */
async function uploadFile(cloudpath, filepath, openid = "") {
    const authres = await call({
        url: 'http://api.weixin.qq.com/_/cos/metaid/encode',
        method: 'POST',
        data: {
            openid: openid, // 管理端为空,把文件和上传的作者进行关联
            bucket: cosConfig.Bucket,
            paths: [cloudpath]
        }
    })
    try {
        //1719911021265是前端传入图片时的cloudid的尾部(除了jpg后缀),1719911025508.webp存在本地的文件名
        // console.log(cloudpath, filepath, 'cccccccccccccccccc');


        const res = await cos.putObject({
            Bucket: cosConfig.Bucket,
            Region: cosConfig.Region,
            Key: cloudpath,//前端传入的cloudid的尾部去除了jpg后缀,加入webp后缀。
            //prod-8gcmr08s23190b5f-1326387808/存储桶的id
            //所有的文件cloud://prod-......-1326387808都是一样的，只有尾部是前端起的名字
            //cloud://prod-8gcmr08s23190b5f.7072-prod-8gcmr08s23190b5f-1326387808/1719910572205.jpg
            //cloud://prod-8gcmr08s23190b5f.7072-prod-8gcmr08s23190b5f-1326387808/1719910572205.webp
            StorageClass: 'STANDARD',
            Body: fs.createReadStream(filepath),//创建可读流
            ContentLength: fs.statSync(filepath).size,//获取文件大小
            Headers: {
                'x-cos-meta-fileid': authres.respdata.x_cos_meta_field_strs[0]//用于权限认证的信息。
            },
            // onProgress: function (progressData) {//上传进度条
            //   console.log(JSON.stringify(progressData), 'wwwwwwwwwwwwww') 
            // }

        })
        if (res.statusCode === 200) {
            return {
                code: 0,
                file: JSON.stringify(res)
            }
        } else {
            return {
                code: 1,
                msg: JSON.stringify(res)
            }
        }
    } catch (e) {
        console.log('上传文件失败', e.toString())
        return {
            code: -1,
            msg: e.toString()
        }
    }
}
async function img2webp(fileid, openid) {

    const suffix = fileid.replace(/.*[.]/, '')
    // console.log(suffix, 'rrrrrrrrrrrrrrrrrrr');
    if (fileid != null && fileid.indexOf('cloud://') === 0 && suffix == 'jpg' || suffix == 'png') {
        const filePath = fileid.replace(/cloud:\/\/.{6,}.[0-9]*-.{6,}-[0-9]*\//, '/')
        const tempPath = new Date().getTime().toString()//等效于Date.now()
        //根据前端传入的cloudid 从在储存桶中获取图片
        const info = await getFile(filePath, tempPath + filePath.replace(/.*[.]/, '.'))
        // console.log(info, 'ooooooooooooooooo从在储存桶中获取图片')
        if (info.code === 0) {
            //如果获取图片成功，那么就把图片转换为webp格式
            const webppath = path.join('./', tempPath + '.webp')//
            // console.log(webppath, 'eeeeeeeeeeeeeeeeeee')
            try {
                const bb = await madewebp(info.file, webppath)
                // console.log(bb, 'iiiiiiiiiiiiiiiiiiiii')


                //上传到服务器
                // console.log(filePath.match(/.*[.]/)[0] + 'webp', filePath, 'sssssssssssssssss')
                //* filePath.match(/.*[.]/)[0] + 'webp'上传给云端的文件名，webppath文件本地路径
                const res = await uploadFile('/testfile' + filePath.match(/.*[.]/)[0] + 'webp', webppath, openid)
                //上传成功了并删除本地文件
                fs.unlinkSync(info.file)//jpg 
                fs.unlinkSync(webppath)//webp
                // console.log('文件处理结果', res.code)
                return {
                    code: 0,
                    fileid: fileid.match(/cloud:\/\/.*[.]/)[0] + 'webp'
                }
            } catch (e) {
                //上传失败了并删除本地文件
                fs.unlinkSync(info.file)//jpg
                return {
                    code: 1,
                    msg: '文件转换失败！' + e
                }
            }
        } else {
            return {
                code: 2,
                msg: '文件下载失败！' + info.msg
            }
        }
    } else if (suffix == 'mp4') {

        return {
            code: 3,
            msg: '视频上传成功'
        }

        //处理视频文件

        // ffmpeg('input.mp4')
        //   .outputOptions('-vcodec libx264', '-crf 28') // 使用 H.264 编码器，设置压缩质量
        //   .save('output.mp4')
        //   .on('end', () => {
        //     console.log('压缩完成');
        //   })
        //   .on('error', (err) => {
        //     console.error('压缩出错:', err);
        //   });

    } else {
        //处理其他文件
        return {
            code: 1,
            msg: '文件格式错误！'
        }
    }
}

function madewebp(prefile, outfile) {
    return new Promise((resolve, reject) => {
        const result = webp.cwebp(prefile, outfile, "-q 80", logging = "-v");
        result.then((response) => {
            resolve(response)
        });
    })

}

// console.log(webp.cwebp,'iiiiiiiiiiiiiiiiiii')

// 获取存储桶列表
async function getBucket() {
    try {
        const aa = await cos.getBucket({
            Bucket: cosConfig.Bucket,
            Region: cosConfig.Region,
            Prefix: '',
        });
        // console.log(JSON.stringify(aa, null, 2), 'ooooooooooooooooo');
        return aa.Contents;
    } catch (error) {
        throw error;
    }
}

async function moment() {
    const time = require('moment');
    return time.utc().format('YYYY-MM-DD HH:mm:ss');
}



//删除对象
async function deleteObject(cloud) {
    try {
        const aa = await cos.deleteMultipleObject({
            Bucket: cosConfig.Bucket,
            Region: cosConfig.Region,
            Objects: [{ Key: cloud }],// "Key": "testfile/1720093123416.webp"不要填完整的cloudid
        })
        console.log(JSON.stringify(aa, null, 2), 'ddddddddddddddddddddddd');
        return aa.Deleted;
    } catch (error) {
        throw error;
    }
}

//复制对象
async function ObjectCopy(cloud) {
    try {
        const aa = await cos.putObjectCopy({
            Bucket: cosConfig.Bucket,
            Region: cosConfig.Region,
            Key: 'testfile/1720093205814222.jpg',
            CopySource: '1720093205814.jpg',
        }, function (err, data) {
            console.log(err || data);
        }
        )
        // console.log(JSON.stringify(aa, null, 2), 'ddddddddddddddddddddddd')
        return aa
    } catch (error) {
        throw error;
    }
}


module.exports = {
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
}