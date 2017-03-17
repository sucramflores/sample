// ROUTES
myapp.config(function ($routeProvider) {
   
    $routeProvider
    
    
    .when('/', {
        templateUrl: 'pages/dashboard.htm',
        controller: 'dashboardController'
    })
    
    .when('/checklist', {
        templateUrl: 'pages/mchecklist.htm',
        controller: 'mchecklistController'
    })
    
    .when('/checklist/add', {
        templateUrl: 'pages/mchecklistadd.htm',
        controller: 'mchecklistaddController'
    })
    
    .when('/checklist/:id', {
        templateUrl: 'pages/mchecklistadd.htm',
        controller: 'mchecklistaddController'
    })
    
    .when('/fillrate', {
        templateUrl: 'pages/mfillrate.htm',
        controller: 'mfillrateController'
    })
    
    .when('/fillrate/add/:id', {
        templateUrl: 'pages/mfillrateadd.htm',
        controller: 'mfillrateaddController'
    })  
    

    
    
     .when('/fillrate/:id/:date', {
        templateUrl: 'pages/mfillrateadd.htm',
        controller: 'mfillrateaddController'
    })  
    
    
     .when('/report', {
        templateUrl: 'pages/mreport.htm',
        controller: 'mreportController'
    })
    
    .when('/stats', {
        templateUrl: 'pages/mstats.htm',
        controller: 'mstatsController'
    })
    
      .when('/review/checklist', {
        templateUrl: 'pages/mreviewchecklist.htm',
        controller: 'mreviewchecklistController'
    })
    
    .when('/review/checklist/:id', {
        templateUrl: 'pages/rchecklistadd.htm',
        controller: 'mreviewchecklistdetailController'
    })
    
    
    
    
    
});