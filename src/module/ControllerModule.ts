import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { CountController } from 'src/controller/CountController';
import { DiceController } from 'src/controller/DiceController';
import { EchoController } from 'src/controller/EchoController';
import { KubernetesController } from 'src/controller/KubernetesController';
import { LearnController } from 'src/controller/LearnController';
import { MathController } from 'src/controller/MathController';
import { PickController } from 'src/controller/PickController';
import { RandomController } from 'src/controller/RandomController';
import { ReactionController } from 'src/controller/ReactionController';
import { SearchController } from 'src/controller/SearchController';
import { SedController } from 'src/controller/SedController';
import { TimeController } from 'src/controller/TimeController';
import { WeatherController } from 'src/controller/WeatherController';
import { AuthController } from 'src/controller/AuthController';

export class ControllerModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // controllers
    this.bind(kebabCase(AuthController.name)).toConstructor(AuthController);
    this.bind(kebabCase(CountController.name)).toConstructor(CountController);
    this.bind(kebabCase(DiceController.name)).toConstructor(DiceController);
    this.bind(kebabCase(EchoController.name)).toConstructor(EchoController);
    this.bind(kebabCase(KubernetesController.name)).toConstructor(KubernetesController);
    this.bind(kebabCase(LearnController.name)).toConstructor(LearnController);
    this.bind(kebabCase(MathController.name)).toConstructor(MathController);
    this.bind(kebabCase(PickController.name)).toConstructor(PickController);
    this.bind(kebabCase(RandomController.name)).toConstructor(RandomController);
    this.bind(kebabCase(ReactionController.name)).toConstructor(ReactionController);
    this.bind(kebabCase(SedController.name)).toConstructor(SedController);
    this.bind(kebabCase(SearchController.name)).toConstructor(SearchController);
    this.bind(kebabCase(TimeController.name)).toConstructor(TimeController);
    this.bind(kebabCase(WeatherController.name)).toConstructor(WeatherController);
  }
}
