'use strict';

const utility = require('utility');
const uuid = require('uuid');
const Service = require('egg').Service;

class UserService extends Service {

  /*
   * 根据用户名列表查找用户列表
   * @param {Array} names 用户名列表
   * @return {Promise[users]} 承载用户列表的 Promise 对象
   */
  async getUsersByNames(names) {
    if (names.length === 0) {
      return [];
    }

    const query = { loginname: { $in: names } };
    return this.ctx.model.User.find(query).exec();
  }

  makeGravatar(email) {
    return (
      'http://www.gravatar.com/avatar/' +
      utility.md5(email.toLowerCase()) +
      '?size=48'
    );
  }

  newAndSave(name, loginname, pass, email, avatar_url, active) {
    const user = new this.ctx.model.User();
    user.name = loginname;
    user.loginname = loginname;
    user.pass = pass;
    user.email = email;
    user.avatar = avatar_url;
    user.active = active || false;
    user.accessToken = uuid.v4();

    return user.save();
  }

  getUserByQuery(query, opt) {
    return this.ctx.model.User.find(query, '', opt).exec();
  }

  getUserByMail(email) {
    return this.ctx.model.User.findOne({ email }).exec();
  }

  /*
   * 根据登录名查找用户
   * @param {String} loginName 登录名
   * @return {Promise[user]} 承载用户的 Promise 对象
   */
  getUserByLoginName(loginName) {
    const query = { loginname: new RegExp('^' + loginName + '$', 'i') };
    return this.ctx.model.User.findOne(query).exec();
  }

  /*
   * 根据 githubId 查找用户
   * @param {String} githubId 登录名
   * @return {Promise[user]} 承载用户的 Promise 对象
   */
  getUserByGithubId(githubId) {
    const query = { githubId };
    return this.ctx.model.User.findOne(query).exec();
  }

  /*
   * 根据用户ID，查找用户
   * @param {String} id 用户ID
   * @return {Promise[user]} 承载用户的 Promise 对象
   */
  async getUserById(id) {
    if (!id) {
      return null;
    }

    return this.ctx.model.User.findOne({ _id: id }).exec();
  }

  incrementScoreAndTopicCount(id, score, topic_count) {
    const query = { _id: id };
    const update = { $inc: { score, topic_count } };
    return this.ctx.model.User.findByIdAndUpdate(query, update).exec();
  }

  incrementScoreAndReplyCount(id, score, replyCount) {
    const query = { _id: id };
    const update = { $inc: { score, reply_count: replyCount } };
    return this.ctx.model.User.findByIdAndUpdate(query, update).exec();
  }

  incrementCollectTopicCount(id) {
    const query = { _id: id };
    const update = { $inc: { collect_topic_count: 1 } };
    return this.ctx.model.User.findByIdAndUpdate(query, update).exec();
  }
}

module.exports = UserService;