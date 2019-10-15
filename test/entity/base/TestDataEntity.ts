import { expect } from 'chai';

import { DataEntity } from '../../../src/entity/base/DataEntity';
import { describeLeaks, itLeaks } from '../../helpers/async';

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
describeLeaks('base data entity', async () => {
  itLeaks('should sync string data to map', async () => {
    const entity = new TestEntity({
      data: {},
      labels: {},
    });
    entity.setDataStr('[["foo", "bar"]]');
    entity.syncMap();
    expect(entity.get('foo')).to.equal('bar');
  });

  itLeaks('should sync map data to string', async () => {
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

  itLeaks('should check for key existence');
  itLeaks('should get an item');
  itLeaks('should get a default value');
});
