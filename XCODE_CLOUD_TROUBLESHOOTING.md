# Xcode Cloud Troubleshooting Guide

## Current Issue

The `ci_post_clone.sh` script is failing with exit code 1.

## What I've Done

### Version 1 (Initial Fix)
- Created basic post-clone script
- Installed Flutter and ran pod install

### Version 2 (Better Error Handling)
- Added error checking for each step
- Added detailed logging
- Accept Flutter licenses automatically

### Version 3 (Comprehensive Logging)
- Added section headers for clarity
- Disabled Flutter analytics
- Run `flutter doctor -v` for diagnostics
- Update CocoaPods repo before install
- Verify Pods directory exists
- Check for xcfilelist files

## Next Steps to Debug

### 1. Check the Full Build Log

In Xcode Cloud, click "View Build Report" and look for:

**What step is failing?**
- Flutter installation?
- `flutter pub get`?
- `pod install`?

**Look for specific error messages:**
```
❌ Failed to clone Flutter repository
❌ Flutter installation verification failed
❌ Flutter pub get failed
❌ Pod install failed
❌ ERROR: Pods directory not found!
```

### 2. Common Issues & Solutions

#### Issue: Flutter Clone Timeout
**Symptom:** Script fails during Flutter installation  
**Solution:** Xcode Cloud may have network restrictions

Try using a pre-built Flutter SDK:
```sh
# Instead of cloning, download a release
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_3.24.0-stable.zip
unzip flutter_macos_3.24.0-stable.zip -d $HOME/
```

#### Issue: Pod Install Fails
**Symptom:** `pod install` exits with error  
**Solution:** May need to specify CocoaPods version or clear cache

```sh
# Try with --repo-update
pod install --repo-update

# Or clear cache first
pod cache clean --all
pod install
```

#### Issue: Permission Denied
**Symptom:** Script can't write to directories  
**Solution:** Check file permissions

```sh
# Make sure script is executable
chmod +x ios/ci_scripts/ci_post_clone.sh

# Check in git
git ls-files -s ios/ci_scripts/ci_post_clone.sh
# Should show: 100755 (executable)
```

#### Issue: Environment Variables Not Set
**Symptom:** `$CI_WORKSPACE` is empty  
**Solution:** Use fallback values

```sh
# Add to script
WORKSPACE="${CI_WORKSPACE:-$(pwd)}"
cd "$WORKSPACE"
```

### 3. Alternative Approach: Use Xcode Cloud Environment

Instead of installing Flutter in the script, you might need to configure Xcode Cloud's environment settings.

**In Xcode Cloud Settings:**
1. Go to your workflow settings
2. Add environment variables:
   - `FLUTTER_ROOT` = path to Flutter
   - `PATH` = include Flutter bin directory

### 4. Simplified Script (Fallback)

If the full script keeps failing, try this minimal version:

```sh
#!/bin/sh
set -e

echo "Starting minimal setup..."

# Just run pod install with existing setup
cd "${CI_WORKSPACE}/ios"
pod install

echo "Setup complete"
```

This assumes Flutter is already available in Xcode Cloud's environment.

### 5. Check Xcode Cloud Requirements

**Xcode Cloud may require:**
- Specific Xcode version
- Specific macOS version
- Specific CocoaPods version

**In your Xcode Cloud workflow:**
- Check the Xcode version setting
- Ensure it matches your local development environment

### 6. View Detailed Logs

The new script version provides extensive logging. Look for:

```
==========================================
Installing Flutter SDK
==========================================
Cloning Flutter repository (stable branch)...
```

This will show exactly where it's failing.

## Alternative Solutions

### Option A: Use GitHub Actions Instead

If Xcode Cloud continues to have issues, consider using GitHub Actions:

```yaml
# .github/workflows/ios.yml
name: iOS Build
on: [push]
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: cd ios && pod install
      - run: flutter build ios --release --no-codesign
```

### Option B: Pre-commit Pods

Commit the Pods directory to git (not recommended, but works):

```sh
# Remove Pods from .gitignore
# Commit Pods directory
git add ios/Pods
git commit -m "Add Pods directory for Xcode Cloud"
```

**Pros:** Xcode Cloud doesn't need to run pod install  
**Cons:** Large repo size, merge conflicts

### Option C: Use Fastlane

Create a Fastfile that handles the setup:

```ruby
# ios/fastlane/Fastfile
lane :setup do
  sh("flutter pub get")
  cocoapods(podfile: "ios/Podfile")
end
```

Then in `ci_post_clone.sh`:
```sh
#!/bin/sh
cd "${CI_WORKSPACE}"
fastlane setup
```

## What to Send Me

If you need more help, send me:

1. **Full build log** from Xcode Cloud
2. **Exact error message** where it fails
3. **Xcode Cloud workflow settings** (Xcode version, environment)

## Quick Checklist

- [ ] Script is executable (`chmod +x`)
- [ ] Script is committed to git
- [ ] Script is in correct location (`ios/ci_scripts/ci_post_clone.sh`)
- [ ] Xcode Cloud workflow is using the correct branch
- [ ] Build logs show the script is being executed
- [ ] Error message is visible in logs

## Expected Success Output

When working correctly, you should see:

```
==========================================
Xcode Cloud Post-Clone Script
==========================================
Working directory: /Volumes/workspace/repository
CI_WORKSPACE: /Volumes/workspace/repository

==========================================
Installing Flutter SDK
==========================================
Cloning Flutter repository (stable branch)...
...

==========================================
Verifying Flutter Installation
==========================================
Flutter 3.24.0 • channel stable
...

==========================================
Getting Flutter Dependencies
==========================================
Running "flutter pub get" in repository...
...

==========================================
Installing CocoaPods Dependencies
==========================================
Analyzing dependencies
Downloading dependencies
Installing dependencies
...

==========================================
Verification
==========================================
✅ Pods directory created successfully
✅ xcfilelist files found

==========================================
Setup Complete
==========================================
✅ Flutter version: Flutter 3.24.0
✅ Dart version: Dart 3.5.0
✅ CocoaPods version: 1.15.2
✅ Xcode Cloud post-clone setup complete!
```

---

**Current Status:** Script updated with comprehensive logging. Waiting for next build to see detailed error output.

