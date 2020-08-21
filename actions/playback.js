const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async() => {

    const browser = await puppeteer.launch({
        headless: false,
        ignoreDefaultArgs: ['--disable-extensions'],
        executablePath: "C:/Program\ Files\ (x86)/Google/Chrome/Application/chrome.exe",
        // devtools: true,
        args: ['--start-maximized']
    });
    let ls = null;

    const pages = await browser.pages();

    // Get the default page
    const page = pages[0];

    // Set viewport to same dimensions as the browser window
    await page.setViewport({ width: 0, height: 0 });
    await page.goto("https://google.co.in");

    // Start triggering the actions
    let actions = JSON.parse(fs.readFileSync('data.json'));

    for (let i = 0; i < actions.length; i++) {
        action = actions[i];

        let elem = await page.waitForXPath(action['target']);
        console.log('clicking on elem with xpath:', action['target']);
        await elem.click();
    }

    console.log('All done; closing the browser in 5 sec');
    await page.waitFor(5000);

    await page.close();
})();
