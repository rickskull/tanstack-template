import axios from 'axios';

import { env } from '../../../config/env';

const MP_BASE_URL = 'https://api.mercadopago.com';

export const mercadoPagoService = {
  async createPreference({ amount, referenceId, description }: { amount: number; referenceId: string; description: string }) {
    const response = await axios.post(
      `${MP_BASE_URL}/checkout/preferences`,
      {
        items: [
          {
            title: description,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: amount
          }
        ],
        external_reference: referenceId,
        back_urls: {
          success: env.FRONT_SUCCESS_URL,
          failure: env.FRONT_FAILURE_URL,
          pending: env.FRONT_PENDING_URL
        },
        notification_url: env.MP_WEBHOOK_URL
      },
      {
        headers: {
          Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`
        }
      }
    );

    return response.data;
  },

  async refundPayment(paymentId: string, amount: number) {
    const response = await axios.post(
      `${MP_BASE_URL}/payments/${paymentId}/refunds`,
      { amount },
      { headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } }
    );
    return response.data;
  }
};
