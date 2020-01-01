#! /bin/sh

set -x

source common.sh

DATA="$(cat -)"

export GITHUB_COMMIT="$(echo "${DATA}" | jq -r '.data.context.channel.thread')"
echo_trace "commit: ${GITHUB_COMMIT}"

export GITHUB_PROJECT="$(echo "${DATA}" | jq -r '.data.context.channel.id')"
echo_trace "project: ${GITHUB_PROJECT}"

export GITHUB_PR="$(echo "${DATA}" | jq '.data.data[] | select(.[0] == "check_run") | .[1].pull_requests')"
export GITHUB_PR_LEN="$(echo "${DATA}" | jq '.data.data[] | select(.[0] == "check_run") | .[1].pull_requests | length')"
echo_trace "PRs: ${GITHUB_PR_LEN}"

if [ ${GITHUB_PR_LEN} -eq 0 ];
then
  echo_error "No corresponding PRs."
fi

echo_trace "PR data: ${GITHUB_PR}"
export GITHUB_PR_ID="$(echo "${GITHUB_PR}" | jq -r '.[] | .number')"

echo_trace "Approving PR#${GITHUB_PR_ID} for ${GITHUB_COMMIT} in ${GITHUB_PROJECT}..."
bash /data/filter/github-approve.sh
