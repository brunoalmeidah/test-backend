import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import ValidationError from '@errors/ValidationError';
import routes from './routes';

const app = express();

app.use(express.json());
app.use(routes);

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof ValidationError) {
    return response.status(err.statusCode).json({
      message: err.message,
    });
  }

  console.error(err);
  return response.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});
app.listen(3333, () => {
  console.log('Server started on port 3333');
});
