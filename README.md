# EcnYou

EcnYou微信小程序。

## 配置

### 补充配置文件

为了开源不暴露敏感信息，设置了某些配置文件不被Git管理。

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

其它需补充的配置文件，见`.gitignore`文件中的描述。

### 本地调试云函数

```bash
npm install
```

对于使用了爬虫的云函数（如`webCrawler`和`crawInNextTable`），还应：

```bash
npm install superagent
npm install cheerio
```

以生成`package-lock.json`，这样上传后云端才知道安装哪些包。

### 部署

#### 数据库

集合有：`academy`,`codes`,`metaData`,`reportMsgA`,`reportMsgB`,`users`。

在`metaData`中补充运行所需的元信息，具体是：

```json
{
    "_id": "1",
    "lastTable": "reportMsgA",
    "nextTable": "reportMsgB"
}
```

#### 云函数/触发器

在微信开发者工具中右键上传即可。

## 云函数/触发器简要说明

- `breakBinding` 用户解除绑定邮箱

- `crawInNextTable` 爬取数据，写入next集合(见metaData集合)

- `getDataOrigin` 获取数据源数字并解析成['sei','cs']的形式

- `refreshReportMsg` 仅用于测试触发器功能的云函数

- `sendEmail2` 向用户发送邮件,传入主题、收件人、内容HTML

- `sendVerifyCode` 用户尝试提交验证码,以完成邮箱绑定(用户向服务器send验证码)

- `sendVerifyEmail` 用户尝试绑定邮箱,输入了邮箱,生成并向用户发送一个4位验证码邮件(向用户邮箱send邮件)

- `setDataOrigin` 用户保存设置的订阅数据源

- `webCrawler` 用于测试爬取效果、首次爬取数据源信息、数据源当前信息，仅用于本地执行的云函数

## 页面简要说明

- `academic-report` 学术报告

- `index` 主页面

- `settings` 设置

- `settings/data-origin` 数据源设置

- `settings/notice` 邮件设置

- `todo-list` 计划任务



