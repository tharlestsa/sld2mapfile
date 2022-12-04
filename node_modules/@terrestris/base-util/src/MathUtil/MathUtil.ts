/**
 * Helper Class for various calculations.
 *
 * @class MathUtil
 */
class MathUtil {

  /**
   * Converts radians to degrees.
   *
   * @param {number} rad The radian value to convert.
   */
  static radToDeg = (rad: number) => rad * 360 / (Math.PI * 2);

  /**
   * Converts degrees to radians.
   *
   * @param {number} deg The degree value to convert.
   */
  static degToRad = (deg: number) => deg * Math.PI * 2 / 360;

  /**
   * Returns the modulo for (negative) values.
   *
   * @param {number} n The number.
   */
  static mod = (n: number) => ((n % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);

}

export default MathUtil;
