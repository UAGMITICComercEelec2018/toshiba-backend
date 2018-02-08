'use strict';
import { success, failure, notAllowed } from './../libs/response-lib';

export async function demo(event, context, callback) {
  console.log(
    'Tocayolog:' + JSON.stringify(event),
    JSON.stringify(context),
    JSON.stringify(callback)
  );
}
