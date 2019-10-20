import { ModuleOptions } from 'noicejs';

import { AccountController } from '../controller/AccountController';
import { BotController } from '../controller/BotController';
import { CommandController } from '../controller/CommandController';
import { CompletionController } from '../controller/CompletionController';
import { CountController } from '../controller/CountController';
import { DiceController } from '../controller/DiceController';
import { EchoController } from '../controller/EchoController';
import { GithubPRController } from '../controller/github/PRController';
import { GitlabCIController } from '../controller/gitlab/CIController';
import { KubernetesAppsController } from '../controller/kubernetes/AppsController';
import { KubernetesCoreController } from '../controller/kubernetes/CoreController';
import { LearnController } from '../controller/LearnController';
import { MathController } from '../controller/MathController';
import { PickController } from '../controller/PickController';
import { RandomController } from '../controller/RandomController';
import { ReactionController } from '../controller/ReactionController';
import { SearchController } from '../controller/SearchController';
import { SedController } from '../controller/SedController';
import { TimeController } from '../controller/TimeController';
import { TokenController } from '../controller/TokenController';
import { UserController } from '../controller/UserController';
import { WeatherController } from '../controller/WeatherController';
import { BaseModule } from '../module/BaseModule';

export class ControllerModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // controllers
    this.bindService(AccountController);
    this.bindService(BotController);
    this.bindService(CommandController);
    this.bindService(CompletionController);
    this.bindService(CountController);
    this.bindService(DiceController);
    this.bindService(EchoController);
    this.bindService(LearnController);
    this.bindService(MathController);
    this.bindService(PickController);
    this.bindService(RandomController);
    this.bindService(ReactionController);
    this.bindService(SedController);
    this.bindService(SearchController);
    this.bindService(TimeController);
    this.bindService(TokenController);
    this.bindService(UserController);
    this.bindService(WeatherController);

    // github controllers
    this.bindService(GithubPRController);

    // gitlab controllers
    this.bindService(GitlabCIController);

    // kubernetes controllers
    this.bindService(KubernetesAppsController);
    this.bindService(KubernetesCoreController);
  }
}
