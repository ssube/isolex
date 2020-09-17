import { Octokit } from '@octokit/rest';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy, stub } from 'sinon';

import { Bot } from '../../../src/Bot';
import { INJECT_BOT } from '../../../src/BotService';
import { GithubApproveController } from '../../../src/controller/github/ApproveController';
import { STATUS_SUCCESS } from '../../../src/endpoint/BaseEndpoint';
import { Command, CommandVerb } from '../../../src/entity/Command';
import { Context } from '../../../src/entity/Context';
import { Transform } from '../../../src/transform';
import { GithubClient } from '../../../src/utils/github';
import { createService, createServiceContainer } from '../../helpers/container';

/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/no-explicit-any, camelcase */

const TEST_TRANSFORM = 'test-transform';
const TEST_DATA = {
  client: {
    agent: '',
    app: {
      id: 0,
      key: '',
    },
    installation: {
      id: 0,
    },
  },
  filters: [],
  projects: [],
  redirect: {
    defaults: {},
    forces: {},
  },
  strict: false,
  transforms: [],
};

const TEST_METADATA = {
  kind: 'github-approve-controller',
  name: 'test-controller',
};

interface ClientResponse<T> {
  endpoint: any;
  (params: any): Promise<Octokit.Response<T>>;
}

function checkResponse(checks: Array<unknown>): ClientResponse<Octokit.ChecksListForRefResponse> {
  const listForRef: ClientResponse<Octokit.ChecksListForRefResponse> = () => Promise.resolve({
    [Symbol.iterator]: undefined as any,
    data: {
      check_runs: [],
      total_count: 0,
    },
    headers: {} as any,
    status: STATUS_SUCCESS,
  });
  listForRef.endpoint = undefined;

  return listForRef;
}

function pullResponse(pulls: Array<unknown>): ClientResponse<Octokit.PullsGetResponse> {
  const pullGetter: ClientResponse<Octokit.PullsGetResponse> = () => Promise.resolve({
    [Symbol.iterator]: undefined as any,
    data: {
      head: {
        sha: '',
      },
      user: {
        login: '',
      },
    } as any,
    headers: {} as any,
    status: STATUS_SUCCESS,
  });
  pullGetter.endpoint = undefined;

  return pullGetter;
}

function reviewResponse(): ClientResponse<Octokit.PullsCreateReviewParams> {
  const createReview: ClientResponse<Octokit.PullsCreateReviewParams> = () => Promise.resolve({
    [Symbol.iterator]: undefined as any,
    data: {} as any,
    headers: {} as any,
    status: STATUS_SUCCESS,
  });
  createReview.endpoint = undefined;

  return createReview;
}

function statusResponse(statuses: Array<unknown>): ClientResponse<Octokit.ReposGetCombinedStatusForRefResponse> {
  const getCombinedStatusForRef: ClientResponse<Octokit.ReposGetCombinedStatusForRefResponse> = () => Promise.resolve({
    [Symbol.iterator]: undefined as any,
    data: {
      commit_url: '',
      repository: {} as any,
      sha: '',
      state: '',
      statuses: [],
      total_count: 0,
      url: '',
    },
    headers: {} as any,
    status: STATUS_SUCCESS,
  });
  getCombinedStatusForRef.endpoint = undefined;

  return getCombinedStatusForRef;
}

