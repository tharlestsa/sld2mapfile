/*eslint-env jest*/
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import HttpUtil from './HttpUtil';

describe('HttpUtil', () => {
  beforeEach(() => {
    // @ts-expect-error
    fetch.resetMocks();
  });

  it('is defined', () => {
    expect(HttpUtil).not.toBe(undefined);
  });

  describe('post', () => {

    it('is defined', () => {
      expect(HttpUtil.post).not.toBe(undefined);
    });

    it('returns valid promise', () => {
      const params = {
        url: 'https://test/test'
      };
      const result = HttpUtil.post(params);
      expect(result).toBeInstanceOf(Promise);
    });

    it('fetches the given URL', async () => {
      const params = {
        url: 'https://test/test'
      };
      await HttpUtil.post(params);
      // @ts-expect-error
      expect(fetch.mock.calls.length).toEqual(1);
      // @ts-expect-error
      expect(fetch.mock.calls[0][0]).toEqual('https://test/test');
    });

    it('sends the given parameters', async () => {
      const params = {
        url: 'https://test/test',
        params: {
          humpty: 'dumpty'
        },
        asForm: false
      };
      await HttpUtil.post(params);
      // @ts-expect-error
      expect(fetch.mock.calls.length).toEqual(1);
      // @ts-expect-error
      const fetchOpts = fetch.mock.calls[0][1];
      expect(fetchOpts.body).toEqual(JSON.stringify(params.params));
    });

    it('sends the given additional headers', async () => {
      const params = {
        url: 'https://test/test',
        additionalHeaders: {
          'x-foo': 'bar'
        }
      };
      await HttpUtil.post(params);
      // @ts-expect-error
      expect(fetch.mock.calls.length).toEqual(1);
      // @ts-expect-error
      const headers = fetch.mock.calls[0][1].headers;
      expect(headers.get('x-foo')).toEqual('bar');
    });

    it('sends the ContentType headers if asForm = true (default)', async () => {
      const params = {
        url: 'https://test/test'
      };
      await HttpUtil.post(params);
      // @ts-expect-error
      expect(fetch.mock.calls.length).toEqual(1);
      // @ts-expect-error
      const headers = fetch.mock.calls[0][1].headers;
      expect(headers.get('Content-Type')).toEqual('application/x-www-form-urlencoded');
    });

    it('doesn\'t send the ContentType headers if asForm = false', async () => {
      const params = {
        url: 'https://test/test',
        asForm: false
      };
      await HttpUtil.post(params);
      // @ts-expect-error
      expect(fetch.mock.calls.length).toEqual(1);
      // @ts-expect-error
      const headers = fetch.mock.calls[0][1].headers;
      expect(headers.get('Content-Type')).toEqual(null);
    });

    it('fetch options can be set', async () => {
      const params = {
        url: 'https://test/test',
        additionalFetchOptions: {
          cache: 'no-cache'
        }
      };
      await HttpUtil.post(params);
      // @ts-expect-error
      expect(fetch.mock.calls.length).toEqual(1);
      // @ts-expect-error
      const gotCache = fetch.mock.calls[0][1].cache;
      expect(gotCache).toEqual('no-cache');
    });

    it('fetches with same-origin credentials (default)', async () => {
      const params = {
        url: 'https://test/test'
      };
      await HttpUtil.post(params);
      // @ts-expect-error
      expect(fetch.mock.calls.length).toEqual(1);
      // @ts-expect-error
      const gotCreds = fetch.mock.calls[0][1].credentials;
      expect(gotCreds).toEqual('same-origin');
    });

    it('fetching with same-origin credentials can be turned off', async () => {
      const params = {
        url: 'https://test/test',
        sameOriginCredentials: false
      };
      await HttpUtil.post(params);
      // @ts-expect-error
      expect(fetch.mock.calls.length).toEqual(1);
      // @ts-expect-error
      const gotCreds = fetch.mock.calls[0][1].credentials;
      expect(gotCreds).toEqual(undefined);
    });

    it('can fetch with params (json)', async () => {
      const params = {
        url: 'https://test/test',
        params: {
          humpty: 'dumpty'
        },
        asForm: false
      };
      await HttpUtil.post(params);
      // @ts-expect-error
      expect(fetch.mock.calls.length).toEqual(1);
      // @ts-expect-error
      const gotBody = fetch.mock.calls[0][1].body;
      expect(JSON.parse(gotBody)).toEqual({ humpty: 'dumpty' });
    });

  });

});
