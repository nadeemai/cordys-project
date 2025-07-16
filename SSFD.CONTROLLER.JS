UPDATED CODE 5

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, Fragment, MessageBox,formatter) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        formatter: formatter,

        onInit: function () {
            // Initialize attachment model
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");

            // Initialize router and route handlers
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);
            oRouter.getRoute("SanctionfdRef").attachPatternMatched(this._onRouteSanctionfdwithRef, this);
            oRouter.getRoute("SanctionfdRefApproved").attachPatternMatched(this._onRouteSanctionfdApproved, this);

            // Initialize remarks dialog
            this.remarksDialog = sap.ui.xmlfragment(this.getView().getId(), "com.mmapprovalhub.approvalhub.Fragments.remarks", this);
            this.getView().addDependent(this.remarksDialog);

            // Initialize view model
            var oViewModel = new JSONModel({
                enableRowActions: true,
                approvebuttonvisiblity: false,
                approvebuttonfragment: false,
                rejetedbuttonfragmnet: false,
                enableIRR: false,
                enableFinalAccount: false,
                enableFinalAccountInput: false,
                sendbackbuttonvisiblity: false,
                remarkModel: "",
                approverRequiredVisible: false,
                currentUserRole: "",
                isApproverScreen: false,
                enableRowActionsapproval: false,
                uploadiconvisiblity:false,
                // relese button
                releasebuttonvisibility: false
            });
            this.getView().setModel(oViewModel, "viewenableddatacheck");

            // Initialize timeline model
            var oTimelineData = {};
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");

        },

        // Formatter for subType display
        formatSubType: function (sSubType) {
            var mSubTypeMap = {
                "NR": "New Requirement",
                "CON": "Contingency",
                "ILT": "Interline Transfer",
                "BCF": "Budget Carry-Forward",
                "SAVING": "Savings",
                "ITH": "Interhead Transfer",
                "COR": "Cost Over-Run",
                "PPA": "Preproject Approval",
                "CBCF": "Capex Budget Carry-Forward",
                "OTH": "Others"
            };
            return mSubTypeMap[sSubType] || sSubType || "N/A";
        },
        // formatUserDisplay
        formatUserDisplay: function (uploadedByID, uploadedByName, currentUser) {
            if (uploadedByID && uploadedByName) {
                return uploadedByID + " - " + uploadedByName;
            } else if (currentUser && currentUser.userID && currentUser.name) {
                return currentUser.userID + " - " + currentUser.name;
            } else {
                return "";
            }
        },

        _onRouteSanctionfdApproved: function (oEvent) {
            this._ApprovedCheck = "";
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this.onGetCurrUserforUploadon();

            this._ApprovedCheck = oArgs.approved;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function (oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);

                        
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that.stagesData = oData.results[0].stage;
                        that._onSubType = oData.results[0].ssfdDtl.subType || "";

                        var oViewModel = that.getView().getModel("viewenableddatacheck");

                        // Handle visibility for Final Accounts stage with Pending status
                        if (that.stagesData === "Final Accounts" && that.statusData === "Pending") {
                            oViewModel.setProperty("/enableFinalAccount", true);
                            oViewModel.setProperty("/enableFinalAccountInput", true);
                            oViewModel.setProperty("/releasebuttonvisibility", true); // Show Release button
                            oViewModel.setProperty("/approvebuttonvisiblity", false); // Hide Approve button
                            oViewModel.setProperty("/sendbackbuttonvisiblity", false); // Hide Send Back button
                            oViewModel.setProperty("/approverRequired PORVisible", true); // Assuming this is for WBS/Cost Center
                            oViewModel.setProperty("/isApproverScreen", true);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                            oViewModel.setProperty("/uploadiconvisiblity", true);
                        } else {
                            oViewModel.setProperty("/enableFinalAccount", false);
                            oViewModel.setProperty("/enableFinalAccountInput", false);
                            oViewModel.setProperty("/releasebuttonvisibility", false); // Hide Release button by default
                        }
                        // Existing logic for other statuses
                        if (statusDatacheck === "Draft" || !statusDatacheck) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/uploadiconvisiblity", true);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/sendbackbuttonvisiblity", false);
                            oViewModel.setProperty("/releasebuttonvisibility", false); // Ensure Release is hidden
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/sendbackbuttonvisiblity", false);
                            oViewModel.setProperty("/releasebuttonvisibility", false); // Ensure Release is hidden
                            oViewModel.setProperty("/approverRequiredVisible", that._ApprovedCheck === "Approved");
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                            oViewModel.setProperty("/uploadiconvisiblity", true);
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/sendbackbuttonvisiblity", false);
                            oViewModel.setProperty("/releasebuttonvisibility", false); // Ensure Release is hidden
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                            oViewModel.setProperty("/uploadiconvisiblity", false);

                        }

                        // Handle Approver-specific logic for non-Final Accounts stages
                        if (that._ApprovedCheck === "Approved" && (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD")) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", that.stagesData !== "Final Accounts"); // Hide Approve in Final Accounts
                            oViewModel.setProperty("/sendbackbuttonvisiblity", that.stagesData !== "Final Accounts"); // Hide Send Back in Final Accounts
                            oViewModel.setProperty("/releasebuttonvisibility", that.stagesData === "Final Accounts"); // Show Release only in Final Accounts
                            oViewModel.setProperty("/approverRequiredVisible", true);
                            var costoverrunShowApprover = oData.results[0].ssfdDtl.subType;
                            if (that.stagesData === "GM PMO" && costoverrunShowApprover === "COR") {
                                oViewModel.setProperty("/isApproverScreen", true);
                                oViewModel.setProperty("/enableRowActionsapproval", true);
                            } else {
                                oViewModel.setProperty("/isApproverScreen", false);
                                oViewModel.setProperty("/enableRowActionsapproval", false);
                            }
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/sendbackbuttonvisiblity", false);
                            oViewModel.setProperty("/releasebuttonvisibility", false); // Ensure Release is hidden
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                            oViewModel.setProperty("/uploadiconvisiblity", false);

                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onBudgetDetailDataFetch(reqID);
                       
                        that.onAttchmentDataFetch();
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function (oError) {
                    MessageToast.show("Failed to load request data.", { position: "bottom center" });
                    console.error("Error fetching request data:", oError);
                }
            });
        },

        _onRouteSanctionfdwithRef: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = "";
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function (oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that._onSubType = oData.results[0].ssfdDtl.subType || "";

                        var oViewModel = that.getView().getModel("viewenableddatacheck");
                        if (statusDatacheck === "Draft" || !statusDatacheck || statusDatacheck === "Send Back") {
                            oViewModel.setProperty("/enableRowActions", true);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                            oViewModel.setProperty("/uploadiconvisiblity", true);

                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                            oViewModel.setProperty("/uploadiconvisiblity", false);

                        } else if (statusDatacheck === "Approved") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                            oViewModel.setProperty("/uploadiconvisiblity", false);

                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onBudgetDetailDataFetch(reqID);
                        that.onGetCurrUserforUploadonInitiator();
                        that.onAttchmentDataFetch();
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function (oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        _onRouteSanctionfdController: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var onInitiateValue = localStorage.getItem("onInitiateValue");
            var onInitiateValueData = "";
            if (onInitiateValue === "New Requirement") {
                onInitiateValueData = "NR";
            } else if (onInitiateValue === "Contingency") {
                onInitiateValueData = "CON";
            } else if (onInitiateValue === "Interline Transfer") {
                onInitiateValueData = "ILT";
            } else if (onInitiateValue === "Budget Carry-Forward") {
                onInitiateValueData = "BCF";
            } else if (onInitiateValue === "Savings") {
                onInitiateValueData = "SAVING";
            } else if (onInitiateValue === "Interhead Transfer") {
                onInitiateValueData = "ITH";
            } else if (onInitiateValue === "Cost Over-Run") {
                onInitiateValueData = "COR";
            } else if (onInitiateValue === "Preproject Approval") {
                onInitiateValueData = "PPA";
            } else if (onInitiateValue === "Capex Budget Carry-Forward") {
                onInitiateValueData = "CBCF";
            } else if (onInitiateValue === "Others") {
                onInitiateValueData = "OTH";
            }
            this._onSubType = onInitiateValueData;
            this._reqIDData = "";
            this._ApprovedCheck = "";
            var oViewModel = this.getView().getModel("viewenableddatacheck");
            oViewModel.setProperty("/enableRowActions", true);
            oViewModel.setProperty("/enableIRR", false);
            oViewModel.setProperty("/approverRequiredVisible", false);
            oViewModel.setProperty("/isApproverScreen", false);
            oViewModel.setProperty("/enableRowActionsapproval", false);
            oViewModel.setProperty("/uploadiconvisiblity", true);

            // Clear attachments when selecting a new request
            var oAttachmentModel = this.getView().getModel("UploadDocSrvTabData");
            oAttachmentModel.setProperty("/attachments", []);

            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Revenue Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Personnel Cost", amount: 0, contingency: 0, total: 0 },
                    { nature: "Total", amount: 0, contingency: 0, total: 0 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");

            var oRequestServiceModel = this.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
            this.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
            var oEmptyData = {
                reqID: "",
                refNo: "",
                requesterName: "",
                department: "",
                market: "",
                location: "",
                hod: "",
                ssfdDtl: {
                    subType: this._onSubType,
                    division: "FD",
                    puDept: "",
                    hod: "",
                    loc: "",
                    projName: "",
                    itemRequiredDesc: "",
                    budgetRequired: 0,
                    irr: "",
                    market: "",
                    implDt: null,
                    enggHours: "",
                    remarks: "",
                    background: "",
                    justification: "",
                    deliverables: "",
                    capitalBudget: 0,
                    revenueBudget: 0,
                    personnelCost: 0,
                    selectedApprover: ""
                }
            };
            oRequestServiceModel.setData(oEmptyData);
            this.onDepartmentDataFetch();
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch();
            this.onGetCurrUserforUploadonInitiator();

        },

        onBudgetDetailDataFetch: function (reqID) {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            var subtype = this._onSubType;
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];

            sap.ui.core.BusyIndicator.show(0);
            oModelV2.read("/ReqFormFD('" + reqID + "')", {
                success: function (oData) {
                    if (oData.items && Array.isArray(oData.items)) {
                        oData.items.forEach(function (item) {
                            if (item.nature !== "Total") {
                                var amount = parseFloat(item.amount || 0);
                                if (item.nature === "Capital Budget" && validSubTypes.includes(subtype) && amount > 0) {
                                    item.contingency = parseFloat((amount * 0.05).toFixed(2));
                                    item.total = parseFloat((amount + item.contingency).toFixed(2));
                                } else {
                                    item.contingency = 0;
                                    item.total = parseFloat(amount.toFixed(2));
                                }
                            }
                        });

                        // Recalculate total row
                        var totalAmount = 0, totalContingency = 0, totalFinal = 0;
                        oData.items.forEach(function (item) {
                            if (item.nature !== "Total") {
                                totalAmount += parseFloat(item.amount || 0);
                                totalContingency += parseFloat(item.contingency || 0);
                                totalFinal += parseFloat(item.total || 0);
                            }
                        });

                        oData.items.forEach(function (item) {
                            if (item.nature === "Total") {
                                item.amount = parseFloat(totalAmount.toFixed(2));
                                item.contingency = parseFloat(totalContingency.toFixed(2));
                                item.total = parseFloat(totalFinal.toFixed(2));
                            }
                        });

                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "budgetModel");
                        that._updateIRREnabledState(totalFinal);
                    }
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Error fetching budget data:", oError);
                    MessageToast.show("Failed to fetch budget data.", { position: "bottom center" });
                }
            });
        },

        _updateIRREnabledState: function (totalBudget) {
            var enableIRR = (totalBudget * 100000) > 30000000;
            this.getView().getModel("viewenableddatacheck").setProperty("/enableIRR", enableIRR);
            if (!enableIRR) {
                this.getView().byId("inputIRR").setValue("");
            }
        },

        onFetchTimelinessData: function () {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");

            oModelV2.read("/ProcessLogs", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                urlParameters: {
                    "$orderby": "createdAt desc"
                },
                success: function (oData) {
                    if (oData && oData.results) {
                        var aProcessedData = oData.results.map(function (oLog) {
                            var statusKey = oLog.status ? oLog.status.trim().toUpperCase() : "";
                            var visualStatus = "None";
           
                    switch (statusKey) {
                        case "APPROVED":
                        case "SUBMITTED":
                            visualStatus = "Success";
                            break;
                        case "PENDING":
                            visualStatus = "Warning";  
                            break;
                         
                        case "SEND BACK":
                            visualStatus = "Error";    
                            break;
                        case "INITIATED":
                            visualStatus = "Success";    
                            break;
                        case "":
                            visualStatus = "None";    
                            break;    
                        default:
                            visualStatus = "None";    
                            break;
                    }
           
                            return {
                                createdAt: oLog.createdAt,
                                role: oLog.stage ? "[" + oLog.stage + "]" : "[N/A]",
                                userName: oLog.userName || "Unknown User",
                                userEmail: oLog.userEmail || "N/A",
                                remarks: oLog.remarks || "",
                                status: visualStatus
                            };
                        });

                        var initiatorIndex = aProcessedData.findIndex(function (item) {
                            return item.role.toLowerCase().includes("initiator");
                        });

                        if (initiatorIndex > -1) {
                            var initiatorEntry = aProcessedData.splice(initiatorIndex, 1)[0];
                            aProcessedData.push(initiatorEntry);
                        }

                        var oJSONModel = new JSONModel({
                            results: aProcessedData
                        });
                        oView.setModel(oJSONModel, "timelinesslogdata");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load process log data.", { position: "bottom center" });
                    console.error("Error fetching timeliness data:", oError);
                }
            });
        },

        formatTimelineTitle: function (role, userName, userEmail) {
            return role + " " + userName + " (" + userEmail + ")";
        },

        formatDateTimeWithRemarks: function(createdAt, remarks) {
            if (!createdAt) return "";
            const oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                style: "medium",
                strictParsing: true,
                UTC: false
            });
            const sDate = oDateFormat.format(new Date(createdAt));
            if (!remarks || remarks.trim() === "") {
                return sDate + " - Not Yet Approved";
            }
           
            return sDate;
          },
          onAttchmentDataFetch: function () {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
 
            oModelV2.read("/ReqAttachments", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function (oData) {
                    if (oData && oData.results) {
                        var oJSONModel = new JSONModel({
                            attachments: oData.results
                        });
                        oView.setModel(oJSONModel, "UploadDocSrvTabData");
                    }
                },
                error: function (oError) {
                    MessageToast.show("Failed to load attachment data.", { position: "bottom center" });
                    console.error("Error fetching attachment data:", oError);
                }
            });
        },

        // onAttchmentDataFetch: function () {
        //     var reqid = this._reqIDData;
        //     var oView = this.getView();
        //     var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");

        //     // Define date formatter here
        //     var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
        //         pattern: "dd-MM-yyyy "
        //     });
        //     var that = this;
        //     var oCurrentUser = oView.getModel("CurrentUser").getProperty("/user") || {};
        //     oModelV2.read("/ReqAttachments", {
        //         filters: [
        //             new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
        //         ],
        //         success: function (oData) {
        //             if (oData && oData.results) {
        //                 var aAttachments = oData.results.map(function (item) {
        //                     return {
        //                         ID: item.ID,
        //                         fileName: item.fileName,
        //                         // formatUserDisplay
        //                         createdBy: that.formatUserDisplay(item.uploadedByID, item.uploadedByName, oCurrentUser),
        //                         createdBy: item.uploadedByName || "",
        //                         createdAt: item.createdAt ? oDateFormat.format(new Date(item.createdAt)) : "",
        //                         deleteTabVisible: true,
        //                         content: item.content
        //                     };
        //                     // if(item.createdBy){
        //                     //     item.createdBy = item.uploadedByName
        //                     // }
        //                 });

        //                 var oJSONModel = new sap.ui.model.json.JSONModel({
        //                     attachments: aAttachments
        //                 });
        //                 oView.setModel(oJSONModel, "UploadDocSrvTabData");
        //             }
        //         },
        //         error: function (oError) {
        //             sap.m.MessageToast.show("Failed to load attachment data.", {
        //                 position: "bottom center"
        //             });
        //             console.error("Error fetching attachment data:", oError);
        //         }
        //     });
        // },

        onHODDataFetch: function () {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                urlParameters: {
                    "$filter": "department eq 'SSFD' and role eq 'HOD'"
                },
                success: function (oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function (oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        onDepartmentDataFetch: function () {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_DEPARTMENT'"
                },
                success: function (oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSDEPARTMENTData");
                    }
                },
                error: function (oError) {
                    MessageToast.show("Failed to load department data.", { position: "bottom center" });
                    console.error("Error fetching department data:", oError);
                }
            });
        },

        onMarketDataFetch: function () {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_MARKET'"
                },
                success: function (oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSMARKETDataFetch");
                    }
                },
                error: function (oError) {
                    MessageToast.show("Failed to load market data.", { position: "bottom center" });
                    console.error("Error fetching market data:", oError);
                }
            });
        },

        onLocationDataFetch: function () {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_LOCATION'"
                },
                success: function (oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                    }
                },
                error: function (oError) {
                    MessageToast.show("Failed to load location data.", { position: "bottom center" });
                    console.error("Error fetching location data:", oError);
                }
            });
        },

        onDashboardui: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else if (this._SanctionfdNameUI === "SSFD") {
                oRouter.navTo("DashboardUI", { Name: "SSFD" });
            }
        },

        onCancelSanctionform: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            MessageToast.show("Navigating back to dashboard...", { position: "bottom center" });
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else {
                oRouter.navTo("DashboardUI", { Name: this._SanctionfdNameUI });
            }
        },

        attachmentuploadFilesData: function (reqid) {
            var oView = this.getView();
            var oModelTabdata = oView.getModel("UploadDocSrvTabData");
            var aFilesData = oModelTabdata.getProperty("/attachments") || [];
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
         
            // Get the current user info (from your model)
            var oCurrentUser = oView.getModel("CurrentUser").getProperty("/user") || {};
         
            sap.ui.core.BusyIndicator.show(0);
         
            var oTable = this.byId("SSFDattachmenttable");
            var aItems = oTable.getItems();
         
            aFilesData.forEach(function (file, index) {
              if (!file.fileName || file.uploaded) return;
              var oItem = aItems[index];
              var oDCBox = oItem.getCells()[1];
              var selectedCategory = oDCBox && oDCBox.getSelectedKey ? oDCBox.getSelectedKey() : "";
         
              if (file.content && typeof file.content === "string" && file.content.includes(',')) {
                var base64Content = file.content.split(',')[1];
         
                var payload = {
                  fileName: file.fileName,
                  doc_Category: selectedCategory,
                  content: base64Content,
                  mediaType: file.mimeType || "text/plain",
                  reqID: reqid,
         
                  // Add uploader details
                  uploadedByName: oCurrentUser.name || "",
                  uploadedByID: oCurrentUser.userID || ""
                };
         
                oModel.create("/ReqAttachments", payload, {
                  success: function () {
                    file.uploaded = true;
                    oModelTabdata.refresh(true);
                    sap.ui.core.BusyIndicator.hide();
                  },
                  error: function (oError) {
                    MessageToast.show("Error uploading attachment: " + file.fileName, { position: "bottom center" });
                    console.error("Error uploading attachment:", oError);
                    sap.ui.core.BusyIndicator.hide();
                  }
                });
              }
            });
        },

        formatDateOnly: function (uploadedOn, createdAt) {
            var sDate = uploadedOn || createdAt;
            if (!sDate) return "";
         
            var oDate = new Date(sDate);
            var day = String(oDate.getDate()).padStart(2, "0");
            var month = oDate.toLocaleString("en-US", { month: "short" });
            var year = oDate.getFullYear();
         
            return `${day}-${month}-${year}`;
          },

        _calculateBudgetItems: function (aBudgetItems, subType) {
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
            var totalAmount = 0, totalContingency = 0, totalFinal = 0;

            aBudgetItems.forEach(function (item) {
                if (item.nature !== "Total") {
                    var amount = parseFloat(item.amount || 0);
                    if (item.nature === "Capital Budget" && validSubTypes.includes(subType) && amount > 0) {
                        item.contingency = parseFloat((amount * 0.05).toFixed(2));
                        item.total = parseFloat((amount + item.contingency).toFixed(2));
                    } else {
                        item.contingency = 0;
                        item.total = parseFloat(amount.toFixed(2));
                    }
                    totalAmount += amount;
                    totalContingency += item.contingency;
                    totalFinal += item.total;
                }
            });

            aBudgetItems.forEach(function (item) {
                if (item.nature === "Total") {
                    item.amount = parseFloat(totalAmount.toFixed(2));
                    item.contingency = parseFloat(totalContingency.toFixed(2));
                    item.total = parseFloat(totalFinal.toFixed(2));
                }
            });

            return aBudgetItems;
        },

        onSaveSanctionform: function () {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            var subType = this._onSubType;
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var reqid = this._reqIDData;
            var statusData = this.statusData || "Draft";
            var satauscheckdata = statusData === "Pending" ? "Pending" : "Draft";
            if (statusData === "Sent Back") {
                satauscheckdata = "Sent Back";
            }
            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSavePayload = {
                stage: "Initiator",
                status: satauscheckdata,
                type: "SSFD",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if (!reqid) {
                oModel.create("/Requests", oSavePayload, {
                    success: function (oData) {
                        that._reqIDData = oData.reqID;
                        var reqID = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        MessageBox.success("Request saved successfully!");
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function (oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSavePayload, {
                    success: function () {
                        that.attachmentuploadFilesData(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                        MessageBox.success("Request updated successfully!");
                    },
                    error: function (oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onConfirmSave: function () {
            var oView = this.getView();
            var oFormData = {
                location: oView.byId("comboLocation_Senca").getSelectedKey(),
                budget: oView.byId("BudgetValue").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("department_sensce").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                attachments: oView.getModel("UploadDocSrvTabData").getProperty("/attachments"),
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };
            MessageToast.show("Form data and attachments saved.", { position: "bottom center" });
            this._oSaveDialog.close();
        },

        onCancelSave: function () {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.", { position: "bottom center" });
        },

        onSubmitSanctionform: function () {
            var isValid = true;
            var oView = this.getView();
            var controls = [
                { control: oView.byId("comboLocation_Senca"), field: "Location" },
                { control: oView.byId("department_sensce"), field: "Department" },
                { control: oView.byId("comboMarket_Senca"), field: "Market" },
                { control: oView.byId("Hod_SanctionData"), field: "HOD" },
                { control: oView.byId("inputHour"), field: "Engineering Hours" },
                { control: oView.byId("inputProjectName"), field: "Project Name" },
                { control: oView.byId("inputItemRequired"), field: "Item Required/Description" },
                { control: oView.byId("_IDGenTextArea"), field: "Background/Current Scenario" },
                { control: oView.byId("_IDGenTextArea1"), field: "Proposal/Justification" },
                { control: oView.byId("_IDGenTextArea2"), field: "Deliverables" },
                { control: oView.byId("dateImplement"), field: "Implementation Date" }
            ];

            var missingFields = [];

            controls.forEach(function (item) {
                item.control.setValueState("None");
                var control = item.control;
                var value = control.getValue ? control.getValue().trim() : control.getSelectedKey();
                if (!value) {
                    item.control.setValueState("None");
                    isValid = false;
                    missingFields.push(item.field);
                } else if (item.control.getId().includes("inputHour")) {
                    var hours = parseFloat(value);
                    if (isNaN(hours) || hours <= 0) {
                        item.control.setValueState("None");
                        isValid = false;
                        missingFields.push(item.field + " (must be a positive number)");
                    }
                }
            });

            if (!isValid) {
                var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
                MessageBox.error(errorMessage);
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", false);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", true);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onComboBoxChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sValue = oEvent.getParameter("newValue") || oComboBox.getValue();
            var aItems = oComboBox.getItems();
            var bValid = aItems.some(function (oItem) {
                return oItem.getKey() === sValue || oItem.getText() === sValue;
            });

            oComboBox.setValueState(bValid ? "None" : "Error");
            if (!bValid) {
                MessageToast.show("Please select a valid option from the dropdown.", { position: "bottom center" });
            }
        },

        onBudgetAmountChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var fValue = parseFloat(sNewValue);
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];

            if (isNaN(fValue) || fValue < 0) {
                oInput.setValueState("Error");
                MessageToast.show("Budget amount cannot be negative.", { position: "bottom center" });
                return;
            }
            oInput.setValueState("None");

            aItems[iIndex].amount = fValue || 0;
            if (aItems[iIndex].nature === "Capital Budget" && validSubTypes.includes(this._onSubType) && fValue > 0) {
                aItems[iIndex].contingency = Number((aItems[iIndex].amount * 0.05).toFixed(2));
            } else {
                aItems[iIndex].contingency = 0;
            }
            aItems[iIndex].total = Number((aItems[iIndex].amount + aItems[iIndex].contingency).toFixed(2));
            // Recalculate total row
            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount || 0;
                iTotalContingency += aItems[i].contingency || 0;
            }

            aItems[3].amount = Number(iTotalAmount.toFixed(2));
            aItems[3].contingency = Number(iTotalContingency.toFixed(2));
            aItems[3].total = Number((iTotalAmount + iTotalContingency).toFixed(2));

            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
            this.getView().byId("BudgetValue").setValue(aItems[3].total.toString());
            this._updateIRREnabledState(aItems[3].total);
        },

        onHoursChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var value = oEvent.getParameter("value");
            oInput.setValueState("None");

            if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                oInput.setValueState("Error");
                MessageToast.show("Engineering Hours must be a positive number.", { position: "bottom center" });
            }
        },

        onHodSanctionChange: function (oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onDepartmentSanctionChange: function (oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onMarketSenca: function (oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onLocationSenca: function (oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onApprovedSanctionform: function () {
            var oView = this.getView();
            var isValid = true;
            var missingFields = [];

            // Validate Engineering Hours
            var hours = oView.byId("inputHour");
            hours.setValueState("None");
            var hoursValue = hours.getValue();
            if (!hoursValue || isNaN(parseFloat(hoursValue)) || parseFloat(hoursValue) <= 0) {
                hours.setValueState("Error");
                isValid = false;
                missingFields.push("Engineering Hours (must be a positive number)");
            }

            // Validate Approver selection only when _ApprovedCheck is "Approved"
            if (this._ApprovedCheck === "Approved") {
                var approver = oView.byId("approverRequiredFrom");
                approver.setValueState("None");
                var approverValue = approver.getSelectedKey();
                if (!approverValue) {
                    approver.setValueState("Error");
                    approver.setValueStateText("Approver selection is required.");
                    isValid = false;
                    missingFields.push("Approver");
                }
            }

            // Validate WBS Code and Cost Center for Final Accounts stage
            if (this.stagesData === "Final Accounts" && this._ApprovedCheck === "Approved") {
                var wbsInput = oView.byId("wbsInput");
                var costCenterInput = oView.byId("costCenterInput");

                // Validate WBS Code
                wbsInput.setValueState("None");
                var wbsValue = wbsInput.getValue().trim();
                if (!wbsValue) {
                    wbsInput.setValueState("Error");
                    wbsInput.setValueStateText("WBS Code is required for Final Accounts.");
                    isValid = false;
                    missingFields.push("WBS Code");
                }

                // Validate Cost Center
                costCenterInput.setValueState("None");
                var costCenterValue = costCenterInput.getValue().trim();
                if (!costCenterValue) {
                    costCenterInput.setValueState("Error");
                    costCenterInput.setValueStateText("Cost Center is required for Final Accounts.");
                    isValid = false;
                    missingFields.push("Cost Center");
                }
            }

            // Show error if validation fails
            // if (!isValid) {
            //     var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
            //     MessageBox.error(errorMessage);
            //     return;
            // }

            // Set model properties and open remarks dialog
            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", true);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", true);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onRejectDataSanctionForm: function () {
            var oView = this.getView();
            var hours = oView.byId("inputHour");
            hours.setValueState("None");

            if (!hours.getValue() || isNaN(parseFloat(hours.getValue())) || parseFloat(hours.getValue()) <= 0) {
                hours.setValueState("Error");
                MessageBox.error("Please enter valid Engineering Hours (must be a positive number).");
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", true);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", true);
            this.remarksDialog.open();
        },

        onCloseReamrksFrag: function () {
            this.remarksDialog.close();
        },

        onRejectedData: function () {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Reject.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                stage: "Rejected",
                status: "Rejected",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.rejecteddatacheckRejected(oData.reqID);
                    },
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function () {
                        sap.ui.core.BusyIndicator.hide();
                        that.rejecteddatacheckRejected(reqid);
                    },
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        rejecteddatacheckRejected: function (reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "REJECT",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function () {
                    MessageBox.success("Request rejected successfully!", {
                        onClose: function () {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function (oError) {
                    MessageToast.show("Error rejecting request.", { position: "bottom center" });
                    console.error("Error rejecting request:", oError);
                }
            });
        },

        onSendbackData: function () {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function (oData) {
                        that._reqIDData = oData.reqID;
                        that.sendbackdatacheckApproved(oData.reqID);
                        that.attachmentuploadFilesData(oData.reqID);
                    },
                    error: function (oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function () {
                        that.sendbackdatacheckApproved(reqid);
                        that.attachmentuploadFilesData(reqid);
                    },
                    error: function (oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onApprovedData: function () {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Approve.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                WBSNumber: oView.byId("wbsInput").getValue() || "",
                costCentre: oView.byId("costCenterInput").getValue() || "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function (oData) {
                        that._reqIDData = oData.reqID;
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(oData.reqID);
                        that.attachmentuploadFilesData(oData.reqID);
                    },
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function () {
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(reqid);
                        that.attachmentuploadFilesData(reqid);

                    },
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onSubmitReamrksData: function () {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var subtypedata = this._onSubType;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subtypedata);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                subType: subtypedata,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : ""
            };

            var oSubmitPayload = {
                stage: "HOD",
                status: "Pending",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var reqID = oData.reqID;
                        that.approverdatacheck(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function () {
                        sap.ui.core.BusyIndicator.hide();
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacheck(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        sendbackdatacheckApproved: function (reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SENT BACK",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function () {
                    MessageBox.success("Request Sent Back successfully!", {
                        onClose: function () {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function (oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheckApproved: function (reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "APPROVE",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function () {
                    MessageBox.success("Request approved successfully!", {
                        onClose: function () {
                            if (that._ApprovedCheck === "Approved") {
                                sap.ui.core.BusyIndicator.hide();
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function (oError) {
                    // console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheck: function (reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SUBMIT",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function (oData) {
                    MessageBox.success(oData.SSFDApproval?.message || "Request submitted successfully!", {
                        onClose: function () {
                            if (that._SanctionfdNameUI === "SSFD") {
                                sap.ui.core.BusyIndicator.hide();
                                that.getOwnerComponent().getRouter().navTo("DashboardUI", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error submitting request.", { position: "bottom center" });
                    console.error("Error submitting request:", oError);
                }
            });
        },

        onReleaseSanctionform: function () {
            var oView = this.getView();
            var reqid = this._reqIDData;
            // var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            // if (!remarkInput) {
            //     MessageBox.information("Please provide a remark before releasing.");
            //     return;
            // }
            var isValid = true;
            var controls = [
                { control: oView.byId("wbsInput"), field: "WBS Number" },
                { control: oView.byId("costCenterInput"), field: "Cost Center" },
            ]
            var missingFields = [];

            controls.forEach(function (item) {
                item.control.setValueState("None");
                var control = item.control;
                var value = control.getValue ? control.getValue().trim() : control.getSelectedKey();
                if (!value) {
                    item.control.setValueState("Error");
                    isValid = false;
                    missingFields.push(item.field);
                } else if (item.control.getId().includes("inputHour")) {
                    var hours = parseFloat(value);
                    if (isNaN(hours) || hours <= 0) {
                        item.control.setValueState("Error");
                        isValid = false;
                        missingFields.push(item.field + " (must be a positive number)");
                    }
                }
            });

            if (!isValid) {
                var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
                MessageBox.error(errorMessage);
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: "",
                WBSNumber: oView.byId("wbsInput").getValue() || "",
                costCentre: oView.byId("costCenterInput").getValue() || "",
                subType: this._onSubType
            };

            var oReleasePayload = {
                stage: "Released",
                status: "Released",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModel.update("/Requests('" + reqid + "')", oReleasePayload, {
                success: function () {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.success("Request released successfully!", {
                        onClose: function () {
                            var oRouter = that.getOwnerComponent().getRouter();
                            oRouter.navTo("approverdashboard", { Name: "SSFD" });
                        }
                    });
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error releasing request: " + oError.message, { position: "bottom center" });
                    console.error("Error releasing request:", oError);
                }
            });
        },

        // onGetCurrUserforUploadon: function() {
        //     var that = this;
        //     var oModel = this.getOwnerComponent().getModel("approvalservicev2");

        //     oModel.read("/getCurrentUser", {
        //         urlParameters: {
        //             role: 'Initiator',
        //             dept: 'SSFD'
        //         },
        //         success: function(oData) {
        //             that.uploadbyEmail = oData.email;
        //             var oUserModel = new sap.ui.model.json.JSONModel(oData);
        //             that.getView().setModel(oUserModel, "CurrentUser");
        //         },
        //         error: function(oError) {
        //             console.error("Error fetching current user:", oError);
        //         }
        //     });
        // },

        onGetCurrUserforUploadonInitiator: function () {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");

            oModel.read("/getCurrentUser", {
                urlParameters: {
                    role: 'Initiator',
                    dept: 'SSFD'
                },
                success: function (oData) {
                    that.uploadbyEmail = oData.email;
                    var oUserModel = new sap.ui.model.json.JSONModel({ user: oData });
                    that.getView().setModel(oUserModel, "CurrentUser");
                },
                error: function (oError) {
                    console.error("Error fetching current user:", oError);
                }
            });
        },

        // onUploadTabAttchmment: function (oEvent) {
        //     const oFileUploader = oEvent.getSource();
        //     const aFiles = oEvent.getParameter("files");
        //     if (!aFiles || aFiles.length === 0) {
        //         MessageToast.show("No files selected.", { position: "bottom center" });
        //         return;
        //     }

        //     const oModel = this.getView().getModel("UploadDocSrvTabData");
        //     const oUserModel = this.getOwnerComponent().getModel("approvalservicev2");
        //     const aAttachments = oModel.getProperty("/attachments") || [];
        //     const sUploadedOn = new Date().toISOString().split("T")[0];
        //     const that = this;

        //     oUserModel.callFunction("/getCurrentUser", {
        //         method: "GET",
        //         urlParameters: {
        //             role: "Initiator"
        //         },
        //         success: function (oData) {
        //             const sUploadedBy = oData && oData.name ? oData.name : "Unknown";

        //             for (let i = 0; i < aFiles.length; i++) {
        //                 (function (file, index) {
        //                     const oReader = new FileReader();
        //                     oReader.onload = function (e) {
        //                         const sBase64Data = e.target.result;

        //                         aAttachments.push({
        //                             ID: new Date().getTime().toString() + index,
        //                             fileName: file.name,
        //                             // formatUserDisplay
        //                             createdBy: that.formatUserDisplay(oData.userID, sUploadedBy, oData),
        //                             mimeType: file.type,
        //                             content: sBase64Data,
        //                             createdBy: sUploadedBy,
        //                             createdAt: sUploadedOn,
        //                             deleteTabVisible: true
        //                         });

        //                         if (index === aFiles.length - 1) {
        //                             oModel.setProperty("/attachments", aAttachments);
        //                             oModel.refresh(true);
        //                             MessageToast.show("Files uploaded: " + aFiles.length, { position: "bottom center" });
        //                             oFileUploader.setValue("");
        //                         }
        //                     };
        //                     oReader.onerror = function () {
        //                         MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
        //                     };
        //                     oReader.readAsDataURL(file);
        //                 })(aFiles[i], i);
        //             }
        //         },
        //         error: function () {
        //             MessageToast.show("Failed to fetch current user.", { position: "bottom center" });
        //         }
        //     });
        // },


        onUploadTabAttchmment: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oEvent.getParameter("files");
            var uploadby = this.uploadbyEmail;
            if (!aFiles || aFiles.length === 0) {
              MessageToast.show("No files selected.", { position: "bottom center" });
              return;
            }
       
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
       
            for (var i = 0; i < aFiles.length; i++) {
              (function (file, index) {
                var oReader = new FileReader();
                oReader.onload = function (e) {
                  var sBase64Data = e.target.result;
                  aAttachments.push({
                    ID: new Date().getTime().toString() + index,
                    fileName: file.name,
                    mimeType: file.type,
                    content: sBase64Data,
                    uploadedBy: uploadby,
                    uploadedOn: sUploadedOn,
                    deleteTabVisible: true
                  });
       
                  if (index === aFiles.length - 1) {
                    oModel.setProperty("/attachments", aAttachments);
                    oModel.refresh(true);
                    MessageToast.show("Files uploaded: " + aFiles.length, { position: "bottom center" });
                    oFileUploader.setValue("");
                  }
                };
                oReader.onerror = function () {
                  MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                };
                oReader.readAsDataURL(file);
              })(aFiles[i], i);
            }
          },

        onUploadPress: function () {
            var oFileUploader = this.byId("fileUploaderTabAttchment");
            var aFiles = oFileUploader.getDomRef().files;

            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("Please select at least one file first.", { position: "bottom center" });
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var sUploadedBy = "Current User";

            aAttachments = aAttachments.filter(function (item) {
                return !item.temp;
            });

            for (var i = 0; i < aFiles.length; i++) {
                (function (file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function (e) {
                        var sBase64Data = e.target.result;
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            createdBy: sUploadedBy,
                            createdAt: sUploadedOn,
                            deleteTabVisible: true,
                            content: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true);
                            MessageToast.show("Uploaded " + aFiles.length + " file(s) successfully!", { position: "bottom center" });
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function () {
                        MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                    };
                    oReader.readAsDataURL(file);
                })(aFiles[i], i);
            }
        },

        onDownloadTabAttachemnt: function (oEvent) {
            var oButton = oEvent.getSource();
            var sID = oButton.getCustomData().find(function (oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var sFileName = oButton.getCustomData().find(function (oData) {
                return oData.getKey() === "fileName";
            }).getValue();

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var oAttachment = aAttachments.find(function (oItem) {
                return oItem.ID === sID;
            });

            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.read(sPath, {
                success: function (oData) {
                    if (oData && oData.__metadata && oData.__metadata.media_src) {
                        var oLink = document.createElement("a");
                        oLink.href = oData.__metadata.media_src;
                        oLink.download = sFileName;
                        document.body.appendChild(oLink);
                        oLink.click();
                        document.body.removeChild(oLink);
                        MessageToast.show("Downloading file from server: " + sFileName, { position: "bottom center" });
                    } else {
                        that._downloadLocalAttachment(oAttachment, sFileName);
                    }
                },
                error: function () {
                    that._downloadLocalAttachment(oAttachment, sFileName);
                }
            });
        },

        _downloadBase64File: function (sBase64Content, sFileName) {
            try {
                var sBase64Data = sBase64Content.split(',')[1];
                var sMimeType = sBase64Content.split(';')[0].split(':')[1];
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var oBlob = new Blob([byteArray], { type: sMimeType });
                var sUrl = URL.createObjectURL(oBlob);

                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName, { position: "bottom center" });
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName, { position: "bottom center" });
                console.error("Error downloading file:", e);
            }
        },

        _downloadLocalAttachment: function (oAttachment, sFileName) {
            if (!oAttachment || !oAttachment.content) {
                MessageToast.show("Local file content not found for: " + sFileName, { position: "bottom center" });
                return;
            }
            this._downloadBase64File(oAttachment.content, sFileName);
        },

        onDeleteTabAttchment: function (oEvent) {
            var oButton = oEvent.getSource();
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments");
            var sID = oButton.getCustomData().find(function (oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var iIndex = aAttachments.findIndex(function (oItem) {
                return oItem.ID === sID;
            });
            if (iIndex === -1) return;

            var sFileName = aAttachments[iIndex].fileName;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.remove(sPath, {
                success: function () {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                },
                error: function (oError) {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                }
            });
        },

        _removeAttachmentFromLocalModel: function (oModel, aAttachments, iIndex, sFileName) {
            aAttachments.splice(iIndex, 1);
            oModel.setProperty("/attachments", aAttachments);
            oModel.refresh(true);
        },

        handleLiveChangeLimit1500: function (oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oTextArea.getValue();

            if (sValue.length > 1500) {
                oTextArea.setValue(sValue.substring(0, 1500));
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 1500 characters allowed.");
            } else {
                oTextArea.setValueState("None");
            }
        },

        handleRemarkChangeLimit4000: function (oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oTextArea.getValue();

            if (sValue.length > 4000) {
                oTextArea.setValue(sValue.substring(0, 4000));
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 4000 characters allowed.");
            } else {
                oTextArea.setValueState("None");
            }
        },

        onTextInputLiveChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var filteredValue = sValue.replace(/[^a-zA-Z0-9]/g, '');

            if (filteredValue !== sValue) {
                oInput.setValue(filteredValue);
            }
            if (filteredValue) {
                oInput.setValueState("None");
                oInput.setValueStateText("");
            }
        },

        onGetCurrUserforUploadon: function () {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
       
            oModel.read("/getCurrentUser", {
              urlParameters: {
                dept: 'NBBudget'
              },
              success: function (oData) {
                that.uploadbyEmail = oData.email;
                var oUserModel = new sap.ui.model.json.JSONModel({ user: oData });
                that.getView().setModel(oUserModel, "CurrentUser");
              },
              error: function (oError) {
                console.error("Error fetching current user:", oError);
              }
            });
          },
    });
});

UPDATE CODE 4

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, Fragment, MessageBox) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize attachment model
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");

            // Initialize router and route handlers
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);
            oRouter.getRoute("SanctionfdRef").attachPatternMatched(this._onRouteSanctionfdwithRef, this);
            oRouter.getRoute("SanctionfdRefApproved").attachPatternMatched(this._onRouteSanctionfdApproved, this);

            // Initialize remarks dialog
            this.remarksDialog = sap.ui.xmlfragment(this.getView().getId(), "com.mmapprovalhub.approvalhub.Fragments.remarks", this);
            this.getView().addDependent(this.remarksDialog);

            // Initialize view model
            var oViewModel = new JSONModel({
                enableRowActions: true,
                approvebuttonvisiblity: false,
                approvebuttonfragment: false,
                rejetedbuttonfragmnet: false,
                enableIRR: false,
                enableFinalAccount: false,
                enableFinalAccountInput: false,
                sendbackbuttonvisiblity: false,
                remarkModel: "",
                approverRequiredVisible: false,
                currentUserRole: "",
                isApproverScreen: false,
                enableRowActionsapproval: false
            });
            this.getView().setModel(oViewModel, "viewenableddatacheck");

            // Initialize timeline model
            var oTimelineData = {};
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");

            this.onGetCurrUserforUploadon();
        },

        // Formatter for subType display
        formatSubType: function(sSubType) {
            var mSubTypeMap = {
                "NR": "New Requirement",
                "CON": "Contingency",
                "ILT": "Interline Transfer",
                "BCF": "Budget Carry-Forward",
                "SAVING": "Savings",
                "ITH": "Interhead Transfer",
                "COR": "Cost Over-Run",
                "PPA": "Preproject Approval",
                "CBCF": "Capex Budget Carry-Forward",
                "OTH": "Others"
            };
            return mSubTypeMap[sSubType] || sSubType || "N/A";
        },

        _onRouteSanctionfdApproved: function(oEvent) {
            this._ApprovedCheck = "";
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = oArgs.approved;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that.stagesData = oData.results[0].stage;
                        that._onSubType = oData.results[0].ssfdDtl.subType || "";

                        var oViewModel = that.getView().getModel("viewenableddatacheck");

                        if (that.stagesData === "Final Accounts" && that.statusData === "Pending") {
                            oViewModel.setProperty("/enableFinalAccount", true);
                            oViewModel.setProperty("/enableFinalAccountInput", true);
                        } else {
                            oViewModel.setProperty("/enableFinalAccount", false);
                            oViewModel.setProperty("/enableFinalAccountInput", false);
                        }

                        if (statusDatacheck === "Draft" || !statusDatacheck) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", that._ApprovedCheck === "Approved");
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        if (that._ApprovedCheck === "Approved" && (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD")) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", true);
                            oViewModel.setProperty("/approverRequiredVisible", true);
                            var costoverrunShowApprover = oData.results[0].ssfdDtl.subType;
                            if (that.stagesData === "GM PMO" && costoverrunShowApprover === "COR") {
                                oViewModel.setProperty("/isApproverScreen", true);
                                oViewModel.setProperty("/enableRowActionsapproval", true);
                            } else {
                                oViewModel.setProperty("/isApproverScreen", false);
                                oViewModel.setProperty("/enableRowActionsapproval", false);
                            }
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load request data.", { position: "bottom center" });
                    console.error("Error fetching request data:", oError);
                }
            });
        },

        _onRouteSanctionfdwithRef: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = "";
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that._onSubType = oData.results[0].ssfdDtl.subType || "";

                        var oViewModel = that.getView().getModel("viewenableddatacheck");
                        if (statusDatacheck === "Draft" || !statusDatacheck || statusDatacheck === "Send Back") {
                            oViewModel.setProperty("/enableRowActions", true);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Approved") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var onInitiateValue = localStorage.getItem("onInitiateValue");
            var onInitiateValueData = "";
            if (onInitiateValue === "New Requirement") {
                onInitiateValueData = "NR";
            } else if (onInitiateValue === "Contingency") {
                onInitiateValueData = "CON";
            } else if (onInitiateValue === "Interline Transfer") {
                onInitiateValueData = "ILT";
            } else if (onInitiateValue === "Budget Carry-Forward") {
                onInitiateValueData = "BCF";
            } else if (onInitiateValue === "Savings") {
                onInitiateValueData = "SAVING";
            } else if (onInitiateValue === "Interhead Transfer") {
                onInitiateValueData = "ITH";
            } else if (onInitiateValue === "Cost Over-Run") {
                onInitiateValueData = "COR";
            } else if (onInitiateValue === "Preproject Approval") {
                onInitiateValueData = "PPA";
            } else if (onInitiateValue === "Capex Budget Carry-Forward") {
                onInitiateValueData = "CBCF";
            } else if (onInitiateValue === "Others") {
                onInitiateValueData = "OTH";
            }
            this._onSubType = onInitiateValueData;
            this._reqIDData = "";
            this._ApprovedCheck = "";
            var oViewModel = this.getView().getModel("viewenableddatacheck");
            oViewModel.setProperty("/enableRowActions", true);
            oViewModel.setProperty("/enableIRR", false);
            oViewModel.setProperty("/approverRequiredVisible", false);
            oViewModel.setProperty("/isApproverScreen", false);
            oViewModel.setProperty("/enableRowActionsapproval", false);

            // Clear attachments when selecting a new request
            var oAttachmentModel = this.getView().getModel("UploadDocSrvTabData");
            oAttachmentModel.setProperty("/attachments", []);

            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Revenue Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Personnel Cost", amount: 0, contingency: 0, total: 0 },
                    { nature: "Total", amount: 0, contingency: 0, total: 0 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");

            var oRequestServiceModel = this.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
            this.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
            var oEmptyData = {
                reqID: "",
                refNo: "",
                requesterName: "",
                department: "",
                market: "",
                location: "",
                hod: "",
                ssfdDtl: {
                    subType: this._onSubType,
                    division: "FD",
                    puDept: "",
                    hod: "",
                    loc: "",
                    projName: "",
                    itemRequiredDesc: "",
                    budgetRequired: 0,
                    irr: "",
                    market: "",
                    implDt: null,
                    enggHours: "",
                    remarks: "",
                    background: "",
                    justification: "",
                    deliverables: "",
                    capitalBudget: 0,
                    revenueBudget: 0,
                    personnelCost: 0,
                    selectedApprover: ""
                }
            };
            oRequestServiceModel.setData(oEmptyData);
            this.onDepartmentDataFetch();
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch();
        },

        onBudgetDetailDataFetch: function(reqID) {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            var subtype = this._onSubType;
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];

            sap.ui.core.BusyIndicator.show(0);
            oModelV2.read("/ReqFormFD('" + reqID + "')", {
                success: function(oData) {
                    if (oData.items && Array.isArray(oData.items)) {
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                var amount = parseFloat(item.amount || 0);
                                if (item.nature === "Capital Budget" && validSubTypes.includes(subtype) && amount > 0) {
                                    item.contingency = parseFloat((amount * 0.05).toFixed(2));
                                    item.total = parseFloat((amount + item.contingency).toFixed(2));
                                } else {
                                    item.contingency = 0;
                                    item.total = parseFloat(amount.toFixed(2));
                                }
                            }
                        });

                        // Recalculate total row
                        var totalAmount = 0, totalContingency = 0, totalFinal = 0;
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                totalAmount += parseFloat(item.amount || 0);
                                totalContingency += parseFloat(item.contingency || 0);
                                totalFinal += parseFloat(item.total || 0);
                            }
                        });

                        oData.items.forEach(function(item) {
                            if (item.nature === "Total") {
                                item.amount = parseFloat(totalAmount.toFixed(2));
                                item.contingency = parseFloat(totalContingency.toFixed(2));
                                item.total = parseFloat(totalFinal.toFixed(2));
                            }
                        });

                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "budgetModel");
                        that._updateIRREnabledState(totalFinal);
                    }
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Error fetching budget data:", oError);
                    MessageToast.show("Failed to fetch budget data.", { position: "bottom center" });
                }
            });
        },

        _updateIRREnabledState: function(totalBudget) {
            var enableIRR = (totalBudget * 100000) > 30000000;
            this.getView().getModel("viewenableddatacheck").setProperty("/enableIRR", enableIRR);
            if (!enableIRR) {
                this.getView().byId("inputIRR").setValue("");
            }
        },

        onFetchTimelinessData: function() {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");

            oModelV2.read("/ProcessLogs", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                urlParameters: {
                    "$orderby": "createdAt desc"
                },
                success: function(oData) {
                    if (oData && oData.results) {
                        var aProcessedData = oData.results.map(function(oLog) {
                            return {
                                createdAt: oLog.createdAt,
                                role: oLog.stage ? "[" + oLog.stage + "]" : "[N/A]",
                                userName: oLog.userName || "Unknown User",
                                userEmail: oLog.userEmail || "N/A",
                                remarks: oLog.remarks || "Yet to be Approved"
                            };
                        });

                        var initiatorIndex = aProcessedData.findIndex(function(item) {
                            return item.role.toLowerCase().includes("initiator");
                        });

                        if (initiatorIndex > -1) {
                            var initiatorEntry = aProcessedData.splice(initiatorIndex, 1)[0];
                            aProcessedData.push(initiatorEntry);
                        }

                        var oJSONModel = new JSONModel({
                            results: aProcessedData
                        });
                        oView.setModel(oJSONModel, "timelinesslogdata");
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load process log data.", { position: "bottom center" });
                    console.error("Error fetching timeliness data:", oError);
                }
            });
        },

        formatTimelineTitle: function(role, userName, userEmail) {
            return role + " " + userName + " (" + userEmail + ")";
        },

        onAttchmentDataFetch: function () {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
        
            // Define date formatter here
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "dd-MM-yyyy "
            });
        
            oModelV2.read("/ReqAttachments", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function (oData) {
                    if (oData && oData.results) {
                        var aAttachments = oData.results.map(function (item) {
                            return {
                                ID: item.ID,
                                fileName: item.fileName,
                                createdBy: item.createdBy || "anonymous",
                                createdAt: item.createdAt ? oDateFormat.format(new Date(item.createdAt)) : "",
                                deleteTabVisible: true,
                                content: item.content
                            };
                        });
        
                        var oJSONModel = new sap.ui.model.json.JSONModel({
                            attachments: aAttachments
                        });
                        oView.setModel(oJSONModel, "UploadDocSrvTabData");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load attachment data.", {
                        position: "bottom center"
                    });
                    console.error("Error fetching attachment data:", oError);
                }
            });
        },        

        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                urlParameters: {
                    "$filter": "department eq 'SSFD' and role eq 'HOD'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        onDepartmentDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_DEPARTMENT'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSDEPARTMENTData");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load department data.", { position: "bottom center" });
                    console.error("Error fetching department data:", oError);
                }
            });
        },

        onMarketDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_MARKET'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSMARKETDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load market data.", { position: "bottom center" });
                    console.error("Error fetching market data:", oError);
                }
            });
        },

        onLocationDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_LOCATION'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load location data.", { position: "bottom center" });
                    console.error("Error fetching location data:", oError);
                }
            });
        },

        onDashboardui: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else if (this._SanctionfdNameUI === "SSFD") {
                oRouter.navTo("DashboardUI", { Name: "SSFD" });
            }
        },

        onCancelSanctionform: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            MessageToast.show("Navigating back to dashboard...", { position: "bottom center" });
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else {
                oRouter.navTo("DashboardUI", { Name: this._SanctionfdNameUI });
            }
        },

        attachmentuploadFilesData: function(reqid) {
            var oModelTabdata = this.getView().getModel("UploadDocSrvTabData");
            var aFilesData = oModelTabdata.getProperty("/attachments") || [];
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            sap.ui.core.BusyIndicator.show(0);

            aFilesData.forEach(function(file) {
                if (!file.fileName || file.uploaded) return;

                if (file.content && typeof file.content === "string" && file.content.includes(',')) {
                    var base64Content = file.content.split(',')[1];
                    var payload = {
                        fileName: file.fileName,
                        content: base64Content,
                        mediaType: file.mimeType || "text/plain",
                        reqID: reqid
                    };

                    oModel.create("/ReqAttachments", payload, {
                        success: function() {
                            file.uploaded = true;
                            oModelTabdata.refresh(true);
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function(oError) {
                            MessageToast.show("Error uploading attachment: " + file.fileName, { position: "bottom center" });
                            console.error("Error uploading attachment:", oError);
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
            });
        },

        _calculateBudgetItems: function(aBudgetItems, subType) {
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
            var totalAmount = 0, totalContingency = 0, totalFinal = 0;

            aBudgetItems.forEach(function(item) {
                if (item.nature !== "Total") {
                    var amount = parseFloat(item.amount || 0);
                    if (item.nature === "Capital Budget" && validSubTypes.includes(subType) && amount > 0) {
                        item.contingency = parseFloat((amount * 0.05).toFixed(2));
                        item.total = parseFloat((amount + item.contingency).toFixed(2));
                    } else {
                        item.contingency = 0;
                        item.total = parseFloat(amount.toFixed(2));
                    }
                    totalAmount += amount;
                    totalContingency += item.contingency;
                    totalFinal += item.total;
                }
            });

            aBudgetItems.forEach(function(item) {
                if (item.nature === "Total") {
                    item.amount = parseFloat(totalAmount.toFixed(2));
                    item.contingency = parseFloat(totalContingency.toFixed(2));
                    item.total = parseFloat(totalFinal.toFixed(2));
                }
            });

            return aBudgetItems;
        },

        onSaveSanctionform: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            var subType = this._onSubType;
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var reqid = this._reqIDData;
            var statusData = this.statusData || "Draft";
            var satauscheckdata = statusData === "Pending" ? "Pending" : "Draft";
            if (statusData === "Sent Back") {
                satauscheckdata = "Sent Back";
            }
            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSavePayload = {
                stage: "Initiator",
                status: satauscheckdata,
                type: "SSFD",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if (!reqid) {
                oModel.create("/Requests", oSavePayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        var reqID = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        MessageBox.success("Request saved successfully!");
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSavePayload, {
                    success: function() {
                        that.attachmentuploadFilesData(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                        MessageBox.success("Request updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                location: oView.byId("comboLocation_Senca").getSelectedKey(),
                budget: oView.byId("BudgetValue").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("department_sensce").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                attachments: oView.getModel("UploadDocSrvTabData").getProperty("/attachments"),
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };
            MessageToast.show("Form data and attachments saved.", { position: "bottom center" });
            this._oSaveDialog.close();
        },

        onCancelSave: function() {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.", { position: "bottom center" });
        },

        onSubmitSanctionform: function() {
            var isValid = true;
            var oView = this.getView();
            var controls = [
                { control: oView.byId("comboLocation_Senca"), field: "Location" },
                { control: oView.byId("department_sensce"), field: "Department" },
                { control: oView.byId("comboMarket_Senca"), field: "Market" },
                { control: oView.byId("Hod_SanctionData"), field: "HOD" },
                { control: oView.byId("inputHour"), field: "Engineering Hours" },
                { control: oView.byId("inputProjectName"), field: "Project Name" },
                { control: oView.byId("inputItemRequired"), field: "Item Required/Description" },
                { control: oView.byId("_IDGenTextArea"), field: "Background/Current Scenario" },
                { control: oView.byId("_IDGenTextArea1"), field: "Proposal/Justification" },
                { control: oView.byId("_IDGenTextArea2"), field: "Deliverables" },
                { control: oView.byId("dateImplement"), field: "Implementation Date" }
            ];

            var missingFields = [];

            controls.forEach(function(item) {
                item.control.setValueState("None");
                var control = item.control;
                var value = control.getValue ? control.getValue().trim() : control.getSelectedKey();
                if (!value) {
                    item.control.setValueState("None");
                    isValid = false;
                    missingFields.push(item.field);
                } else if (item.control.getId().includes("inputHour")) {
                    var hours = parseFloat(value);
                    if (isNaN(hours) || hours <= 0) {
                        item.control.setValueState("None");
                        isValid = false;
                        missingFields.push(item.field + " (must be a positive number)");
                    }
                }
            });

            if (!isValid) {
                var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
                MessageBox.error(errorMessage);
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", false);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", true);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onComboBoxChange: function(oEvent) {
            var oComboBox = oEvent.getSource();
            var sValue = oEvent.getParameter("newValue") || oComboBox.getValue();
            var aItems = oComboBox.getItems();
            var bValid = aItems.some(function(oItem) {
                return oItem.getKey() === sValue || oItem.getText() === sValue;
            });

            oComboBox.setValueState(bValid ? "None" : "Error");
            if (!bValid) {
                MessageToast.show("Please select a valid option from the dropdown.", { position: "bottom center" });
            }
        },

        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var fValue = parseFloat(sNewValue);
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
        
            if (isNaN(fValue) || fValue < 0) {
                oInput.setValueState("Error");
                MessageToast.show("Budget amount cannot be negative.", { position: "bottom center" });
                return;
            }
            oInput.setValueState("None");
        
            aItems[iIndex].amount = fValue || 0;
            if (aItems[iIndex].nature === "Capital Budget" && validSubTypes.includes(this._onSubType) && fValue > 0) {
                aItems[iIndex].contingency = Number((aItems[iIndex].amount * 0.05).toFixed(2));
            } else {
                aItems[iIndex].contingency = 0;
            }
            aItems[iIndex].total = Number((aItems[iIndex].amount + aItems[iIndex].contingency).toFixed(2));
        
            // Recalculate total row
            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount || 0;
                iTotalContingency += aItems[i].contingency || 0;
            }
        
            aItems[3].amount = Number(iTotalAmount.toFixed(2));
            aItems[3].contingency = Number(iTotalContingency.toFixed(2));
            aItems[3].total = Number((iTotalAmount + iTotalContingency).toFixed(2));
        
            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
            this.getView().byId("BudgetValue").setValue(aItems[3].total.toString());
            this._updateIRREnabledState(aItems[3].total);
        },

        onHoursChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var value = oEvent.getParameter("value");
            oInput.setValueState("None");

            if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                oInput.setValueState("Error");
                MessageToast.show("Engineering Hours must be a positive number.", { position: "bottom center" });
            }
        },

        onHodSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onDepartmentSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onMarketSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onLocationSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onApprovedSanctionform: function() {
            var oView = this.getView();
            var isValid = true;
            var missingFields = [];

            // Validate Engineering Hours
            var hours = oView.byId("inputHour");
            hours.setValueState("None");
            var hoursValue = hours.getValue();
            if (!hoursValue || isNaN(parseFloat(hoursValue)) || parseFloat(hoursValue) <= 0) {
                hours.setValueState("Error");
                isValid = false;
                missingFields.push("Engineering Hours (must be a positive number)");
            }

            // Validate Approver selection only when _ApprovedCheck is "Approved"
            if (this._ApprovedCheck === "Approved") {
                var approver = oView.byId("approverRequiredFrom");
                approver.setValueState("None");
                var approverValue = approver.getSelectedKey();
                if (!approverValue) {
                    approver.setValueState("Error");
                    approver.setValueStateText("Approver selection is required.");
                    isValid = false;
                    missingFields.push("Approver");
                }
            }

            // Validate WBS Code and Cost Center for Final Accounts stage
            if (this.stagesData === "Final Accounts" && this._ApprovedCheck === "Approved") {
                var wbsInput = oView.byId("wbsInput");
                var costCenterInput = oView.byId("costCenterInput");

                // Validate WBS Code
                wbsInput.setValueState("None");
                var wbsValue = wbsInput.getValue().trim();
                if (!wbsValue) {
                    wbsInput.setValueState("Error");
                    wbsInput.setValueStateText("WBS Code is required for Final Accounts.");
                    isValid = false;
                    missingFields.push("WBS Code");
                }

                // Validate Cost Center
                costCenterInput.setValueState("None");
                var costCenterValue = costCenterInput.getValue().trim();
                if (!costCenterValue) {
                    costCenterInput.setValueState("Error");
                    costCenterInput.setValueStateText("Cost Center is required for Final Accounts.");
                    isValid = false;
                    missingFields.push("Cost Center");
                }
            }

            // Show error if validation fails
            // if (!isValid) {
            //     var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
            //     MessageBox.error(errorMessage);
            //     return;
            // }

            // Set model properties and open remarks dialog
            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", true);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", true);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onRejectDataSanctionForm: function() {
            var oView = this.getView();
            var hours = oView.byId("inputHour");
            hours.setValueState("None");

            if (!hours.getValue() || isNaN(parseFloat(hours.getValue())) || parseFloat(hours.getValue()) <= 0) {
                hours.setValueState("Error");
                MessageBox.error("Please enter valid Engineering Hours (must be a positive number).");
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", true);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", true);
            this.remarksDialog.open();
        },

        onCloseReamrksFrag: function() {
            this.remarksDialog.close();
        },

        onRejectedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Reject.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                stage: "Rejected",
                status: "Rejected",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.rejecteddatacheckRejected(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.rejecteddatacheckRejected(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        rejecteddatacheckRejected: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "REJECT",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request rejected successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    MessageToast.show("Error rejecting request.", { position: "bottom center" });
                    console.error("Error rejecting request:", oError);
                }
            });
        },

        onSendbackData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        that.sendbackdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        that.sendbackdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onApprovedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Approve.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                WBSNumber: oView.byId("wbsInput").getValue() || "",
                costCentre: oView.byId("costCenterInput").getValue() || "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onSubmitReamrksData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var subtypedata = this._onSubType;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subtypedata);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                subType: subtypedata,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : ""
            };

            var oSubmitPayload = {
                stage: "HOD",
                status: "Pending",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var reqID = oData.reqID;
                        that.approverdatacheck(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacheck(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        sendbackdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SENT BACK",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request Sent Back successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "APPROVE",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request approved successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                sap.ui.core.BusyIndicator.hide();
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheck: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SUBMIT",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success(oData.SSFDApproval?.message || "Request submitted successfully!", {
                        onClose: function() {
                            if (that._SanctionfdNameUI === "SSFD") {
                                sap.ui.core.BusyIndicator.hide();
                                that.getOwnerComponent().getRouter().navTo("DashboardUI", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error submitting request.", { position: "bottom center" });
                    console.error("Error submitting request:", oError);
                }
            });
        },

        onUploadTabAttchmment: function(oEvent) {
            const oFileUploader = oEvent.getSource();
            const aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("No files selected.", { position: "bottom center" });
                return;
            }

            const oModel = this.getView().getModel("UploadDocSrvTabData");
            const oUserModel = this.getOwnerComponent().getModel("approvalservicev2");
            const aAttachments = oModel.getProperty("/attachments") || [];
            const sUploadedOn = new Date().toISOString().split("T")[0];
            const that = this;

            oUserModel.callFunction("/getCurrentUser", {
                method: "GET",
                urlParameters: {
                    role: "Initiator"
                },
                success: function(oData) {
                    const sUploadedBy = oData && oData.name ? oData.name : "Unknown";

                    for (let i = 0; i < aFiles.length; i++) {
                        (function(file, index) {
                            const oReader = new FileReader();
                            oReader.onload = function(e) {
                                const sBase64Data = e.target.result;

                                aAttachments.push({
                                    ID: new Date().getTime().toString() + index,
                                    fileName: file.name,
                                    mimeType: file.type,
                                    content: sBase64Data,
                                    createdBy: sUploadedBy,
                                    createdAt: sUploadedOn,
                                    deleteTabVisible: true
                                });

                                if (index === aFiles.length - 1) {
                                    oModel.setProperty("/attachments", aAttachments);
                                    oModel.refresh(true);
                                    MessageToast.show("Files uploaded: " + aFiles.length, { position: "bottom center" });
                                    oFileUploader.setValue("");
                                }
                            };
                            oReader.onerror = function() {
                                MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                            };
                            oReader.readAsDataURL(file);
                        })(aFiles[i], i);
                    }
                },
                error: function() {
                    MessageToast.show("Failed to fetch current user.", { position: "bottom center" });
                }
            });
        },

        onUploadPress: function() {
            var oFileUploader = this.byId("fileUploaderTabAttchment");
            var aFiles = oFileUploader.getDomRef().files;

            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("Please select at least one file first.", { position: "bottom center" });
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var sUploadedBy = "Current User";

            aAttachments = aAttachments.filter(function(item) {
                return !item.temp;
            });

            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result;
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            createdBy: sUploadedBy,
                            createdAt: sUploadedOn,
                            deleteTabVisible: true,
                            content: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true);
                            MessageToast.show("Uploaded " + aFiles.length + " file(s) successfully!", { position: "bottom center" });
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                    };
                    oReader.readAsDataURL(file);
                })(aFiles[i], i);
            }
        },

        onDownloadTabAttachemnt: function(oEvent) {
            var oButton = oEvent.getSource();
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var sFileName = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "fileName";
            }).getValue();

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.read(sPath, {
                success: function(oData) {
                    if (oData && oData.__metadata && oData.__metadata.media_src) {
                        var oLink = document.createElement("a");
                        oLink.href = oData.__metadata.media_src;
                        oLink.download = sFileName;
                        document.body.appendChild(oLink);
                        oLink.click();
                        document.body.removeChild(oLink);
                        MessageToast.show("Downloading file from server: " + sFileName, { position: "bottom center" });
                    } else {
                        that._downloadLocalAttachment(oAttachment, sFileName);
                    }
                },
                error: function() {
                    that._downloadLocalAttachment(oAttachment, sFileName);
                }
            });
        },

        _downloadBase64File: function(sBase64Content, sFileName) {
            try {
                var sBase64Data = sBase64Content.split(',')[1];
                var sMimeType = sBase64Content.split(';')[0].split(':')[1];
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var oBlob = new Blob([byteArray], { type: sMimeType });
                var sUrl = URL.createObjectURL(oBlob);

                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName, { position: "bottom center" });
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName, { position: "bottom center" });
                console.error("Error downloading file:", e);
            }
        },

        _downloadLocalAttachment: function(oAttachment, sFileName) {
            if (!oAttachment || !oAttachment.content) {
                MessageToast.show("Local file content not found for: " + sFileName, { position: "bottom center" });
                return;
            }
            this._downloadBase64File(oAttachment.content, sFileName);
        },

        onDeleteTabAttchment: function(oEvent) {
            var oButton = oEvent.getSource();
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments");
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var iIndex = aAttachments.findIndex(function(oItem) {
                return oItem.ID === sID;
            });
            if (iIndex === -1) return;

            var sFileName = aAttachments[iIndex].fileName;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.remove(sPath, {
                success: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                },
                error: function(oError) {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                }
            });
        },

        _removeAttachmentFromLocalModel: function(oModel, aAttachments, iIndex, sFileName) {
            aAttachments.splice(iIndex, 1);
            oModel.setProperty("/attachments", aAttachments);
            oModel.refresh(true);
        },

        handleLiveChangeLimit1500: function(oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oTextArea.getValue();

            if (sValue.length > 1500) {
                oTextArea.setValue(sValue.substring(0, 1500));
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 1500 characters allowed.");
            } else {
                oTextArea.setValueState("None");
            }
        },

        handleRemarkChangeLimit4000: function(oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oTextArea.getValue();

            if (sValue.length > 4000) {
                oTextArea.setValue(sValue.substring(0, 4000));
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 4000 characters allowed.");
            } else {
                oTextArea.setValueState("None");
            }
        },

        onTextInputLiveChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var filteredValue = sValue.replace(/[^a-zA-Z0-9]/g, '');

            if (filteredValue !== sValue) {
                oInput.setValue(filteredValue);
            }
            if (filteredValue) {
                oInput.setValueState("None");
                oInput.setValueStateText("");
            }
        },

        onGetCurrUserforUploadon: function () {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
        
            oModel.read("/getCurrentUser", {
                urlParameters: {
                    role: 'Initiator',
                    dept: 'SSFD'
                },
                success: function (oData) {
                    that.uploadbyEmail = oData.email;
                    var oUserModel = new sap.ui.model.json.JSONModel(oData);
                    that.getView().setModel(oUserModel, "CurrentUser");
                },
                error: function (oError) {
                    console.error("Error fetching current user:", oError);
                }
            });
        }
    });
});
UPDATED CODE 3

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, Fragment, MessageBox) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize attachment model
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");

            // Initialize router and route handlers
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);
            oRouter.getRoute("SanctionfdRef").attachPatternMatched(this._onRouteSanctionfdwithRef, this);
            oRouter.getRoute("SanctionfdRefApproved").attachPatternMatched(this._onRouteSanctionfdApproved, this);

            // Initialize remarks dialog
            this.remarksDialog = sap.ui.xmlfragment(this.getView().getId(), "com.mmapprovalhub.approvalhub.Fragments.remarks", this);
            this.getView().addDependent(this.remarksDialog);

            // Initialize view model
            var oViewModel = new JSONModel({
                enableRowActions: true,
                approvebuttonvisiblity: false,
                approvebuttonfragment: false,
                rejetedbuttonfragmnet: false,
                enableIRR: false,
                enableFinalAccount: false,
                enableFinalAccountInput: false,
                sendbackbuttonvisiblity: false,
                remarkModel: "",
                approverRequiredVisible: false,
                currentUserRole: "",
                isApproverScreen: false,
                enableRowActionsapproval: false
            });
            this.getView().setModel(oViewModel, "viewenableddatacheck");

            // Initialize timeline model
            var oTimelineData = {};
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");

            this.onGetCurrUserforUploadon();
        },

        // Formatter for subType display
        formatSubType: function(sSubType) {
            var mSubTypeMap = {
                "NR": "New Requirement",
                "CON": "Contingency",
                "ILT": "Interline Transfer",
                "BCF": "Budget Carry-Forward",
                "SAVING": "Savings",
                "ITH": "Interhead Transfer",
                "COR": "Cost Over-Run",
                "PPA": "Preproject Approval",
                "CBCF": "Capex Budget Carry-Forward",
                "OTH": "Others"
            };
            return mSubTypeMap[sSubType] || sSubType || "N/A";
        },

        _onRouteSanctionfdApproved: function(oEvent) {
            this._ApprovedCheck = "";
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = oArgs.approved;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that.stagesData = oData.results[0].stage;

                        var oViewModel = that.getView().getModel("viewenableddatacheck");

                        if (that.stagesData === "Final Accounts" && that.statusData === "Pending") {
                            oViewModel.setProperty("/enableFinalAccount", true);
                            oViewModel.setProperty("/enableFinalAccountInput", true);
                        } else {
                            oViewModel.setProperty("/enableFinalAccount", false);
                            oViewModel.setProperty("/enableFinalAccountInput", false);
                        }

                        if (statusDatacheck === "Draft" || !statusDatacheck) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", that._ApprovedCheck === "Approved");
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        if (that._ApprovedCheck === "Approved" && (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD")) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", true);
                            oViewModel.setProperty("/approverRequiredVisible", true);
                            var costoverrunShowApprover = oData.results[0].ssfdDtl.subType;
                            if (that.stagesData === "GM PMO" && costoverrunShowApprover === "COR") {
                                oViewModel.setProperty("/isApproverScreen", true);
                                oViewModel.setProperty("/enableRowActionsapproval", true);
                            } else {
                                oViewModel.setProperty("/isApproverScreen", false);
                                oViewModel.setProperty("/enableRowActionsapproval", false);
                            }
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load request data.", { position: "bottom center" });
                    console.error("Error fetching request data:", oError);
                }
            });
        },

        _onRouteSanctionfdwithRef: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = "";
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that._onSubType = oData.results[0].ssfdDtl.subType || "";

                        var oViewModel = that.getView().getModel("viewenableddatacheck");
                        if (statusDatacheck === "Draft" || !statusDatacheck || statusDatacheck === "Send Back") {
                            oViewModel.setProperty("/enableRowActions", true);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Approved") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var onInitiateValue = localStorage.getItem("onInitiateValue");
            var onInitiateValueData = "";
            if (onInitiateValue === "New Requirement") {
                onInitiateValueData = "NR";
            } else if (onInitiateValue === "Contingency") {
                onInitiateValueData = "CON";
            } else if (onInitiateValue === "Interline Transfer") {
                onInitiateValueData = "ILT";
            } else if (onInitiateValue === "Budget Carry-Forward") {
                onInitiateValueData = "BCF";
            } else if (onInitiateValue === "Savings") {
                onInitiateValueData = "SAVING";
            } else if (onInitiateValue === "Interhead Transfer") {
                onInitiateValueData = "ITH";
            } else if (onInitiateValue === "Cost Over-Run") {
                onInitiateValueData = "COR";
            } else if (onInitiateValue === "Preproject Approval") {
                onInitiateValueData = "PPA";
            } else if (onInitiateValue === "Capex Budget Carry-Forward") {
                onInitiateValueData = "CBCF";
            } else if (onInitiateValue === "Others") {
                onInitiateValueData = "OTH";
            }
            this._onSubType = onInitiateValueData;
            this._reqIDData = "";
            this._ApprovedCheck = "";
            var oViewModel = this.getView().getModel("viewenableddatacheck");
            oViewModel.setProperty("/enableRowActions", true);
            oViewModel.setProperty("/enableIRR", false);
            oViewModel.setProperty("/approverRequiredVisible", false);
            oViewModel.setProperty("/isApproverScreen", false);
            oViewModel.setProperty("/enableRowActionsapproval", false);

            // Clear attachments when selecting a new request
            var oAttachmentModel = this.getView().getModel("UploadDocSrvTabData");
            oAttachmentModel.setProperty("/attachments", []);

            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Revenue Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Personnel Cost", amount: 0, contingency: 0, total: 0 },
                    { nature: "Total", amount: 0, contingency: 0, total: 0 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");

            var oRequestServiceModel = this.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
            this.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
            var oEmptyData = {
                reqID: "",
                refNo: "",
                requesterName: "",
                department: "",
                market: "",
                location: "",
                hod: "",
                ssfdDtl: {
                    subType: this._onSubType,
                    division: "FD",
                    puDept: "",
                    hod: "",
                    loc: "",
                    projName: "",
                    itemRequiredDesc: "",
                    budgetRequired: 0,
                    irr: "",
                    market: "",
                    implDt: null,
                    enggHours: "",
                    remarks: "",
                    background: "",
                    justification: "",
                    deliverables: "",
                    capitalBudget: 0,
                    revenueBudget: 0,
                    personnelCost: 0,
                    selectedApprover: ""
                }
            };
            oRequestServiceModel.setData(oEmptyData);
            this.onDepartmentDataFetch();
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch();
        },

        onBudgetDetailDataFetch: function(reqID) {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            var subtype = this._onSubType;
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];

            sap.ui.core.BusyIndicator.show(0);
            oModelV2.read("/ReqFormFD('" + reqID + "')", {
                success: function(oData) {
                    if (oData.items && Array.isArray(oData.items)) {
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                var amount = parseFloat(item.amount || 0);
                                if (item.nature === "Capital Budget" && validSubTypes.includes(subtype) && amount > 0) {
                                    item.contingency = parseFloat((amount * 0.05).toFixed(2));
                                    item.total = parseFloat((amount + item.contingency).toFixed(2));
                                } else {
                                    item.contingency = 0;
                                    item.total = parseFloat(amount.toFixed(2));
                                }
                            }
                        });

                        // Recalculate total row
                        var totalAmount = 0, totalContingency = 0, totalFinal = 0;
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                totalAmount += parseFloat(item.amount || 0);
                                totalContingency += parseFloat(item.contingency || 0);
                                totalFinal += parseFloat(item.total || 0);
                            }
                        });

                        oData.items.forEach(function(item) {
                            if (item.nature === "Total") {
                                item.amount = parseFloat(totalAmount.toFixed(2));
                                item.contingency = parseFloat(totalContingency.toFixed(2));
                                item.total = parseFloat(totalFinal.toFixed(2));
                            }
                        });

                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "budgetModel");
                        that._updateIRREnabledState(totalFinal);
                    }
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Error fetching budget data:", oError);
                    MessageToast.show("Failed to fetch budget data.", { position: "bottom center" });
                }
            });
        },

        _updateIRREnabledState: function(totalBudget) {
            var enableIRR = (totalBudget * 100000) > 30000000;
            this.getView().getModel("viewenableddatacheck").setProperty("/enableIRR", enableIRR);
            if (!enableIRR) {
                this.getView().byId("inputIRR").setValue("");
            }
        },

        onFetchTimelinessData: function() {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");

            oModelV2.read("/ProcessLogs", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                urlParameters: {
                    "$orderby": "createdAt desc"
                },
                success: function(oData) {
                    if (oData && oData.results) {
                        var aProcessedData = oData.results.map(function(oLog) {
                            return {
                                createdAt: oLog.createdAt,
                                role: oLog.stage ? "[" + oLog.stage + "]" : "[N/A]",
                                userName: oLog.userName || "Unknown User",
                                userEmail: oLog.userEmail || "N/A",
                                remarks: oLog.remarks || "Yet to be Approved"
                            };
                        });

                        var initiatorIndex = aProcessedData.findIndex(function(item) {
                            return item.role.toLowerCase().includes("initiator");
                        });

                        if (initiatorIndex > -1) {
                            var initiatorEntry = aProcessedData.splice(initiatorIndex, 1)[0];
                            aProcessedData.push(initiatorEntry);
                        }

                        var oJSONModel = new JSONModel({
                            results: aProcessedData
                        });
                        oView.setModel(oJSONModel, "timelinesslogdata");
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load process log data.", { position: "bottom center" });
                    console.error("Error fetching timeliness data:", oError);
                }
            });
        },

        formatTimelineTitle: function(role, userName, userEmail) {
            return role + " " + userName + " (" + userEmail + ")";
        },

        onAttchmentDataFetch: function () {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
        
            // Define date formatter here
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "dd-MM-yyyy "
            });
        
            oModelV2.read("/ReqAttachments", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function (oData) {
                    if (oData && oData.results) {
                        var aAttachments = oData.results.map(function (item) {
                            return {
                                ID: item.ID,
                                fileName: item.fileName,
                                createdBy: item.createdBy || "anonymous",
                                createdAt: item.createdAt ? oDateFormat.format(new Date(item.createdAt)) : "",
                                deleteTabVisible: true,
                                content: item.content
                            };
                        });
        
                        var oJSONModel = new sap.ui.model.json.JSONModel({
                            attachments: aAttachments
                        });
                        oView.setModel(oJSONModel, "UploadDocSrvTabData");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load attachment data.", {
                        position: "bottom center"
                    });
                    console.error("Error fetching attachment data:", oError);
                }
            });
        },        

        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                urlParameters: {
                    "$filter": "department eq 'SSFD' and role eq 'HOD'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        onDepartmentDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_DEPARTMENT'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSDEPARTMENTData");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load department data.", { position: "bottom center" });
                    console.error("Error fetching department data:", oError);
                }
            });
        },

        onMarketDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_MARKET'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSMARKETDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load market data.", { position: "bottom center" });
                    console.error("Error fetching market data:", oError);
                }
            });
        },

        onLocationDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_LOCATION'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load location data.", { position: "bottom center" });
                    console.error("Error fetching location data:", oError);
                }
            });
        },

        onDashboardui: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else if (this._SanctionfdNameUI === "SSFD") {
                oRouter.navTo("DashboardUI", { Name: "SSFD" });
            }
        },

        onCancelSanctionform: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            MessageToast.show("Navigating back to dashboard...", { position: "bottom center" });
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else {
                oRouter.navTo("DashboardUI", { Name: this._SanctionfdNameUI });
            }
        },

        attachmentuploadFilesData: function(reqid) {
            var oModelTabdata = this.getView().getModel("UploadDocSrvTabData");
            var aFilesData = oModelTabdata.getProperty("/attachments") || [];
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            sap.ui.core.BusyIndicator.show(0);

            aFilesData.forEach(function(file) {
                if (!file.fileName || file.uploaded) return;

                if (file.content && typeof file.content === "string" && file.content.includes(',')) {
                    var base64Content = file.content.split(',')[1];
                    var payload = {
                        fileName: file.fileName,
                        content: base64Content,
                        mediaType: file.mimeType || "text/plain",
                        reqID: reqid
                    };

                    oModel.create("/ReqAttachments", payload, {
                        success: function() {
                            file.uploaded = true;
                            oModelTabdata.refresh(true);
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function(oError) {
                            MessageToast.show("Error uploading attachment: " + file.fileName, { position: "bottom center" });
                            console.error("Error uploading attachment:", oError);
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
            });
        },

        _calculateBudgetItems: function(aBudgetItems, subType) {
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
            var totalAmount = 0, totalContingency = 0, totalFinal = 0;

            aBudgetItems.forEach(function(item) {
                if (item.nature !== "Total") {
                    var amount = parseFloat(item.amount || 0);
                    if (item.nature === "Capital Budget" && validSubTypes.includes(subType) && amount > 0) {
                        item.contingency = parseFloat((amount * 0.05).toFixed(2));
                        item.total = parseFloat((amount + item.contingency).toFixed(2));
                    } else {
                        item.contingency = 0;
                        item.total = parseFloat(amount.toFixed(2));
                    }
                    totalAmount += amount;
                    totalContingency += item.contingency;
                    totalFinal += item.total;
                }
            });

            aBudgetItems.forEach(function(item) {
                if (item.nature === "Total") {
                    item.amount = parseFloat(totalAmount.toFixed(2));
                    item.contingency = parseFloat(totalContingency.toFixed(2));
                    item.total = parseFloat(totalFinal.toFixed(2));
                }
            });

            return aBudgetItems;
        },

        onSaveSanctionform: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            var subType = this._onSubType;
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var reqid = this._reqIDData;
            var statusData = this.statusData || "Draft";
            var satauscheckdata = statusData === "Pending" ? "Pending" : "Draft";
            if (statusData === "Sent Back") {
                satauscheckdata = "Sent Back";
            }
            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSavePayload = {
                stage: "Initiator",
                status: satauscheckdata,
                type: "SSFD",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if (!reqid) {
                oModel.create("/Requests", oSavePayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        var reqID = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        MessageBox.success("Request saved successfully!");
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSavePayload, {
                    success: function() {
                        that.attachmentuploadFilesData(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                        MessageBox.success("Request updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                location: oView.byId("comboLocation_Senca").getSelectedKey(),
                budget: oView.byId("BudgetValue").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("department_sensce").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                attachments: oView.getModel("UploadDocSrvTabData").getProperty("/attachments"),
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };
            MessageToast.show("Form data and attachments saved.", { position: "bottom center" });
            this._oSaveDialog.close();
        },

        onCancelSave: function() {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.", { position: "bottom center" });
        },

        onSubmitSanctionform: function() {
            var isValid = true;
            var oView = this.getView();
            var controls = [
                { control: oView.byId("comboLocation_Senca"), field: "Location" },
                { control: oView.byId("department_sensce"), field: "Department" },
                { control: oView.byId("comboMarket_Senca"), field: "Market" },
                { control: oView.byId("Hod_SanctionData"), field: "HOD" },
                { control: oView.byId("inputHour"), field: "Engineering Hours" },
                { control: oView.byId("inputProjectName"), field: "Project Name" },
                { control: oView.byId("inputItemRequired"), field: "Item Required/Description" },
                { control: oView.byId("_IDGenTextArea"), field: "Background/Current Scenario" },
                { control: oView.byId("_IDGenTextArea1"), field: "Proposal/Justification" },
                { control: oView.byId("_IDGenTextArea2"), field: "Deliverables" },
                { control: oView.byId("dateImplement"), field: "Implementation Date" }
            ];

            var missingFields = [];

            controls.forEach(function(item) {
                item.control.setValueState("None");
                var control = item.control;
                var value = control.getValue ? control.getValue().trim() : control.getSelectedKey();
                if (!value) {
                    item.control.setValueState("None");
                    isValid = false;
                    missingFields.push(item.field);
                } else if (item.control.getId().includes("inputHour")) {
                    var hours = parseFloat(value);
                    if (isNaN(hours) || hours <= 0) {
                        item.control.setValueState("None");
                        isValid = false;
                        missingFields.push(item.field + " (must be a positive number)");
                    }
                }
            });

            if (!isValid) {
                var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
                MessageBox.error(errorMessage);
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", false);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", true);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onComboBoxChange: function(oEvent) {
            var oComboBox = oEvent.getSource();
            var sValue = oEvent.getParameter("newValue") || oComboBox.getValue();
            var aItems = oComboBox.getItems();
            var bValid = aItems.some(function(oItem) {
                return oItem.getKey() === sValue || oItem.getText() === sValue;
            });

            oComboBox.setValueState(bValid ? "None" : "Error");
            if (!bValid) {
                MessageToast.show("Please select a valid option from the dropdown.", { position: "bottom center" });
            }
        },

        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var fValue = parseFloat(sNewValue);
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
        
            if (isNaN(fValue) || fValue < 0) {
                oInput.setValueState("Error");
                MessageToast.show("Budget amount cannot be negative.", { position: "bottom center" });
                return;
            }
            oInput.setValueState("None");
        
            aItems[iIndex].amount = fValue || 0;
            if (aItems[iIndex].nature === "Capital Budget" && validSubTypes.includes(this._onSubType) && fValue > 0) {
                aItems[iIndex].contingency = Number((aItems[iIndex].amount * 0.05).toFixed(2));
            } else {
                aItems[iIndex].contingency = 0;
            }
            aItems[iIndex].total = Number((aItems[iIndex].amount + aItems[iIndex].contingency).toFixed(2));
        
            // Recalculate total row
            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount || 0;
                iTotalContingency += aItems[i].contingency || 0;
            }
        
            aItems[3].amount = Number(iTotalAmount.toFixed(2));
            aItems[3].contingency = Number(iTotalContingency.toFixed(2));
            aItems[3].total = Number((iTotalAmount + iTotalContingency).toFixed(2));
        
            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
            this.getView().byId("BudgetValue").setValue(aItems[3].total.toString());
            this._updateIRREnabledState(aItems[3].total);
        },

        onHoursChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var value = oEvent.getParameter("value");
            oInput.setValueState("None");

            if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                oInput.setValueState("Error");
                MessageToast.show("Engineering Hours must be a positive number.", { position: "bottom center" });
            }
        },

        onHodSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onDepartmentSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onMarketSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onLocationSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onApprovedSanctionform: function() {
            var oView = this.getView();
            var isValid = true;
            var missingFields = [];

            // Validate Engineering Hours
            var hours = oView.byId("inputHour");
            hours.setValueState("None");
            var hoursValue = hours.getValue();
            if (!hoursValue || isNaN(parseFloat(hoursValue)) || parseFloat(hoursValue) <= 0) {
                hours.setValueState("Error");
                isValid = false;
                missingFields.push("Engineering Hours (must be a positive number)");
            }

            // Validate Approver selection only when _ApprovedCheck is "Approved"
            if (this._ApprovedCheck === "Approved") {
                var approver = oView.byId("approverRequiredFrom");
                approver.setValueState("None");
                var approverValue = approver.getSelectedKey();
                if (!approverValue) {
                    approver.setValueState("Error");
                    approver.setValueStateText("Approver selection is required.");
                    isValid = false;
                    missingFields.push("Approver");
                }
            }

            // Validate WBS Code and Cost Center for Final Accounts stage
            if (this.stagesData === "Final Accounts" && this._ApprovedCheck === "Approved") {
                var wbsInput = oView.byId("wbsInput");
                var costCenterInput = oView.byId("costCenterInput");

                // Validate WBS Code
                wbsInput.setValueState("None");
                var wbsValue = wbsInput.getValue().trim();
                if (!wbsValue) {
                    wbsInput.setValueState("Error");
                    wbsInput.setValueStateText("WBS Code is required for Final Accounts.");
                    isValid = false;
                    missingFields.push("WBS Code");
                }

                // Validate Cost Center
                costCenterInput.setValueState("None");
                var costCenterValue = costCenterInput.getValue().trim();
                if (!costCenterValue) {
                    costCenterInput.setValueState("Error");
                    costCenterInput.setValueStateText("Cost Center is required for Final Accounts.");
                    isValid = false;
                    missingFields.push("Cost Center");
                }
            }

            // Show error if validation fails
            if (!isValid) {
                var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
                MessageBox.error(errorMessage);
                return;
            }

            // Set model properties and open remarks dialog
            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", true);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", true);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onRejectDataSanctionForm: function() {
            var oView = this.getView();
            var hours = oView.byId("inputHour");
            hours.setValueState("None");

            if (!hours.getValue() || isNaN(parseFloat(hours.getValue())) || parseFloat(hours.getValue()) <= 0) {
                hours.setValueState("Error");
                MessageBox.error("Please enter valid Engineering Hours (must be a positive number).");
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", true);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", true);
            this.remarksDialog.open();
        },

        onCloseReamrksFrag: function() {
            this.remarksDialog.close();
        },

        onRejectedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Reject.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                stage: "Rejected",
                status: "Rejected",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.rejecteddatacheckRejected(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.rejecteddatacheckRejected(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        rejecteddatacheckRejected: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "REJECT",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request rejected successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    MessageToast.show("Error rejecting request.", { position: "bottom center" });
                    console.error("Error rejecting request:", oError);
                }
            });
        },

        onSendbackData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        that.sendbackdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        that.sendbackdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onApprovedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Approve.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                WBSNumber: oView.byId("wbsInput").getValue() || "",
                costCentre: oView.byId("costCenterInput").getValue() || "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onSubmitReamrksData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var subtypedata = this._onSubType;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subtypedata);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                subType: subtypedata,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : ""
            };

            var oSubmitPayload = {
                stage: "HOD",
                status: "Pending",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var reqID = oData.reqID;
                        that.approverdatacheck(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacheck(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        sendbackdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SENT BACK",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request Sent Back successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "APPROVE",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request approved successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                sap.ui.core.BusyIndicator.hide();
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheck: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SUBMIT",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success(oData.SSFDApproval?.message || "Request submitted successfully!", {
                        onClose: function() {
                            if (that._SanctionfdNameUI === "SSFD") {
                                sap.ui.core.BusyIndicator.hide();
                                that.getOwnerComponent().getRouter().navTo("DashboardUI", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error submitting request.", { position: "bottom center" });
                    console.error("Error submitting request:", oError);
                }
            });
        },

        onUploadTabAttchmment: function(oEvent) {
            const oFileUploader = oEvent.getSource();
            const aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("No files selected.", { position: "bottom center" });
                return;
            }

            const oModel = this.getView().getModel("UploadDocSrvTabData");
            const oUserModel = this.getOwnerComponent().getModel("approvalservicev2");
            const aAttachments = oModel.getProperty("/attachments") || [];
            const sUploadedOn = new Date().toISOString().split("T")[0];
            const that = this;

            oUserModel.callFunction("/getCurrentUser", {
                method: "GET",
                urlParameters: {
                    role: "Initiator"
                },
                success: function(oData) {
                    const sUploadedBy = oData && oData.name ? oData.name : "Unknown";

                    for (let i = 0; i < aFiles.length; i++) {
                        (function(file, index) {
                            const oReader = new FileReader();
                            oReader.onload = function(e) {
                                const sBase64Data = e.target.result;

                                aAttachments.push({
                                    ID: new Date().getTime().toString() + index,
                                    fileName: file.name,
                                    mimeType: file.type,
                                    content: sBase64Data,
                                    createdBy: sUploadedBy,
                                    createdAt: sUploadedOn,
                                    deleteTabVisible: true
                                });

                                if (index === aFiles.length - 1) {
                                    oModel.setProperty("/attachments", aAttachments);
                                    oModel.refresh(true);
                                    MessageToast.show("Files uploaded: " + aFiles.length, { position: "bottom center" });
                                    oFileUploader.setValue("");
                                }
                            };
                            oReader.onerror = function() {
                                MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                            };
                            oReader.readAsDataURL(file);
                        })(aFiles[i], i);
                    }
                },
                error: function() {
                    MessageToast.show("Failed to fetch current user.", { position: "bottom center" });
                }
            });
        },

        onUploadPress: function() {
            var oFileUploader = this.byId("fileUploaderTabAttchment");
            var aFiles = oFileUploader.getDomRef().files;

            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("Please select at least one file first.", { position: "bottom center" });
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var sUploadedBy = "Current User";

            aAttachments = aAttachments.filter(function(item) {
                return !item.temp;
            });

            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result;
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            createdBy: sUploadedBy,
                            createdAt: sUploadedOn,
                            deleteTabVisible: true,
                            content: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true);
                            MessageToast.show("Uploaded " + aFiles.length + " file(s) successfully!", { position: "bottom center" });
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                    };
                    oReader.readAsDataURL(file);
                })(aFiles[i], i);
            }
        },

        onDownloadTabAttachemnt: function(oEvent) {
            var oButton = oEvent.getSource();
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var sFileName = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "fileName";
            }).getValue();

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.read(sPath, {
                success: function(oData) {
                    if (oData && oData.__metadata && oData.__metadata.media_src) {
                        var oLink = document.createElement("a");
                        oLink.href = oData.__metadata.media_src;
                        oLink.download = sFileName;
                        document.body.appendChild(oLink);
                        oLink.click();
                        document.body.removeChild(oLink);
                        MessageToast.show("Downloading file from server: " + sFileName, { position: "bottom center" });
                    } else {
                        that._downloadLocalAttachment(oAttachment, sFileName);
                    }
                },
                error: function() {
                    that._downloadLocalAttachment(oAttachment, sFileName);
                }
            });
        },

        _downloadBase64File: function(sBase64Content, sFileName) {
            try {
                var sBase64Data = sBase64Content.split(',')[1];
                var sMimeType = sBase64Content.split(';')[0].split(':')[1];
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var oBlob = new Blob([byteArray], { type: sMimeType });
                var sUrl = URL.createObjectURL(oBlob);

                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName, { position: "bottom center" });
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName, { position: "bottom center" });
                console.error("Error downloading file:", e);
            }
        },

        _downloadLocalAttachment: function(oAttachment, sFileName) {
            if (!oAttachment || !oAttachment.content) {
                MessageToast.show("Local file content not found for: " + sFileName, { position: "bottom center" });
                return;
            }
            this._downloadBase64File(oAttachment.content, sFileName);
        },

        onDeleteTabAttchment: function(oEvent) {
            var oButton = oEvent.getSource();
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments");
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var iIndex = aAttachments.findIndex(function(oItem) {
                return oItem.ID === sID;
            });
            if (iIndex === -1) return;

            var sFileName = aAttachments[iIndex].fileName;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.remove(sPath, {
                success: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                },
                error: function(oError) {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                }
            });
        },

        _removeAttachmentFromLocalModel: function(oModel, aAttachments, iIndex, sFileName) {
            aAttachments.splice(iIndex, 1);
            oModel.setProperty("/attachments", aAttachments);
            oModel.refresh(true);
        },

        handleLiveChangeLimit1500: function(oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oTextArea.getValue();

            if (sValue.length > 1500) {
                oTextArea.setValue(sValue.substring(0, 1500));
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 1500 characters allowed.");
            } else {
                oTextArea.setValueState("None");
            }
        },

        onTextInputLiveChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var filteredValue = sValue.replace(/[^a-zA-Z0-9]/g, '');

            if (filteredValue !== sValue) {
                oInput.setValue(filteredValue);
            }
            if (filteredValue) {
                oInput.setValueState("None");
                oInput.setValueStateText("");
            }
        },

        onGetCurrUserforUploadon: function () {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
        
            oModel.read("/getCurrentUser", {
                urlParameters: {
                    role: 'Initiator',
                    dept: 'SSFD'
                },
                success: function (oData) {
                    that.uploadbyEmail = oData.email;
                    var oUserModel = new sap.ui.model.json.JSONModel(oData);
                    that.getView().setModel(oUserModel, "CurrentUser");
                },
                error: function (oError) {
                    console.error("Error fetching current user:", oError);
                }
            });
        }
    });
});

