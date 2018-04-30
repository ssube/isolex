import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import * as request from 'request-promise';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler, HandlerOptions } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { Template } from 'src/util/Template';
import { TemplateCompiler } from 'src/util/TemplateCompiler';

export type WeatherQuery = {
  /**
   * City id lookup.
   */
  id: number;

  lat: number;
  lon: number;

  /**
   * City name lookup, optionally with country code.
   */
  q: string;

  /**
   * Zip code lookup, optionally with country code, like `12345` or `12345,us`.
   */
  zip: string;
};

/**
 * Reply model for https://openweathermap.org/current
 */
export type WeatherReply = {
  clouds: {
    all: number;
  };
  cod: number;
  coord: {
    lat: number;
    lon: number;
  }
  dt: number;
  id: number;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  name: string;
  rain: {
    '3h': number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  }
  weather: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
  }>;
  wind: {
    deg: number;
    speed: number;
  };
}

export interface WeatherHandlerConfig {
  api: {
    root: string;
  }
  template: string;
}

export interface WeatherHandlerOptions extends HandlerOptions {
  compiler: TemplateCompiler;
  config: WeatherHandlerConfig;
}

// @Inject(TemplateCompiler)
export class WeatherHandler implements Handler {
  protected bot: Bot;
  protected config: WeatherHandlerConfig;
  protected logger: Logger;
  protected template: Template;

  constructor(options: WeatherHandlerOptions) {
    this.bot = options.bot;
    this.config = options.config;
    this.logger = options.logger.child({
      class: WeatherHandler.name
    });
    this.template = options.compiler.compile(options.config.template);
  }

  public async handle(cmd: Command) {
    if (cmd.name !== 'test_weather') {
      return false;
    }

    const qs: any = {}; // @todo: this should be a Partial<WeatherQuery>
    for (const key of ['id', 'lat', 'lon', 'q', 'zip']) {
      if (cmd.has(key)) {
        qs[key] = cmd.get(key);
      }
    }

    const weather: WeatherReply = await request({
      json: true,
      method: 'GET',
      qs,
      uri: `${this.config.api.root}/weather`
    });

    const body = this.template.render(weather);

    await this.bot.send(new Message({
      body,
      dest: cmd.from
    }));

    return true;
  }
}
