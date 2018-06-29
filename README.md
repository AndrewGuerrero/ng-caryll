# NgCaryll

<https://ng-caryll.firebaseapp.com>

## Setup

Run `yarn` to install dependencies.

## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you
change any of the source files.

## Update content on dev server

Run `yarn run remark-documents` to update the markdown content while developing. This script also provides markdown
syntax suggestions.

Run `yarn run lunr-index` to update the search index while developing. 

Run `yarn run prestart` to run both of the above scripts with one command.

## Content grammar

Run `yarn run retext-documents` for content grammar suggestions.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deploy

Run `firebase deploy --project ng-caryll` to deploy to the project to [Firebase](https://ng-caryll.firebaseapp.com)
for the world to see. You must build the application first.

## Running unit tests

Run `yarn test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `yarn e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

> Testing is non-existent. I'm waiting for [Testing Angular
> Applications](https://www.manning.com/books/testing-angular-applications). Sorry!