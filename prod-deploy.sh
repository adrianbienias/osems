#!/bin/bash

# Exit on error
set -o errexit
set -o nounset
set -e

git checkout main
git fetch
git reset --hard origin/main

npm install

npm run lint &&
npm run build:pre &&

pm2 delete "osems" &&
pm2 start npm --name "osems" -- run start &&
pm2 save
