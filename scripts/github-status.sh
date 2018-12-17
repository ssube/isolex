#! /bin/bash

curl -d @- \
  -H "Authorization: token $(echo ${GITHUB_SECRET} | base64 -d)" \
  https://api.github.com/repos/ssube/isolex/statuses/${CI_COMMIT_SHA} \
  <<EOF
{
    "state": "success",
    "target_url": "${CI_PIPELINE_URL}",
    "description": "CI pipeline success!",
    "context": "continuous-integration/gitlab"
}
EOF