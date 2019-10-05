import { expect } from 'chai';

import { Checklist, ChecklistMode } from '../../src/utils/Checklist';
import { describeLeaks, itLeaks } from '../helpers/async';

const EXISTING_ITEM = 'foo';
const MISSING_ITEM = 'bin';
const TEST_DATA = [EXISTING_ITEM, 'bar'];

// tslint:disable:no-duplicate-functions
describeLeaks('checklist', async () => {
  describeLeaks('exclude mode', async () => {
    itLeaks('should check for present values', async () => {
      const list = new Checklist({
        data: TEST_DATA,
        mode: ChecklistMode.EXCLUDE,
      });
      expect(list.check(EXISTING_ITEM)).to.equal(false);
    });

    itLeaks('should check for missing values', async () => {
      const list = new Checklist({
        data: TEST_DATA,
        mode: ChecklistMode.EXCLUDE,
      });
      expect(list.check(MISSING_ITEM)).to.equal(true);
    });
  });

  describeLeaks('include mode', async () => {
    itLeaks('should check for present values', async () => {
      const list = new Checklist<string>({
        data: TEST_DATA,
        mode: ChecklistMode.INCLUDE,
      });
      expect(list.check(EXISTING_ITEM)).to.equal(true);
    });

    itLeaks('should check for missing values', async () => {
      const list = new Checklist<string>({
        data: TEST_DATA,
        mode: ChecklistMode.INCLUDE,
      });
      expect(list.check(MISSING_ITEM)).to.equal(false);
    });
  });
});
