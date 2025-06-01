new code 4 

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
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Revenue Budget", total: 0 },
                    { nature: "Personnel Cost", total: 0 },
                    { nature: "Total", amount: 0, contingency: 0, total: 0 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);
            oRouter.getRoute("SanctionfdRef").attachPatternMatched(this._onRouteSanctionfdwithRef, this);
            oRouter.getRoute("SanctionfdRefApproved").attachPatternMatched(this._onRouteSanctionfdApproved, this);

            this.remarksDialog = sap.ui.xmlfragment("com/mmapprovalhub/approvalhub/Fragments/remarks", this);
            this.getView().addDependent(this.remarksDialog);
            var oViewModel = new JSONModel({
                enableRowActions: true,
                approvebuttonvisiblity: false,
                approvebuttonfragment: false,
                rejetedbuttonfragmnet: false
            });
            this.getView().setModel(oViewModel, "viewenableddatacheck");

            var oTimelineData = {
                timelineItems: [
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ankit Pathak Created a Request",
                        text: "Data Save",
                        userName: "Ankit Pathak",
                        userPicture: "https://ui-avatars.com/api/?name=Ankit+Rath"
                    },
                    {
                        dateTime: "7/22/2016 at 6:00 PM",
                        title: "Yugal Created a Request",
                        text: "Data Submit",
                        userName: "Yugal",
                        userPicture: "https://ui-avatars.com/api/?name=Yugal"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ayushi Mam added a note [Approved]",
                        text: "Submitted.",
                        userName: "Ayushi Mam",
                        userPicture: "https://ui-avatars.com/api/?name=Ayushi"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Aakib Mohd added a note [Approved]",
                        text: "Done.",
                        userName: "Aakib Mohd",
                        userPicture: "https://ui-avatars.com/api/?name=Aakib+Mohd"
                    }
                ]
            };
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");
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
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel");
                        if (!oRequestServiceModel) {
                            oRequestServiceModel = new JSONModel();
                            that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        }
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = oData.results[0].status;
                        that.stagesData = oData.results[0].stage;

                        if (statusDatacheck === "Draft" || statusDatacheck === "" || statusDatacheck === null) {
                            that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                            that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                            that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);
                        } else {
                            that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                            that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);
                        }

                        if (that._ApprovedCheck === "Approved" && (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD")) {
                            that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                            that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", true);
                        } else {
                            that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                            that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);
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
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel");
                        if (!oRequestServiceModel) {
                            oRequestServiceModel = new JSONModel();
                            that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        }
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck = oData.results[0].status;
                        that.statusData = oData.results[0].status;

                        if (statusDatacheck === "Draft" || statusDatacheck === "" || statusDatacheck === null) {
                            that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", true);
                            that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);
                        } else if (statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD") {
                            that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                            that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);
                        } else if (statusDatacheck === "Approved") {
                            that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                            that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);
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
                }
            });
        },

        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var basedNameUI = oArgs.basedNameUISSFD;
            this._SanctionfdNameUI = basedNameUI;
            this._reqIDData = "";
            this._ApprovedCheck = "";
            this.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", true);

            var oRequestServiceModel = this.getOwnerComponent().getModel("Requestservicemodel");
            if (!oRequestServiceModel) {
                oRequestServiceModel = new JSONModel();
                this.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
            }
            var oEmptyData = {
                reqID: "",
                refNo: "",
                requesterName: "",
                department: "",
                market: "",
                location: "",
                hod: "",
                ssfdDtl: []
            };
            oRequestServiceModel.setData(oEmptyData);
            this.onDepartmentDataFetch();
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch();
            this.onBudgetDetailDataFetch("REQ-FD-0001");
        },

        onBudgetDetailDataFetch: function(reqID) {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;

            oModelV2.read("/ReqFormFD('REQ-FD-0009')", {
                success: function(oData) {
                    if (oData) {
                        var oBudgetData = {
                            items: [
                                { 
                                    nature: "Capital Budget", 
                                    amount: oData.capitalBudget || 0, 
                                    contingency: oData.capitalBudget ? oData.capitalBudget * 0.05 : 0, 
                                    total: oData.capitalBudget ? oData.capitalBudget + (oData.capitalBudget * 0.05) : 0 
                                },
                                { nature: "Revenue Budget", total: oData.revenueBudget || 0 },
                                { nature: "Personnel Cost", total: oData.personnelCost || 0 },
                                { 
                                    nature: "Total", 
                                    amount: (oData.capitalBudget || 0) + (oData.revenueBudget || 0) + (oData.personnelCost || 0),
                                    contingency: oData.capitalBudget ? oData.capitalBudget * 0.05 : 0,
                                    total: (oData.capitalBudget || 0) + (oData.revenueBudget || 0) + (oData.personnelCost || 0) + (oData.capitalBudget ? oData.capitalBudget * 0.05 : 0)
                                }
                            ]
                        };
                        var oBudgetModel = new JSONModel(oBudgetData);
                        oView.setModel(oBudgetModel, "budgetModel");
                        oView.byId("BudgetValue").setValue(oBudgetData.items[oBudgetData.items.length - 1].total.toString());
                    } else {
                        MessageToast.show("No budget data found for Req ID: " + reqID, { position: "bottom center" });
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load budget data.", { position: "bottom center" });
                }
            });
        },

        onFetchTimelinessData: function() {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");

            oModelV2.read("/ProcessLogs", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function(oData) {
                    if (oData && oData.results) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "timelinesslogdata");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load attachment data.", { position: "bottom center" });
                    console.error(oError);
                }
            });
        },

        onAttchmentDataFetch: function() {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");

            oModelV2.read("/ReqAttachments", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function(oData) {
                    if (oData && oData.results) {
                        var oJSONModel = new JSONModel({
                            attachments: oData.results
                        });
                        oView.setModel(oJSONModel, "UploadDocSrvTabData");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load attachment data.", { position: "bottom center" });
                    console.error(oError);
                }
            });
        },

        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    MessageToast.show("Failed to load HOD data.", { position: "bottom center" });
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
                }
            });
        },

        onDashboardui: function() {
            var Approved = this._ApprovedCheck;
            if (Approved === "Approved") {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("approverdashboard", {});
            } else {
                var Name = this._SanctionfdNameUI;
                if (Name === "SSFD") {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("DashboardUI", {
                        Name: "SSFD"
                    });
                }
            }
        },

        onBackDashboardpage: function() {
            MessageToast.show("Navigating back to dashboard...", { position: "bottom center" });
        },

        attachmentuploadFilesData: function(reqid) {
            var oModelTabdata = this.getView().getModel("UploadDocSrvTabData");
            var aFilesData = oModelTabdata.getProperty("/attachments");
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");

            if (aFilesData) {
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
                            },
                            error: function() {
                                MessageToast.show("Error uploading attachment: " + file.fileName, { position: "bottom center" });
                            }
                        });
                    }
                });
            }
        },

        onSaveSanctionform: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            var reqid = this._reqIDData;
            var statusData = this.statusData;
            var satauscheckdata = "";
            if (statusData === "" || statusData === null || statusData === undefined) {
                satauscheckdata = "Draft";
            } else if (statusData === "Draft") {
                satauscheckdata = "Draft";
            } else if (statusData === "Pending") {
                satauscheckdata = "Pending";
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
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0
            };

            var oSavePayload = {
                stage: satauscheckdata,
                status: satauscheckdata,
                type: "SSFD",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };

            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            if (!this._reqIDData) {
                oModel.create("/Requests", oSavePayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        var reqid = oData.reqID;
                        if (oData) {
                            var oComponent = that.getOwnerComponent();
                            var oRequestServiceModel = oComponent.getModel("Requestservicemodel");
                            if (!oRequestServiceModel) {
                                oRequestServiceModel = new JSONModel();
                                oComponent.setModel(oRequestServiceModel, "Requestservicemodel");
                            }
                            oRequestServiceModel.setData(oData);
                        }
                        that.attachmentuploadFilesData(reqid);
                        MessageBox.success("Request saved successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSavePayload, {
                    success: function(oData) {
                        that.attachmentuploadFilesData(reqid);
                        MessageBox.success("Request Updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                    }
                });
            }
        },

        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                referenceNumber: oView.byId("inputRefNumber").getValue(),
                location: oView.byId("comboLocation").getSelectedKey(),
                budget: oView.byId("inputBudget").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("Division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("Department").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket").getSelectedKey(),
                hod: oView.byId("Hod").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                expectedOutcome: oView.byId("_IDGenTextArea2").getValue(),
                attachments: this.getView().getModel("UploadDocSrvTabData").getProperty("/attachments")
            };
            MessageToast.show("Form data and attachments saved: " + JSON.stringify(oFormData), { position: "bottom center" });
            this._oSaveDialog.close();
        },

        onCancelSave: function() {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.", { position: "bottom center" });
        },

        onSubmitSanctionform: function() {
            var isValid = true;

            var location = this.getView().byId("comboLocation_Senca");
            var department = this.getView().byId("department_sensce");
            var market = this.getView().byId("comboMarket_Senca");
            var hod = this.getView().byId("Hod_SanctionData");
            location.setValueState("None");
            department.setValueState("None");
            market.setValueState("None");
            hod.setValueState("None");

            if (!location.getValue()) {
                location.setValueState("Error");
                isValid = false;
            }
            if (!department.getValue()) {
                department.setValueState("Error");
                isValid = false;
            }
            if (!market.getValue()) {
                market.setValueState("Error");
                isValid = false;
            }
            if (!hod.getValue()) {
                hod.setValueState("Error");
                isValid = false;
            }
            if (!isValid) {
                MessageBox.error("Please fill all required fields.");
                return;
            }
            sap.ui.getCore().byId("RemarkInput").setValue("");
            this.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", false);
            this.getView().getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);

            this.remarksDialog.open();
        },

        onHodSanctionChange: function() {
            var hod = this.getView().byId("Hod_SanctionData");
            hod.setValueState("None");
        },

        onDepartmentSanctionChange: function() {
            var DepartmentSan = this.getView().byId("department_sensce");
            DepartmentSan.setValueState("None");
        },

        onMarketSenca: function() {
            var comboMarket_Senca = this.getView().byId("comboMarket_Senca");
            comboMarket_Senca.setValueState("None");
        },

        onLocationSenca: function() {
            var comboLocation_Senca = this.getView().byId("comboLocation_Senca");
            comboLocation_Senca.setValueState("None");
        },

        onApprovedSanctionform: function() {
            sap.ui.getCore().byId("RemarkInput").setValue("");
            this.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", true);
            this.getView().getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", false);

            this.remarksDialog.open();
        },

        onRejectDataSanctionForm: function() {
            sap.ui.getCore().byId("RemarkInput").setValue("");
            this.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonfragment", false);
            this.getView().getModel("viewenableddatacheck").setProperty("/rejetedbuttonfragmnet", true);

            this.remarksDialog.open();
        },

        onCloseReamrksFrag: function() {
            this.remarksDialog.close();
        },

        onRejectedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var RemarkInput = sap.ui.getCore().byId("RemarkInput").getValue();
            if (RemarkInput === "") {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
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
                remarks: RemarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0
            };
            var oSubmitPayload = {
                stage: "Rejected",
                status: "Rejected",
                type: "SSFD",
                remarks: RemarkInput,
                ssfdDtl: oSsfdDtl
            };
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if (!this._reqIDData) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        var reqid = oData.reqID;
                        that.rejecteddatacheckRejected(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function(oData) {
                        that.rejecteddatacheckRejected(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                    }
                });
            }
        },

        rejecteddatacheckRejected: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var RemarkInput = sap.ui.getCore().byId("RemarkInput").getValue();
            var oApprovedPayload = {
                reqID: reqid,
                action: "REJECT",
                remarks: RemarkInput
            };
            var that = this;
            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success("Request Rejected successfully!", {
                        onClose: function() {
                            var Approved = that._ApprovedCheck;
                            if (Approved === "APPROVE") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard");
                            }
                        }
                    });
                },
                error: function(oError) {
                    MessageToast.show("Error rejecting request.", { position: "bottom center" });
                }
            });
        },

        onApprovedData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var RemarkInput = sap.ui.getCore().byId("RemarkInput").getValue();
            if (RemarkInput === "") {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
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
                remarks: RemarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0
            };
            var oSubmitPayload = {
                stage: "Approved",
                status: "Approved",
                type: "SSFD",
                remarks: RemarkInput,
                ssfdDtl: oSsfdDtl
            };
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if (!this._reqIDData) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        var reqid = oData.reqID;
                        that.approverdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function(oData) {
                        that.approverdatacheckApproved(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                    }
                });
            }
        },

        onSubmitReamrksData: function() {
            var oView = this.getView();
            var reqid = this._reqIDData;
            var RemarkInput = sap.ui.getCore().byId("RemarkInput").getValue();
            if (RemarkInput === "") {
                MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
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
                remarks: RemarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0
            };
            var oSubmitPayload = {
                stage: "Pending",
                status: "Pending At HOD",
                type: "SSFD",
                remarks: RemarkInput,
                ssfdDtl: oSsfdDtl
            };
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if (!this._reqIDData) {
                oModel.create("/Requests", oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData = oData.reqID;
                        var reqid = oData.reqID;
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacheck(reqid);
                        if (oData) {
                            var oComponent = that.getOwnerComponent();
                            var oRequestServiceModel = oComponent.getModel("Requestservicemodel");
                            if (!oRequestServiceModel) {
                                oRequestServiceModel = new JSONModel();
                                oComponent.setModel(oRequestServiceModel, "Requestservicemodel");
                            }
                            oRequestServiceModel.setData(oData);
                        }
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                    }
                });
            } else {
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function(oData) {
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacheck(reqid);
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message, { position: "bottom center" });
                    }
                });
            }
        },

        approverdatacheckApproved: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var RemarkInput = sap.ui.getCore().byId("RemarkInput").getValue();
            var oApprovedPayload = {
                reqID: reqid,
                action: "APPROVE",
                remarks: RemarkInput
            };
            var that = this;
            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success("Request Approved successfully!", {
                        onClose: function() {
                            var Approved = that._ApprovedCheck;
                            if (Approved === "APPROVE") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard");
                            }
                        }
                    });
                },
                error: function(oError) {
                    MessageToast.show("Error approving request.", { position: "bottom center" });
                }
            });
        },

        approverdatacheck: function(reqid) {
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var RemarkInput = sap.ui.getCore().byId("RemarkInput").getValue();
            var oApprovedPayload = {
                reqID: reqid,
                action: "SUBMIT",
                remarks: RemarkInput
            };
            var that = this;
            oModel.create("/SSFDApproval", oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success(oData.SSFDApproval?.message || "Request Submitted successfully!", {
                        onClose: function() {
                            var Name = that._SanctionfdNameUI;
                            if (Name === "SSFD") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("DashboardUI", {
                                    Name: "SSFD"
                                });
                            }
                        }
                    });
                },
                error: function(oError) {
                    MessageToast.show("Error submitting request.", { position: "bottom center" });
                }
            });
        },

        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");

            aItems[iIndex].amount = parseFloat(sNewValue) || 0;
            if (aItems[iIndex].nature === "Capital Budget") {
                aItems[iIndex].contingency = aItems[iIndex].amount * 0.05;
                aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;
            } else {
                aItems[iIndex].contingency = 0;
                aItems[iIndex].total = aItems[iIndex].amount;
            }

            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount;
                iTotalContingency += aItems[i].contingency;
            }

            aItems[aItems.length - 1].amount = iTotalAmount;
            aItems[aItems.length - 1].contingency = iTotalContingency;
            aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;

            this.getView().byId("BudgetValue").setValue(aItems[aItems.length - 1].total.toString());

            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
        },

        onUploadTabAttchmment: function(oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("No files selected.", { position: "bottom center" });
                return;
            }
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var that = this;
            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result;
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            mimeType: file.type,
                            content: sBase64Data
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
            var that = this;

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
                            uploadedBy: "Current User",
                            uploadedOn: sUploadedOn,
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
                error: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    MessageToast.show("Deleted " + sFileName, { position: "bottom center" });
                }
            });
        },

        _removeAttachmentFromLocalModel: function(oModel, aAttachments, iIndex, sFileName) {
            aAttachments.splice(iIndex, 1);
            oModel.setProperty("/attachments", aAttachments);
            oModel.refresh(true);
        }
    });
});



