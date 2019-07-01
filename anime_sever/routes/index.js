var express = require('express');
var router = express.Router();

var md5 = require('md5');

// 指定过滤的属性
const filter = { password: 0, __v: 0 }
var UserModel = require('../models/User')
// var AnimeModel = require('../models/Anime')
var GameModel = require('../models/Game')
var Business = require('../models/Business')

/* 注册 */
router.post('/api/register', function (req, res) {
  console.log(111111)
  const { username, password } = req.body;
  UserModel.findOne({ username }, function (err, user) {
    console.log(user)
    if (err) {
      console.log('~~注册findOne出错~~')
      console.log(err)
      res.send({
        code: 1,
        msg: '注册出错'
      })
      return
    }
    if (user) {
      res.send({
        code: 2,
        msg: '用户已存在'
      })
    } else {
      new UserModel({ username, password: md5(password) }).save(function (err, user) {
        if (err) {
          console.log('~~新增用户出错~~')
          console.log(err)
          res.send({
            code: 1,
            msg: '注册出错'
          })
        }
        // 生成cookie(userid:user._id),并交给浏览器保存
        // res.cookie('userid', user._id, { maxAge: 60 * 60 * 24 * 1000 })
        const data = {
          username,
          id: user._id,
          anime: []
        }
        res.send({
          code: 0,
          data
        })
      })
    }
  })
})

/* 登录 */
router.post('/api/login', function (req, res) {
  const { username, password } = req.body;
  // 不返回__v
  UserModel.findOne({ username }, { __v: 0 }, (err, user) => {
    if (err) {
      console.log('~~登录出错~~')
      console.log(err)
      return
    }
    if (user) {
      const pwd = user.password;
      if (pwd === md5(password)) {
        var data = {};
        data.username = user.username;
        data._id = user._id;

        res.cookie('userid', user._id, { maxAge: 60 * 60 * 24 * 1000 })
        // req.session.userid = _id;
        res.send({
          code: 0,
          data
        })
      } else {
        res.send({
          code: 1,
          msg: '密码错误！'
        })
      }
    } else {
      res.send({
        code: 1,
        msg: '用户不存在！'
      })
    }
  })
})


// 获取用户信息
router.post('/api/user', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
  }
  const userid = req.cookies.userid;
  UserModel.find({ _id: userid }, { password: 0, __v: 0, anime: 0 }, function (err, user) {
    if (err) {
      res.send({
        code: 1,
        data: '查找失败'
      })
    }
    res.send({
      code: 0,
      data: user[0]
    })
  })
})

// 检查用户名是否存在
router.post('/api/checkUser', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
  }
  const userid = req.cookies.userid;
  username = req.body.username;


  UserModel.findOne({ username }, filter, function (err, user) {
    let id = user._id;
    console.log(userid != id)
    if (err) {
      console.log('~~注册findOne出错~~')
      console.log(err)
      res.send({
        code: 1,
        msg: '注册出错'
      })
      return
    }
    if (user && userid != id) {
      res.send({
        code: 2,
        msg: '用户名已被使用'
      })
    } else {
      res.send({
        code: 0,
        msg: '用户名可使用'
      })
    }
  })
})

// 修改用户资料
router.post('/api/editUser', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
  }
  const userid = req.cookies.userid;
  let msg = req.body;
  UserModel.findOne({ _id: userid }, function (err, user) {
    if (err) {
      res.send({
        code: 1,
        data: '查询出错'
      })
    }

    console.log(user)
    user.username = msg.username;
    user.header = msg.header;
    user.email = msg.email;

    console.log(user)
    UserModel.update({ _id: userid }, { $set: user }, { multi: true }, function (err, msg) {
      if (err) {
        res.send({
          code: 1,
          data: '修改出错'
        })
      }
      console.log(msg)
      res.send({
        code: 0,
        data: '修改成功'
      })
    })

  })
})



// 新增视频
router.post('/api/addAnime', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
  }
  const userid = req.cookies.userid
  let time = new Date().getTime();
  let id = userid + time;
  // UserModel.findOne({ _id: userid }, filter, function (error, user) {
  //   res.send({ code: 0, data: user })
  // })
  let msg = { ...req.body };
  msg.userid = userid;
  msg.id = id;
  UserModel.update({ _id: userid }, { $push: { anime: msg } }, function (error) {
    if (error) {
      console.log(error)
      res.send({ code: 0, msg: '新增失败' })
    }
    res.send({ code: 0, msg: '新增成功' })
  })


})


