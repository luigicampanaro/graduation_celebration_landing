# Joint PhD Graduation Celebration Landing Page

A responsive, bilingual (Italian/English) landing page for the graduation celebration of Domenico & Luigi.

## 🚀 Getting Started

### 1. Local Development
To run this project locally, you need a simple HTTP server because browsers block fetching local files (CORS policy).

**Using Python (Recommended):**
```bash
# Run this in the project directory
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### 2. Configuration
The site content is driven by two YAML files. You can edit these to change the text without touching the code.

- **`config.yaml`**: General event details (Title, Date, Venue, Messages).
- **`faqs.yaml`**: Frequently Asked Questions.

### 3. Setting up the RSVP Form (Secure)
The RSVP form is designed to send data to a Google Sheet via a Google Apps Script. This keeps your API keys secure and serverless.

**Step-by-Step Guide:**

1.  **Create a Google Sheet:**
    - Go to Google Sheets and create a new sheet.
    - Name the columns in the first row: `timestamp`, `name`, `surname`, `email`, `plus_one`.

2.  **Create the Script:**
    - In the Google Sheet, go to **Extensions > Apps Script**.
    - Delete any code there and paste the following:

    ```javascript
    function doPost(e) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var data = JSON.parse(e.postData.contents);
      
      sheet.appendRow([
        new Date(),
        data.name,
        data.surname,
        data.email,
        data.plus_one
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    ```

3.  **Deploy the Script:**
    - Click **Deploy > New deployment**.
    - Select type: **Web app**.
    - Description: "RSVP Endpoint".
    - Execute as: **Me**.
    - Who has access: **Anyone** (This is crucial for the form to work without login).
    - Click **Deploy**.

4.  **Copy the URL:**
    - Copy the "Web app URL" (it starts with `https://script.google.com/macros/s/...`).

5.  **Update the Code:**
### 4. Deploying with GitHub Secrets (Secure)
This project uses GitHub Actions to automatically deploy to GitHub Pages and inject your secret URL.

1.  **Push the code** to your GitHub repository.
2.  Go to your repository **Settings > Secrets and variables > Actions**.
3.  Click **New repository secret**.
4.  **Name:** `GOOGLE_SHEET_ENDPOINT`
5.  **Secret:** Paste the Web App URL you copied from Google Apps Script.
6.  Click **Add secret**.
7.  Go to the **Actions** tab in your repo and ensure the "Deploy to GitHub Pages" workflow runs successfully.
8.  Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

