import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();
import queryString from "query-string";

function wait(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

async function getGithubCode(): Promise<string> {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    "https://github.com/login/oauth/authorize?allow_signup=true&client_id=d246a324e6780b40bc2f&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fgithub%2Fcallback&scope=read%3Auser%20user%3Aemail"
  );
  const loginInputSelector = "#login_field";
  const passwordInputSelector = "#password";
  const signInButtonSelector =
    "#login > div.auth-form-body.mt-3 > form > div > input.btn.btn-primary.btn-block.js-sign-in-button";
  const authorizeButtonSelector = "#js-oauth-authorize-btn";
  const usernameField = await page.waitForSelector(loginInputSelector);
  await page.click(loginInputSelector);
  usernameField && usernameField.type("test-test-katon");
  await wait(500);
  const passwordField = await page.waitForSelector(passwordInputSelector);
  await page.click(passwordInputSelector);
  passwordField && passwordField.type("katon1234567");
  await wait(500);
  await page.click(signInButtonSelector);
  await page.waitForNavigation();
  await wait(2500);
  //   console.log(page.url());
  //   try {
  //     console.log(page.url());
  //     await page.waitForSelector(authorizeButtonSelector);
  //     page.click(authorizeButtonSelector);
  //     await page.waitForNavigation();
  //     await wait(2500);
  //   } catch (e) {
  //     console.log(e);
  //   }
  const url = page.url();
  const parsedUrl = queryString.parseUrl(url);
  browser.close();
  return parsedUrl.query.code as string;
}

export default getGithubCode;
