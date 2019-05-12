// <reference path="angular.min.js" />

(function() {
  //var url = 'http://demoserver.tacme.net:17400/CCRTasheel/';
  //var h_url = 'http://demoserver.tacme.net:17400/HappinessMeter/happiness/';

  var url = "http://tasheelqs.mohre.gov.ae:9080/CCRTasheel/";
  var h_url = "http://tasheelqs.mohre.gov.ae:9080/HappinessMeter/happiness/";
  //var url = 'http://192.168.1.75:7040/CCRTasheel/';

  //var url = 'http://tasheelqs.mohre.gov.ae:9080/TasheelMohre/';
  //var h_url = 'http://tasheelqs.mohre.gov.ae:9080/HappinessMeter/happiness/';
  var deps = "";

  var printURL = "http://tasheelqs.mohre.gov.ae:9080/ccrreports/ccrreports/";
  var url_Noti = "http://demoserver.tacme.net:18090/ccr-notifications/api/";
  var url_branchDetail = "http://demoserver.tacme.net:18091/CCRTasheelV2/v2/";

  var centerTypeCode = 1;
  //  var sal_url = 'http://tasheelqs.mohre.gov.ae:9080/CCRTasheel/';
  var sal_url = "http://demoserver.tacme.net:17550/CCRTasheel/";

  var $api = function($http, $q) {
    var cancelSearch = $q.defer(); //defer object
    var summaryResolve = false; //status of a request

    var printFromTo = function(
      centerType,
      emirateID,
      branchID,
      printFromDate,
      printToDate
    ) {
      // http://tasheelqs.mohre.gov.ae:9080/ccrreports/ccrreports/centeroverview/5?fromDate=20181201&toDate=20181231     /branch
      // http://tasheelqs.mohre.gov.ae:9080/ccrreports/ccrreports/emirateoverview/DXB?fromDate=20181201&toDate=20181231  //emirate
      // http://tasheelqs.mohre.gov.ae:9080/ccrreports/ccrreports/tasheeloverview/?fromDate=20181201&toDate=20181231

      var wURL = null;
      var cType = "tasheeloverview/";
      var eID = emirateID ? "emirateoverview/" + emirateID : "";
      var bID = branchID ? "centeroverview/" + branchID : "";

      //check center type
      switch (centerType) {
        case "TAS": //TAS
          cType = "tasheeloverview/";
          eID = emirateID ? "emirateoverview/" + emirateID : "";
          bID = branchID ? "centeroverview/" + branchID : "";
          break;
        case "TAW": //TAW
          cType = "tawteenoverview/";
          eID = emirateID ? "tawteenemirateoverview/" + emirateID : "";
          bID = branchID ? "tawteencenteroverview/" + branchID : "";
          break;
        case "TAD": //TAD
          cType = "tadbeeroverview/";
          eID = emirateID ? "tadbeeremirateoverview/" + emirateID : "";
          bID = branchID ? "tadbeercenteroverview/" + branchID : "";
          break;
        case "TAWJ": //TAWJ
          cType = "Tawjeehoverview/";
          eID = emirateID ? "Tawjeehemirateoverview/" + emirateID : "";
          bID = branchID ? "Tawjeehcenteroverview/" + branchID : "";
          break;
        default:
          break;
      }

      //passing dates
      var fromDate = printFromDate ? "fromDate=" + printFromDate : "";
      var toDate = printToDate ? "toDate=" + printToDate : "";

      //genterate url
      if (bID == "") {
        if (eID == "") {
          wURL = printURL + cType + "?" + fromDate + "&" + toDate; //default
        } else {
          wURL = printURL + eID + "?" + fromDate + "&" + toDate; //if emirate
        }
      } else {
        wURL = printURL + bID + "?" + fromDate + "&" + toDate; //if branch
      }
      return wURL;
    };

    var passCenterTypeCode = function(centerType, url_) {
      if (url_) {
        centerTypeCode = centerType.centerTypeCode;
      }
    };

    var getGraphSettings = function() {
      return $http.get(url + "variables/graphSetting").then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getDepartment = function() {
      var wURL =
        url +
        "department" +
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";
      console.log(wURL);
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var passDepartment = function(department, url_) {
      if (url_) {
        url = department.url;
      } else {
        var list = "";

        if (department == null) {
          list = "NA";
        } else {
          for (var i = 0; i < department.length; i++) {
            list +=
              department[i].prefix + (i < department.length - 1 ? "," : "");
          }
        }

        deps = list;
      }
    };

    var getEmirates = function() {
      return $http.get(url + "emirates").then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getBranches = function(emID) {
      return $http.get(url + "branches/emirate/" + emID).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getCounters = function(brID) {
      return $http.get(url + "counters/branch/" + brID).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getWaitingTime = function(emirateID, branchID) {
      var wURL = null;
      var e = emirateID ? "" : "emirates/";

      var eID = emirateID ? "emirate/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      bID
        ? (wURL = url + "avgWaitingTime/" + bID)
        : (wURL = url + "avgWaitingTime/" + e + eID);
      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getTransactionTime = function(emirateID, branchID) {
      var wURL = null;
      var e = emirateID ? "" : "emirates/";

      var eID = emirateID ? "emirate/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      bID
        ? (wURL = url + "avgTransactionTime/" + bID)
        : (wURL = url + "avgTransactionTime/" + e + eID);
      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";
      console.log(wURL);
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getCounterStatus = function(emirateID, branchID) {
      var wURL = null;
      var e = emirateID ? "" : "emirates/";

      var eID = emirateID ? "emirate/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      bID
        ? (wURL = url + "counter/status/" + bID)
        : (wURL = url + "counter/status/" + e + eID);

      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getCustomerStatus = function(emirateID, branchID) {
      var wURL = null;
      var e = emirateID ? "" : "emirates/";

      var eID = emirateID ? "emirate/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      bID
        ? (wURL = url + "customer/status/" + bID)
        : (wURL = url + "customer/status/" + e + eID);
      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getCustomerStatusqueue = function(emirateID, branchID) {
      var wURL = null;
      var e = emirateID ? "" : "emirates/";

      var eID = emirateID ? "emirate/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      bID ? (wURL = url + "queue/" + bID) : (wURL = url + "queue/" + e + eID);
      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getTransactionsPerHour = function(period, emirateID, branchID) {
      var wURL = null;
      var e = emirateID ? "" : "emirates";

      var eID = emirateID ? "emirate/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      bID
        ? (wURL = url + "transactions/hour/" + bID + "/period/" + period)
        : (wURL = url + "transactions/hour/" + e + eID + "/period/" + period);
      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";
      console.log(wURL);
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getTransactionsPerHourDetails = function(period, emirateID, branchID) {
      var wURL = null;

      //var eID = emirateID ? "emirate/" + emirateID + "/detail" : "";
      //emirateID ? wURL = url + "transactions/hour/emirate/" + emirateID + "/detail/period/" + period : wURL = url + "transactions/hour/emirates/detail/period/" + period;

      var wURL = null;
      var e = emirateID ? "" : "emirates/html";

      var eID = emirateID ? "emirate/" + emirateID + "/html" : "";
      var bID = branchID ? "branch/" + branchID : "";
      //var cID = branchID ? "counter/" + counterID : "/detail";
      bID
        ? (wURL =
            url + "transactions/hour/" + bID + "/html/" + "/period/" + period)
        : (wURL = url + "transactions/hour/" + e + eID + "/period/" + period);

      return $http({
        url:
          wURL +
          "/language/" +
          ($("body").attr("dir") == "rtl" ? "ar" : "en") +
          "?includedepartment=" +
          (deps == "" ? "NA" : deps) +
          "&excludedepartment=NA",
        method: "GET",
        transformResponse: [
          function(data) {
            // Do whatever you want!
            return data;
          }
        ]
      }).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getServedPerBranch = function(period, emirateID, branchID) {
      var wURL = null;
      var e = emirateID ? "" : "emirates";

      var eID = emirateID ? "emirates/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      bID
        ? (wURL = url + "branch/served/" + bID + "/period/" + period)
        : (wURL = url + "branch/served/" + e + eID + "/period/" + period);
      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getServedPerDepartment = function(
      period,
      emirateID,
      branchID,
      counterID
    ) {
      var wURL = null;
      var e = emirateID ? "" : "emirates";

      var eID = emirateID ? "emirate/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      var cID = branchID ? "counter/" + counterID : "";
      bID
        ? (wURL = url + "department/served/" + bID + "/period/" + period)
        : (wURL = url + "department/served/" + e + eID + "/period/" + period);
      //cID ? wURL = url + "department/served/" + cID + "/period/" + period : wURL;

      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getServedPerDepartmentDetails = function(period, emirateID, branchID) {
      var wURL = null;
      var e = emirateID ? "" : "emirates/detail";

      var eID = emirateID ? "emirate/" + emirateID + "/detail" : "";
      var bID = branchID ? "branch/" + branchID + "/detail" : "";
      //var cID = branchID ? "counter/" + counterID : "/detail";
      bID
        ? (wURL = url + "department/served/" + bID + "/period/" + period)
        : (wURL = url + "department/served/" + e + eID + "/period/" + period);
      //cID ? wURL = url + "department/served/" + cID + "/period/" + period : wURL;

      //console.log(wURL);
      //return $http.get(wURL)
      //.then(function (response) {
      //    return response.data;
      //}, function (error) {
      //    return error.data;
      //});

      //console.log(wURL);

      return $http({
        url:
          wURL +
          "/language/" +
          ($("body").attr("dir") == "rtl" ? "ar" : "en") +
          "?includedepartment=" +
          (deps == "" ? "NA" : deps) +
          "&excludedepartment=NA",
        method: "GET",
        transformResponse: [
          function(data) {
            // Do whatever you want!
            return data;
          }
        ]
      }).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getBranchSummary = function(emirateID, branchID, cod) {
      var wURL = null;
      var b = branchID ? "branch/" + branchID : "branchs";
      var e = emirateID ? "emirates/" + emirateID : "";
      //var eID = branchID ? "branch/" + branchID : "";
      var cod = cod ? "/" + cod : "";
      branchID
        ? (wURL = url + "operational/" + b + cod)
        : (wURL = url + "operational/" + b);

      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";
      //console.log(wURL);

      if (summaryResolve) {
        //resolving previous request's defer which will abort that ajax call
        cancelSearch.resolve("function aborted");
      }
      cancelSearch = $q.defer(); //create new defer for new request
      summaryResolve = true; //set the request status to true/ongoing

      return $http.get(wURL, { timeout: cancelSearch.promise }).then(
        function(response) {
          //success callback
          summaryResolve = false; //set the request status to completed
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };
    var summaryQ = false;
    var getOperationalSummary = function(emirateID, branchID, cod) {
      var wURL = null;
      var e = emirateID ? "" : "emirates/";

      var eID = emirateID ? "emirates/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      var coq = cod ? "/" + cod : "";
      bID
        ? (wURL = url + "operational/" + bID + coq)
        : (wURL = url + "operational/" + e + eID);

      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";

      if (summaryQ) {
        //resolving previous request's defer which will abort that ajax call
        cancelSearch.resolve("function aborted");
      }
      cancelSearch = $q.defer(); //create new defer for new request
      summaryQ = true; //set the request status to true/ongoing

      return $http.get(wURL, { timeout: cancelSearch.promise }).then(
        function(response) {
          //success callback
          summaryQ = false; //set the request status to completed

          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };
    var summaryQ2 = false;
    var getOperationalSummaryQ = function(emirateID, branchID, cod) {
      var wURL = null;
      var e = emirateID ? "" : "emirates/";

      var eID = emirateID ? "emirates/" + emirateID : "";
      var bID = branchID ? "branch/" + branchID : "";
      var coq = cod ? "/" + cod : "";
      bID
        ? (wURL = url + "queue/" + bID + coq)
        : (wURL = url + "operational/" + e + eID);
      wURL +=
        "?includedepartment=" +
        (deps == "" ? "NA" : deps) +
        "&excludedepartment=NA";

      if (summaryQ2) {
        //resolving previous request's defer which will abort that ajax call
        cancelSearch.resolve("function aborted");
      }
      cancelSearch = $q.defer(); //create new defer for new request
      summaryQ2 = true; //set the request status to true/ongoing

      return $http.get(wURL, { timeout: cancelSearch.promise }).then(
        function(response) {
          //success callback
          summaryQ2 = false; //set the request status to completed
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getBranchHappinessRank = function(emirateID, branchID) {
      var wURL = null;
      var b = branchID ? "branch/" + branchID : "";
      var e = emirateID ? "emirates/" + emirateID : "emirates/";
      //var eID = branchID ? "branch/" + branchID : "";

      if (emirateID) {
        //rank/

        if (emirateID && branchID) {
          wURL = h_url + "rank/" + b;
          //console.log(wURL);
        } else {
          wURL = h_url + "rank/" + e;
        }
      } else {
        wURL = h_url + "rank/emirates/";
      }

      //console.log(wURL);
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getBranchHappinessStatus = function(emirateID, branchID) {
      var wURL = null;
      var b = branchID ? "branch/" + branchID : "";
      var e = emirateID ? "emirates/" + emirateID : "emirates/";
      //var eID = branchID ? "branch/" + branchID : "";

      if (emirateID) {
        //rank/

        if (emirateID && branchID) {
          wURL = h_url + "devicestatus/" + b;
        } else {
          wURL = h_url + "devicestatus/" + e;
        }
      } else {
        wURL = h_url + "devicestatus/emirates/";
      }

      //console.log(wURL);
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getHappinessRadar = function(emirateID, branchID) {
      var wURL = null;
      var b = branchID ? "branch/" + branchID : "";
      var e = emirateID ? "emirates/" + emirateID : "emirates/";
      //var eID = branchID ? "branch/" + branchID : "";

      if (emirateID) {
        if (emirateID && branchID) {
          wURL = h_url + "radar/" + b;
        } else {
          wURL = h_url + "radar/" + e;
        }
      } else {
        wURL = h_url + "radar/emirates/";
      }
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    var getBranchHappinessScore = function(emirateID, branchID) {
      var wURL = null;
      var b = branchID ? "branch/" + branchID : "";
      var e = emirateID ? "emirates/" + emirateID : "emirates/";
      //var eID = branchID ? "branch/" + branchID : "";

      if (emirateID) {
        if (emirateID && branchID) {
          wURL = h_url + "score/" + b;
        } else {
          wURL = h_url + "score/" + e;
        }
      } else {
        wURL = h_url + "score/emirates/";
      }
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //salaries/{}/branch/emirate/AUH
    //salaries/{}/branch/{branchId}
    //salaries/{}/emirates
    var getSalaries = function(emirateID, branchID) {
      var wURL = null;
      // var b = branchID ? "branch/" + branchID : "";
      //var e = emirateID ? "emirates/" + emirateID : "emirates/";
      //var eID = branchID ? "branch/" + branchID : "";

      if (emirateID) {
        if (emirateID && branchID) {
          wURL = sal_url + "salaries/branch/" + branchID;
        } else {
          wURL = sal_url + "salaries/emirate/" + emirateID;
        }
      } else {
        wURL = sal_url + "salaries/emirates/";
      }
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //salaries/{}/employees/emirates/
    //salaries/{}/employees/emirate/{emirate}
    //salaries/{}/employees/branch/{branchId}
    var getEmployeesSalaries = function(emirateID, branchID) {
      var wURL = null;
      if (emirateID) {
        if (emirateID && branchID) {
          wURL = sal_url + "salaries/employees/branch/" + branchID;
        } else {
          wURL = sal_url + "salaries/employees/emirate/" + emirateID;
        }
      } else {
        wURL = sal_url + "salaries/employees/emirates/";
      }
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //GET /salaries/detail/emirates
    //GET /salaries/detail/emirate/{emirate}
    //GET /salaries/detail/branch/{branchId}
    var getSalariesList = function(emirateID, branchID) {
      var wURL = null;
      if (emirateID) {
        if (emirateID && branchID) {
          wURL = sal_url + "salaries/detail/branch/" + branchID;
        } else {
          wURL = sal_url + "salaries/detail/emirate/" + emirateID;
        }
      } else {
        wURL = sal_url + "salaries/detail/emirates";
      }

      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };
    // GET /salaries/employees/detail/emirates/
    var getEmployeesList = function(emirateID, branchID) {
      var wURL = null;
      if (emirateID) {
        if (emirateID && branchID) {
          wURL = sal_url + "salaries/employees/detail/branch/" + branchID;
        } else {
          wURL = sal_url + "salaries/employees/detail/emirate/" + emirateID;
        }
      } else {
        wURL = sal_url + "salaries/employees/detail/emirates/";
      }

      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    return {
      getEmirates: getEmirates,
      getDepartment: getDepartment,
      passDepartment: passDepartment,
      getBranches: getBranches,
      getCounters: getCounters,
      getWaitingTime: getWaitingTime,
      getTransactionTime: getTransactionTime,
      getCounterStatus: getCounterStatus,
      getCustomerStatus: getCustomerStatus,
      getCustomerStatusqueue: getCustomerStatusqueue,
      getTransactionsPerHour: getTransactionsPerHour,
      getTransactionsPerHourDetails: getTransactionsPerHourDetails,
      getServedPerBranch: getServedPerBranch,
      getServedPerDepartment: getServedPerDepartment,
      getBranchSummary: getBranchSummary,
      getOperationalSummary: getOperationalSummary,
      getOperationalSummaryQ: getOperationalSummaryQ,
      getServedPerDepartmentDetails: getServedPerDepartmentDetails,
      getBranchHappinessRank: getBranchHappinessRank,
      getBranchHappinessStatus: getBranchHappinessStatus,
      getBranchHappinessScore: getBranchHappinessScore,
      getHappinessRadar: getHappinessRadar,
      getGraphSettings: getGraphSettings,
      printFromTo: printFromTo,
      getSalaries: getSalaries,
      getEmployeesSalaries: getEmployeesSalaries,
      passCenterTypeCode: passCenterTypeCode,
      getSalariesList: getSalariesList,
      getEmployeesList: getEmployeesList
    };
  };

  var bodyLocale = "en";

  var $apiNoti = function($http) {
    if ($("body").attr("dir") === "rtl") {
      //ar
      bodyLocale = "ar";
    }

    var passCenterType = function(centerType, url_) {
      if (url_) {
        url_Noti = centerType.url_Noti;
      }
    };

    var getViolationsTypes = function() {
      var wURL = url_Noti + "jobs/" + bodyLocale + "/violations";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //notifications/searchNotificatin
    var postNotifications = function(notifications_) {
      var wURL = url_Noti + "notifications/searchNotificatin";
      var vioCode =
        notifications_.violationType == 0 ? null : notifications_.violationType;

      var FromformatDate = notifications_.fromDate.replace(/\//g, "-");
      var ToformatDate = notifications_.toDate.replace(/\//g, "-");
      var notifications = JSON.stringify({
        centerTypeCode: notifications_.centerTypeCode,
        fromDate: FromformatDate,
        toDate: ToformatDate,
        locale: bodyLocale,
        emirateCode: notifications_.emirateCode,
        centerCode: notifications_.centerCode,
        violationType: vioCode
      });

      console.log(notifications);

      return $http({
        method: "POST",
        url: wURL,
        data: notifications,
        headers: { "Content-Type": "application/json" }
      }).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //notifications/notificatinDetails
    var postNotificationsDetails = function(notificationsDetail_) {
      var wURL = url_Noti + "notifications/notificatinDetails";
      var vioCode =
        notificationsDetail_.violationType == 0
          ? null
          : notificationsDetail_.violationType;

      var FromformatDate = notificationsDetail_.fromDate.replace(/\//g, "-");
      var ToformatDate = notificationsDetail_.toDate.replace(/\//g, "-");
      var notificationsDetails = JSON.stringify({
        centerTypeCode: notificationsDetail_.centerTypeCode,
        fromDate: FromformatDate,
        toDate: ToformatDate,
        locale: bodyLocale,
        emirateCode: notificationsDetail_.emirateCode,
        centerCode: notificationsDetail_.centerCode,
        violationType: vioCode
      });

      console.log(notificationsDetails);

      return $http({
        method: "POST",
        url: wURL,
        data: notificationsDetails,
        headers: { "Content-Type": "application/json" }
      }).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //jobs/center/3/violation/2
    var getEmailTemplate = function(centerTypeCode, vioCode) {
      var wURL =
        url_Noti + "jobs/center/" + centerTypeCode + "/violation/" + vioCode;
      return $http.get(wURL).then(
        function(response) {
          console.log(wURL);
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //jobs/center/3/conf
    var getEmailConfig = function(centerTypeCode) {
      var wURL = url_Noti + "jobs/center/" + centerTypeCode + "/conf";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //jobs/updatejobconf
    var updateEmail = function(emailConfig) {
      var wURL = url_Noti + "jobs/updatejobconf";
      return $http({
        method: "PUT",
        url: wURL,
        headers: { "Content-Type": "application/json" },
        data: emailConfig
      }).then(
        function(response) {
          console.log(response.status);
          return response;
        },
        function(error) {
          return error;
        }
      );
    };

    var getCenterType = function() {
      var wURL = url_Noti + "jobs/" + bodyLocale + "/centers";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    return {
      passCenterType: passCenterType,
      getViolationsTypes: getViolationsTypes,
      postNotifications: postNotifications,
      postNotificationsDetails: postNotificationsDetails,
      getEmailTemplate: getEmailTemplate,
      getEmailConfig: getEmailConfig,
      updateEmail: updateEmail
    };
  };

  var $apiFines = function($http) {
    if ($("body").attr("dir") === "rtl") {
      //ar
      bodyLocale = "ar";
    }

    //violation/searchViolation
    var postFines = function(fines_) {
      var wURL = url_Noti + "violation/searchViolation";
      var FromformatDate = fines_.fromDate.replace(/\//g, "-");
      var ToformatDate = fines_.toDate.replace(/\//g, "-");
      var fines = JSON.stringify({
        centerTypeCode: fines_.centerTypeCode,
        fromDate: FromformatDate,
        toDate: ToformatDate,
        emirateCode: fines_.emirateCode,
        branchId: fines_.branchId
      });
      console.log(fines);

      return $http({
        method: "POST",
        url: wURL,
        data: fines,
        headers: { "Content-Type": "application/json" }
      }).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //violation/searchViolationDetail
    var postFinesDetails = function(fineDetail_) {
      var wURL = url_Noti + "violation/searchViolationDetail";

      var FromformatDate = fineDetail_.fromDate.replace(/\//g, "-");
      var ToformatDate = fineDetail_.toDate.replace(/\//g, "-");
      var finesDetails = JSON.stringify({
        centerTypeCode: fineDetail_.centerTypeCode,
        fromDate: FromformatDate,
        toDate: ToformatDate,
        locale: bodyLocale,
        emirateCode: fineDetail_.emirateCode,
        branchId: fineDetail_.centerCode
      });

      console.log(finesDetails);

      return $http({
        method: "POST",
        url: wURL,
        data: finesDetails,
        headers: { "Content-Type": "application/json" }
      }).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //branchInfo/1
    var getBranchById = function(bId) {
      var wURL = url_branchDetail + "branchInfo/" + bId;
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //violation/ar/fines
    var getViolationsTypesForFines = function() {
      var wURL = url_Noti + "violation/" + bodyLocale + "/fines";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //violation/ar/fineDetails/1
    var getSUB_ViolationsTypesForFines = function(fineId) {
      var wURL =
        url_Noti + "violation/" + bodyLocale + "/fineDetails/" + fineId;
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //violation/ar/actions
    var getViolationActions = function() {
      var wURL = url_Noti + "violation/" + bodyLocale + "/actions";
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //violation/addviolation
    var addFine = function(fine_) {
      var wURL = url_Noti + "violation/addviolation";

      var newFine_ = JSON.stringify({
        branchId: fine_.branchId,
        emirateCode: fine_.emirateCode,
        emirateName: fine_.emirateName,
        ownerName: fine_.ownerName,
        referenceNo: fine_.referenceNo,
        propertyNumber: fine_.propertyNumber,
        centerName: fine_.centerName,
        centerCode: fine_.centerCode,
        tradeLicenseExpDate: fine_.tradeLicenseExpDate,
        valueBankGuarantee: fine_.valueBankGuarantee,
        dateLicense: fine_.dateLicense,
        unpaidCharges: fine_.unpaidCharges,
        restSysMinistry: fine_.restSysMinistry,
        numPreviousViolations: fine_.numPreviousViolations,
        centerTypeCode: fine_.centerTypeCode,
        list: [
          {
            violationDetail: fine_.list[0].violationDetail,
            violationTypeDetailId: fine_.list[0].violationTypeDetailId,
            violationDate: fine_.list[0].violationDate,
            violationAction: fine_.list[0].violationAction,
            notes: fine_.list[0].notes,
            amount: fine_.list[0].amount
          }
        ]
      });
      return $http({
        method: "POST",
        url: wURL,
        data: newFine_,
        headers: { "Content-Type": "application/json" },
        transformResponse: [
          function(data) {
            return data;
          }
        ]
      }).then(
        function(response) {
          return response;
        },
        function(error) {
          return error;
        }
      );
    };

    //violation/id/211
    var getFineById = function(id) {
      var wURL = url_Noti + "violation/id/" + id;
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    //violation/ar/violationdetails/211
    var getFineDetailsById = function(id) {
      var wURL =
        url_Noti + "violation/" + bodyLocale + "/violationdetails/" + id;
      return $http.get(wURL).then(
        function(response) {
          return response.data;
        },
        function(error) {
          return error.data;
        }
      );
    };

    return {
      postFines: postFines,
      postFinesDetails: postFinesDetails,
      getBranchById: getBranchById,
      getViolationsTypesForFines: getViolationsTypesForFines,
      getSUB_ViolationsTypesForFines: getSUB_ViolationsTypesForFines,
      getViolationActions: getViolationActions,
      addFine: addFine,
      getFineById: getFineById,
      getFineDetailsById: getFineDetailsById
    };
  };

  var module = angular.module("MainModule");
  module.factory("$api", $api);

  //notifications service
  module.factory("$apiNoti", $apiNoti);

  //fines service
  module.factory("$apiFines", $apiFines);
})();
