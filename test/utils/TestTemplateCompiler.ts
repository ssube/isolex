import { expect } from 'chai';
import { stub } from 'sinon';

import { Context } from '../../src/entity/Context';
import { TemplateCompiler, testEq } from '../../src/utils/TemplateCompiler';
import { createContainer } from '../helpers/container';

describe('template compiler', async () => {
  describe('format context helper', async () => {
    it('should prefix a name', async () => {
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

  describe('format entries helper', async () => {
    it('should format a map', async () => {
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

  describe('format json helper', async () => {
    it('should flatten objects', async () => {
      const { container } = await createContainer();
      const compiler = await container.create(TemplateCompiler);
      expect(compiler.formatJSON({}).toString()).to.equal('{}');
    });
  });

  describe('format trim helper', async () => {
    it('should trim strings to length', async () => {
      const { container } = await createContainer();
      const compiler = await container.create(TemplateCompiler);

      const REMOVE_CHARS = 6;
      expect(compiler.formatTrim('hello world', REMOVE_CHARS, '!')).to.equal('hello!');
    });
  });

  describe('test equality helper', async () => {
    it('should call block when operands are exactly equal', async () => {
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
