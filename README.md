# Site Dock - Android

Run multiple Web-apps on Android, no SDK needed.

## Purpose

Allows installing multiple (static) web apps to be run locally as an Android app.
For "installing" the web apps, no SDK is needed.
They can simply be installed from within the site dock by locating
the zipped site and installing them.

In principle, any static site can be installed. For an example, see folder `sample_sites`.

- The site should be static and not rely on a specific server
- The app enables Internet access (if approved by the user)
- Handle with care: Cordova functions are accessible in the loaded apps!
- It is possible to fetch local assets, see [Fetching local assets](#fetching-local-assets)
- The dock supports additional information for configuring the app, see [Adding app info](#adding-app-info)

## Fetching local assets

For static sites that do not dynamically fetch assets, no adaptation is required. They should run as they are. Be aware, that asset-fetches might be hidden inside libraries!

In order to be able to fetch local assets, a limitation of the file protocol has to be bypassed (see Trickery). For this, you need to include a JavaScript file (see sample site)  and call an initializer in the main code:

```
import { initCordova } from "./cordova-android.js";

// Check for Cordova support before doing any fetches related stuff
const b = await initCordova();

// Start the code after Cordova has been initialized ( or failed to initialize)
...
```

## Adding app info

Information can be added to configure the app. When loading the app tree, the dock checks if file `app_info/index.json` exists in the app root. If so, it uses that to retrieve the settings. Right now, only "name" has an effect (see example site). For apps that have a name, it will be shown in the app list.


# Foo

## Trickery

- We need to enable insecure file mode in the Cordova `config.xml`.
  This will make use of the file protocol, so we can access the
  data folders outside of the normal www root. When using http(s),
  this is not possible.
- Cordova does not allow `file://` fetches, so we redirect fetches with a relative
  path and serve the content of the matching local file using the file API.

  `<preference name="AndroidInsecureFileModeEnabled" value="true" />`

## Credits

Cordova-installation pains reduced by using Docker and https://github.com/beevelop/docker-cordova.
