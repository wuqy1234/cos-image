// const Koa = require('koa')
// const app = new Koa()
// const bodyParser = require('koa-bodyparser');
// const Router = require('koa-router')
// const router = new Router()
// // const router = require('./cos-study/test')
// const axios = require('axios');
// const webp = require('webp-converter');
// const path = require('path');
// const fs = require('fs');
// // const ffmpeg = require('fluent-ffmpeg');//处理视频的封装库
// app.use(bodyParser()); //解析post请求
// // const initcos = require('./cos-study/初始化/index');
// // let cos;
// // initcos.then(e => {
// //   cos = e;
// //   // console.log(cos)
// // })
// // console.log(cos,'因为是异步函数，所以这里会打印null')


// const cosConfig = {
//   Bucket: process.env.Bucket || '7072-prod-8gcmr08s23190b5f-1326387808', // 填写云托管对象存储桶名称
//   Region: process.env.Region || 'ap-shanghai' // 存储桶地域，默认是上海，其他地域环境对应填写
// }

// router.post('/', async (ctx, next) => {
//   ctx.body = { msg: 'Hello World', ObjectCopy: await ObjectCopy() }


// })

// router.post('/made', async (ctx, next) => {
//   const { fileid, admin } = ctx.request.body
//   const openid = admin != null ? '' : ctx.headers['x-wx-openid']
//   // console.log(fileid, openid, admin == null, 'ppppppppppppppppppppppp');

//   const data = await img2webp(fileid, openid)
//   console.log(data, 'dddddddddddddddddddddd');
//   ctx.body = data
// })

// /**
//  * 封装的文件下载函数
//  * @param {*} cloudpath 前端传入的cloudid
//  * @param {*} filepath 保存本地路径
//  */
// async function getFile(cloudpath, filepath) {
//   // console.log(this.cos, cosConfig.Bucket, cosConfig.Region, 'bbbbbbbbbbbbbbbbb')
//   try {
//     const res = await cos.getObject({
//       Bucket: cosConfig.Bucket,
//       Region: cosConfig.Region,
//       Key: cloudpath,//前端传入的cloudid
//       //将当前工作目录的路径./与给定的filepath参数连接起来，形成一个完整的文件路径。
//       Output: path.join('./', filepath)//保存到本地
//     })
//     // console.log(res,'yyyyyyyyyyyyyyyyyyy');
//     if (res.statusCode === 200) {
//       return {
//         code: 0,
//         file: path.join('./', filepath)
//       }
//     } else {
//       return {
//         code: 1,
//         msg: JSON.stringify(res)
//       }
//     }
//   } catch (e) {
//     console.log('下载文件失败', e.toString())
//     return {
//       code: -1,
//       msg: e.toString()
//     }
//   }
// }



// /**
//  * 封装的上传文件函数
//  * @param {*} cloudpath 上传的云上路径
//  * @param {*} filepath 本地文件路径
//  */
// async function uploadFile(cloudpath, filepath, openid = "") { 
//   const authres = await call({
//     url: 'http://api.weixin.qq.com/_/cos/metaid/encode',
//     method: 'POST',
//     data: {
//       openid: openid, // 管理端为空,把文件和上传的作者进行关联
//       bucket: cosConfig.Bucket,
//       paths: [cloudpath]
//     }
//   })
//   try {
//     //1719911021265是前端传入图片时的cloudid的尾部(除了jpg后缀),1719911025508.webp存在本地的文件名
//     console.log(cloudpath, filepath, 'cccccccccccccccccc');


//     const res = await cos.putObject({
//       Bucket: cosConfig.Bucket,
//       Region: cosConfig.Region,
//       Key: cloudpath,//前端传入的cloudid的尾部去除了jpg后缀,加入webp后缀。
//       //prod-8gcmr08s23190b5f-1326387808/存储桶的id
//       //所有的文件cloud://prod-......-1326387808都是一样的，只有尾部是前端起的名字
//       //cloud://prod-8gcmr08s23190b5f.7072-prod-8gcmr08s23190b5f-1326387808/1719910572205.jpg
//       //cloud://prod-8gcmr08s23190b5f.7072-prod-8gcmr08s23190b5f-1326387808/1719910572205.webp
//       StorageClass: 'STANDARD',
//       Body: fs.createReadStream(filepath),//创建可读流
//       ContentLength: fs.statSync(filepath).size,//获取文件大小
//       Headers: {
//         'x-cos-meta-fileid': authres.respdata.x_cos_meta_field_strs[0]//用于权限认证的信息。
//       },
//       // onProgress: function (progressData) {//上传进度条
//       //   console.log(JSON.stringify(progressData), 'wwwwwwwwwwwwww') 
//       // }

//     })
//     if (res.statusCode === 200) {
//       return {
//         code: 0,
//         file: JSON.stringify(res)
//       }
//     } else {
//       return {
//         code: 1,
//         msg: JSON.stringify(res)
//       }
//     }
//   } catch (e) {
//     console.log('上传文件失败', e.toString())
//     return {
//       code: -1,
//       msg: e.toString()
//     }
//   }
// }
// (async () => {
//   const aa = "cloud://prod-8gcmr08s23190b5f.7072-prod-8gcmr08s23190b5f-1326387808/1719484323233.jpg"
//   const bb = '/' + aa.match(/(?<=cloud:\/\/.{6,}.[0-9]*-.{6,}-[0-9]*\/).+/)
//   const cc = aa.replace(/cloud:\/\/.{6,}.[0-9]*-.{6,}-[0-9]*\//, '/')
//   let dd = aa.match(/(?<=cloud:\/\/.{6,}.[0-9]*-.{6,}-[0-9]*\/).+/)
//   // console.log(Date.now() == new Date().getTime().toString(),typeof new Date().getTime()); 
//   // console.log(bb==cc);
//   // console.log(cc, dd)
//   // console.log(aa.replace(/.*[.]/, '.'));
//   // 定义文件名
//   const fileName = '123.jpg';
//   // 使用 path.join() 拼接路径
//   const filePath = path.join('./test/test/', fileName);
//   // console.log(filePath);


