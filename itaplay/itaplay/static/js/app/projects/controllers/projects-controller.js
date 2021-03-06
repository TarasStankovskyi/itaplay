
function AddProjectTemplateController ($scope,$routeParams, $http, $location, $mdDialog) {
    $scope.project_id = $routeParams.project_id;
    $scope.init = function () {
        $http.get("api/projects/" + $scope.project_id + "/")
            .then(function (response) {
            $scope.project = response.data;
        });

        $http.get("/templates/all/")
            .then(function (response) {
            $scope.templates = response.data;
        });

        $http.get("/clips/allclips/")
            .then(function (response) {
            $scope.clips = response.data;
        });
    };

    $scope.parseTemplate = function (selected_template) {
        if (selected_template) {
            $scope.areas=[];
            if (window.DOMParser) {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(selected_template.template_content, "text/xml");
            }
            else // Internet Explorer
            {
                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(selected_template.template_content);
            }
            var DOM_areas = xmlDoc.getElementsByTagName("area");
            for (var i = 0; i < DOM_areas.length; i++) {
                $scope.areas[i] = {};
                $scope.areas[i]['id'] = DOM_areas[i].id;
                $scope.areas[i]['height'] = DOM_areas[i].attributes.height.nodeValue;
                $scope.areas[i]['width'] = DOM_areas[i].attributes.width.nodeValue;
                $scope.areas[i]['top'] = DOM_areas[i].attributes.top.nodeValue;
                $scope.areas[i]['left'] = DOM_areas[i].attributes.left.nodeValue;
                $scope.areas[i]['clips'] = [];
            }
            $scope.selected_clips = [];
        }
    };

    $scope.save = function (selected_template, areas) {
        var data = {
            "project_id": $scope.project_id,
            "template_id": selected_template.id,
            "areas": areas
        };
        $http.post("api/projects/" + $scope.project_id + "/template/", data)
            .success(function () {
            $location.path("/projects/id=" + $scope.project_id + "/");
        });
    };

    $scope.isFormValid = function (selected_template, areas) {
        if (selected_template==null) return false;
        if(areas==undefined) return false;
        for (var i = 0; i < areas.length; i+=1) {
            if (!areas[i].clips.length) return false;
        }
        return true;
    };

    $scope.querySearch = function (query) {
        return query ? $scope.templates.filter(createFilterFor(query)) : $scope.templates;
    };

    var createFilterFor = function (query) {
        return function filterFn(template) {
            return (template.template_name.toLowerCase().indexOf(query.toLowerCase()) === 0);
        };
    };

    $scope.showDialog = function (ev) {
        var area_id = parseInt(ev.currentTarget.id)-1;
        if($scope.areas[area_id].clips) {
            $scope.selected_clips = $scope.areas[area_id].clips;
        }
        $mdDialog.show({
            controller: DialogController,
            templateUrl: "static/js/app/projects/views/clip_add_dialog.html",
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true
        })
            .then(function (answer) {
                $scope.areas[area_id].clips = answer;

            });
    };

    $scope.setAreaStyle = function(area) {
        return {height: area.height+'%',
                width: area.width+'%',
                top: area.top+'%',
                left:area.left+'%'}
    };

    var showAlert = function(message) {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title("Something went wrong")
            .textContent(message)
            .ariaLabel("Error")
            .ok("Got it!")
        );
      };

    function DialogController ($scope, $mdDialog) {

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
    }
}

itaplay.controller('ProjectCtrl', function($scope, $http, $route) {
    $http.get("api/projects")
            .then(function (response) {
                $scope.projects = response.data['results'];
            });

    $scope.delete = function (project) {
        $http.delete("api/projects/" + project.id + "/")
            .success(function () {
                $route.reload();
            });
    };
});

itaplay.controller('EditProjectCtrl', function ($scope, $http, $routeParams, $location, $window, $mdDialog) {

    var id = $routeParams.project_id;

    $http.get("api/projects/" + id + "/")
        .then(function (response) {
            $scope.project = response.data;
            if (response.data.project_template === null){
                $scope.template_button = "Add template";
                $scope.allow_send_project = false;
            }
            else{
                $scope.template_button = "Change template";
                $scope.allow_send_project = true;
            }
        }, function errorCallback(response) {
            $location.path('/projects/error');
    });

    $http.get("api/projects_to_players/" + id + "/")
        .then(function (response) {
            $scope.data = response.data;
        });

    $scope.addPlayers = function ($event){
        $mdDialog.show({
            controller: DialogController,
            templateUrl:"static/js/app/projects/views/add_players.html",
            parent: angular.element(document.body),
            locals: {parent: $scope},
            targetEvent: $event,
            clickOutsideToClose:true,
        }).then(function (answer) {
            $scope.new_players = answer;
        }, function () {
            $scope.status = 'You cancelled the dialog.';
        });
    };  

    $scope.addProjectToPlayers = function (project, new_players) {
        data ={
            "project" : project, 
            "players" : new_players
        };
        $http.put("api/projects_to_players/", data)
            .success(function () {
                $window.location.reload();
            });
    };

    $scope.update = function (project) {
        $http.put("api/projects/" + project.id + "/", project)
            .success(function () {
                $location.path('/projects');
            });
    };

    $scope.delete = function (project) {
        $http.delete("api/projects/" + project.id + "/")
            .success(function () {
                $location.path('/projects');
            });
    };
});

itaplay.controller('AddProjectCtrl', function ($scope, $http, $location) {

    $scope.create = function (project) {
        $http.post("api/projects/", project)
            .success(function (createdProject) {
                $location.path('/projects/id=' + createdProject.id);
            });
    };
});
