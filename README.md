
# Advent of code 2021

## Setup

You need `nvm` and `npm` installed. Run:

    nvm install
    npm install

And that's it.

## Run

Open two terminals. In the first one run:

    nvm use
    npm run build

This will start Webpack in watch mode, rebuilding your scripts as you work on them.

In the second terminal;

    nvm use
    npm start <script>

This will run your script, also in watch mode, re-running it every time the source changes. The parameter `<script>` needs to be changed with the name of the script to run. For example:

    npm start 02b

This npm script will look for `dist/02b.js` and run it.

## Debug

On WebStorm, run the intended script in the `dist` folder, but add your breakpoints to the TypeScript file in the `src` folder. It should work just fine.
