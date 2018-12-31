import { Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { RequestFactory } from 'src/utils/Request';
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

export const NOUN_WEATHER = 'weather';

@Inject('compiler', 'request')
export class WeatherController extends BaseController<WeatherControllerData> implements Controller {
  protected readonly request: RequestFactory;

  constructor(options: WeatherControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-weather', [NOUN_WEATHER]);

    this.request = options.request;
  }

  public async handle(cmd: Command): Promise<void> {
    const [location] = cmd.get('location');
    if (!location) {
      return this.reply(cmd.context, 'unknown or missing location');
    }

    try {
      const weather = await this.getWeather(location);

      this.logger.debug({ weather }, 'transforming weather data');
      return this.transformJSON(cmd, weather);
    } catch (err) {
      this.logger.error(err, 'error getting weather');
    }
  }

  public async getWeather(location: string): Promise<WeatherReply> {
    const query = this.getQuery(location);
    this.logger.debug({ location, query, root: this.data.api.root }, 'requesting weather data from API');

    try {
      return this.request.create({
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
