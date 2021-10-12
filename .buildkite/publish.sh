#!/bin/bash

set -euo pipefail

REPO_NAME=$(basename ${BUILDKITE_REPO} .git)
REPO_ORG=$(basename $(dirname ${BUILDKITE_REPO}) | sed 's/git@github.com://')

git config --global user.email "${GITHUB_USER_EMAIL:-ailo-release-bot@ailo.io}"
git config --global user.name "${GITHUB_USER_NAME:-ailo-release-bot}"

echo "--- yarn install"
yarn install --frozen-lockfile

echo "--- yarn build"
yarn build

echo "--- yarn version-bump"
yarn version-bump

echo "--- git push"
git push https://${GITHUB_TOKEN}@github.com/${REPO_ORG}/${REPO_NAME}.git --follow-tags origin HEAD:master --no-verify

echo "--- yarn publish"
yarn publish --non-interactive