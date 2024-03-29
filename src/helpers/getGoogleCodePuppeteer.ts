import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();
import queryString from "query-string";

async function wait(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

async function getGoogleCode(): Promise<string> {
  const browser = await puppeteer.launch({ headless: false });
  try {
    const page = await browser.newPage();
    await page.goto(
      "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&client_id=117501800924-1c9it5ho2ebpn9dhbh5v3ou2h5tl1vel.apps.googleusercontent.com&prompt=consent&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fgoogle%2Fcallback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email"
    );
    const emailInputSelector = ".whsOnd.zHQkBf";
    const nextButtonSelector = "VfPpkd-vQzf8d";
    const passwordInputSelector = ".whsOnd.zHQkBf";
    await page.waitForSelector(emailInputSelector);
    await page.click(emailInputSelector);
    await page.keyboard.type("forTestingPurposes317@gmail.com");
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "load" });
    await wait(1000);
    await page.waitForSelector(passwordInputSelector);
    await page.click(passwordInputSelector);
    await page.keyboard.type("katon123456");
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "load" });
    await wait(1000);
    const url = page.url();
    const parsedUrl = queryString.parseUrl(url);
    return parsedUrl.query.code as string;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    browser.close();
  }
}

export default getGoogleCode;
