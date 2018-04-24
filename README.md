# F-sektionen mobile app (F-app)

A Phonegap app for the web services of the F-guild.

## Branches
__master__
- Unreleased, but stable commits are merged to this branch.
- Should use the staging API (https://stage.fsektionen.se/api).
- Automatically builds _development_ binaries for Android and iOS through Phonegap Build

__production__
- Reset this branch to __master__ to initialize the deployment of a production version.
- Automatically changes links and constants to the production API (https://fsektionen.se/api).
- Automatically builds _production_ binaries for Android and iOS through Phonegap Build.

## Getting started

Head to the [wiki](https://github.com/fsek/app/wiki) to learn how to setup and use the system.

---------------------

__What you should never do:__
- Force-push new commits to __master__ or __production__
- Create commits directly on _master__ or __production__
