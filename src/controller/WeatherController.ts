import { Container, Inject } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';
import { CoreOptions, RequiredUriUrl } from 'request';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { TYPE_JSON, TYPE_TEXT } from 'src/utils/Mime';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface WeatherControllerData extends ControllerData {
  api: {
    key: string;
    root: string;
  };
}

export interface WeatherControllerOptions extends ControllerOptions<WeatherControllerData> {
  compiler: TemplateCompiler;
}

export const NOUN_REPORT = 'report';

@Inject('compiler')
export class WeatherController extends BaseController<WeatherControllerData> implements Controller {
  protected readonly container: Container;

  constructor(options: WeatherControllerOptions) {
    super(options, [NOUN_REPORT]);
    this.container = options.container;
  }

  public async handle(cmd: Command): Promise<void> {
    const [location] = cmd.get('location');
    if (!location) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'unknown or missing location'));
      return;
    }

    try {
      const weather = await this.getWeather(location);

      this.logger.debug({ weather }, 'transforming weather data');
      const messages = await this.transform(cmd, Message.reply(cmd.context, TYPE_JSON, JSON.stringify(weather)));
      for (const msg of messages) {
        this.logger.debug({ msg }, 'sending weather msg');
        await this.bot.sendMessage(msg);
      }
    } catch (err) {
      this.logger.error(err, 'error getting weather');
    }
  }

  public async getWeather(location: string): Promise<WeatherReply> {
    const query = this.getQuery(location);
    this.logger.debug({ location, query, root: this.data.api.root }, 'requesting weather data from API');

    try {
      return this.container.create<WeatherReply, BaseOptions & CoreOptions & RequiredUriUrl>('request', {
        json: true,
        method: 'GET',
        qs: query,
        uri: `${this.data.api.root}/weather`,
      });
    } catch (err) {
      if (err.name === 'StatusCodeError') {
        const [code, body] = err.message.split(' - ');
        const data = JSON.parse(body);

        this.logger.warn({ code, data }, 'error from weather API');
        throw err;
      } else {
        throw err;
      }
    }
  }

  public getQuery(location: string) {
    const qs: Partial<WeatherQuery> = {
      APPID: this.data.api.key,
    };

    if (/^[0-9]+$/.test(location)) {
      // all digits = zip code
      qs.zip = location;
    } else {
      qs.q = location;
    }

    return qs;
  }
}

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
