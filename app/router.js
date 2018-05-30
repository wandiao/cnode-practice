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
    message,
    page,
    search,
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
  router.get('/active_account', sign.activeAccount); // 帐号激活

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

  router.get('/reply/:reply_id/edit', userRequired, reply.showEdit); // 修改自己的评论页
  router.post('/reply/:reply_id/edit', userRequired, reply.update); // 修改某评论
  router.post('/reply/:reply_id/delete', userRequired, reply.delete); // 删除某评论
  router.post('/reply/:reply_id/up', userRequired, reply.up); // 为评论点赞

  router.get('/my/messages', userRequired, message.index); // 用户个人的所有消息页

  router.get('/user/:name', user.index); // 用户个人主页

  router.post('/user/set_star', adminRequired, user.toggleStar); // 把某用户设为达人
  router.post('/user/cancel_star', adminRequired, user.toggleStar); // 取消某用户的达人身份
  router.post('/user/:name/block', adminRequired, user.block); // 禁言某用户
  router.post('/user/:name/delete_all', adminRequired, user.deleteAll); // 删除某用户所有发言
  router.get('/user/:name/collections', user.listCollectedTopics); // 用户收藏的所有话题页

  router.get('/about', page.about);
  router.get('/faq', page.faq);
  router.get('/getstart', page.getstart);
  router.get('/robots.txt', page.robots);
  router.get('/api', page.api);

  router.get('/search', search.index);
};
