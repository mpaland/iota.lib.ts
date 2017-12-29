///////////////////////////////////////////////////////////////////////////////
// \author (c) Marco Paland (marco@paland.com)
//             2017, PALANDesign Hannover, Germany
//
// \license The MIT License (MIT)
//
// This file is part of the iota.lib.ts library.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// \brief Trytes and Trits conversion functions
//
///////////////////////////////////////////////////////////////////////////////

import { BigNumber } from 'bignumber.js';


export namespace Convert {

  // All possible tryte values
  const TRYTE_VALUES = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // map of all trits representations
  const TRYTE_TRITS = [
    [ 0,  0,  0],   // 9,   0
    [ 1,  0,  0],   // A,   1
    [-1,  1,  0],   // B,   2
    [ 0,  1,  0],   // C,   3
    [ 1,  1,  0],   // D,   4
    [-1, -1,  1],   // E,   5
    [ 0, -1,  1],   // F,   6
    [ 1, -1,  1],   // G,   7
    [-1,  0,  1],   // H,   8
    [ 0,  0,  1],   // I,   9
    [ 1,  0,  1],   // J,  10
    [-1,  1,  1],   // K,  11
    [ 0,  1,  1],   // L,  12
    [ 1,  1,  1],   // M,  13
    [-1, -1, -1],   // N, -13
    [ 0, -1, -1],   // O, -12
    [ 1, -1, -1],   // P, -11
    [-1,  0, -1],   // Q, -10
    [ 0,  0, -1],   // R,  -9
    [ 1,  0, -1],   // S,  -8
    [-1,  1, -1],   // T,  -7
    [ 0,  1, -1],   // U,  -6
    [ 1,  1, -1],   // V,  -5
    [-1, -1,  0],   // W,  -4
    [ 0, -1,  0],   // X,  -3
    [ 1, -1,  0],   // Y,  -2
    [-1,  0,  0]    // Z,  -1
  ];


  /**
   * Convert trytes into trits
   * @param {String|Number} input Tryte value to be converted. Can either be string or int
   * @return {Int8Array} trits
   */
  export function trytes2trits(trytes: string | number): Int8Array {
    if (typeof trytes === 'number') {
      // number (tryte) given
      let trits = [];
      let abs = Math.abs(trytes);
      while (abs > 0) {
        let remainder = abs % 3;
        abs = Math.floor(abs / 3);
        if (remainder > 1) {
          remainder = -1;
          abs++;
        }
        trits[trits.length] = remainder;
      }
      if (trytes < 0) {
        for (let i = 0; i < trits.length; i++) {
          trits[i] = -trits[i];
        }
      }
      return new Int8Array(trits);
    }
    else {
      // string given
      let trits = new Int8Array(trytes.length * 3);
      for (let i = 0; i < trytes.length; i++) {
        const index = TRYTE_VALUES.indexOf(trytes.charAt(i));
        trits[i * 3]     = TRYTE_TRITS[index][0];
        trits[i * 3 + 1] = TRYTE_TRITS[index][1];
        trits[i * 3 + 2] = TRYTE_TRITS[index][2];
      }
      return trits;
    }
  }


  /**
   * Converts trits into trytes (3 trits ^= 1 tryte)
   * @param {Int8Array} trits
   * @return {String} trytes
   */
  export function trits2trytes(trits: Int8Array): string {
    // check input
    if (trits.length % 3) {
      throw new Error('Convert: Trits length not multiple of 3');
    }

    let trytes = '';
    for (let i = 0; i < trits.length; i += 3) {
      // Iterate over all possible tryte values to find correct trit representation
      for (let j = 0; j < TRYTE_VALUES.length; j++) {
        if (TRYTE_TRITS[j][0] === trits[i]     &&
            TRYTE_TRITS[j][1] === trits[i + 1] &&
            TRYTE_TRITS[j][2] === trits[i + 2]) {
          trytes += TRYTE_VALUES.charAt(j);
          break;
        }
      }
    }
    return trytes;
  }


  /**
   * Convert trits into an integer value
   * @param {Int8Array} trits
   * @return {Number} value
   **/
  export function trits2number(trits: Int8Array): number {
    // check input
    if (trits.length % 3) {
      throw new Error('Convert: Trits length not multiple of 3');
    }

    let num = 0;
    for (let i = trits.length; i-- > 0;) {
      num = num * 3 + trits[i];
    }
    return num;
  }


