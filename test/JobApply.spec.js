const { test } = require("playwright/test");
import userDetails from "../src/Nakuri/Constants";
const NaukriPage = require("../src/Nakuri/NaukriPage");

test("Apply the Hirist", async ({ page }) => {
  await page.goto(userDetails.naukri.url);
  const naukriPage = new NaukriPage(page);
  await naukriPage.login();
  let allRoleTitle = userDetails.naukri.searchKeywords;
 // try{
  for(let roleTitle of allRoleTitle){
    await naukriPage.searchJob(roleTitle);
    await naukriPage.applyJob();
  }
//}catch{}
  await naukriPage.saveAppliedJobsDetails();
});

