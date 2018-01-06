angular
    .module("FillInBlankQuiz", [])
    .directive("fillInBlankQuiz", [
        "$sce",
        function ($sce) {
            return {
                link: function ($scope) {
                    function shuffle(b) {
                        var a = angular.copy(b);
                        var j, x, i;
                        for (i = a.length - 1; i > 0; i--) {
                            j = Math.floor(Math.random() * (i + 1));
                            x = a[i];
                            a[i] = a[j];
                            a[j] = x;
                        }
                        return a;
                    }
                    var scope = $scope;
                    var placeholderSign = 'placeholderSegment';
                    scope.placeholderSegments = scope.placeholder.replace(/{\d}/gi, placeholderSign).split(placeholderSign);

                    scope.segmentsCollection = [scope.placeholderSegments, scope.answers];
                    scope.shuffleAnswers = shuffle(scope.answers);
                    scope.lengths = [];
                    for(var i = 0; i<scope.segmentsCollection.length;i++) {
                        scope.lengths.push(scope.segmentsCollection[i].length);
                    }

                    scope.segments = [];
                    var maxLength = Math.max.apply(null,scope.lengths);
                    for(var k = 0; k<maxLength; k++){
                        for(var j = 0; j<scope.segmentsCollection.length;j++) {
                            if (scope.segmentsCollection[j]) {
                                scope.segments.push(scope.segmentsCollection[j][k]);
                            }
                        }
                    }
                    scope.segments = scope.segments.map(function (segment) {
                        if(typeof segment === 'undefined'){
                            segment='';
                        }
                        if(typeof segment==='object'){
                            return {
                                postfix: segment.properties.postfix,
                                prefix: segment.properties.prefix,
                                typeof:'placeholder',
                                text: segment.text
                            };
                        }
                        if(typeof segment==='string'){
                            return {
                                typeof:'raw',
                                text: segment
                            };
                        }
                        return segment;
                    });
                    scope.segments = scope.segments.map(function (segment) {
                        var html;
                        html = segment.text;
                        html = html.replace(/\r\n/gi,'<br/>');
                        html = html.replace(/ /gi,'&nbsp;');
                        segment.html = html;
                        segment.html = $sce.trustAsHtml(segment.html);
                        return segment;
                    });
                    scope.segments = scope.segments.map(function (segment) {
                        segment.answers = [];
                        return segment;
                    });
                    scope.fill = function (segment, event) {
                        segment.filledIn = event.target.innerText;
                        runCheckerQuizzesCorrect();
                    };

                    var runCheckerQuizzesCorrect = function () {
                        var filledAnswers = scope.segments.filter(function (value) {
                            return value.typeof === 'placeholder'
                        });
                        var correctedFilledAnswers = filledAnswers.filter(function (value) {
                            return value.text === value.filledIn;
                        });
                        if(correctedFilledAnswers.length === filledAnswers.length){
                            scope.eventCorrect();
                        }
                    };
                },
                template: '<div class="answers placeholderTypeInQuiz placeholderQuiz"> <div class="textblock raw"> <span ng-repeat="segment in segments"> <div class="placeholder" ng-if="segment.typeof === \'placeholder\'"> <div class="answer"> <div class="typeInControl"> <div class="prefix">{{segment.prefix}}</div> <div class="answer"> <span class="realText">{{segment.text}}</span> <span class="resultText" contenteditable="true" ng-keydown="fill(segment, $event)" ng-keyup="fill(segment, $event)"></span> </div> <div class="postfix">{{segment.postfix}}</div> </div> </div> </div> <span ng-if="segment.typeof === \'raw\'" ng-bind-html="segment.html"></span> </span> </div> </div>',
                scope: {
                    eventCorrect: "&eventCorrect",
                    placeholder: "=",
                    answers: "="
                }
            };
        }
    ])
    .filter('typeof', function () {
        return function (value, wordwise, max, tail) {
            return typeof value;
        }
    })
;
