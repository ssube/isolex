import { Context } from 'src/entity/Context';
import { Service } from 'src/Service';

export interface PermissionProvider extends Service {
  checkPermissions(ctx: Context, permissions: Array<string>): Promise<boolean>;
}