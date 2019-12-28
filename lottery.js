const puppeteer = require('puppeteer');

const base = 'https://www.lottery.co.uk/lotto/results/archive';

const self = {
  browser: null,
  page: null,
  year: 1994,
  currentYear: new Date().getFullYear(),

  init: async () => {
    self.browser = await puppeteer.launch({ headless: true });
    self.page = await self.browser.newPage();

    await self.page.goto(`${base}-${self.year}`);
  },

  paging: async () => {
    while (self.year <= self.currentYear) {
      self.link = await self.page.$(`a[href*="/lotto/results/archive-${self.year}"]`);

      console.log({ year: self.year });

      await self.link.click();
      await self.page.waitForSelector('table.lotto');

      console.log(await self.results());

      self.year++;
    };
  },

  results: async () => {
    const results = [];
    const rows = await self.page.$$('tbody > tr');

    for (let row of rows) {
      const date = await row.$eval('tbody tr td:first-child', node => {
        const text = node.innerText.trim();

        return text.substr(0, text.length - 4).trim();
      });

      const balls = await row.$$eval('td:nth-child(2) div[class*="lotto"]', nodes => {
        return nodes.map(n => n.innerText.trim().match(/^[\d,]*/)[0]);
      });

      const winnings = await row.$eval('tbody tr td:last-child', node => node.innerText.match(/[\d,]+/)[0]);

      results.push({
        date,
        balls,
        winnings
      });
    }

    return Promise.resolve(results);
  },

  close: async () => {
    await self.browser.close();
  }
};

module.exports = self;