// 查询全部Acg
router.post('/api/allAcg', function (req, res) {
  // res.cookie('userid', '', { expires: new Date(0)}); 
  // const userid = req.session.userid
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
  }
  let type = req.body.type;
  let size = 20;
  let page = req.body.page - 1;
  let start = page * size;
  let end = start + size;

  const userid = req.cookies.userid
  UserModel.find({ _id: userid }, filter, function (error, users) {

    let search = req.body.search;
    let anime = users[0].anime
    // if(!anime || anime.length==0){
    //   res.send({ code: 0, data: [] })
    //   return
    // }
    list = anime.filter((item) => {
      return item.videotype === type
    })
    if (search.playStatus) {
      list = list.filter((item) => {
        return item.playStatus === search.playStatus
      })
    }
    if (search.lookOver) {
      list = list.filter((item) => {
        return item.lookOver === search.lookOver
      })
    }
    if (search.changeDay) {
      list = list.filter((item) => {
        return item.lookOver === search.changeDay
      })
    }
    if (search.title) {
      list = list.filter((item) => {
        return item.title.indexOf(search.title) >= 0
      })
    }

    let lists = list.slice(start, end)

    let data = {
      anime: lists,
      length: list.length
    }
    res.send({ code: 0, data: data })
  })
})

// 查询视频详情
router.post('/api/animeDetail', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
  }
  const userid = req.cookies.userid
  UserModel.find({ _id: userid }, filter, function (err, users) {
    let anime = users[0].anime;
    let animeId = req.body.id;
    let msg = anime.find(item => {
      return item.id === animeId
    })
    if (!msg) {
      res.send({ code: 1, data: '未找到相关信息' })
    } else {
      res.send({ code: 0, data: msg })
    }
  })
})

// 修改视频详情
router.post('/api/changeAnime', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
  }
  const userid = req.cookies.userid
  UserModel.find({ _id: userid }, filter, function (err, users) {
    let list = users[0].anime;
    let animeId = req.body.id;
    let index = null;
    let msg = list.find((item, idx) => {
      index = idx;
      return item.id === animeId
    })
    if (!msg) {
      res.send({ code: 1, data: '未找到相关信息' })
    } else {
      list.splice(index, 1, req.body.msg);

      UserModel.update({ _id: userid }, { $set: { anime: list } }, function (error) {
        if (error) {
          console.log(error)
          res.send({ code: 0, msg: '修改失败' })
        }
        res.send({ code: 0, msg: '修改成功' })
      })

    }
  })
})

// 删除动画
router.post('/api/delAnime', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
  }
  const userid = req.cookies.userid
  UserModel.find({ _id: userid }, filter, function (err, users) {
    let list = users[0].anime;
    let animeId = req.body.id;
    let index = null;
    let msg = list.find((item, idx) => {
      index = idx;
      return item.id === animeId
    })
    if (!msg) {
      res.send({ code: 1, data: '未找到相关信息' })
    } else {
      list.splice(index, 1);
      UserModel.update({ _id: userid }, { $set: { anime: list } }, function (error) {
        if (error) {
          console.log(error)
          res.send({ code: 0, msg: '删除失败' })
        }
        res.send({ code: 0, msg: '删除成功' })
      })
    }
  })
})






// 新增游戏
router.post('/api/addGame', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }
  let msg = req.body;
  msg.userid = req.cookies.userid;
  // console.log(req.body)
  new GameModel(req.body).save(function (err, game) {
    if (err) {
      console.log('~~新增游戏出错~~')
      console.log(err)
      res.send({
        code: 1,
        msg: '新增游戏失败'
      })
      return
    }
    // 生成cookie(userid:user._id),并交给浏览器保存
    // res.cookie('userid', user._id, { maxAge: 60 * 60 * 24 * 1000 })
    res.send({
      code: 0,
      data: game
    })
  })

})

// 查询全部游戏
router.post('/api/allGame', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }
  let userid = req.cookies.userid;
  let type = req.body.type;
  let size = 20;
  let page = req.body.page - 1;
  let start = page * size;
  let end = start + size;
  let search = req.body.search;

  // let find = {
  //   userid,
  //   saleStatus: type,
  //   playStatus: search.playStatus,
  //   title: new RegExp(req.body.title)
  // }
  console.log(req.body)
  let find = {
    userid,
    saleStatus: type,
  }
  if (search.playStatus) {
    find.playStatus = search.playStatus
  }
  if (search.title) {
    find.title = new RegExp(search.title)
  }

  let length = 0;

  GameModel.find(find, filter, function (err, lists) {
    if (err) {
      res.send({
        code: 1,
        data: '请求错误'
      })
      console.log(err)
      console.log(lists)
    }
    length = lists.length;
    GameModel.find(find, filter).skip(start).limit(size).exec(function (err, list) {
      if (err) {
        res.send({
          code: 1,
          data: '请求错误'
        })
        console.log(err)
      }
      let data = {
        list: list,
        length: length
      }
      res.send({
        code: 0,
        data: data
      })
    })
  })

})

// 查询游戏详情
router.post('/api/gameDetail', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }
  GameModel.findOne({ _id: req.body.id }, filter, function (err, msg) {
    if (err) {
      res.send({
        code: 1,
        data: '获取信息错误'
      })
      return
    }
    res.send({
      code: 0,
      data: msg
    })
  })
})

