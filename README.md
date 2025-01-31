## Notes

- Sources are in www, you can create a symbolic link to the web app in the docker container
- Go to /repos dir
- Run docker: docker run --name site_dock -it -v ${PWD}:/usr/src/project beevelop/cordova bash
- Re-open: docker exec -it site_dock bash
- In docker:
  - cd /usr/src/project
  - Add Android target: cordova platform add android@12.0.1 (NOTE: docker image does not yet support latest)
  - cordova build android

## Trickery

- We need to enable insecure file mode in the Cordova config.xml.
  This will make use of the file protocol, so we can access the
  data folders outside of the normal www root. When using http(s),
  this is not possible.
- Cordova does not allow file:// fetches, se we redirect fetches with a relative
  path and serve the content of the matching local file using the file API.

<preference name="AndroidInsecureFileModeEnabled" value="true" />