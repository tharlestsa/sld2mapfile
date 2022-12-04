/*eslint-env jest*/

import StringUtil from './StringUtil';

describe('StringUtil', () => {

  describe('Basics', () => {
    it('is defined', () => {
      expect(StringUtil).toBeDefined();
    });
  });

  describe('Static methods', () => {
    describe('#urlify', () => {
      it('wraps any occurrence of a link with an <a> tag', () => {
        let url = 'http://www.bvb.de';
        let text = `Visit ${url}`;
        let got = StringUtil.urlify(text);
        expect(got).toBe(`Visit <a href="${url}" target="_blank">${url}</a>`);

        url = 'https://www.bvb.de';
        text = `Visit ${url}`;
        got = StringUtil.urlify(text);
        expect(got).toBe(`Visit <a href="${url}" target="_blank">${url}</a>`);
      });
    });

    describe('#coerce', () => {
      it('… to boolean', () => {
        const valTrue = 'true';
        const valFalse = 'false';
        const gotTrue = StringUtil.coerce(valTrue);
        const gotFalse = StringUtil.coerce(valFalse);
        expect(gotTrue).toBe(true);
        expect(gotFalse).toBe(false);
      });
      it('… to int', () => {
        const intVal = '1337';
        const intGot = StringUtil.coerce(intVal);

        expect(intGot).toBe(1337);
      });
      it('… to float', () => {
        const floatVal = '73556.08';
        const floatGot = StringUtil.coerce(floatVal);

        expect(floatGot).toBe(73556.08);
      });
      it('… to array', () => {
        const arrayVal = '["merry", 12, "12", false, "true"]';
        const arrayGot = StringUtil.coerce(arrayVal);

        expect(arrayGot.length).toBe(5);
        expect(arrayGot[0]).toBe('merry');
        expect(arrayGot[1]).toBe(12);
        expect(arrayGot[2]).toBe(12);
        expect(arrayGot[3]).toBe(false);
        expect(arrayGot[4]).toBe(true);
      });
      it('… to object', () => {
        const objectVal = '{"a": 12, "b": "12","c": "merry","d": "false", "e": true}';
        const objectGot = StringUtil.coerce(objectVal);

        expect(Object.keys(objectGot).length).toBe(5);
        expect(objectGot.a).toBe(12);
        expect(objectGot.b).toBe(12);
        expect(objectGot.c).toBe('merry');
        expect(objectGot.d).toBe(false);
        expect(objectGot.e).toBe(true);
      });
    });

    describe('#stringDivider', () => {
      it('returns original input string if its length is smaller as provided line width', () => {
        const inputString = 'MyLengthIs12';
        const width = 13;
        const outputString = StringUtil.stringDivider(inputString, width, '-');
        expect(outputString).toEqual(inputString);
      });

      it('splits hard on the width length and wraps the string into given format if its length' +
        'is greater as provided line width', () => {
          const inputString = 'MyLengthIsGreaterAs20';
          const width = 10;
          const spaceReplacer = '\n';
          const outputString = StringUtil.stringDivider(inputString, width, spaceReplacer);
          const expectedString = 'MyLengthIsG-\nreaterAs20';
          expect(outputString).toBe(expectedString);
        });

      it('splits on whitespace and wraps the string into given format if its length is greater as' +
        'provided line width', () => {
          const inputString = 'I should be split on whitespace';
          const width = 11;
          const spaceReplacer = '\n';
          const outputString = StringUtil.stringDivider(inputString, width, spaceReplacer);
          const expectedString = 'I should be\nsplit on\nwhitespace';
          expect(outputString).toBe(expectedString);
        });

      it('also uses hyphens for splitting', () => {
        const inputString = 'abc-def-ghi-jkl-mno-pqr';
        const width = 5;
        const spaceReplacer = '\n';
        const outputString = StringUtil.stringDivider(inputString, width, spaceReplacer);
        const expectedString = 'abc-\ndef-\nghi-\njkl-\nmno-\npqr';
        expect(outputString).toBe(expectedString);
      });
    });

    describe('#stripHTMLTags', () => {
      it('returns the text content of an html string', () => {
        const htmlString = '&copy; <a href="https://www.openstreetmap.org/copyright">' +
          'OpenStreetMap contributors</a> <br>';
        const got = '© OpenStreetMap contributors ';
        const result = StringUtil.stripHTMLTags(htmlString);
        expect(result).toBe(got);
      });
      it('returns undefined if no DOMParser', () => {
        // DOMParser is very widely supported, nonetheless this is a public API,
        // see also https://caniuse.com/#feat=xml-serializer for support in
        // even ancient browsers
        let origDOMParser = DOMParser;
        DOMParser = null; // eslint-disable-line no-global-assign
        const htmlString = '&copy; <a href="https://www.openstreetmap.org/copyright">' +
          'OpenStreetMap contributors</a> <br>';
        const result = StringUtil.stripHTMLTags(htmlString);
        expect(result).toBe(undefined);
        try {
          DOMParser = origDOMParser; // eslint-disable-line no-global-assign
        } catch (e) {
          // Only relevant in Node v8
        }
      });
      it('returns the empty string if no text content', () => {
        const cases = [
          '',
          ' ',
          '\t',
          '\r',
          '\n',
          ' \t\r\n '
        ];
        cases.forEach((oneCase) => {
          let result = StringUtil.stripHTMLTags(oneCase);
          expect(result).toBe('');
        });
      });

      describe('#sanitizeUrl', () => {
        it('removes doubled forward slashes from URL string', () => {
          const wrongUrl1 = 'https://test.de/part1//part2///part3////part4';
          const wrongUrl2 = 'https:///test.de/part1/part2/part3/part4';
          const wrongUrl3 = 'https:////test.de/part1//part2///part3/part4';
          const sanitizedUrl = 'https://test.de/part1/part2/part3/part4';
          [
            wrongUrl1,
            wrongUrl2,
            wrongUrl3
          ].forEach(testUrl => expect(StringUtil.sanitizeUrl(testUrl)).toEqual(sanitizedUrl));
        });
        it('removes trailins slash(es) from URL string', () => {
          const wrongUrl1 = 'https://test.de/part1/part2/';
          const wrongUrl2 = 'https://test.de/part1/part2//';
          const wrongUrl3 = 'https:///test.de//part1/part2///';
          const sanitizedUrl = 'https://test.de/part1/part2';
          [
            wrongUrl1,
            wrongUrl2,
            wrongUrl3
          ].forEach(testUrl => expect(StringUtil.sanitizeUrl(testUrl)).toEqual(sanitizedUrl));
        });
        it('returns the original URL string if no correction is needed', () => {
          const goodUrl = 'https://test.de/i/am/a/good/one';
          expect(StringUtil.sanitizeUrl(goodUrl)).toEqual(goodUrl);
        });
      });
    });
  });

});
