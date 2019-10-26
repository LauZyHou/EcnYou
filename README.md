# EcnYou_Front

EcnYou微信小程序前端，Node.js书写云开发。

## 配置

添加`cloudfunctions/sendEmail2/config.js`，以如下格式：

```js
module.exports = {
  //邮件配置
  email: {
    service: '邮件服务,如QQ',
    user: '发送方邮件地址',
    pass: '权限密码',
  }
}
```

其它配置文件，见`.gitignore`文件中的描述。