'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1525846643127_6227';

  config.name = 'CNode技术社区';

  config.description = 'CNode：Node.js专业中文社区';

  config.keywords = 'nodejs, node, express, connect, socket.io';

  config.site_logo = '/public/images/cnodejs_light.svg';

  config.site_icon = '/public/images/cnode_icon_32.png';

  config.site_static_host = process.env.EGG_SITE_STATIC_HOST || ''; // 静态文件存储域名

  config.mini_assets = process.env.EGG_MINI_ASSETS || false;


  config.debug = true;

  // 版块
  config.tabs = [[ 'share', '分享' ], [ 'ask', '问答' ], [ 'job', '招聘' ]];

  // add your config here
  config.middleware = [
    'locals',
    'authUser',
  ];

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    },
  };

  config.mongoose = {
    url: process.env.EGG_MONGODB_URL || 'mongodb://127.0.0.1:27017/egg_cnode',
    options: {
      server: { poolSize: 20 },
    },
  };

  // database
  config.redis = {
    client: {
      host: process.env.EGG_REDIS_HOST || '127.0.0.1',
      port: process.env.EGG_REDIS_PORT || 6379,
      password: process.env.EGG_REDIS_PASSWORD || '',
      db: process.env.EGG_REDIS_DB || '0',
    },
  };

  // passport
  config.passportGithub = {
    key: process.env.EGG_PASSPORT_GITHUB_CLIENT_ID || 'test',
    secret: process.env.EGG_PASSPORT_GITHUB_CLIENT_SECRET || 'test',
  };

  config.list_topic_count = 40;

  // 是否允许直接注册（否则只能走 github 的方式）
  config.allow_sign_up = true;

  config.auth_cookie_name = 'node_club';

  config.admins = {
    ADMIN_USER: true,
    tianxia: true,
    tianxiadayu: true,
  };

  config.passportLocal = {
    usernameField: 'name',
    passwordField: 'pass',
  };

  // 每日创建主题数
  config.topic = {
    perDayPerUserLimitCount: 10,
  };

  // 每个 IP 每天可创建用户数
  config.create_user_per_ip = 1000;

  config.search = 'local'; // 'google', 'baidu', 'local'

  config.security = {
    csrf: {
      ignore: [ '/topic/*/top', '/api/*/*', '/topic/*/good', '/topic/*/lock' ],
    },
  };

  // RSS配置
  config.rss = {
    title: 'CNode：Node.js专业中文社区',
    link: 'http://cnodejs.org',
    language: 'zh-cn',
    description: 'CNode：Node.js专业中文社区',
    // 最多获取的RSS Item数量
    max_rss_items: 50,
  };

  return config;
};
