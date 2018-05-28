'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');

class TopicController extends Controller {

  async index() {
    function isUped(user, reply) {
      if (!reply.ups) {
        return false;
      }

      return reply.ups.indexOf(user._id) !== -1;
    }

    const { ctx, service } = this;
    const topic_id = ctx.params.tid;
    const currentUser = ctx.user;

    if (topic_id.length !== 24) {
      ctx.status = 404;
      ctx.message = '此话题不存在或已被删除。';
      return;
    }

    const [ topic, author, replies ] = await service.topic.getFullTopic(topic_id);

    if (!topic) {
      ctx.status = 404;
      ctx.message = '此话题不存在或已被删除。';
      return;
    }

    topic.visit_count++;
    await service.topic.incrementVisitCount(topic_id);
    topic.author = author;
    topic.replies = replies;
    // 点赞数排名第三的回答，它的点赞数就是阈值
    topic.reply_up_threshold = (() => {
      let allUpCount = replies.map(reply => {
        return (reply.ups && reply.ups.length) || 0;
      });
      allUpCount = _.sortBy(allUpCount, Number).reverse();

      let threshold = allUpCount[2] || 0;
      if (threshold < 3) {
        threshold = 3;
      }
      return threshold;
    })();

    const options = { limit: 5, sort: '-last_reply_at' };
    const query = { author_id: topic.author_id, _id: { $nin: [ topic._id ] } };
    const other_topics = await service.topic.getTopicsByQuery(query, options);

    // get no_reply_topics
    let no_reply_topics = await service.cache.get('no_reply_topics');
    if (!no_reply_topics) {
      const query = { reply_count: 0, tab: { $nin: [ 'job', 'dev' ] } };
      const options = { limit: 5, sort: '-create_at' };
      no_reply_topics = await service.topic.getTopicsByQuery(query, options);
      await service.cache.setex('no_reply_topics', no_reply_topics, 60 * 1);
    }

    let is_collect;
    if (!currentUser) {
      is_collect = null;
    } else {
      is_collect = await service.topicCollect.getTopicCollect(
        currentUser._id,
        topic_id
      );
    }
    await ctx.render('topic/index', {
      topic,
      author_other_topics: other_topics,
      no_reply_topics,
      is_uped: isUped,
      is_collect,
    });
  }
  /**
   * 进入创建主题页面
   */
  async create() {
    const { ctx, config } = this;
    await ctx.render('topic/edit', {
      tabs: config.tabs,
    });
  }

  /**
   * 发表主题帖
   */
  async put() {
    const { ctx, service } = this;
    const { tabs } = this.config;
    const { body } = ctx.request;

    const allTabs = tabs.map(i => i[0]);
    const RULE_CREATE = {
      title: {
        type: 'string',
        max: 100,
        min: 5,
      },
      content: {
        type: 'string',
      },
      tab: {
        type: 'enum',
        values: allTabs,
      },
    };
    try {
      ctx.validate(RULE_CREATE, body);
    } catch (error) {
      error = error.errors[0];
      return await ctx.render('topic/edit', {
        ...body,
        edit_error: `${error.field}: ${error.message}`,
        tabs,
      });
    }
    const topic = await service.topic.newAndSave(
      body.title,
      body.content,
      body.tab,
      ctx.user._id
    );
    await service.user.incrementScoreAndTopicCount(topic.author_id, 5, 1);

    // 通知被@的用户
    await service.at.sendMessageToMentionUsers(
      body.content,
      topic._id,
      ctx.user._id
    );

    ctx.redirect('/topic/' + topic._id);
  }

  /**
   * 收藏主题帖
   */
  async collect() {
    const { ctx, service } = this;
    const topic_id = ctx.request.body.topic_id;

    const topic = await service.topic.getTopic(topic_id);
    if (!topic) {
      ctx.body = { status: 'failed' };
      return;
    }

    const doc = await service.topicCollect.getTopicCollect(
      ctx.user._id,
      topic._id
    );

    if (doc) {
      ctx.body = { status: 'failed' };
      return;
    }
  }
}

module.exports = TopicController;