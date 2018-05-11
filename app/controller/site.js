'use strict';

const moment = require('moment');
const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    let page = parseInt(this.ctx.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    const tab = this.ctx.query.tab || 'all';
    const query = {};
    if (!tab || tab === 'all') {
      query.tab = {
        $nin: [
          'job',
          'dev',
        ],
      };
    } else {
      if (tab === 'good') {
        query.good = 'true';
      } else {
        query.tab = tab;
      }
    }
    if (!query.good) {
      query.create_at = {
        $gte: moment()
          .subtract(1, 'years')
          .toDate(),
      };
    }
    const limit = this.config.list_topic_count;
    const options = {
      skip: (page - 1) * limit,
      limit,
      sort: '-top -last_reply_at',
    };
    const topics = await this.service.topic.getTopicsByQuery(query, options);
    const locals = {
      tabs: this.config.tabs,
      topics,
    };
    await this.ctx.render('index', locals);
  }
}

module.exports = HomeController;
