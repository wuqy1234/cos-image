# 微信云托管图像处理演示DEMO

## 一、项目介绍

本项目使用Node.js演示了一个图像处理流程，具体过程如下：

1. 从小程序中上传图片到对象存储，获取fileID
2. 在小程序中发送请求到自定义的云托管服务中，带入fileID
3. 服务中根据fileID下载小程序上传的图片，进行处理（在这里是转成webp格式），然后将处理好的图片上传到对象存储，获得fileID[2]
4. 服务将fileID[2]返回给小程序端，小程序根据fileID[2]下载图片，在前台展示。

上述的过程可以根据自己的业务任意拼合修改，项目的目的是将所有关键步骤的代码全部展示出来，方便你自己开发时借鉴。

## 二、项目部署

1. `index.js` 的第10行，可以填写对象存储的存储桶名称，具体在[微信控制台-对象存储-存储配置](https://cloud.weixin.qq.com/cloudrun/storage)中查看。
2. 在[微信云托管-服务管理](https://cloud.weixin.qq.com/cloudrun/service)中，创建新的服务，服务名称任意，在这里为`img`，创建后转到「服务设置」，先添加两个环境变量，`{"Bucket":"存储桶名称","Region":"存储桶地域"}`，填完后保存。
3. 然后在「部署发布」中上传此项目，开始部署发布流程。
4. 部署完后，可以在小程序（环境同属小程序）中直接在页面中使用了，以下代码是一个onLoad触发全流程的，包含上传，转换，下载，展示，根据自己业务需求拆分。

``` js
Page({
    async onLoad() {
        wx.cloud.init({
            env: '云托管环境ID'
        })
        wx.chooseImage({
            count: 1,
            async success(res) {
                console.log('开始上传文件',res.tempFilePaths[0])
                const { fileID } = await wx.cloud.uploadFile({
                    cloudPath: 'test.png', // 这个文件地址可以换成动态的
                    filePath: res.tempFilePaths[0]
                })
                console.log('上传成功，开始转换',fileID)
                const info = await wx.cloud.callContainer({
                    path: '/made',
                    method: 'GET',
                    data:{
                        fileid:fileID
                    },
                    header: {
                        'X-WX-SERVICE': 'img',
                    }
                });
                console.log('转换完毕',info.data);
                if(info.data.code===0){
                    console.log('开始下载转换文件',info.data.fileid);
                    const downfile = await wx.cloud.downloadFile({
                        fileID:info.data.fileid
                    }) 
                    wx.previewImage({
                      urls: [downfile.tempFilePath],
                    })
                }
            }
        })
    }
})
```

## 三、项目作者

- zirali
