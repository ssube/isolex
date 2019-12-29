#! /bin/bash

# GITHUB_COMMIT
# GITHUB_PROJECT
# GITHUB_TOKEN

STATUS_REQUIRED="codecov/patch
gitlab/build"

URL_BASE="https://api.github.com/repos/${GITHUB_PROJECT}"

URL_COMMIT_STATUS="${URL_BASE}/commits/${GITHUB_COMMIT}/statuses"

COMMIT_STATUS_DATA="$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" "${URL_COMMIT_STATUS}")"
# COMMIT_STATUS_FAILURE="$(echo "${COMMIT_STATUS_DATA}" | jq -r '.[] | select(.state == "failure") | .context' | sort | uniq)"
# COMMIT_STATUS_PENDING="$(echo "${COMMIT_STATUS_DATA}" | jq -r '.[] | select(.state == "pending") | .context' | sort | uniq)"
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
