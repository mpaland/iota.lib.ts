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
// \brief Different helper utils
//
///////////////////////////////////////////////////////////////////////////////

import { TransactionType } from '../crypto/bundle';
import { Convert } from '../crypto/convert';


export namespace Util {

  /**
  * Convert a transaction object into trytes
  * @param {TransactionType} transaction Transaction to convert
  * @returns {String} Result in trytes
  */
  export function transaction2trytes(transaction: TransactionType): string {
    let valueTrits = new Int8Array(81);
    valueTrits.set(Convert.trytes2trits(transaction.value));

    let timestampTrits = new Int8Array(27);
    timestampTrits.set(Convert.trytes2trits(transaction.timestamp));

    let currentIndexTrits = new Int8Array(27);
    currentIndexTrits.set(Convert.trytes2trits(transaction.currentIndex));

    let lastIndexTrits = new Int8Array(27);
    lastIndexTrits.set(Convert.trytes2trits(transaction.lastIndex));

    let attachmentTimestampTrits = new Int8Array(27);
    attachmentTimestampTrits.set(Convert.trytes2trits(transaction.attachmentTimestamp || 0));

    let attachmentTimestampLowerBoundTrits = new Int8Array(27);
    attachmentTimestampLowerBoundTrits.set(Convert.trytes2trits(transaction.attachmentTimestampLowerBound || 0));

    let attachmentTimestampUpperBoundTrits = new Int8Array(27);
    attachmentTimestampUpperBoundTrits.set(Convert.trytes2trits(transaction.attachmentTimestampUpperBound || 0));

    transaction.tag = transaction.tag || transaction.obsoleteTag;

    return transaction.signatureMessageFragment
      + transaction.address
      + Convert.trits2trytes(valueTrits)
      + transaction.obsoleteTag
      + Convert.trits2trytes(timestampTrits)
      + Convert.trits2trytes(currentIndexTrits)
      + Convert.trits2trytes(lastIndexTrits)
      + transaction.bundle
      + transaction.trunkTransaction
      + transaction.branchTransaction
      + transaction.tag
      + Convert.trits2trytes(attachmentTimestampTrits)
      + Convert.trits2trytes(attachmentTimestampLowerBoundTrits)
      + Convert.trits2trytes(attachmentTimestampUpperBoundTrits)
      + transaction.nonce;
  }

}
