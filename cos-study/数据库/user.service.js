const User = require('./user.model')

// Service 处理了业务逻辑

// 创建用户
class UserService {
    async createUser(user_name, password) {
        const userData = { user_name, password };
        const res = await User.create(userData);//创建用户
        return res;
    }

    // 查询 用户名是否存在， true
    async getUerInfo({ id, user_name, password, is_admin }) {
        const whereOpt = {}
        console.log('user_name:', user_name)
        id && Object.assign(whereOpt, { id })//assign类似数组push方法,此方法作用于对象
        user_name && Object.assign(whereOpt, { user_name })

        // User.findOne 查询 用户名是否存在
        const res = await User.findOne({//查询用户名是否存在
            attributes: ['id', 'user_name', 'password', 'is_admin'],
            where: whereOpt,
        })


        return res ? res.dataValues : null
    }

}

module.exports = new UserService()