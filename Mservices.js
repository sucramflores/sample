myapp.service('managerService', function() {
   
    //    this.EndPoint = "http://138.68.49.157/api/list?table=";
    this.EndPoint = "http://127.0.0.1/api/list?table=";
    this.EndPointNode = "http://127.0.0.1/api/";
    this.EmployeeName = sessionStorage.getItem('EmployeeName');
    this.EmployeeRole = sessionStorage.getItem('EmployeeRole');
    this.EmployeeID = sessionStorage.getItem('EmployeeID');
    this.EmployeeLogin = sessionStorage.getItem('EmployeeLogin');
    this.BranchID = sessionStorage.getItem('BranchID');
    
    
});