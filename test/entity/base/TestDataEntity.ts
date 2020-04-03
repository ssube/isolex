import { MissingKeyError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { DataEntity } from '../../../src/entity/base/DataEntity';

class TestEntity extends DataEntity<string> {
  public getDataStr() {
    return this.dataStr;
  }

  public setDataStr(str: string) {
    this.dataStr = str;
    this.labelStr = str;
  }

  public toJSON(): object {
    return {};
  }
}

// tslint:disable:no-identical-functions
describe('base data entity', async () => {
  it('should sync string data to map', async () => {
    const entity = new TestEntity({
      data: {},
      labels: {},
    });
    entity.setDataStr('[["foo", "bar"]]');
    entity.syncMap();
    expect(entity.get('foo')).to.equal('bar');
  });

  it('should sync map data to string', async () => {
    const entity = new TestEntity({
      data: {
        foo: 'bar',
      },
      labels: {},
    });
    entity.syncStr();
    expect(entity.getDataStr()).to.include('foo');
    expect(entity.getDataStr()).to.include('bar');
  });

  it('should check for key existence', async () => {
    const entity = new TestEntity({
      data: {
        foo: 'bar',
      },
      labels: {},
    });
    expect(entity.has('foo')).to.equal(true);
    expect(entity.has('bar')).to.equal(false);
  });

  it('should get an item', async () => {
    const entity = new TestEntity({
      data: {
        foo: 'bar',
      },
      labels: {},
    });
    expect(entity.get('foo')).to.equal('bar');
  });

  it('should throw on missing items', async () => {
    const entity = new TestEntity({
      data: {
        foo: 'bar',
      },
      labels: {},
    });
    expect(() => entity.get('bar')).to.throw(MissingKeyError);
  });

  it('should get a default value', async () => {
    const entity = new TestEntity({
      data: {
        foo: 'bar',
      },
      labels: {},
    });
    expect(entity.getOrDefault('bar', 'default')).to.equal('default');
  });
});
