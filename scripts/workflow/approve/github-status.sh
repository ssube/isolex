#! /bin/bash

set -x

source common.sh

DATA="$(cat -)"

export GITHUB_COMMIT="$(echo "${DATA}" | jq -r '.data.context.channel.thread')"
echo_trace "commit: ${GITHUB_COMMIT}"

export GITHUB_PROJECT="$(echo "${DATA}" | jq -r '.data.context.channel.id')"
echo_trace "project: ${GITHUB_PROJECT}"

URL_BASE="https://api.github.com/repos/${GITHUB_PROJECT}"

echo_trace "status: ${DATA}"

GITHUB_BRANCHES="$(echo "${DATA}" | jq -r '.data.data[] | select(.[0] == "branches") | .[1][].name')"
echo_trace "branches: ${GITHUB_BRANCHES}"

while read -r BRANCH;
do
  GITHUB_PULLS="$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" "${URL_BASE}/pulls?head=${BRANCH}")"
  GITHUB_PULLS_LEN="$(echo "${GITHUB_PULLS}" | jq '. | length')"
  if [[ ${GITHUB_PULLS_LEN} -gt 0 ]];
  then
    GITHUB_NUMS="$(echo "${GITHUB_PULLS}" | jq '.[] | .number')"
    GITHUB_HEAD="$(echo "${GITHUB_PULLS}" | jq -r '.[] | .head.sha')"
    echo_trace "heads: ${GITHUB_HEAD}"
    if [[ "${GITHUB_HEAD}" == "${GITHUB_COMMIT}" ]];
    then
      echo_trace "commit is head for PR#${GITHUB_NUMS}, checking status"
      export GITHUB_PR_ID="${GITHUB_NUMS}"
      bash /data/filter/github-approve.sh
    else
      echo_trace "commit is not head for PR#${GITHUB_NUMS}"
    fi
  else
    echo_trace "no pull requests for branch ${BRANCH}"
  fi
done <<< "${GITHUB_BRANCHES}"

exit 0
