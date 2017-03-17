// CONTROLLERS

myapp.controller('managerController', ['$scope','managerService', function($scope,managerService) {
    $scope.EmployeeName = managerService.EmployeeName; 
    $scope.EmployeeRole =  managerService.EmployeeRole;
    $scope.EmployeeID =  managerService.EmployeeID;
    $scope.EmployeeLogin =  managerService.EmployeeLogin;  
    $("#spanName").text($scope.EmployeeName);
    
}]);


myapp.controller('mchecklistaddController', ['$scope','$resource','$routeParams','$http','managerService', function($scope,$resource,$routeParams,$http,managerService) {
    $scope.EmployeeName = managerService.EmployeeName; 
    $scope.EmployeeRole =  managerService.EmployeeRole;
    $scope.EmployeeID =  managerService.EmployeeID;
    $scope.EmployeeLogin =  managerService.EmployeeLogin;  
    

    if($routeParams['id']){ // if there is an ID = EDIT mode
            $("button[type=\"submit\"]").hide();
            $("button[type=\"reset\"]").hide();
            $("#btnVolta").removeClass("hide");
    }
    
    
    // Download the DROPBOX content
    // Download the checklist if it has an ID parameter
    $http({
        method: 'GET',
        url: managerService.EndPoint+"Branch"
    }).then(function successCallback(response) {
        $scope.Branch = response.data;
        if($routeParams['id']){ // if there is an ID = EDIT mode
            
            let urlTemp = managerService.EndPoint+"Checklist_BranchManager&id="+$routeParams['id'];
            var objCK = null;
            $.ajax({
              url: urlTemp,
              data: {
                 format: 'json'
              },
              error: function(a) {
                 alert('erro');
              },
              dataType: 'json',
              success: function(data) {
                  ExtractData(data);
              },
              type: 'GET'
            });
            
        }
        
        
    }, function errorCallback(response) {
        console.log('erro '+response);
    });
    
      
    
   
    
    
    // Ajax Call to "Insert" new checklist
    $scope.sendchecklist = function(){
        $scope.date = new Date ($('#cldate').val());
        $scope.branchid = $('#selectBranch').val();
   
        
        //console.log('nome: '+$scope.nome);
        //console.log('email: '+$scope.email);
        //console.log('date: '+$scope.date);
        //console.log('branchid: '+$scope.branchid);
        //console.log('timeStamp: '+$scope.timestamp);
        //console.log('userid: '+$scope.userid);
        //console.log('pto: '+$scope.pto);
        //console.log('totalplaced: '+$scope.totalplaced);
        //console.log('totalinterviewed: '+$scope.totalinterviewed);
        //console.log('totalorientantion: '+$scope.totalorientantion);
        //console.log('totalrecruiters: '+$scope.totalrecruiters);
        //console.log('totalwalkins: '+$scope.totalwalkins);
        //console.log('totalwebapplicants: '+$scope.totalwebapplicants);

        if($scope.date=="Invalid Date" || $scope.branchid===null){
            Materialize.toast('Please, enter with a valid date and Branch!', 4000);
            return;
        }
   
        
        let dateTemp = $scope.date.getUTCFullYear()+"-"+($scope.date.getUTCMonth() + 1)+"-"+$scope.date.getUTCDate();

        var requ = {
            method: 'POST',
            url: 'http://localhost/api/createChecklistBranchManager',
            data: {
                'date':dateTemp,                    
                'submittedtimestamp':dateTemp,
                'submittedbyid':$scope.EmployeeID,
                'branchid':$scope.branchid,
                'huddlestarttime':dateTemp+ ' '+$scope.huddlestarttime+':00:000' || dateTemp+ '00:00:00:000',
                'huddleendtime':dateTemp+ ' '+$scope.huddleendtime+':00:000' || dateTemp+ '00:00:00:000',
                'newrecruitingaactivity':$scope.newrecruitingaactivity || 0,
                'customersvisited':$scope.customersvisited || 0,
                'scheduledadjustments':+$scope.scheduledadjustments || 0, //if is undefinied then return 0
                'clientsafetyfocus':$scope.clientsafetyfocus || 0,
                'totalordersfilled':$scope.totalordersfilled || 0,
                'tempworksfilled':+$scope.tempworksfilled || 0, //if is undefinied then return 0
                'checklistsreviewed':+$scope.checklistsreviewed || 0 //if is undefinied then return 0
            }
        }
        
        $http(requ).then(
            function successCallback(response){
                // console.log("deu certo!");
                Materialize.toast('Checklist added successfully!', 4000);
                window.location.href = 'manager.htm#/checklist/' 
            },
            function errorCallback(response){
                console.log("deu errado!\n"+response);
        });
    }


    
    function ExtractData(data){ 
        //  Properties/Methods for MANAGERS_CL_ADD page
        console.log(data[0]['Date']);
        $scope.date = convertDate(data[0]['Date']);
        $scope.submittedtimestamp = data[0]['SubmittedTimeStamp'];
        $scope.EmployeeID = data[0]['SubmittedByID'];
        $scope.branchid = data[0]['BranchID'];
        $scope.huddlestarttime = data[0]['HuddleStartTime'].substr(11,5);
        $scope.huddleendtime = data[0]['HuddleEndTime'].substr(11,5);
        $scope.newrecruitingaactivity = data[0]['NewRecruitingActivity'];
        $scope.customersvisited = data[0]['CustomersVisited'];
        $scope.scheduledadjustments = data[0]['ScheduleAdjustments'];
        $scope.clientsafetyfocus = data[0]['ClientSafetyFocus'];
        $scope.totalordersfilled = data[0]['TotalOrdersFilled'];
        $scope.tempworksfilled = data[0]['TempWorksFilled'];
        $scope.checklistsreviewed = data[0]['ChecklistsReviewed'];
        $('#cldate').val($scope.date); //work around to make the html reflect the model
        $scope.$digest();
        console.log($scope.huddlestarttime.substr(11,5));
 
        
   }      
    
    
}]);





