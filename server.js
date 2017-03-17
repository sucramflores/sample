var express = require('express');
var app = express();
var sql = require('mssql'); 
var bodyParser = require('body-parser');
//var hc = require('highcharts');
//global.Highcharts = require('highcharts');
//require('highcharts-drilldown');
//var Highcharts = require('highcharts');
//require('highcharts-drilldown');
//require('highcharts/modules/drilldown')(Highcharts);

app.use(express.static(__dirname + '/Controllers'));
app.use(express.static(__dirname + '/Pages'));
app.use(express.static(__dirname + '/Routes'));
app.use(express.static(__dirname + '/Services'));
app.use(express.static(__dirname + '/Static'));
app.use(express.static(__dirname + '/app.js'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var dbConnection = "mssql://daily_reports:polar**Plan3t$@support.staffingsolutionsgroup.com/daily_reports"

app.get('/api/list/', function(req, res) {

    sql.connect(dbConnection).then(function (connection) {
        tableName = req.query.table[0].toUpperCase() + req.query.table.slice(1).toLowerCase();
        //To filter by branchid ex) http://localhost:3000/api/list?table=fillrates&branchid=3
        if (req.query.branchid) {
            whereClause = ' where BranchID = ' + req.query.branchid;
        } else {
            whereClause = '';
        }

        if (req.query.id) {
            if (whereClause.length > 1) {
                whereClause = whereClause + ' and ID = ' + req.query.id
            } else {
                whereClause = ' where ID = ' + req.query.id
            }
        }

        if (req.query.startdate) {
            if (whereClause.length > 1) {
                whereClause = whereClause + " and Date between '" + req.query.startdate + "' AND '" + req.query.enddate + "'"
            } else {
                whereClause = " where Date between '" + req.query.startdate + "' AND '" + req.query.enddate + "'"
            }
        }

        if (req.query.submittedbyid) {
            if (whereClause.length > 1) {
                whereClause = whereClause + " and SubmittedByID = " + req.query.submittedbyid
            } else {
                whereClause = " where SubmittedByID = " + req.query.submittedbyid
            }
        }

        new sql.Request(connection).query('select * from ' + tableName + whereClause).then(function(recordset) {

            res.send(recordset);

        }).catch(function(err) {
            res.send(err);
        });
    }).catch(function(err) {
        console.log("straight up errors :(");
    });
})


// Added this endpoint because fillrates parameters should not passed trough query / security matter
app.get('/api/fillrate/:branchid/', function(req, res) {
    if(req.params.branchid ){
        sql.connect(dbConnection).then(function (connection) {
            let stringSQL = "Select distinct CustomerID,name as Name,BranchID,Branch from vfillrates "+
             " where BranchID = " + req.params.branchid+" order by Name";
            new sql.Request(connection).query(stringSQL).then(function(recordset) {
                res.send(recordset);
            }).catch(function(err) {
                res.send(err);
            });
        }).catch(function(err) {
            console.log("straight up errors :( " + err);
        });
    }
})



app.get('/api/fillrate/:branchid/:date/', function(req, res) {
    if (req.params.branchid && req.params.date) {
        sql.connect(dbConnection).then(function (connection) {
            tableName = "vFillRates";
            whereClause = ' where BranchID = ' + req.params.branchid+' and Date=\''+req.params.date+'\'';
            new sql.Request(connection).query('select * from ' + tableName + whereClause).then(function(recordset) {
                res.send(recordset);
            }).catch(function(err) {
                res.send(err);
            });
        }).catch(function(err) {
            console.log("straight up errors :( "+ err);
        });
    }
})









app.get('/api/companyCR/', function(req,res) {

    var queryCalc = "select CAST(count(ID) AS DECIMAL(18,2))/ CAST((select count(ID) from Branch)* (DATEDIFF(DAY, MIN(Date), MAX(Date))+ 1) AS DECIMAL(18,2)) AS TotalFRCompletedRate from FillRates";
    sql.connect(dbConnection).then(function (connection) {

            new sql.Request(connection).query(queryCalc).then(function(recordset) {
                res.send(recordset);
            }).catch(function(err) {
                res.send(err);
                console.log(err);
            });

        }).catch(function(err) {
            console.log("straight up errors :(");
        });
})



app.get('/api/companyFR/', function(req,res) {

    var queryCalc = "select SUM(CAST(TotalFilled AS DECIMAL(18,2)))/ SUM(CAST(TotalOrdered AS DECIMAL(18,2))) AS CompanyFillRate from FillRates";
    sql.connect(dbConnection).then(function (connection) {

            new sql.Request(connection).query(queryCalc).then(function(recordset) {
                res.send(recordset);
            }).catch(function(err) {
                res.send(err);
                console.log(err);
            });
//            sql.close();
        }).catch(function(err) {
            console.log("straight up errors :(");
        });
})

app.get('/api/BranchFR/', function(req, res) {

    sql.connect(dbConnection).then(function (connection) {

        //To limit to number of branches ex) http://localhost:3000/api/getBranchFR?limit=5
        if (req.query.limit) {
            limitClause = ' top ' + req.query.limit;
        } else {
            limitClause = '';
        }

        new sql.Request(connection).query('select' + limitClause + ' B.Name, B.ID, SUM(CAST(TotalFilled AS DECIMAL(18,2)))/ SUM(CAST(TotalOrdered AS DECIMAL(18,2))) AS BranchFillRate from FillRates FR join Branch B on B.ID = FR.BranchID group by B.ID, B.Name order by BranchFillRate desc' ).then(function(recordset) {
            res.send(recordset);

        }).catch(function(err) {
            res.send(err);
        });

    }).catch(function(err) {
        console.log("straight up errors :(");
    });
})

app.get('/api/BranchCR/', function(req, res) {

    sql.connect(dbConnection).then(function (connection) {

        //To limit to number of branches ex) http://localhost:3000/api/getBranchFR?limit=5
        if (req.query.limit) {
            limitClause = ' top ' + req.query.limit;
        } else {
            limitClause = '';
        }
        
        let stringSQL = 'select' + limitClause + ' B.Name, B.ID, CAST(count(FR.ID) AS DECIMAL(18,2))/ (Select CAST(DATEDIFF(DAY, MIN(Date), MAX(Date))+ 1 AS DECIMAL(18,2)) from FillRates) AS BranchCompletionRate from FillRates FR join Branch B on B.ID = FR.BranchID group by B.ID, B.Name order by BranchCompletionRate desc' ;
        new sql.Request(connection).query(stringSQL).then(function(recordset) {
            res.send(recordset);

        }).catch(function(err) {
            res.send(err);
        });
    }).catch(function(err) {
        console.log("straight up errors :(");
    });
}) 

app.post('/api/login', function(req,res){
    sql.connect(dbConnection).then(function (connection) {

            new sql.Request(connection).query("Select * from Employee where UserName = '" + req.body.username +"'" ).then(function(recordset) {
                res.send(recordset);

            }).catch(function(err) {
                res.send('UserName not found in DB');
            });
        }).catch(function(err) {
            console.log("straight up errors :( "+err);
        });
})

app.post('/api/createChecklist', function(req, res) {
    
    sql.connect(dbConnection).then(function(connection) {
        var transaction = new sql.Transaction(connection);
        transaction.begin(function(err) {
            var request = new sql.Request(transaction);
            var myQuery = "insert into Checklist (Date, SubmittedTimeStamp, SubmittedByID, BranchID, PTO, TotalPlaced, TotalInterviewed, TotalOrientation, TotalRecruiters, TotalWalkins, TotalWebApplicants) values ('" + req.body.date + "', GETDATE(), " + req.body.submittedbyid + ", " + req.body.branchid + ", " + req.body.pto + ", " + req.body.totalplaced + ", " + req.body.totalinterviewed + ", " + req.body.totalorientation + ", " + req.body.totalrecruiters + ", " + req.body.totalwalkins + ", " + req.body.totalwebapplicants + ")";
            console.log(myQuery);
            request.query(myQuery, function(err, recordset) {
                transaction.commit(function(err, recordset) {
                    if (err) { 
                        res.send(err);
                    }else{
                        res.send('Transaction Complete.');
                    }
                });
            });

            
        });
    }).catch(function(err) {
        // ... connect error checks
        console.log("straight up errors :(");
    });
})

app.post('/api/createChecklistManager', function(req, res) {

    sql.connect(dbConnection).then(function(connection) {

        var transaction = new sql.Transaction(connection);
        transaction.begin(function(err) {
            var request = new sql.Request(transaction);
            var myQuery = "insert into Checklist_Manager (Date, SubmittedTimeStamp, SubmittedByID, LaborReports, ClientInteractions, RecognizedAssociates, ServicePerformed) values ('" + req.body.date + "', GETDATE(), " + req.body.submittedbyid + ", '" + req.body.laborreports + "', '" + req.body.clientinteractions + "', '" + req.body.recognizedaassociates + "', '" + req.body.serviceperformed + "')";
            request.query(myQuery, function(err, recordset) {
                transaction.commit(function(err, recordset) {
                    res.send("Checklist for Manager Submitted!")
                });
            });
        });
    }).catch(function(err) {
        // ... connect error checks
        console.log("straight up errors :(");
    });
})


app.post('/api/createChecklistBranchManager', function(req, res) {

    sql.connect(dbConnection).then(function(connection) {

        var transaction = new sql.Transaction(connection);
        transaction.begin(function(err) {
            var request = new sql.Request(transaction);
            var myQuery = "insert into Checklist_BranchManager (Date, SubmittedTimeStamp, SubmittedByID, HuddleStartTime, HuddleEndTime, NewRecruitingActivity, CustomersVisited, ScheduleAdjustments, ClientSafetyFocus, TotalOrdersFilled, TempWorksFilled, BranchID, ChecklistsReviewed) values ('" + req.body.date + "', GETDATE(), " + req.body.submittedbyid + ", '" + req.body.huddlestarttime + "', '" + req.body.huddleendtime + "', '" + req.body.newrecruitingaactivity + "', '" + req.body.customersvisited + "', " + req.body.scheduledadjustments + ", '" + req.body.clientsafetyfocus + "', " + req.body.totalordersfilled + ", " + req.body.tempworksfilled + "," + req.body.branchid + ", " + req.body.checklistsreviewed + ")";
            console.log(myQuery);
            request.query(myQuery, function(err, recordset) {

                transaction.commit(function(err, recordset) {
                    res.send("Checklist for Manager Submitted!")
                });
            });
        });
    }).catch(function(err) {
        // ... connect error checks
        console.log("straight up errors :(");
    });
})

app.post('/api/createChecklistStaffingCoordinator', function(req, res) {

    sql.connect(dbConnection).then(function(connection) {

        var transaction = new sql.Transaction(connection);
        transaction.begin(function(err) {
            var request = new sql.Request(transaction);
            var myQuery = "insert into Checklist_StaffingCoordinator (Date, SubmittedTimeStamp, SubmittedByID, TotalInterviews, TotalEmployeesAssigned, LeadsGenerated, CustomersContacted, TempWorksFilled) values ('" + req.body.date + "', GETDATE(), " + req.body.submittedbyid + ", " + req.body.totalinterviews + ", " + req.body.totalemployeesassigned + ", '" + req.body.leadsgenerated + "', '" + req.body.customerscontacted + "', " + req.body.tempworksfilled + ")"
            request.query(myQuery, function(err, recordset) {

                transaction.commit(function(err, recordset) {
                    res.send("Checklist for Manager Submitted!")
                });
            });
        });
    }).catch(function(err) {
        // ... connect error checks
        console.log("straight up errors :(");
    });
})

app.post('/api/createFillRates', function(req, res) {

    sql.connect(dbConnection).then(function(connection) {

        var transaction = new sql.Transaction(connection);
        transaction.begin(function(err) {
            var request = new sql.Request(transaction);
            var myQuery = "insert into FillRates (Date, CustomerID, TotalOrdered, TotalFilled, Notes, BranchID, TotalOrderedTomorrow) values ('" + req.body.date + "', " + req.body.customerid + ", " + req.body.totalordered + ", " + req.body.totalfilled + ", '" + req.body.notes + "', " + req.body.branchid + ", " + req.body.totalorderedtomorrow + ")"
            request.query(myQuery, function(err, recordset) {

                transaction.commit(function(err, recordset) {
                    res.send("Fill Rates Submitted")
                });
            });
        });
    }).catch(function(err) {
        // ... connect error checks
        console.log("straight up errors :(");
    });
})

app.post('/api/updateFillRates', function(req, res) {
//example:    <url of endpoints>/api/updatesFillRates?ID=######  and pass all body parameters for the fillrate
    sql.connect(dbConnection).then(function(connection) {

        var transaction = new sql.Transaction(connection);
        transaction.begin(function(err) {
            var request = new sql.Request(transaction);
            var myQuery = "update FillRates set Date = '" + req.body.date + "', CustomerID = " + req.body.customerid + ", TotalOrdered = " + req.body.totalordered + ", TotalFilled = " + req.body.totalfilled + ", Notes = '" + req.body.notes + "', BranchID = " + req.body.branchid + ", TotalOrderedTomorrow = " + req.body.totalorderedtomorrow + " where ID = " + req.query.ID
            request.query(myQuery, function(err, recordset) {

                transaction.commit(function(err, recordset) {
                    res.send("Fill Rates Updated")
                });
            });
        });
    }).catch(function(err) {
        // ... connect error checks
        console.log("straight up errors :(");
    });
})

app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "login.htm" );
})

app.get('/recruiter.htm', function (req, res) {
    res.sendFile( __dirname + "/" + "recruiter.htm" );
})

app.get('/manager.htm', function (req, res) {
    res.sendFile( __dirname + "/" + "manager.htm" );
})

app.get('/senior.html', function (req, res) {
    res.sendFile( __dirname + "/" + "senior.html" );
})

app.get('/404.html', function (req, res) {
   res.sendFile( __dirname + "/" + "404.html" );
})

app.get('/pages/:fpath', function (req, res) {
    res.sendFile( __dirname + "/Pages/" + req.params.fpath);
})

app.get('*', function (req, res) {
    res.sendFile( __dirname + "/" + req.url)
})

app.listen(80,function(){
  console.log("Live at Port 80");
});