//   // const asd = await initcos
//   // console.log(asd, '这里就成功打印了lllllllllllllllllllllll');

// })()


// async function img2webp(fileid, openid) {

//   const suffix = fileid.replace(/.*[.]/, '')
//   console.log(suffix, 'rrrrrrrrrrrrrrrrrrr');
//   if (fileid != null && fileid.indexOf('cloud://') === 0 && suffix == 'jpg' || suffix == 'png') {
//     const filePath = fileid.replace(/cloud:\/\/.{6,}.[0-9]*-.{6,}-[0-9]*\//, '/')
//     const tempPath = new Date().getTime().toString()//等效于Date.now()
//     //根据前端传入的cloudid 从在储存桶中获取图片
//     const info = await getFile(filePath, tempPath + filePath.replace(/.*[.]/, '.'))
//     // console.log(info,'ooooooooooooooooo');}
//     if (info.code === 0) {
//       //如果获取图片成功，那么就把图片转换为webp格式
//       const webppath = path.join('./', tempPath + '.webp')//
//       try {
//         const bb = await madewebp(info.file, webppath)
//         // console.log(bb, 'iiiiiiiiiiiiiiiiiiiii')

//         //上传到服务器
//         // console.log(filePath.match(/.*[.]/)[0] + 'webp', filePath, 'sssssssssssssssss')
//         //* filePath.match(/.*[.]/)[0] + 'webp'上传给云端的文件名，webppath文件本地路径
//         const res = await uploadFile('/testfile' + filePath.match(/.*[.]/)[0] + 'webp', webppath, openid)
//         //上传成功了并删除本地文件
//         fs.unlinkSync(info.file)//jpg
//         fs.unlinkSync(webppath)//webp
//         // console.log('文件处理结果', res.code)
//         return {
//           code: 0,
//           fileid: fileid.match(/cloud:\/\/.*[.]/)[0] + 'webp'
//         }
//       } catch (e) {
//         //上传失败了并删除本地文件
//         fs.unlinkSync(info.file)//jpg
//         return {
//           code: 1,
//           msg: '文件转换失败！' + e
//         }
//       }
//     } else {
//       return {
//         code: 1,
//         msg: '文件下载失败！' + info.msg
//       }
//     }
//   } else if (suffix == 'mp4') {

//     return {
//       code: 0,
//       msg: '视频上传成功'
//     }

//     //处理视频文件

//     // ffmpeg('input.mp4')
//     //   .outputOptions('-vcodec libx264', '-crf 28') // 使用 H.264 编码器，设置压缩质量
//     //   .save('output.mp4')
//     //   .on('end', () => {
//     //     console.log('压缩完成');
//     //   })
//     //   .on('error', (err) => {
//     //     console.error('压缩出错:', err);
//     //   });

//   } else {
//     //处理其他文件
//     return {
//       code: 1,
//       msg: '文件格式错误！'
//     }
//   }
// }

// //可以压缩一下当缩略图
// function madewebp(prefile, outfile) {
//   return new Promise((resolve, reject) => {
//     const result = webp.cwebp(prefile, outfile, "-q 80", logging = "-v");
//     result.then((response) => {
//       resolve(response)
//     });
//   })

// }

// async function initcos() {
//   const COS = require('cos-nodejs-sdk-v5')
//   const res = await call({
//     url: 'http://api.weixin.qq.com/_/cos/getauth',
//     method: 'GET',
//   })

//   try {

//     const auth = {
//       TmpSecretId: res.TmpSecretId,
//       TmpSecretKey: res.TmpSecretKey,
//       SecurityToken: res.Token,
//       ExpiredTime: res.ExpiredTime
//     }
//     this.cos = new COS({
//       getAuthorization: async function (options, callback) {
//         callback(auth)
//       }
//     })
//     console.log('COS初始化成功')

//   } catch (e) {
//     console.log('COS初始化失败',)
//   }
// }
// async function ObjectCopy(cloud) {
//   try {
//     const aa = await cos.putObjectCopy({
//       Bucket: cosConfig.Bucket,
//       Region: cosConfig.Region,
//       Key: 'testfile/1720093205814.jpg',
//       CopySource: '1720093205814.jpg',
//     }, function (err, data) {
//       console.log(err || data);
//     }
//     )
//     // console.log(JSON.stringify(aa, null, 2), 'ddddddddddddddddddddddd')
//     return aa
//   } catch (error) {
//     throw error;
//   }
// }


// /**
//  * @param {object} obj 
//  * @returns object
//  */
// async function call(obj) {
//   const axios = require('axios');
//   try {
//     const response = await axios({
//       url: obj.url,
//       method: obj.method || 'post',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       data: obj.data || {}
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }



// app.use(router.routes())
// app.listen(80, async function () {
//   // cos = await initcos() //let cos = await initcos()
//   initcos()
//   console.log('图像处理服务启动成功！')
// })



const app = require('./cos-study/app/index')
const { APP_PORT } = require('./cos-study/配置文件/config.default')

// console.log(APP_PORT, 'kkkkkkkkkkkkkkkkkkkkkkkkk');
//启动服务器页面

app.listen(APP_PORT, () => {
  console.log(`服务器运行在:  "http://localhost:${APP_PORT}"`)
})