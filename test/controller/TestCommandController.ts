import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('command controller', async () => {
  itLeaks('should execute the next command');
  itLeaks('should filter out entities');
  itLeaks('should transform command data');
});
