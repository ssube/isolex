import { App } from '@octokit/app';
import Octokit from '@octokit/rest';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, stub } from 'sinon';

import { GithubClient } from '../../../src/utils/github';
import { describeLeaks, itLeaks } from '../../helpers/async';
import { createServiceContainer } from '../../helpers/container';

// tslint:disable:no-any
describeLeaks('github client', async () => {
  itLeaks('should poll for new tokens', async () => {
    const getInstallationAccessToken = stub().returns('test');
    const app = stub().returns(ineeda<App>({
      getInstallationAccessToken,
    })) as any;
    const { container } = await createServiceContainer();
    const client = await container.create(GithubClient, {
      app,
      data: {
        agent: '',
        app: {
          id: 0,
          key: '',
        },
        installation: {
          id: 0,
        },
      },
    });
    const token = await client.renewToken();

    expect(getInstallationAccessToken).to.have.callCount(1);
    expect(token).to.equal('token test');
  });

  itLeaks('should poll for new tokens', async () => {
    const kit = stub().returns(ineeda<Octokit>()) as any;
    const { container } = await createServiceContainer();
    await container.create(GithubClient, {
      data: {
        agent: '',
        app: {
          id: 0,
          key: '',
        },
        installation: {
          id: 0,
        },
      },
      kit,
    });
    expect(kit).to.have.been.calledWithMatch(match.has('auth', match.func));
  });
});
