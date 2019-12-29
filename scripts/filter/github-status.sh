#! /bin/bash

# GITHUB_COMMIT
# GITHUB_PROJECT
# GITHUB_PR_ID
# GITHUB_TOKEN

STATUS_REQUIRED="codecov/patch
gitlab/build"

URL_BASE="https://api.github.com/repos/${GITHUB_PROJECT}"

URL_PULL_REQUEST="${URL_BASE}/pulls/${GITHUB_PR_ID}"
URL_COMMIT_STATUS="${URL_BASE}/commits/${GITHUB_COMMIT}/statuses"

PULL_REQUEST_DATA="$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" "${URL_PULL_REQUEST}")"
PULL_REQUEST_AUTHOR="$(echo "${PULL_REQUEST_DATA}" | jq -r '.user.login')"

echo "Author: ${PULL_REQUEST_AUTHOR}"

if [[ "${PULL_REQUEST_AUTHOR}" =~ ^(ssube|renovate.*)$ ]];
then
  echo "Trusted PR author."
else
  echo "Unknown PR author."
  exit 1
fi

COMMIT_STATUS_DATA="$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" "${URL_COMMIT_STATUS}")"
COMMIT_STATUS_SUCCESS="$(echo "${COMMIT_STATUS_DATA}" | jq -r '.[] | select(.state == "success") | .context' | sort | uniq)"

STATUS_PASSED=""

while read -r status_req;
do
  while read -r status_cur;
  do
    if [[ "${status_cur}" == "${status_req}" ]];
    then
      echo "Passed: ${status_cur}"

      if [[ -z "${STATUS_PASSED}" ]];
      then
        STATUS_PASSED="${status_cur}"
      else
        STATUS_PASSED="${STATUS_PASSED}
${status_cur}"
      fi
    fi
  done <<< "${COMMIT_STATUS_SUCCESS}"
done <<< "${STATUS_REQUIRED}"

# accumulated check
if [[ "${STATUS_PASSED}" == "${STATUS_REQUIRED}" ]];
then
  echo "All required checks passed!"
  exit 0
else
  echo "Some required checks missing."
  exit 1
fi
