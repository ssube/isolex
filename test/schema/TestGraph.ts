import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('graph schema', async () => {
  itLeaks('should execute commands');
  itLeaks('should send messages');
  itLeaks('should get past commands');
  itLeaks('should get past messages');
  itLeaks('should get existing services');
  itLeaks('should get a single service');
});