NEW CODE 3

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
           
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 0 },
                    { nature: "Revenue Budget",  total: 0 },
                    { nature: "Personnel Cost",  total: 0 },
                    { nature: "Total", amount: 0, contingency: 0, total: 0 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this); //proceed
            oRouter.getRoute("SanctionfdRef").attachPatternMatched(this._onRouteSanctionfdwithRef, this); //Tab Nav
            oRouter.getRoute("SanctionfdRefApproved").attachPatternMatched(this._onRouteSanctionfdApproved, this); //Approver

            this.remarksDialog = sap.ui.xmlfragment("com/mmapprovalhub/approvalhub/Fragments/remarks", this);
            this.getView().addDependent(this.remarksDialog);
            var oViewModel = new sap.ui.model.json.JSONModel({
				enableRowActions: true,
                approvebuttonvisiblity: false
			});
			this.getView().setModel(oViewModel, "viewenableddatacheck");


            var oTimelineData = {
                timelineItems: [
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ankit Pathak Created a Request",
                        text: "Data Save",
                        userName: "Ankit Pathak",
                        userPicture: "https://ui-avatars.com/api/?name=Ankit+Rath"
                    },
                    {
                        dateTime: "7/22/2016 at 6:00 PM",
                        title: "Yugal Created a Request",
                        text: "Data Submit",
                        userName: "Yugal",
                        userPicture: "https://ui-avatars.com/api/?name=Yugal"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ayushi Mam added a note [Approved]",
                        text: "Submitted.",
                        userName: "Ayushi Mam",
                        userPicture: "https://ui-avatars.com/api/?name=Ayushi"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Aakib Mohd added a note [Approved]",
                        text: "Done.",
                        userName: "Aakib Mohd",
                        userPicture: "https://ui-avatars.com/api/?name=Aakib+Mohd"
                    }
                ]
            };
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");

        },
        _onRouteSanctionfdApproved: function(oEvent) {
            this._ApprovedCheck=""
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
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel");
                        if (!oRequestServiceModel) {
                            oRequestServiceModel = new sap.ui.model.json.JSONModel();
                            that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        }
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck =  oData.results[0].status;
                        that.statusData = oData.results[0].status;
                        that.stagesData = oData.results[0].stage;

                       if(statusDatacheck === "Draft" || statusDatacheck === "" || statusDatacheck === null){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);


                       }else if(statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD"){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);

                       }else{
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);
                       }

                       if(that._ApprovedCheck === "Approved" && statusDatacheck === "Pending"){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", true);

                       }else{
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);

                       }
                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                    } else {
                        sap.m.MessageToast.show("No data found for Req ID: " + reqID);
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load HOD data.");
                }
            });
        },
        _onRouteSanctionfdwithRef: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck=""
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel");
                        if (!oRequestServiceModel) {
                            oRequestServiceModel = new sap.ui.model.json.JSONModel();
                            that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        }
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck =  oData.results[0].status;
                        that.statusData = oData.results[0].status;
                       if(statusDatacheck === "Draft" || statusDatacheck === "" || statusDatacheck === null){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", true);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);


                       }else if(statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD"){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);

                       }else if(statusDatacheck === "Approved"){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);

                       }
                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                    } else {
                        sap.m.MessageToast.show("No data found for Req ID: " + reqID);
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load HOD data.");
                }
            });
        },   
        onFetchTimelinessData: function () {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
        
            oModelV2.read("/ProcessLogs", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function (oData) {
                    if (oData && oData.results) {
                        var oJSONModel =  new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "timelinesslogdata");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load attachment data.");
                    console.error(oError);
                }
            });
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
                        var oJSONModel = new sap.ui.model.json.JSONModel({
                            attachments: oData.results
                        });
                        oView.setModel(oJSONModel, "UploadDocSrvTabData");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load attachment data.");
                    console.error(oError);
                }
            });
        },   
        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var basedNameUI = oArgs.basedNameUISSFD;
            this._SanctionfdNameUI = basedNameUI;
            this._reqIDData = "";
            this._ApprovedCheck="";
            this.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", true);

            var oRequestServiceModel = this.getOwnerComponent().getModel("Requestservicemodel");
            if (!oRequestServiceModel) {
                oRequestServiceModel = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
            }
                var oEmptyData = {
                reqID: "",
                refNo: "",
                requesterName: "",
                department: "",
                market: "",
                location: "",
                hod: "",
                ssfdDtl: []  
            };
            oRequestServiceModel.setData(oEmptyData);
            this.onDepartmentDataFetch(); //based filter
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch(); // direct binding
        },        
     
        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load HOD data.", oError);
                }
            });
        },

        onDepartmentDataFetch: function(){
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                  "$filter": "category eq '" + "SS_DEPARTMENT" + "'"
                },
                success: function (oData) {
                  if (oData) {
                    var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                    oView.setModel(oJSONModel, "SSDEPARTMENTData");
                  }
                },
                error: function (oError) {
                  sap.m.MessageToast.show("Failed to load data.", oError);
                }
              });

        },
        onMarketDataFetch: function(){
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                  "$filter": "category eq '" + "SS_MARKET" + "'"
                },
                success: function (oData) {
                  if (oData) {
                    var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                    oView.setModel(oJSONModel, "SSMARKETDataFetch");
                  }
                },
                error: function (oError) {
                  sap.m.MessageToast.show("Failed to load data.", oError);
                }
              });
        },
        onLocationDataFetch: function(){
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                  "$filter": "category eq '" + "SS_LOCATION" + "'"
                },
                success: function (oData) {
                  if (oData) {
                    var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                    oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                  }
                },
                error: function (oError) {
                  sap.m.MessageToast.show("Failed to load data.", oError);
                }
              });
        },
        onDashboardui: function(){
           var Approved =  this._ApprovedCheck;
           if(Approved === "Approved"){
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("approverdashboard", {
               
            });
           }else{
            var Name = this._SanctionfdNameUI;
            if(Name === "SSFD"){
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("DashboardUI", {
                    Name: "SSFD"
                });
            }
           }
          
        },
        onBackDashboardpage: function() {
            MessageToast.show("Navigating back to dashboard...");
            // Example: this.getOwnerComponent().getRouter().navTo("dashboard");
        },
        // attachmentuploadFilesData: function(reqid) {
        //     var oModelUploaddata = this.getView().getModel("UploadDocSrvTabData");
        //     var aFilesToUpload = [];
        //     var oModelAttachmnet = this.getOwnerComponent().getModel("approvalservicev2");

        // },

        attachmentuploadFilesData: function (reqid) {
            var oModelTabdata = this.getView().getModel("UploadDocSrvTabData");
            var aFilesData = oModelTabdata.getProperty("/attachments");
            var aFilesToUpload = [];
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
        
            if (aFilesData) {
                aFilesData.forEach(function (file) {
                    if (!file.fileName) return;
        
                    var fileCopy = Object.assign({}, file);
                    delete fileCopy.ID;
                    if (fileCopy.content && typeof fileCopy.content === "string" && fileCopy.content.includes(',')) {
                        var base64Content = fileCopy.content.split(',')[1];
                        aFilesToUpload.push({
                            fileName: fileCopy.fileName,
                            content: base64Content,
                            mediaType: fileCopy.mimeType || "text/plain",
                            reqID: reqid,
                        });
                    } else {
                        // console.warn("Invalid file content for file:", fileCopy.fileName);
                    }
                });
                aFilesToUpload.forEach(function (attachmentData) {
                    oModel.create("/ReqAttachments", attachmentData, {
                        success: function () {
                        },
                        error: function () {
                        }
                    });
                });
            }
        },            
        onSaveSanctionform: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            var reqid = this._reqIDData;
            var statusData =  this.statusData;
            // var basedNameUISSFD = this._SanctionfdNameUI;
            var satauscheckdata = "";
            if(statusData === "" || statusData === null || statusData === undefined){
                satauscheckdata = "Draft"
            }else if(statusData === "Draft"){
                satauscheckdata = "Draft"
            }else if(statusData === "Pending"){
                satauscheckdata = "Pending"
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
                // revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                // personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
            };
             var oSavePayload = {
                stage: satauscheckdata,
                status: satauscheckdata,
                type: "SSFD",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            if(!this._reqIDData){
                oModel.create("/Requests" , oSavePayload, {
                    success: function(oData) {
                        that._reqIDData =  oData.reqID;
                    //    var reqID =  oData.refNo;
                        if (oData) {
                            var oComponent = that.getOwnerComponent();
                            var oRequestServiceModel = oComponent.getModel("Requestservicemodel");
                            if (!oRequestServiceModel) {
                                oRequestServiceModel = new sap.ui.model.json.JSONModel();
                                oComponent.setModel(oRequestServiceModel, "Requestservicemodel");
                            }
                            oRequestServiceModel.setData(oData);
                        }
                        // that.byId("inputRequestIDSanctionfdpage").setT();
                        var reqid = oData.reqID
                        that.attachmentuploadFilesData(reqid);
                        MessageBox.success("Request saved successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }else{
                oModel.update("/Requests('" + reqid + "')", oSavePayload, {
                    success: function(oData) {
                        var reqid = oData.reqID
                        that.attachmentuploadFilesData(reqid);
                        MessageBox.success("Request Updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }
        },
        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                referenceNumber: oView.byId("inputRefNumber").getValue(),
                location: oView.byId("comboLocation").getSelectedKey(),
                budget: oView.byId("inputBudget").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("Division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("Department").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket").getSelectedKey(),
                hod: oView.byId("Hod").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                expectedOutcome: oView.byId("_IDGenTextArea2").getValue(),
                attachments: this.getView().getModel("UploadDocSrvTabData").getProperty("/attachments")
            };
            MessageToast.show("Form data and attachments saved: " + JSON.stringify(oFormData));
            // Add actual save logic (e.g., OData service call) here
            this._oSaveDialog.close();
        },

        onCancelSave: function() {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.");
        },
        onSubmitSanctionform: function () {
            var isValid = true;
        
            var location = this.getView().byId("comboLocation_Senca");
            var department = this.getView().byId("department_sensce");
            var market = this.getView().byId("comboMarket_Senca");
            var hod = this.getView().byId("Hod_SanctionData");
            location.setValueState("None");
            department.setValueState("None");
            market.setValueState("None");
            hod.setValueState("None");
        
            if (!location.getValue()) {
                location.setValueState("Error");
                isValid = false;
            }
            if (!department.getValue()) {
                department.setValueState("Error");
                isValid = false;
            }
            if (!market.getValue()) {
                market.setValueState("Error");
                isValid = false;
            }
            if (!hod.getValue()) {
                hod.setValueState("Error");
                isValid = false;
            }
            if (!isValid) {
                sap.m.MessageBox.error("Please fill all required fields.");
                return;
            }
            sap.ui.getCore().byId("RemarkInput").setValue("");
            this.remarksDialog.open();
        },    
        onHodSanctionChange: function(){
            var hod = this.getView().byId("Hod_SanctionData");
            hod.setValueState("None");
        },
        onDepartmentSanctionChange : function(){
            var DepartmentSan = this.getView().byId("department_sensce");
            DepartmentSan.setValueState("None");
        }, 
        onMarketSenca : function(){
            var comboMarket_Senca = this.getView().byId("comboMarket_Senca");
            comboMarket_Senca.setValueState("None");
        }, 
        onLocationSenca : function(){
            var comboLocation_Senca = this.getView().byId("comboLocation_Senca");
            comboLocation_Senca.setValueState("None");
        }, 
        onApprovedSanctionform: function(){
            sap.ui.getCore().byId("RemarkInput").setValue("");
            this.remarksDialog.open();
        },
        
        onCloseReamrksFrag: function(){
            this.remarksDialog.close();
        },
        onApprovedData: function(){
            var oView = this.getView();
            var reqid = this._reqIDData
            var statusData =  this.statusData
            var stagesData = this.stagesData
            var satauscheckdata = ""
            var stagescheckdata = ""
            // if(statusData === ""){
            //     satauscheckdata = "Draft"
            // }else if(statusData === "Draft"){
            //     satauscheckdata = "Draft"
            // }else if(statusData === "Pending At HOD"){
            //     satauscheckdata = "Approved"
            // }
            // if(stagesData === ""){
            //     stagescheckdata = "Draft"
            // }else if(stagesData === "Draft"){
            //     stagescheckdata = "Draft"
            // }else if(stagesData === "Pending"){
            //     stagescheckdata = "Approved"
            // }
            var RemarkInput =  sap.ui.getCore().byId("RemarkInput").getValue();
            if(RemarkInput === "") {
                sap.m.MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
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
                remarks: RemarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                // revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                // personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
            };
            var oSubmitPayload = {
                stage: "Approved",
                status: "Approved",
                type: "SSFD",
                remarks: RemarkInput,
                ssfdDtl: oSsfdDtl
            };
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if(!this._reqIDData){
                oModel.create("/Requests" , oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData =  oData.reqID;
                        var reqid = oData.reqID
                        // that.attachmentuploadFilesData(reqid);
                        that.approverdatacehckApproved(reqid);
                        // MessageBox.success("Request Approved Successfully!");
                       
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }else{
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function(oData) {
                        // that.attachmentuploadFilesData(reqid);
                        that.approverdatacehckApproved(reqid);
                        // MessageBox.success("Request Approved successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }
        },
        onSubmitReamrksData: function(){
            var oView = this.getView();
            var reqid = this._reqIDData
            var statusData =  this.statusData
            // var satauscheckdata = ""
            // if(statusData === ""){
            //     satauscheckdata = "Draft"
            // }else if(statusData === "Draft"){
            //     satauscheckdata = "Draft"
            // }else if(statusData === "Pending"){
            //     satauscheckdata = "Pending At HOD"
            // }
            var RemarkInput =  sap.ui.getCore().byId("RemarkInput").getValue();
            if(RemarkInput === "") {
                sap.m.MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
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
                remarks: RemarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                // revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                // // personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
            };
            var oSubmitPayload = {
                stage: "Pending",
                status: "Pending At HOD",
                type: "SSFD",
                remarks: RemarkInput,
                ssfdDtl: oSsfdDtl
            };
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if(!this._reqIDData){
                oModel.create("/Requests" , oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData =  oData.reqID;
                        var reqid = oData.reqID
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacehck(reqid); // for approver service
                        if (oData) {
                            var oComponent = that.getOwnerComponent();
                            var oRequestServiceModel = oComponent.getModel("Requestservicemodel");
                            if (!oRequestServiceModel) {
                                oRequestServiceModel = new sap.ui.model.json.JSONModel();
                                oComponent.setModel(oRequestServiceModel, "Requestservicemodel");
                            }
                            oRequestServiceModel.setData(oData);
                        }
                        // MessageBox.success("Request Submitted successfully!");
                       
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }else{
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function(oData) {
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacehck(reqid);
                        // MessageBox.success("Request Updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }
        },
        approverdatacehckApproved: function(reqid){
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var RemarkInput =  sap.ui.getCore().byId("RemarkInput").getValue();
            var oApprovedPayload = {
                reqID: reqid,
                action: "Approved",
                remarks: RemarkInput
            };
            var that = this;
            oModel.create("/SSFDApproval" , oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success("Request Approved successfully!", {
                        onClose: function() {
                            var Approved = that._ApprovedCheck;
                            if (Approved === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard");
                            }
                        }
                    });
                },
                error: function(oError) {
                    // MessageToast.show("Error saving request: " + oError.message);
                }
            });
        },
        approverdatacehck: function(reqid){
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var RemarkInput =  sap.ui.getCore().byId("RemarkInput").getValue();
            var oApprovedPayload = {
                reqID: reqid,
                action: "Submit",
                remarks: RemarkInput
            };
            var that = this;
            oModel.create("/SSFDApproval" , oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success(oData.SSFDApproval.message, {
                        onClose: function() {
                            var Name = that._SanctionfdNameUI;
                            if (Name === "SSFD") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("DashboardUI", {
                                    Name: "SSFD"
                                });
                            }
                        }
                    });
                },
                error: function(oError) {
                    // MessageToast.show("Error saving request: " + oError.message);
                }
            });

        },
        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");
            // Update the amount for the current item
            aItems[iIndex].amount = parseFloat(sNewValue) || 0;
            // Calculate contingency and total only for Capital Budget, not for Revenue Budget or Personnel Cost
            if (aItems[iIndex].nature === "Capital Budget") {
                aItems[iIndex].contingency = aItems[iIndex].amount * 0.05;
                aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;
            } else {
                // For Revenue Budget and Personnel Cost, contingency is 0
                aItems[iIndex].contingency = 0;
                aItems[iIndex].total = aItems[iIndex].amount;
            }
            // Calculate totals for the "Total" row
            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount;
                iTotalContingency += aItems[i].contingency;
            }

            aItems[aItems.length - 1].amount = iTotalAmount;
            aItems[aItems.length - 1].contingency = iTotalContingency;
            aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;

            // Update the BudgetValue input field
            this.getView().byId("BudgetValue").setValue(aItems[aItems.length - 1].total.toString());

            // Update the model and refresh
            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
        },

        onUploadTabAttchmment: function(oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("No files selected.");
                return;
            }
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var that = this;
            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result; 
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            mimeType: file.type,
                            content: sBase64Data 
                        });
                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true); 
                            MessageToast.show("Files uploaded: " + aFiles.length);
                            oFileUploader.setValue(""); 
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name);
                    };
                    oReader.readAsDataURL(file); // Read file as base64
                })(aFiles[i], i);
            }
        },

        onUploadPress: function() {
            var oFileUploader = this.byId("fileUploaderTabAttchment");
            var aFiles = oFileUploader.getDomRef().files;

            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("Please select at least one file first.");
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var that = this;

            // Clear previous temporary selections
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
                            uploadedBy: "Current User",
                            uploadedOn: sUploadedOn,
                            deleteTabVisible: true,
                            content: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true); // Force refresh to update bindings
                            MessageToast.show("Uploaded " + aFiles.length + " file(s) successfully!");
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name);
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
        
            // Step 1: Read metadata from backend to get media_src
            oModelV2.read(sPath, {
                success: function(oData) {
                    if (oData && oData.__metadata && oData.__metadata.media_src) {
                        // Use <a download> for direct media stream download
                        var oLink = document.createElement("a");
                        oLink.href = oData.__metadata.media_src;
                        oLink.download = sFileName;
                        document.body.appendChild(oLink);
                        oLink.click();
                        document.body.removeChild(oLink);
                        sap.m.MessageToast.show("Downloading file from server: " + sFileName);
                    } else {
                        // Fallback to local
                        that._downloadLocalAttachment(oAttachment, sFileName);
                    }
                },
                error: function() {
                    // Fallback to local
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
                sap.m.MessageToast.show("Downloading file: " + sFileName);
            } catch (e) {
                sap.m.MessageToast.show("Error downloading file: " + sFileName);
            }
        },
        _downloadLocalAttachment: function(oAttachment, sFileName) {
            if (!oAttachment || !oAttachment.content) {
                sap.m.MessageToast.show("Local file content not found for: " + sFileName);
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
            var oAttachment = aAttachments[iIndex];
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;
            oModelV2.remove(sPath, {
                success: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    sap.m.MessageToast.show("Deleted " + sFileName);
                },
                error: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    sap.m.MessageToast.show("Deleted  " + sFileName);
                }
            });
        },
            _removeAttachmentFromLocalModel: function(oModel, aAttachments, iIndex, sFileName) {
            aAttachments.splice(iIndex, 1);
            oModel.setProperty("/attachments", aAttachments);
            oModel.refresh(true);
        },        
    });
});


