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
// \brief Trits to Words conversion functions
//
///////////////////////////////////////////////////////////////////////////////


export namespace Convert {

  const INT_LENGTH = 12;
  const BYTE_LENGTH = 48;
  const RADIX = 3;

  // hex representation of (3^242) / 2
  const HALF_3 = new Uint32Array([
    0xa5ce8964,
    0x9f007669,
    0x1484504f,
    0x3ade00d9,
    0x0c24486e,
    0x50979d57,
    0x79a4c702,
    0x48bbae36,
    0xa9f6808b,
    0xaa06a805,
    0xa87fabdf,
    0x5e69ebef
  ]);

// polyfills
/*
  function clone_uint32Array(array) {
    var source = new Uint32Array(array);

    return new Uint32Array(source);
  }

  function ta_slice(array) {
    if (array.slice !== undefined) {
        return array.slice();
    }

    return clone_uint32Array(array);
  }

  function ta_reverse(array) {
    if (array.reverse !== undefined) {
      array.reverse();
      return;
    }

    var i = 0,
        n = array.length,
        middle = Math.floor(n / 2),
        temp = null;

    for (; i < middle; i += 1) {
        temp = array[i];
        array[i] = array[n - 1 - i];
        array[n - 1 - i] = temp;
    }
  }
*/

  // negates the (unsigned) input array
  function bigint_not(arr: Uint32Array): void {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (~arr[i]) >>> 0;
    }
  }


  /// rshift that works with up to 53
  /// JS's shift operators only work on 32 bit integers
  /// ours is up to 33 or 34 bits though, so
  /// we need to implement shifting manually
  function rshift(val: number, shift: number): number {
    return (val / Math.pow(2, shift)) >>> 0;
  }


  // swaps endianness
  function swap32(val: number): number {
    return ((val & 0xFF) << 24)  |
           ((val & 0xFF00) << 8) |
           ((val >> 8) & 0xFF00) |
           ((val >> 24) & 0xFF);
  }


  // add with carry
  function full_add(lh: number, rh: number, carry: boolean): [number, boolean] {
    let v = lh + rh;
    let l = (rshift(v, 32)) & 0xFFFFFFFF;
    let r = (v & 0xFFFFFFFF) >>> 0;
    let carry1 = l !== 0;

    if (carry) {
      v = r + 1;
    }
    l = (rshift(v, 32)) & 0xFFFFFFFF;
    r = (v & 0xFFFFFFFF) >>> 0;
    let carry2 = l !== 0;
    return [r, carry1 || carry2];
  }


  // subtracts rh from base
  function bigint_sub(base: Uint32Array, rh: Uint32Array) {
    let noborrow = true;
    for (let i = 0; i < base.length; i++) {
      let vc = full_add(base[i], (~rh[i] >>> 0), noborrow);
      base[i]  = vc[0];
      noborrow = vc[1];
    }
    if (!noborrow) {
      throw 'bigint_sub: noborrow';
    }
  }


  // adds rh to base in place
  function bigint_add(base: Uint32Array, rh: Uint32Array): void {
    let carry = false;
    for (let i = 0; i < base.length; i++) {
      let vc = full_add(base[i], rh[i], carry);
      base[i] = vc[0];
      carry   = vc[1];
    }
  }


  // adds a small (i.e. < 32bit) number to base
  function bigint_add_small(base: Uint32Array, other: number): number {
    let vc = full_add(base[0], other, false);
    base[0]   = vc[0];
    let carry = vc[1];

    let i = 1;
    while (carry && i < base.length) {
      vc = full_add(base[i], 0, carry);
      base[i] = vc[0];
      carry   = vc[1];
      i += 1;
    }
    return i;
  }


  // compares two (unsigned) big integers
  function bigint_cmp(lh: Uint32Array, rh: Uint32Array): number {
    for (let i = lh.length; i-- > 0;) {
      let a = lh[i] >>> 0;
      let b = rh[i] >>> 0;
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }
    }
    return 0;
  }


  function is_null(arr: Uint32Array): boolean {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== 0) {
        return false;
      }
    }
    return true;
  }


  // converts the given byte array to trits
  export function words2trits(words: Uint8Array): Int8Array {
    if (words.length !== INT_LENGTH) {
      throw 'Invalid words length';
    }

    let trits = new Int8Array(243);
    let base  = new Uint32Array(words);

    // ta_reverse(base);
    base.reverse();

    let flip_trits = false;
    if (base[INT_LENGTH - 1] >> 31 === 0) {
      // positive two's complement number
      // add HALF_3 to move it to the right place.
      bigint_add(base, HALF_3);
    } else {
      // negative number
      bigint_not(base);
      if (bigint_cmp(base, HALF_3) > 0) {
        bigint_sub(base, HALF_3);
        flip_trits = true;
      } else {
        // bigint is between (unsigned) HALF_3 and (2**384 - 3**242/2)
        bigint_add_small(base, 1);
        let tmp = new Uint32Array(HALF_3);
        bigint_sub(tmp, base);
        base = tmp;
      }
    }

    let rem = 0;
    for (let i = 0; i < 242; i++) {
      rem = 0;
      for (let j = INT_LENGTH - 1; j >= 0; j--) {
        let lhs = (rem !== 0 ? rem * 0xFFFFFFFF + rem : 0) + base[j];
        let rhs = RADIX;
        let q = (lhs / rhs) >>> 0;
        let r = (lhs % rhs) >>> 0;
        base[j] = q;
        rem = r;
      }
      trits[i] = rem - 1;
    }

    if (flip_trits) {
      for (let i = 0; i < trits.length; i++) {
        trits[i] = -trits[i];
      }
    }

    return trits;
  }


  export function trits_to_words(trits: Int8Array): Uint32Array {
    // check input
    if (trits.length !== 243) {
      throw 'Invalid trits length';
    }

    let base = new Uint32Array(INT_LENGTH);

    if (trits.slice().every((a) => {
      return a === -1;
    })) {
      base = new Uint32Array(HALF_3);
      bigint_not(base);
      bigint_add_small(base, 1);
    } else {
      let size = 1;
      for (let i = trits.length - 1; i-- > 0;) {
        let trit = trits[i] + 1;

        // multiply by radix
        let sz = size;
        let carry = 0;
        for (let j = 0; j < sz; j++) {
          let v = base[j] * RADIX + carry;
          carry = rshift(v, 32);
          base[j] = (v & 0xFFFFFFFF) >>> 0;
        }
        if (carry > 0) {
          base[sz] = carry;
          size += 1;
        }

        // addition
        sz = bigint_add_small(base, trit);
        if (sz > size) {
          size = sz;
        }
      }

      if (!is_null(base)) {
        if (bigint_cmp(HALF_3, base) <= 0) {
          // base >= HALF_3
          // just do base - HALF_3
          bigint_sub(base, HALF_3);
        } else {
          // base < HALF_3
          // so we need to transform it to a two's complement representation of (base - HALF_3)
          // as we don't have a wrapping (-), we need to use some bit magic
          let tmp = new Uint32Array(HALF_3);
          bigint_sub(tmp, base);
          bigint_not(tmp);
          bigint_add_small(tmp, 1);
          base = tmp;
        }
      }
    }

    base.reverse();

    for (let i = 0; i < base.length; i++) {
      base[i] = swap32(base[i]);
    }

    return base;
  }

} // namespace Convert