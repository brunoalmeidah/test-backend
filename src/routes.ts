import { Router } from 'express';
import PaymentSlipController from '@controllers/PaymentSlipController';

const routes = Router();

routes.get('/boleto/:digitableLine', PaymentSlipController.show);

export default routes;
