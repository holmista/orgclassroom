import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();
import queryString from "query-string";

async function getGoogleCode() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?access_type=offline&client_id=117501800924-1c9it5ho2ebpn9dhbh5v3ou2h5tl1vel.apps.googleusercontent.com&prompt=consent&redirect_uri=http%3A%2F%2F127.0.0.1%3A5173%2Fauth%2Fgoogle%2Fcallback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&service=lso&o2v=2&flowName=GeneralOAuthFlow"
  );
  const emailInputSelector = "input[type=email]";
  const passwordInputSelector =
    "#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input";
  await page.waitForSelector(emailInputSelector);
  await page.click(emailInputSelector);
  await page.$eval(
    emailInputSelector,
    (el) => (el.value = "forTestingPurposes317@gmail.com")
  );
  // click on a class selector
  await page.waitForSelector("#identifierNext > div > button > span");
  await page.click("#identifierNext > div > button > span");
  await page.waitForNavigation();
  await page.waitForSelector(passwordInputSelector);
  await page.$eval(passwordInputSelector, (el) => (el.value = "katon123456"));
  const elem = await page.waitForSelector(
    "#forgotPassword > div > button > span"
  );
  console.log("elem");
  await elem.evaluate((b) => b.click());
  await page.waitForNavigation();
  const url = page.url();
  const parsedUrl = queryString.parseUrl(url);
  //   await browser.close();
  return parsedUrl.query.code;
}
getGoogleCode().then((code) => console.log(code));
export default getGoogleCode;
