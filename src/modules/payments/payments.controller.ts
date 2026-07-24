import { Request, Response } from 'express';
import { PaystackService } from '../../services/paystack.service';
import { dbCreateOrder, dbUpdateOrderStatus } from '../../database/db';

export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { email, amount, cartItems, userId } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: 'Email and amount are required' });
    }

    const paystackResponse = await PaystackService.initializeTransaction({
      email,
      amount,
      metadata: { cartItems },
    });

    await dbCreateOrder({
      user_id: userId,
      email,
      total_amount: amount,
      paystack_reference: paystackResponse.data.reference,
      status: 'pending',
      cart_items: cartItems || [],
    });

    return res.json({
      status: 'success',
      authorization_url: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Payment initialization failed' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    const verificationResult = await PaystackService.verifyTransaction(reference);

    if (verificationResult.data.status === 'success') {
      await dbUpdateOrderStatus(reference, 'paid');
      return res.json({
        status: 'success',
        message: 'Payment verified successfully',
        data: verificationResult.data,
      });
    } else {
      return res.status(400).json({ status: 'failed', message: 'Payment verification failed or pending' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Verification error' });
  }
};
