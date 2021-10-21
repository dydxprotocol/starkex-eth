import axios, { AxiosRequestConfig } from 'axios';
import _ from 'lodash';

import { AxiosErrorObject, AxiosServerError, AxiosError } from './error';

export async function axiosRequest(options: AxiosRequestConfig): Promise<unknown> {
  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const Error: AxiosErrorObject = _.omit(error.toJSON(), 'config');
      if (error.response) {
        const smallerResponse: { data: {}, status: number, statusText: string } = _.pick(
          error.response,
          ['data', 'status', 'statusText'],
        );
        throw new AxiosServerError(smallerResponse, Error);
      }
      // request error or timeout error
      throw new AxiosError(`Axios: ${error.message}`, Error);
    }
    throw error;
  }
}
