import isString from 'lodash/isString.js';

/**
 * Helper Class for Strings
 */
class StringUtil {

  /**
   * Replaces any occurrence of a link-like text with an `<a>`-tag.
   *
   * @param {string} text The string context to replace.
   * @return {string} The urlified string.
   */
  static urlify(text: string) {
    let urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlRegex, `<a href="$1" target="_blank">$1</a>`);
  }

  /**
   * This coerces the value of a string by casting it to the most plausible
   * datatype, guessed by the value itself.
   *
   * @param {string} str The input string to coerce.
   * @return {*} The coerced value.
   */
  static coerce(str: string): any {
    if (!isString(str)) {
      return str;
    }

    const isFloatRegex = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;

    if (str.toLowerCase() === 'true') {
      return true;
    } else if (str.toLowerCase() === 'false') {
      return false;
    } else if (isFloatRegex.test(str)) {
      return parseFloat(str);
    } else if (str.startsWith('[')) {
      return JSON.parse(str).map((a: string) => StringUtil.coerce(a));
    } else if (str.startsWith('{')) {
      const parsedObj = JSON.parse(str);
      let coercedObj = {};
      Object.keys(parsedObj).forEach(key => {
        coercedObj[key] = StringUtil.coerce(parsedObj[key]);
      });
      return coercedObj;
    } else {
      return str;
    }
  }

  /**
   * Returns a string that is wrapped: every ~`width` chars a space is
   * replaced with the passed `spaceReplacer`.
   *
   * See https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
   *
   * @param {string} str The string to wrap.
   * @param {number} width The width of a line (number of characters).
   * @param {string} spaceReplacer The string to replace spaces with.
   * @return {string} The 'wrapped' string.
   */
  static stringDivider(str: string, width: number, spaceReplacer: string): string {

    let startIndex = 0;
    let stopIndex = width;

    if (str.length > width) {
      let p = width;
      let left;
      let right;
      while (p > 0 && (str[p] !== ' ' && str[p] !== '-')) {
        p--;
      }
      if (p > 0) {
        if (str.substring(p, p + 1) === '-') {
          left = str.substring(0, p + 1);
        } else {
          left = str.substring(0, p);
        }
        right = str.substring(p + 1);
        return left + spaceReplacer + StringUtil.stringDivider(
          right, width, spaceReplacer);
      } else {
        // no whitespace or - found,
        // splitting hard on the width length
        left = str.substring(startIndex, stopIndex + 1) + '-';
        right = str.substring(stopIndex + 1);
        startIndex = stopIndex;
        stopIndex += width;
        return left + spaceReplacer + StringUtil.stringDivider(
          right, width, spaceReplacer);
      }
    }
    return str;
  }

  /**
   * Returns the displayed text of an string with html text.
   *
   * @param {string} htmlString A string containing html.
   * @return {string} The stripped Text.
   */
  static stripHTMLTags(htmlString: string): string {
    let stripped;
    if (DOMParser) {
      // Inspired by https://stackoverflow.com/a/47140708
      const doc = (new DOMParser()).parseFromString(htmlString, 'text/html');
      stripped = doc.body.textContent || '';
    }
    return stripped;
  }

  /**
   * Removes duplicated forward slashes as well as trailing slash
   * and returns normalized URL string.
   *
   * @param {string} url Original URL string.
   * @return {string} Sanitized URL string.
   */
  static sanitizeUrl(url: string): string {
    return url.replace(/([^:]\/)\/+/g, '$1').replace(/\/+$/, '');
  }
}

export default StringUtil;