myapp.controller('mfillrateaddController', ['$scope', '$resource','$routeParams','$http','managerService', function($scope,$resource,$routeParams,$http,managerService) {
    $scope.EmployeeName = managerService.EmployeeName; 
    $scope.EmployeeRole =  managerService.EmployeeRole;
    $scope.EmployeeID =  managerService.EmployeeID;
    $scope.EmployeeLogin =  managerService.EmployeeLogin; 
    $scope.BranchID =  managerService.BranchID; 

    if($routeParams['id'] && $routeParams['date']){ // if there is an ID = EDIT mode
         $("button[type=\"submit\"]").hide();
         $("button[type=\"reset\"]").hide();
         $("#btnVolta").removeClass("hide");
    }
    
    if($routeParams['date'] && $routeParams['id']){
        let APIchecklist = $resource(managerService.EndPointNode+"fillrate/"+$routeParams['id']+"/"+$routeParams['date']);
        $scope.Customer = APIchecklist.query(); 
        let tempDate = $routeParams['date'].substr(0,4)+'-'+$routeParams['date'].substr(4,2)+'-'+$routeParams['date'].substr(6,2);
        $scope.date = convertDate(tempDate);
        
    }else if($routeParams['id']){
        let APIchecklist = $resource(managerService.EndPointNode+"fillrate/"+$routeParams['id']);
        $scope.Customer = APIchecklist.query(); 
    }
    
    // Ajax Call to "Insert" new checklist

     $scope.sendfillrate = function(callback){
            $scope.date = new Date ($('#cldate').val());
            if($scope.date=="Invalid Date" || $scope.branchid===null){
                Materialize.toast('Please, enter with a valid date!', 4000);
                return;
            }
            var customerLabel = $(".nomeCustomer").toArray()
            let dateTemp = $scope.date.getUTCFullYear()+"-"+($scope.date.getUTCMonth() + 1)+"-"+$scope.date.getUTCDate();
            let idFields = $(".idInput")
            let orderedInput = $(".orderedInput")
            let filledInput = $(".filledInput")
            let tomorrowInput = $(".tomorrowInput")
            let flagSuccess = false

            for(i =0; i < idFields.length ; i++){
                //  console.log($(idFields[i]).val());
                //  console.log($(orderedInput[i]).val());
                //  console.log($(filledInput[i]).val());
                //  console.log($(tomorrowInput[i]).val());
                let tempNameCustomer = ($(customerLabel[i]).text().trim());
                if($(orderedInput[i]).val()){ // If total ordered is zero than does not perform ajax post
                    var requ = {
                        method: 'POST',
                        url: managerService.EndPointNode+'createFillRates',
                        data: {
                            'date':dateTemp,                    
                            'customerid':$(idFields[i]).val(),
                            'totalordered':$(orderedInput[i]).val() || 0,
                            'totalfilled':$(filledInput[i]).val() || 0,
                            'notes':'',
                            'branchid':$scope.BranchID,
                            'totalorderedtomorrow':$(tomorrowInput[i]).val() || 0
                        }
                    }

                    $http(requ).then(
                        function successCallback(response){
                            Materialize.toast(tempNameCustomer+' fill rate added!', 4000);
                             window.location.href = 'manager.htm#/fillrate/' 
                        },
                        function errorCallback(response){
                            console.log("deu errado!\n"+response);
                    });
                }
            }
            
            
            
            
        } 
     
     $scope.calcPercentage = function(val1,val2){
         let tempPercent = Math.trunc((val1/val2)*100);
         return ((tempPercent | 0)+"%");
     }
    
}]);





