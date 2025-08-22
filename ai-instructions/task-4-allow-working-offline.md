# Guidelines

## Rules
1. Code like a pro developer
2. Ensure the code is optimized for all devices


## Instruction List 1

### Instructions
1. This project works online which is ok
2. I want offline support too. After first time the website loads, it should be cached in browser
3. And later, if the internet is not available, the website should also load with the offline/cached copy
4. The browser may show you are viewing offline copy
5. However, if internet is available, the latest version of website should show and the cache must be updated for later use
6. This feature should work on browser and later on webview mobile app too

### Comments
1. Seems AI included service worker
2. Also added manifests.json to be installed as PWA
3. Have to test the implementation in mobile device after deployment