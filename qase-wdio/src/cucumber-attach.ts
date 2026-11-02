import { Readable } from 'stream';
import { events } from './events';
import { AddAttachmentEventArgs } from './models';
import { withExtension } from './utils';

type AttachOptions = string | { mediaType?: string; fileName?: string } | undefined;

interface CucumberWorld {
  attach?: (data: unknown, options?: AttachOptions, ...rest: unknown[]) => unknown;
}

const emit = (args: AddAttachmentEventArgs) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process.emit(events.addAttachment as any, args as any);
};

const toArgs = (content: Buffer, mediaType: string, fileName: string | undefined): AddAttachmentEventArgs => ({
  name: withExtension(fileName ?? 'attachment', mediaType),
  type: mediaType,
  content,
});

/**
 * WebdriverIO's Cucumber formatter drops attachment messages, so `this.attach()` in a step
 * definition never reaches a reporter. Wrap the World's attach to send a copy to the Qase reporter.
 */
export const forwardCucumberAttachments = (world: unknown): void => {
  const target = world as CucumberWorld | undefined;
  if (!target || typeof target.attach !== 'function') {
    return;
  }

  const original = target.attach.bind(target);
  target.attach = (data: unknown, options?: AttachOptions, ...rest: unknown[]) => {
    const opts = typeof options === 'string' ? { mediaType: options } : options ?? {};
    const { fileName } = opts;
    let mediaType = opts.mediaType;

    if (Buffer.isBuffer(data) && mediaType) {
      emit(toArgs(data, mediaType, fileName));
    } else if (typeof data === 'string') {
      mediaType = mediaType ?? 'text/plain';
      const isBase64 = mediaType.startsWith('base64:');
      const type = isBase64 ? mediaType.slice('base64:'.length) : mediaType;
      emit(toArgs(Buffer.from(data, isBase64 ? 'base64' : 'utf8'), type, fileName));
    } else if (data instanceof Readable && mediaType) {
      const type = mediaType;
      const chunks: Buffer[] = [];
      data.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
      data.on('end', () => emit(toArgs(Buffer.concat(chunks), type, fileName)));
    }

    return original(data, options, ...rest);
  };
};
