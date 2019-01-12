// webpack environment defines
declare const BUILD_JOB: string;
declare const BUILD_RUNNER: string;
declare const GIT_BRANCH: string;
declare const GIT_COMMIT: string;
declare const NODE_VERSION: string;
declare const WEBPACK_VERSION: string;

export const VERSION_INFO = {
  build: {
    job: BUILD_JOB,
    node: NODE_VERSION,
    runner: BUILD_RUNNER,
    webpack: WEBPACK_VERSION,
  },
  git: {
    branch: GIT_BRANCH,
    commit: GIT_COMMIT,
  },
};