myapp.controller('mchecklistController', ['$scope', '$resource','$routeParams','managerService', function($scope,$resource,$routeParams,managerService) {

    $scope.EmployeeName = managerService.EmployeeName; 
    $scope.EmployeeRole =  managerService.EmployeeRole;
    $scope.EmployeeID =  managerService.EmployeeID;
    $scope.EmployeeLogin =  managerService.EmployeeLogin;  

    let APIchecklist = $resource(managerService.EndPoint+"Checklist_BranchManager"+"&submittedbyid="+$scope.EmployeeID);
    $scope.Checklist = APIchecklist.query(); 
    
    $scope.convertDate = function(dateParam){
        return convertDate(dateParam); // in script.js
    }
        
    
    
}]);



myapp.controller('mfillrateController', ['$scope', '$resource','$routeParams','managerService', function($scope,$resource,$routeParams,managerService) {
    
    $scope.EmployeeName = managerService.EmployeeName; 
    $scope.EmployeeRole =  managerService.EmployeeRole;
    $scope.EmployeeID =  managerService.EmployeeID;
    $scope.EmployeeLogin =  managerService.EmployeeLogin; 
    $scope.BranchID =  managerService.BranchID; 

    let APIfillrate = $resource(managerService.EndPoint+"vFillRateDistinct"+"&branchid="+$scope.BranchID);
    $scope.FillRate = APIfillrate.query(); 
    
    $scope.convertDate = function(dateParam){
        return convertDate(dateParam); // in script.js
    }
    
    $scope.normalizeDate = function(dateParam){
        return dateParam.substring(0,10).replace(new RegExp('-', 'g'), ''); // in script.js
    }
    
    
}]);



myapp.controller('dashboardController', ['$scope', function($scope) {
    
}]);



myapp.controller('mreviewchecklistController', ['$scope','$resource','$routeParams','managerService', function($scope,$resource,$routeParams,managerService) {
    
    $scope.EmployeeName = managerService.EmployeeName; 
    $scope.EmployeeRole =  managerService.EmployeeRole;
    $scope.EmployeeID =  managerService.EmployeeID;
    $scope.EmployeeLogin =  managerService.EmployeeLogin;  
    $scope.BranchID =  managerService.BranchID;
    
    let APIchecklist = $resource(managerService.EndPoint+"vChecklist"+"&branchid="+$scope.BranchID);
    $scope.Checklist = APIchecklist.query(); 
    
    $scope.convertDate = function(dateParam){
        return convertDate(dateParam); // in script.js
    }
    
}]);



myapp.controller('mreviewchecklistdetailController', ['$scope','$resource','$routeParams','$http','managerService', function($scope,$resource,$routeParams,$http,managerService) {
    
    $scope.EmployeeName = managerService.EmployeeName; 
    $scope.EmployeeRole =  managerService.EmployeeRole;
    $scope.EmployeeID =  managerService.EmployeeID;
    $scope.EmployeeLogin =  managerService.EmployeeLogin;  
    $scope.BranchID =  managerService.BranchID;
    

    if($routeParams['id']){ // if there is an ID = EDIT mode
            $("button[type=\"submit\"]").hide();
            $("button[type=\"reset\"]").hide();
            $("#btnVolta").removeClass("hide");
            $("#btnVolta").attr("href", "manager.htm#/review/checklist/")
    }
    
    
    // Download the DROPBOX content
    // Download the checklist if it has an ID parameter
    $http({
        method: 'GET',
        url: managerService.EndPoint+"branch"
    }).then(function successCallback(response) {
        $scope.Branch = response.data;
        if($routeParams['id']){ // if there is an ID = EDIT mode
            
            let urlTemp = managerService.EndPoint+"vchecklist&id="+$routeParams['id'];
            var objCK = null;
            $.ajax({
              url: urlTemp,
              data: {
                 format: 'json'
              },
              error: function(a) {
                 alert('erro');
              },
              dataType: 'json',
              success: function(data) {
                  ExtractData(data);
              },
              type: 'GET'
            });
            
        }
        
        
    }, function errorCallback(response) {
        console.log('erro '+response);
    });
    

    
    function ExtractData(data){ 
        //  Properties/Methods for RECRUITERS_CL_ADD page
        $("div>h5").text(data[0]['FirstName']);
        $("div>span").text(data[0]['UserName']);
        $scope.date = convertDate(data[0]['Date']);
        $scope.timestamp = data[0]['SubmittedTimeStamp'];
        $scope.EmployeeID = data[0]['SubmittedByID'];
        $scope.branchid = data[0]['BranchID'];
        $scope.pto = data[0]['PTO'];
        $scope.totalplaced = data[0]['TotalPlaced'];
        $scope.totalinterviewed = data[0]['TotalInterviewed'];
        $scope.totalorientantion = data[0]['TotalOrientation'];
        $scope.totalrecruiters = data[0]['TotalRecruiters'];
        $scope.totalwalkins = data[0]['TotalWalkins'];
        $scope.totalwebapplicants = data[0]['TotalWebApplicants'];
        $scope.injuries = {};
        $('#cldate').val($scope.date); //work around to make the html reflect the model
        $scope.$digest();
        
   }
    
}]);

myapp.controller('mreviewfillrateController', ['$scope', function($scope) {
    
}]);