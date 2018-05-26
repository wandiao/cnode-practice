'use strict';

const Service = require('egg').Service;

class MessageService extends Service {
  /*
   * 根据用户ID，获取未读消息的数量
   * Callback:
   * @param {String} id 用户ID
   * @return {Promise[messagesCount]} 承载消息列表的 Promise 对象
   */
  getMessageCount(id) {
    return this.ctx.model.Message.count({
      master_id: id,
      has_read: false,
    }).exec();
  }

  sendAtMessage(userId, authorId, topicId, replyId) {
    const message = this.ctx.model.Message();
    message.type = 'at';
    message.master_id = userId;
    message.author_id = authorId;
    message.topic_id = topicId;
    message.reply_id = replyId;

    return message.save();
  }
}

module.exports = MessageService;