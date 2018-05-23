'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware, config } = app;
  const {
    site,
    sign,
    user,
  } = controller;

  const createUserLimit = middleware.createUserLimit();
  const userRequired = middleware.userRequired();

  router.get('/', site.index);

  if (config.allow_sign_up) {
    // 登录页面
    router.get('/signup', sign.showSignup);

    router.post('/signup', createUserLimit, sign.signup);
  } else {
    // 进行github验证
    router.redirect('/signup', '/passport/github');
  }

  const localStrategy = app.passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
  });

  router.post('/signin', localStrategy);

  // github oauth
  app.passport.mount('github');

  router.get('/signin', sign.showLogin); // 进入登录页面
  router.all('/signout', sign.signout);

  router.get('/setting', userRequired, user.showSetting); // 用户个人设置页
  router.post('/setting', userRequired, user.setting);
};
