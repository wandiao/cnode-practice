'use strict';

const Service = require('egg').Service;

class TopicService extends Service {
  async getTopicsByQuery(query, opt) {
    query.deleted = false;
    const topics = await this.ctx.model.Topic.find(query, {}, opt).exec();
    if (topics.length === 0) {
      return [];
    }
    await Promise.all(
      topics.map(async topic => {
        const [ author, reply ] = await Promise.all([
          this.service.user.getUserById(topic.author_id),
          this.service.reply.getReplyById(topic.last_reply),
        ]);
        topic.author = author;
        topic.reply = reply;
      })
    );
    return topics.filter(item => {
      // 删除不合规的 topic
      return !!item.author;
    });
  }

  newAndSave(title, content, tab, author_id) {
    const topic = new this.ctx.model.Topic();
    topic.title = title;
    topic.content = content;
    topic.tab = tab;
    topic.author_id = author_id;

    return topic.save();
  }

  /*
   * 获取所有信息的主题
   * Callback:
   * - err, 数据库异常
   * - message, 消息
   * - topic, 主题
   * - author, 主题作者
   * - replies, 主题的回复
   * @param {String} id 主题ID
   * @param {Function} callback 回调函数
   */
  async getFullTopic(id) {
    const query = { _id: id, deleted: false };
    const topic = await this.ctx.model.Topic.findOne(query);

    if (!topic) {
      return [];
    }
    topic.linkedContent = this.service.at.linkUsers(topic.content);

    const author = await this.service.user.getUserById(topic.author_id);
    if (!author) {
      return [];
    }

    const replies = await this.service.reply.getRepliesByTopicId(topic._id);
    return [ topic, author, replies ];
  }

  incrementVisitCount(id) {
    const query = { _id: id };
    const update = { $inc: { visit_count: 1 } };
    return this.ctx.model.Topic.findByIdAndUpdate(query, update).exec();
  }
}

module.exports = TopicService;