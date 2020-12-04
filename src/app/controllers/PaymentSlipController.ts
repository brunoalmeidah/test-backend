import { Request, Response } from 'express';
import PaymentSlipService from '@services/PaymentSlipService';

class PaymentSlipController {
  public async show(req: Request, res: Response): Promise<Response> {
    const paymentSlip = new PaymentSlipService();

    const result = paymentSlip.execute(req.params.digitableLine);
    return res.json(result);
  }
}

export default new PaymentSlipController();