// 更改游戏详情
router.post('/api/changeGame', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }
  let id = req.body.id;
  let newMsg = req.body.msg;
  GameModel.findOne({ _id: id }, filter, function (err) {
    if (err) {
      res.send({
        code: 1,
        data: '没有相关信息'
      })
      return
    }
    GameModel.update({ _id: id }, { $set: newMsg }, { multi: true }, function (err, raw) {
      if (err) {
        res.send({
          code: 1,
          data: '修改失败'
        })
      }
      res.send({
        code: 0,
        data: '修改成功'
      })
      console.log('raw 就是mongodb返回的更改状态的falg ', raw);
      //比如: { ok: 1, nModified: 2, n: 2 }
    });
  })
})


// 删除游戏详情
router.post('/api/delGame', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }
  GameModel.findOneAndRemove({ _id: req.body.id }, function (err, msg) {
    if (err) {
      console.log("Error:" + err);
      res.send({
        code: 1,
        data: '删除失败'
      })
    }
    else {
      res.send({
        code: 0,
        data: '删除成功'
      })
    }
  })
})

// 新增日程
router.post('/api/addSchedule', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }
  let msg = req.body;
  msg.userid = req.cookies.userid;
  let date = req.body.date;
  let month = req.body.month;
  let year = req.body.year;
  let start = `${year}-${month}-${date} 00:00:00`
  start = new Date(start).getTime()
  let date2 = req.body.date2;
  let month2 = req.body.month2;
  let year2 = req.body.year2;
  let end = `${year2}-${month2}-${date2} 00:00:00`
  end = new Date(end).getTime();
  end += 24 * 60 * 60 * 1000;
  msg.end = end;
  msg.start = start;
  // console.log(req.body)
  new Business(req.body).save(function (err, schedule) {
    if (err) {
      console.log('~~新增日程出错~~')
      console.log(err)
      res.send({
        code: 1,
        msg: '新增日程失败'
      })
      return
    }
    res.send({
      code: 0,
      data: schedule
    })
  })

})


// 获取每月日程信息
router.post('/api/getSchedule', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }
  let userid = req.cookies.userid;
  let year = parseInt(req.body.y);
  let month = parseInt(req.body.m);
  Business.find({ userid: userid, year: year, month: month }, function (err, results) {
    if (err) {
      console.log(err)
      res.send({
        code: 1,
        data: '获取每月日程失败'
      })
    }
    var r = [];
    //这个月有多少天
    if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
      var days = 31;
    } else if (month != 2) {
      var days = 30;
    } else if (month == 2) {
      if ((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0)) {
        var days = 29;
      } else {
        var days = 28;
      }
    }
    //遍历这么多天
    for (var i = 1; i <= days; i++) {
      //寻找这一天做的事情，本月的事情是results
      //过筛子
      var schedule = []
      if (results) {
        schedule = results.filter(item => {
          return item.date == i;
        })
      }
      //排序
      schedule.sort(function (a, b) {
        if (a.hour > b.hour) {
          return 1;
        } else if (a.hour == b.hour) {
          if (a.minutes > b.minutes) {
            return 1;
          }
        }
        return -1;
      });
      r.push({
        "day": i,
        "schedule": schedule
      });
    }
    res.send({
      code: 0,
      data: r
    });
  })

})

// 查找某日日程
router.post('/api/getDay', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }

  let userid = req.cookies.userid;
  let day = req.body.day;
  day = new Date(`${day} 00:00:00`).getTime();

  Business.find({ userid: userid, end: { $gt: day }, start: { $lte: day } }, filter, function (err, list) {
    if (err) {
      res.send({
        code: 1,
        data: '查询出错'
      })
      return
    }
    res.send({
      code: 0,
      data: list
    })
  })
})

// 删除任务
router.post('/api/delSchedule', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }
  let userid = req.cookies.userid;
  let id = req.body.id;
  Business.remove({ userid: userid, _id: id }, function (err, msg) {
    if (err) {
      res.send({
        code: 1,
        data: '删除失败'
      })
    }
    res.send({
      code: 0,
      data: '删除成功'
    })
  })
})

// 修改任务
router.post('/api/changeSchedule', function (req, res) {
  if (!req.cookies || !req.cookies.userid) {
    res.send(401)
    return
  }
  let userid = req.cookies.userid;
  let msg = req.body;
  let id = msg.id;
  Business.findOne({ _id: id, userid: userid }, filter, function (err, old) {
    if (err) {
      res.send({
        code: 1,
        data: '没有相关信息'
      })
      return
    }
    let date = req.body.date;
    let month = req.body.month;
    let year = req.body.year;
    let start = `${year}-${month}-${date} 00:00:00`
    start = new Date(start).getTime()
    let date2 = req.body.date2;
    let month2 = req.body.month2;
    let year2 = req.body.year2;
    let end = `${year2}-${month2}-${date2} 00:00:00`
    end = new Date(end).getTime();
    end += 24 * 60 * 60 * 1000;
    msg.end = end;
    msg.start = start;
    Business.update({ _id: id }, { $set: msg }, { multi: true }, function (err, raw) {
      if (err) {
        res.send({
          code: 1,
          data: '修改失败'
        })
      }
      res.send({
        code: 0,
        data: '修改成功'
      })
      console.log('raw 就是mongodb返回的更改状态的falg ', raw);
      //比如: { ok: 1, nModified: 2, n: 2 }
    });
  })
})


module.exports = router;
