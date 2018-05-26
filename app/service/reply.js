'use strict';

const Service = require('egg').Service;

class ReplyService extends Service {
  /*
   * 根据回复ID，获取回复
   * @param {String} id 回复ID
   * @return {Promise[reply]} 承载 replay 的 Promise 对象
   */
  async getReplyById(id) {
    if (!id) {
      return null;
    }

    const reply = await this.ctx.model.Reply.findOne({ _id: id }).exec();

    if (!reply) {
      return null;
    }

    const author_id = reply.author_id;
    const author = await this.service.user.getUserById(author_id);

    reply.author = author;
    if (reply.content_is_html) {
      return reply;
    }

    const str = this.service.at.linkUsers(reply.content);
    reply.content = str;
    return reply;
  }

  /*
   * 根据主题ID，获取回复列表
   * Callback:
   * - err, 数据库异常
   * - replies, 回复列表
   * @param {String} id 主题ID
   * @return {Promise[replies]} 承载 replay 列表的 Promise 对象
   */
  async getRepliesByTopicId(id) {
    const query = { topic_id: id, deleted: false };
    let replies = await this.ctx.model.Reply.find(query, '', {
      sort: 'create_at',
    }).exec();

    if (replies.length === 0) {
      return [];
    }

    replies = replies.filter(function(item) {
      return !item.content_is_html;
    });

    return Promise.all(
      replies.map(async item => {
        const author = await this.service.user.getUserById(item.author_id);
        item.author = author || { _id: '' };

        item.content = await this.service.at.linkUsers(item.content);
        return item;
      })
    );
  }
}

module.exports = ReplyService;