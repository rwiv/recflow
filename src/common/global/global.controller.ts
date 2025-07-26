import { Controller, UseFilters } from '@nestjs/common';
import { HttpErrorFilter } from '../error/error.filter.js';
// import heapdump from 'heapdump';

@UseFilters(HttpErrorFilter)
@Controller('/api')
export class GlobalController {
  // @Get('/heapdump')
  // writeHeapDump() {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  //   heapdump.writeSnapshot((err, filename) => {
  //     if (err) {
  //       console.error(err);
  //     } else {
  //       console.log('dump written to', filename);
  //     }
  //   });
  //   return 'ok';
  // }
}
