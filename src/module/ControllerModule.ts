import { ModuleOptions } from 'noicejs/Module';

import { AccountController } from 'src/controller/AccountController';
import { CompletionController } from 'src/controller/CompletionController';
import { CountController } from 'src/controller/CountController';
import { DiceController } from 'src/controller/DiceController';
import { EchoController } from 'src/controller/EchoController';
import { GithubPRController } from 'src/controller/github/PRController';
import { GitlabCIController } from 'src/controller/gitlab/CIController';
import { KubernetesCoreController } from 'src/controller/kubernetes/CoreController';
import { LearnController } from 'src/controller/LearnController';
import { MathController } from 'src/controller/MathController';
import { PickController } from 'src/controller/PickController';
import { RandomController } from 'src/controller/RandomController';
import { ReactionController } from 'src/controller/ReactionController';
import { SearchController } from 'src/controller/SearchController';
import { SedController } from 'src/controller/SedController';
import { TimeController } from 'src/controller/TimeController';
import { TokenController } from 'src/controller/TokenController';
import { UserController } from 'src/controller/UserController';
import { WeatherController } from 'src/controller/WeatherController';
import { BaseModule } from 'src/module/BaseModule';

export class ControllerModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // controllers
    this.bindService(AccountController);
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
    this.bindService(KubernetesCoreController);
  }
}
