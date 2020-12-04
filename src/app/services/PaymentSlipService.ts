import ValidationError from '@errors/ValidationError';
import IData from '@interfaces/data';
import ValidateModelOneService from './ValidateModelOneService';
import ValidateModelTwoService from './ValidateModelTwoService';

class PaymentSlipService {
  public execute(digitableLine: string): IData {
    const validadeModelOne = new ValidateModelOneService();
    const validateModelTwoService = new ValidateModelTwoService();
    const reg = new RegExp('^[0-9]*$');
    if (!reg.test(digitableLine)) {
      throw new ValidationError('only numbers accepted');
    }

    if (digitableLine.length === 47) {
      return validadeModelOne.execute(digitableLine);
    }
    if (digitableLine.length === 48) {
      return validateModelTwoService.execute(digitableLine);
    }
    throw new ValidationError('Digitable line length invalid');
  }
}

export default PaymentSlipService;
