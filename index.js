var puppeteer = require('puppeteer');
var request = require("request");
var cheerio = require("cheerio");

var GITHUB_TRENDING_URL = 'https://github.com/trending';
var GITHUB_TRENDING_DEVELOPER = "https://github.com/trending/developers/javascript?since=daily";
var result;

async function scrape() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(GITHUB_TRENDING_URL);

    function handleRequestData(err, data) {
        if (err) {
            console.log("error in request");
        }
    
        var $ = cheerio.load(data.body);
    
        var reposTrending = [];
    
        var repos = $(".Box-row");
    
        repos.each(function (index, element) {
            const repo = $(element);
            const title = repo.find("h1").text().trim();
            const desc = repo.find("p").text().trim();
            const url = "https://github.com" + repo.find("a").attr("href");
            const starsStr = repo.find(".octicon-star").parent().text().trim();
            const starsMatch = starsStr.match(/([\d,]+) stars today/);
            const stars = parseInt(starsStr.replace(',', '').match(/[\d,]+/)[0].replace(',', ''));
            //const starsToday = parseInt(starsStr.match(/(\d+) stars today/)[1]);
            const forksStr = repo.find(".octicon-repo-forked").parent().text().trim();
            const forks = parseInt(forksStr.replace(',', ''));
            const language = repo.find("[itemprop='programmingLanguage']").text().trim();
    
            reposTrending.push({
                title,
                description: desc,
                url,
                stars,
                // totalStars,
                // starsToday,
                forks,
                language,
            });
        });
    
        console.log(reposTrending);

        request(GITHUB_TRENDING_DEVELOPER, handleRequestData2);
    }
    
    request(GITHUB_TRENDING_URL, handleRequestData);

    await browser.close();

    function handleRequestData2(err,data){
        if (err) {
          console.error(err);
          return;
        }
    
        const $ = cheerio.load(data.body);
        const developersData = [];
    
        $('.Box-row').each((i, el) => {
          const nameAndRepo = $(el).find('h1').text().trim();
           // const username = $(el).find('p').attr('href').replace('/', '');
            const username = $(el).find('p').text().trim();
            const description = $(el).find('.f6').text().trim();
            const popularRepoIndex = description.indexOf("Popular repo") + 12; // Add 12 to exclude "Popular repo" and the line break (\n)
            const trimmedDescription = description.substring(popularRepoIndex).trim();
            const lastSpaceIndex = nameAndRepo.lastIndexOf(' ');
            const name = nameAndRepo.substring(0, lastSpaceIndex).trim();
            const repo = nameAndRepo.substring(lastSpaceIndex + 1).trim();
           
            developersData.push({
                name,
                username,
                repo,
                description:trimmedDescription
            });
        });
    
        console.log(developersData);
      }
}

scrape();




