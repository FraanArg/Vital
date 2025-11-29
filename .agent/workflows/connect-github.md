---
description: How to connect your local project to a new GitHub repository
---

Since you don't have the GitHub CLI installed, you'll need to do this manually in your browser.

1.  **Create the Repository**
    *   Go to [github.com/new](https://github.com/new).
    *   Repository name: `vital` (or `personal-tracker`).
    *   Visibility: **Private** (Recommended).
    *   **Do NOT** initialize with README, .gitignore, or License (we already have them).
    *   Click **Create repository**.

2.  **Connect your Local Project**
    *   Copy the URL of your new repository (e.g., `https://github.com/yourusername/vital.git`).
    *   Run the following commands in your terminal (replace the URL):

    ```bash
    git remote add origin <YOUR_REPO_URL>
    git branch -M main
    git push -u origin main
    ```

3.  **Verify**
    *   Refresh your GitHub page. You should see your code!
    *   Vercel will now be able to deploy your latest changes.
