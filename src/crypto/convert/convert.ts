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


export namespace Convert {

  // All possible tryte values
  const TRYTE_VALUES = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // map of all trits representations
  const TRYTE_TRITS = [
    [ 0,  0,  0],   // 9
    [ 1,  0,  0],   // A
    [-1,  1,  0],   // B
    [ 0,  1,  0],   // C
    [ 1,  1,  0],   // D
    [-1, -1,  1],   // E
    [ 0, -1,  1],   // F
    [ 1, -1,  1],   // G
    [-1,  0,  1],   // H
    [ 0,  0,  1],   // I
    [ 1,  0,  1],   // J
    [-1,  1,  1],   // K
    [ 0,  1,  1],   // L
    [ 1,  1,  1],   // M
    [-1, -1, -1],   // N
    [ 0, -1, -1],   // O
    [ 1, -1, -1],   // P
    [-1,  0, -1],   // Q
    [ 0,  0, -1],   // R
    [ 1,  0, -1],   // S
    [-1,  1, -1],   // T
    [ 0,  1, -1],   // U
    [ 1,  1, -1],   // V
    [-1, -1,  0],   // W
    [ 0, -1,  0],   // X
    [ 1, -1,  0],   // Y
    [-1,  0,  0]    // Z
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
   * Converts trits into trytes
   * @param {Int8Array} trits
   * @return {String} trytes
   */
   export function trits2trytes(trits: Int8Array): string {
    // check input
    if (trits.length % 3) {
      return null;  // trits length not multiple of 3, return null
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
      return null;  // trits length not multiple of 3, return null
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

} // namespace Convert