UPDATED CODE 2

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, Fragment, MessageBox) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize attachment model
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");

            // Initialize router and route handlers
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);
            oRouter.getRoute("SanctionfdRef").attachPatternMatched(this._onRouteSanctionfdwithRef, this);
            oRouter.getRoute("SanctionfdRefApproved").attachPatternMatched(this._onRouteSanctionfdApproved, this);

            // Initialize remarks dialog
            this.remarksDialog = sap.ui.xmlfragment(this.getView().getId(), "com.mmapprovalhub.approvalhub.Fragments.remarks", this);
            this.getView().addDependent(this.remarksDialog);

            // Initialize view model
            var oViewModel = new JSONModel({
                enableRowActions: true,
                approvebuttonvisiblity: false,
                approvebuttonfragment: false,
                rejetedbuttonfragmnet: false,
                enableIRR: false,
                enableFinalAccount: false,
                enableFinalAccountInput: false,
                sendbackbuttonvisiblity: false,
                remarkModel: "",
                approverRequiredVisible: false,
                currentUserRole: "",
                isApproverScreen: false,
                enableRowActionsapproval: false
            });
            this.getView().setModel(oViewModel, "viewenableddatacheck");

            // Initialize timeline model
            var oTimelineData = {};
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");

            this.onGetCurrUserforUploadon();
        },

        // Formatter for subType display
        formatSubType: function(sSubType) {
            var mSubTypeMap = {
                "NR": "New Requirement",
                "CON": "Contingency",
                "ILT": "Interline Transfer",
                "BCF": "Budget Carry-Forward",
                "SAVING": "Savings",
                "ITH": "Interhead Transfer",
                "COR": "Cost Over-Run",
                "PPA": "Preproject Approval",
                "CBCF": "Capex Budget Carry-Forward",
                "OTH": "Others"
            };
            return mSubTypeMap[sSubType] || sSubType || "N/A";
        },

        _onRouteSanctionfdApproved: function(oEvent) {
            this._ApprovedCheck = "";
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = oArgs.approved;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that.stagesData = oData.results[0].stage;
                        that._onSubType = oData.results[0].ssfdDtl.subType || "";
                        var oViewModel = that.getView().getModel("viewenableddatacheck");

                        if (that.stagesData === "Final Accounts" && that.statusData === "Pending") {
                            oViewModel.setProperty("/enableFinalAccount", true);
                            oViewModel.setProperty("/enableFinalAccountInput", true);
                        } else {
                            oViewModel.setProperty("/enableFinalAccount", false);
                            oViewModel.setProperty("/enableFinalAccountInput", false);
                        }

                        if (statusDatacheck === "Draft" || !statusDatacheck) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", that._ApprovedCheck === "Approved");
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        if (that._ApprovedCheck === "Approved" && (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD")) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", true);
                            oViewModel.setProperty("/approverRequiredVisible", true);
                            var costoverrunShowApprover = oData.results[0].ssfdDtl.subType;
                            if (that.stagesData === "GM PMO" && costoverrunShowApprover === "COR") {
                                oViewModel.setProperty("/isApproverScreen", true);
                                oViewModel.setProperty("/enableRowActionsapproval", true);
                            } else {
                                oViewModel.setProperty("/isApproverScreen", false);
                                oViewModel.setProperty("/enableRowActionsapproval", false);
                            }
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load request data.", { position: "bottom center" });
                    console.error("Error fetching request data:", oError);
                }
            });
        },

        _onRouteSanctionfdwithRef: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = "";
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that._onSubType = oData.results[0].ssfdDtl.subType || "";

                        var oViewModel = that.getView().getModel("viewenableddatacheck");
                        if (statusDatacheck === "Draft" || !statusDatacheck || statusDatacheck === "Send Back") {
                            oViewModel.setProperty("/enableRowActions", true);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Approved") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var onInitiateValue = localStorage.getItem("onInitiateValue");
            var onInitiateValueData = "";
            if (onInitiateValue === "New Requirement") {
                onInitiateValueData = "NR";
            } else if (onInitiateValue === "Contingency") {
                onInitiateValueData = "CON";
            } else if (onInitiateValue === "Interline Transfer") {
                onInitiateValueData = "ILT";
            } else if (onInitiateValue === "Budget Carry-Forward") {
                onInitiateValueData = "BCF";
            } else if (onInitiateValue === "Savings") {
                onInitiateValueData = "SAVING";
            } else if (onInitiateValue === "Interhead Transfer") {
                onInitiateValueData = "ITH";
            } else if (onInitiateValue === "Cost Over-Run") {
                onInitiateValueData = "COR";
            } else if (onInitiateValue === "Preproject Approval") {
                onInitiateValueData = "PPA";
            } else if (onInitiateValue === "Capex Budget Carry-Forward") {
                onInitiateValueData = "CBCF";
            } else if (onInitiateValue === "Others") {
                onInitiateValueData = "OTH";
            }
            this._onSubType = onInitiateValueData;
            this._reqIDData = "";
            this._ApprovedCheck = "";
            var oViewModel = this.getView().getModel("viewenableddatacheck");
            oViewModel.setProperty("/enableRowActions", true);
            oViewModel.setProperty("/enableIRR", false);
            oViewModel.setProperty("/approverRequiredVisible", false);
            oViewModel.setProperty("/isApproverScreen", false);
            oViewModel.setProperty("/enableRowActionsapproval", false);

            // Clear attachments when selecting a new request
            var oAttachmentModel = this.getView().getModel("UploadDocSrvTabData");
            oAttachmentModel.setProperty("/attachments", []);

            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Revenue Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Personnel Cost", amount: 0, contingency: 0, total: 0 },
                    { nature: "Total", amount: 0, contingency: 0, total: 0 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");

            var oRequestServiceModel = this.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
            this.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
            var oEmptyData = {
                reqID: "",
                refNo: "",
                requesterName: "",
                department: "",
                market: "",
                location: "",
                hod: "",
                ssfdDtl: {
                    subType: this._onSubType,
                    division: "FD",
                    puDept: "",
                    hod: "",
                    loc: "",
                    projName: "",
                    itemRequiredDesc: "",
                    budgetRequired: 0,
                    irr: "",
                    market: "",
                    implDt: null,
                    enggHours: "",
                    remarks: "",
                    background: "",
                    justification: "",
                    deliverables: "",
                    capitalBudget: 0,
                    revenueBudget: 0,
                    personnelCost: 0,
                    selectedApprover: ""
                }
            };
            oRequestServiceModel.setData(oEmptyData);
            this.onDepartmentDataFetch();
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch();
        },

        onBudgetDetailDataFetch: function(reqID) {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            var subtype = this._onSubType;
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];

            sap.ui.core.BusyIndicator.show(0);
            oModelV2.read("/ReqFormFD('" + reqID + "')", {
                success: function(oData) {
                    if (oData.items && Array.isArray(oData.items)) {
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                var amount = parseFloat(item.amount || 0);
                                if (item.nature === "Capital Budget" && validSubTypes.includes(subtype) && amount > 0) {
                                    item.contingency = parseFloat((amount * 0.05).toFixed(2));
                                    item.total = parseFloat((amount + item.contingency).toFixed(2));
                                } else {
                                    item.contingency = 0;
                                    item.total = parseFloat(amount.toFixed(2));
                                }
                            }
                        });

                        // Recalculate total row
                        var totalAmount = 0, totalContingency = 0, totalFinal = 0;
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                totalAmount += parseFloat(item.amount || 0);
                                totalContingency += parseFloat(item.contingency || 0);
                                totalFinal += parseFloat(item.total || 0);
                            }
                        });

                        oData.items.forEach(function(item) {
                            if (item.nature === "Total") {
                                item.amount = parseFloat(totalAmount.toFixed(2));
                                item.contingency = parseFloat(totalContingency.toFixed(2));
                                item.total = parseFloat(totalFinal.toFixed(2));
                            }
                        });

                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "budgetModel");
                        that._updateIRREnabledState(totalFinal);
                    }
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Error fetching budget data:", oError);
                    MessageToast.show("Failed to fetch budget data.", { position: "bottom center" });
                }
            });
        },

        _updateIRREnabledState: function(totalBudget) {
            var enableIRR = (totalBudget * 100000) > 30000000;
            this.getView().getModel("viewenableddatacheck").setProperty("/enableIRR", enableIRR);
            if (!enableIRR) {
                this.getView().byId("inputIRR").setValue("");
            }
        },

        onFetchTimelinessData: function() {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");

            oModelV2.read("/ProcessLogs", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                urlParameters: {
                    "$orderby": "createdAt desc"
                },
                success: function(oData) {
                    if (oData && oData.results) {
                        var aProcessedData = oData.results.map(function(oLog) {
                            return {
                                createdAt: oLog.createdAt,
                                role: oLog.stage ? "[" + oLog.stage + "]" : "[N/A]",
                                userName: oLog.userName || "Unknown User",
                                userEmail: oLog.userEmail || "N/A",
                                remarks: oLog.remarks || "Yet to be Approved"
                            };
                        });

                        var initiatorIndex = aProcessedData.findIndex(function(item) {
                            return item.role.toLowerCase().includes("initiator");
                        });

                        if (initiatorIndex > -1) {
                            var initiatorEntry = aProcessedData.splice(initiatorIndex, 1)[0];
                            aProcessedData.push(initiatorEntry);
                        }

                        var oJSONModel = new JSONModel({
                            results: aProcessedData
                        });
                        oView.setModel(oJSONModel, "timelinesslogdata");
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load process log data.", { position: "bottom center" });
                    console.error("Error fetching timeliness data:", oError);
                }
            });
        },

        formatTimelineTitle: function(role, userName, userEmail) {
            return role + " " + userName + " (" + userEmail + ")";
        },

        onAttchmentDataFetch: function () {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
        
            // Define date formatter here
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "dd-MM-yyyy "
            });
        
            oModelV2.read("/ReqAttachments", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function (oData) {
                    if (oData && oData.results) {
                        var aAttachments = oData.results.map(function (item) {
                            return {
                                ID: item.ID,
                                fileName: item.fileName,
                                createdBy: item.createdBy || "anonymous",
                                createdAt: item.createdAt ? oDateFormat.format(new Date(item.createdAt)) : "",
                                deleteTabVisible: true,
                                content: item.content
                            };
                        });
        
                        var oJSONModel = new sap.ui.model.json.JSONModel({
                            attachments: aAttachments
                        });
                        oView.setModel(oJSONModel, "UploadDocSrvTabData");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load attachment data.", {
                        position: "bottom center"
                    });
                    console.error("Error fetching attachment data:", oError);
                }
            });
        },        

        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                urlParameters: {
                    "$filter": "department eq 'SSFD' and role eq 'HOD'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        onDepartmentDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_DEPARTMENT'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSDEPARTMENTData");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load department data.", { position: "bottom center" });
                    console.error("Error fetching department data:", oError);
                }
            });
        },

        onMarketDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_MARKET'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSMARKETDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load market data.", { position: "bottom center" });
                    console.error("Error fetching market data:", oError);
                }
            });
        },

        onLocationDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_LOCATION'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load location data.", { position: "bottom center" });
                    console.error("Error fetching location data:", oError);
                }
            });
        },

        onDashboardui: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else if (this._SanctionfdNameUI === "SSFD") {
                oRouter.navTo("DashboardUI", { Name: "SSFD" });
            }
        },

        onCancelSanctionform: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            MessageToast.show("Navigating back to dashboard...", { position: "bottom center" });
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else {
                oRouter.navTo("DashboardUI", { Name: this._SanctionfdNameUI });
            }
        },

        attachmentuploadFilesData: function(reqid) {
            var oModelTabdata = this.getView().getModel("UploadDocSrvTabData");
            var aFilesData = oModelTabdata.getProperty("/attachments") || [];
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            sap.ui.core.BusyIndicator.show(0);

            aFilesData.forEach(function(file) {
                if (!file.fileName || file.uploaded) return;

                if (file.content && typeof file.content === "string" && file.content.includes(',')) {
                    var base64Content = file.content.split(',')[1];
                    var payload = {
                        fileName: file.fileName,
                        content: base64Content,
                        mediaType: file.mimeType || "text/plain",
                        reqID: reqid
                    };

                    oModel.create("/ReqAttachments", payload, {
                        success: function() {
                            file.uploaded = true;
                            oModelTabdata.refresh(true);
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function(oError) {
                            MessageToast.show("Error uploading attachment: " + file.fileName, { position: "bottom center" });
                            console.error("Error uploading attachment:", oError);
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
            });
        },

        _calculateBudgetItems: function(aBudgetItems, subType) {
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
            var totalAmount = 0, totalContingency = 0, totalFinal = 0;

            aBudgetItems.forEach(function(item) {
                if (item.nature !== "Total") {
                    var amount = parseFloat(item.amount || 0);
                    if (item.nature === "Capital Budget" && validSubTypes.includes(subType) && amount > 0) {
                        item.contingency = parseFloat((amount * 0.05).toFixed(2));
                        item.total = parseFloat((amount + item.contingency).toFixed(2));
                    } else {
                        item.contingency = 0;
                        item.total = parseFloat(amount.toFixed(2));
                    }
                    totalAmount += amount;
                    totalContingency += item.contingency;
                    totalFinal += item.total;
                }
            });

            aBudgetItems.forEach(function(item) {
                if (item.nature === "Total") {
                    item.amount = parseFloat(totalAmount.toFixed(2));
                    item.contingency = parseFloat(totalContingency.toFixed(2));
                    item.total = parseFloat(totalFinal.toFixed(2));
                }
            });

            return aBudgetItems;
        },

        onSaveSanctionform: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            var subType = this._onSubType;
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var reqid = this._reqIDData;
            var statusData = this.statusData || "Draft";
            var satauscheckdata = statusData === "Pending" ? "Pending" : "Draft";
            if (statusData === "Sent Back") {
                satauscheckdata = "Sent Back";
            }
            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSavePayload = {
                stage: "Initiator",
                status: satauscheckdata,
                type: "SSFD",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if (!reqid) {
                oModel.create("/Requests", oSavePayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        var reqID = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        MessageBox.success("Request saved successfully!");
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSavePayload, {
                    success: function() {
                        that.attachmentuploadFilesData(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                        MessageBox.success("Request updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                location: oView.byId("comboLocation_Senca").getSelectedKey(),
                budget: oView.byId("BudgetValue").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("department_sensce").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                attachments: oView.getModel("UploadDocSrvTabData").getProperty("/attachments"),
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };
            MessageToast.show("Form data and attachments saved.", { position: "bottom center" });
            this._oSaveDialog.close();
        },

        onCancelSave: function() {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.", { position: "bottom center" });
        },

        onSubmitSanctionform: function() {
            var isValid = true;
            var oView = this.getView();
            var controls = [
                { control: oView.byId("comboLocation_Senca"), field: "Location" },
                { control: oView.byId("department_sensce"), field: "Department" },
                { control: oView.byId("comboMarket_Senca"), field: "Market" },
                { control: oView.byId("Hod_SanctionData"), field: "HOD" },
                { control: oView.byId("inputHour"), field: "Engineering Hours" },
                { control: oView.byId("inputProjectName"), field: "Project Name" },
                { control: oView.byId("inputItemRequired"), field: "Item Required/Description" },
                { control: oView.byId("_IDGenTextArea"), field: "Background/Current Scenario" },
                { control: oView.byId("_IDGenTextArea1"), field: "Proposal/Justification" },
                { control: oView.byId("_IDGenTextArea2"), field: "Deliverables" },
                { control: oView.byId("dateImplement"), field: "Implementation Date" }
            ];

            var missingFields = [];

            controls.forEach(function(item) {
                item.control.setValueState("None");
                var control = item.control;
                var value = control.getValue ? control.getValue().trim() : control.getSelectedKey();
                if (!value) {
                    item.control.setValueState("None");
                    isValid = false;
                    missingFields.push(item.field);
                } else if (item.control.getId().includes("inputHour")) {
                    var hours = parseFloat(value);
                    if (isNaN(hours) || hours <= 0) {
                        item.control.setValueState("None");
                        isValid = false;
                        missingFields.push(item.field + " (must be a positive number)");
                    }
                }
            });

            if (!isValid) {
                var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
                MessageBox.error(errorMessage);
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", false);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", true);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onComboBoxChange: function(oEvent) {
            var oComboBox = oEvent.getSource();
            var sValue = oEvent.getParameter("newValue") || oComboBox.getValue();
            var aItems = oComboBox.getItems();
            var bValid = aItems.some(function(oItem) {
                return oItem.getKey() === sValue || oItem.getText() === sValue;
            });

            oComboBox.setValueState(bValid ? "None" : "Error");
            if (!bValid) {
                MessageToast.show("Please select a valid option from the dropdown.", { position: "bottom center" });
            }
        },

        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var fValue = parseFloat(sNewValue);
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
        
            if (isNaN(fValue) || fValue < 0) {
                oInput.setValueState("Error");
                MessageToast.show("Budget amount cannot be negative.", { position: "bottom center" });
                return;
            }
            oInput.setValueState("None");
        
            aItems[iIndex].amount = fValue || 0;
            if (aItems[iIndex].nature === "Capital Budget" && validSubTypes.includes(this._onSubType) && fValue > 0) {
                aItems[iIndex].contingency = Number((aItems[iIndex].amount * 0.05).toFixed(2));
            } else {
                aItems[iIndex].contingency = 0;
            }
            aItems[iIndex].total = Number((aItems[iIndex].amount + aItems[iIndex].contingency).toFixed(2));
        
            // Recalculate total row
            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount || 0;
                iTotalContingency += aItems[i].contingency || 0;
            }
        
            aItems[3].amount = Number(iTotalAmount.toFixed(2));
            aItems[3].contingency = Number(iTotalContingency.toFixed(2));
            aItems[3].total = Number((iTotalAmount + iTotalContingency).toFixed(2));
        
            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
            this.getView().byId("BudgetValue").setValue(aItems[3].total.toString());
            this._updateIRREnabledState(aItems[3].total);
        },

        onHoursChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var value = oEvent.getParameter("value");
            oInput.setValueState("None");

            if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                oInput.setValueState("Error");
                MessageToast.show("Engineering Hours must be a positive number.", { position: "bottom center" });
            }
        },

        onHodSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onDepartmentSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onMarketSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onLocationSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onApprovedSanctionform: function() {
            var oView = this.getView();
            var isValid = true;
            var missingFields = [];

            // Validate Engineering Hours
            var hours = oView.byId("inputHour");
            hours.setValueState("None");
            var hoursValue = hours.getValue();
            if (!hoursValue || isNaN(parseFloat(hoursValue)) || parseFloat(hoursValue) <= 0) {
                hours.setValueState("Error");
                isValid = false;
                missingFields.push("Engineering Hours (must be a positive number)");
            }

            // Validate Approver selection only when _ApprovedCheck is "Approved"
            if (this._ApprovedCheck === "Approved") {
                var approver = oView.byId("approverRequiredFrom");
                approver.setValueState("None");
                var approverValue = approver.getSelectedKey();
                if (!approverValue) {
                    approver.setValueState("Error");
                    approver.setValueStateText("Approver selection is required.");
                    isValid = false;
                    missingFields.push("Approver");
                }
            }

            // Show error if validation fails
            // if (!isValid) {
            //     var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
            //     MessageBox.error(errorMessage);
            //     return;
            // }

            // Set model properties and open remarks dialog
            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", true);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", true);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onRejectDataSanctionForm: function() {
            var oView = this.getView();
            var hours = oView.byId("inputHour");
            hours.setValueState("None");

            if (!hours.getValue() || isNaN(parseFloat(hours.getValue())) || parseFloat(hours.getValue()) <= 0) {
                hours.setValueState("Error");
                MessageBox.error("Please enter valid Engineering Hours (must be a positive number).");
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", true);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", true);
            this.remarksDialog.open();
        },

        onCloseReamrksFrag: function() {
            this.remarksDialog.close();
        },

        onRejectedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Reject.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                stage: "Rejected",
                status: "Rejected",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.rejecteddatacheckRejected(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.rejecteddatacheckRejected(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        rejecteddatacheckRejected: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "REJECT",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request rejected successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    MessageToast.show("Error rejecting request.", { position: "bottom center" });
                    console.error("Error rejecting request:", oError);
                }
            });
        },

        onSendbackData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        that.sendbackdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        that.sendbackdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onApprovedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Approve.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            // Validate WBS Code and Cost Center in Final Accounts stage
            var isValid = true;
            var missingFields = [];

            // Validate Engineering Hours
            var hours = oView.byId("inputHour");
            hours.setValueState("None");
            var hoursValue = hours.getValue();
            if (!hoursValue || isNaN(parseFloat(hoursValue)) || parseFloat(hoursValue) <= 0) {
                hours.setValueState("Error");
                isValid = false;
                missingFields.push("Engineering Hours (must be a positive number)");
            }

            // Validate Approver selection only when _ApprovedCheck is "Approved"
            if (this._ApprovedCheck === "Approved") {
                var approver = oView.byId("approverRequiredFrom");
                approver.setValueState("None");
                var approverValue = approver.getSelectedKey();
                if (!approverValue) {
                    approver.setValueState("Error");
                    approver.setValueStateText("Approver selection is required.");
                    isValid = false;
                    missingFields.push("Approver");
                }
            }

            // Validate WBS Code and Cost Center for Final Accounts stage
            if (this.stagesData === "Final Accounts" && this.statusData === "Pending" && this._ApprovedCheck === "Approved") {
                var wbsInput = oView.byId("wbsInput");
                var costCenterInput = oView.byId("costCenterInput");
                
                wbsInput.setValueState("None");
                costCenterInput.setValueState("None");

                if (!wbsInput.getValue().trim()) {
                    wbsInput.setValueState("Error");
                    wbsInput.setValueStateText("WBS Code is required.");
                    isValid = false;
                    missingFields.push("WBS Code");
                }

                if (!costCenterInput.getValue().trim()) {
                    costCenterInput.setValueState("Error");
                    costCenterInput.setValueStateText("Cost Center is required.");
                    isValid = false;
                    missingFields.push("Cost Center");
                }
            }

            // Show error if validation fails
            if (!isValid) {
                var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
                MessageBox.error(errorMessage);
                sap.ui.core.BusyIndicator.hide();
                return;
            }

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                WBSNumber: oView.byId("wbsInput").getValue() || "",
                costCentre: oView.byId("costCenterInput").getValue() || "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onSubmitReamrksData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var subtypedata = this._onSubType;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subtypedata);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                subType: subtypedata,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : ""
            };

            var oSubmitPayload = {
                stage: "HOD",
                status: "Pending",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var reqID = oData.reqID;
                        that.approverdatacheck(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacheck(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        sendbackdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SENT BACK",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request Sent Back successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "APPROVE",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request approved successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                sap.ui.core.BusyIndicator.hide();
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheck: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SUBMIT",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success(oData.SSFDApproval?.message || "Request submitted successfully!", {
                        onClose: function() {
                            if (that._SanctionfdNameUI === "SSFD") {
                                sap.ui.core.BusyIndicator.hide();
                                that.getOwnerComponent().getRouter().navTo("DashboardUI", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error submitting request.", { position: "bottom center" });
                    console.error("Error submitting request:", oError);
                }
            });
        },

        onUploadTabAttchmment: function(oEvent) {
            const oFileUploader = oEvent.getSource();
            const aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("No files selected.", { position: "bottom center" });
                return;
            }

            const oModel = this.getView().getModel("UploadDocSrvTabData");
            const oUserModel = this.getOwnerComponent().getModel("approvalservicev2");
            const aAttachments = oModel.getProperty("/attachments") || [];
            const sUploadedOn = new Date().toISOString().split("T")[0];
            const that = this;

            oUserModel.callFunction("/getCurrentUser", {
                method: "GET",
                urlParameters: {
                    role: "Initiator"
                },
                success: function(oData) {
                    const sUploadedBy = oData && oData.name ? oData.name : "Unknown";

                    for (let i = 0; i < aFiles.length; i++) {
                        (function(file, index) {
                            const oReader = new FileReader();
                            oReader.onload = function(e) {
                                const sBase64Data = e.target.result;

                                aAttachments.push({
                                    ID: new Date().getTime().toString() + index,
                                    fileName: file.name,
                                    mimeType: file.type,
                                    content: sBase64Data,
                                    createdBy: sUploadedBy,
                                    createdAt: sUploadedOn,
                                    deleteTabVisible: true
                                });

                                if (index === aFiles.length - 1) {
                                    oModel.setProperty("/attachments", aAttachments);
                                    oModel.refresh(true);
                                    MessageToast.show("Files uploaded: " + aFiles.length, { position: "bottom center" });
                                    oFileUploader.setValue("");
                                }
                            };
                            oReader.onerror = function() {
                                MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                            };
                            oReader.readAsDataURL(file);
                        })(aFiles[i], i);
                    }
                },
                error: function() {
                    MessageToast.show("Failed to fetch current user.", { position: "bottom center" });
                }
            });
        },

        onUploadPress: function() {
            var oFileUploader = this.byId("fileUploaderTabAttchment");
            var aFiles = oFileUploader.getDomRef().files;

            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("Please select at least one file first.", { position: "bottom center" });
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var sUploadedBy = "Current User";

            aAttachments = aAttachments.filter(function(item) {
                return !item.temp;
            });

            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result;
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            createdBy: sUploadedBy,
                            createdAt: sUploadedOn,
                            deleteTabVisible: true,
                            content: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true);
                            MessageToast.show("Uploaded " + aFiles.length + " file(s) successfully!", { position: "bottom center" });
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                    };
                    oReader.readAsDataURL(file);
                })(aFiles[i], i);
            }
        },

        onDownloadTabAttachemnt: function(oEvent) {
            var oButton = oEvent.getSource();
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var sFileName = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "fileName";
            }).getValue();

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.read(sPath, {
                success: function(oData) {
                    if (oData && oData.__metadata && oData.__metadata.media_src) {
                        var oLink = document.createElement("a");
                        oLink.href = oData.__metadata.media_src;
                        oLink.download = sFileName;
                        document.body.appendChild(oLink);
                        oLink.click();
                        document.body.removeChild(oLink);
                        MessageToast.show("Downloading file from server: " + sFileName, { position: "bottom center" });
                    } else {
                        that._downloadLocalAttachment(oAttachment, sFileName);
                    }
                },
                error: function() {
                    that._downloadLocalAttachment(oAttachment, sFileName);
                }
            });
        },

        _downloadBase64File: function(sBase64Content, sFileName) {
            try {
                var sBase64Data = sBase64Content.split(',')[1];
                var sMimeType = sBase64Content.split(';')[0].split(':')[1];
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var oBlob = new Blob([byteArray], { type: sMimeType });
                var sUrl = URL.createObjectURL(oBlob);

                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName, { position: "bottom center" });
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName, { position: "bottom center" });
                console.error("Error downloading file:", e);
            }
        },

        _downloadLocalAttachment: function(oAttachment, sFileName) {
            if (!oAttachment || !oAttachment.content) {
                MessageToast.show("Local file content not found for: " + sFileName, { position: "bottom center" });
                return;
            }
            this._downloadBase64File(oAttachment.content, sFileName);
        },

        onDeleteTabAttchment: function(oEvent) {
            var oButton = oEvent.getSource();
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments");
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var iIndex = aAttachments.findIndex(function(oItem) {
                return oItem.ID === sID;
            });
            if (iIndex === -1) return;

            var sFileName = aAttachments[iIndex].fileName;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.remove(sPath, {
                success: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                },
                error: function(oError) {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                }
            });
        },

        _removeAttachmentFromLocalModel: function(oModel, aAttachments, iIndex, sFileName) {
            aAttachments.splice(iIndex, 1);
            oModel.setProperty("/attachments", aAttachments);
            oModel.refresh(true);
        },

        handleLiveChangeLimit1500: function(oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oTextArea.getValue();

            if (sValue.length > 1500) {
                oTextArea.setValue(sValue.substring(0, 1500));
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 1500 characters allowed.");
            } else {
                oTextArea.setValueState("None");
            }
        },

        onTextInputLiveChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var filteredValue = sValue.replace(/[^a-zA-Z0-9]/g, '');

            if (filteredValue !== sValue) {
                oInput.setValue(filteredValue);
            }
            if (filteredValue) {
                oInput.setValueState("None");
                oInput.setValueStateText("");
            }
        },

        // onGetCurrUserforUploadon: function () {
        //     var that = this;
        //     var oModel = this.getOwnerComponent().getModel("approvalservicev2");
        //     oModel.read("/getCurrentUser", {
        //       success: function (oData) {
        //         that.uploadbyEmail = oData.email;
        //         var oUserModel = new sap.ui.model.json.JSONModel(oData);
        //         that.getView().setModel(oUserModel, "CurrentUser");
        //       },
        //       error: function (oError) {
        //         console.error("Error fetching current user:", oError);
        //       }
        //     });
        //   },
        onGetCurrUserforUploadon: function () {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
        
            oModel.read("/getCurrentUser", {
                urlParameters: {
                    role: 'Initiator',
                    dept: 'SSFD'
                },
                success: function (oData) {
                    that.uploadbyEmail = oData.email;
                    var oUserModel = new sap.ui.model.json.JSONModel(oData);
                    that.getView().setModel(oUserModel, "CurrentUser");
                },
                error: function (oError) {
                    console.error("Error fetching current user:", oError);
                }
            });
        },
        
    });
});