NEW CODE 2

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
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this); //proceed
            oRouter.getRoute("SanctionfdRef").attachPatternMatched(this._onRouteSanctionfdwithRef, this); //Tab Nav
            oRouter.getRoute("SanctionfdRefApproved").attachPatternMatched(this._onRouteSanctionfdApproved, this); //Approver

            this.remarksDialog = sap.ui.xmlfragment("com/mmapprovalhub/approvalhub/Fragments/remarks", this);
            this.getView().addDependent(this.remarksDialog);
            var oViewModel = new sap.ui.model.json.JSONModel({
				enableRowActions: true,
                approvebuttonvisiblity: false
			});
			this.getView().setModel(oViewModel, "viewenableddatacheck");


            var oTimelineData = {
                timelineItems: [
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ankit Pathak Created a Request",
                        text: "Data Save",
                        userName: "Ankit Pathak",
                        userPicture: "https://ui-avatars.com/api/?name=Ankit+Rath"
                    },
                    {
                        dateTime: "7/22/2016 at 6:00 PM",
                        title: "Yugal Created a Request",
                        text: "Data Submit",
                        userName: "Yugal",
                        userPicture: "https://ui-avatars.com/api/?name=Yugal"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ayushi Mam added a note [Approved]",
                        text: "Submitted.",
                        userName: "Ayushi Mam",
                        userPicture: "https://ui-avatars.com/api/?name=Ayushi"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Aakib Mohd added a note [Approved]",
                        text: "Done.",
                        userName: "Aakib Mohd",
                        userPicture: "https://ui-avatars.com/api/?name=Aakib+Mohd"
                    }
                ]
            };
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");

        },
        _onRouteSanctionfdApproved: function(oEvent) {
            this._ApprovedCheck=""
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
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel");
                        if (!oRequestServiceModel) {
                            oRequestServiceModel = new sap.ui.model.json.JSONModel();
                            that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        }
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck =  oData.results[0].status;
                        that.statusData = oData.results[0].status;
                        that.stagesData = oData.results[0].stage;

                       if(statusDatacheck === "Draft" || statusDatacheck === "" || statusDatacheck === null){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);


                       }else if(statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD"){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);

                       }else{
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);
                       }

                       if(that._ApprovedCheck === "Approved" && statusDatacheck === "Pending"){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", true);

                       }else{
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);

                       }
                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                    } else {
                        sap.m.MessageToast.show("No data found for Req ID: " + reqID);
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load HOD data.");
                }
            });
        },
        _onRouteSanctionfdwithRef: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._SanctionfdNameUI = oArgs.basedNameUISSFD;
            var reqID = oArgs.reqID;
            this._reqIDData = reqID;
            this._ApprovedCheck=""
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            oModelV2.read("/Requests", {
                urlParameters: {
                    "$filter": "reqID eq '" + reqID + "'",
                    "$expand": "ssfdDtl"
                },
                success: function(oData) {
                    if (oData && oData.results.length > 0) {
                        let oRequestServiceModel = that.getOwnerComponent().getModel("Requestservicemodel");
                        if (!oRequestServiceModel) {
                            oRequestServiceModel = new sap.ui.model.json.JSONModel();
                            that.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
                        }
                        oRequestServiceModel.setData(oData.results[0]);
                        var statusDatacheck =  oData.results[0].status;
                        that.statusData = oData.results[0].status;
                       if(statusDatacheck === "Draft" || statusDatacheck === "" || statusDatacheck === null){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", true);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);


                       }else if(statusDatacheck === "Pending" || statusDatacheck === "Pending At HOD"){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);

                       }else if(statusDatacheck === "Approved"){
                        that.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", false);
                        that.getView().getModel("viewenableddatacheck").setProperty("/approvebuttonvisiblity", false);

                       }
                        that.onDepartmentDataFetch();
                        that.onMarketDataFetch();
                        that.onLocationDataFetch();
                        that.onHODDataFetch();
                        that.onFetchTimelinessData();
                        that.onAttchmentDataFetch();
                    } else {
                        sap.m.MessageToast.show("No data found for Req ID: " + reqID);
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load HOD data.");
                }
            });
        },   
        onFetchTimelinessData: function () {
            var reqid = this._reqIDData;
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
        
            oModelV2.read("/ProcessLogs", {
                filters: [
                    new sap.ui.model.Filter("reqID", sap.ui.model.FilterOperator.EQ, reqid)
                ],
                success: function (oData) {
                    if (oData && oData.results) {
                        var oJSONModel =  new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "timelinesslogdata");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load attachment data.");
                    console.error(oError);
                }
            });
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
                        var oJSONModel = new sap.ui.model.json.JSONModel({
                            attachments: oData.results
                        });
                        oView.setModel(oJSONModel, "UploadDocSrvTabData");
                    }
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load attachment data.");
                    console.error(oError);
                }
            });
        },   
        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var basedNameUI = oArgs.basedNameUISSFD;
            this._SanctionfdNameUI = basedNameUI;
            this._reqIDData = "";
            this._ApprovedCheck="";
            this.getView().getModel("viewenableddatacheck").setProperty("/enableRowActions", true);

            var oRequestServiceModel = this.getOwnerComponent().getModel("Requestservicemodel");
            if (!oRequestServiceModel) {
                oRequestServiceModel = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().setModel(oRequestServiceModel, "Requestservicemodel");
            }
                var oEmptyData = {
                reqID: "",
                refNo: "",
                requesterName: "",
                department: "",
                market: "",
                location: "",
                hod: "",
                ssfdDtl: []  
            };
            oRequestServiceModel.setData(oEmptyData);
            this.onDepartmentDataFetch(); //based filter
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch(); // direct binding
        },        
     
        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load HOD data.", oError);
                }
            });
        },

        onDepartmentDataFetch: function(){
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                  "$filter": "category eq '" + "SS_DEPARTMENT" + "'"
                },
                success: function (oData) {
                  if (oData) {
                    var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                    oView.setModel(oJSONModel, "SSDEPARTMENTData");
                  }
                },
                error: function (oError) {
                  sap.m.MessageToast.show("Failed to load data.", oError);
                }
              });

        },
        onMarketDataFetch: function(){
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                  "$filter": "category eq '" + "SS_MARKET" + "'"
                },
                success: function (oData) {
                  if (oData) {
                    var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                    oView.setModel(oJSONModel, "SSMARKETDataFetch");
                  }
                },
                error: function (oError) {
                  sap.m.MessageToast.show("Failed to load data.", oError);
                }
              });
        },
        onLocationDataFetch: function(){
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/ControlValues", {
                urlParameters: {
                  "$filter": "category eq '" + "SS_LOCATION" + "'"
                },
                success: function (oData) {
                  if (oData) {
                    var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                    oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                  }
                },
                error: function (oError) {
                  sap.m.MessageToast.show("Failed to load data.", oError);
                }
              });
        },
        onDashboardui: function(){
           var Approved =  this._ApprovedCheck;
           if(Approved === "Approved"){
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("approverdashboard", {
               
            });
           }else{
            var Name = this._SanctionfdNameUI;
            if(Name === "SSFD"){
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("DashboardUI", {
                    Name: "SSFD"
                });
            }
           }
          
        },
        onBackDashboardpage: function() {
            MessageToast.show("Navigating back to dashboard...");
            // Example: this.getOwnerComponent().getRouter().navTo("dashboard");
        },
        // attachmentuploadFilesData: function(reqid) {
        //     var oModelUploaddata = this.getView().getModel("UploadDocSrvTabData");
        //     var aFilesToUpload = [];
        //     var oModelAttachmnet = this.getOwnerComponent().getModel("approvalservicev2");

        // },

        attachmentuploadFilesData: function (reqid) {
            var oModelTabdata = this.getView().getModel("UploadDocSrvTabData");
            var aFilesData = oModelTabdata.getProperty("/attachments");
            var aFilesToUpload = [];
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
        
            if (aFilesData) {
                aFilesData.forEach(function (file) {
                    if (!file.fileName) return;
        
                    var fileCopy = Object.assign({}, file);
                    delete fileCopy.ID;
                    if (fileCopy.content && typeof fileCopy.content === "string" && fileCopy.content.includes(',')) {
                        var base64Content = fileCopy.content.split(',')[1];
                        aFilesToUpload.push({
                            fileName: fileCopy.fileName,
                            content: base64Content,
                            mediaType: fileCopy.mimeType || "text/plain",
                            reqID: reqid,
                        });
                    } else {
                        // console.warn("Invalid file content for file:", fileCopy.fileName);
                    }
                });
                aFilesToUpload.forEach(function (attachmentData) {
                    oModel.create("/ReqAttachments", attachmentData, {
                        success: function () {
                        },
                        error: function () {
                        }
                    });
                });
            }
        },            
        onSaveSanctionform: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
            var reqid = this._reqIDData;
            var statusData =  this.statusData;
            // var basedNameUISSFD = this._SanctionfdNameUI;
            var satauscheckdata = "";
            if(statusData === "" || statusData === null || statusData === undefined){
                satauscheckdata = "Draft"
            }else if(statusData === "Draft"){
                satauscheckdata = "Draft"
            }else if(statusData === "Pending"){
                satauscheckdata = "Pending"
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
            };
             var oSavePayload = {
                stage: satauscheckdata,
                status: satauscheckdata,
                type: "SSFD",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            if(!this._reqIDData){
                oModel.create("/Requests" , oSavePayload, {
                    success: function(oData) {
                        that._reqIDData =  oData.reqID;
                    //    var reqID =  oData.refNo;
                        if (oData) {
                            var oComponent = that.getOwnerComponent();
                            var oRequestServiceModel = oComponent.getModel("Requestservicemodel");
                            if (!oRequestServiceModel) {
                                oRequestServiceModel = new sap.ui.model.json.JSONModel();
                                oComponent.setModel(oRequestServiceModel, "Requestservicemodel");
                            }
                            oRequestServiceModel.setData(oData);
                        }
                        // that.byId("inputRequestIDSanctionfdpage").setT();
                        var reqid = oData.reqID
                        that.attachmentuploadFilesData(reqid);
                        MessageBox.success("Request saved successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }else{
                oModel.update("/Requests('" + reqid + "')", oSavePayload, {
                    success: function(oData) {
                        var reqid = oData.reqID
                        that.attachmentuploadFilesData(reqid);
                        MessageBox.success("Request Updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }
        },
        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                referenceNumber: oView.byId("inputRefNumber").getValue(),
                location: oView.byId("comboLocation").getSelectedKey(),
                budget: oView.byId("inputBudget").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("Division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("Department").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket").getSelectedKey(),
                hod: oView.byId("Hod").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                expectedOutcome: oView.byId("_IDGenTextArea2").getValue(),
                attachments: this.getView().getModel("UploadDocSrvTabData").getProperty("/attachments")
            };
            MessageToast.show("Form data and attachments saved: " + JSON.stringify(oFormData));
            // Add actual save logic (e.g., OData service call) here
            this._oSaveDialog.close();
        },

        onCancelSave: function() {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.");
        },
        onSubmitSanctionform: function () {
            var isValid = true;
        
            var location = this.getView().byId("comboLocation_Senca");
            var department = this.getView().byId("department_sensce");
            var market = this.getView().byId("comboMarket_Senca");
            var hod = this.getView().byId("Hod_SanctionData");
            location.setValueState("None");
            department.setValueState("None");
            market.setValueState("None");
            hod.setValueState("None");
        
            if (!location.getValue()) {
                location.setValueState("Error");
                isValid = false;
            }
            if (!department.getValue()) {
                department.setValueState("Error");
                isValid = false;
            }
            if (!market.getValue()) {
                market.setValueState("Error");
                isValid = false;
            }
            if (!hod.getValue()) {
                hod.setValueState("Error");
                isValid = false;
            }
            if (!isValid) {
                sap.m.MessageBox.error("Please fill all required fields.");
                return;
            }
            sap.ui.getCore().byId("RemarkInput").setValue("");
            this.remarksDialog.open();
        },    
        onHodSanctionChange: function(){
            var hod = this.getView().byId("Hod_SanctionData");
            hod.setValueState("None");
        },
        onDepartmentSanctionChange : function(){
            var DepartmentSan = this.getView().byId("department_sensce");
            DepartmentSan.setValueState("None");
        }, 
        onMarketSenca : function(){
            var comboMarket_Senca = this.getView().byId("comboMarket_Senca");
            comboMarket_Senca.setValueState("None");
        }, 
        onLocationSenca : function(){
            var comboLocation_Senca = this.getView().byId("comboLocation_Senca");
            comboLocation_Senca.setValueState("None");
        }, 
        onApprovedSanctionform: function(){
            sap.ui.getCore().byId("RemarkInput").setValue("");
            this.remarksDialog.open();
        },
        
        onCloseReamrksFrag: function(){
            this.remarksDialog.close();
        },
        onApprovedData: function(){
            var oView = this.getView();
            var reqid = this._reqIDData
            var statusData =  this.statusData
            var stagesData = this.stagesData
            var satauscheckdata = ""
            var stagescheckdata = ""
            // if(statusData === ""){
            //     satauscheckdata = "Draft"
            // }else if(statusData === "Draft"){
            //     satauscheckdata = "Draft"
            // }else if(statusData === "Pending At HOD"){
            //     satauscheckdata = "Approved"
            // }
            // if(stagesData === ""){
            //     stagescheckdata = "Draft"
            // }else if(stagesData === "Draft"){
            //     stagescheckdata = "Draft"
            // }else if(stagesData === "Pending"){
            //     stagescheckdata = "Approved"
            // }
            var RemarkInput =  sap.ui.getCore().byId("RemarkInput").getValue();
            if(RemarkInput === "") {
                sap.m.MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
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
                remarks: RemarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
            };
            var oSubmitPayload = {
                stage: "Approved",
                status: "Approved",
                type: "SSFD",
                remarks: RemarkInput,
                ssfdDtl: oSsfdDtl
            };
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if(!this._reqIDData){
                oModel.create("/Requests" , oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData =  oData.reqID;
                        var reqid = oData.reqID
                        // that.attachmentuploadFilesData(reqid);
                        that.approverdatacehckApproved(reqid);
                        // MessageBox.success("Request Approved Successfully!");
                       
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }else{
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function(oData) {
                        // that.attachmentuploadFilesData(reqid);
                        that.approverdatacehckApproved(reqid);
                        // MessageBox.success("Request Approved successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }
        },
        onSubmitReamrksData: function(){
            var oView = this.getView();
            var reqid = this._reqIDData
            var statusData =  this.statusData
            // var satauscheckdata = ""
            // if(statusData === ""){
            //     satauscheckdata = "Draft"
            // }else if(statusData === "Draft"){
            //     satauscheckdata = "Draft"
            // }else if(statusData === "Pending"){
            //     satauscheckdata = "Pending At HOD"
            // }
            var RemarkInput =  sap.ui.getCore().byId("RemarkInput").getValue();
            if(RemarkInput === "") {
                sap.m.MessageBox.information("Please provide a remark before submitting.");
                return;
            }
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");
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
                remarks: RemarkInput,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
            };
            var oSubmitPayload = {
                stage: "Pending",
                status: "Pending At HOD",
                type: "SSFD",
                remarks: RemarkInput,
                ssfdDtl: oSsfdDtl
            };
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var that = this;
            if(!this._reqIDData){
                oModel.create("/Requests" , oSubmitPayload, {
                    success: function(oData) {
                        that._reqIDData =  oData.reqID;
                        var reqid = oData.reqID
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacehck(reqid); // for approver service
                        if (oData) {
                            var oComponent = that.getOwnerComponent();
                            var oRequestServiceModel = oComponent.getModel("Requestservicemodel");
                            if (!oRequestServiceModel) {
                                oRequestServiceModel = new sap.ui.model.json.JSONModel();
                                oComponent.setModel(oRequestServiceModel, "Requestservicemodel");
                            }
                            oRequestServiceModel.setData(oData);
                        }
                        // MessageBox.success("Request Submitted successfully!");
                       
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }else{
                oModel.update("/Requests('" + reqid + "')", oSubmitPayload, {
                    success: function(oData) {
                        that.attachmentuploadFilesData(reqid);
                        that.approverdatacehck(reqid);
                        // MessageBox.success("Request Updated successfully!");
                    },
                    error: function(oError) {
                        MessageToast.show("Error saving request: " + oError.message);
                    }
                });
            }
        },
        approverdatacehckApproved: function(reqid){
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var RemarkInput =  sap.ui.getCore().byId("RemarkInput").getValue();
            var oApprovedPayload = {
                reqID: reqid,
                action: "Approved",
                remarks: RemarkInput
            };
            var that = this;
            oModel.create("/SSFDApproval" , oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success("Request Approved successfully!", {
                        onClose: function() {
                            var Approved = that._ApprovedCheck;
                            if (Approved === "Approved") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("approverdashboard");
                            }
                        }
                    });
                },
                error: function(oError) {
                    // MessageToast.show("Error saving request: " + oError.message);
                }
            });
        },
        approverdatacehck: function(reqid){
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            var RemarkInput =  sap.ui.getCore().byId("RemarkInput").getValue();
            var oApprovedPayload = {
                reqID: reqid,
                action: "Submit",
                remarks: RemarkInput
            };
            var that = this;
            oModel.create("/SSFDApproval" , oApprovedPayload, {
                success: function(oData) {
                    MessageBox.success(oData.SSFDApproval.message, {
                        onClose: function() {
                            var Name = that._SanctionfdNameUI;
                            if (Name === "SSFD") {
                                var oRouter = that.getOwnerComponent().getRouter();
                                oRouter.navTo("DashboardUI", {
                                    Name: "SSFD"
                                });
                            }
                        }
                    });
                },
                error: function(oError) {
                    // MessageToast.show("Error saving request: " + oError.message);
                }
            });

        },
        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");
             aItems[iIndex].amount = parseFloat(sNewValue) || 0;
             if (iIndex !== aItems.length - 1) {
                aItems[iIndex].contingency = aItems[iIndex].amount * 0.05;
                aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;
            }
             var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount;
                iTotalContingency += aItems[i].contingency;
            }
            aItems[aItems.length - 1].amount = iTotalAmount;
            aItems[aItems.length - 1].contingency = iTotalContingency;
            aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;
             this.getView().byId("BudgetValue").setValue(aItems[aItems.length - 1].total.toString());
            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
            // MessageToast.show("Budget amount updated!");
        },

        onUploadTabAttchmment: function(oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("No files selected.");
                return;
            }
            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var that = this;
            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result; 
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            mimeType: file.type,
                            content: sBase64Data 
                        });
                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true); 
                            MessageToast.show("Files uploaded: " + aFiles.length);
                            oFileUploader.setValue(""); 
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name);
                    };
                    oReader.readAsDataURL(file); // Read file as base64
                })(aFiles[i], i);
            }
        },

        onUploadPress: function() {
            var oFileUploader = this.byId("fileUploaderTabAttchment");
            var aFiles = oFileUploader.getDomRef().files;

            if (!aFiles || aFiles.length === 0) {
                MessageToast.show("Please select at least one file first.");
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];
            var that = this;

            // Clear previous temporary selections
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
                            uploadedBy: "Current User",
                            uploadedOn: sUploadedOn,
                            deleteTabVisible: true,
                            content: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true); // Force refresh to update bindings
                            MessageToast.show("Uploaded " + aFiles.length + " file(s) successfully!");
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name);
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
        
            // Step 1: Read metadata from backend to get media_src
            oModelV2.read(sPath, {
                success: function(oData) {
                    if (oData && oData.__metadata && oData.__metadata.media_src) {
                        // Use <a download> for direct media stream download
                        var oLink = document.createElement("a");
                        oLink.href = oData.__metadata.media_src;
                        oLink.download = sFileName;
                        document.body.appendChild(oLink);
                        oLink.click();
                        document.body.removeChild(oLink);
                        sap.m.MessageToast.show("Downloading file from server: " + sFileName);
                    } else {
                        // Fallback to local
                        that._downloadLocalAttachment(oAttachment, sFileName);
                    }
                },
                error: function() {
                    // Fallback to local
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
                sap.m.MessageToast.show("Downloading file: " + sFileName);
            } catch (e) {
                sap.m.MessageToast.show("Error downloading file: " + sFileName);
            }
        },
        _downloadLocalAttachment: function(oAttachment, sFileName) {
            if (!oAttachment || !oAttachment.content) {
                sap.m.MessageToast.show("Local file content not found for: " + sFileName);
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
            var oAttachment = aAttachments[iIndex];
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            var sPath = "/ReqAttachments(guid'" + sID + "')";
            var that = this;
            oModelV2.remove(sPath, {
                success: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    sap.m.MessageToast.show("Deleted " + sFileName);
                },
                error: function() {
                    that._removeAttachmentFromLocalModel(oModel, aAttachments, iIndex, sFileName);
                    sap.m.MessageToast.show("Deleted  " + sFileName);
                }
            });
        },
            _removeAttachmentFromLocalModel: function(oModel, aAttachments, iIndex, sFileName) {
            aAttachments.splice(iIndex, 1);
            oModel.setProperty("/attachments", aAttachments);
            oModel.refresh(true);
        },        
    });
});



