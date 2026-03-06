# GitHub Wrapped — Requirements

A web app that generates a beautiful "year in review" summary for any GitHub user, similar to Spotify Wrapped. Users enter a GitHub username and get a visual summary of their GitHub activity.

## Requirements

### R1: Landing Page
A clean landing page with a text input for GitHub username and a "Generate" button. Modern, visually appealing design.

### R2: GitHub API Integration
Fetch user profile and contribution data from the GitHub REST API. Handle rate limiting gracefully. No authentication required for public data.

### R3: Activity Stats
Calculate and display: total commits, total PRs, total issues, total stars received, most active day of week, most active month, longest streak.

### R4: Language Breakdown
Show a visual breakdown of programming languages used across all public repos, with percentages and colored indicators.

### R5: Top Repositories
Display the user's top 5 repositories by stars, showing repo name, description, star count, and primary language.

### R6: Contribution Heatmap
Render a GitHub-style contribution heatmap showing daily activity levels for the past year.

### R7: Shareable Card
Generate a shareable summary card (as a downloadable image or shareable link) with key stats beautifully formatted.

### R8: Responsive Design
The app must work well on mobile, tablet, and desktop screen sizes.

### R9: Error Handling
Show user-friendly error messages for: invalid username, API rate limits, network errors, and users with no public activity.

### R10: Loading States
Show skeleton loaders or animated placeholders while data is being fetched from the GitHub API.