UPDETED CODE

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, Fragment, MessageBox) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize attachment model
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");

            // Initialize router and route handlers
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);
            oRouter.getRoute("SanctionfdRef").attachPatternMatched(this._onRouteSanctionfdwithRef, this);
            oRouter.getRoute("SanctionfdRefApproved").attachPatternMatched(this._onRouteSanctionfdApproved, this);

            // Initialize remarks dialog
            this.remarksDialog = sap.ui.xmlfragment(this.getView().getId(), "com.mmapprovalhub.approvalhub.Fragments.remarks", this);
            this.getView().addDependent(this.remarksDialog);

            // Initialize view model
            var oViewModel = new JSONModel({
                enableRowActions: true,
                approvebuttonvisiblity: false,
                approvebuttonfragment: false,
                rejetedbuttonfragmnet: false,
                enableIRR: false,
                enableFinalAccount: false,
                enableFinalAccountInput: false,
                sendbackbuttonvisiblity: false,
                remarkModel: "",
                approverRequiredVisible: false,
                currentUserRole: "",
                isApproverScreen: false,
                enableRowActionsapproval: false
            });
            this.getView().setModel(oViewModel, "viewenableddatacheck");

            // Initialize timeline model
            var oTimelineData = {};
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");

            this.onGetCurrUserforUploadon();
        },

        // Formatter for subType display
        formatSubType: function(sSubType) {
            var mSubTypeMap = {
                "NR": "New Requirement",
                "CON": "Contingency",
                "ILT": "Interline Transfer",
                "BCF": "Budget Carry-Forward",
                "SAVING": "Savings",
                "ITH": "Interhead Transfer",
                "COR": "Cost Over-Run",
                "PPA": "Preproject Approval",
                "CBCF": "Capex Budget Carry-Forward",
                "OTH": "Others"
            };
            return mSubTypeMap[sSubType] || sSubType || "N/A";
        },

        _onRouteSanctionfdApproved: function(oEvent) {
            this._ApprovedCheck = "";
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = oArgs.approved;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that.stagesData = oData.results[0].stage;

                        var oViewModel = that.getView().getModel("viewenableddatacheck");

                        if (that.stagesData === "Final Accounts" && that.statusData === "Pending") {
                            oViewModel.setProperty("/enableFinalAccount", true);
                            oViewModel.setProperty("/enableFinalAccountInput", true);
                        } else {
                            oViewModel.setProperty("/enableFinalAccount", false);
                            oViewModel.setProperty("/enableFinalAccountInput", false);
                        }

                        if (statusDatacheck === "Draft" || !statusDatacheck) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", that._ApprovedCheck === "Approved");
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        if (that._ApprovedCheck === "Approved" && (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD")) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", true);
                            oViewModel.setProperty("/approverRequiredVisible", true);
                            var costoverrunShowApprover = oData.results[0].ssfdDtl.subType;
                            if (that.stagesData === "GM PMO" && costoverrunShowApprover === "COR") {
                                oViewModel.setProperty("/isApproverScreen", true);
                                oViewModel.setProperty("/enableRowActionsapproval", true);
                            } else {
                                oViewModel.setProperty("/isApproverScreen", false);
                                oViewModel.setProperty("/enableRowActionsapproval", false);
                            }
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load request data.", { position: "bottom center" });
                    console.error("Error fetching request data:", oError);
                }
            });
        },

        _onRouteSanctionfdwithRef: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = "";
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that._onSubType = oData.results[0].ssfdDtl.subType || "";

                        var oViewModel = that.getView().getModel("viewenableddatacheck");
                        if (statusDatacheck === "Draft" || !statusDatacheck || statusDatacheck === "Send Back") {
                            oViewModel.setProperty("/enableRowActions", true);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Approved") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var onInitiateValue = localStorage.getItem("onInitiateValue");
            var onInitiateValueData = "";
            if (onInitiateValue === "New Requirement") {
                onInitiateValueData = "NR";
            } else if (onInitiateValue === "Contingency") {
                onInitiateValueData = "CON";
            } else if (onInitiateValue === "Interline Transfer") {
                onInitiateValueData = "ILT";
            } else if (onInitiateValue === "Budget Carry-Forward") {
                onInitiateValueData = "BCF";
            } else if (onInitiateValue === "Savings") {
                onInitiateValueData = "SAVING";
            } else if (onInitiateValue === "Interhead Transfer") {
                onInitiateValueData = "ITH";
            } else if (onInitiateValue === "Cost Over-Run") {
                onInitiateValueData = "COR";
            } else if (onInitiateValue === "Preproject Approval") {
                onInitiateValueData = "PPA";
            } else if (onInitiateValue === "Capex Budget Carry-Forward") {
                onInitiateValueData = "CBCF";
            } else if (onInitiateValue === "Others") {
                onInitiateValueData = "OTH";
            }
            this._onSubType = onInitiateValueData;
            this._reqIDData = "";
            this._ApprovedCheck = "";
            var oViewModel = this.getView().getModel("viewenableddatacheck");
            oViewModel.setProperty("/enableRowActions", true);
            oViewModel.setProperty("/enableIRR", false);
            oViewModel.setProperty("/approverRequiredVisible", false);
            oViewModel.setProperty("/isApproverScreen", false);
            oViewModel.setProperty("/enableRowActionsapproval", false);

            // Clear attachments when selecting a new request
            var oAttachmentModel = this.getView().getModel("UploadDocSrvTabData");
            oAttachmentModel.setProperty("/attachments", []);

            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Revenue Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Personnel Cost", amount: 0, contingency: 0, total: 0 },
                    { nature: "Total", amount: 0, contingency: 0, total: 0 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");

            var oRequestServiceModel = this.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
            this.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
            var oEmptyData = {
                reqID: "",
                refNo: "",
                requesterName: "",
                department: "",
                market: "",
                location: "",
                hod: "",
                ssfdDtl: {
                    subType: this._onSubType,
                    division: "FD",
                    puDept: "",
                    hod: "",
                    loc: "",
                    projName: "",
                    itemRequiredDesc: "",
                    budgetRequired: 0,
                    irr: "",
                    market: "",
                    implDt: null,
                    enggHours: "",
                    remarks: "",
                    background: "",
                    justification: "",
                    deliverables: "",
                    capitalBudget: 0,
                    revenueBudget: 0,
                    personnelCost: 0,
                    selectedApprover: ""
                }
            };
            oRequestServiceModel.setData(oEmptyData);
            this.onDepartmentDataFetch();
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch();
        },

        onBudgetDetailDataFetch: function(reqID) {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            var subtype = this._onSubType;
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];

            sap.ui.core.BusyIndicator.show(0);
            oModelV2.read("/ReqFormFD('" + reqID + "')", {
                success: function(oData) {
                    if (oData.items && Array.isArray(oData.items)) {
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                var amount = parseFloat(item.amount || 0);
                                if (item.nature === "Capital Budget" && validSubTypes.includes(subtype) && amount > 0) {
                                    item.contingency = parseFloat((amount * 0.05).toFixed(2));
                                    item.total = parseFloat((amount + item.contingency).toFixed(2));
                                } else {
                                    item.contingency = 0;
                                    item.total = parseFloat(amount.toFixed(2));
                                }
                            }
                        });

                        // Recalculate total row
                        var totalAmount = 0, totalContingency = 0, totalFinal = 0;
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                totalAmount += parseFloat(item.amount || 0);
                                totalContingency += parseFloat(item.contingency || 0);
                                totalFinal += parseFloat(item.total || 0);
                            }
                        });

                        oData.items.forEach(function(item) {
                            if (item.nature === "Total") {
                                item.amount = parseFloat(totalAmount.toFixed(2));
                                item.contingency = parseFloat(totalContingency.toFixed(2));
                                item.total = parseFloat(totalFinal.toFixed(2));
                            }
                        });

                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "budgetModel");
                        that._updateIRREnabledState(totalFinal);
                    }
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Error fetching budget data:", oError);
                    MessageToast.show("Failed to fetch budget data.", { position: "bottom center" });
                }
            });
        },

        _updateIRREnabledState: function(totalBudget) {
            var enableIRR = (totalBudget * 100000) > 30000000;
            this.getView().getModel("viewenableddatacheck").setProperty("/enableIRR", enableIRR);
            if (!enableIRR) {
                this.getView().byId("inputIRR").setValue("");
            }
        },

        onFetchTimelinessData: function() {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");

            oModelV2.read("/ProcessLogs", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                urlParameters: {
                    "$orderby": "createdAt desc"
                },
                success: function(oData) {
                    if (oData && oData.results) {
                        var aProcessedData = oData.results.map(function(oLog) {
                            return {
                                createdAt: oLog.createdAt,
                                role: oLog.stage ? "[" + oLog.stage + "]" : "[N/A]",
                                userName: oLog.userName || "Unknown User",
                                userEmail: oLog.userEmail || "N/A",
                                remarks: oLog.remarks || "Yet to be Approved"
                            };
                        });

                        var initiatorIndex = aProcessedData.findIndex(function(item) {
                            return item.role.toLowerCase().includes("initiator");
                        });

                        if (initiatorIndex > -1) {
                            var initiatorEntry = aProcessedData.splice(initiatorIndex, 1)[0];
                            aProcessedData.push(initiatorEntry);
                        }

                        var oJSONModel = new JSONModel({
                            results: aProcessedData
                        });
                        oView.setModel(oJSONModel, "timelinesslogdata");
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load process log data.", { position: "bottom center" });
                    console.error("Error fetching timeliness data:", oError);
                }
            });
        },

        formatTimelineTitle: function(role, userName, userEmail) {
            return role + " " + userName + " (" + userEmail + ")";
        },

        onAttchmentDataFetch: function () {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
        
            // Define date formatter here
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "dd-MM-yyyy "
            });
        
            oModelV2.read("/ReqAttachments", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function (oData) {
                    if (oData && oData.results) {
                        var aAttachments = oData.results.map(function (item) {
                            return {
                                ID: item.ID,
                                fileName: item.fileName,
                                createdBy: item.createdBy || "anonymous",
                                createdAt: item.createdAt ? oDateFormat.format(new Date(item.createdAt)) : "", // safe check
                                deleteTabVisible: true,
                                content: item.content,
                                // mimeType: item.mimeType
                            };
                        });
        
                        var oJSONModel = new sap.ui.model.json.JSONModel({
                            attachments: aAttachments
                        });
                        oView.setModel(oJSONModel, "UploadDocSrvTabData");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load attachment data.", {
                        position: "bottom center"
                    });
                    console.error("Error fetching attachment data:", oError);
                }
            });
        },        

        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                urlParameters: {
                    "$filter": "department eq 'SSFD' and role eq 'HOD'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        onDepartmentDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_DEPARTMENT'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSDEPARTMENTData");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load department data.", { position: "bottom center" });
                    console.error("Error fetching department data:", oError);
                }
            });
        },

        onMarketDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_MARKET'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSMARKETDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load market data.", { position: "bottom center" });
                    console.error("Error fetching market data:", oError);
                }
            });
        },

        onLocationDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_LOCATION'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load location data.", { position: "bottom center" });
                    console.error("Error fetching location data:", oError);
                }
            });
        },

        onDashboardui: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else if (this._SanctionfdNameUI === "SSFD") {
                oRouter.navTo("DashboardUI", { Name: "SSFD" });
            }
        },

        onCancelSanctionform: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            MessageToast.show("Navigating back to dashboard...", { position: "bottom center" });
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else {
                oRouter.navTo("DashboardUI", { Name: this._SanctionfdNameUI });
            }
        },

        attachmentuploadFilesData: function(reqid) {
            var oModelTabdata = this.getView().getModel("UploadDocSrvTabData");
            var aFilesData = oModelTabdata.getProperty("/attachments") || [];
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            sap.ui.core.BusyIndicator.show(0);

            aFilesData.forEach(function(file) {
                if (!file.fileName || file.uploaded) return;

                if (file.content && typeof file.content === "string" && file.content.includes(',')) {
                    var base64Content = file.content.split(',')[1];
                    var payload = {
                        fileName: file.fileName,
                        content: base64Content,
                        mediaType: file.mimeType || "text/plain",
                        reqID: reqid
                    };

                    oModel.create("/ReqAttachments", payload, {
                        success: function() {
                            file.uploaded = true;
                            oModelTabdata.refresh(true);
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function(oError) {
                            MessageToast.show("Error uploading attachment: " + file.fileName, { position: "bottom center" });
                            console.error("Error uploading attachment:", oError);
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
            });
        },

        _calculateBudgetItems: function(aBudgetItems, subType) {
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
            var totalAmount = 0, totalContingency = 0, totalFinal = 0;

            aBudgetItems.forEach(function(item) {
                if (item.nature !== "Total") {
                    var amount = parseFloat(item.amount || 0);
                    if (item.nature === "Capital Budget" && validSubTypes.includes(subType) && amount > 0) {
                        item.contingency = parseFloat((amount * 0.05).toFixed(2));
                        item.total = parseFloat((amount + item.contingency).toFixed(2));
                    } else {
                        item.contingency = 0;
                        item.total = parseFloat(amount.toFixed(2));
                    }
                    if (item.nature === "Revenue Budget" || item.nature === "Personnel Cost") {
                        item.amount = 0;
                        item.contingency = 0;
                        item.total = 0;
                    }
                    totalAmount += amount;
                    totalContingency += item.contingency;
                    totalFinal += item.total;
                }
            });

            aBudgetItems.forEach(function(item) {
                if (item.nature === "Total") {
                    item.amount = parseFloat(totalAmount.toFixed(2));
                    item.contingency = parseFloat(totalContingency.toFixed(2));
                    item.total = parseFloat(totalFinal.toFixed(2));
                }
            });

            return aBudgetItems;
        },

        onSaveSanctionform: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            var subType = this._onSubType;
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var reqid = this._reqIDData;
            var statusData = this.statusData || "Draft";
            var satauscheckdata = statusData === "Pending" ? "Pending" : "Draft";
            if (statusData === "Sent Back") {
                satauscheckdata = "Sent Back";
            }
            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSavePayload = {
                stage: "Initiator",
                status: satauscheckdata,
                type: "SSFD",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if (!reqid) {
                oModel.create("/Requests", oSavePayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        var reqID = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        MessageBox.success("Request saved successfully!");
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSavePayload, {
                    success: function() {
                        that.attachmentuploadFilesData(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                        MessageBox.success("Request updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                location: oView.byId("comboLocation_Senca").getSelectedKey(),
                budget: oView.byId("BudgetValue").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("department_sensce").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                attachments: oView.getModel("UploadDocSrvTabData").getProperty("/attachments"),
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };
            MessageToast.show("Form data and attachments saved.", { position: "bottom center" });
            this._oSaveDialog.close();
        },

        onCancelSave: function() {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.", { position: "bottom center" });
        },

        onSubmitSanctionform: function() {
            var isValid = true;
            var oView = this.getView();
            var controls = [
                { control: oView.byId("comboLocation_Senca"), field: "Location" },
                { control: oView.byId("department_sensce"), field: "Department" },
                { control: oView.byId("comboMarket_Senca"), field: "Market" },
                { control: oView.byId("Hod_SanctionData"), field: "HOD" },
                { control: oView.byId("inputHour"), field: "Engineering Hours" },
                { control: oView.byId("inputProjectName"), field: "Project Name" },
                { control: oView.byId("inputItemRequired"), field: "Item Required/Description" },
                { control: oView.byId("_IDGenTextArea"), field: "Background/Current Scenario" },
                { control: oView.byId("_IDGenTextArea1"), field: "Proposal/Justification" },
                { control: oView.byId("_IDGenTextArea2"), field: "Deliverables" }
            ];

            var missingFields = [];

            controls.forEach(function(item) {
                item.control.setValueState("None");
                var control = item.control;
                var value = control.getValue ? control.getValue().trim() : control.getSelectedKey();
                if (!value) {
                    item.control.setValueState("None");
                    isValid = false;
                    missingFields.push(item.field);
                } else if (item.control.getId().includes("inputHour")) {
                    var hours = parseFloat(value);
                    if (isNaN(hours) || hours <= 0) {
                        item.control.setValueState("None");
                        isValid = false;
                        missingFields.push(item.field + " (must be a positive number)");
                    }
                }
            });

            if (!isValid) {
                var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
                MessageBox.error(errorMessage);
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", false);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", true);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onComboBoxChange: function(oEvent) {
            var oComboBox = oEvent.getSource();
            var sValue = oEvent.getParameter("newValue") || oComboBox.getValue();
            var aItems = oComboBox.getItems();
            var bValid = aItems.some(function(oItem) {
                return oItem.getKey() === sValue || oItem.getText() === sValue;
            });

            oComboBox.setValueState(bValid ? "None" : "Error");
            if (!bValid) {
                MessageToast.show("Please select a valid option from the dropdown.", { position: "bottom center" });
            }
        },

        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var fValue = parseFloat(sNewValue);
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
        
            if (isNaN(fValue) || fValue < 0) {
                oInput.setValueState("Error");
                MessageToast.show("Budget amount cannot be negative.", { position: "bottom center" });
                return;
            }
            oInput.setValueState("None");
        
            aItems[iIndex].amount = fValue || 0;
            if (aItems[iIndex].nature === "Capital Budget" && validSubTypes.includes(this._onSubType) && fValue > 0) {
                aItems[iIndex].contingency = Number((aItems[iIndex].amount * 0.05).toFixed(2));
            } else {
                aItems[iIndex].contingency = 0;
            }
            aItems[iIndex].total = Number((aItems[iIndex].amount + aItems[iIndex].contingency).toFixed(2));
        
            // Remove the restriction that sets Revenue Budget and Personnel Cost to 0
            // Only apply contingency logic to Capital Budget as per valid subtypes
            if (aItems[iIndex].nature !== "Capital Budget" || !validSubTypes.includes(this._onSubType)) {
                aItems[iIndex].contingency = 0;
                aItems[iIndex].total = Number(aItems[iIndex].amount.toFixed(2));
            }
        
            // Recalculate total row
            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount || 0;
                iTotalContingency += aItems[i].contingency || 0;
            }
        
            aItems[3].amount = Number(iTotalAmount.toFixed(2));
            aItems[3].contingency = Number(iTotalContingency.toFixed(2));
            aItems[3].total = Number((iTotalAmount + iTotalContingency).toFixed(2));
        
            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
            this.getView().byId("BudgetValue").setValue(aItems[3].total.toString());
            this._updateIRREnabledState(aItems[3].total);
        },
        
        _calculateBudgetItems: function(aBudgetItems, subType) {
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
            var totalAmount = 0, totalContingency = 0, totalFinal = 0;
        
            aBudgetItems.forEach(function(item) {
                if (item.nature !== "Total") {
                    var amount = parseFloat(item.amount || 0);
                    if (item.nature === "Capital Budget" && validSubTypes.includes(subType) && amount > 0) {
                        item.contingency = parseFloat((amount * 0.05).toFixed(2));
                        item.total = parseFloat((amount + item.contingency).toFixed(2));
                    } else {
                        item.contingency = 0;
                        item.total = parseFloat(amount.toFixed(2));
                    }
                    // Allow Revenue Budget and Personnel Cost to retain their entered values
                    if (item.nature === "Revenue Budget" || item.nature === "Personnel Cost") {
                        item.contingency = 0; // No contingency for these categories
                        item.total = parseFloat(amount.toFixed(2)); // Total equals the entered amount
                    }
                    totalAmount += amount;
                    totalContingency += item.contingency;
                    totalFinal += item.total;
                }
            });
        
            aBudgetItems.forEach(function(item) {
                if (item.nature === "Total") {
                    item.amount = parseFloat(totalAmount.toFixed(2));
                    item.contingency = parseFloat(totalContingency.toFixed(2));
                    item.total = parseFloat(totalFinal.toFixed(2));
                }
            });
        
            return aBudgetItems;
        },

        onHoursChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var value = oEvent.getParameter("value");
            oInput.setValueState("None");

            if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                oInput.setValueState("Error");
                MessageToast.show("Engineering Hours must be a positive number.", { position: "bottom center" });
            }
        },

        onHodSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onDepartmentSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onMarketSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onLocationSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onApprovedSanctionform: function() {
            var oView = this.getView();
            var isValid = true;

            ["wbsInput", "costCenterInput"].forEach(function(id) {
                var input = oView.byId(id);
                var value = input.getValue().trim();
                if (!value) {
                    input.setValueState("Error");
                    input.setValueStateText("This field is required.");
                    isValid = false;
                }
            });

            var hours = oView.byId("inputHour");
            hours.setValueState("None");

            if (!hours.getValue() || isNaN(parseFloat(hours.getValue())) || parseFloat(hours.getValue()) <= 0) {
                hours.setValueState("Error");
                MessageBox.error("Please enter valid Engineering Hours (must be a positive number).");
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", true);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", true);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", true);
            this.remarksDialog.open();
        },

        onRejectDataSanctionForm: function() {
            var oView = this.getView();
            var hours = oView.byId("inputHour");
            hours.setValueState("None");

            if (!hours.getValue() || isNaN(parseFloat(hours.getValue())) || parseFloat(hours.getValue()) <= 0) {
                hours.setValueState("Error");
                MessageBox.error("Please enter valid Engineering Hours (must be a positive number).");
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", true);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", true);
            this.remarksDialog.open();
        },

        onCloseReamrksFrag: function() {
            this.remarksDialog.close();
        },

        onRejectedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Reject.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                stage: "Rejected",
                status: "Rejected",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.rejecteddatacheckRejected(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.rejecteddatacheckRejected(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        rejecteddatacheckRejected: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "REJECT",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request rejected successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    MessageToast.show("Error rejecting request.", { position: "bottom center" });
                    console.error("Error rejecting request:", oError);
                }
            });
        },

        onSendbackData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        that.sendbackdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        that.sendbackdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onApprovedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Approve.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                WBSNumber: oView.byId("wbsInput").getValue() || "",
                costCentre: oView.byId("costCenterInput").getValue() || "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onSubmitReamrksData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var subtypedata = this._onSubType;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subtypedata);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                subType: subtypedata,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : ""
            };

            var oSubmitPayload = {
                stage: "HOD",
                status: "Pending",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var reqID = oData.reqID;
                        that.approverdatacheck(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacheck(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        sendbackdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SENT BACK",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request Sent Back successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "APPROVE",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request approved successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                sap.ui.core.BusyIndicator.hide();
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheck: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SUBMIT",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success(oData.SSFDApproval?.message || "Request submitted successfully!", {
                        onClose: function() {
                            if (that._SanctionfdNameUI === "SSFD") {
                                sap.ui.core.BusyIndicator.hide();
                                that.getOwnerComponent().getRouter().navTo("DashboardUI", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error submitting request.", { position: "bottom center" });
                    console.error("Error submitting request:", oError);
                }
            });
        },

        onUploadTabAttchmment: function(oEvent) {
            const oFileUploader = oEvent.getSource();
            const aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("No files selected.", { position: "bottom center" });
                return;
            }

            const oModel = this.getView().getModel("UploadDocSrvTabData");
            const oUserModel = this.getOwnerComponent().getModel("approvalservicev2");
            const aAttachments = oModel.getProperty("/attachments") || [];
            const sUploadedOn = new Date().toISOString().split("T")[0];
            const that = this;

            oUserModel.callFunction("/getCurrentUser", {
                method: "GET",
                urlParameters: {
                    role: "Initiator"
                },
                success: function(oData) {
                    const sUploadedBy = oData && oData.name ? oData.name : "Unknown";

                    for (let i = 0; i < aFiles.length; i++) {
                        (function(file, index) {
                            const oReader = new FileReader();
                            oReader.onload = function(e) {
                                const sBase64Data = e.target.result;

                                aAttachments.push({
                                    ID: new Date().getTime().toString() + index,
                                    fileName: file.name,
                                    mimeType: file.type,
                                    content: sBase64Data,
                                    createdBy: sUploadedBy,
                                    createdAt: sUploadedOn,
                                    deleteTabVisible: true
                                });

                                if (index === aFiles.length - 1) {
                                    oModel.setProperty("/attachments", aAttachments);
                                    oModel.refresh(true);
                                    MessageToast.show("Files uploaded: " + aFiles.length, { position: "bottom center" });
                                    oFileUploader.setValue("");
                                }
                            };
                            oReader.onerror = function() {
                                MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                            };
                            oReader.readAsDataURL(file);
                        })(aFiles[i], i);
                    }
                },
                error: function() {
                    MessageToast.show("Failed to fetch current user.", { position: "bottom center" });
                }
            });
        },

        onUploadPress: function() {
            var oFileUploader = this.byId("fileUploaderTabAttchment");
            var aFiles = oFileUploader.getDomRef().files;

            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("Please select at least one file first.", { position: "bottom center" });
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var sUploadedBy = "Current User"; // Hardcoded for simplicity, replace with actual user if needed

            aAttachments = aAttachments.filter(function(item) {
                return !item.temp;
            });

            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result;
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            createdBy: sUploadedBy,
                            createdAt: sUploadedOn,
                            deleteTabVisible: true,
                            content: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true);
                            MessageToast.show("Uploaded " + aFiles.length + " file(s) successfully!", { position: "bottom center" });
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                    };
                    oReader.readAsDataURL(file);
                })(aFiles[i], i);
            }
        },

        onDownloadTabAttachemnt: function(oEvent) {
            var oButton = oEvent.getSource();
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var sFileName = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "fileName";
            }).getValue();

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.read(sPath, {
                success: function(oData) {
                    if (oData && oData.__metadata && oData.__metadata.media_src) {
                        var oLink = document.createElement("a");
                        oLink.href = oData.__metadata.media_src;
                        oLink.download = sFileName;
                        document.body.appendChild(oLink);
                        oLink.click();
                        document.body.removeChild(oLink);
                        MessageToast.show("Downloading file from server: " + sFileName, { position: "bottom center" });
                    } else {
                        that._downloadLocalAttachment(oAttachment, sFileName);
                    }
                },
                error: function() {
                    that._downloadLocalAttachment(oAttachment, sFileName);
                }
            });
        },

        _downloadBase64File: function(sBase64Content, sFileName) {
            try {
                var sBase64Data = sBase64Content.split(',')[1];
                var sMimeType = sBase64Content.split(';')[0].split(':')[1];
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var oBlob = new Blob([byteArray], { type: sMimeType });
                var sUrl = URL.createObjectURL(oBlob);

                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName, { position: "bottom center" });
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName, { position: "bottom center" });
                console.error("Error downloading file:", e);
            }
        },

        _downloadLocalAttachment: function(oAttachment, sFileName) {
            if (!oAttachment || !oAttachment.content) {
                MessageToast.show("Local file content not found for: " + sFileName, { position: "bottom center" });
                return;
            }
            this._downloadBase64File(oAttachment.content, sFileName);
        },

        onDeleteTabAttchment: function(oEvent) {
            var oButton = oEvent.getSource();
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments");
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var iIndex = aAttachments.findIndex(function(oItem) {
                return oItem.ID === sID;
            });
            if (iIndex === -1) return;

            var sFileName = aAttachments[iIndex].fileName;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.remove(sPath, {
                success: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                },
                error: function(oError) {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                    console.error("Error deleting attachment:", oError);
                }
            });
        },

        _removeAttachmentFromLocalModel: function(oModel, aAttachments, iIndex, sFileName) {
            aAttachments.splice(iIndex, 1);
            oModel.setProperty("/attachments", aAttachments);
            oModel.refresh(true);
        },

        handleLiveChangeLimit1500: function(oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oTextArea.getValue();

            if (sValue.length > 1500) {
                oTextArea.setValue(sValue.substring(0, 1500));
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 1500 characters allowed.");
            } else {
                oTextArea.setValueState("None");
            }
        },

        onTextInputLiveChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var filteredValue = sValue.replace(/[^a-zA-Z0-9]/g, '');

            if (filteredValue !== sValue) {
                oInput.setValue(filteredValue);
            }
            if (filteredValue) {
                oInput.setValueState("None");
                oInput.setValueStateText("");
            }
        },

        // onGetCurrUserforUploadon: function () {
        //     var that = this;
        //     var oModel = this.getOwnerComponent().getModel("approvalservicev2");
        //     oModel.read("/getCurrentUser", {
        //       success: function (oData) {
        //         that.uploadbyEmail = oData.email;
        //         var oUserModel = new sap.ui.model.json.JSONModel(oData);
        //         that.getView().setModel(oUserModel, "CurrentUser");
        //       },
        //       error: function (oError) {
        //         console.error("Error fetching current user:", oError);
        //       }
        //     });
        //   },
        onGetCurrUserforUploadon: function () {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
        
            oModel.read("/getCurrentUser", {
                urlParameters: {
                    role: 'Initiator',
                    dept: 'SSFD'
                },
                success: function (oData) {
                    that.uploadbyEmail = oData.email;
                    var oUserModel = new sap.ui.model.json.JSONModel(oData);
                    that.getView().setModel(oUserModel, "CurrentUser");
                },
                error: function (oError) {
                    console.error("Error fetching current user:", oError);
                }
            });
        },
        
    });
});


