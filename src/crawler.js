const got = require('got');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
var fs = require("fs");

arr = []
const timesUrls = ['https://time.com/section/sports/', 'https://time.com/section/tech/', 'https://time.com/section/business/']

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