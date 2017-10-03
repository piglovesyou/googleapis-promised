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
import * as async from 'async';
import * as nock from 'nock';
import utils from './utils';
let googleapis = require('../');

describe('Query params', () => {
  let localCompute, remoteCompute;
  let localDrive, remoteDrive;
  let localGmail, remoteGmail;

  before((done) => {
    nock.cleanAll();
    const google = new googleapis.GoogleApis();
    nock.enableNetConnect();
    async.parallel([
      (cb) => {
        utils.loadApi(google, 'compute', 'v1', {}).then((result) => cb(null, result));
      },
      (cb) => {
        utils.loadApi(google, 'drive', 'v2', {}).then((result) => cb(null, result));
      },
      (cb) => {
        utils.loadApi(google, 'gmail', 'v1', {}).then((result) => cb(null, result));
      }
    ], (err, apis) => {
      if (err) {
        return done(err);
      }
      remoteCompute = apis[0];
      remoteDrive = apis[1];
      remoteGmail = apis[2];
      nock.disableNetConnect();
      done();
    });
  });

  beforeEach(() => {
    nock.cleanAll();
    nock.disableNetConnect();
    const google = new googleapis.GoogleApis();
    localCompute = google.compute('v1');
    localDrive = google.drive('v2');
    localGmail = google.gmail('v1');
  });

  it('should not append ? with no query parameters', () => {
    let p = localDrive.files.get({ fileId: 'ID' });
    p.catch(utils.noop);
    assert.equal(-1, p.req.uri.href.indexOf('?'));
    p = remoteDrive.files.get({ fileId: 'ID' });
    p.catch(utils.noop);
    assert.equal(-1, p.req.uri.href.indexOf('?'));
  });

  it('should be null if no object passed', () => {
    let p = localDrive.files.list();
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, null);
    p = remoteDrive.files.list();
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, null);
  });

  it('should be null if params passed are in path', () => {
    let p = localDrive.files.get({ fileId: '123' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, null);
    p = remoteDrive.files.get({ fileId: '123' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, null);
  });

  it('should be set if params passed are optional query params', () => {
    let p = localDrive.files.get({ fileId: '123', updateViewedDate: true });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'updateViewedDate=true');
    p = remoteDrive.files.get({ fileId: '123', updateViewedDate: true });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'updateViewedDate=true');
  });

  it('should be set if params passed are unknown params', () => {
    let p = localDrive.files.get({ fileId: '123', madeThisUp: 'hello' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'madeThisUp=hello');
    p = remoteDrive.files.get({ fileId: '123', madeThisUp: 'hello' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'madeThisUp=hello');
  });

  it('should be set if params passed are aliased names', () => {
    let p = localDrive.files.get({ fileId: '123', resource_: 'hello' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'resource=hello');
    p = remoteDrive.files.get({ fileId: '123', resource_: 'hello' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'resource=hello');
  });

  it('should be set if params passed are falsy', () => {
    let p = localCompute.instances.setDiskAutoDelete({ project: '', zone: '', instance: '', autoDelete: false, deviceName: '' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'autoDelete=false&deviceName=');
    p = remoteCompute.instances.setDiskAutoDelete({ project: '', zone: '', instance: '', autoDelete: false, deviceName: '' });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'autoDelete=false&deviceName=');

    p = localCompute.instanceGroupManagers.resize({ project: '', zone: '', instanceGroupManager: '', size: 0 });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'size=0');
    p = remoteCompute.instanceGroupManagers.resize({ project: '', zone: '', instanceGroupManager: '', size: 0 });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'size=0');
  });

  it('should chain together with & in order', () => {
    let p = localDrive.files.get({
      fileId: '123',
      madeThisUp: 'hello',
      thisToo: 'world'
    });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'madeThisUp=hello&thisToo=world');
    p = remoteDrive.files.get({
      fileId: '123',
      madeThisUp: 'hello',
      thisToo: 'world'
    });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'madeThisUp=hello&thisToo=world');
  });

  it('should not include auth if auth is an OAuth2Client object', () => {
    const oauth2client = new googleapis.auth.OAuth2(
      'CLIENT_ID',
      'CLIENT_SECRET',
      'REDIRECT_URI'
    );
    oauth2client.setCredentials({ access_token: 'abc123' });
    let p = localDrive.files.get({
      fileId: '123',
      auth: oauth2client
    });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, null);
    p = remoteDrive.files.get({
      fileId: '123',
      auth: oauth2client
    });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, null);
  });

  it('should handle multi-value query params properly', () => {
    let p = localGmail.users.messages.get({
      userId: 'me',
      id: 'abc123',
      metadataHeaders: ['To', 'Date']
    });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'metadataHeaders=To&metadataHeaders=Date');
    p = remoteGmail.users.messages.get({
      userId: 'me',
      id: 'abc123',
      metadataHeaders: ['To', 'Date']
    });
    p.catch(utils.noop);
    assert.equal(p.req.uri.query, 'metadataHeaders=To&metadataHeaders=Date');
  });

  after(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
