# Slack Integration Setup

This guide explains how to set up Slack notifications for your CI/CD pipeline.

## Prerequisites

- A Slack workspace with admin access
- Access to your GitHub repository settings
- Permission to create webhooks in Slack

## Step 1: Create a Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps) hull
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Enter app name: `GitHub CI/CD Notifications`
5. Select your workspace
6. Click **"Create App"**

## Step 2: Enable Incoming Webhooks

1. In your Slack app settings, go to **"Incoming Webhooks"**
2. Toggle **"Activate Incoming Webhooks"** to **ON**
3. Click **"Add New Webhook to Workspace"**
4. Select the channel where you want notifications (e.g., `#deployments`, `#ci-cd`)
5. Click **"Allow"**

## Step 3: Copy the Webhook URL

1. After authorizing, you'll see a new webhook URL under **"Webhook URLs for Your Workspace"**
2. Copy the URL (it looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)

## Step 4: Add Webhook URL to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `SLACK_WEBHOOK_URL`
5. Value: Paste the webhook URL you copied from Slack
6. Click **"Add secret"**

## Step 5: Test the Integration

1. Push a commit to your repository or trigger a workflow manually
2. The workflow will now send notifications to your Slack channel
3. You'll receive messages with:
   - Pipeline status (✅ SUCCESS or ❌ FAILED)
   - Repository and branch information
   - Individual job results
   - Link to view the full workflow run

## Slack Notification Format

When a workflow completes, Slack will receive a message containing:

- **Status**: Overall pipeline result
- **Repository**: Name and link to repo
- **Branch**: Which branch was built
- **Commit**: Short commit SHA
- **Author**: GitHub username who triggered the build
- **Job Results**: Status of each CI/CD job
- **Action Button**: Direct link to GitHub Actions run

## Customization

To modify the notification format, edit the `notify-slack` job in `.github/workflows/ci.yml` under the `payload` section.

### Example: Notification for Success
```
CI/CD Pipeline ✅ SUCCESS
Repository: aimeniyoyabikoze-arch/CAT-ONLINE-SURVEY-SYSTEM
Branch: master
Commit: a1b2c3d
Author: aimejd

Job Results:
• Lint Backend: success
• Unit Tests: success
• Coverage: success
• Security Audit: success
• Docker Build: success
• Deploy: success
• Dependency Check: success
• Code Quality: success
```

### Example: Notification for Failure
```
CI/CD Pipeline ❌ FAILED
Repository: aimeniyoyabikoze-arch/CAT-ONLINE-SURVEY-SYSTEM
Branch: develop
Commit: x9y8z7w
Author: aimejd

Job Results:
• Lint Backend: failure
• Unit Tests: success
• Coverage: success
• Security Audit: success
• Docker Build: skipped
• Deploy: skipped
• Dependency Check: success
• Code Quality: success
```

## Multiple Channels

To send notifications to multiple Slack channels:

1. Create additional webhooks in Slack for each channel
2. Add each webhook URL as a separate GitHub secret (e.g., `SLACK_WEBHOOK_URL_DEV`, `SLACK_WEBHOOK_URL_OPS`)
3. Add additional `notify-slack-*` jobs in your workflow for each channel

## Troubleshooting

### Webhook URL is invalid
- Verify the URL is correctly copied from Slack
- Ensure there are no extra spaces at the beginning or end
- Check that the secret name matches exactly in the workflow file

### Notifications not appearing in Slack
- Check GitHub Actions logs for errors
- Verify the webhook URL is still active in Slack app settings
- Confirm the channel hasn't been deleted or archived
- Ensure the Slack app has permissions to post in that channel

### Sensitive information in notifications
- Webhook URLs are stored securely in GitHub Secrets
- Commit messages and author names are visible in Slack (consider your privacy settings)
- The workflow run URL allows anyone with access to view logs

## Security Considerations

- **Keep webhook URLs secret** - treat them like passwords
- **Use repository secrets** - never commit webhook URLs to your repository
- **Rotate webhooks periodically** - regenerate them in Slack if compromised
- **Limit channel access** - only add the webhook to channels your team needs to see

## Next Steps

- Set up multiple channels for different notification types
- Customize the notification format based on your team's needs
- Consider adding notifications for pull requests or scheduled workflows