NEW CODE 1

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function(Controller, JSONModel, MessageToast, MessageBox, Fragment) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize budget data with 5% contingency
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 525 },
                    { nature: "Revenue Budget", amount: 0, contingency: 0, total: 498.75 },
                    { nature: "Personnel Cost", amount: 0, contingency: 0, total: 1050 },
                    { nature: "Total", amount: 0, contingency: 0, total: 2073.75 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");

            // Initialize attachment data
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");

            // Initialize timeline data
            var oTimelineData = {
                timelineItems: [
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ankit Pathak Created a Request",
                        text: "Please go to the evaluate.",
                        userName: "Ankit Pathak",
                        userPicture: "https://ui-avatars.com/api/?name=Ankit+Rath"
                    },
                    {
                        dateTime: "7/22/2016 at 6:00 PM",
                        title: "Yugal Created a Request",
                        text: "Please go to the evaluate.",
                        userName: "Yugal",
                        userPicture: "https://ui-avatars.com/api/?name=Yugal"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ayushi Mam added a note [Approved]",
                        text: "Submitted.",
                        userName: "Ayushi Mam",
                        userPicture: "https://ui-avatars.com/api/?name=Ayushi"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Aakib Mohd added a note [Approved]",
                        text: "Done.",
                        userName: "Aakib Mohd",
                        userPicture: "https://ui-avatars.com/api/?name=Aakib+Mohd"
                    }
                ]
            };
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);

            // Attach event handlers for real-time validation
            this._attachValidationHandlers();
        },

        _attachValidationHandlers: function() {
            var oView = this.getView();
            var that = this;

            // ComboBox fields
            var aComboBoxFields = ["division", "department_sensce", "Hod", "comboLocation_Senca", "comboMarket_Senca"];
            aComboBoxFields.forEach(function(sId) {
                var oControl = oView.byId(sId);
                if (oControl) {
                    oControl.attachChange(function(oEvent) {
                        var sValue = oEvent.getSource().getSelectedKey();
                        if (sValue) {
                            oControl.setValueState("None");
                            oControl.setValueStateText("");
                        } else {
                            oControl.setValueState("Error");
                            oControl.setValueStateText(that._getErrorMessage(sId));
                        }
                    });
                }
            });

            // Input fields
            var aInputFields = ["inputProjectName", "inputItemRequired", "BudgetValue"];
            aInputFields.forEach(function(sId) {
                var oControl = oView.byId(sId);
                if (oControl) {
                    oControl.attachLiveChange(function(oEvent) {
                        var sValue = oEvent.getParameter("value");
                        if (sId === "BudgetValue") {
                            var fValue = parseFloat(sValue);
                            if (fValue > 0 && !isNaN(fValue)) {
                                oControl.setValueState("None");
                                oControl.setValueStateText("");
                            } else {
                                oControl.setValueState("Error");
                                oControl.setValueStateText("Valid Budget is required.");
                            }
                        } else if (sValue.trim()) {
                            oControl.setValueState("None");
                            oControl.setValueStateText("");
                        } else {
                            oControl.setValueState("Error");
                            oControl.setValueStateText(that._getErrorMessage(sId));
                        }
                    });
                }
            });

            // DatePicker field
            var oDatePicker = oView.byId("dateImplement");
            if (oDatePicker) {
                oDatePicker.attachChange(function(oEvent) {
                    var sValue = oEvent.getSource().getValue();
                    if (sValue) {
                        oDatePicker.setValueState("None");
                        oDatePicker.setValueStateText("");
                    } else {
                        oDatePicker.setValueState("Error");
                        oDatePicker.setValueStateText("Implementation Date is required.");
                    }
                });
            }
        },

        _getErrorMessage: function(sId) {
            var oMessages = {
                "division": "Division is required.",
                "department_sensce": "Department is required.",
                "Hod": "HOD is required.",
                "comboLocation_Senca": "Location is required.",
                "comboMarket_Senca": "Market is required.",
                "inputProjectName": "Project Name is required.",
                "inputItemRequired": "Item Description is required.",
                "BudgetValue": "Valid Budget is required.",
                "dateImplement": "Implementation Date is required.",
                "dynamicRemarksTextArea": "Remarks are required."
            };
            return oMessages[sId] || "This field is required.";
        },

        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var basedNameUI = oArgs.basedNameUISSFD;
            this._SanctionfdNameUI = basedNameUI;
            this.onDepartmentDataFetch();
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch();
        },

        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    // MessageToast.show("Failed to load HOD data.");
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
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSDEPARTMENTData");
                    }
                },
                error: function(oError) {
                    // MessageToast.show("Failed to load department data.");
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
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSMARKETDataFetch");
                    }
                },
                error: function(oError) {
                    // MessageToast.show("Failed to load market data.");
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
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                    }
                },
                error: function(oError) {
                    // MessageToast.show("Failed to load location data.");
                }
            });
        },

        onDashboardui: function() {
            var Name = this._SanctionfdNameUI;
            if (Name === "SSFD") {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("DashboardUI", {
                    Name: "SSFD"
                });
            }
        },

        onSave: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");

            // Collect form data into ssfdDtl object
            var oSsfdDtl = {
                reqID: "REQ" + new Date().getTime(),
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                budgetDetails: aBudgetItems.map(function(oItem) {
                    return {
                        name: oItem.nature,
                        amount: oItem.amount,
                        contingency: oItem.contingency,
                        total: oItem.total
                    };
                })
            };

            // Wrap it in the full payload expected by the backend
            var oSavePayload = {
                reqID: oSsfdDtl.reqID,
                refNo: "REF-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                pendingWith: "Initiator",
                stage: "Draft",
                status: "Draft",
                type: "FD",
                currApprover: "system@company.com",
                remarks: "Request saved as draft by initiator.",
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");

            oModel.create("/Requests", oSavePayload, {
                success: function(oData) {
                    MessageBox.success("Request saved successfully!");
                },
                error: function(oError) {
                    // MessageToast.show("Error saving request: " + oError.message);
                }
            });
        },

        _constructPayload: function(sRemarks) {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");

            var oSsfdDtl = {
                reqID: "REQ" + new Date().getTime(),
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: sRemarks || "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                budgetDetails: aBudgetItems.map(function(oItem) {
                    return {
                        name: oItem.nature,
                        amount: oItem.amount,
                        contingency: oItem.contingency,
                        total: oItem.total
                    };
                })
            };

            return {
                reqID: oSsfdDtl.reqID,
                refNo: "REF-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                pendingWith: "Approver",
                stage: "Pending",
                status: "Pending",
                type: "FD",
                currApprover: "system@company.com",
                remarks: sRemarks || "",
                ssfdDtl: oSsfdDtl
            };
        },

        _validatePayload: function(oPayload) {
            var oSsfdDtl = oPayload.ssfdDtl;
            var oView = this.getView();
            var aInvalidFields = [];

            // Reset all fields to normal state
            var aFields = [
                { id: "division", type: "ComboBox" },
                { id: "department_sensce", type: "ComboBox" },
                { id: "Hod", type: "ComboBox" },
                { id: "comboLocation_Senca", type: "ComboBox" },
                { id: "inputProjectName", type: "Input" },
                { id: "inputItemRequired", type: "Input" },
                { id: "BudgetValue", type: "Input" },
                { id: "comboMarket_Senca", type: "ComboBox" },
                { id: "dateImplement", type: "DatePicker" }
            ];

            aFields.forEach(function(oField) {
                var oControl = oView.byId(oField.id);
                if (oControl) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                }
            });

            // Validate mandatory fields
            if (!oSsfdDtl.division) {
                aInvalidFields.push({ id: "division", message: "Division is required." });
            }
            if (!oSsfdDtl.puDept) {
                aInvalidFields.push({ id: "department_sensce", message: "Department is required." });
            }
            if (!oSsfdDtl.hod) {
                aInvalidFields.push({ id: "Hod", message: "HOD is required." });
            }
            if (!oSsfdDtl.loc) {
                aInvalidFields.push({ id: "comboLocation_Senca", message: "Location is required." });
            }
            if (!oSsfdDtl.projName) {
                aInvalidFields.push({ id: "inputProjectName", message: "Project Name is required." });
            }
            if (!oSsfdDtl.itemRequiredDesc) {
                aInvalidFields.push({ id: "inputItemRequired", message: "Item Description is required." });
            }
            if (!oSsfdDtl.budgetRequired || oSsfdDtl.budgetRequired <= 0) {
                aInvalidFields.push({ id: "BudgetValue", message: "Valid Budget is required." });
            }
            if (!oSsfdDtl.market) {
                aInvalidFields.push({ id: "comboMarket_Senca", message: "Market is required." });
            }
            if (!oSsfdDtl.implDt) {
                aInvalidFields.push({ id: "dateImplement", message: "Implementation Date is required." });
            }

            // Highlight invalid fields
            aInvalidFields.forEach(function(oField) {
                var oControl = oView.byId(oField.id);
                if (oControl) {
                    oControl.setValueState("Error");
                    oControl.setValueStateText(oField.message);
                }
            });

            return aInvalidFields.length === 0;
        },

        _sendPayload: function(oPayload) {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            oModel.create("/Requests", oPayload, {
                success: function(oData) {
                    MessageBox.success("Request submitted successfully!", {
                        onClose: function() {
                            that.onDashboardui();
                        }
                    });
                },
                error: function(oError) {
                    MessageBox.error("Error submitting request: " + (oError.message || oError.responseText), {
                        title: "Error"
                    });
                }
            });
        },

        onSubmit: function() {
            var that = this;
            var oPayload = this._constructPayload(""); // Initial payload without remarks

            // Validate mandatory fields first
            if (!this._validatePayload(oPayload)) {
                MessageBox.error("Please fill all required fields.", { title: "Error" });
                return;
            }

            // Show remarks popup
            if (!this._oRemarksDialog) {
                var oRemarksLabel = new sap.m.Label({
                    text: "Please enter remarks before submitting:",
                    labelFor: "dynamicRemarksTextArea"
                });

                var oTextArea = new sap.m.TextArea("dynamicRemarksTextArea", {
                    placeholder: "Enter your remarks here...",
                    rows: 5,
                    width: "90%",
                    liveChange: function(oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oSubmitBtn = that._oRemarksDialog.getBeginButton();
                        if (sValue.trim()) {
                            oSubmitBtn.setEnabled(true);
                            oTextArea.setValueState("None");
                            oTextArea.setValueStateText("");
                        } else {
                            oSubmitBtn.setEnabled(false);
                            oTextArea.setValueState("Error");
                            oTextArea.setValueStateText("Remarks are required.");
                        }
                    }
                });

                var oSubmitBtn = new sap.m.Button({
                    text: "Submit",
                    type: "Accept",
                    enabled: false,
                    press: function() {
                        var sRemarks = oTextArea.getValue().trim();
                        if (!sRemarks) {
                            oTextArea.setValueState("Error");
                            oTextArea.setValueStateText("Remarks are required.");
                            return;
                        }

                        // Construct final payload with remarks
                        var oFinalPayload = that._constructPayload(sRemarks);

                        // Confirm submission
                        MessageBox.confirm(
                            "Are you sure you want to submit with these remarks?\n\n" + sRemarks,
                            {
                                title: "Confirm Submission",
                                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                                onClose: function(oAction) {
                                    if (oAction === MessageBox.Action.YES) {
                                        that._sendPayload(oFinalPayload);
                                        that._oRemarksDialog.close();
                                    }
                                }
                            }
                        );
                    }
                });

                var oCancelBtn = new sap.m.Button({
                    text: "Cancel",
                    type: "Reject",
                    press: function() {
                        that._oRemarksDialog.close();
                    }
                });

                this._oRemarksDialog = new sap.m.Dialog({
                    title: "Submit Request",
                    titleAlignment: "Center",
                    contentWidth: "500px",
                    contentHeight: "250px",
                    stretchOnPhone: true,
                    verticalScrolling: false,
                    content: [
                        new sap.ui.layout.VerticalLayout({
                            width: "100%",
                            content: [oRemarksLabel, oTextArea]
                        }).addStyleClass("sapUiSmallMargin")
                    ],
                    beginButton: oSubmitBtn,
                    endButton: oCancelBtn,
                    afterClose: function() {
                        oTextArea.setValue("");
                        oTextArea.setValueState("None");
                        oTextArea.setValueStateText("");
                        oSubmitBtn.setEnabled(false);
                    }
                });
            }

            this._oRemarksDialog.open();
        },

        onCancel: function() {
            MessageToast.show("Action canceled.");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("DashboardUI", {
                Name: this._SanctionfdNameUI
            });
        },

        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");

            // Update the amount for the changed item
            aItems[iIndex].amount = parseFloat(sNewValue) || 0;

            // Calculate 5% contingency for non-total rows
            if (iIndex !== aItems.length - 1) {
                aItems[iIndex].contingency = aItems[iIndex].amount * 0.5;
                aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;
            }

            // Recalculate totals for the last row (Total)
            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount;
                iTotalContingency += aItems[i].contingency;
            }
            aItems[aItems.length - 1].amount = iTotalAmount;
            aItems[aItems.length - 1].contingency = iTotalContingency;
            aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;

            // Update the BudgetValue field
            this.getView().byId("BudgetValue").setValue(aItems[aItems.length - 1].total.toString());

            // Update the model
            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
            // MessageToast.show("Budget amount updated!");
        },

        onUploadTabData: function(oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                // MessageToast.show("No files selected.");
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];

            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result;
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            uploadedBy: "Current User",
                            uploadedOn: sUploadedOn,
                            deleteTabDataVisible: true,
                            fileContent: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true);
                            // MessageToast.show("Files uploaded: " + aFiles.length);
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function() {
                        // MessageToast.show("Error reading file: " + file.name);
                    };
                    oReader.readAsDataURL(file);
                })(aFiles[i], i);
            }
        },

        onDownloadDocAttchmment: function(oEvent) {
            var oButton = oEvent.getSource();
            var sID = oButton.getCustomData().find(function(data) {
                return data.getKey() === "ID";
            }).getValue();
            var sFileName = oButton.getCustomData().find(function(data) {
                return data.getKey() === "fileName";
            }).getValue();

            var oModel = this.getView().getModel("UploadDocData");
            var aDocs = oModel.getProperty("/docs");
            var oDoc = aDocs.find(function(item) {
                return item.ID === sDocID;
            });

            if (!oDoc || !oDoc.fileContent) {
                // MessageToast.show("File content not found for: " + fileName);
                return;
            }

            try {
                var sBase64Data = oDoc.fileContent.split(',')[1];
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], { type: oDoc.fileContent.split(';')[0].split(':')[1] });
                var url = URL.createObjectURL(blob);
                var link = document.createElement("a");
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                // MessageToast.show("Downloading file: " + fileName);
            } catch (e) {
                // MessageToast.show("Error downloading file: " + fileName);
            }
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

            if (iIndex !== -1) {
                var sFileName = aAttachments[iIndex].fileName;
                aAttachments.splice(iIndex, 1);
                oModel.setProperty("/attachments", aAttachments);
                oModel.refresh(true);
                // MessageToast.show("File deleted: " + sFileName);
            }
        },

        onLocationSenca: function(oEvent) {
            // MessageToast.show("Location selected: " + oEvent.getSource().getSelectedKey());
        },

        onDepartment: function(oEvent) {
            // MessageToast.show("Department selected: " + oEvent.getSource().getSelectedKey());
        },

        onMarketSenca: function(oEvent) {
            // MessageToast.show("Market selected: " + oEvent.getSource().getSelectedKey());
        },

        handleLiveChange: function(oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oEvent.getParameter("value");
            if (sValue.length > 1000) {
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 1000 characters allowed.");
            } else {
                oTextArea.setValueState("None");
                oTextArea.setValueStateText("");
            }
        }
    });
});


