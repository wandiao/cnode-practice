'use strict';

const Controller = require('egg').Controller;
const validator = require('validator');

class SignController extends Controller {

  async showLogin() {
    const { ctx } = this;
    await ctx.render('/sign/signin', { pageTitle: '登录' });
  }

  async signin() {
    const { ctx, service, config } = this;
    const name = validator.trim(ctx.request.body.name || '').toLowerCase();
    const pass = validator.trim(ctx.request.body.pass || '').toLowerCase();
    if (!name || !pass) {
      ctx.status = 422;
      await ctx.render('sign/signin', {
        error: '信息不完整',
      });
      return;
    }
    const getUser = username => {
      if (username.indexOf('@') > 0) {
        return service.user.getUserByMail(username);
      }
      return service.user.getUserByLoginName(username);
    };
    const user = await getUser(name);
    if (!user) {
      ctx.status = 403;
      await ctx.render('sign/signin', {
        error: '用户名不存在',
      });
      return;
    }
    const equal = ctx.helper.bcompare(pass, user.pass);
    if (!equal) {
      ctx.status = 403;
      await ctx.render('sign/signin', {
        error: '用户名或密码错误',
        name,
      });
      return;
    }

    // id存入Cookie, 用于验证过期.
    const auth_token = user._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
    const opts = {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      signed: true,
      httpOnly: true,
    };
    ctx.cookies.set(config.auth_cookie_name, auth_token, opts); // cookie 有效期30天
    ctx.redirect('/');
  }

  async showSignup() {
    const { ctx } = this;
    await ctx.render('/sign/signup', {
      pageTitle: '注册',
    });
  }

  async signup() {
    const { ctx, service, config } = this;
    const loginname = validator.trim(ctx.request.body.loginname || '').toLowerCase();
    const email = validator.trim(ctx.request.body.email || '').toLowerCase();
    const pass = validator.trim(ctx.request.body.pass || '');
    const rePass = validator.trim(ctx.request.body.re_pass || '');

    let msg;
    if ([ loginname, pass, rePass, email ].some(i => !i)) {
      msg = '信息不完整';
    } else if (loginname.length < 5) {
      msg = '用户名至少需要5个字符';
    } else if (!ctx.helper.validateId(loginname)) {
      msg = '用户名不合法';
    } else if (!validator.isEmail(email)) {
      msg = '邮箱不合法';
    } else if (pass !== rePass) {
      msg = '两次密码输入不一致';
    }

    if (msg) {
      ctx.status = 422;
      await ctx.render('sign/signup', {
        error: msg,
        loginname,
        email,
      });
      return;
    }

    const user = await service.user.getUserByQuery({
      $or: [
        { loginname },
        { email },
      ],
    }, {});

    if (user.length) {
      ctx.status = 422;
      await ctx.render('sign/signup', {
        error: '用户名或邮箱已被使用。',
        loginname,
        email,
      });
      return;
    }

    const passhash = ctx.helper.bhash(pass);

    const avatarUrl = service.user.makeGravatar(email);

    await service.user.newAndSave(loginname, loginname, passhash, email, avatarUrl, false);

    await ctx.render('sign/signup', {
      success: '欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。',
    });
  }
}

module.exports = SignController;