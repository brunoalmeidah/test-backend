import ValidationError from '@errors/ValidationError';
import IData from '@interfaces/data';
import { isExists } from 'date-fns';

class ValidateModelTwoService {
  public execute(digitableLine: string): IData {
    const identifier = Number(digitableLine[2]);
    const barCodeArray = Array.from(digitableLine);
    barCodeArray.splice(11, 1);
    barCodeArray.splice(22, 1);
    barCodeArray.splice(33, 1);
    barCodeArray.splice(44, 1);
    const barCode = barCodeArray.reduce(
      (accumulator: string, currentValue: string) =>
        `${accumulator}${currentValue}`,
    );
    let amount = 0;
    if (identifier === 6 || identifier === 8) {
      amount = Number(
        `${barCode.substring(4, 13)}.${barCode.substring(13, 15)}`,
      );
    } else if (identifier === 7 || identifier === 9) {
      amount = Number(barCode.substr(4, 11));
    }

    const year = barCode.substr(19, 4);
    const month = barCode.substr(23, 2);
    const day = barCode.substr(25, 2);

    let expirationDate = '';
    if (isExists(Number(year), Number(month), Number(day))) {
      expirationDate = `${year}-${month}-${day}`;
    }

    if (identifier === 6 || identifier === 7) {
      this.validadeDigit(digitableLine, 10);
      this.validadeDigitGeneral(barCodeArray, 10);
    } else if (identifier === 8 || identifier === 9) {
      this.validadeDigit(digitableLine, 11);
      this.validadeDigitGeneral(barCodeArray, 11);
    } else {
      throw new ValidationError('Invalid Identifier');
    }

    return {
      barCode,
      amount,
      expirationDate,
    };
  }

  private validadeDigit(digitableLine: string, module: number): boolean {
    const fieldsReversed = Array.from(digitableLine).reverse();

    let factor = 2;
    const fieldsTransformed = fieldsReversed
      .map((item, index) => {
        if (index !== 0 && index !== 12 && index !== 24 && index !== 36) {
          let result = Number(item) * factor;

          if (module === 10) {
            if (result > 9) {
              result = Number(String(result)[0]) + Number(String(result)[1]);
            }
            factor = factor === 2 ? 1 : 2;
          } else {
            factor = factor === 9 ? 2 : factor + 1;
          }

          return result;
        }
        factor = 2;
        return Number(item);
      })
      .reverse();

    const digit = [
      fieldsTransformed[11],
      fieldsTransformed[23],
      fieldsTransformed[35],
      fieldsTransformed[47],
    ];

    const reducer = (accumulator: number, currentValue: number) =>
      accumulator + currentValue;

    const sumField = [
      fieldsTransformed.slice(0, 11).reduce(reducer),
      fieldsTransformed.slice(12, 23).reduce(reducer),
      fieldsTransformed.slice(24, 35).reduce(reducer),
      fieldsTransformed.slice(36, 47).reduce(reducer),
    ];

    const restField = sumField.map(item => {
      return item % module;
    });
    let resultField: number[] = [];
    if (module === 10) {
      resultField = restField.map(item => {
        return item !== 0 ? module - item : 0;
      });
    } else {
      resultField = restField.map(item => {
        if (item === 0 || item === 1) {
          return 0;
        }
        if (item === 10) {
          return 1;
        }
        return module - item;
      });
    }

    const position = ['12', '24', '36', '47'];

    resultField.forEach((item, index) => {
      if (item !== digit[index]) {
        throw new ValidationError(
          `Invalid digit at position ${position[index]}`,
        );
      }
    });

    return true;
  }

  private validadeDigitGeneral(barCode: string[], module: number): boolean {
    const digit = Number(barCode.splice(3, 1));

    let factor = 2;
    const barCodeTransformed = barCode.reverse().map(item => {
      let result = Number(item) * factor;
      if (module === 10) {
        if (result > 9) {
          result = Number(String(result)[0]) + Number(String(result)[1]);
        }
        factor = factor === 2 ? 1 : 2;
      } else {
        factor = factor === 9 ? 2 : factor + 1;
      }
      return result;
    });
    const reducer = (accumulator: number, currentValue: number) =>
      accumulator + currentValue;

    const sum = barCodeTransformed.reduce(reducer);
    const rest = sum % module;
    let result = 0;

    if (module === 10) {
      result = rest !== 0 ? module - rest : 0;
    } else {
      if (rest === 0 || rest === 1) {
        result = 0;
      } else if (rest === 10) {
        result = 1;
      }
      result = module - rest;
    }

    if (result !== digit) {
      throw new ValidationError('Invalid bar code digit');
    }
    return true;
  }
}

export default ValidateModelTwoService;
