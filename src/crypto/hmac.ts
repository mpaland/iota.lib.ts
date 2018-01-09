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
// \brief Implementation of the HMAC function
//
///////////////////////////////////////////////////////////////////////////////

import { Convert } from './convert';
import { Curl } from './curl';
import { Bundle } from './bundle';


export class HMAC {
  // constants
  static ROUNDS = 27;

  key: Int8Array;

  /**
   * ctor
   * @param key {String} key Trytes encoded key
   */
  constructor(key: string) {
    this.key = Convert.trytes2trits(key);
  }


  /**
   * Add bundle
   * @param bundle Bundle
   */
  add(bundle: Bundle): void {
    let curl = new Curl(HMAC.ROUNDS);
    for (let i = 0; i < bundle.bundle.length; i++) {
      if (bundle.bundle[i].value > 0) {
        let bundleHashTrits = Convert.trytes2trits(bundle.bundle[i].bundle);
        let hmac = new Int8Array(Curl.HASH_LENGTH);
        curl.init();
        curl.absorb(this.key);
        curl.absorb(bundleHashTrits);
        curl.squeeze(hmac);
        let hmacTrytes = Convert.trits2trytes(hmac);
        bundle.bundle[i].signatureMessageFragment = hmacTrytes + bundle.bundle[i].signatureMessageFragment.substring(81, 2187);
      }
    }
  }

}