OLD CODE

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function(Controller, JSONModel, MessageToast, MessageBox, Fragment) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize budget data with 5% contingency
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 0, contingency: 0, total: 525 },
                    { nature: "Revenue Budget", amount: 0, contingency: 0, total: 498.75 },
                    { nature: "Personnel Cost", amount: 0, contingency: 0, total: 1050 },
                    { nature: "Total", amount: 0, contingency: 0, total: 2073.75 }
                ]
            };
            var oBudgetModel = new JSONModel(oBudgetData);
            this.getView().setModel(oBudgetModel, "budgetModel");

            // Initialize attachment data
            var oAttachmentData = {
                attachments: []
            };
            var oAttachmentModel = new JSONModel(oAttachmentData);
            this.getView().setModel(oAttachmentModel, "UploadDocSrvTabData");

            // Initialize timeline data
            var oTimelineData = {
                timelineItems: [
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ankit Pathak Created a Request",
                        text: "Please go to the evaluate.",
                        userName: "Ankit Pathak",
                        userPicture: "https://ui-avatars.com/api/?name=Ankit+Rath"
                    },
                    {
                        dateTime: "7/22/2016 at 6:00 PM",
                        title: "Yugal Created a Request",
                        text: "Please go to the evaluate.",
                        userName: "Yugal",
                        userPicture: "https://ui-avatars.com/api/?name=Yugal"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ayushi Mam added a note [Approved]",
                        text: "Submitted.",
                        userName: "Ayushi Mam",
                        userPicture: "https://ui-avatars.com/api/?name=Ayushi"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Aakib Mohd added a note [Approved]",
                        text: "Done.",
                        userName: "Aakib Mohd",
                        userPicture: "https://ui-avatars.com/api/?name=Aakib+Mohd"
                    }
                ]
            };
            var oTimelineModel = new JSONModel(oTimelineData);
            this.getView().setModel(oTimelineModel, "timelineModel");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);

            // Attach event handlers for real-time validation
            this._attachValidationHandlers();
        },

        _attachValidationHandlers: function() {
            var oView = this.getView();
            var that = this;

            // ComboBox fields
            var aComboBoxFields = ["division", "department_sensce", "Hod", "comboLocation_Senca", "comboMarket_Senca"];
            aComboBoxFields.forEach(function(sId) {
                var oControl = oView.byId(sId);
                if (oControl) {
                    oControl.attachChange(function(oEvent) {
                        var sValue = oEvent.getSource().getSelectedKey();
                        if (sValue) {
                            oControl.setValueState("None");
                            oControl.setValueStateText("");
                        } else {
                            oControl.setValueState("Error");
                            oControl.setValueStateText(that._getErrorMessage(sId));
                        }
                    });
                }
            });

            // Input fields
            var aInputFields = ["inputProjectName", "inputItemRequired", "BudgetValue"];
            aInputFields.forEach(function(sId) {
                var oControl = oView.byId(sId);
                if (oControl) {
                    oControl.attachLiveChange(function(oEvent) {
                        var sValue = oEvent.getParameter("value");
                        if (sId === "BudgetValue") {
                            var fValue = parseFloat(sValue);
                            if (fValue > 0 && !isNaN(fValue)) {
                                oControl.setValueState("None");
                                oControl.setValueStateText("");
                            } else {
                                oControl.setValueState("Error");
                                oControl.setValueStateText("Valid Budget is required.");
                            }
                        } else if (sValue.trim()) {
                            oControl.setValueState("None");
                            oControl.setValueStateText("");
                        } else {
                            oControl.setValueState("Error");
                            oControl.setValueStateText(that._getErrorMessage(sId));
                        }
                    });
                }
            });

            // DatePicker field
            var oDatePicker = oView.byId("dateImplement");
            if (oDatePicker) {
                oDatePicker.attachChange(function(oEvent) {
                    var sValue = oEvent.getSource().getValue();
                    if (sValue) {
                        oDatePicker.setValueState("None");
                        oDatePicker.setValueStateText("");
                    } else {
                        oDatePicker.setValueState("Error");
                        oDatePicker.setValueStateText("Implementation Date is required.");
                    }
                });
            }
        },

        _getErrorMessage: function(sId) {
            var oMessages = {
                "division": "Division is required.",
                "department_sensce": "Department is required.",
                "Hod": "HOD is required.",
                "comboLocation_Senca": "Location is required.",
                "comboMarket_Senca": "Market is required.",
                "inputProjectName": "Project Name is required.",
                "inputItemRequired": "Item Description is required.",
                "BudgetValue": "Valid Budget is required.",
                "dateImplement": "Implementation Date is required."
            };
            return oMessages[sId] || "This field is required.";
        },

        _onRouteSanctionfdController: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var basedNameUI = oArgs.basedNameUISSFD;
            this._SanctionfdNameUI = basedNameUI;
            this.onDepartmentDataFetch();
            this.onMarketDataFetch();
            this.onLocationDataFetch();
            this.onHODDataFetch();
        },

        onHODDataFetch: function() {
            var oView = this.getView();
            var oModelV2 = this.getOwnerComponent().getModel("approvalservicev2");
            oModelV2.read("/Approvers", {
                success: function(oData) {
                    if (oData) {
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSHODDatafetchsanc");
                    }
                },
                error: function(oError) {
                    // MessageToast.show("Failed to load HOD data.");
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
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSDEPARTMENTData");
                    }
                },
                error: function(oError) {
                    // MessageToast.show("Failed to load department data.");
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
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSMARKETDataFetch");
                    }
                },
                error: function(oError) {
                    // MessageToast.show("Failed to load market data.");
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
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        oView.setModel(oJSONModel, "SSLOCATIONDataFetch");
                    }
                },
                error: function(oError) {
                    // MessageToast.show("Failed to load location data.");
                }
            });
        },

        onDashboardui: function() {
            var Name = this._SanctionfdNameUI;
            if (Name === "SSFD") {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("DashboardUI", {
                    Name: "SSFD"
                });
            }
        },

        onSave: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");

            // Collect form data into ssfdDtl object
            var oSsfdDtl = {
                reqID: "REQ" + new Date().getTime(),
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                budgetDetails: aBudgetItems.map(function(oItem) {
                    return {
                        name: oItem.nature,
                        amount: oItem.amount,
                        contingency: oItem.contingency,
                        total: oItem.total
                    };
                })
            };

            // Wrap it in the full payload expected by the backend
            var oSavePayload = {
                reqID: oSsfdDtl.reqID,
                refNo: "REF-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                pendingWith: "Initiator",
                stage: "Draft",
                status: "Draft",
                type: "FD",
                currApprover: "system@company.com",
                remarks: "Request saved as draft by initiator.",
                ssfdDtl: oSsfdDtl
            };

            var oModel = this.getOwnerComponent().getModel("approvalservicev2");

            oModel.create("/Requests", oSavePayload, {
                success: function(oData) {
                    MessageBox.success("Request saved successfully!");
                },
                error: function(oError) {
                    // MessageToast.show("Error saving request: " + oError.message);
                }
            });
        },

        _constructPayload: function() {
            var oView = this.getView();
            var aBudgetItems = oView.getModel("budgetModel").getProperty("/items");

            var oSsfdDtl = {
                reqID: "REQ" + new Date().getTime(),
                division: oView.byId("division").getSelectedKey(),
                puDept: oView.byId("department_sensce").getSelectedKey(),
                hod: oView.byId("Hod").getSelectedKey(),
                loc: oView.byId("comboLocation_Senca").getSelectedKey(),
                projName: oView.byId("inputProjectName").getValue(),
                itemRequiredDesc: oView.byId("inputItemRequired").getValue(),
                budgetRequired: parseFloat(oView.byId("BudgetValue").getValue()) || 0,
                irr: oView.byId("inputIRR").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                implDt: oView.byId("dateImplement").getValue(),
                enggHours: oView.byId("inputHour").getValue(),
                remarks: "",
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0,
                budgetDetails: aBudgetItems.map(function(oItem) {
                    return {
                        name: oItem.nature,
                        amount: oItem.amount,
                        contingency: oItem.contingency,
                        total: oItem.total
                    };
                })
            };

            return {
                reqID: oSsfdDtl.reqID,
                refNo: "REF-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                pendingWith: "Approver",
                stage: "Pending",
                status: "Pending",
                type: "FD",
                currApprover: "system@company.com",
                remarks: "",
                ssfdDtl: oSsfdDtl
            };
        },

        _validatePayload: function(oPayload) {
            var oSsfdDtl = oPayload.ssfdDtl;
            var oView = this.getView();
            var aInvalidFields = [];

            // Reset all fields to normal state
            var aFields = [
                { id: "division", type: "ComboBox" },
                { id: "department_sensce", type: "ComboBox" },
                { id: "Hod", type: "ComboBox" },
                { id: "comboLocation_Senca", type: "ComboBox" },
                { id: "inputProjectName", type: "Input" },
                { id: "inputItemRequired", type: "Input" },
                { id: "BudgetValue", type: "Input" },
                { id: "comboMarket_Senca", type: "ComboBox" },
                { id: "dateImplement", type: "DatePicker" }
            ];

            aFields.forEach(function(oField) {
                var oControl = oView.byId(oField.id);
                if (oControl) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                }
            });

            // Validate mandatory fields
            if (!oSsfdDtl.division) {
                aInvalidFields.push({ id: "division", message: "Division is required." });
            }
            if (!oSsfdDtl.puDept) {
                aInvalidFields.push({ id: "department_sensce", message: "Department is required." });
            }
            if (!oSsfdDtl.hod) {
                aInvalidFields.push({ id: "Hod", message: "HOD is required." });
            }
            if (!oSsfdDtl.loc) {
                aInvalidFields.push({ id: "comboLocation_Senca", message: "Location is required." });
            }
            if (!oSsfdDtl.projName) {
                aInvalidFields.push({ id: "inputProjectName", message: "Project Name is required." });
            }
            if (!oSsfdDtl.itemRequiredDesc) {
                aInvalidFields.push({ id: "inputItemRequired", message: "Item Description is required." });
            }
            if (!oSsfdDtl.budgetRequired || oSsfdDtl.budgetRequired <= 0) {
                aInvalidFields.push({ id: "BudgetValue", message: "Valid Budget is required." });
            }
            if (!oSsfdDtl.market) {
                aInvalidFields.push({ id: "comboMarket_Senca", message: "Market is required." });
            }
            if (!oSsfdDtl.implDt) {
                aInvalidFields.push({ id: "dateImplement", message: "Implementation Date is required." });
            }

            // Highlight invalid fields
            aInvalidFields.forEach(function(oField) {
                var oControl = oView.byId(oField.id);
                if (oControl) {
                    oControl.setValueState("Error");
                    oControl.setValueStateText(oField.message);
                }
            });

            return aInvalidFields.length === 0;
        },

        _sendPayload: function(oPayload) {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            oModel.create("/Requests", oPayload, {
                success: function(oData) {
                    MessageBox.success("Request submitted successfully!", {
                        onClose: function() {
                            that.onDashboardui();
                        }
                    });
                },
                error: function(oError) {
                    // MessageToast.show("Error submitting request: " + oError.message);
                }
            });
        },

        onSubmit: function() {
            var oPayload = this._constructPayload();
            
            if (!this._validatePayload(oPayload)) {
                MessageBox.error("Please fill all required fields.", { title: "Error" });
                return;
            }

            this._sendPayload(oPayload);
        },

        onCancel: function() {
            MessageToast.show("Action canceled.");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("DashboardUI", {
                Name: this._SanctionfdNameUI
            });
        },

        onBudgetAmountChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var oModel = this.getView().getModel("budgetModel");
            var sPath = oInput.getBinding("value").getPath();
            var oContext = oInput.getBindingContext("budgetModel");
            var iIndex = parseInt(oContext.getPath().split("/").pop());
            var aItems = oModel.getProperty("/items");

            // Update the amount for the changed item
            aItems[iIndex].amount = parseFloat(sNewValue) || 0;

            // Calculate 5% contingency for non-total rows
            if (iIndex !== aItems.length - 1) {
                aItems[iIndex].contingency = aItems[iIndex].amount * 0.5;
                aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;
            }

            // Recalculate totals for the last row (Total)
            var iTotalAmount = 0;
            var iTotalContingency = 0;
            for (var i = 0; i < aItems.length - 1; i++) {
                iTotalAmount += aItems[i].amount;
                iTotalContingency += aItems[i].contingency;
            }
            aItems[aItems.length - 1].amount = iTotalAmount;
            aItems[aItems.length - 1].contingency = iTotalContingency;
            aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;

            // Update the BudgetValue field
            this.getView().byId("BudgetValue").setValue(aItems[aItems.length - 1].total.toString());

            // Update the model
            oModel.setProperty("/items", aItems);
            oModel.refresh(true);
            // MessageToast.show("Budget amount updated!");
        },

        onUploadTabAttchmment: function(oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oEvent.getParameter("files");
            if (!aFiles || aFiles.length === 0) {
                // MessageToast.show("No files selected.");
                return;
            }

            var oModel = this.getView().getModel("UploadDocSrvTabData");
            var aAttachments = oModel.getProperty("/attachments") || [];
            var sUploadedOn = new Date().toISOString().split("T")[0];

            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result;
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            uploadedBy: "Current User",
                            uploadedOn: sUploadedOn,
                            deleteTabVisible: true,
                            fileContent: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true);
                            // MessageToast.show("Files uploaded: " + aFiles.length);
                            oFileUploader.setValue("");
                        }
                    };
                    oReader.onerror = function() {
                        // MessageToast.show("Error reading file: " + file.name);
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
            var aAttachments = oModel.getProperty("/attachments");
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            if (!oAttachment || !oAttachment.fileContent) {
                // MessageToast.show("File content not found for: " + sFileName);
                return;
            }

            try {
                var sBase64Data = oAttachment.fileContent.split(',')[1];
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var oBlob = new Blob([byteArray], { type: oAttachment.fileContent.split(';')[0].split(':')[1] });
                var sUrl = URL.createObjectURL(oBlob);
                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                // MessageToast.show("Downloading file: " + sFileName);
            } catch (e) {
                // MessageToast.show("Error downloading file: " + sFileName);
            }
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

            if (iIndex !== -1) {
                var sFileName = aAttachments[iIndex].fileName;
                aAttachments.splice(iIndex, 1);
                oModel.setProperty("/attachments", aAttachments);
                oModel.refresh(true);
                // MessageToast.show("File deleted: " + sFileName);
            }
        },

        onLocationSenca: function(oEvent) {
            // MessageToast.show("Location selected: " + oEvent.getSource().getSelectedKey());
        },

        onDepartment: function(oEvent) {
            // MessageToast.show("Department selected: " + oEvent.getSource().getSelectedKey());
        },

        onMarketSenca: function(oEvent) {
            // MessageToast.show("Market selected: " + oEvent.getSource().getSelectedKey());
        },

        handleLiveChange: function(oEvent) {
            var oTextArea = oEvent.getSource();
            var sValue = oEvent.getParameter("value");
            if (sValue.length > 1000) {
                oTextArea.setValueState("Error");
                oTextArea.setValueStateText("Maximum 1000 characters allowed.");
            } else {
                oTextArea.setValueState("None");
                oTextArea.setValueStateText("");
            }
        }
    });
});
