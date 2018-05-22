'use strict';

const Controller = require('egg').Controller;
const validator = require('validator');

class UserController extends Controller {
  async showSetting() {
    const { ctx, service } = this;
    const id = ctx.user._id;
    const user = await service.user.getUserById(id);
    if (ctx.request.query.save === 'success') {
      user.success = '保存成功。';
    }

    return await ctx.render('user/setting', { user, pageTitle: '设置' });
  }

  async setting() {
    const { ctx, service } = this;

    // 显示错误消息
    async function showMessage(msg, data, isSuccess) {
      data = data || ctx.request.body;
      const user = {
        loginname: data.loginname,
        email: data.email,
        url: data.url,
        location: data.location,
        signature: data.signature,
        weibo: data.weibo,
        accessToken: data.accessToken,
      };

      if (isSuccess) {
        user.success = msg;
      } else {
        user.error = msg;
      }
      return await ctx.render('user/setting', { user });
    }

    const { body } = this.request;
    const action = body.action;
    if (action === 'change_setting') {
      const url = validator.trim(body.url);
      const location = validator.trim(body.location);
      const weibo = validator.trim(body.weibo);
      const signature = validator.trim(body.signature);

      const user = await service.user.getUserById(ctx.user_id);
      user.url = url;
      user.location = location;
      user.signature = signature;
      user.weibo = weibo;
      await user.save();
      return ctx.redirect('/setting?save=success');
    }

    if (action === 'change_password') {
      const oldPass = validator.trim(body.oldPass);
      const newPass = validator.trim(body.newPass);
      if (!oldPass || !newPass) {
        return showMessage('旧密码或新密码不得为空');
      }
      const user = await service.user.getUserById(ctx.user._id);
      const equal = ctx.helper.bcompare(oldPass, user.pass);
      if (!equal) {
        return showMessage('当前密码不正确。', user);
      }
      const newPassHash = ctx.helper.bhash(newPass);
      user.pass = newPassHash;
      await user.save();
      return showMessage('密码已被修改。', user, true);
    }
  }
}

module.exports = UserController;