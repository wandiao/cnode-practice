'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const {
    site,
  } = controller;

  router.get('/', site.index);
};
