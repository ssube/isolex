import { App } from '@octokit/app';
import Octokit from '@octokit/rest';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy, stub } from 'sinon';

import { defer } from '../../../src/utils/Async';
import { GithubClient } from '../../../src/utils/github';
import { describeLeaks, itLeaks } from '../../helpers/async';
import { createServiceContainer } from '../../helpers/container';

const TEST_DATA = {
  agent: '',
  app: {
    id: 0,
    key: 'invalued',
  },
  installation: {
    id: 0,
  },
};

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
      data: TEST_DATA,
    });
    const token = await client.renewToken();

    expect(getInstallationAccessToken).to.have.callCount(1);
    expect(token).to.equal('token test');
  });

  itLeaks('should poll for new tokens', async () => {
    const getInstallationAccessToken = stub().returns('test');
    const app = stub().returns(ineeda<App>({
      getInstallationAccessToken,
    })) as any;
    const kit = stub().yieldsToAsync('auth', []).returns(ineeda<Octokit>()) as any;
    const { container } = await createServiceContainer();
    const client = await container.create(GithubClient, {
      app,
      data: TEST_DATA,
      kit,
    });
    const renewSpy = spy(client, 'renewToken');
    await defer(0);

    expect(getInstallationAccessToken).to.have.callCount(1);
    expect(kit).to.have.been.calledWithMatch(match.has('auth', match.func));
    expect(renewSpy).to.have.callCount(1);
  });
});
