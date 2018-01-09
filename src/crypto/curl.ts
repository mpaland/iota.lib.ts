///////////////////////////////////////////////////////////////////////////////
// \author (c) Marco Paland (marco@paland.com)
//             2017-2018, PALANDesign Hannover, Germany
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
// \brief Implementation of IOTA's Curl (sponge) function
//
///////////////////////////////////////////////////////////////////////////////

import { Convert } from './convert';


export class Curl {
  // constants
  static NUMBER_OF_ROUNDS = 81;
  static HASH_LENGTH      = 243;
  static STATE_LENGTH     = 3 * Curl.HASH_LENGTH;

  state: Int8Array;
  truthTable: Int8Array;


  /**
   * ctor
   * @param {Number} rounds Optional number of rounds, defaults to 81
   */
  constructor(private rounds: number = Curl.NUMBER_OF_ROUNDS) {
    this.truthTable = new Int8Array([1, 0, -1, 2, 1, -1, 0, 2, -1, 1, 0]);
  }


  /**
   * Initializes the state with STATE_LENGTH trits
   * @param {Int8Array} state Optional init state
   */
  init(state?: Int8Array): void {
    if (state) {
      this.state = state;
    } else {
      this.state = new Int8Array(Curl.STATE_LENGTH);
    }
  }


  /**
   * Reset function
   */
  reset(): void {
    this.init();
  }


  /**
   * Sponge absorb function
   * @param {Int8Array} trits Array of trits to be absorbed
   * @param {Number} offset Offset in array to start absorbing from
   */
  absorb(trits: Int8Array, offset: number = 0): void {
    do {
      let s = 0;
      for (let i = offset; i < trits.length && s < Curl.HASH_LENGTH; i++) {
        this.state[s++] = trits[i];
      }
      offset += s;
      this.transform();
    } while (offset < trits.length);
  }


  /**
   * Sponge squeeze function
   * @param {Int8Array} trits to squeeze
   * @param {Number} offset Optional offset, defaults to 0
   */
  squeeze(trits: Int8Array, offset: number = 0): void {
    do {
      let i = 0, length = trits.length;
      var limit = (length < Curl.HASH_LENGTH ? length : Curl.HASH_LENGTH);
      while (i < limit) {
        trits[offset++] = this.state[i++];
      }
      this.transform();
    } while ((length -= Curl.HASH_LENGTH) > 0);
  }


  /**
   * Sponge transform function
   */
  transform(): void {
    let index = 0;
    for (let round = 0; round < this.rounds; round++) {
      let stateCopy = this.state.slice();
      for (let i = 0; i < Curl.STATE_LENGTH; i++) {
        this.state[i] = this.truthTable[stateCopy[index] + (stateCopy[index += (index < 365 ? 364 : -365)] << 2) + 5];
      }
    }
  }

}
