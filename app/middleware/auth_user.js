'use strict';

module.exports = () => {
  return async function(ctx, next) {
    ctx.locals.current_user = null;
    const { user } = ctx;
    if (!user) {
      return await next();
    }
    const count = await ctx.service.message.getMessageCount(user._id);
    user.message_count = count;
    ctx.locals.current_user = user;
    await next();
  };
};