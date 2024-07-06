const axios = require('axios');

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

function initcos() {
    const COS = require('cos-nodejs-sdk-v5')
    return new Promise((resolve, reject) => {
        try {
            const cos = new COS({
                getAuthorization: async function (options, callback) {
                    const res = await call({
                        url: 'http://api.weixin.qq.com/_/cos/getauth',
                        method: 'GET',
                        data: {}// 可从 options 取需要的参数
                    })
                    const auth = {
                        TmpSecretId: res.TmpSecretId,// 临时密钥的 tmpSecretId
                        TmpSecretKey: res.TmpSecretKey,// 临时密钥的 tmpSecretId
                        SecurityToken: res.Token,// 临时密钥的 sessionToken
                        ExpiredTime: res.ExpiredTime// 临时密钥失效时间戳，是申请临时密钥时，时间戳加 durationSeconds
                    }

                    callback(auth)
                }
            })
            resolve(cos)

            console.log('COS初始化成功')
        } catch (e) {
            console.log('COS初始化失败',)
        }
    })

}



module.exports = {
    initcos: initcos(),
    call
};
