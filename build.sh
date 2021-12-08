#!/usr/bin/env bash

if [ ! -d $HOME/.nvm ]; then
  echo "Please install nvm first"
  exit 1
fi

if [ -z "$1" ]; then
  echo "Please specify which challenge to build"
  echo "Example: build.sh 01a"
  exit 1
fi

unset npm_config_prefix
source $HOME/.nvm/nvm.sh
nvm install

TS_FILENAME="./src/$1.ts"
FILENAME=$TS_FILENAME
if [ ! -f $FILENAME ]; then
  JS_FILENAME="./src/$1.js"
  echo "File $TS_FILENAME not found. Trying $JS_FILENAME..."
  # fallback to javascript
  FILENAME=$JS_FILENAME
  if [ ! -f $FILENAME ]; then
    echo "File $FILENAME also not found. Build aborted."
    exit 1
  fi
fi

npx webpack --entry $FILENAME -w
