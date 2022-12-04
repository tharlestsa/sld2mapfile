import URL from 'url-parse';
import QueryString from 'query-string';
import clone from 'lodash/clone.js';
import isURL from 'validator/lib/isURL';
import validator from 'validator';

export type Service = 'WMS' | 'WFS' | 'CSW' | 'WCS' | 'WPS' | 'WTS' | 'WCTS' | 'WMTS';

/**
 * Helper Class for the URL handling.
 *
 * @class
 */
export class UrlUtil {

  /**
   * Returns an object representation of an URL.
   *
   * @param {string} url The URL to read in.
   * @return {URL} The parsed URL object.
   */
  static read(url: string): URL {
    return new URL(url, null, QueryString.parse);
  }

  /**
   * Returns a string representation of an URL object.
   *
   * @param {URL} urlObj The URL object to write out.
   * @return {string} The stringified URL.
   */
  static write(urlObj: URL): string {
    return urlObj.toString();
  }

  /**
   * Returns the base path of an URL.
   *
   * @param {string} url The URL to obtain the base path from.
   * @return {string} The base path.
   */
  static getBasePath(url: string) {
    let urlObj = UrlUtil.read(url);

    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  }

  /**
   * Returns the query params of a given URL as object.
   *
   * @param {string} url The URL to get the query params from.
   * @return {Object} The query params of the given URL.
   */
  static getQueryParams(url: string) {
    let urlObj = UrlUtil.read(url);

    return urlObj.query;
  }

  /**
   * Returns the value of the given query param of the provided URL. If not
   * found, undefined will be returned.
   *
   * @param {string} url The URL to get the query params from.
   * @param {string} key The key to get the value from.
   * @return {string} The query param value.
   */
  static getQueryParam(url: string, key: string) {
    const queryParamsObj = UrlUtil.getQueryParams(url);
    const foundKey = Object.keys(queryParamsObj).filter(k => k.toLowerCase() === key.toLowerCase())[0];

    return queryParamsObj[foundKey];
  }

  /**
   * Joins some query parameters (defined by `keys`) of two query objects and
   * returns the joined query parameters.
   *
   *     var params1 = {FOO: 'foo,bar', BAZ: 'baz', HUMPTY: '1'};
   *     var params2 = {FOO: 'pupe,pape', BAZ: 'baz', DUMPTY: '42'};
   *     var keys = ['FOO'];
   *     var joined = this.joinQueryParams(params1, params2, keys);
   *     // joined is now
   *     // {FOO: 'foo,bar,pupe,pape', BAZ: 'baz', HUMPTY: '1'};
   *
   * @param {Object} params1 The first object with parameters, where certain
   *                         keys might have values that are joined with `,`.
   * @param {Object} params2 The second object with parameters, where certain
   *                         keys might have values that are joined with `,`.
   * @param {Array} keys The keys which we will consider for joining. Others
   *                     will be taken from the first object with parameters.
   * @return {Object} The joined query parameters.
   */
  static joinQueryParams(params1: any, params2: any, keys: string[]): any {
    let joined = clone(params1);
    let comma = ',';

    keys.forEach((key: string) => {
      if (joined[key]) {
        joined[key] = joined[key].split(comma).concat(params2[key].split(comma)).join(comma);
      }
    });

    return joined;
  }

  /**
   * Checks if a given URL has the provided query parameter present.
   *
   * @param {string} url The URL to check.
   * @param {string} key The query parameter to check.
   * @return {boolean} Whether the parameter is present or not.
   */
  static hasQueryParam(url: string, key: string) {
    const queryParamsObj = UrlUtil.getQueryParams(url);

    return !!Object.keys(queryParamsObj).some(k => k.toLowerCase() === key.toLowerCase());
  }