OLD CODE

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, Fragment, MessageBox) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize attachment model
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");

            // Initialize router and route handlers
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);
            oRouter.getRoute("SanctionfdRef").attachPatternMatched(this._onRouteSanctionfdwithRef, this);
            oRouter.getRoute("SanctionfdRefApproved").attachPatternMatched(this._onRouteSanctionfdApproved, this);

            // Initialize remarks dialog
            this.remarksDialog = sap.ui.xmlfragment(this.getView().getId(), "com.mmapprovalhub.approvalhub.Fragments.remarks", this);
            this.getView().addDependent(this.remarksDialog);

            // Initialize view model
            var oViewModel = new JSONModel({
                enableRowActions: true,
                approvebuttonvisiblity: false,
                approvebuttonfragment: false,
                rejetedbuttonfragmnet: false,
                enableIRR: false,
                enableFinalAccount: false,
                enableFinalAccountInput: false,
                sendbackbuttonvisiblity: false,
                remarkModel: "",
                approverRequiredVisible: false,
                currentUserRole: "",
                isApproverScreen: false,
                enableRowActionsapproval: false
            });
            this.getView().setModel(oViewModel, "viewenableddatacheck");

            // Initialize timeline model
            var oTimelineData = {};
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");
        },

        // Formatter for subType display
        formatSubType: function(sSubType) {
            var mSubTypeMap = {
                "NR": "New Requirement",
                "CON": "Contingency",
                "ILT": "Interline Transfer",
                "BCF": "Budget Carry-Forward",
                "SAVING": "Savings",
                "ITH": "Interhead Transfer",
                "COR": "Cost Over-Run",
                "PPA": "Preproject Approval",
                "CBCF": "Capex Budget Carry-Forward",
                "OTH": "Others"
            };
            return mSubTypeMap[sSubType] || sSubType || "N/A";
        },

        _onRouteSanctionfdApproved: function(oEvent) {
            this._ApprovedCheck = "";
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = oArgs.approved;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that.stagesData = oData.results[0].stage;

                        var oViewModel = that.getView().getModel("viewenableddatacheck");

                        if (that.stagesData === "Final Accounts" && that.statusData === "Pending") {
                            oViewModel.setProperty("/enableFinalAccount", true);
                            oViewModel.setProperty("/enableFinalAccountInput", true);
                        } else {
                            oViewModel.setProperty("/enableFinalAccount", false);
                            oViewModel.setProperty("/enableFinalAccountInput", false);
                        }

                        if (statusDatacheck === "Draft" || !statusDatacheck) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", that._ApprovedCheck === "Approved");
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        if (that._ApprovedCheck === "Approved" && (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD")) {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", true);
                            oViewModel.setProperty("/approverRequiredVisible", true);
                            var costoverrunShowApprover = oData.results[0].ssfdDtl.subType;
                            if (that.stagesData === "GM PMO" && costoverrunShowApprover === "COR") {
                                oViewModel.setProperty("/isApproverScreen", true);
                                oViewModel.setProperty("/enableRowActionsapproval", true);
                            } else {
                                oViewModel.setProperty("/isApproverScreen", false);
                                oViewModel.setProperty("/enableRowActionsapproval", false);
                            }
                        } else {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load request data.", { position: "bottom center" });
                    console.error("Error fetching request data:", oError);
                }
            });
        },

        _onRouteSanctionfdwithRef: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck = "";
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = statusDatacheck;
                        that._onSubType = oData.results[0].ssfdDtl.subType || "";

                        var oViewModel = that.getView().getModel("viewenableddatacheck");
                        if (statusDatacheck === "Draft" || !statusDatacheck || statusDatacheck === "Send Back") {
                            oViewModel.setProperty("/enableRowActions", true);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        } else if (statusDatacheck === "Approved") {
                            oViewModel.setProperty("/enableRowActions", false);
                            oViewModel.setProperty("/approvebuttonvisiblity", false);
                            oViewModel.setProperty("/approverRequiredVisible", false);
                            oViewModel.setProperty("/isApproverScreen", false);
                            oViewModel.setProperty("/enableRowActionsapproval", false);
                        }

                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                        that.onBudgetDetailDataFetch(reqID);
                    } else {
                        MessageToast.show("No data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var onInitiateValue = localStorage.getItem("onInitiateValue");
            var onInitiateValueData = "";
            if (onInitiateValue === "New Requirement") {
                onInitiateValueData = "NR";
            } else if (onInitiateValue === "Contingency") {
                onInitiateValueData = "CON";
            } else if (onInitiateValue === "Interline Transfer") {
                onInitiateValueData = "ILT";
            } else if (onInitiateValue === "Budget Carry-Forward") {
                onInitiateValueData = "BCF";
            } else if (onInitiateValue === "Savings") {
                onInitiateValueData = "SAVING";
            } else if (onInitiateValue === "Interhead Transfer") {
                onInitiateValueData = "ITH";
            } else if (onInitiateValue === "Cost Over-Run") {
                onInitiateValueData = "COR";
            } else if (onInitiateValue === "Preproject Approval") {
                onInitiateValueData = "PPA";
            } else if (onInitiateValue === "Capex Budget Carry-Forward") {
                onInitiateValueData = "CBCF";
            } else if (onInitiateValue === "Others") {
                onInitiateValueData = "OTH";
            }
            this._onSubType = onInitiateValueData;
            this._reqIDData = "";
            this._ApprovedCheck = "";
            var oViewModel = this.getView().getModel("viewenableddatacheck");
            oViewModel.setProperty("/enableRowActions", true);
            oViewModel.setProperty("/enableIRR", false);
            oViewModel.setProperty("/approverRequiredVisible", false);
            oViewModel.setProperty("/isApproverScreen", false);
            oViewModel.setProperty("/enableRowActionsapproval", false);

            // Clear attachments when selecting a new request
            var oAttachmentModel = this.getView().getModel("UploadDocSrvTabData");
            oAttachmentModel.setProperty("/attachments", []);

            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Revenue Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Personnel Cost", amount: 0, contingency: 0, total: 0 },
                    { nature: "Total", amount: 0, contingency: 0, total: 0 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");

            var oRequestServiceModel = this.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
            this.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
            var oEmptyData = {
                reqID: "",
                refNo: "",
                requesterName: "",
                department: "",
                market: "",
                location: "",
                hod: "",
                ssfdDtl: {
                    subType: this._onSubType,
                    division: "FD",
                    puDept: "",
                    hod: "",
                    loc: "",
                    projName: "",
                    itemRequiredDesc: "",
                    budgetRequired: 0,
                    irr: "",
                    market: "",
                    implDt: null,
                    enggHours: "",
                    remarks: "",
                    background: "",
                    justification: "",
                    deliverables: "",
                    capitalBudget: 0,
                    revenueBudget: 0,
                    personnelCost: 0,
                    selectedApprover: ""
                }
            };
            oRequestServiceModel.setData(oEmptyData);
            this.onDepartmentDataFetch();
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch();
        },

        onBudgetDetailDataFetch: function(reqID) {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            var subtype = this._onSubType;
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];

            sap.ui.core.BusyIndicator.show(0);
            oModelV2.read("/ReqFormFD('" + reqID + "')", {
                success: function(oData) {
                    if (oData.items && Array.isArray(oData.items)) {
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                var amount = parseFloat(item.amount || 0);
                                if (item.nature === "Capital Budget" && validSubTypes.includes(subtype) && amount > 0) {
                                    item.contingency = parseFloat((amount * 0.05).toFixed(2));
                                    item.total = parseFloat((amount + item.contingency).toFixed(2));
                                } else {
                                    item.contingency = 0;
                                    item.total = parseFloat(amount.toFixed(2));
                                }
                            }
                        });

                        // Recalculate total row
                        var totalAmount = 0, totalContingency = 0, totalFinal = 0;
                        oData.items.forEach(function(item) {
                            if (item.nature !== "Total") {
                                totalAmount += parseFloat(item.amount || 0);
                                totalContingency += parseFloat(item.contingency || 0);
                                totalFinal += parseFloat(item.total || 0);
                            }
                        });

                        oData.items.forEach(function(item) {
                            if (item.nature === "Total") {
                                item.amount = parseFloat(totalAmount.toFixed(2));
                                item.contingency = parseFloat(totalContingency.toFixed(2));
                                item.total = parseFloat(totalFinal.toFixed(2));
                            }
                        });

                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "budgetModel");
                        that._updateIRREnabledState(totalFinal);
                    }
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Error fetching budget data:", oError);
                    MessageToast.show("Failed to fetch budget data.", { position: "bottom center" });
                }
            });
        },

        _updateIRREnabledState: function(totalBudget) {
            var enableIRR = (totalBudget * 100000) > 30000000;
            this.getView().getModel("viewenableddatacheck").setProperty("/enableIRR", enableIRR);
            if (!enableIRR) {
                this.getView().byId("inputIRR").setValue("");
            }
        },

        onFetchTimelinessData: function() {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");

            oModelV2.read("/ProcessLogs", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                urlParameters: {
                    "$orderby": "createdAt desc"
                },
                success: function(oData) {
                    if (oData && oData.results) {
                        var aProcessedData = oData.results.map(function(oLog) {
                            return {
                                createdAt: oLog.createdAt,
                                role: oLog.stage ? "[" + oLog.stage + "]" : "[N/A]",
                                userName: oLog.userName || "Unknown User",
                                userEmail: oLog.userEmail || "N/A",
                                remarks: oLog.remarks || "Yet to be Approved"
                            };
                        });

                        var initiatorIndex = aProcessedData.findIndex(function(item) {
                            return item.role.toLowerCase().includes("initiator");
                        });

                        if (initiatorIndex > -1) {
                            var initiatorEntry = aProcessedData.splice(initiatorIndex, 1)[0];
                            aProcessedData.push(initiatorEntry);
                        }

                        var oJSONModel = new JSONModel({
                            results: aProcessedData
                        });
                        oView.setModel(oJSONModel, "timelinesslogdata");
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load process log data.", { position: "bottom center" });
                    console.error("Error fetching timeliness data:", oError);
                }
            });
        },

        formatTimelineTitle: function(role, userName, userEmail) {
            return role + " " + userName + " (" + userEmail + ")";
        },

        onAttchmentDataFetch: function () {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
        
            // Define date formatter here
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "dd-MM-yyyy "
            });
        
            oModelV2.read("/ReqAttachments", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function (oData) {
                    if (oData && oData.results) {
                        var aAttachments = oData.results.map(function (item) {
                            return {
                                ID: item.ID,
                                fileName: item.fileName,
                                createdBy: item.createdBy || "anonymous",
                                createdAt: item.createdAt ? oDateFormat.format(new Date(item.createdAt)) : "", // safe check
                                deleteTabVisible: true,
                                content: item.content,
                                // mimeType: item.mimeType
                            };
                        });
        
                        var oJSONModel = new sap.ui.model.json.JSONModel({
                            attachments: aAttachments
                        });
                        oView.setModel(oJSONModel, "UploadDocSrvTabData");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load attachment data.", {
                        position: "bottom center"
                    });
                    console.error("Error fetching attachment data:", oError);
                }
            });
        },        

        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                urlParameters: {
                    "$filter": "department eq 'SSFD' and role eq 'HOD'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
                    console.error("Error fetching HOD data:", oError);
                }
            });
        },

        onDepartmentDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_DEPARTMENT'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSDEPARTMENTData");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load department data.", { position: "bottom center" });
                    console.error("Error fetching department data:", oError);
                }
            });
        },

        onMarketDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_MARKET'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSMARKETDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load market data.", { position: "bottom center" });
                    console.error("Error fetching market data:", oError);
                }
            });
        },

        onLocationDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                    "$filter": "category eq 'SS_LOCATION'"
                },
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load location data.", { position: "bottom center" });
                    console.error("Error fetching location data:", oError);
                }
            });
        },

        onDashboardui: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else if (this._SanctionfdNameUI === "SSFD") {
                oRouter.navTo("DashboardUI", { Name: "SSFD" });
            }
        },

        onCancelSanctionform: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            MessageToast.show("Navigating back to dashboard...", { position: "bottom center" });
            if (this._ApprovedCheck === "Approved") {
                oRouter.navTo("approverdashboard", { Name: "SSFD" });
            } else {
                oRouter.navTo("DashboardUI", { Name: this._SanctionfdNameUI });
            }
        },

        attachmentuploadFilesData: function(reqid) {
            var oModelTabdata = this.getView().getModel("UploadDocSrvTabData");
            var aFilesData = oModelTabdata.getProperty("/attachments") || [];
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            sap.ui.core.BusyIndicator.show(0);

            aFilesData.forEach(function(file) {
                if (!file.fileName || file.uploaded) return;

                if (file.content && typeof file.content === "string" && file.content.includes(',')) {
                    var base64Content = file.content.split(',')[1];
                    var payload = {
                        fileName: file.fileName,
                        content: base64Content,
                        mediaType: file.mimeType || "text/plain",
                        reqID: reqid
                    };

                    oModel.create("/ReqAttachments", payload, {
                        success: function() {
                            file.uploaded = true;
                            oModelTabdata.refresh(true);
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function(oError) {
                            MessageToast.show("Error uploading attachment: " + file.fileName, { position: "bottom center" });
                            console.error("Error uploading attachment:", oError);
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
            });
        },

        _calculateBudgetItems: function(aBudgetItems, subType) {
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
            var totalAmount = 0, totalContingency = 0, totalFinal = 0;

            aBudgetItems.forEach(function(item) {
                if (item.nature !== "Total") {
                    var amount = parseFloat(item.amount || 0);
                    if (item.nature === "Capital Budget" && validSubTypes.includes(subType) && amount > 0) {
                        item.contingency = parseFloat((amount * 0.05).toFixed(2));
                        item.total = parseFloat((amount + item.contingency).toFixed(2));
                    } else {
                        item.contingency = 0;
                        item.total = parseFloat(amount.toFixed(2));
                    }
                    if (item.nature === "Revenue Budget" || item.nature === "Personnel Cost") {
                        item.amount = 0;
                        item.contingency = 0;
                        item.total = 0;
                    }
                    totalAmount += amount;
                    totalContingency += item.contingency;
                    totalFinal += item.total;
                }
            });

            aBudgetItems.forEach(function(item) {
                if (item.nature === "Total") {
                    item.amount = parseFloat(totalAmount.toFixed(2));
                    item.contingency = parseFloat(totalContingency.toFixed(2));
                    item.total = parseFloat(totalFinal.toFixed(2));
                }
            });

            return aBudgetItems;
        },

        onSaveSanctionform: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            var subType = this._onSubType;
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var reqid = this._reqIDData;
            var statusData = this.statusData || "Draft";
            var satauscheckdata = statusData === "Pending" ? "Pending" : "Draft";
            if (statusData === "Sent Back") {
                satauscheckdata = "Sent Back";
            }
            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSavePayload = {
                stage: "Initiator",
                status: satauscheckdata,
                type: "SSFD",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if (!reqid) {
                oModel.create("/Requests", oSavePayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        var reqID = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        MessageBox.success("Request saved successfully!");
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSavePayload, {
                    success: function() {
                        that.attachmentuploadFilesData(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                        MessageBox.success("Request updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                location: oView.byId("comboLocation_Senca").getSelectedKey(),
                budget: oView.byId("BudgetValue").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("department_sensce").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                attachments: oView.getModel("UploadDocSrvTabData").getProperty("/attachments"),
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };
            MessageToast.show("Form data and attachments saved.", { position: "bottom center" });
            this._oSaveDialog.close();
        },

        onCancelSave: function() {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.", { position: "bottom center" });
        },

        onSubmitSanctionform: function() {
            var isValid = true;
            var oView = this.getView();
            var controls = [
                { control: oView.byId("comboLocation_Senca"), field: "Location" },
                { control: oView.byId("department_sensce"), field: "Department" },
                { control: oView.byId("comboMarket_Senca"), field: "Market" },
                { control: oView.byId("Hod_SanctionData"), field: "HOD" },
                { control: oView.byId("inputHour"), field: "Engineering Hours" },
                { control: oView.byId("inputProjectName"), field: "Project Name" },
                { control: oView.byId("inputItemRequired"), field: "Item Required/Description" },
                { control: oView.byId("_IDGenTextArea"), field: "Background/Current Scenario" },
                { control: oView.byId("_IDGenTextArea1"), field: "Proposal/Justification" },
                { control: oView.byId("_IDGenTextArea2"), field: "Deliverables" }
            ];

            var missingFields = [];

            controls.forEach(function(item) {
                item.control.setValueState("None");
                var control = item.control;
                var value = control.getValue ? control.getValue().trim() : control.getSelectedKey();
                if (!value) {
                    item.control.setValueState("None");
                    isValid = false;
                    missingFields.push(item.field);
                } else if (item.control.getId().includes("inputHour")) {
                    var hours = parseFloat(value);
                    if (isNaN(hours) || hours <= 0) {
                        item.control.setValueState("None");
                        isValid = false;
                        missingFields.push(item.field + " (must be a positive number)");
                    }
                }
            });

            if (!isValid) {
                var errorMessage = "Please fill all required fields: " + missingFields.join(", ");
                MessageBox.error(errorMessage);
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", false);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", true);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", this._ApprovedCheck === "Approved");
            this.remarksDialog.open();
        },

        onComboBoxChange: function(oEvent) {
            var oComboBox = oEvent.getSource();
            var sValue = oEvent.getParameter("newValue") || oComboBox.getValue();
            var aItems = oComboBox.getItems();
            var bValid = aItems.some(function(oItem) {
                return oItem.getKey() === sValue || oItem.getText() === sValue;
            });

            oComboBox.setValueState(bValid ? "None" : "Error");
            if (!bValid) {
                MessageToast.show("Please select a valid option from the dropdown.", { position: "bottom center" });
            }
        },

        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var fValue = parseFloat(sNewValue);
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
        
            if (isNaN(fValue) || fValue < 0) {
                oInput.setValueState("Error");
                MessageToast.show("Budget amount cannot be negative.", { position: "bottom center" });
                return;
            }
            oInput.setValueState("None");
        
            aItems[iIndex].amount = fValue || 0;
            if (aItems[iIndex].nature === "Capital Budget" && validSubTypes.includes(this._onSubType) && fValue > 0) {
                aItems[iIndex].contingency = Number((aItems[iIndex].amount * 0.05).toFixed(2));
            } else {
                aItems[iIndex].contingency = 0;
            }
            aItems[iIndex].total = Number((aItems[iIndex].amount + aItems[iIndex].contingency).toFixed(2));
        
            // Remove the restriction that sets Revenue Budget and Personnel Cost to 0
            // Only apply contingency logic to Capital Budget as per valid subtypes
            if (aItems[iIndex].nature !== "Capital Budget" || !validSubTypes.includes(this._onSubType)) {
                aItems[iIndex].contingency = 0;
                aItems[iIndex].total = Number(aItems[iIndex].amount.toFixed(2));
            }
        
            // Recalculate total row
            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount || 0;
                iTotalContingency += aItems[i].contingency || 0;
            }
        
            aItems[3].amount = Number(iTotalAmount.toFixed(2));
            aItems[3].contingency = Number(iTotalContingency.toFixed(2));
            aItems[3].total = Number((iTotalAmount + iTotalContingency).toFixed(2));
        
            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
            this.getView().byId("BudgetValue").setValue(aItems[3].total.toString());
            this._updateIRREnabledState(aItems[3].total);
        },
        
        _calculateBudgetItems: function(aBudgetItems, subType) {
            var validSubTypes = ["NR", "COR", "CBCF", "OTH"];
            var totalAmount = 0, totalContingency = 0, totalFinal = 0;
        
            aBudgetItems.forEach(function(item) {
                if (item.nature !== "Total") {
                    var amount = parseFloat(item.amount || 0);
                    if (item.nature === "Capital Budget" && validSubTypes.includes(subType) && amount > 0) {
                        item.contingency = parseFloat((amount * 0.05).toFixed(2));
                        item.total = parseFloat((amount + item.contingency).toFixed(2));
                    } else {
                        item.contingency = 0;
                        item.total = parseFloat(amount.toFixed(2));
                    }
                    // Allow Revenue Budget and Personnel Cost to retain their entered values
                    if (item.nature === "Revenue Budget" || item.nature === "Personnel Cost") {
                        item.contingency = 0; // No contingency for these categories
                        item.total = parseFloat(amount.toFixed(2)); // Total equals the entered amount
                    }
                    totalAmount += amount;
                    totalContingency += item.contingency;
                    totalFinal += item.total;
                }
            });
        
            aBudgetItems.forEach(function(item) {
                if (item.nature === "Total") {
                    item.amount = parseFloat(totalAmount.toFixed(2));
                    item.contingency = parseFloat(totalContingency.toFixed(2));
                    item.total = parseFloat(totalFinal.toFixed(2));
                }
            });
        
            return aBudgetItems;
        },

        onHoursChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var value = oEvent.getParameter("value");
            oInput.setValueState("None");

            if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                oInput.setValueState("Error");
                MessageToast.show("Engineering Hours must be a positive number.", { position: "bottom center" });
            }
        },

        onHodSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onDepartmentSanctionChange: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onMarketSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onLocationSenca: function(oEvent) {
            this.onComboBoxChange(oEvent);
        },

        onApprovedSanctionform: function() {
            var oView = this.getView();
            var isValid = true;

            ["wbsInput", "costCenterInput"].forEach(function(id) {
                var input = oView.byId(id);
                var value = input.getValue().trim();
                if (!value) {
                    input.setValueState("Error");
                    input.setValueStateText("This field is required.");
                    isValid = false;
                }
            });

            var hours = oView.byId("inputHour");
            hours.setValueState("None");

            if (!hours.getValue() || isNaN(parseFloat(hours.getValue())) || parseFloat(hours.getValue()) <= 0) {
                hours.setValueState("Error");
                MessageBox.error("Please enter valid Engineering Hours (must be a positive number).");
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", true);
            oView.getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", false);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", true);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", true);
            this.remarksDialog.open();
        },

        onRejectDataSanctionForm: function() {
            var oView = this.getView();
            var hours = oView.byId("inputHour");
            hours.setValueState("None");

            if (!hours.getValue() || isNaN(parseFloat(hours.getValue())) || parseFloat(hours.getValue()) <= 0) {
                hours.setValueState("Error");
                MessageBox.error("Please enter valid Engineering Hours (must be a positive number).");
                return;
            }

            this.getView().getModel("viewenableddatacheck").setProperty("/remarkModel", "");
            oView.getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
            oView.getModel("viewenableddatacheck").setProperty("/sendbackbuttonvisiblity", true);
            oView.getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblityData", false);
            oView.getModel("viewenableddatacheck").setProperty("/approverRequiredVisible", true);
            this.remarksDialog.open();
        },

        onCloseReamrksFrag: function() {
            this.remarksDialog.close();
        },

        onRejectedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Reject.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                stage: "Rejected",
                status: "Rejected",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.rejecteddatacheckRejected(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.rejecteddatacheckRejected(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        rejecteddatacheckRejected: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "REJECT",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request rejected successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    MessageToast.show("Error rejecting request.", { position: "bottom center" });
                    console.error("Error rejecting request:", oError);
                }
            });
        },

        onSendbackData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        that.sendbackdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        that.sendbackdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onApprovedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before Approve.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, this._onSubType);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : "",
                WBSNumber: oView.byId("wbsInput").getValue() || "",
                costCentre: oView.byId("costCenterInput").getValue() || "",
                subType: this._onSubType
            };

            var oSubmitPayload = {
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(oData.reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.approverdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        onSubmitReamrksData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var subtypedata = this._onSubType;
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            if (!remarkInput) {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            aBudgetItems = this._calculateBudgetItems(aBudgetItems, subtypedata);
            oView.getModel("budgetModel").setProperty("/items", aBudgetItems);
            oView.getModel("budgetModel").refresh(true);

            var oSsfdDtl = {
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod_SanctionData").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getDateValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: remarkInput,
                subType: subtypedata,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                selectedApprover: this._ApprovedCheck === "Approved" ? oView.byId("approverRequiredFrom").getSelectedKey() : ""
            };

            var oSubmitPayload = {
                stage: "HOD",
                status: "Pending",
                type: "SSFD",
                remarks: remarkInput,
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            if (!reqid) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that._reqIDData = oData.reqID;
                        that.attachmentuploadFilesData(oData.reqID);
                        var reqID = oData.reqID;
                        that.approverdatacheck(oData.reqID);
                        var oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel") || new JSONModel();
                        that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        oRequestServiceModel.setData(oData);
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                        console.error("Error saving request:", oError);
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function() {
                        sap.ui.core.BusyIndicator.hide();
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacheck(reqid);
                        var reqID = reqid;
                        that.onBudgetDetailDataFetch(reqID);
                    },
                    error: function(oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error updating request: " + oError.message, { position: "bottom center" });
                        console.error("Error updating request:", oError);
                    }
                });
            }
        },

        sendbackdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SENT BACK",
                remarks: remarkInput
            };
            var that = this;

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request Sent Back successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "APPROVE",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function() {
                    MessageBox.success("Request approved successfully!", {
                        onClose: function() {
                            if (that._ApprovedCheck === "Approved") {
                                sap.ui.core.BusyIndicator.hide();
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    console.error("Error approving request:", oError);
                }
            });
        },

        approverdatacheck: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var remarkInput = this.getView().getModel("viewenableddatacheck").getProperty("/remarkModel");
            var oApprovedPayload = {
                reqID: reqid,
                action: "SUBMIT",
                remarks: remarkInput
            };
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success(oData.SSFDApproval?.message || "Request submitted successfully!", {
                        onClose: function() {
                            if (that._SanctionfdNameUI === "SSFD") {
                                sap.ui.core.BusyIndicator.hide();
                                that.getOwnerComponent().getRouter().navTo("DashboardUI", { Name: "SSFD" });
                            }
                        }
                    });
                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error submitting request.", { position: "bottom center" });
                    console.error("Error submitting request:", oError);
                }
            });
        },

        onUploadTabAttchmment: function(oEvent) {
            const oFileUploader = oEvent.getSource();
            const aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("No files selected.", { position: "bottom center" });
                return;
            }

            const oModel = this.getView().getModel("UploadDocSrvTabData");
            const oUserModel = this.getOwnerComponent().getModel("approvalservicev2");
            const aAttachments = oModel.getProperty("/attachments") || [];
            const sUploadedOn = new Date().toISOString().split("T")[0];
            const that = this;

            oUserModel.callFunction("/getCurrentUser", {
                method: "GET",
                urlParameters: {
                    role: "Initiator"
                },
                success: function(oData) {
                    const sUploadedBy = oData && oData.name ? oData.name : "Unknown";

                    for (let i = 0; i < aFiles.length; i++) {
                        (function(file, index) {
                            const oReader = new FileReader();
                            oReader.onload = function(e) {
                                const sBase64Data = e.target.result;

                                aAttachments.push({
                                    ID: new Date().getTime().toString() + index,
                                    fileName: file.name,
                                    mimeType: file.type,
                                    content: sBase64Data,
                                    createdBy: sUploadedBy,
                                    createdAt: sUploadedOn,
                                    deleteTabVisible: true
                                });

                                if (index === aFiles.length - 1) {
                                    oModel.setProperty("/attachments", aAttachments);
                                    oModel.refresh(true);
                                    MessageToast.show("Files uploaded: " + aFiles.length, { position: "bottom center" });
                                    oFileUploader.setValue("");
                                }
                            };
                            oReader.onerror = function() {
                                MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                            };
                            oReader.readAsDataURL(file);
                        })(aFiles[i], i);
                    }
                },
                error: function() {
                    MessageToast.show("Failed to fetch current user.", { position: "bottom center" });
                }
            });
        },

        onUploadPress: function() {
            var oFileUploader = this.byId("fileUploaderTabAttchment");
            var aFiles = oFileUploader.getDomRef().files;

            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("Please select at least one file first.", { position: "bottom center" });
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var sUploadedBy = "Current User"; // Hardcoded for simplicity, replace with actual user if needed

            aAttachments = aAttachments.filter(function(item) {
                return !item.temp;
            });

            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result;
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            createdBy: sUploadedBy,
                            createdAt: sUploadedOn,
                            deleteTabVisible: true,
                            content: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true);
                            MessageToast.show("Uploaded " + aFiles.length + " file(s) successfully!", { position: "bottom center" });
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name, { position: "bottom center" });
                    };
                    oReader.readAsDataURL(file);
                })(aFiles[i], i);
            }
        },

        onDownloadTabAttachemnt: function(oEvent) {
            var oButton = oEvent.getSource();
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var sFileName = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "fileName";
            }).getValue();

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.read(sPath, {
                success: function(oData) {
                    if (oData && oData.__metadata && oData.__metadata.media_src) {
                        var oLink = document.createElement("a");
                        oLink.href = oData.__metadata.media_src;
                        oLink.download = sFileName;
                        document.body.appendChild(oLink);
                        oLink.click();
                        document.body.removeChild(oLink);
                        MessageToast.show("Downloading file from server: " + sFileName, { position: "bottom center" });
                    } else {
                        that._downloadLocalAttachment(oAttachment, sFileName);
                    }
                },
                error: function() {
                    that._downloadLocalAttachment(oAttachment, sFileName);
                }
            });
        },

        _downloadBase64File: function(sBase64Content, sFileName) {
            try {
                var sBase64Data = sBase64Content.split(',')[1];
                var sMimeType = sBase64Content.split(';')[0].split(':')[1];
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var oBlob = new Blob([byteArray], { type: sMimeType });
                var sUrl = URL.createObjectURL(oBlob);

                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName, { position: "bottom center" });
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName, { position: "bottom center" });
                console.error("Error downloading file:", e);
            }
        },

        _downloadLocalAttachment: function(oAttachment, sFileName) {
            if (!oAttachment || !oAttachment.content) {
                MessageToast.show("Local file content not found for: " + sFileName, { position: "bottom center" });
                return;
            }
            this._downloadBase64File(oAttachment.content, sFileName);
        },

        onDeleteTabAttchment: function(oEvent) {
            var oButton = oEvent.getSource();
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments");
            var sID = oButton.getCustomData().find(function(oData) {
                return oData.getKey() === "ID";
            }).getValue();
            var iIndex = aAttachments.findIndex(function(oItem) {
                return oItem.ID === sID;
            });
            if (iIndex === -1) return;

            var sFileName = aAttachments[iIndex].fileName;
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;

            oModelV2.remove(sPath, {
                success: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                },
                error: function(oError) {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                    console.error("Error deleting attachment:", oError);
                }
            });
        },

        _removeAttachmentFromLocalModel: function(oModel, aAttachments, iIndex, sFileName) {
            aAttachments.splice(iIndex, 1);
            oModel.setProperty("/attachments", aAttachments);
            oModel.refresh(true);
        },

        handleLiveChangeLimit1500: function(oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oTextArea.getValue();

            if (sValue.length > 1500) {
                oTextArea.setValue(sValue.substring(0, 1500));
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 1500 characters allowed.");
            } else {
                oTextArea.setValueState("None");
            }
        },

        onTextInputLiveChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var filteredValue = sValue.replace(/[^a-zA-Z0-9]/g, '');

            if (filteredValue !== sValue) {
                oInput.setValue(filteredValue);
            }
            if (filteredValue) {
                oInput.setValueState("None");
                oInput.setValueStateText("");
            }
        }
    });
});