describe('github approve controller', async () => {
  it('should reply with approval when checks pass', async () => {
    const { container, services } = await createServiceContainer();
    const createReview = reviewResponse();
    const pullGetter = pullResponse([]);

    services.bind(GithubClient).toInstance(ineeda<GithubClient>({
      client: {
        pulls: {
          createReview,
          get: pullGetter,
        },
      },
    }));

    const sendMessage = spy();
    const ctrl = await createService(container, GithubApproveController, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    stub(ctrl, 'checkRef').returns(Promise.resolve({
      checks: [],
      errors: [],
      status: true,
    }));

    await ctrl.start();
    await ctrl.approveRequest(new Command({
      data: {
        owner: ['foo'],
        project: ['bar'],
        request: ['1'],
      },
      labels: {},
      noun: '',
      verb: CommandVerb.Create,
    }), ineeda<Context>());

    expect(sendMessage).to.have.callCount(1);
    expect(sendMessage).to.have.been.calledWithMatch({
      body: match.string.and(match('pass')),
    });
  });

  it('should reply with errors when checks fail', async () => {
    const { container, services } = await createServiceContainer();
    const createReview = reviewResponse();
    const pullGetter = pullResponse([]);

    services.bind(GithubClient).toInstance(ineeda<GithubClient>({
      client: {
        pulls: {
          createReview,
          get: pullGetter,
        },
      },
    }));

    const sendMessage = spy();
    const ctrl = await createService(container, GithubApproveController, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    stub(ctrl, 'checkRef').returns(Promise.resolve({
      checks: [],
      errors: [],
      status: false,
    }));

    await ctrl.start();
    await ctrl.approveRequest(new Command({
      data: {
        owner: ['foo'],
        project: ['bar'],
        request: ['1'],
      },
      labels: {},
      noun: '',
      verb: CommandVerb.Create,
    }), ineeda<Context>());

    expect(sendMessage).to.have.callCount(1);
    expect(sendMessage).to.have.been.calledWithMatch({
      body: match.string.and(match('fail')),
    });
  });

  it('should fail when project is not defined', async () => {
    const { container, services } = await createServiceContainer();
    const listForRef = checkResponse([]);
    const getCombinedStatusForRef = statusResponse([]);

    services.bind(GithubClient).toInstance(ineeda<GithubClient>({
      client: {
        checks: {
          listForRef,
        },
        repos: {
          getCombinedStatusForRef,
        }
      },
    }));

    const sendMessage = spy();
    const ctrl = await createService(container, GithubApproveController, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    await ctrl.start();
    const result = await ctrl.checkRef({
      owner: 'foo',
      ref: '',
      repo: 'bar',
    }, '');

    expect(result.checks).to.have.lengthOf(0);
    expect(sendMessage).to.have.callCount(0);
  });

  it('should fail when author is not trusted', async () => {
    const { container, services } = await createServiceContainer();
    const listForRef = checkResponse([]);
    const getCombinedStatusForRef = statusResponse([]);

    services.bind(GithubClient).toInstance(ineeda<GithubClient>({
      client: {
        checks: {
          listForRef,
        },
        repos: {
          getCombinedStatusForRef,
        }
      },
    }));

    const sendMessage = spy();
    const ctrl = await createService(container, GithubApproveController, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      data: {
        ...TEST_DATA,
        projects: [{
          authors: ['bob'],
          checks: [],
          owner: 'foo',
          project: 'bar',
        }],
      },
      metadata: TEST_METADATA,
    });
    await ctrl.start();
    const result = await ctrl.checkRef({
      owner: 'foo',
      ref: '',
      repo: 'bar',
    }, 'leeroy');

    expect(result.checks).to.have.lengthOf(0);
    expect(sendMessage).to.have.callCount(0);
  });

  it('should handle projects with zero checks', async () => {
    const { container, services } = await createServiceContainer();
    const listForRef = checkResponse([]);
    const getCombinedStatusForRef = statusResponse([]);

    services.bind(GithubClient).toInstance(ineeda<GithubClient>({
      client: {
        checks: {
          listForRef,
        },
        repos: {
          getCombinedStatusForRef,
        }
      },
    }));

    const sendMessage = spy();
    const ctrl = await createService(container, GithubApproveController, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      data: {
        ...TEST_DATA,
        projects: [{
          authors: ['bob'],
          checks: [],
          owner: 'foo',
          project: 'bar',
        }],
      },
      metadata: TEST_METADATA,
    });
    await ctrl.start();
    const result = await ctrl.checkRef({
      owner: 'foo',
      ref: '',
      repo: 'bar',
    }, 'bob');

    expect(result.checks).to.have.lengthOf(0);
    expect(sendMessage).to.have.callCount(0);
  });
});
