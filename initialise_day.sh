#!/bin/bash

DAY="${1}"
YEAR=2023

# todo: make this to properly zero pad
DAY_DIR="src/day-0${DAY}"

# create dir
mkdir "${DAY_DIR}"
# create ts file
touch "${DAY_DIR}/index.ts"
# create example file
touch "${DAY_DIR}/example.txt"
# create input file
curl -X GET \
  -b "session=${ADVENT_OF_CODE_SESSION_COOKIE}" \
  "https://adventofcode.com/${YEAR}/day/${DAY}/input" \
  > "${DAY_DIR}/input.txt"
