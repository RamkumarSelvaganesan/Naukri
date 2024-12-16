const constants = require("./Constants");
const JsonManager = require("../Base/JsonManager");
class NaukriPage {
  constructor(page) {
    this.page = page;
    this.appliedJobs = [];
  }

  async login() {
    await this.page.locator("a#login_Layer").click();
    await this.page
      .locator('input[placeholder*="Email"]')
      .fill(constants.naukri.username);
    await this.page
      .locator('input[placeholder*="password"]')
      .fill(constants.naukri.password);
    await this.page.locator("button.loginButton").click();
  }

  async searchJob(positionName) {
    await this.page.click("span.nI-gNb-sb__placeholder");
    await this.page
      .locator('input[placeholder*="Enter keyword"]')
      .fill(positionName);
    await this.page.locator('input[name="experienceDD"]').click();
    await this.page
      .locator(`li[title="${constants.naukri.experience}"]`)
      .click();
    let preferedLocations = constants.naukri.preferableLocation;
    for (let location of preferedLocations) {
      await this.page
        .locator('input[placeholder*="Enter location"]')
        .fill(location + ",");
    }
    await this.page.click("button [class*='search']");
    await this.page.waitForTimeout(5000);
  }

  async captureViewdJobDetails() {
    await this.page.waitForSelector("div.profile-info h2", {
      state: "visible",
    });
    let companyName = await this.page
      .locator("div.profile-info h2")
      .textContent();
    let role = await this.page.locator("div.profile-info h1").textContent();
    let location = await this.page
      .locator("div.job-locations span")
      .first()
      .textContent();
    let experience = await this.page
      .locator("div.job-locations span")
      .last()
      .textContent();
    let empCount = await this.page
      .locator(`span[ng-if='employer.employee_count']`)
      .textContent();
    let hr = await this.page.locator("span.rec-name").textContent();
    let score = await this.page
      .locator("div.instamatch strong .ng-scope")
      .textContent();
    let appliedon = await this.formatDateTime(new Date());
    this.appliedJobs.push({
      companyName: companyName.trim(),
      role: role.trim(),
      location: location.trim(),
      experience: experience.trim(),
      empCount: empCount.trim(),
      score: score.trim(),
      hr: hr.trim(),
      appliedon: appliedon.trim(),
    });

    //await this.saveJobsToFile();
  }

  async applyJob() {
    // Wait for the job listings to load
    await this.page.waitForSelector("div.row1 a");

    // Get all job elements
    const allJobs = await this.page.locator("div.row1 a");

    // Get the count of job elements
    let jobCount = await allJobs.count();

    console.log(`Found ${jobCount} jobs.`);

    // Iterate through each job and perform actions
    for (let i = 0; i < jobCount; i++) {
      // Get job title or text
      const jobTitle = await allJobs.nth(i).textContent();
      console.log(`Processing job: ${jobTitle}`);

      // Click the job link
      const [newPage] = await Promise.all([
        this.page.context().waitForEvent("page"), // Wait for the new tab/page to open
        allJobs.nth(i).click(), // Click the job link
      ]);

      // Wait for the new page to load
      await newPage.waitForLoadState();

      await newPage.waitForSelector("div[class*='top-head'] h1");
      let role = await newPage
        .locator("div[class*='top-head'] h1")
        .first()
        .textContent();
      let companyName = await newPage
        .locator("div[class*='top-head'] div[class*='header-comp-name'] a")
        .first()
        .textContent();
      try {
        await newPage.click(
          "div[class*='apply-button-container'] button#apply-button"
        );
        console.log("Applied Successfully");
        this.appliedJobs.push({
          role: role.trim(),
          companyName: companyName.trim(),
          appliedOn: await this.formatDateTime(new Date()),
        });
        await this.page.waitForTimeout(2000);
      } catch {}
      await newPage.close();
      if (i == 19) {
        await this.page.click('//span[text()="Next"]');
        i = 0;
        jobCount = await allJobs.count();
      }
    }
  }

  async saveAppliedJobsDetails() {
    const jsonManager = new JsonManager(
      constants.appliedJobFileDetails.today,
      constants.appliedJobFileDetails.all
    );

    await jsonManager.saveTodayJobs(this.appliedJobs);
  }

  async formatDateTime(date) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Determine AM/PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    const hour12 = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    // Format date and time
    return `${day}-${month}-${year} on ${hour12}:${formattedMinutes} ${period}`;
  }
}
module.exports = NaukriPage;
