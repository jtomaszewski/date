#!/bin/bash

set -euo pipefail

echo "--- yarn install"
yarn install

echo "--- yarn validate"
yarn validate