//Import Packages
const got = require('got');
const jsdom = require("jsdom");
//JSDOM was chosen over other, more abstracted automation toolkits. As the project did not require emulation of human action
//A library like Selenium or Puppeteer would have been overkill
const {JSDOM} = jsdom;
var fs = require("fs");

arr = []
const timesUrls = ['https://time.com/section/sports/', 'https://time.com/section/tech/', 'https://time.com/section/business/']

//Simple function to scrape an array of given websites. The selectors would, of course only work on one structured exactly NYtimes pages here are.
async function timesCrawler(urls, arr) {
    if (!fs.existsSync('times.json')) {
        for (x of urls) {
            let response = await got(x)
            let dom = new JSDOM(response.body);
            let category = dom.window.document.querySelector('.lead-headline').textContent
            let articles = dom.window.document.querySelectorAll('article')
            for (let i = 0; i < articles.length; i++) {
                const obj = {}
                obj.pageUrl = 'https://time.com/' + articles[i].querySelector('.headline > a').href
                obj.imgUrl = articles[i].querySelector('.inner-container > img').src
                obj.title = articles[i].querySelector('.headline > a').textContent.trim()
                obj.excerpt = articles[i].querySelector('.summary').textContent.trim()
                obj.category = category
                arr.push(obj)
            }
        }
        fs.writeFile("times.json", JSON.stringify(arr), function (err) {
            if (err) throw err;
            console.log("Saved!");
        });
    }
}
timesCrawler(timesUrls, arr)
module.exports = {
    timesCrawler
}