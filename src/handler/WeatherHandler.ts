import { Container, Inject } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { CoreOptions, RequiredUriUrl } from 'request';
import { Bot } from 'src/Bot';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface WeatherHandlerConfig extends HandlerConfig {
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
export class WeatherHandler extends BaseHandler<WeatherHandlerConfig> implements Handler {
  protected container: Container;
  protected template: Template;

  constructor(options: WeatherHandlerOptions) {
    super(options);

    this.container = options.container;
    this.template = options.compiler.compile(options.config.template);
  }

  public async handle(cmd: Command): Promise<void> {
    const location = cmd.get('location');
    if (!location) {
      return this.bot.send(Message.reply('unknown or missing location', cmd.context));
    }

    try {
      const weather = await this.getWeather(location);
      const body = this.template.render({
        cmd,
        weather
      });
      this.logger.debug({ body, weather }, 'rendering weather data');

      return this.bot.send(Message.reply(body, cmd.context));
    } catch (err) {
      this.logger.error(err, 'error getting weather');
    }
  }

  protected async getWeather(location: string): Promise<WeatherReply> {
    const query = this.getQuery(location);
    this.logger.debug({ location, query }, 'requesting weather data from API');

    try {
      const weather = await this.container.create<WeatherReply, BaseOptions & CoreOptions & RequiredUriUrl>('request', {
        json: true,
        method: 'GET',
        qs: query,
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

  public getQuery(location: string) {
    const qs: Partial<WeatherQuery> = {
      APPID: this.config.api.key
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
