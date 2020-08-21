const express = require('express');
const router = express.Router();

const puppeteer = require('puppeteer-core');
const fs = require('fs');

//get record route

router.get('/record' , (req,res,next) => {
    
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
        await page.evaluate(() => {
            // Initialize with blank array
            localStorage.setItem('session', "[]");
        });
    
        page.on('framenavigated', async (frame) => {
      //      console.log('navigation', frame);
    
            // if (frame.parentFrame() == null) 
            { 
                await frame.waitFor(500);
                await frame.evaluate(() => {
                    console.log('adding handler on new page');
    
                    function getPathTo(element) {
                        if (element.tagName == 'HTML')
                            return '/HTML[1]';
                        if (element===document.body)
                            return '/HTML[1]/BODY[1]';
            
                        let ix= 0;
                        let siblings= element.parentNode.childNodes;
                        for (let i= 0; i<siblings.length; i++) {
                            let sibling= siblings[i];
                            if (sibling===element)
                                return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
                            if (sibling.nodeType===1 && sibling.tagName===element.tagName)
                                ix++;
                        }
                    }
    
                    function clickHandle(event) {
                        console.log(event);
                        let ls = JSON.parse(localStorage.getItem('session'));
                        let time_now = Date.now();
                        if (ls.length && ((time_now - ls[ls.length-1]['ts']) > 10)) {
                            if (ls){
                                ls.push({'event': 'click', 'target': getPathTo(event.target), 'ts': Date.now()})
                                localStorage.setItem('session', JSON.stringify(ls));
                            } else {
                                console.log('in case of iframe')
                                ls = JSON.parse(event.view.top.localStorage.getItem('session'));
                                ls.push({'event': 'click', 'target': getPathTo(event.target), 'ts': Date.now()});
                                event.view.top.localStorage.setItem('session', JSON.stringify(ls));
                            }
                            console.log('click', event.target);
                        }
                        else {
                            console.log('skip dup');
                        }
                    }
               //     console.log(document);
               //     console.log(document.body);
                    if (document && document.body) {
                        document.body.addEventListener('click', clickHandle, true);
                        console.log('added handler on new page');
                    }
                });
            }
        });
    
        page.on('close', () => {
            clearInterval(timr);
            console.log('closing');
    
            //Save the data saved to file
            fs.writeFileSync('data.json', ls);
        })
    
        await page.evaluate(() => {
            function getPathTo(element) {
                if (element.tagName == 'HTML')
                    return '/HTML[1]';
                if (element===document.body)
                    return '/HTML[1]/BODY[1]';
    
                let ix= 0;
                let siblings= element.parentNode.childNodes;
                for (let i= 0; i<siblings.length; i++) {
                    let sibling= siblings[i];
                    if (sibling===element)
                        return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
                    if (sibling.nodeType===1 && sibling.tagName===element.tagName)
                        ix++;
                }
            }
    
            function clickHandle(event) {
                let ls = JSON.parse(localStorage.getItem('session'));
                ls.push({'event': 'click', 'target': getPathTo(event.target), 'ts': Date.now()})
                localStorage.setItem('session', JSON.stringify(ls));
                console.log('click', getPathTo(event.target));
            }
            document.body.addEventListener('click', clickHandle, true);
        });
    
        let timr = setInterval(async function(){
            ls = null;
            try {
                ls = await page.evaluate(() => {
                    return localStorage.getItem('session');
                });
            } catch (error) {
                console.error(error);
                console.log('moving ahead');
            }
            console.log(ls);
        }, 500);
    
        // page.close();
    })();
    


});




module.exports = router;