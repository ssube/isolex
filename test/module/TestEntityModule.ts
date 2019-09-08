import { expect } from 'chai';
import { isConstructor } from 'noicejs';

import { EntityModule } from '../../src/module/EntityModule';
import { describeAsync } from '../helpers/async';

describeAsync('DI modules', async () => {
  describeAsync('entity module', async () => {
    it('should return list of entity types', async () => {
      const module = new EntityModule();
      const entities = await module.createEntities();

      expect(Array.isArray(entities)).to.equal(true);
      expect(entities.length).to.be.greaterThan(0);

      for (const entity of entities) {
        expect(isConstructor(entity)).to.equal(true, 'entity must be constructor');
      }
    });
  });
});
