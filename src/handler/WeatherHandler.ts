import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import * as request from 'request-promise';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler, HandlerOptions } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { Template } from 'src/util/Template';
import { TemplateCompiler } from 'src/util/TemplateCompiler';

export interface WeatherQuery {
  APPID: string;

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
}

/**
 * Reply model for https://openweathermap.org/current
 */
export interface WeatherReply {
  clouds: {
    all: number;
  };
  cod: number;
  coord: {
    lat: number;
    lon: number;
  };
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
  };
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
    key: string;
    root: string;
  };
  template: string;
}

export interface WeatherHandlerOptions extends HandlerOptions<WeatherHandlerConfig> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
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

    const location = cmd.get('location');
    if (!location) {
      await this.bot.send(new Message({
        body: 'unknown or missing location',
        context: cmd.context,
        reactions: []
      }));
      return true;
    }

    try {
      const weather = await this.getWeather(location);
      const body = this.template.render({
        cmd,
        weather
      });
      this.logger.debug({ body, weather }, 'rendering weather data');

      await this.bot.send(new Message({
        body,
        context: cmd.context,
        reactions: []
      }));

      return true;
    } catch (err) {
      this.logger.error(err, 'error getting weather');

      return false;
    }
  }

  protected async getWeather(location: string): Promise<WeatherReply> {
    const qs: Partial<WeatherQuery> = {
      APPID: this.config.api.key
    };

    if (/^[0-9]+$/.test(location)) {
      // all digits = zip code
      qs.zip = location;
    } else {
      qs.q = location;
    }

    this.logger.debug({ location, qs }, 'requesting weather data from API');

    try {
      const weather: WeatherReply = await request({
        json: true,
        method: 'GET',
        qs,
        uri: `${this.config.api.root}/weather`
      });

      return weather;
    } catch (err) {
      if (err.name === 'StatusCodeError') {
        const [code, body] = err.message.split(' - ');
        const data = JSON.parse(body);

        this.logger.warn({ code }, 'error from weather API');
        throw err;
      } else {
        throw err;
      }
    }
  }
}
