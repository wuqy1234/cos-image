const { Sequelize } = require('sequelize')

const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PWD,
    MYSQL_DB,
} = require('../配置文件/config.default')

const seq = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PWD, {
    host: MYSQL_HOST,
    port: 3306,
    dialect: 'mysql',
    //打印日志的配置 console.info比console.log更详细,不配置此项时,默认是console.log
    // logging: console.info,
    //禁用日志,避免输出内部日志
    logging: false
});
console.log(MYSQL_HOST, 'oooooooooooooooooooooo');
seq
    .authenticate()
    .then(() => {
        console.log('数据库连接成功')
    })
    .catch((err) => {
        console.log('数据库连接失败', err)
    })



module.exports = seq