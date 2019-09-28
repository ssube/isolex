export const VERSION_INFO = {
  build: {
    job: '{{ BUILD_JOB }}',
    node: '{{ NODE_VERSION }}',
    runner: '{{ BUILD_RUNNER }}',
  },
  git: {
    branch: '{{ GIT_BRANCH }}',
    commit: '{{ GIT_COMMIT }}',
  },
  package: {
    name: '{{ PACKAGE_NAME }}',
    version: '{{ PACKAGE_VERSION }}',
  },
};
