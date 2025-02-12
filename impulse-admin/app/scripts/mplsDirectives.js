﻿/// <reference path="../mpls.intellisense.js" />
ImpulseApp.directive('adInfoblock', function () {
    return {
        templateUrl: 'views/ad-info-block.html',
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (attrs.adminBlock === "") {
                scope.adminBlock = true;
            }
            
        },
        controller: function ($scope, $modal, ServerQueryService, ExportValues) {
            $scope.watch = function (url) {
                isClose = false;
                $scope.$modalInstance = $modal.open({
                    backdrop: false,
                    scope: $scope,
                    templateUrl: '/ad/' + url,
                    windowTemplateUrl: 'splash/index.html'
                });

            };
            $scope.closeModal = function () {
                $scope.$modalInstance.dismiss('cancel');
            };
            $scope.isShowExport = false;
            $scope.exportValues = ExportValues.dropdown;
            $scope.exportChoosen = $scope.exportValues[0];
            $scope.ad.isopen = false;
            $scope.isopenexport = false;
            $scope.ad.choosen = _.findWhere($scope.ad.versions, { IsActive: true });
            if (!$scope.ad.choosen) {
                $scope.ad.choosen = $scope.ad.versions[0];
            }
            $scope.ad.dbChoosen = $scope.ad.choosen;
            $scope.saveButton = "fa-check";
            $scope.image = $scope.ad.choosen.Poster || $scope.ad.choosen.AdStates[0].VideoUnit.Image;
            $scope.switchChoosen = function (id) {
                _.each($scope.ad.versions, function (version) {
                    if (version.Id === id) {
                        version.IsActive = true;
                    } else {
                        version.IsActive = false;
                    }

                })
                $scope.ad.choosen = _.findWhere($scope.ad.versions, { IsActive: true });
                $scope.image = $scope.ad.choosen.Poster || $scope.ad.choosen.AdStates[0].VideoUnit.Image;

            };
            $scope.exportAd = function () {
                $scope.exportString = '';
                $scope.isShowExport = !$scope.isShowExport;
                switch ($scope.exportChoosen.id) {
                    case 0: $scope.exportString = '<script src="http://localhost:56596/ad/' + $scope.ad.choosen.ShortUrlKey + '?targeturl=${CLICK_URL_ENC}"></script>';
                        break;
                    case 1: $scope.exportString = '<iframe src="http://localhost:56596/ad/' + $scope.ad.choosen.ShortUrlKey + '"></iframe>';
                        break;
                    case 2:
                        $scope.exportString = "Подождите...";
                        ServerQueryService.getVMAP($scope.ad.choosen.Id).then(function (data) {
                            $scope.exportString = data;
                        });
                        break;
                    case 3:
                        $scope.exportString = '<script>document.write(\'<scr\'+\'ipt src="//localhost:56596/ad/' + $scope.ad.choosen.ShortUrlKey+'?targetwindow=_top&targeturl=\' + encodeURIComponent(\'{clickthrough0}\') + \'"></scr\'+\'ipt>\');</script>'; break;
                    case 4:
                        $scope.exportString = '<script src="//localhost:56596/ad/' + $scope.ad.choosen.ShortUrlKey+'?targetwindow=_top&targeturl=#ZANOX-CLICKTAG#"></script>'; break;
                    case 5:
                        $scope.exportString = '<script src="//localhost:56596/ad/' + $scope.ad.choosen.ShortUrlKey+'?targetwindow=_top&targeturl=@@"></script>'; break;
                }
            }
            $scope.switchExportChosen = function (id) {
                _.each($scope.exportValues, function (exportVal) {
                    if (exportVal.id === id) {
                        $scope.exportChoosen = exportVal;
                    }
                })
            };

            $scope.$watchGroup(['ad.choosen.Id', 'ad.dbChoosen.Id'], function () {
                $scope.saveButton = "fa-save";
                if ($scope.ad.choosen.Id == $scope.ad.dbChoosen.Id) {
                    $scope.saveButton = "fa-check";
                }
            })

            $scope.saveChoosen = function () {
                $scope.saveButton = "fa-clock-o";
                ServerQueryService.updateActive($scope.ad.choosen.Id).then(function (data) {
                    $scope.ad.dbChoosen = $scope.ad.choosen;
                });
            }
            $scope.remove = function () {
                ServerQueryService.deleteAdByUrl($scope.ad.choosen.ShortUrlKey).then(function () {
                    var adToRemove = _.findWhere($scope.$parent.ads, { key: $scope.ad.choosen.ShortUrlKey })
                    $scope.$parent.ads = _.without($scope.$parent.ads, adToRemove);
                });

            };

            $scope.removeVersion = function (id) {
                ServerQueryService.deleteAdById(id).then(function () {
                    $scope.ad.versions = _.without($scope.ad.versions, $scope.ad.choosen);
                    if ($scope.ad.choosen.Id === $scope.ad.dbChoosen.Id) {
                        $scope.switchChoosen($scope.ad.versions[0].Id);
                        $scope.saveChoosen();
                    } else {
                        $scope.ad.choosen = $scope.ad.dbChoosen;

                    }

                });
            };

            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };
        }
    }
});

