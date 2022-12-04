/*eslint-env jest*/
import { CsrfUtil } from '.';
import { MathUtil } from '.';
import { ObjectUtil } from '.';
import { StringUtil } from '.';
import { UndoUtil } from '.';
import { UrlUtil } from '.';
import { Logger } from '.';

describe('main exports', () => {
  it('exports CsrfUtil', () => {
    expect(CsrfUtil).toBeDefined();
  });
  it('exports MathUtil', () => {
    expect(MathUtil).toBeDefined();
  });
  it('exports ObjectUtil', () => {
    expect(ObjectUtil).toBeDefined();
  });
  it('exports StringUtil', () => {
    expect(StringUtil).toBeDefined();
  });
  it('exports UndoUtil', () => {
    expect(UndoUtil).toBeDefined();
  });
  it('exports UrlUtil', () => {
    expect(UrlUtil).toBeDefined();
  });
  it('exports Logger', () => {
    expect(Logger).toBeDefined();
  });
});
