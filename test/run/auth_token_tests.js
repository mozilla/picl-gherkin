/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var crypto = require('crypto')
var log = { trace: function() {} }

var tokens = require('../../tokens')(log)
var AuthToken = tokens.AuthToken

var ACCOUNT = {
  uid: 'xxx'
}


test(
  're-creation from tokendata works',
  function (t) {
    var token = null;
    return AuthToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
        }
      )
      .then(
        function () {
          return AuthToken.fromHex(token.data, ACCOUNT)
        }
      )
      .then(
        function (token2) {
          t.deepEqual(token.data, token2.data)
          t.deepEqual(token.id, token2.id)
          t.deepEqual(token.authKey, token2.authKey)
          t.deepEqual(token.bundleKey, token2.bundleKey)
          t.deepEqual(token.uid, token2.uid)
        }
      )
  }
)


test(
  'bundle / unbundle of session data works',
  function (t) {
    var token = null;
    var keyFetchToken = crypto.randomBytes(32)
    var sessionToken = crypto.randomBytes(32)
    return AuthToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
          return x.bundleSession(keyFetchToken, sessionToken)
        }
      )
      .then(
        function (b) {
          return token.unbundleSession(b)
        }
      )
      .then(
        function (ub) {
          t.deepEqual(ub.keyFetchToken, keyFetchToken)
          t.deepEqual(ub.sessionToken, sessionToken)
        }
      )
  }
)


test(
  'bundle / unbundle of account reset data works',
  function (t) {
    var token = null;
    var keyFetchToken = crypto.randomBytes(32)
    var resetToken = crypto.randomBytes(32)
    return AuthToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
          return x.bundleAccountReset(keyFetchToken, resetToken)
        }
      )
      .then(
        function (b) {
          return token.unbundleAccountReset(b)
        }
      )
      .then(
        function (ub) {
          t.deepEqual(ub.keyFetchToken, keyFetchToken)
          t.deepEqual(ub.accountResetToken, resetToken)
        }
      )
  }
)

test(
  'authToken key derivations are test-vector compliant',
  function (t) {
    var token = null;
    var tokendata = '606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f'
    return AuthToken.fromHex(tokendata, ACCOUNT)
      .then(
        function (x) {
          token = x
          t.equal(token.data.toString('hex'), tokendata)
          t.equal(token.id.toString('hex'), '9a39818e3bbe613238c9d7ff013a18411ed2c66c3565c3c4de03feefecb7d212')
          t.equal(token.authKey.toString('hex'), '4a17cbdd54ee17db426fcd7baddff587231d7eadb408c091ce19ca915b715985')
          t.equal(token.bundleKey.toString('hex'), '9d93978e662bfc6e8cc203fa4628ef5a7bf1ddfd7ee54e97ec5c033257b4fca9')
        }
      )
      .then(
        function () {
          var keyFetchToken = Buffer('808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f', 'hex')
          var sessionToken = Buffer('a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf', 'hex')
          return token.bundleSession(keyFetchToken, sessionToken)
        }
      )
      .then(
        function (bundle) {
          t.equal(bundle,
                  '04a347b2c75b2f418cc37162dea57c1ee408f9109f820234' +
                  '7768a841cf8ad3dc324f1adf6b2f710fa4ea823f4ccb70c4' +
                  'bf46b4eb6b0a99b0017ecafbf95073eb7973ddbb184b601a' +
                  'c4df09704028ebfc754dd50e7d8eebfa52ce3fd868c69852')
        }
      )
      .then(
        function () {
          var keyFetchToken = Buffer('808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f', 'hex')
          var accountResetToken = Buffer('c0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedf', 'hex')
          return token.bundleAccountReset(keyFetchToken, accountResetToken)
        }
      )
      .then(
        function (bundle) {
          t.equal(bundle,
                  'bd643fdd047f7ecd5743d91d980cad6011155fd8559fea1d' +
                  '438f12d2c66270f820be421ad000d69800a4a03980862f7e' +
                  '3fbd4eb5c0f77a94c0c2e7f2be97d21d804fc4bc30923cc0' +
                  'd6c07ffea954848e0076b94f7deee71fa34db5c106d91980')
        }
      )
  }
)
