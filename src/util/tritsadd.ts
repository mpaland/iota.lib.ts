///////////////////////////////////////////////////////////////////////////////
// \author (c) Marco Paland (marco@paland.com)
//             2017, PALANDesign Hannover, Germany
//             2017, Paul Handy
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
// \brief Helper module to add two trits arrays
//
///////////////////////////////////////////////////////////////////////////////


function sum(a: number, b: number) {
  let s = a + b;
  switch (s) {
    case  2: return -1;
    case -2: return  1;
    default: return  s;
  }
}


function cons(a: number, b: number): number {
  if (a === b) {
    return a;
  }
  return 0;
}


function any(a: number, b: number): number {
  let s = a + b;
  if (s > 0) {
    return 1;
  } else if (s < 0) {
    return -1;
  }
  return 0;
}


function full_add(a: number, b: number, c: number): [number, number] {
    var s_a   = sum(a, b);
    var c_a   = cons(a, b);
    var c_b   = cons(s_a, c);
    var c_out = any(c_a, c_b);
    var s_out = sum(s_a, c);
    return [s_out, c_out];
}


/**
 * Add two trits
 * @param {Int8Array} a Frist trits array
 * @param {Int8Array} b Second trits array
 * @return {Int8Array} a + b
 */
export function tritsAdd(a: Int8Array, b: Int8Array): Int8Array {
  let out = new Int8Array(Math.max(a.length, b.length));
  let carry = 0;
  let a_i, b_i;

  for (let i = 0; i < out.length; i++) {
    a_i = i < a.length ? a[i] : 0;
    b_i = i < b.length ? b[i] : 0;
    let f_a = full_add(a_i, b_i, carry);
    out[i] = f_a[0];
    carry  = f_a[1];
  }

  return out;
}
