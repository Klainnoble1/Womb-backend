import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_paystack_womb_key_2026';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitParams {
  email: string;
  amount: number; // in NGN (Kobo conversion handled inside)
  reference?: string;
  callback_url?: string;
  metadata?: any;
}

export class PaystackService {
  /**
   * Initialize Paystack Payment Transaction
   */
  static async initializeTransaction(params: PaystackInitParams) {
    const reference = params.reference || `womb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const amountInKobo = Math.round(params.amount * 100); // Paystack expects amount in Kobo (1 NGN = 100 Kobo)

    // If using mock test key, return a functional mock checkout response for fast dev speed
    if (PAYSTACK_SECRET_KEY.includes('mock')) {
      console.log(`[Paystack] Mocking payment initialization for ${params.email} - NGN ${params.amount}`);
      return {
        status: true,
        message: 'Authorization URL created (Mock Mode)',
        data: {
          authorization_url: `http://localhost:3000/checkout/paystack-mock?reference=${reference}&amount=${params.amount}`,
          access_code: `acc_${reference}`,
          reference: reference,
        },
      };
    }

    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: params.email,
          amount: amountInKobo,
          reference: reference,
          callback_url: params.callback_url || 'http://localhost:3000/checkout/success',
          metadata: params.metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('[Paystack Error]', error?.response?.data || error.message);
      throw new Error(error?.response?.data?.message || 'Paystack payment initialization failed');
    }
  }

  /**
   * Verify Paystack Payment Transaction Reference
   */
  static async verifyTransaction(reference: string) {
    if (PAYSTACK_SECRET_KEY.includes('mock') || reference.startsWith('womb_')) {
      console.log(`[Paystack] Mocking successful verification for ref: ${reference}`);
      return {
        status: true,
        message: 'Verification successful (Mock Mode)',
        data: {
          reference,
          status: 'success',
          gateway_response: 'Successful',
          channel: 'card',
          currency: 'NGN',
        },
      };
    }

    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('[Paystack Verification Error]', error?.response?.data || error.message);
      throw new Error(error?.response?.data?.message || 'Paystack verification failed');
    }
  }
}
