#! /bin/sh

echo "$(date)" >> /tmp/filter-github.log

DATA="$(cat -)"
LABELS="$(echo "${DATA}" | jq '.data.labels[]')"
echo "labels: ${LABELS}" >> /tmp/filter-github.log

STATUS_EVENT="$(echo "${DATA}" | jq 'select(.data.labels[] | index("check_run"))')"

if [ -z "${STATUS_EVENT}" ];
then
  exit 0
fi

export GITHUB_COMMIT="$(echo "${DATA}" | jq -r '.data.context.channel.thread')"
echo "commit: ${GITHUB_COMMIT}" >> /tmp/filter-github.log

export GITHUB_PROJECT="$(echo "${DATA}" | jq -r '.data.context.channel.id')"
echo "project: ${GITHUB_PROJECT}" >> /tmp/filter-github.log

export GITHUB_PR="$(echo "${DATA}" | jq '.data.data[] | select(.[0] == "check_run") | .[1].pull_requests')"
export GITHUB_PR_LEN="$(echo "${DATA}" | jq '.data.data[] | select(.[0] == "check_run") | .[1].pull_requests | length')"
echo "PRs: ${GITHUB_PR_LEN}" >> /tmp/filter-github.log

if [ ${GITHUB_PR_LEN} -eq 0 ];
then
  exit 0
fi

echo "PR data: ${GITHUB_PR}" >> /tmp/filter-github.log
export GITHUB_PR_ID="$(echo "${GITHUB_PR}" | jq -r '.[] | .number')"

echo "Approving PR#${GITHUB_PR_ID} for ${GITHUB_COMMIT} in ${GITHUB_PROJECT}..." >> /tmp/filter-github.log
bash /data/filter/github-status.sh >> /tmp/filter-github.log