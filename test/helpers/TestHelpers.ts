import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('test helpers', async () => {
  itLeaks('should wrap suites');
  itLeaks('should wrap tests');
});
