'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const {
    site,
    sign,
  } = controller;

  router.get('/', site.index);

  router.get('/signup', sign.showSignup);
};
