// Copyright 2014-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as assert from 'power-assert';
import * as nock from 'nock';
import utils from './utils';
let googleapis = require('../');

describe('Path params', () => {
  let localDrive, remoteDrive;

  before((done) => {
    nock.cleanAll();
    const google = new googleapis.GoogleApis();
    nock.enableNetConnect();
    utils.loadApi(google, 'drive', 'v2', {}, (err, drive) => {
      nock.disableNetConnect();
      if (err) {
        return done(err);
      }
      remoteDrive = drive;
      done();
    });
  });

  beforeEach(() => {
    nock.cleanAll();
    nock.disableNetConnect();
    const google = new googleapis.GoogleApis();
    localDrive = google.drive('v2');
  });

  it('should not throw error if not included and required', (done) => {
    assert.doesNotThrow(() => {
      localDrive.files.get({}).catch(utils.noop);
      remoteDrive.files.get({}).catch(utils.noop);
      done();
    });
  });

  it('should return an err object if not included and required', (done) => {
    localDrive.files.get({}).catch((err) => {
      assert.notEqual(err, null);
      remoteDrive.files.get({}).catch((err) => {
        assert.notEqual(err, null);
        done();
      });
    });
  });

  it('should be mentioned in err.message when missing', (done) => {
    localDrive.files.get({}).catch((err) => {
      assert.notEqual(err.message.indexOf('fileId'), -1, 'Missing param not mentioned in error');
      remoteDrive.files.get({}).catch((err) => {
        assert.notEqual(err.message.indexOf('fileId'), -1, 'Missing param not mentioned in error');
        done();
      });
    });
  });

  it('should return null response object if not included and required', (done) => {
    localDrive.files.get({}).catch((err) => {
      assert(err);
      remoteDrive.files.get({}).catch((err) => {
        assert(err);
        done();
      });
    });
  });

  it('should return null request object if not included and required', () => {
    let p = localDrive.files.get({});
    p.catch(utils.noop);
    assert.equal(p.req, null);
    p = remoteDrive.files.get({});
    p.catch(utils.noop);
    assert.equal(p.req, null);
  });

  it('should return null request object if not included and required and no callback', () => {
    let p = localDrive.files.get({});
    p.catch(utils.noop);
    assert.equal(p.req, null);
    p = remoteDrive.files.get({});
    p.catch(utils.noop);
    assert.equal(p.req, null);
  });

  it('should not be modifiable directly', () => {
    const options = { fileId: '123' };
    assert.doesNotThrow(() => {
      // should not modify options object
      localDrive.files.get(options).catch(utils.noop);
      localDrive.files.get(options).catch(utils.noop);
      remoteDrive.files.get(options).catch(utils.noop);
      remoteDrive.files.get(options).catch(utils.noop);
    });
  });

  it('should be put in URL of path', () => {
    let p = localDrive.files.get({ fileId: 'abc123' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.path, '/drive/v2/files/abc123');
    p = remoteDrive.files.get({ fileId: 'abc123' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.path, '/drive/v2/files/abc123');
  });

  it('should be put in URL of pathname', () => {
    let p = localDrive.files.get({ fileId: '123abc' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.pathname, '/drive/v2/files/123abc');
    p = remoteDrive.files.get({ fileId: '123abc' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.pathname, '/drive/v2/files/123abc');
  });

  it('should not be urlencoded', () => {
    let p = localDrive.files.get({ fileId: 'p@ram' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.path.split('/').pop(), 'p@ram');
    p = remoteDrive.files.get({ fileId: 'p@ram' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.path.split('/').pop(), 'p@ram');
  });

  it('should keep query params null if only path params', () => {
    let p = localDrive.files.get({ fileId: '123abc' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, null);
    p = remoteDrive.files.get({ fileId: '123abc' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, null);
  });

  it('should keep query params as is', () => {
    let p = localDrive.files.get({ fileId: '123abc', hello: 'world' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'hello=world');
    p = remoteDrive.files.get({ fileId: '123abc', hello: 'world' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'hello=world');
  });

  after(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
