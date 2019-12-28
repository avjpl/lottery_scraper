const lottery = require('./lottery');

(async () => {
  await lottery.init();
  await lottery.paging();
  await lottery.close();
})();
