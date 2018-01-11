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
// \brief Validators
//
///////////////////////////////////////////////////////////////////////////////

import { Bundle, TransactionType } from '../crypto/bundle';
import { Kerl } from '../crypto/kerl';
import { Convert } from '../crypto/convert';
import { Signing } from '../crypto/signing';
import { InputType } from '../iota';
import { Util } from './util';


export namespace InputValidator {

  /**
   * Check if input is a correct address
   * @param {String} address
   * @return {boolean}
   */
  export function isAddress(address: string): boolean {
    if (!isString(address)) {
      return false;
    }

    // check if address with checksum
    if (address.length === 90) {
      if (!isTrytes(address, 90)) {
        return false;
      }
    }
    else {
      if (!isTrytes(address, 81)) {
        return false;
      }
    }
    return true;
  }


  /**
  * Check if input is correct trytes consisting of A-Z9
  * @param {String} trytes
  * @param {Number} length Optional length validation
  * @returns {Boolean}
  */
  export function isTrytes(trytes: string, length?: number): boolean {
    let regexTrytes = new RegExp('^[9A-Z]{' + (!length ? '0,' : length.toString()) + '}$');
    return isString(trytes) && regexTrytes.test(trytes);
  }


  /**
  * Check if input is correct trytes consisting of A-Z9
  * @param {string} trytes
  * @returns {boolean}
  */
  export function isNinesTrytes(trytes: string): boolean {
    return isString(trytes) && /^[9]+$/.test(trytes);
  }


  /**
  * Check if integer value
  * @param {string} value
  * @returns {boolean}
  */
  export function isValue(value: any) {
    return Number.isInteger(value);
  }


  /**
  * Checks whether input is a value or not. Can be a string, float or integer
  * @param {Any}
  * @returns {boolean}
  */
  export function isNum(input: any): boolean {
    return /^(\d+\.?\d{0,15}|\.\d{0,15})$/.test(input);
  }


  /**
   * Checks if input is a correct hash
   * @param {String} hash Hash String
   * @returns {Boolean}
   */
  export function isHash(hash: string): boolean {
    // check if valid, 81 trytes
    return isTrytes(hash, 81);
  }


  /**
   * Checks if input is a string or not
   * @param {any}
   * @return {boolean}
   */
  export function isString(str: any): boolean {
    return typeof str === 'string';
  }


  /**
   * Check if input is an array or not
   * @param {object} array Object to test
   * @return {boolean} True if object is an array
   */
  export function isArray(array: any): boolean {
    return array instanceof Array;
  }


  /**
   * Check if input is object or not
   * @param {object}
   * @return {boolean}
   */
  export function isObject(object: any): boolean {
    return typeof object === 'object';
  }


  /**
   * Check if input is a correct hash
   * @param {array} transfers Array or transactions
   * @return {boolean}
   */
  export function isTransfersArray(transfers: Array<any>): boolean {
    if (!isArray(transfers)) {
      return false;
    }

    transfers.forEach((transfer) => {
      // Check if valid address
      var address = transfer.address;
      if (!isAddress(address)) {
          return false;
      }

      // Validity check for value
      var value = transfer.value;
      if (!isValue(value)) {
          return false;
      }

      // Check if message is correct trytes of any length
      var message = transfer.message;
      if (!isTrytes(message)) {
          return false;
      }

      // Check if tag is correct trytes of {0,27} trytes
      var tag = transfer.tag || transfer.obsoleteTag;
      if (!isTrytes(tag, 27)) {
        return false;
      }
    });

    return true;
  }


  /**
   * Check if input is a list of correct trytes
   * @param {Array} hashesArray
   * @return {boolean}
   */
  export function isArrayOfHashes(hashesArray: Array<string>): boolean {
    if (!isArray(hashesArray)) {
      return false;
    }

    for (let i = 0; i < hashesArray.length; i++) {
      let hash = hashesArray[i];

      // check for address with checksum
      if (hash.length === 90) {
        if (!isTrytes(hash, 90)) {
          return false;
        }
      }
      else {
        if (!isTrytes(hash, 81)) {
          return false;
        }
      }
    }

    return true;
  }


