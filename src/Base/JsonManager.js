const fs = require('fs');
const path = require('path');

class JsonManager {
    constructor(todayFilePath, allFilePath) {
        this.todayFilePath = todayFilePath;
        this.totalFilePath = allFilePath;
    }

    // Save today's jobs to today's file
    async saveTodayJobs(todayJobs) {
        try {
            // Write today's jobs to todayAppliedJobs.json
            fs.writeFileSync(this.todayFilePath, JSON.stringify(todayJobs, null, 2), 'utf-8');
            console.log(`Today's jobs saved to ${this.todayFilePath}`);
            
            // Merge today's jobs into totalAppliedJobs.json
            this.updateTotalJobs(todayJobs);
        } catch (error) {
            console.error('Error saving today\'s jobs:', error);
        }
    }

    // Merge today's jobs into the total applied jobs file
    updateTotalJobs(todayJobs) {
        try {
            let totalJobs = [];

            // Check if totalAppliedJobs.json exists and load data
            if (fs.existsSync(this.totalFilePath)) {
                const totalJobsData = fs.readFileSync(this.totalFilePath, 'utf-8');
                totalJobs = JSON.parse(totalJobsData);
            }

            // Append today's jobs to the total jobs
            totalJobs.push(...todayJobs);

            // Save the updated total jobs back to totalAppliedJobs.json
            fs.writeFileSync(this.totalFilePath, JSON.stringify(totalJobs, null, 2), 'utf-8');
            console.log(`Total jobs updated in ${this.totalFilePath}`);
        } catch (error) {
            console.error('Error updating total jobs:', error);
        }
    }
}

module.exports = JsonManager;
