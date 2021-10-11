#!/bin/bash

set -euo pipefail

echo "--- yarn install"
yarn install --frozen-lockfile

echo "--- yarn validate"
yarn validate