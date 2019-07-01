/* 包含N个操作数据库集合数据的Model模块 */

/* 1. 连接数据库 */
// 1.1 引入mongoose
const mongoose = require('mongoose')

// // 1.2 连接指定数据库(url只有数据库是变化的)
// mongoose.connect('mongodb://localhost:27017/anime', { useNewUrlParser: true })

// // 1.3 获取连接对象
// const conn = mongoose.connection;

// // 1.4 绑定连接完成的监听(用来提示连接成功)
// conn.on('connected', function () {
//   console.log('~~数据库连接成功~~')
// })

/* 2.得到对应特定集合的Model */
// 2.1 定义Schema(描述文档结构)
/* 
link: Array(1)
url: "http://localhost:8080/anime-add"
urlTitle: "在线/下载地址"
*/
const Schema = mongoose.Schema;
const gameSchema = new Schema({
  // const userSchema= mongoose.Schema({
  // 标题
  title: { type: String, required: true },
  // 封面图
  img: { type: String },
  // 发售状态
  saleStatus: { type: String, required: true },
  // 游戏状态
  playStatus: { type: String, required: true },
  // 备注
  memo: { type: String },
  // 下载链接
  link: { type: Array },
  userid: { type: String, required: true },
})

// 2.2 定义Model(与集合对应，可以操作集合)
const GameModel = mongoose.model('game', gameSchema)

// new UserModel({ username:'aaa', password:'aaa' }).save(function(err,user){
//   console.log(12312)
//   console.log(user)
// })
// UserModel.find({username:'aaa'},function(err,data){
//   console.log(22222222)
//   console.log(err)
//   console.log(data)
// })

// 2.3向外暴露Model
// exports.UserModel = UserModel
module.exports = GameModel