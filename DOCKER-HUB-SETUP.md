# Docker Hub Integration Setup

This guide explains how to configure Docker Hub credentials in GitHub Actions so your Docker images are automatically pushed to Docker Hub when you push code.

## Prerequisites

- Docker Hub account (free at https://hub.docker.com)
- GitHub repository access with admin permissions
- Docker logged in locally (you mentioned you've already done this)

## Step 1: Create Docker Hub Access Token

1. Go to [Docker Hub](https://hub.docker.com) and log in
2. Click your profile picture → **Account Settings**
3. Click **Security** in the left sidebar
4. Click **New Access Token**
5. Give it a name (e.g., "GitHub Actions") and select **Read & Write** permissions
6. Click **Generate**
7. Copy the token (you'll only see it once!)

**Token looks like:** `dckr_pat_XXXXXXXXXXXXXXXXXXXXX`

## Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository: https://github.com/aimeniyoyabikoze-arch/CAT-ONLINE-SURVEY-SYSTEM
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions** in the left sidebar
4. Click **New repository secret**

### Add First Secret: `DOCKER_USERNAME`
- **Name:** `DOCKER_USERNAME`
- **Value:** Your Docker Hub username (e.g., `aimejd`)
- Click **Add secret**

### Add Second Secret: `DOCKER_PASSWORD`
- **Name:** `DOCKER_PASSWORD`
- **Value:** The access token you generated (starts with `dckr_pat_`)
- Click **Add secret**

## Step 3: Verify Configuration

Your GitHub repository now has:
- ✅ `DOCKER_USERNAME` - Your Docker Hub username
- ✅ `DOCKER_PASSWORD` - Your Docker Hub access token

## Step 4: Test the Integration

1. Push any commit to the master branch:
   ```bash
   git add .
   git commit -m "Test Docker push integration"
   git push origin master
   ```

2. Go to GitHub Actions: https://github.com/aimeniyoyabikoze-arch/CAT-ONLINE-SURVEY-SYSTEM/actions

3. Watch the workflow run. The **docker-build** job will:
   - Log in to Docker Hub
   - Build your Docker image
   - Push to Docker Hub with three tags:
     - `yourusername/survey-system:latest`
     - `yourusername/survey-system:commit-sha`
     - `yourusername/survey-system:branch-latest`

4. Verify the image appears on Docker Hub: https://hub.docker.com/r/yourusername/survey-system

## What Gets Pushed

When you push code to the master branch, GitHub Actions automatically:

### Image Tags Created:
1. **`latest`** - Always points to the newest build
   ```
   yourusername/survey-system:latest
   ```

2. **Commit SHA** - Immutable reference to exact code version
   ```
   yourusername/survey-system:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

3. **Branch Latest** - Latest build from that branch
   ```
   yourusername/survey-system:master-latest
   yourusername/survey-system:develop-latest
   ```

### Build Cache:
- Cached layers stored to speed up future builds
- Location: `yourusername/survey-system:buildcache`

## Using Docker Images Locally

Once pushed to Docker Hub, you can use them anywhere:

### Pull the image:
```bash
docker pull yourusername/survey-system:latest
docker pull yourusername/survey-system:master-latest
docker pull yourusername/survey-system:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Run locally:
```bash
docker run -p 3000:3000 yourusername/survey-system:latest
```

### Deploy to Kubernetes:
Update your deployment files to use the full image name:
```yaml
image: yourusername/survey-system:latest
```

### Deploy to Docker Swarm:
Update docker-stack.yml:
```yaml
image: yourusername/survey-system:latest
```

## Viewing Your Images

- **Docker Hub Dashboard:** https://hub.docker.com/r/yourusername/survey-system
- **GitHub Actions Logs:** https://github.com/aimeniyoyabikoze-arch/CAT-ONLINE-SURVEY-SYSTEM/actions
- **Local Docker:** `docker images | grep survey-system`

## Example Workflow

When you commit to master:

```
1. You push to GitHub
   ↓
2. GitHub Actions triggers
   ↓
3. Runs tests & linting
   ↓
4. Builds Docker image
   ↓
5. Logs in to Docker Hub (using secrets)
   ↓
6. Pushes image with tags
   ↓
7. Image available on Docker Hub
   ↓
8. Deploy from Kubernetes/Swarm using the image
```

## Troubleshooting

### Image push fails with "authentication failed"
- Verify `DOCKER_USERNAME` is your Docker Hub username (not email)
- Verify `DOCKER_PASSWORD` is the access token, not your Docker password
- Regenerate token if needed and update GitHub secret

### Image not appearing on Docker Hub
- Check GitHub Actions logs for errors
- Verify the job reached "Build and push Docker image" step
- Check Docker Hub account hasn't reached storage limits

### Slow builds
- Build cache is stored: `yourusername/survey-system:buildcache`
- Subsequent builds reuse layers (faster)
- First build may take 2-5 minutes

### Multiple branches pushing to same registry
- All branches can push to the same Docker Hub repository
- Each build gets a unique tag (commit SHA + branch name)
- Latest tag updated for master branch only (update workflow if needed)

## Security Best Practices

1. **Use Access Tokens, Not Passwords**
   - More secure and scoped permissions
   - Can be revoked easily

2. **Regenerate Token After Sharing**
   - If accidentally exposed, regenerate immediately
   - Old token stops working

3. **GitHub Secrets Are Encrypted**
   - Not visible in logs or workflow files
   - Only used at runtime

4. **Limit Token Scope**
   - Use "Read & Write" only if needed
   - Use "Read-Only" when possible

## Advanced Configuration

### Push only on certain branches:
In `.github/workflows/ci.yml`, add to docker-build job:
```yaml
if: github.ref == 'refs/heads/master'
```

### Use specific Dockerfile:
```yaml
file: ./custom.Dockerfile
```

### Push to multiple registries:
Add additional `docker/login-action@v2` and `docker/build-push-action@v4` steps for other registries.

## Next Steps

1. ✅ Add Docker Hub credentials to GitHub secrets
2. ✅ Push a commit to trigger the workflow
3. ✅ Verify image appears on Docker Hub
4. ✅ Use image in Kubernetes/Docker Swarm deployments
5. ✅ Set up automated deployments with the new images
