const express = require('express')
const request = require('request')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const app = express()
app.use(express.json())

const cosConfig = {
  Bucket: process.env.Bucket || '', // 填写云托管对象存储桶名称
  Region: process.env.Region || 'ap-shanghai' // 存储桶地域，默认是上海，其他地域环境对应填写
}

app.get('/', function (req, res) {
  res.send('success')
})

app.get('/made', async function (req, res) {
  const { fileid ,admin} = req.query
  const openid=admin!=null?'':
  res.send(await img2webp(fileid))
})

app.listen(80, function () {
  initcos()
  console.log('图像处理服务启动成功！')
})

async function img2webp(fileid) {
  if (fileid != null && fileid.indexOf('cloud://') === 0) { // 判断是否是fileid
    const filePath = fileid.replace(/cloud:\/\/.{6,}.[0-9]*-.{6,}-[0-9]*\//, '/') // 将fileid处理一下，COS-SDK只需要目录
    const tempPath = new Date().getTime().toString() // 创建一个临时的文件名，便于处理
    const info = await getFile(filePath, tempPath + filePath.replace(/.*[.]/, '.')) // 下载文件，文件保存为临时名+后缀
    if (info.code === 0) { // 下载成功
      const webppath = path.join('./', tempPath + '.webp') // 确定转换后的存储地址
      try {
        await madewebp(info.file, webppath) // 开始转换，输入原文件和输出路径
        const res = await uploadFile(filePath.match(/.*[.]/)[0] + 'webp', webppath) // 上传文件，保存在同目录中，以webp后缀替换
        fs.unlinkSync(info.file) // 删除原始临时文件
        fs.unlinkSync(webppath) // 删除webp临时文件
        console.log('文件处理结果', res.code)
        return {
          code: 0,
          fileid: fileid.match(/cloud:\/\/.*[.]/)[0] + 'webp'
        }
      } catch (e) {
        fs.unlinkSync(info.file) // 删除原始临时文件
        return {
          code: 1,
          msg: '文件转换失败！' + e
        }
      }
    } else {
      return {
        code: 1,
        msg: '文件下载失败！' + info.msg
      }
    }
  } else {
    return {
      code: -1,
      msg: 'fileid缺失或者格式不正确！'
    }
  }
}

function madewebp(prefile, outfile) {
  return new Promise((resolve, reject) => {
    sharp(prefile).webp({ lossless: true }).toFile(outfile, function (err, info) {
      if (err) {
        reject(err.toString())
      } else {
        resolve(info)
      }
    })
  })
}

async function initcos() {
  const COS = require('cos-nodejs-sdk-v5')
  const res = await call({
    url: 'http://api.weixin.qq.com/_/cos/getauth',
    method: 'GET'
  })
  try {
    const info = JSON.parse(res)
    const auth = {
      TmpSecretId: info.TmpSecretId,
      TmpSecretKey: info.TmpSecretKey,
      SecurityToken: info.Token,
      ExpiredTime: info.ExpiredTime
    }
    this.cos = new COS({
      getAuthorization: async function (options, callback) {
        callback(auth)
      }
    })
    console.log('COS初始化成功')
  } catch (e) {
    console.log('COS初始化失败', res)
  }
}

/**
 * 封装的文件下载函数
 * @param {*} cloudpath 文件路径
 * @param {*} filepath 保存本地路径
 */
async function getFile(cloudpath, filepath) {
  try {
    const res = await this.cos.getObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: cloudpath,
      Output: path.join('./', filepath)
    })
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
async function uploadFile(cloudpath, filepath) {
  const authres = await call({
    url: 'http://api.weixin.qq.com/_/cos/metaid/encode',
    method: 'POST',
    data: {
      openid: '', // 管理端为空
      bucket: cosConfig.Bucket,
      paths: [cloudpath]
    }
  })
  try {
    const auth = JSON.parse(authres)
    const res = await this.cos.putObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: cloudpath,
      StorageClass: 'STANDARD',
      Body: fs.createReadStream(filepath),
      ContentLength: fs.statSync(filepath).size,
      Headers: {
        'x-cos-meta-fileid': auth.respdata.x_cos_meta_field_strs[0]
      }
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

function call(obj) {
  return new Promise((resolve, reject) => {
    request({
      url: obj.url,
      method: obj.method || 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(obj.data || {})
    }, function (err, response) {
      if (err) reject(err)
      resolve(response.body)
    })
  })
}