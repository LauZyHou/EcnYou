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

对于使用了邮箱服务的云函数（如`mainTrigger`和`sendEmail2`），还应：

```bash
npm install nodemailer
```

以生成`package-lock.json`，这样上传后云端才知道安装哪些包。

### 部署

#### 数据库

集合有：`academy`,`codes`,`metaData`,`reportMsgA`,`reportMsgB`,`users`,`diffMsg`。

在`metaData`中补充运行所需的元信息，具体是：

```json
{
    "_id": "1",
    "lastTable": "reportMsgA",
    "nextTable": "reportMsgB"
}
```

#### 云函数/触发器

在微信开发者工具中右键上传即可。另外在云开发中设置各个云函数的超时时间，批量发邮件和爬取信息需要较长时间，最多可以设置20秒。

## 云函数/触发器简要说明

- `breakBinding` 用户解除绑定邮箱

- `crawInNextTable` 实际是个触发器。爬取数据，写入next集合(见metaData集合)

- `diffTrigger` 从新旧集合生成每个学院的更新HTML,写入diffMsg集合并返回

- `exchangeTrigger` 交换在metaData中的AB表

- `getAcademy` 获取新表中学院id->[{name:"讲座标题",url:"完整url"},...]的映射信息

- `getDataOrigin` 获取数据源数字并解析成['sei','cs']的形式

- `mainTrigger` 形成邮件并按订阅发给用户

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

## 触发器次序和功能说明

由于云开发服务器的性能非常非常差，且超时时间最多只有20秒，且每次查询最多100条，不得不将业务分开写，并用多次随机执行的方式保证爬取效果

1. 一次`resetTrigger`，重置所有学院为未爬取(`crawed:false`)，未diff(`diffed:false`)，重置metaData中邮件发送编号为0(`email_num: 0`)

时机：每天17:00

2. 一次`exchangeTrigger`，交换在metaData中的AB表

时机：每天17:01

3. 若干次`crawInNextTable`爬取新信息，对于为`crawed:true`状态的学院不再爬取

时机：每天17:03-17:06，每25秒运行一次

4. 若干次`diffTrigger`，将diff信息写入diffMsg表，对于为`diffed:true`的学院不再做此操作

时机：每天17:07-17:09，每25秒运行一次

5. 若干次`mainTrigger`向用户发邮件，每次发送`uid`在`max_num`小区间内(`email_num<=uid<email_num+max_num`)的用户，发送后设置`email_num+=max_num`

时机：每天17:10-17:40，每25秒运行一次（如`max_num=5`这样至少可以服务300个用户，视用户数目提升延后结束时间）
