import { describeLeaks, itLeaks } from '../../helpers/async';

describeLeaks('github pull controller', async () => {
  itLeaks('should close pull requests');
  itLeaks('should get pull request data');
  itLeaks('should list pull requests');
  itLeaks('should approve merge requests');
  itLeaks('should merge merge requests');
});
