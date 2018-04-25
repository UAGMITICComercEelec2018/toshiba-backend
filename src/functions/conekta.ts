import { success, failure, notAllowed, redirect } from './../libs/response-lib';
import * as paypal from 'paypal-rest-sdk';
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

import * as conekta from 'conekta';
conekta.api_key = process.env.CONEKTA_API_KEY;
conekta.api_version = '2.0.0';

const items = [
    {
      id: 'item1',
      info: {
        name: 'item1',
        sku: 'item1',
        price: '15.00',
        currency: 'USD',
        quantity: 1
      },
      price: {
        currency: 'USD',
        total: '15.00'
      },
      oxxo: {
        name: 'Digestion',
        price: 290.00,
        qty: 1
      }
    },
    {
      id: 'item2',
      info: {
        name: 'item 2',
        sku: 'item2',
        price: '22.00',
        currency: 'USD',
        quantity: 1
      },
      price: {
        currency: 'USD',
        total: '22.00'
      },
      oxxo: {
        name: 'Fitoestrogenos',
        price: 447.00,
        qty: 1
      }
    },
    {
      id: 'item3',
      info: {
        name: 'item 3',
        sku: 'item3',
        price: '13.00',
        currency: 'USD',
        quantity: 1
      },
      price: {
        currency: 'USD',
        total: '13.00'
      },
      oxxo: {
	    name: 'Moringa Suiiki',
	    price: 250.00,
	    qty: 1
	  }
    },
    {
      id: 'item4',
      info: {
        name: 'item 4',
        sku: 'item4',
        price: '15.00',
        currency: 'USD',
        quantity: 1
      },
      price: {
        currency: 'USD',
        total: '15.00'
      },
      oxxo: {
  	    name: 'Quema Grasa Corporal',
  	    price: 299.9,
  	    qty: 1
  	  }      
    }
  ];

export async function createOxxoCharge(event, context, callback) {
  console.log("_EDGE_ createOxxoCharge");
  
  const { itemID } = event.pathParameters;
  const item = items.find(i => i.id == itemID);
  
  console.log("_EDGE_ oxxo-name  :"+item.oxxo.name);
  console.log("_EDGE_ oxxo-price :"+item.oxxo.price);
  console.log("_EDGE_ oxxo-qty   :"+item.oxxo.qty);
  
  var order_ID="";
  const order = conekta.Order.create(
    {
      line_items: [
        {
          name: item.oxxo.name,
          unit_price: item.oxxo.price,
          quantity: item.oxxo.qty
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
        name: 'Fulanito P',
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
//    	{ livemode: false,
//    		  amount: 1790,
//    		  currency: 'MXN',
//    		  payment_status: 'pending_payment',
//    		  amount_refunded: 0,
//    		  customer_info:
//    		   { email: 'mailto@mail.com',
//    		     phone: '+5218181818181',
//    		     name: 'Fulanito P',
//    		     object: 'customer_info' },
//    		  shipping_contact:
//    		   { address:
//    		      { street1: 'Calle 123, int 2',
//    		        country: 'mx',
//    		        residential: true,
//    		        object: 'shipping_address',
//    		        postal_code: '06100' },
//    		     id: 'ship_cont_2iTvF4i744VJfipi9',
//    		     object: 'shipping_contact',
//    		     created_at: 0 },
//    		  object: 'order',
//    		  id: 'ord_2iTvF4i744VJfipiA', // <<<<<<<<<<<========== 
//    		  metadata: {},
//    		  created_at: 1524637337,
//    		  updated_at: 1524637337,
//    		  line_items: { object: 'list', has_more: false, total: 1, data: [ [Object] ] },
//    		  shipping_lines: { object: 'list', has_more: false, total: 1, data: [ [Object] ] },
//    		  charges: { object: 'list', has_more: false, total: 1, data: [ [Object] ] } }
    	order_ID=res.toObject().id;
    	//console.log("_EDGE_ function(err, res) ++++++++++++++++++++++");
    	//console.log(res.toObject());
    	//console.log(""+order_ID);
    }
  );  
  
  setTimeout(() => {
	  console.log("_EDGE_ ID :  "+order_ID);
	  console.log("_EDGE_ URL:  "+process.env.OXXO_SUCCESS_URL+"&"+order_ID);
	  
	  console.log(order);
	  return callback(null, redirect(process.env.OXXO_SUCCESS_URL));
	  //return callback(null, redirect(process.env.OXXO_SUCCESS_URL+"&"+order_ID));
	  //return callback(null, success(order));
  }, 2000);
  
  
}

export async function conektaWebhook(event, context, callback) {
  console.log(conekta);
  return callback(null, success(console.log('The output morro!!!')));
}

export async function createPayPalCharge(event, context, callback) {
  paypal.configure({
    mode: 'sandbox', //sandbox or live
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
  });

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
    var dir = create_payment_json.redirect_urls.cancel_url;
       
    for(var i=0; i < payment.links.length;i++ ){
      if(payment.links[i].method == "REDIRECT"){
        dir=payment.links[i].href;
        break;
      }
    }   
    
    if (error) {
      return callback(null, redirect(create_payment_json.redirect_urls.cancel_url));      
    }
    else {      
      return callback(null, redirect(dir));
    }
  });
}

export async function onPayPalResult(event, context, callback) {
  //console.log(event);
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
    var sns = new AWS.SNS({ apiVersion: '2010-03-31' });
    var params = {
      Message: 'PayPal Payment ID XXX',
      Subject: 'Subject',
      TopicArn: process.env.PAYPAL_PURCHASE_SNS
    };
    await new Promise((resolve, reject) =>
      sns.publish(params, function(err, data) {
        if (err)
          reject(err); // an error occurred
        else resolve(data); // successful response
      })
    );
    return callback(null, redirect(process.env.PAYPAL_PURCHASE_SUCCESS_URL));
  } catch (error) {
    console.log(error);
    return callback(null, redirect(process.env.PAYPAL_PURCHASE_ERROR_URL));
  }
}

export async function onPayPalPurchaseSNS(event, context, callback) {
  console.log(event);
  var ses = new AWS.SES({ apiVersion: '2010-12-01' });
  try {
    var params = {
      Destination: {
        ToAddresses: ['nutricion@suiiki.com']
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data:
              'This message body contains HTML formatting. It can, for example, contain links like this one: <a class="ulink" href="http://docs.aws.amazon.com/ses/latest/DeveloperGuide" target="_blank">Amazon SES Developer Guide</a>.'
          },
          Text: {
            Charset: 'UTF-8',
            Data: 'This is the message body in text format.'
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Test email'
        }
      },
      Source: 'nutricion@suiiki.com'
    };
    await new Promise((resolve, reject) =>
      ses.sendEmail(params, function(err, data) {
        if (err) {
          console.log(err);
          reject(err); // an error occurred
        } else resolve(data); // successful response
      })
    );
    return callback(null, success({ event }));
  } catch (error) {
    return callback(null, error({ error }));
  }
}
