'use strict';

const Service = require('egg').Service;

class TopicCollectService extends Service {
  getTopicCollect(userId, topicId) {
    const query = { user_id: userId, topic_id: topicId };
    return this.ctx.model.TopicCollect.findOne(query).exec();
  }

  newAndSave(userId, topicId) {
    const topid_collect = new this.ctx.model.TopicCollect();
    topid_collect.user_id = userId;
    topid_collect.topic_id = topicId;
    return topid_collect.save();
  }
  remove(userId, topicId) {
    const query = { user_id: userId, topic_id: topicId };
    return this.ctx.model.TopicCollect.remove(query).exec();
  }

  getTopicCollectsByUserId(userId, opt) {
    const defaultOpt = { sort: '-create_at' };
    opt = Object.assign(defaultOpt, opt);
    return this.ctx.model.TopicCollect.find(
      { user_id: userId },
      '',
      opt
    ).exec();
  }
}

module.exports = TopicCollectService;
