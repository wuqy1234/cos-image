//模板搭建
const initcos = require('../初始化cos/index');
let cos;
(async () => {
    cos = await initcos;
    ObjectCopy()
})()

async function call(obj) {
    const axios = require('axios');
    try {
        const response = await axios({
            url: obj.url,
            method: obj.method || 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: obj.data || {}
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
const cosConfig = {
    Bucket: process.env.Bucket || '7072-prod-8gcmr08s23190b5f-1326387808', // 填写云托管对象存储桶名称
    Region: process.env.Region || 'ap-shanghai' // 存储桶地域，默认是上海，其他地域环境对应填写
}

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
    getBucket,
    deleteObject,
    ObjectCopy
};