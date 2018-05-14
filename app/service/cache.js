'use strict';

const Service = require('egg').Service;

class CacheService extends Service {
  async get(key) {
    const { redis, logger } = this.app;
    const t = Date.now();
    let data = await redis.get(key);
    if (!data) {
      return false;
    }
    data = JSON.parse(data);
    const duration = (Date.now() - t);
    logger.debug('Cache', 'get', key, (duration + 'ms').green);
    return data;
  }

  async setex(key, value, seconds) {
    const { redis, logger } = this.app;
    const t = Date.now();
    value = JSON.parse(value);
    await redis.set(key, value, 'EX', seconds);
    const duration = (Date.now() - t);
    logger.debug('Cache', 'set', key, (duration + 'ms').green);
  }
}