  /**
  * Check if input is list of correct trytes
  * @param {list} trytesArray
  * @return {boolean}
  */
  export function isArrayOfTrytes(trytesArray: any): boolean {
    if (!isArray(trytesArray)) {
      return false;
    }

    for (let i = 0; i < trytesArray.length; i++) {
      // check for 2673 trytes
      if (!isTrytes(trytesArray[i], 2673)) {
        return false;
      }
    }
    return true;
  }


  /**
   * Checks if attached trytes if last 241 trytes are non-zero
   * @param {array} trytesArray
   * @returns {boolean}
   */
  export function isArrayOfAttachedTrytes(trytesArray: Array<string>): boolean {
    if (!isArray(trytesArray)) {
      return false;
    }

    for (let i = 0; i < trytesArray.length; i++) {
      let tryteValue = trytesArray[i];

      // check for correct 2673 trytes
      if (!isTrytes(tryteValue, 2673)) {
        return false;
      }

      let lastTrytes = tryteValue.slice(2673 - (3 * 81));
      if (/^[9]+$/.test(lastTrytes)) {
        return false;
      }
    }

    return true;
  }


  /**
   * Check for correct bundle with transaction object
   * @param {array} bundle
   * @return {boolean}
   */
  export function isArrayOfTxObjects(bundle) {
    if (!isArray(bundle) || bundle.length === 0) {
      return false;
    }

    let validArray = true;
    bundle.forEach((txObject) => {
      let keysToValidate: Array<{ key: string, validator: Function, args: any }> = [
        {
          key: 'hash',
          validator: isHash,
          args: null
        }, {
          key: 'signatureMessageFragment',
          validator: isTrytes,
          args: 2187
        }, {
          key: 'address',
          validator: isHash,
          args: null
        }, {
          key: 'value',
          validator: isValue,
          args: null
        }, {
          key: 'obsoleteTag',
          validator: isTrytes,
          args: 27
        }, {
          key: 'timestamp',
          validator: isValue,
          args: null
        }, {
          key: 'currentIndex',
          validator: isValue,
          args: null
        }, {
          key: 'lastIndex',
          validator: isValue,
          args: null
        }, {
          key: 'bundle',
          validator: isHash,
          args: null
        }, {
          key: 'trunkTransaction',
          validator: isHash,
          args: null
        }, {
          key: 'branchTransaction',
          validator: isHash,
          args: null
        }, {
          key: 'tag',
          validator: isTrytes,
          args: 27
        }, {
          key: 'attachmentTimestamp',
          validator: isValue,
          args: null
        }, {
          key: 'attachmentTimestampLowerBound',
          validator: isValue,
          args: null
        }, {
          key: 'attachmentTimestampUpperBound',
          validator: isValue,
          args: null
        }, {
          key: 'nonce',
          validator: isTrytes,
          args: 27
        }
      ];

      for (let i = 0; i < keysToValidate.length; i++) {
        let key = keysToValidate[i].key;

        // check that input has keyIndex and address
        if (!txObject.hasOwnProperty(key)) {
          validArray = false;
          break;
        }

        // If input validator function does not return true, exit
        let validator = keysToValidate[i].validator;
        let args = keysToValidate[i].args;
        if (!validator(txObject[key], args)) {
          validArray = false;
          break;
        }
      }
    });

    return validArray;
  }


  /**
   * Check for correct list of inputs
   * @param {array} inputs
   * @returns {boolean}
   */
  export function isInputs(inputs: Array<InputType>): boolean {
    if (!isArray(inputs)) {
      return false;
    }

    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];

