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
    topic,
    reply,
  } = controller;

  const createUserLimit = middleware.createUserLimit(config.create_user_per_ip);
  const createTopicLimit = middleware.createTopicLimit(config.topic);
  const userRequired = middleware.userRequired();
  const adminRequired = middleware.adminRequired();

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

  // 新建文章界面
  router.get('/topic/create', userRequired, topic.create);
  router.post('/topic/create', userRequired, createTopicLimit, topic.put);

  router.get('/topic/:tid', topic.index); // 显示某个话题
  router.post('/topic/:tid/top', adminRequired, topic.top); // 将某话题置顶
  router.post('/topic/:tid/good', adminRequired, topic.good); // 将某话题加精
  router.post('/topic/:tid/lock', adminRequired, topic.lock); // 将某话题加精
  router.post('/topic/:tid/delete', adminRequired, topic.delete); // 将某话题加精

  router.get('/topic/:tid/edit', userRequired, topic.showEdit); // 编辑某话题
  router.post('/topic/:tid/edit', userRequired, topic.update);

  router.post('/topic/collect', userRequired, topic.collect); // 关注某话题
  router.post('/topic/de_collect', userRequired, topic.de_collect); // 取消关注某话题

  router.post('/:topic_id/reply', userRequired, reply.add); // 提交一级回复
};
