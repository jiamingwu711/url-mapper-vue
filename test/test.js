const startServer = require('./globalSetup');
const stopServer = require('./globalTeardown');
const puppeteer = require('puppeteer');
const {setTimeout} = require("node:timers/promises");

let browser; // 浏览器实例

const BASE_URL = `http://127.0.0.1:4000/dist/`

beforeAll(async () => {
  await startServer(); // 启动本地服务
  browser = await puppeteer.launch();
});

describe('Test1', () => {
  test('vue2 test url2Data', async () => {

    const queryObj = {"name":"input","region":"shanghai","date1":"2024-05-01","date2":"16:37:00","delivery":true,"type":["线下主题活动","单纯品牌曝光"], "type2":[111,222],"resource":"线下场地免费","desc":"test"}
    const urlParams = new URLSearchParams(queryObj)
    const url = `${BASE_URL}index_2.html?${urlParams.toString()}`
    let page = await browser.newPage();
    await page.goto(url);

    await page.click('#submit')
    const searchValue = await page.$eval('#result', el => el.value);
    console.log('searchValue: ', searchValue)
    expect(JSON.parse(searchValue)).toEqual(queryObj);
  });

  test('vue2 test data2url', async () => {

    let page2 = await browser.newPage();
    await page2.goto(`${BASE_URL}index_2.html`);
    await page2.type('#input', 'hello') // name = hello
    await page2.click('.el-switch') // delivery = true
    await page2.click('#checkbox-opt1') //
    await page2.click('#checkbox-opt2') // type = 美食/餐厅线上活动,地推活动 
    await page2.click('#checkbox2-opt1') // 
    await page2.click('#checkbox2-opt2') // type2 = 111,222

    await setTimeout(1000);

    const url = await page2.url()
    console.log('url', url)
    const urlParams = new URLSearchParams(url.split('?')[1])
    console.log('urlParams.name', urlParams.get('name'))
    expect(urlParams.get('name')).toBe('hello')
    expect(urlParams.get('delivery')).toBe('true')
    expect(urlParams.get('type')).toBe('美食/餐厅线上活动,地推活动')
    expect(urlParams.get('type2')).toBe('111,222')
  })

  test('vue3 test url2Data', async () => {
    const queryObj = {"input":"input","radio":"rock'n'roll star","time":1182873600000,"multiSelect":["song4","song5"],"checkbox":["Pushes Open","And Raises"],"checkbox2":[111,333],"switch":true}
    const urlParams = new URLSearchParams(queryObj)
    const url = `${BASE_URL}index_3.html?${urlParams.toString()}`
    let page = await browser.newPage();
    await page.goto(url);
    
    await setTimeout(1000);

    await page.click('#submit')
    const searchValue = await page.$eval('.n-input__textarea-el', el => el.value);
    console.log('searchValue: ', searchValue)
    expect(JSON.parse(searchValue)).toEqual(queryObj);
  });
  
  test('vue3 test data2url', async () => {

    let page = await browser.newPage();
    await page.goto(`${BASE_URL}index_3.html`);
    // name = hello
    await page.type('.n-input__input-el', 'hello') 
    // switch = true
    await page.click('#switch') 
    // checkbox = Pushes Open,The Window
    await page.click('#checkbox-opt1') //
    await page.click('#checkbox-opt2') 
    // checkbox2 = 111,222
    await page.click('#checkbox2-opt1') // 
    await page.click('#checkbox2-opt2') 

    await setTimeout(1000);

    const url = await page.url()
    console.log('url', url)
    const urlParams = new URLSearchParams(url.split('?')[1])
    console.log('urlParams.input', urlParams.get('input'))
    expect(urlParams.get('input')).toBe('hello')
    expect(urlParams.get('switch')).toBe('true')
    expect(urlParams.get('checkbox')).toBe('Pushes Open,The Window')
    expect(urlParams.get('checkbox2')).toBe('111,222')
  })

});

afterAll(async () => {
  await browser.close(); // 关闭浏览器
  await stopServer(); // 停止本地服务器
});
