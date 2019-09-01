import { describeAsync, itAsync } from '../helpers/async';

describeAsync('test helpers', async () => {
  itAsync('should wrap suites');
  itAsync('should wrap tests');
});
