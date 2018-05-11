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

  config.list_topic_count = 40;

  return config;
};
