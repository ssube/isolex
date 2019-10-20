import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { BaseError } from 'noicejs';
import { match, stub } from 'sinon';

import { INJECT_REQUEST } from '../../../src/BaseService';
import { InvalidArgumentError } from '../../../src/error/InvalidArgumentError';
import { GitlabClient, GitlabClientData } from '../../../src/utils/gitlab';
import { RequestFactory } from '../../../src/utils/Request';
import { describeLeaks, itLeaks } from '../../helpers/async';
import { createContainer } from '../../helpers/container';

// tslint:disable:no-identical-functions

const TEST_DATA: GitlabClientData = {
  root: 'https://example.com',
  token: 'super-secret',
};

async function createClient() {
  const { container } = await createContainer();
  const create = stub().returns('{}');
  const request = ineeda<RequestFactory>({
    create,
  });
  const client = await container.create(GitlabClient, {
    [INJECT_REQUEST]: request,
    data: TEST_DATA,
  });

  return { client, create };
}

describeLeaks('gitlab client', async () => {
  itLeaks('should cancel jobs', async () => {
    const { client, create } = await createClient();
    await client.cancelJob({
      group: 'test',
      job: '123',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'POST'));
  });

  itLeaks('should cancel pipelines', async () => {
    const { client, create } = await createClient();
    await client.cancelPipeline({
      group: 'test',
      pipeline: '123',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'POST'));
  });

  itLeaks('should create pipelines', async () => {
    const { client, create } = await createClient();
    await client.createPipeline({
      group: 'test',
      project: 'test',
      ref: 'master',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'POST'));
  });

  itLeaks('should get single jobs', async () => {
    const { client, create } = await createClient();
    await client.getJob({
      group: 'test',
      job: '123',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'GET'));
  });

  itLeaks('should get single pipelines', async () => {
    const { client, create } = await createClient();
    await client.getPipeline({
      group: 'test',
      pipeline: '123',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'GET'));
  });

  itLeaks('should get single projects', async () => {
    const { client, create } = await createClient();
    await client.getProject({
      group: 'test',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'GET'));
  });

  itLeaks('should list jobs for a project', async () => {
    const { client, create } = await createClient();
    await client.listJobs({
      group: 'test',
      pipeline: '',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'GET'));
  });

  itLeaks('should list jobs for a pipeline', async () => {
    const { client, create } = await createClient();
    await client.listJobs({
      group: 'test',
      pipeline: '123',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'GET'));
  });

  itLeaks('should list pipelines', async () => {
    const { client, create } = await createClient();
    await client.listPipelines({
      group: 'test',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'GET'));
  });

  itLeaks('should list projects', async () => {
    const { client, create } = await createClient();
    await client.listProjects({
      group: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'GET'));
  });

  itLeaks('should retry jobs', async () => {
    const { client, create } = await createClient();
    await client.retryJob({
      group: 'test',
      job: '123',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'POST'));

  });

  itLeaks('should retry pipelines', async () => {
    const { client, create } = await createClient();
    await client.retryPipeline({
      group: 'test',
      pipeline: '123',
      project: 'test',
    });
    expect(create).to.have.been.calledOnceWith(match.has('method', 'POST'));
  });

  itLeaks('should handle request errors', async () => {
    const { container } = await createContainer();
    const create = stub().throws(new InvalidArgumentError());
    const request = ineeda<RequestFactory>({
      create,
    });
    const client = await container.create(GitlabClient, {
      [INJECT_REQUEST]: request,
      data: TEST_DATA,
    });

    return expect(client.getJob({
      group: 'test',
      job: '123',
      project: 'test',
    })).to.eventually.be.rejectedWith(BaseError);
  });
});
