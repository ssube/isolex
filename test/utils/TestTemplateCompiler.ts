import { expect } from 'chai';
import { stub } from 'sinon';

import { Context } from '../../src/entity/Context';
import { TemplateCompiler, testEq } from '../../src/utils/TemplateCompiler';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createContainer } from '../helpers/container';

describeLeaks('template compiler', async () => {
  describeLeaks('format context helper', async () => {
    itLeaks('should prefix a name', async () => {
      const { container } = await createContainer();
      const compiler = await container.create(TemplateCompiler);
      const ctx = new Context({
        channel: {
          id: '',
          thread: '',
        },
        name: 'foo',
        uid: '',
      });
      expect(compiler.formatContext(ctx)).to.equal('@foo');
    });
  });

  describeLeaks('format entries helper', async () => {
    itLeaks('should format a map', async () => {
      const { container } = await createContainer();
      const compiler = await container.create(TemplateCompiler);
      const data = new Map([
        ['foo', ''],
        ['bar', ''],
      ]);
      expect(compiler.formatEntries(data, {
        fn: () => 'foo', // block fn produces the items in the final join
        hash: '',
        inverse: () => '',
      })).to.equal('foofoo');
    });
  });

  describeLeaks('format json helper', async () => {
    itLeaks('should flatten objects', async () => {
      const { container } = await createContainer();
      const compiler = await container.create(TemplateCompiler);
      expect(compiler.formatJSON({}).toString()).to.equal('{}');
    });
  });

  describeLeaks('format trim helper', async () => {
    itLeaks('should trim strings to length', async () => {
      const { container } = await createContainer();
      const compiler = await container.create(TemplateCompiler);
      expect(compiler.formatTrim('hello world', 6, '!')).to.equal('hello!');
    });
  });

  describeLeaks('test equality helper', async () => {
    itLeaks('should call block when operands are exactly equal', async () => {
      const test = 'test-value';
      const data = {};
      const fn = stub().returns(test);
      expect(testEq.call(data, test, test, {
        data,
        fn,
        hash: '',
        inverse: () => '',
      })).to.equal(test);
      expect(fn).to.have.been.calledWithExactly(data);
    });
  });
});
