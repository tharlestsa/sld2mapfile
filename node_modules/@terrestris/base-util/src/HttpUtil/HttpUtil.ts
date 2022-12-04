import URLSearchParams from 'url-search-params';

import CsrfUtil from '../CsrfUtil/CsrfUtil';
import Logger from '../Logger';

type PostOptions = {
  url: string,
  params?: object,
  additionalHeaders?: object,
  additionalFetchOptions?: object,
  sameOriginCredentials?: boolean,
  asForm?: boolean
};

/**
 * A Helper class which simplifies some complex request setups as like fetch
 * with POST, CSRF and Content-Type 'application/x-www-form-urlencoded'.
 *
 * @class HttpUtil
 */
class HttpUtil {

  /**
   * A method that performs a fetch POST request with some predefined configs (
   * optimized for the usage with a shogun-core backend).
   *
   * @param {Object} opts The options object to configure the post request.
   *  It can contain the following keys:
   *    {String} url The url we want to send the post to.
   *    {Object} params The post params we want to send. Default is to {}.
   *    {Object} additionalHeaders An object with additional headers as kvp.
   *      Default is to {}.
   *    {Object} additionalFetchOptions An object containing additional options
   *      for the fetch API. Compare https://mdn.io/fetch. Default is to {}.
   *    {Boolean} sameOriginCredentials A flag to whether set the credentials
   *      option to 'same-origin' or let it undefined. Default is to true.
   *    {Boolean} asForm A flag to set the Content-Type header to
   *      'application/x-www-form-urlencoded'. Default is to true.
   */
  static post({
    url,
    params = {},
    additionalHeaders = {},
    additionalFetchOptions = {},
    sameOriginCredentials = true,
    asForm = true
  }: PostOptions): Promise<any> {
    let headers = CsrfUtil.getHeader();

    if (asForm) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
    }

    Object.keys(additionalHeaders).forEach(headerKey => {
      const headerValue = additionalHeaders[headerKey];
      headers.set(headerKey, headerValue);
    });

    const reqCredentials: RequestCredentials = sameOriginCredentials ?
      'same-origin' : undefined;

    const formParams = new URLSearchParams();

    if (asForm) {
      for (const prop of Object.keys(params)) {
        formParams.append(prop, params[prop]);
      }
    }

    const options = {
      method: 'POST',
      credentials: reqCredentials,
      body: asForm ? formParams : JSON.stringify(params),
      headers,
      ...additionalFetchOptions
    };

    return fetch(url, options)
      .catch((error: Error) => Logger.debug(
        'Fetch error from `HTTPUtil.post`.', error));
  }

}

export default HttpUtil;
