#! /bin/bash

IMAGE_PUSH="${1:---skip}"

IMAGE_NAME="${CI_PROJECT_PATH}"
IMAGE_TAG="$(echo "${CI_COMMIT_TAG:-${CI_COMMIT_REF_SLUG}}" | sed -r 's/[^-_a-zA-Z0-9\\.]/-/g')"
IMAGE_FULL="${IMAGE_NAME}:${IMAGE_TAG}"

echo "Building image: ${IMAGE_FULL}"

docker build -t "${IMAGE_FULL}" .

if [[ "${IMAGE_PUSH}" == "--push" ]];
then
  echo "Pushing image: ${IMAGE_FULL}"
  docker push "${IMAGE_FULL}"
fi
