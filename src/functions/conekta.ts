'use strict';
import { success, failure, notAllowed } from './../libs/response-lib';
import * as conekta from 'conekta';
conekta.api_key = process.env.CONEKTA_API_KEY;
conekta.api_version = '2.0.0';

export async function createOxxoCharge(event, context, callback) {
  console.log(conekta);
  order = conekta.Order.create({
    "line_items": [{
        "name": "Tacos",
        "unit_price": 1000,
        "quantity": 12
    }],
    "shipping_lines": [{
        "amount": 1500,
        "carrier": "FEDEX"
    }], //shipping_lines - phyiscal goods only
    "currency": "MXN",
    "customer_info": {
      "name": "Fulanito Pérez",
      "email": "<a href="mailto:fulanito@conekta.com">fulanito@conekta.com</a>",
      "phone": "+5218181818181"
    },
    "shipping_contact":{
       "address": {
         "street1": "Calle 123, int 2",
         "postal_code": "06100",
         "country": "MX"
       }
    }, //shipping_contact - required only for physical goods
    "charges":[{
      "payment_method": {
        "type": "oxxo_cash"
      }
    }]
  }, function(err, res) {
      console.log(res.toObject());
  });
  return order; //callback{null,success{}};
}

export async function conektaWebhook(event, context, callback) {
  console.log(conekta);
  return callback{null,success{}};
}
