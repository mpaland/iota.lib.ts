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
// \brief Bundle class
//
///////////////////////////////////////////////////////////////////////////////

import { Convert } from './convert';
import { Kerl } from './kerl';
import { tritsAdd } from '../util/tritsadd';


export interface TransactionType {
  hash: string;
  signatureMessageFragment: string;
  address: string;
  value: number;
  obsoleteTag: string;
  timestamp: number;
  currentIndex: number;
  lastIndex: number;
  bundle: string;               // TBD: better call this 'hash'
  trunkTransaction: string;
  branchTransaction: string;
  tag: string;
  attachmentTimestamp: number;
  attachmentTimestampLowerBound: number;
  attachmentTimestampUpperBound: number;
  nonce: string;
}


export class Bundle {
  // bundle of transactions
  bundle: Array<TransactionType>;


  /**
   * ctor
   */
  constructor() {
    // Declare empty bundle
    this.bundle = [];
  }


  /**
   *
   *
   */
  addEntry(signatureMessageLength: number, address: string, value: number, tag: string, timestamp: number): void {
    for (let i = 0; i < signatureMessageLength; i++) {
      let trans = <TransactionType>{};
      trans.address     = address;
      trans.value       = i === 0 ? value : 0;
      trans.obsoleteTag = tag;
      trans.tag         = tag;
      trans.timestamp   = timestamp;
      this.bundle.push(trans);
    }
  }


  /**
   *
   *
   */
  addTrytes(signatureFragments: Array<string>): void {
    const emptyHash = '9'.repeat(81);
    const emptyTag = '9'.repeat(27);
    const emptyTimestamp = 999999999;
    // const emptySignatureFragment = '9'.repeat(2187);

    let emptySignatureFragment = '';
    for (let j = 0; emptySignatureFragment.length < 2187; j++) {
      emptySignatureFragment += '9';
    }

    for (let i = 0; i < this.bundle.length; i++) {
      // fill empty signatureMessageFragment
      this.bundle[i].signatureMessageFragment = signatureFragments[i] ? signatureFragments[i] : emptySignatureFragment;

      // fill empty trunkTransaction
      this.bundle[i].trunkTransaction = emptyHash;

      // fill empty branchTransaction
      this.bundle[i].branchTransaction = emptyHash;

      // fill empty timestamps
      this.bundle[i].attachmentTimestamp           = emptyTimestamp;
      this.bundle[i].attachmentTimestampLowerBound = emptyTimestamp;
      this.bundle[i].attachmentTimestampUpperBound = emptyTimestamp;

      // fill empty nonce
      this.bundle[i].nonce = emptyTag;
    }
  }


  /**
   * Finalize bundle
   */
  finalize(): void {
    let validBundle = false;

    while (!validBundle) {
      let kerl = new Kerl();
      for (let i = 0; i < this.bundle.length; i++) {
        let valueTrits = new Int8Array(81);
        valueTrits.set(Convert.trytes2trits(this.bundle[i].value));

        let timestampTrits = new Int8Array(27);
        timestampTrits.set(Convert.trytes2trits(this.bundle[i].timestamp));

        let currentIndexTrits = new Int8Array(27);
        currentIndexTrits.set(Convert.trytes2trits(this.bundle[i].currentIndex = i));

        let lastIndexTrits = new Int8Array(27);
        lastIndexTrits.set(Convert.trytes2trits(this.bundle[i].lastIndex = this.bundle.length - 1));

        let bundleEssence = Convert.trytes2trits(this.bundle[i].address +
                                                Convert.trits2trytes(valueTrits) +
                                                this.bundle[i].obsoleteTag +
                                                Convert.trits2trytes(timestampTrits) +
                                                Convert.trits2trytes(currentIndexTrits) +
                                                Convert.trits2trytes(lastIndexTrits));
        kerl.absorb(bundleEssence);
      }

      let hash = new Int8Array(Kerl.HASH_LENGTH);
      kerl.squeeze(hash);
      let hashTrytes = Convert.trits2trytes(hash);

      for (let i = 0; i < this.bundle.length; i++) {
        this.bundle[i].bundle = hashTrytes;
      }

      let normalizedHash = this.normalize(hashTrytes);
      if (normalizedHash.indexOf(13 /* = M */) !== -1) {
        // insecure bundle. Increment Tag and recompute bundle hash
        let increasedTag = tritsAdd(Convert.trytes2trits(this.bundle[0].obsoleteTag), new Int8Array([1]));
        this.bundle[0].obsoleteTag = Convert.trits2trytes(increasedTag);
      }
      else {
        validBundle = true;
      }
    }
  }


  /**
   * Normalize the bundle hash
   * @param {String} bundleHash
   * @return {Array} Normalized bundle hash as array of numbers
   */
  normalize(bundleHash: string): Array<number> {
    let normalizedHash = [];

    for (let i = 0; i < 3; i++) {
      let sum = 0;
      for (let j = 0; j < 27; j++) {
        sum += (normalizedHash[i * 27 + j] = Convert.trits2number(Convert.trytes2trits(bundleHash.charAt(i * 27 + j))));
      }

      if (sum >= 0) {
        while (sum-- > 0) {
          for (let j = 0; j < 27; j++) {
            if (normalizedHash[i * 27 + j] > -13) {
                normalizedHash[i * 27 + j]--;
              break;
            }
          }
        }
      }
      else {
        while (sum++ < 0) {
          for (let j = 0; j < 27; j++) {
            if (normalizedHash[i * 27 + j] < 13) {
                normalizedHash[i * 27 + j]++;
              break;
            }
          }
        }
      }
    }
    return normalizedHash;
  }

}
