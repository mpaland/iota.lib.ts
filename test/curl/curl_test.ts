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
// \brief Curl test
//
///////////////////////////////////////////////////////////////////////////////

import { Curl } from '../../src/crypto/curl';
import { Convert } from '../../src/crypto/convert';

import { expect, assert } from 'chai';
import 'mocha';


describe('Curl test', () => {
  let vector = [
    {
        len: 243,
        inp: 'EMIDYNHBWMBCXVDEFOFWINXTERALUKYYPPHKP9JJFGJEIUY9MUDVNFZHMMWZUYUSWAIOWEVTHNWMHANBH',
        exp: 'AQBOPUMJMGVHFOXSMUAGZNACKUTISDPBSILMRAGIGRXXS9JJTLIKZUW9BCJWKSTFBDSBLNVEEGVGAMSSM'
    },
    {
        len: 243,
        inp: 'GYOMKVTSNHVJNCNFBBAH9AAMXLPLLLROQY99QN9DLSJUHDPBLCFFAIQXZA9BKMBJCYSFHFPXAHDWZFEIZ',
        exp: 'RWRXCNNLPWIVWKVNYXLSBGYPYFNLZRJHHBHHXTZYIG9URVDHRKBIPONSHPVDFLYJRNGPRQJDFC9CGKDJT'
    },
    {
        len: 486,
        inp: '9MIDYNHBWMBCXVDEFOFWINXTERALUKYYPPHKP9JJFGJEIUY9MUDVNFZHMMWZUYUSWAIOWEVTHNWMHANBH',
        exp: 'CWBMQJMPO9UZFPCDHNELVRHSBDYDMDQZTOOMHYMMPVSQJSNELF9CNLGSGGAWLVWSP9VSEFJHHKRLSOAJYNOVXUYIJJCHCKOBSLDCIWFHBXGOSBNPTRJUFZZABJSMKNNAPC9QOCEUTKXZEYAXPWNADXU9GWEXTBBZUG'
    },
    {
        len: 486,
        inp: 'G9JYBOMPUXHYHKSNRNMMSSZCSHOFYOYNZRSZMAAYWDYEIMVVOGKPJBVBM9TDPULSFUNMTVXRKFIDOHUXXVYDLFSZYZTWQYTE9SPYYWYTXJYQ9IFGYOLZXWZBKWZN9QOOTBQMWMUBLEWUEEASRHRTNIQWJQNDWRYLCA',
        exp: 'RWCBOLRFANOAYQWXXTFQJYQFAUTEEBSZWTIRSSDREYGCNFRLHQVDZXYXSJKCQFQLJMMRHYAZKRRLQZDKRQXMTYWDGLMZKULKACNDTKENVLFKHHMCCQSHARLQISEHIJPMDKQRFDUNHQBGH9XLMHPBGYWVIONWAVTXHZ'
    }];

  vector.forEach((test) => {
    it('should produce a valid hash: ' + test.exp, () => {
      let trits = Convert.trytes2trits(test.inp);
      let curl = new Curl();
      curl.init();
      curl.absorb(trits);
      let hashTrits = new Int8Array(test.len);
      curl.squeeze(hashTrits);
      let hash = Convert.trits2trytes(hashTrits);
      assert.deepEqual(test.exp, hash);
    });
  });
});
