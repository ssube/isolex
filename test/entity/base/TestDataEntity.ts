import { describeLeaks, itLeaks } from '../../helpers/async';

describeLeaks('base data entity', async () => {
  itLeaks('should sync string data to map');
  itLeaks('should sync map data to string');
  itLeaks('should check for key existence');
  itLeaks('should get an item');
  itLeaks('should get a default value');
});
