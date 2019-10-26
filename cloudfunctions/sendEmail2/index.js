const cloud = require('wx-server-sdk');
var config = require('config');


cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

//引入发送邮件的类库
var nodemailer = require('nodemailer');
// 创建一个SMTP客户端配置
var config = {
  service: 'QQ', //邮箱类型
  auth: {
    user: 'ecnyou@foxmail.com', //邮箱账号
    pass: config.email.pass //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
// 云函数入口函数
exports.main = async (event, context) => {
  // 创建一个邮件对象
  var mail = {
    from: 'ecnyou@foxmail.com',//[!]这里必须和user一样,并且不能用config.xxx方式!!!!!!
    // 主题
    subject: event.subject,
    // 收件人
    to: event.to,
    // 邮件内容，text或者html格式
    html: event.html //可以是链接，也可以是验证码
  };

  let res = await transporter.sendMail(mail);
  return res;
}