  /**
   * Creates a valid GetCapabilitiesRequest out of the given URL by checking if
   * SERVICE, REQUEST and VERSION are set.
   *
   * @param {string} url The URL to validate.
   * @param {string} service The service to set. Default is to 'WMS'.
   * @param {string} version The version to set. Default is to '1.3.0'.
   * @return {string} The validated URL.
   */
  static createValidGetCapabilitiesRequest(url: string , service: Service = 'WMS', version: string = '1.3.0') {
    const baseUrl = UrlUtil.getBasePath(url);
    const queryParamsObject = UrlUtil.getQueryParams(url);

    if (!UrlUtil.hasQueryParam(url, 'SERVICE')) {
      queryParamsObject.SERVICE = service;
    }

    if (!UrlUtil.hasQueryParam(url, 'REQUEST')) {
      queryParamsObject.REQUEST = 'GetCapabilities';
    }

    if (!UrlUtil.hasQueryParam(url, 'VERSION')) {
      queryParamsObject.VERSION = version;
    }

    return `${baseUrl}?${UrlUtil.objectToRequestString(queryParamsObject)}`;
  }

  /**
   * This joins/bundles a given set of (typically WMS GetFeatureInfo) requests
   * by the base URL. E.g. it merges the following two requests:
   *
   * https://maps.bvb.de?SERVICE=WMS&REQUEST=GetFeatureInfo&LAYERS=Shinji
   * https://maps.bvb.de?SERVICE=WMS&REQUEST=GetFeatureInfo&LAYERS=Kagawa
   *
   * to
   *
   * https://maps.bvb.de?SERVICE=WMS&REQUEST=GetFeatureInfo&LAYERS=Shinji,Kagawa
   *
   * @param {Array} featureInfoUrls An array of requests to bundle.
   * @param {boolean} stringify Whether to stringify the output or not. If set
   *                            to false an object keyed by the base URL and
   *                            valued by the combined requests params will be
   *                            returned.
   * @param {Array} bundleParams An array of query params to bundle, default is
   *                             to ['LAYERS', 'QUERY_LAYERS', 'STYLES'].
   */
  static bundleOgcRequests(featureInfoUrls: string[], stringify: boolean = false,
      bundleParams: string[] = ['LAYERS', 'QUERY_LAYERS', 'STYLES']) {
    let featureInfoUrlColl = {};

    featureInfoUrls.forEach((featureInfoUrl) => {
      let featureInfoQueryParams = UrlUtil.getQueryParams(featureInfoUrl);
      let featureInfoBaseUrl = UrlUtil.getBasePath(featureInfoUrl);

      if (!featureInfoUrlColl[featureInfoBaseUrl]) {
        featureInfoUrlColl[featureInfoBaseUrl] = featureInfoQueryParams;
      } else {
        var existingQueryParams = featureInfoUrlColl[featureInfoBaseUrl];
        var newQueryParams = featureInfoQueryParams;

        featureInfoUrlColl[featureInfoBaseUrl] = UrlUtil.joinQueryParams(
          existingQueryParams, newQueryParams, bundleParams
        );
      }
    });

    let urls = [];
    if (stringify) {
      for (let [baseUrl, queryParams] of Object.entries(featureInfoUrlColl)) {
        let urlObj = UrlUtil.read(baseUrl);
        urlObj.set('query', queryParams as string);
        urls.push(UrlUtil.write(urlObj));
      }
      return urls;
    }

    return featureInfoUrlColl;
  }

  /**
   * Transforms an object into a string containing requestParams (without
   * leading questionmark).
   *
   * @param {Object} object An object containing kvp for the request.
   *                        e.g. {height:400, width:200}
   * @return {string} The kvps as a requestString. e.g. 'height=400&width=200'
   */
  static objectToRequestString(object: any) {
    const requestString = Object.keys(object).map((key: string) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(object[key]);
    }).join('&');

    return requestString;
  }

  /**
   * Checks if a given URL is valid. Implementation based on
   * https://www.npmjs.com/package/validator.
   *
   * @param {string} url The URL to validate.
   * @param {Object} opts The validation `validator` options.
   * @return {boolean} Whether the URL is valid or not.
   */
  static isValid(url: string, opts: validator.IsURLOptions = {
    require_tld: false,
    require_protocol: true,
    protocols: ['http', 'https', 'ftp'],
    require_host: true,
    require_valid_protocol: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
    disallow_auth: false
  }) {
    return isURL(url, opts);
  }

}

export default UrlUtil;
