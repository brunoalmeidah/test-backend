import ValidationError from '@errors/ValidationError';
import IData from '@interfaces/data';
import { addDays, format } from 'date-fns';

class ValidateModelOneService {
  public execute(digitableLine: string): IData {
    const fields = digitableLine.substr(0, 32);

    const barCode = `${digitableLine.substr(0, 4)}${digitableLine.substr(
      32,
      1,
    )}${digitableLine.substr(33, 14)}${digitableLine.substr(
      4,
      5,
    )}${digitableLine.substr(10, 6)}${digitableLine.substr(
      16,
      4,
    )}${digitableLine.substr(21, 8)}${digitableLine.substr(29, 2)}`;

    const amount = Number(
      `${digitableLine.substr(37, 8)}.${digitableLine.substr(45, 2)}`,
    );

    const expirationFactor = Number(digitableLine.substr(33, 4));

    const expirationDate = format(
      addDays(new Date('1997-10-07'), expirationFactor + 1),
      'yyyy-MM-dd',
    );

    this.validadeDigitModule10(fields);
    this.validadeDigitModule11(barCode);

    return {
      barCode,
      amount,
      expirationDate,
    };
  }

  private validadeDigitModule10(fields: string): boolean {
    const fieldsReversed = Array.from(fields).reverse();

    let factor = 2;
    const fieldsTransformed = fieldsReversed
      .map((item, index) => {
        if (index !== 0 && index !== 11 && index !== 22) {
          let result = Number(item) * factor;
          if (result > 9) {
            result = Number(String(result)[0]) + Number(String(result)[1]);
          }
          factor = factor === 2 ? 1 : 2;
          return result;
        }

        return Number(item);
      })
      .reverse();

    const digit1 = fieldsTransformed[9];
    const digit2 = fieldsTransformed[20];
    const digit3 = fieldsTransformed[31];

    const reducer = (accumulator: number, currentValue: number) =>
      accumulator + currentValue;

    const sumField1 = fieldsTransformed.slice(0, 9).reduce(reducer);
    const sumField2 = fieldsTransformed.slice(10, 20).reduce(reducer);
    const sumField3 = fieldsTransformed.slice(21, 31).reduce(reducer);

    const resultField1 = Math.ceil(sumField1 / 10) * 10 - sumField1;
    const resultField2 = Math.ceil(sumField2 / 10) * 10 - sumField2;
    const resultField3 = Math.ceil(sumField3 / 10) * 10 - sumField3;

    if (resultField1 !== digit1) {
      throw new ValidationError('Invalid digit at position 10');
    }
    if (resultField2 !== digit2) {
      throw new ValidationError('Invalid digit at position 21');
    }
    if (resultField3 !== digit3) {
      throw new ValidationError('Invalid digit at position 32');
    }
    return true;
  }

  private validadeDigitModule11(barCode: string): boolean {
    const barCodeArray = Array.from(barCode);
    const digit = Number(barCodeArray.splice(4, 1));

    let factor = 2;
    const barCodeTransformed = barCodeArray.reverse().map(item => {
      const result = Number(item) * factor;

      factor = factor === 9 ? 2 : factor + 1;
      return result;
    });
    const reducer = (accumulator: number, currentValue: number) =>
      accumulator + currentValue;

    const sum = barCodeTransformed.reduce(reducer);

    let result = 11 - (sum % 11);

    result = result === 0 || result === 10 || result === 11 ? 1 : result;

    if (result !== digit) {
      throw new ValidationError('Invalid bar code digit');
    }
    return true;
  }
}

export default ValidateModelOneService;
