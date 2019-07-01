/* 包含N个操作数据库集合数据的Model模块 */

/* 1. 连接数据库 */
// 1.1 引入mongoose
const mongoose = require('mongoose')

// // 1.2 连接指定数据库(url只有数据库是变化的)
// mongoose.connect('mongodb://localhost:27017/anime',{useNewUrlParser: true})

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
const animeSchema = new Schema({
  // const userSchema= mongoose.Schema({
  // 标题
  title: { type: String, required: true },
  // 类型 动画 日剧。。
  videotype: { type: String, required: true },
  // 连载状态
  playStatus: { type: String, required: true },
  // 是否看完
  lookOver: { type: String, required: true },
  // 备注
  memo: { type: String },
  // 下载链接
  link:{type: Array},
  // 封面图
  img: { type: String, required: true },
  // 更新时间
  changeDay: { type: String, required: true },
  // 用户id
  userid: { type: String, required: true },
})

// 2.2 定义Model(与集合对应，可以操作集合)
const AnimeModel = mongoose.model('anime', animeSchema)

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
module.exports = AnimeModel