const db = require('./models');
(async () => {
  try {
    await db.sequelize.sync({ alter: true, logging: console.log });
    console.log('sync ok');
  } catch (e) {
    console.error('sync err', e);
  }
  process.exit(0);
})();
