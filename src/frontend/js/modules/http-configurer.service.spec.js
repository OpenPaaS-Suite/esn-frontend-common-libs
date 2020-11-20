'use strict';

/* global chai, sinon: false */

var { expect } = chai;

describe('The esn.http httpConfigurer service', function() {
  var httpConfigurer;

  beforeEach(angular.mock.module('esn.http'));

  beforeEach(angular.mock.inject(function(_$httpBackend_, _httpConfigurer_) {
    httpConfigurer = _httpConfigurer_;
  }));

  describe('manageRestangular fn', function() {
    it('should prepend the current baseUrl', function() {
      var raInstance = {
        setBaseUrl: sinon.spy()
      };

      httpConfigurer.setBaseUrl('/test1');
      httpConfigurer.manageRestangular(raInstance, '/mod1/api');

      expect(raInstance.setBaseUrl).to.have.been.calledWith('/test1/mod1/api');
    });

    it('should update the baseUrl when setBaseUrl is called', function() {
      var raInstance = {
        setBaseUrl: function() {}
      };

      httpConfigurer.setBaseUrl('/test1');
      httpConfigurer.manageRestangular(raInstance, '/mod1/api');
      raInstance.setBaseUrl = sinon.spy();
      httpConfigurer.setBaseUrl('/test2');

      expect(raInstance.setBaseUrl).to.have.been.calledWith('/test2/mod1/api');
    });
  });

  describe('getUrl()', function() {
    it('should return the baseUrl set by setBaseUrl', function() {
      var theBaseUrl = '/someUrl';

      httpConfigurer.setBaseUrl(theBaseUrl);

      expect(httpConfigurer.getUrl('')).to.equal(theBaseUrl);
    });

    it('should prepend the given URL to the baseUrl', function() {
      var theBaseUrl = '/someUrl';
      var theSpecificUrl = '/someApi';

      httpConfigurer.setBaseUrl(theBaseUrl);

      expect(httpConfigurer.getUrl(theSpecificUrl)).to.equal(theBaseUrl + theSpecificUrl);
    });

    it('should deal with undefined specific URI', function() {
      var theBaseUrl = '/someUrl';

      httpConfigurer.setBaseUrl(theBaseUrl);

      expect(httpConfigurer.getUrl()).to.equal(theBaseUrl);
    });
  });

  describe('setBaseUrl()', function() {
    it('should trim the last trailing slash', function() {
      var theBaseUrl = '/someUrl';

      httpConfigurer.setBaseUrl(theBaseUrl + '/');

      expect(httpConfigurer.getUrl()).to.equal(theBaseUrl);
    });
  });

  describe('getHeaders()', function() {
    it('should send back an empty object when no specific header is set', function() {
      expect(httpConfigurer.getHeaders()).to.deep.equal({});
    });
    it('should send back the specific headers', function() {
      const headers = { Authorization: 'Bearer 1234' };

      httpConfigurer.setHeaders(headers);
      expect(httpConfigurer.getHeaders()).to.deep.equal(headers);
    });
  });
});
