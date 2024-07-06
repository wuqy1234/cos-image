const { DataTypes } = require('sequelize');
const seq = require('./seq');

//需要先把数据库创建好,才能在这里做好映射

//'zd_user'数据库表的名字
const User = seq.define('zd_user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_admin: {
        type: DataTypes.INTEGER,
        defaultValue: 0,//默认值为零
    },
}, {
    tableName: 'zd_user',
    timestamps: false,
});

(async () => {
    try {
        await seq.sync({ alter: true }); // 如果表已存在，则根据模型修改表结构
        console.log('表创建成功');
    } catch (error) {
        console.error('创建表时出错:', error);
    }
})();
//把映射的模型导出,给service使用
module.exports = User;