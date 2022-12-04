/*eslint-env jest*/

import template from 'lodash/template';

import CsrfUtil from './CsrfUtil';
import Logger from '../Logger';

const csrfCookieName = 'XSRF-TOKEN';
const tokenValue = 'my-csrf-token-value';
const headerName = 'my-csrf-header-name';
const paramName = 'my-csrf-param-name';
const specs = [{
  tag: 'meta',
  name: '_csrf',
  content: tokenValue
}, {
  tag: 'meta',
  name: '_csrf_header',
  content: headerName
}, {
  tag: 'meta',
  name: '_csrf_parameter_name',
  content: paramName
}, {
  tag: 'meta',
  name: 'mamba',
  content: 'jojo'
}];

describe('CsrfUtil', () => {
  it('is defined', () => {
    expect(CsrfUtil).not.toBeUndefined();
  });

  describe('Static methods', () => {
    beforeEach(() => {
      // set csrf cookie
      let expires = "";
      const date = new Date();
      date.setTime(date.getTime() + (24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
      document.cookie = csrfCookieName + "=" + (tokenValue || "")  + expires + "; path=/";

      // add custom CSRF headers
      specs.forEach((spec) => {
        let tagElement = document.createElement(spec.tag);
        tagElement.setAttribute('name', spec.name);
        tagElement.setAttribute('content', spec.content);
        document.getElementsByTagName('head')[0].appendChild(tagElement);
      });
    });

    afterEach(() => {
      // remove cookie
      document.cookie = csrfCookieName + '=; Max-Age=-99999999;';
      // remove custom CSRF headers
      specs.forEach((spec) => {
        let compiledSelector = template('meta[name="<%= metaTagName %>"]');
        let element = document.querySelector(compiledSelector({ 'metaTagName': spec.name }));
        element.parentNode.removeChild(element);
      });
    });

    it('getCsrfValue', () => {
      let result = CsrfUtil.getCsrfValue();
      expect(result).toBe(tokenValue);
    });

    it('getCsrfValueFromCookie', () => {
      let result = CsrfUtil.getCsrfValueFromCookie();
      expect(result).toBe(tokenValue);
    });

    it('getCsrfHeaderName', () => {
      let result = CsrfUtil.getCsrfHeaderName();
      expect(result).toBe(headerName);
    });

    it('getCsrfParameterName', () => {
      let result = CsrfUtil.getCsrfParameterName();
      expect(result).toBe(paramName);
    });

    describe('#getHeader', () => {
      it('works if headers present and set correctly', () => {
        let result = CsrfUtil.getHeader();
        expect(result).toBeInstanceOf(Headers);

        expect(result.has(headerName)).toBe(true);
        expect(result.get(headerName)).toBe(tokenValue);
      });

      it('returns empty headers if empty _csrf meta tag', () => {
        const elem = document.querySelector('meta[name="_csrf"]');
        const content = elem.getAttribute('content');
        elem.setAttribute('content', '');
        const result = CsrfUtil.getHeader();
        expect(result).toBeInstanceOf(Headers);
        expect(result.has(headerName)).toBe(false);
        elem.setAttribute('content', content); // reset
      });

      it('returns empty headers if empty _csrf_header meta tag', () => {
        const elem = document.querySelector('meta[name="_csrf_header"]');
        const content = elem.getAttribute('content');
        elem.setAttribute('content', '');
        const result = CsrfUtil.getHeader();
        expect(result).toBeInstanceOf(Headers);
        expect(result.has(headerName)).toBe(false);
        elem.setAttribute('content', content); // reset
      });

      it('returns empty headers if neither empty _csrf_header nor _csrf', () => {
        const elem1 = document.querySelector('meta[name="_csrf"]');
        const elem2 = document.querySelector('meta[name="_csrf_header"]');
        const content1 = elem1.getAttribute('content');
        const content2 = elem2.getAttribute('content');
        elem1.setAttribute('content', '');
        elem2.setAttribute('content', '');
        const result = CsrfUtil.getHeader();
        expect(result).toBeInstanceOf(Headers);
        expect(result.has(headerName)).toBe(false);
        elem1.setAttribute('content', content1); // reset
        elem2.setAttribute('content', content2); // reset
      });
    });

    describe('getHeaderObject', () => {
      it('works if headers present and set correctly', () => {
        const result = CsrfUtil.getHeaderObject();
        const csrfHeaderName = CsrfUtil.getCsrfHeaderName();
        const csrfValue = CsrfUtil.getCsrfValue();

        const keysInObject = Object.keys(result).length;
        expect(keysInObject).toBe(1);

        expect(result[csrfHeaderName]).toBe(csrfValue);
      });

      it('returns empty object if empty _csrf meta tag', () => {
        const elem = document.querySelector('meta[name="_csrf"]');
        const content = elem.getAttribute('content');
        elem.setAttribute('content', '');
        const result = CsrfUtil.getHeaderObject();
        const keysInObject = Object.keys(result).length;
        expect(keysInObject).toBe(0); // empty!
        elem.setAttribute('content', content); // reset
      });

      it('returns empty object if empty _csrf_header meta tag', () => {
        const elem = document.querySelector('meta[name="_csrf_header"]');
        const content = elem.getAttribute('content');
        elem.setAttribute('content', '');
        const result = CsrfUtil.getHeaderObject();
        const keysInObject = Object.keys(result).length;
        expect(keysInObject).toBe(0); // empty!
        elem.setAttribute('content', content); // reset
      });

      it('returns empty headers if neither empty _csrf_header nor _csrf', () => {
        const elem1 = document.querySelector('meta[name="_csrf"]');
        const elem2 = document.querySelector('meta[name="_csrf_header"]');
        const content1 = elem1.getAttribute('content');
        const content2 = elem2.getAttribute('content');
        elem1.setAttribute('content', '');
        elem2.setAttribute('content', '');
        const result = CsrfUtil.getHeaderObject();
        const keysInObject = Object.keys(result).length;
        expect(keysInObject).toBe(0); // empty!
        elem1.setAttribute('content', content1); // reset
        elem2.setAttribute('content', content2); // reset
      });
    });

    it('getContentFromMetaTagByName', () => {
      let result = CsrfUtil.getContentFromMetaTagByName('mamba');
      expect(result).toBe('jojo');
    });

    it('getContentFromMetaTagByName should return warning for unknown meta tag', () => {
      const logSpy = jest.spyOn(Logger, 'warn');

      let result = CsrfUtil.getContentFromMetaTagByName('balotelli');
      expect(result).toBe('');
      expect(logSpy).toHaveBeenCalled();

      logSpy.mockReset();
      logSpy.mockRestore();
    });

    it('getContentFromMetaTagByName should return empty content string if content is not present', () => {
      let tagElement = document.createElement('meta');
      const tagName = 'test';
      tagElement.setAttribute('name', tagName);
      tagElement.setAttribute('value', 'test_val');
      document.getElementsByTagName('head')[0].appendChild(tagElement);

      let result = CsrfUtil.getContentFromMetaTagByName(tagName);
      expect(result).toBe('');
    });
  });
});
