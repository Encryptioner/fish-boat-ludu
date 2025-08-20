# Deployment Guide for Github Action

This document provides instructions for deploying the Fish & Boat Ladders game to GitHub Pages.

## Overview

The game is deployed as a static website using GitHub Pages with automatic deployment via GitHub Actions. Since this is a client-side only application with no build process, deployment is straightforward.

## Setup Instructions

### 1. Repository Configuration

Ensure your repository has the following structure:
```
├── .github/workflows/deploy-to-github-pages.yml
├── index.html
├── other file
├── another file
```

### 2. GitHub Pages Configuration

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The deployment workflow will be automatically detected

### 3. Automatic Deployment

The deployment is triggered automatically when:
- Code is pushed to the `release/prod` branch
- Manual deployment is triggered via GitHub Actions tab

### 4. Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy-to-github-pages.yml`) performs the following steps:

1. **Checkout**: Downloads the repository code
2. **Setup Pages**: Configures GitHub Pages environment
3. **Upload Artifact**: Packages all files for deployment
4. **Deploy**: Publishes the site to GitHub Pages

## Manual Deployment

To manually trigger a deployment:

1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. Select the **Deploy to GitHub Pages** workflow
4. Click **Run workflow** button

## Deployment Notes

- **No Build Process**: This is a static HTML/CSS/JS application that requires no compilation
- **Automatic HTTPS**: GitHub Pages automatically provides HTTPS
- **Custom Domain**: Can be configured in repository settings if needed
- **Caching**: GitHub Pages includes appropriate caching headers
- **Mobile Optimized**: The game is fully responsive and mobile-friendly

## Troubleshooting

### Common Issues

1. **Deployment Failed**
   - Check the Actions tab for error details
   - Ensure all files are properly committed
   - Verify the workflow file syntax

2. **Environment Protection Rules Error**
   - If you get "Branch is not allowed to deploy to github-pages due to environment protection rules"
   - This is fixed by removing the environment specification from the workflow
   - The current workflow is configured to work with any branch that has deployment permissions

3. **Site Not Loading**
   - Allow a few minutes for deployment to complete
   - Check if GitHub Pages is enabled in repository settings
   - Verify the correct branch is selected

4. **JavaScript Not Working**
   - Ensure all file paths are relative
   - Check browser console for errors
   - Verify no CORS issues with local file access

### Monitoring Deployment

- View deployment status in the **Actions** tab
- Check the **Environments** section for deployment history
- Monitor the **Pages** settings for configuration issues

## Production URL

Once deployed, your game will be available at:
```
https://[username].github.io/[repository-name]/
```

Replace `[username]` with your GitHub username and `[repository-name]` with your repository name.