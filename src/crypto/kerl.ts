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
// \brief Implementation of the Kerl algorithm
//        Specification: https://github.com/iotaledger/kerl/blob/master/IOTA-Kerl-spec.md
//
///////////////////////////////////////////////////////////////////////////////

import { Convert } from './convert/convert';
import { Keccak_384 } from 'mipher';


export class Kerl {
  // hash length
  // static BIT_HASH_LENGTH: number = 384;
  static HASH_LENGTH: number = 243;

  sha3: Keccak_384;


  constructor() {
    // create new hasher
    this.sha3 = new Keccak_384();
  }


  reset(): void {
    this.sha3.init();
  }


  /**
   * The trits will be absorbed trits[offset:offset+length], in chunks of 243.
   * Each 243-trit chunk’s last trit zeroed-out, then converted to 384-bits and absorbed by keccak.
   * @param {Int8Array} trits Array of trits to be absorbed
   * @param {Number} offset Offset in array to start absorbing from
   */
  absorb(trits: Int8Array, offset: number = 0): void {
    // check input
    if ((trits.length % Kerl.HASH_LENGTH) !== 0) {
      throw new Error('Kerl: illegal absorb length');
    }
    if (offset >= trits.length) {
      throw new Error('Kerl: absorb offset out of range');
    }

    do {
      const chunk = trits.slice(offset, offset + Kerl.HASH_LENGTH);
      chunk[242] = 0;
      offset += Kerl.HASH_LENGTH;

      // convert chunk to bytes
      let bytes = Convert.trits2bin(chunk);

      // absorb the chunk
      this.sha3.update(bytes);
    } while (offset < trits.length);
  }


  squeeze(trits: Int8Array, offset: number): void {
    // check input
    if ((trits.length % Kerl.HASH_LENGTH) !== 0) {
      throw new Error('Kerl: illegal squeeze length');
    }
    if (offset >= trits.length) {
      throw new Error('Kerl: squeeze offset out of range');
    }

    do {
      // get the hash digest
      let bytes = this.sha3.digest();

      // convert words to trits and then map it into the internal state
      trits.set(Convert.bin2trits(bytes), offset);
      trits[Kerl.HASH_LENGTH + offset - 1] = 0;
      offset += Kerl.HASH_LENGTH;

      this.sha3.init();

      bytes = bytes.map((x) => {
        return ~x;
      });

      // bytes must be in reverse order
      bytes.reverse();

      this.sha3.update(bytes);
    } while (offset < trits.length);
  }

}
