import { Inject } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { INJECT_REQUEST } from '../BaseService';
import { Command, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { mustExist } from '../utils';
import { RequestFactory } from '../utils/Request';
import { BaseController, BaseControllerOptions } from './BaseController';

export interface WeatherControllerData extends ControllerData {
  api: {
    key: string;
    root: string;
  };
}

export const NOUN_WEATHER = 'weather';

@Inject(INJECT_REQUEST)
export class WeatherController extends BaseController<WeatherControllerData> implements Controller {
  protected readonly request: RequestFactory;

  constructor(options: BaseControllerOptions<WeatherControllerData>) {
    super(options, 'isolex#/definitions/service-controller-weather', [NOUN_WEATHER]);

    this.request = mustExist(options[INJECT_REQUEST]);
  }

  @Handler(NOUN_WEATHER, CommandVerb.Get)
  @CheckRBAC()
  public async getWeather(cmd: Command, ctx: Context): Promise<void> {
    const location = cmd.getHead('location');

    try {
      const weather = await this.requestWeather(location);

      this.logger.debug({ weather }, 'transforming weather data');
      return this.transformJSON(cmd, weather);
    } catch (err) {
      this.logger.error(err, 'error getting weather');
    }
  }

  @Handler(NOUN_WEATHER, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }

  public async requestWeather(location: string): Promise<WeatherReply> {
    const query = this.getQuery(location);
    this.logger.debug({ location, query, root: this.data.api.root }, 'requesting data from weather API');

    try {
      const reply = await this.request.create<WeatherReply>({
        json: true,
        method: 'GET',
        qs: query,
        uri: `${this.data.api.root}/weather`,
      });
      this.logger.debug({ reply }, 'response from weather API');
      return reply;
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
