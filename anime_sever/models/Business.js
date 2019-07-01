var mongoose = require('mongoose');


var businessSchema = new mongoose.Schema({
	title: { type: String, required: true },
	year: { type: Number, required: true },
	month: { type: Number, required: true }, //1、2、3、4、5、6、7、8、9、10、11、12
	date: { type: Number, required: true }, //日子，不是日期

	year2: { type: Number, required: true },
	month2: { type: Number, required: true }, //1、2、3、4、5、6、7、8、9、10、11、12
	date2: { type: Number, required: true }, //日子 2011-11-11，不是日期

	hour: { type: Number, required: true },	//时间0、1、2、3、4……、23
	minutes: { type: Number, required: true }, //分钟0、1、2、3、……、59
	hour2: { type: Number, required: true },	//时间0、1、2、3、4……、23
	minutes2: { type: Number, required: true }, //分钟0、1、2、3、……、59
	type: { type: String, required: true },
	during: { type: Number, required: true },
	mome: { type: String, },
	userid: { type: String, required: true },

	start: { type: Number, required: true }, // 开始那天00：00：00的毫秒值
	end: { type: Number, required: true }, // 结束后一天00：00：00的毫秒值
	memo: { type: String } // 结束后一天00：00：00的毫秒值
});

//类
var Business = mongoose.model("Business", businessSchema);

//暴露
module.exports = Business;