'use strict';

/* global chai: false */
/* global sinon: false */

var { expect } = chai;

describe('The multi-input Angular module', function() {

  beforeEach(function() {
    angular.mock.module('esn.multi-input');
  });

  describe('The MultiInputGroupController controller', function() {

    var $scope, $rootScope, $controller, ctrl;
    var multiInputService, timeout;

    beforeEach(angular.mock.inject(function(_$rootScope_, _$controller_, _multiInputService_, _$timeout_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      multiInputService = _multiInputService_;
      timeout = _$timeout_;
      $scope = $rootScope.$new();
      ctrl = $controller('MultiInputGroupController', {
        $scope: $scope,
        $timeout: timeout,
        multiInputService: multiInputService
      });
      $scope.$digest();
      $scope.types = [''];
    }));

    it('should init content value if inputValue is undefined', function() {
      expect($scope.content).to.deep.equal([{}]);
    });

    it('should init inputValue value if inputValue is undefined', function() {
      expect($scope.inputValue).to.deep.equal([]);
    });

    it('should affect content value if inputValue is defined', function() {
      $scope.inputValue = [{ value: 'current Value' }];
      $controller('MultiInputGroupController', {
        $scope: $scope
      });
      $scope.$digest();
      expect($scope.content).to.deep.equal([{ value: 'current Value' }]);
    });

    it('should init showDeleteButton array', function() {
      expect($scope.showDeleteButtonArray).to.deep.equal([false]);
    });

    describe('The onFocusFn fn', function() {

      it('should insert true value in showAddButton and false in showDeleteButtonArray if it is the first element', function() {
        $scope.onFocusFn(1);

        expect($scope.showDeleteButtonArray[1]).is.false;
        expect($scope.showAddButton[1]).is.true;
      });

      it('should insertnpm true value in showDeleteButton', function() {
        $scope.inputValue = [{ value: 'value 1' }, { value: 'value2' }, { value: 'value3' }];
        $controller('MultiInputGroupController', {
          $scope: $scope
        });
        $scope.$digest();
        $scope.onFocusFn(3);
        expect($scope.showDeleteButtonArray[2]).is.true;
        expect($scope.showAddButton[1]).is.true;
      });

    });

    describe('The verifyNew fn', function() {
      beforeEach(function() {
        $scope.content = [{ value: '' }];
        $scope.inputValue = [{ value: '' }];
      });

      it('should call onFocusFn fn with correct params', function() {
        $scope.onFocusFn = sinon.spy();
        $scope.verifyNew(0);
        expect($scope.onFocusFn).have.been.calledWith(0);
      });

      it('should splice inputValue array if content is empty', function() {
        $scope.verifyNew(0);
        expect($scope.inputValue).to.deep.equal([]);
      });

      it('should update inputValue if content is not empty', function() {
        $scope.content = [{ street: 'my street' }];
        $scope.verifyNew(0);
        expect($scope.inputValue).to.deep.equal($scope.content);
      });
    });

    describe('The addField fn', function() {

      it('should affect false value to showAddButton', function() {
        $scope.inputValue = [{ value: 'value 1' }, { value: 'value2' }, { value: 'value3' }];
        $controller('MultiInputGroupController', {
          $scope: $scope
        });
        $scope.$digest();
        $scope.showAddButton[1] = true;
        ctrl.addField();
        expect($scope.showAddButton[1]).is.false;
      });

      it('should add one field scope content', function() {
        $scope.content = [];
        ctrl.addField();
        expect($scope.content).to.deep.equal([{
          value: '',
          type: ''
        }]);
      });

      it('should call focusLastItem with correct value', function() {
        $scope.content = [];
        multiInputService.focusLastItem = sinon.spy();
        ctrl.addField('element');
        expect(multiInputService.focusLastItem).have.been.calledWith('element', '.multi-input-content .multi-input-text');
      });
    });

    describe('The deleteField fn', function() {
      beforeEach(function() {
        $scope.inputValue = [];
      });

      it('should remove one item scope content', function() {
        $scope.content = ['1', '2', '3'];
        ctrl.deleteField(null, 1);
        expect($scope.content).to.deep.equal(['1', '3']);
      });

      it('should call focusLastItem with correct value', function() {
        $scope.content = [];
        multiInputService.focusLastItem = sinon.spy();
        ctrl.deleteField('element', 1);
        expect(multiInputService.focusLastItem).have.been.calledWith('element', '.multi-input-content .multi-input-text');
      });

      it('should remove one item scope inputValue if exist', function() {
        $scope.content = [];
        $scope.inputValue = ['1', '2', '3'];
        ctrl.deleteField(null, 1);
        expect($scope.inputValue).to.deep.equal(['1', '3']);
      });
    });

    describe('The isMultiTypeField fn', function() {

      it('should return correct value', function() {
        expect($scope.isMultiTypeField()).is.true;
        $scope.types = null;
        expect($scope.isMultiTypeField()).is.false;
      });
    });

    describe('The onTypeChange method', function() {
      beforeEach(function() {
        $scope.content = [{ type: '' }];
        $scope.inputValue = [{ type: '' }];
      });

      it('should affect true value to showAddButton', function() {
        $scope.showAddButton[1] = true;
        $scope.onTypeChange(0);
        expect($scope.showAddButton[1]).is.true;
      });

      it('should affect true value to showDeleteButtonArray', function() {
        $scope.showDeleteButtonArray[0] = false;
        $scope.onTypeChange(0);
        expect($scope.showDeleteButtonArray[0]).to.be.false;
      });

      it('should update inputValue', function() {
        var type = 'foo';

        $scope.content = [{ type: type }];
        $scope.onTypeChange(0);
        expect($scope.inputValue).to.deep.equal([{ type: type }]);
      });
    });
  });

  describe('The multiInputService factory', function() {

    var multiInputService, timeout;

    beforeEach(angular.mock.inject(function(_multiInputService_, _$timeout_) {
      multiInputService = _multiInputService_;
      timeout = _$timeout_;
    }));

    describe('The focusLastItem fn', function() {

      it('should focus on the last field', function(done) {
        var className = 'class';
        var element = {
          find: function(element) {
            expect(element).to.equal(className);

            return {
              last: function() {
                return {
                  focus: done
                };
              }
            };
          }
        };

        multiInputService.focusLastItem(element, className);
        timeout.flush();
      });
    });
  });
});
