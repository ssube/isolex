#! /bin/bash

set -x

source common.sh

# look up PRs by branch
# filter PRs by head
# extract PR number
# return {project, commit, number}

DATA="$(cat -)"
echo_trace "data: ${DATA}"

GITHUB_LABELS="$(echo "${DATA}" | jq -r '.value.labels[] | select(.[0] == "hook") | .[1]')"
echo_trace "labels: ${GITHUB_LABELS}"

if [[ "${GITHUB_LABELS}" != "status" ]];
then
  echo_trace "wrong event type"
  exit 1
fi

GITHUB_BRANCHES="$(echo "${DATA}" | jq -r '.value.data[] | select(.[0] == "branches") | .[1][].name')"
GITHUB_COMMIT="$(echo "${DATA}" | jq -r '.value.context.channel.thread')"
GITHUB_PROJECT="$(echo "${DATA}" | jq -r '.value.context.channel.id')"
IFS='/' read -r GITHUB_OWNER GITHUB_REPO <<< "${GITHUB_PROJECT}"

echo_trace "Branches for ${GITHUB_PROJECT}@${GITHUB_COMMIT}: ${GITHUB_BRANCHES}"

URL_BASE="https://api.github.com/repos/${GITHUB_PROJECT}"

while read -r BRANCH;
do
  GITHUB_PULLS="$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" "${URL_BASE}/pulls?head=${BRANCH}")"

  GITHUB_PULLS_MSG="$(echo "${GITHUB_PULLS}" | jq -r '.message' 2> /dev/null)"
  echo_trace "Message: ${GITHUB_PULLS_MSG}"

  if [[ "${GITHUB_PULLS_MSG}" == "Not Found" ]];
  then
    echo_trace "PRs for ${BRANCH}@${GITHUB_COMMIT} not found"
    continue
  fi

  GITHUB_PULLS_LEN="$(echo "${GITHUB_PULLS}" | jq '. | length')"
  echo_trace "Found ${GITHUB_PULLS_LEN} PRs for ${BRANCH}@${GITHUB_COMMIT}: ${GITHUB_PULLS}"

  if [[ ${GITHUB_PULLS_LEN} -eq 0 ]];
  then
    echo_trace "No PRs for ${BRANCH}@${GITHUB_COMMIT}"
    continue
  fi

  GITHUB_PULLS_NUM="$(echo "${GITHUB_PULLS}"| jq '.[] | .number')"
  echo_trace "Found ${GITHUB_PULLS_LEN} PRs for ${BRANCH}@${GITHUB_COMMIT}: ${GITHUB_PULLS_NUM}"

  while read -r PR_NUMBER;
  do
    cat <<EOD
{
  "owner": "${GITHUB_OWNER}",
  "project": "${GITHUB_REPO}",
  "commit": "${GITHUB_COMMIT}",
  "number": "${PR_NUMBER}"
}
EOD
  done <<< "${GITHUB_PULLS_NUM}"
done <<< "${GITHUB_BRANCHES}"

exit 0