  /**
   * Convert UTF-16 encoded string to Trytes
   *
   * 2 Trytes = 1 (UTF-16) char
   * e.g. the char "Z" is represented as "IC" in trytes
   * @param {String} str UTF-16 encoded string representation
   * @return {String} Trytes
   */
  export function str2trytes(str: string): string {
    // if input is not a string, return null
    if (typeof str !== 'string') {
      return null;
    }

    let trytes = '';
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);  // get UTF-16 code
      if (c > TRYTE_VALUES.length * TRYTE_VALUES.length) {
        return null;  // not a valid tryte
      }

      // convert
      const first  = c % 27;
      const second = (c - first) / 27;
      trytes += TRYTE_VALUES[first] + TRYTE_VALUES[second];
    }
    return trytes;
  }


  /**
   * Convert Trytes to an UTF-16 string
   * @param {String} trytes Trytes string like "TCSR9Z"
   * @returns {String} UTF-16 encoded string representation
   */
  export function trytes2str(trytes: string): string {
    // check input
    if (typeof trytes !== 'string') {
      return null;
    }
    if (trytes.length % 2) {
      return null;  // trytes length is odd, return null
    }

    let str = '';
    for (let i = 0; i < trytes.length; i += 2) {
      const first  = TRYTE_VALUES.indexOf(trytes[i]);
      const second = TRYTE_VALUES.indexOf(trytes[i + 1]);
      str += String.fromCharCode(first + second * TRYTE_VALUES.length);
    }
    return str;
  }


  /**
   * Convert Trits to a byte array
   * The byte array is returned in reverse order, most significant byte is #0, LSB is #47
   * @param {Int8Array} trits 243 trits array to convert
   * @returns {Uint8Array} 48 byte array
   */
  export function trits2bin(trits: Int8Array): Uint8Array {
    // check input
    if (trits.length !== 243) {
      return null;
    }

    // set trit #242 to zero to prevent overflow, cause this would set bit #47 in result, which is the sign bit
    trits[242] = 0;

    // trits to bignum
    let bn = new BigNumber(0);
    for (let i = trits.length; i-- > 0;) {
      // Multiply by 3 and add the respective trit value
      bn = bn.mul(new BigNumber(3)).add(new BigNumber(trits[i]));
    }

    // bignum to bytes
    let bin = new Uint8Array(48);
    let abs = bn.abs();
    for (let i = 0; i < bin.length; i++) {
      bin[i] = abs.mod(256).toNumber();
      abs = abs.divToInt(256);
    }
    // two's complement
    if (bn.isNeg()) {
      // bitwise xor
      bin = bin.map((x) => {
        return ~x;
      });
      // add one
      let carry = true;
      for (let i = 0; i < bin.length; i++) {
        let tmp = bin[i] + (carry ? 1 : 0);
        bin[i] = tmp & 0xFF;
        carry = !!(tmp & 0x100);
        if (!carry) {
          break;
        }
      }
    }
    return bin.reverse();
  }


  /**
   * Convert a byte array into Trits
   * The byte array is given in reverse order, most significant byte is #0, LSB is #47
   * @param {Uint8Array} bin 48 byte array to convert
   * @return {Int8Array} 243 trits array
   */
  export function bin2trits(bin: Uint8Array): Int8Array {
    // check input
    if (bin.length !== 48) {
      return null;
    }

    // reverse the byte array
    bin.reverse();

    // two's complement
    let sign = 1;
    if (bin[bin.length - 1] & 0x80) {
      // negative
      sign = -1;
      // bitwise xor
      bin = bin.map((x) => {
        return ~x;
      });
      // add one
      let carry = true;
      for (let i = 0; i < bin.length; i++) {
        let tmp = bin[i] + (carry ? 1 : 0);
        bin[i] = tmp & 0xFF;
        carry = !!(tmp & 0x100);
        if (!carry) {
          break;
        }
      }
    }

    // bytes to bignum
    let bn = new BigNumber(0);
    for (let i = bin.length; i-- > 0 ;) {
      bn = bn.mul(256);
      bn = bn.add(bin[i]);
    }
    bn = bn.mul(sign);

    // bignum to trits
    let trits = new Int8Array(243);
    let rem, abs = bn.abs();
    for (let i = 0; i < trits.length; i++) {
      rem = abs.mod(3);
      abs = abs.divToInt(3);
      if (rem.gt(1)) {
        rem = new BigNumber(-1);
        abs = abs.add(1);
      }
      trits[i] = rem.toNumber();
    }
    if (bn.isNeg()) {
      trits = trits.map((x) => {
        return x === 0 ? 0 : -x;
      });
    }

    return trits;
  }

} // namespace Convert
