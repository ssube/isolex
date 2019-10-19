import { describeLeaks, itLeaks } from '../../helpers/async';

describeLeaks('metrics interval', async () => {
  itLeaks('should call the tick function');
  itLeaks('should set and clear a collector interval');
});
