export const VERSION_INFO = {
  app: {
    name: '{{ APP_NAME }}',
    version: '{{ APP_VERSION }}',
  },
  build: {
    job: '{{ BUILD_JOB }}',
    node: '{{ NODE_VERSION }}',
    runner: '{{ BUILD_RUNNER }}',
  },
  git: {
    branch: '{{ GIT_BRANCH }}',
    commit: '{{ GIT_COMMIT }}',
  },
};
