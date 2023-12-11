#!/bin/bash

DAY="${1}"
YEAR=2023

# todo: make this to properly zero pad
DAY_DIR="src/day-${DAY}"

# create dir
mkdir "${DAY_DIR}"
# create ts file
touch "${DAY_DIR}/index.ts"
# create example file
npm run start src/get-example-input.ts "${YEAR}" "${DAY}" "${DAY_DIR}"
# create input file
curl -X GET \
  -b "session=${ADVENT_OF_CODE_SESSION_COOKIE}" \
  "https://adventofcode.com/${YEAR}/day/${DAY}/input" \
  > "${DAY_DIR}/input.txt"