      // check that input has keyIndex and address
      if (!input.hasOwnProperty('security') || !input.hasOwnProperty('keyIndex') || !input.hasOwnProperty('address')) {
        return false;
      }
      if (!isAddress(input.address)) {
        return false;
      }
      if (!isValue(input.security)) {
        return false;
      }
      if (!isValue(input.keyIndex)) {
        return false;
      }
    }

    return true;
  }


  /**
   * Check if the given uri is valid
   * TBD: IPv6
   * Valid Examples:
   * udp://[2001:db8:a0b:12f0::1]:14265
   * udp://[2001:db8:a0b:12f0::1]
   * udp://8.8.8.8:14265
   * udp://domain.com
   * udp://domain2.com:14265
   *
   * @param {String} uri The URI to check
   * @return {Boolean} valid
   */
  export function isUri(uri: string): boolean {
    let getInside = /^(udp|tcp):\/\/([\[][^\]\.]*[\]]|[^\[\]:]*)[:]{0,1}([0-9]{1,}$|$)/i;
    let stripBrackets = /[\[]{0,1}([^\[\]]*)[\]]{0,1}/;
    let uriTest = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))|(^\s*((?=.{1,255}$)(?=.*[A-Za-z].*)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*)\s*$)/;

    if (!getInside.test(uri)) {
      return false;
    }

    return uriTest.test(stripBrackets.exec(getInside.exec(uri)[1])[1]);
  }


  /**
   * Check if a bundle is valid.
   * Validates signatures and the overall structure
   * @param {Array<TransactionType>} bundle Bundle of transactions
   * @returns {Boolean} True if valid
   */
  export function isBundle(bundle: Array<TransactionType>) {

    // If not correct bundle
    if (!InputValidator.isArrayOfTxObjects(bundle)) {
      return false;
    }

    let totalSum = 0, bundleHash = bundle[0].bundle;

    let kerl = new Kerl();

    // prepare signature validation
    let signaturesToValidate = [];

    bundle.forEach((transaction, index) => {

      totalSum += transaction.value;

      // currentIndex has to be equal to the index in the array
      if (transaction.currentIndex !== index) {
        return false;
      }

      // get the transaction trytes
      let thisTxTrytes = Util.transaction2trytes(transaction);

      // absorb bundle hash + value + timestamp + lastIndex + currentIndex trytes
      kerl.absorb(Convert.trytes2trits(thisTxTrytes.slice(2187, 2187 + 162)));

      // Check if input transaction
      if (transaction.value < 0) {
        let thisAddress = transaction.address;

        let newSignatureToValidate = {
          'address':            thisAddress,
          'signatureFragments': Array(transaction.signatureMessageFragment)
        };

        // find the subsequent transactions with the remaining signature fragment
        for (var i = index; i < bundle.length - 1; i++) {
          var newBundleTx = bundle[i + 1];
          // Check if new tx is part of the signature fragment
          if (newBundleTx.address === thisAddress && newBundleTx.value === 0) {
            newSignatureToValidate.signatureFragments.push(newBundleTx.signatureMessageFragment);
          }
        }

        signaturesToValidate.push(newSignatureToValidate);
      }
    });

    // check for total sum, if not equal 0 return error
    if (totalSum !== 0) {
      return false;
    }

    // get the bundle hash from the bundle transactions
    let bundleFromTxs = new Int8Array(Kerl.HASH_LENGTH);
    kerl.squeeze(bundleFromTxs);
    let hashFromTxs = Convert.trits2trytes(bundleFromTxs);

    // Check if bundle hash is the same as returned by tx object
    if (hashFromTxs !== bundleHash) {
      // nope
      return false;
    }

    // check if last tx in the bundle has currentIndex === lastIndex
    if (bundle[bundle.length - 1].currentIndex !== bundle[bundle.length - 1].lastIndex) {
      // nope
      return false;
    }

    // validate the signatures
    for (let i = 0; i < signaturesToValidate.length; i++) {
      let isValidSignature = Signing.validateSignatures(signaturesToValidate[i].address, signaturesToValidate[i].signatureFragments, bundleHash);
      if (!isValidSignature) {
        return false;
      }
    }

    // all right
    return true;
  }

}
