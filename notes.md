## Development notes

- Sources are in www, you can create a symbolic link to the web app in the docker container
- Go to /repos dir
- Run docker: docker run --name site_dock -it -v ${PWD}:/usr/src/project beevelop/cordova bash
- Re-open: docker exec -it site_dock bash
- In docker:
  - cd /usr/src/project
  - Add Android target: cordova platform add android@12.0.1 (NOTE: docker image does not yet support latest)
  - cordova build android

