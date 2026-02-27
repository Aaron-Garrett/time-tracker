<div align="center">

# :shipit: How to Use the Time Tracker App :shipit:

</div>

## 📁 File Breakdown
1. :accessibility: App.js
    - Within this file you will find an array called "activities"
    - Update this array by adding or deleting items (CSS is created for up to 16 activity types)
    - A button will appear for each of these items
2. :electron: main.js
    - This is the main script for Electron, which will allow you to interact with the application (You do not need the window in the web browser).
3. 📄 **You need the file _TimeTracker.xlsx on your local machine_ in your "Documents" folder**

## ✅ To Execute
1. :octocat: Clone this repository and open the folder in the command line
2. :neckbeard: Run the command `npm install`
3. :bowtie: Run the command `npm run dev`
    - This will load the app on a localhost machine
    - Two windows will open:
        - One in the browser
        - One in Electron
4. :electron: Use the electron window for tracking your day
5. :stop_sign: When you are done tracking for a period and want to reset the clock(s) hit "Stop"
    - This will update the TimeTracker.xlsx file in your Documents folder with your tracked activities
    - This will reset the timers




