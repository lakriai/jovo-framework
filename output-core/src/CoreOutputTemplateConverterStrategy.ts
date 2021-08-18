import {
  ListenValue,
  mergeInstances,
  OutputTemplate,
  OutputTemplateConverterStrategy,
} from '@jovotech/output';
import { OutputTemplateConverterStrategyConfig } from '@jovotech/output/src';
import { CoreResponse } from './models';

export class CoreOutputTemplateConverterStrategy extends OutputTemplateConverterStrategy<
  CoreResponse,
  OutputTemplateConverterStrategyConfig
> {
  responseClass = CoreResponse;
  platformName = 'Core';

  toResponse(output: OutputTemplate | OutputTemplate[]): CoreResponse {
    output = Array.isArray(output) ? output : [output];
    const response: CoreResponse = {
      version: '4.0.0',
      platform: 'core',
      output,
      context: {
        request: {},
        session: {
          end: false,
          data: {},
        },
        user: {
          data: {},
        },
      },
    };
    let lastListen: ListenValue | undefined;
    output.forEach((outputItem) => {
      const listen = outputItem.platforms?.CorePlatform?.listen ?? outputItem.listen;
      if (typeof listen === 'boolean' || typeof listen === 'object') {
        lastListen = listen;
      }
      if (outputItem.platforms?.CorePlatform?.nativeResponse) {
        mergeInstances(response, outputItem.platforms.CorePlatform.nativeResponse);
      }
    });
    response.context.session.end = !lastListen;
    return response;
  }

  fromResponse(response: CoreResponse): OutputTemplate[] {
    return response.output;
  }
}