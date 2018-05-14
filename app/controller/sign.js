'use strict';

const Controller = require('egg').Controller;

class SignController extends Controller {
  async showSignup() {
    const { ctx } = this;
    await ctx.render('/sign/signup', {
      pageTitle: '注册',
    });
  }
}

module.exports = SignController;