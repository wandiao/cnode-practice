'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware, config } = app;
  const {
    site,
    sign,
  } = controller;

  const createUserLimit = middleware.createUserLimit();

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

  router.post('/passport/local', localStrategy);

  // github oauth
  app.passport.mount('github');
};
