'use strict';
import { success, failure, notAllowed } from './../libs/response-lib';
import * as conekta from 'conekta';
conekta.api_key = process.env.CONEKTA_API_KEY;
conekta.api_version = '2.0.0';
import * as paypal from 'paypal-rest-sdk';

export async function createOxxoCharge(event, context, callback) {
  console.log(conekta);
  const order = conekta.Order.create(
    {
      line_items: [
        {
          name: 'Tacos',
          unit_price: 1000,
          quantity: 12
        }
      ],
      shipping_lines: [
        {
          amount: 1500,
          carrier: 'FEDEX'
        }
      ], //shipping_lines - phyiscal goods only
      currency: 'MXN',
      customer_info: {
        name: 'Fulanito Pérez',
        email: 'mailto@mail.com',
        phone: '+5218181818181'
      },
      shipping_contact: {
        address: {
          street1: 'Calle 123, int 2',
          postal_code: '06100',
          country: 'MX'
        }
      }, //shipping_contact - required only for physical goods
      charges: [
        {
          payment_method: {
            type: 'oxxo_cash'
          }
        }
      ]
    },
    function(err, res) {
      console.log(res.toObject());
    }
  );
  return callback(null, success(order));
}

export async function conektaWebhook(event, context, callback) {
  console.log(conekta);
  return callback(null, success(console.log('The output morro!!!')));
}
export async function createPayPalCharge(event, context, callback) {
  console.log(paypal);
  paypal.configure({
    mode: 'sandbox', //sandbox or live
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
  });

  const items = [
    {
      id: 'item1',
      info: {
        name: 'item',
        sku: 'item',
        price: '1.00',
        currency: 'USD',
        quantity: 1
      },
      price: {
        currency: 'USD',
        total: '1.00'
      }
    },
    {
      id: 'item2',
      info: {
        name: 'item 2',
        sku: 'item2',
        price: '4.00',
        currency: 'USD',
        quantity: 2
      },
      price: {
        currency: 'USD',
        total: '8.00'
      }
    },
    {
      id: 'item3',
      info: {
        name: 'item 3',
        sku: 'item2',
        price: '2.00',
        currency: 'USD',
        quantity: 3
      },
      price: {
        currency: 'USD',
        total: '6.00'
      }
    }
  ];

  const { itemID } = event.pathParameters;
  const item = items.find(i => i.id == itemID);
  if (!item) {
    return callback(null, failure({ error: 'Item no encontrado' }));
  }

  var create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: process.env.PAYPAL_SERVICE_RETURN_URL,
      cancel_url: process.env.PAYPAL_SERVICE_ERROR_URL
    },
    transactions: [
      {
        item_list: {
          items: [item.info]
        },
        amount: {
          ...item.price
        },
        description: 'This is the payment description.'
      }
    ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      return callback(null, success(error));
    } else {
      return callback(null, success(payment));
    }
  });
}

export async function onPaypalResult(event, context, callback) {
  console.log(event);
  const { paymentId, PayerID: payer_id } = event.queryStringParameters;
  try {
    const { successOrError } = event.pathParameters;
    if ('success' !== successOrError) {
      throw event;
    }
    const payment = await new Promise((resolve, reject) =>
      paypal.payment.execute(paymentId, { payer_id }, (error, payment) => {
        console.log();
        if (error) {
          reject(error);
        }
        resolve(payment);
      })
    );
    console.log(payment);
    return callback(null, success(payment));
  } catch (error) {
    console.log(error);
    return callback(null, success(error));
  }
}
