import template from 'lodash/template.js';
import Logger from '../Logger';

/**
 * CSRF Utility methods.
 *
 * Some methods to access the csrf-token information served by spring security.
 *
 * The methods herein assume a certain HTML structure, which is easiest achieved
 * by including a markup like the following in your base HTML file:
 *
 * <meta name="_csrf" content="${_csrf.token}" />
 * <meta name="_csrf_header" content="${_csrf.headerName}" />
 * <meta name="_csrf_parameter_name" content="${_csrf.parameterName}" />
 *
 * @class
 */
class CsrfUtil {

  /**
   * Finds the meta tag in the current document by the given name and returns
   * it's content.
   *
   * @param {type} name Description
   *
   * @return {type} Description
   */
  static getContentFromMetaTagByName(name: string) {
    const compiledSelector = template('meta[name="<%= metaTagName %>"]');
    const element: Element = document.querySelector(compiledSelector({ 'metaTagName': name }));
    let content;
    if (element) {
      content = element.getAttribute('content') || '';
    } else {
      let warnTpl = template('Failed to find tag <meta name=<%= metaTagName %> />. Is it ' +
          ' present in the page DOM?');
      Logger.warn(warnTpl({ 'metaTagName': name }));
      content = '';
    }
    return content;
  }

  /**
   * Get the CSRF token value.
   *
   * In order for this method to produce reliable output, your base HTML
   * page should contain a `<meta>`-tag in the `<head>` with name
   * `_csrf`. The `content` attribute is best filled from Spring by
   * using this variable: `${_csrf.token}`.
   *
   * @return {string} - the key value, e.g. "741a3b1-221f-4d1d-..." or the
   *     empty string if the meta tag cannot be found.
   */
  static getCsrfValue(): string {
    const metaName = '_csrf';
    return CsrfUtil.getContentFromMetaTagByName(metaName);
  }

  /**
   * Get the CSRF token value from the `XSRF-TOKEN` cookie. Alternative to
   * the `getCsrfValue` method.
   *
   * When using Spring Security, a `CookieCsrfTokenRepository` has to be
   * configured to persist the CSRF token.
   *
   * @return {string} - the key value, e.g. "741a3b1-221f-4d1d-..." or an
   *     empty string if the `XSRF_TOKEN` cookie cannot be found.
   */
  static getCsrfValueFromCookie(): string {
    const csrfCookie = document.cookie.replace(
      /(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, '$1');
    return csrfCookie || '';
  }

  /**
   * Get the CSRF token key. This can be used if you want to send CSRF
   * tokens as header. If you want to send it using a form parameter, use
   * the method #getParamName instead.
   *
   * In order for this method to produce reliable output, your base HTML
   * page should contain a `<meta>`-tag in the `<head>` with name
   * `_csrf_header`. The `content` attribute is best filled from Spring by
   * using this variable: `${_csrf.headerName}`.
   *
   * @return {string} - the key string, e.g. "X-CSRF-TOKEN" ort the empty
   *     string if the meta tag cannot be found.
   */
  static getCsrfHeaderName(): string {
    const metaName = '_csrf_header';
    return CsrfUtil.getContentFromMetaTagByName(metaName);
  }

  /**
   * Get the name of the parameter to send when you want to pass CSRF
   * tokens via a form. Alternatively you can use #getKey to get the name
   * of the header to send for CSRF-protection.
   *
   * In order for this method to produce reliable output, your base HTML
   * page should contain a `<meta>`-tag in the `<head>` with name
   * `_csrf_parameter_name`. The `content` attribute is best filled from
   * Spring by using this variable: `${_csrf.parameterName}`.
   *
   * @return {string} The name of the parameter to send when sending CSRF
   *     tokens via forms, e.g. "_csrf" or the empty string if the meta
   *     tag cannot be found.
   */
  static getCsrfParameterName(): string {
    const metaName = '_csrf_parameter_name';
    return CsrfUtil.getContentFromMetaTagByName(metaName);
  }

  /**
   * Get the full CSRF token header object. Can directly be used in fetch, e.g.
   * in the following way:
   *
   * let csrfHeader = CsrfUtil.getHeader();
   *
   * fetch(targetUrl, {
   *   method: 'POST',
   *   headers: csrfHeader
   * })
   *
   * @return {Headers} header - the header containing the CSRF key and
   *     value or an empty object if any of the required meta fields
   *     cannot be found.
   */
  static getHeader(): Headers {
    const headerObj = new Headers();
    const csrfValue = CsrfUtil.getCsrfValue();
    const csrfHeaderName = CsrfUtil.getCsrfHeaderName();
    if (csrfValue !== '' && csrfHeaderName !== '') {
      headerObj.append(csrfHeaderName, csrfValue);
    }
    return headerObj;
  }

  /**
   * Returns a simple object containing CSRF header name as key and CSRF value
   * as field value
   *
   * @return {Object} Simple object containing the CSRF key and
   *     value or an empty object if any of the required meta fields
   *     cannot be found.
   */
  static getHeaderObject(): object {
    const headerObj = {};
    const csrfValue = CsrfUtil.getCsrfValue();
    const csrfHeaderName = CsrfUtil.getCsrfHeaderName();
    if (csrfValue !== '' && csrfHeaderName !== '') {
      headerObj[csrfHeaderName] = csrfValue;
    }
    return headerObj;
  }

}

export default CsrfUtil;