ImpulseApp.directive('adminAdInfoblock', function () {
    return {
        templateUrl: 'views/admin-ad-review.html',
        restrict: 'A',
        controller: function ($scope, $modal, ServerQueryService, ExportValues) {
            $scope.watch = function (url) {
                isClose = false;
                $scope.$modalInstance = $modal.open({
                    backdrop: false,
                    scope: $scope,
                    templateUrl: '/ad/' + url,
                    windowTemplateUrl: 'splash/index.html'
                });

            };
            $scope.closeModal = function () {
                $scope.$modalInstance.dismiss('cancel');
            };
            $scope.image = $scope.review.ad.AdStates[0].VideoUnit.Image;

            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };
            $scope.reviewAd = function (decision, comment) {
                $scope.review.review.IsReviewed = true;
                $scope.review.review.IsApproved = decision;
                $scope.review.review.Review = comment;
                ServerQueryService.review($scope.review.review).then(function (id) {
                    $scope.review.review.Id = id;
                });
            }
        }
    }
});

ImpulseApp.filter('shortUrlFilter', function () {
    return function (items, groupCount) {
        /// <param name="items" type="Array" elementType="server.SimpleAdModelDTO">Description</param>
        var results = [];
        if (items) {
            results = _.chain(items)
                .groupBy('ShortUrlKey')
            .map(function (value, key) {
                return {
                    key: key,
                    versions: value
                }
            }).value();

            return results;
        } else {
            return [];
        }
    }
});
ImpulseApp.filter('startFrom', function () {
    return function (input, start) {
        start = +start - 2; //parse to int
        return input.slice(start);
    }
});
ImpulseApp.directive('ngConfirmClick', ['ngDialog', '$parse', '$compile',
function (ngDialog, $parse, $compile) {
    return {
        priority: -1,
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('click', function (e) {
                var fn = $parse(attrs.ngConfirmClick);
                var message = attrs.ngConfirmMessage;
                var dlg = ngDialog.openConfirm({
                    template: '<div class="ngdialog-message mt">' + message + '</div>' +
  '<div class="ngdialog-buttons mt">' +
      '<button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click=closeThisDialog("Cancel")>Отмена</button>' +
      '<button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>Подтвердить</button>' +
      '</div>',
                    plain: 'true'
                }).then(function (btn) {
                    fn(scope, { $event: attrs.ngConfirmClick });
                }, function (btn) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                });
            });
        }
    }
}
]);

ImpulseApp.directive('userNotifications', function () {
    return {
        templateUrl: 'views/user-notifications.html',
        restrict: 'A',
        controller: function ($scope, $modal, ServerQueryService, ExportValues) {
            $scope.reviews = [];
            ServerQueryService.getUserReviews()
                .then(function (reviews) {
                    $scope.reviews = _.filter(reviews, function (review) {
                        return review.IsReviewed === true;
                    });
                },
                function (data) {
                    console.log('userNotifications getReviews error');
                });
        }
    }
});
ImpulseApp.directive('userProgress', function () {
    return {
        templateUrl: 'views/user-progress.html',
        restrict: 'A',
        controller: function ($scope, $modal, ServerQueryService, ExportValues) {
            $scope.abList = [];
            ServerQueryService.getAllTests()
                .then(function (abList) {
                    $scope.abList = abList;
                    impulseUtils.enrichAbTestList($scope.abList);
                },
                function (data) {
                    console.log('userProgress getAbs error');
                });
        }
    }
});