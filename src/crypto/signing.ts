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
// \brief Signing functions
//
///////////////////////////////////////////////////////////////////////////////

import { Kerl } from './kerl';
import { Curl } from './curl';
import { Bundle } from './bundle';
import { Convert } from './convert';
import { tritsAdd } from '../util/tritsadd';


export namespace Signing {

  export function key(seed, index: number, length) {
    // pad seed
    while ((seed.length % 243) !== 0) {
      seed.push(0);
    }

    let indexTrits = Convert.number2trits(index);
    let subseed = tritsAdd(seed.slice(), indexTrits);

    let kerl = new Kerl();
    kerl.absorb(subseed);
    kerl.squeeze(subseed);
    kerl.reset();
    kerl.absorb(subseed);

    let key = [], offset = 0;
    let buffer = new Int8Array(subseed.length);
    while (length-- > 0) {
      for (var i = 0; i < 27; i++) {
        kerl.squeeze(buffer);
        for (var j = 0; j < 243; j++) {
          key[offset++] = buffer[j];
        }
      }
    }
    return key;
  }


  /**
   *
   *
   */
  export function digests(key) {
    let digests = [], buffer = [];

    for (let i = 0; i < Math.floor(key.length / 6561); i++) {
      let keyFragment = key.slice(i * 6561, (i + 1) * 6561);

      for (let j = 0; j < 27; j++) {
        buffer = keyFragment.slice(j * 243, (j + 1) * 243);

        for (let k = 0; k < 26; k++) {
          let kKerl = new Kerl();
          kKerl.absorb(buffer);
          kKerl.squeeze(buffer);
        }

        for (let k = 0; k < 243; k++) {
          keyFragment[j * 243 + k] = buffer[k];
        }
      }

      let kerl = new Kerl();
      kerl.absorb(keyFragment);
      kerl.squeeze(buffer, 0, Curl.HASH_LENGTH);

      for (let j = 0; j < 243; j++) {
        digests[i * 243 + j] = buffer[j];
      }
    }
    return digests;
  }


  /**
   *
   *
   */
  export function address(digests: Int8Array): Int8Array {
    let kerl = new Kerl();
    let addressTrits = new Int8Array(Curl.HASH_LENGTH);
    kerl.absorb(digests);
    kerl.squeeze(addressTrits);

    return addressTrits;
  }


  /**
  *
  *
  **/
  export function digest(normalizedBundleFragment, signatureFragment: Int8Array): Int8Array {
    let kerl = new Kerl();
    let buffer = new Int8Array(Curl.HASH_LENGTH);

    for (let i = 0; i < 27; i++) {
      buffer = signatureFragment.slice(i * 243, (i + 1) * 243);
      for (let j = normalizedBundleFragment[i] + 13; j-- > 0;) {
        let jKerl = new Kerl();
        jKerl.absorb(buffer);
        jKerl.squeeze(buffer);
      }
      kerl.absorb(buffer);
    }

    // final squeeze
    kerl.squeeze(buffer);

    return buffer;
  }


  /**
   *
   * @param {String} normalizedBundleFragment Trytes
   * @param {Int8Array} keyFragment Trits
   * @return {Int8Array} Trits
   */
  export function signatureFragment(normalizedBundleFragment: string, keyFragment: Int8Array): Int8Array {
    let kerl = new Kerl();
    let fragment = keyFragment.slice();

    for (var i = 0; i < 27; i++) {
      let hash = fragment.slice(i * 243, (i + 1) * 243);

      for (var j = 0; j < 13 - normalizedBundleFragment[i]; j++) {
        kerl.reset();
        kerl.absorb(hash);
        kerl.squeeze(hash);
      }

      for (let j = 0; j < 243; j++) {
        fragment[i * 243 + j] = hash[j];
      }
    }

    return fragment;
  }


  /**
   *
   *
   */
  export function validateSignatures(expectedAddress, signatureFragments, bundleHash: string) {
    if (!bundleHash) {
      throw new Error('invalid bundle hash');
    }

    var bundle = new Bundle();

    var normalizedBundleFragments = [];
    var normalizedBundleHash = bundle.normalize(bundleHash);

    // Split hash into 3 fragments
    for (let i = 0; i < 3; i++) {
      normalizedBundleFragments[i] = normalizedBundleHash.slice(i * 27, (i + 1) * 27);
    }

    // Get digests
    var digests = [];

    for (let i = 0; i < signatureFragments.length; i++) {

        var digestBuffer = digest(normalizedBundleFragments[i % 3], Convert.trytes2trits(signatureFragments[i]));

        for (var j = 0; j < 243; j++) {

            digests[i * 243 + j] = digestBuffer[j]
        }
    }

    let address = Convert.trits2trytes(Signing.address(digests));

    return (expectedAddress === address);
  }

}
