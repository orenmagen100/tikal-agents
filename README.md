# Top Secret Agents Project / Oren Magen

## General Info
I've created a single app.component which contains the logic go the task, separated to small functions units.
I've used Angular, Typescript, Rxjs and Bing maps for the tasks (Since google maps apparently doesn't have a free plan for generating keys anymore... ) 
"consts.ts" file contains the task array from the question.
"app.model" contains interfaces and modeling

Running the development app will display the Part 1 results (The most isolated country result and the isolation level)
The table is displayed as expected, calculating the results as expected.

app.components.spec.ts contains simple tests to check the code. you can run it by:
`npm test`

## Install and run

To start, clone the project, enter tikal-agents folder and run 
`npm install`
then
`npm start` which will run ng start with the proxy config
then check `http://localhost:4200/` to see the results

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.4.
