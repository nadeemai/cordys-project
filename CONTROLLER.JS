UPDATE CODE 6

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
                    { nature: "Capital Budget", amount: 500, contingency: 25, total: 525 },
                    { nature: "Revenue Budget", amount: 475, contingency: 23.75, total: 498.75 },
                    { nature: "Personnel Cost", amount: 1000, contingency: 50, total: 1050 },
                    { nature: "Total", amount: 1975, contingency: 98.75, total: 2073.75 }
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
                remarks: sRemarks,
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
                remarks: sRemarks,
                ssfdDtl: oSsfdDtl
            };
        },

        _validatePayload: function(oPayload) {
            var oSsfdDtl = oPayload.ssfdDtl;
            return (
                oSsfdDtl.division &&
                oSsfdDtl.puDept &&
                oSsfdDtl.hod &&
                oSsfdDtl.loc &&
                oSsfdDtl.projName &&
                oSsfdDtl.itemRequiredDesc &&
                oSsfdDtl.budgetRequired &&
                oSsfdDtl.market &&
                oSsfdDtl.implDt &&
                oPayload.remarks
            );
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
                    MessageToast.show("Error submitting request: " + oError.message);
                }
            });
        },

        onSubmit: function() {
            var that = this;

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
                        oSubmitBtn.setEnabled(!!sValue.trim());
                    }
                });

                var oSubmitBtn = new sap.m.Button({
                    text: "Submit",
                    type: "Accept",
                    enabled: false,
                    press: function() {
                        var sRemarks = oTextArea.getValue().trim();
                        var oPayload = that._constructPayload(sRemarks);

                        if (!that._validatePayload(oPayload)) {
                            MessageBox.error("Please fill all required fields.", { title: "Error" });
                            return;
                        }

                        that._sendPayload(oPayload);
                        that._oRemarksDialog.close();
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
                    title: "Remarks",
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
                        oSubmitBtn.setEnabled(false);
                    }
                });
            }

            this._oRemarksDialog.open();
        },

        onCancel: function() {
            // MessageToast.show("Action canceled.");
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
                aItems[iIndex].contingency = aItems[iIndex].amount * 0.05;
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



UPDATE CODE 5

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
            // Initialize budget data
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 500, contingency: 25, total: 525 },
                    { nature: "Revenue Budget", amount: 475, contingency: 0, total: 475 },
                    { nature: "Personnel Cost", amount: 1000, contingency: 0, total: 1000 },
                    { nature: "Total", amount: 1975, contingency: 25, total: 2000 }
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
                    MessageToast.show("Failed to load HOD data.");
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
                    MessageToast.show("Failed to load department data.");
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
                    MessageToast.show("Failed to load market data.");
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
                    MessageToast.show("Failed to load location data.");
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
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0
            };

            // Wrap it in the full payload expected by the backend
            var oSavePayload = {
                reqID: oSsfdDtl.reqID,
                refNo: "REF-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                pendingWith: "Initiator",
                stage: "Draft",
                status: "Saved",
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
                    MessageToast.show("Error saving request: " + oError.message);
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
                remarks: sRemarks,
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                deliverables: oView.byId("_IDGenTextArea2").getValue(),
                capitalBudget: aBudgetItems.find(item => item.nature === "Capital Budget")?.amount || 0,
                revenueBudget: aBudgetItems.find(item => item.nature === "Revenue Budget")?.amount || 0,
                personnelCost: aBudgetItems.find(item => item.nature === "Personnel Cost")?.amount || 0
            };

            return {
                reqID: oSsfdDtl.reqID,
                refNo: "REF-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                pendingWith: "Approver",
                stage: "Submitted",
                status: "Pending",
                type: "FD",
                currApprover: "system@company.com",
                remarks: sRemarks,
                ssfdDtl: oSsfdDtl
            };
        },

        _validatePayload: function(oPayload) {
            var oSsfdDtl = oPayload.ssfdDtl;
            return (
                oSsfdDtl.division &&
                oSsfdDtl.puDept &&
                oSsfdDtl.hod &&
                oSsfdDtl.loc &&
                oSsfdDtl.projName &&
                oSsfdDtl.itemRequiredDesc &&
                oSsfdDtl.budgetRequired &&
                oSsfdDtl.market &&
                oSsfdDtl.implDt &&
                oPayload.remarks
            );
        },

        _sendPayload: function(oPayload) {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("approvalservicev2");
            oModel.create("/Requests", oPayload, {
                success: function(oData) {
                    MessageBox.success("Request submitted successfully!", {
                        onClose: function() {
                            // Navigate to DashboardUI after the MessageBox is closed
                            that.onDashboardui();
                        }
                    });
                },
                error: function(oError) {
                    MessageToast.show("Error submitting request: " + oError.message);
                }
            });
        },

        onSubmit: function() {
            var that = this;

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
                        oSubmitBtn.setEnabled(!!sValue.trim());
                    }
                });

                var oSubmitBtn = new sap.m.Button({
                    text: "Submit",
                    type: "Accept",
                    enabled: false,
                    press: function() {
                        var sRemarks = oTextArea.getValue().trim();
                        var oPayload = that._constructPayload(sRemarks);

                        if (!that._validatePayload(oPayload)) {
                            MessageBox.error("Please fill all required fields.", { title: "Error" });
                            return;
                        }

                        // Submit the payload directly without confirmation dialog
                        that._sendPayload(oPayload);
                        that._oRemarksDialog.close();
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
                    title: "Remarks",
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

            aItems[iIndex].amount = parseFloat(sNewValue) || 0;
            aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;

            if (iIndex !== aItems.length - 1) {
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
            }

            oModel.setProperty("/items", aItems);
            MessageToast.show("Budget amount updated!");
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
                            MessageToast.show("Files uploaded: " + aFiles.length);
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
            var aAttachments = oModel.getProperty("/attachments");
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            if (!oAttachment || !oAttachment.fileContent) {
                MessageToast.show("File content not found for: " + sFileName);
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
                MessageToast.show("Downloading file: " + sFileName);
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName);
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
                MessageToast.show("File deleted: " + sFileName);
            }
        },

        onLocationSenca: function(oEvent) {
            MessageToast.show("Location selected: " + oEvent.getSource().getSelectedKey());
        },

        onDepartment: function(oEvent) {
            MessageToast.show("Department selected: " + oEvent.getSource().getSelectedKey());
        },

        onMarketSenca: function(oEvent) {
            MessageToast.show("Market selected: " + oEvent.getSource().getSelectedKey());
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



UPDATED CODE 4

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function(Controller, JSONModel, MessageToast, Fragment) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize budget data
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 500, contingency: 25, total: 525 },
                    { nature: "Revenue Budget", amount: 475, contingency: 0, total: 475 },
                    { nature: "Personnel Cost", amount: 1000, contingency: 0, total: 1000 },
                    { nature: "Total", amount: 1975, contingency: 25, total: 2000 }
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
                        title: "Ankit  Created a Request",
                        text: "Please go to the evaluate.",
                        userName: "Ankit ",
                        userPicture: "https://ui-avatars.com/api/?name=Ankit+Rath"
                    },
                    {
                        dateTime: "7/22/2016 at 3:00 PM",
                        title: "Ayushi added a note [Approved]",
                        text: "Submitted.",
                        userName: "Ayushi",
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
                    sap.m.MessageToast.show("Failed to load HOD data.", oError);
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
                    sap.m.MessageToast.show("Failed to load data.", oError);
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
                    sap.m.MessageToast.show("Failed to load data.", oError);
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
                    sap.m.MessageToast.show("Failed to load data.", oError);
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
            // Load the dialog fragment if not already loaded
            if (!this._oSaveDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.cordys.cordys.view.fragments.SaveDialog",
                    controller: this
                }).then(function(oDialog) {
                    this._oSaveDialog = oDialog;
                    this.getView().addDependent(this._oSaveDialog);
                    this._oSaveDialog.open();
                }.bind(this));
            } else {
                this._oSaveDialog.open();
            }
        },

        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                referenceNumber: oView.byId("inputRequestIDSanctionfdpage").getValue(),
                location: oView.byId("comboLocation_Senca").getSelectedKey(),
                budget: oView.byId("BudgetValue").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("department_sensce").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                hod: oView.byId("Hod").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                expectedOutcome: oView.byId("_IDGenTextArea2").getValue(),
                attachments: this.getView().getModel("UploadDocSrvTabData").getProperty("/attachments")
            };
            MessageToast.show("Form data and attachments saved: " + JSON.stringify(oFormData));
            this._oSaveDialog.close();
        },

        onCancelSave: function() {
            this._oSaveDialog.close();
            MessageToast.show("Save action canceled.");
        },

        onSubmit: function() {
            var oView = this.getView();
            var sRefNumber = oView.byId("inputRequestIDSanctionfdpage").getValue();
            if (!sRefNumber) {
                MessageToast.show("Reference Number is required!");
                return;
            }

            var oSubmitData = {
                referenceNumber: sRefNumber,
                location: oView.byId("comboLocation_Senca").getSelectedKey(),
                budget: oView.byId("BudgetValue").getValue(),
                implementDate: oView.byId("dateImplement").getValue(),
                division: oView.byId("division").getSelectedKey(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                department: oView.byId("department_sensce").getSelectedKey(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket_Senca").getSelectedKey(),
                hod: oView.byId("Hod").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                hour: oView.byId("inputHour").getValue(),
                background: oView.byId("_IDGenTextArea").getValue(),
                justification: oView.byId("_IDGenTextArea1").getValue(),
                expectedOutcome: oView.byId("_IDGenTextArea2").getValue(),
                attachments: this.getView().getModel("UploadDocSrvTabData").getProperty("/attachments")
            };
            MessageToast.show("Form submitted successfully: " + JSON.stringify(oSubmitData));
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

            aItems[iIndex].amount = parseFloat(sNewValue) || 0;
            aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;

            if (iIndex !== aItems.length - 1) {
                var iTotalAmount = 0;
                var iTotalContingency = 0;
                for (var i = 0; i < aItems.length - 1; i++) {
                    iTotalAmount += aItems[i].amount;
                    iTotalContingency += aItems[i].contingency;
                }
                aItems[aItems.length - 1].amount = iTotalAmount;
                aItems[aItems.length - 1].contingency = iTotalContingency;
                aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;

                // Update the Budget Requirment field with the total from the "Total" row
                this.getView().byId("BudgetValue").setValue(aItems[aItems.length - 1].total.toString());
            }

            oModel.setProperty("/items", aItems);
            MessageToast.show("Budget amount updated!");
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
                            MessageToast.show("Files uploaded: " + aFiles.length);
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
            var aAttachments = oModel.getProperty("/attachments");
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            if (!oAttachment || !oAttachment.fileContent) {
                MessageToast.show("File content not found for: " + sFileName);
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
                MessageToast.show("Downloading file: " + sFileName);
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName);
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
                MessageToast.show("File deleted: " + sFileName);
            }
        },

        onLocationSenca: function(oEvent) {
            MessageToast.show("Location selected: " + oEvent.getSource().getSelectedKey());
        },

        onDepartment: function(oEvent) {
            MessageToast.show("Department selected: " + oEvent.getSource().getSelectedKey());
        },

        onMarketSenca: function(oEvent) {
            MessageToast.show("Market selected: " + oEvent.getSource().getSelectedKey());
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

UPDATED CODE 3

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
    
], function(Controller, JSONModel, MessageToast, Fragment) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize budget data
           
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 500, contingency: 25, total: 525 },
                    { nature: "Revenue Budget", amount: 475, contingency: 0, total: 475 },
                    { nature: "Personnel Cost", amount: 1000, contingency: 0, total: 1000 },
                    { nature: "Total", amount: 1975, contingency: 25, total: 2000 }
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
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);
        },
        _onRouteSanctionfdController: function(oEvent){
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
            var Name = this._SanctionfdNameUI;
            if(Name === "SSFD"){
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("DashboardUI", {
                    Name: "SSFD"
                });
            }
        },
        onBackDashboardpage: function() {
            MessageToast.show("Navigating back to dashboard...");
            // Example: this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onSavePress: function() {
            // Load the dialog fragment if not already loaded
            if (!this._oSaveDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.cordys.cordys.view.fragments.SaveDialog",
                    controller: this
                }).then(function(oDialog) {
                    this._oSaveDialog = oDialog;
                    this.getView().addDependent(this._oSaveDialog);
                    this._oSaveDialog.open();
                }.bind(this));
            } else {
                this._oSaveDialog.open();
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

        onSubmitPress: function() {
            var oView = this.getView();
            var sRefNumber = oView.byId("inputRefNumber").getValue();
            if (!sRefNumber) {
                MessageToast.show("Reference Number is required!");
                return;
            }

            var oSubmitData = {
                referenceNumber: sRefNumber,
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
            MessageToast.show("Form submitted successfully: " + JSON.stringify(oSubmitData));
            // Add actual submit logic (e.g., OData service call) here
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
            aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;

            if (iIndex !== aItems.length - 1) {
                var iTotalAmount = 0;
                var iTotalContingency = 0;
                for (var i = 0; i < aItems.length - 1; i++) {
                    iTotalAmount += aItems[i].amount;
                    iTotalContingency += aItems[i].contingency;
                }
                aItems[aItems.length - 1].amount = iTotalAmount;
                aItems[aItems.length - 1].contingency = iTotalContingency;
                aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;
            }

            oModel.setProperty("/items", aItems);
            MessageToast.show("Budget amount updated!");
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

            // Process each file
            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result; // base64 string including the data URI prefix
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            uploadedBy: "Current User",
                            uploadedOn: sUploadedOn,
                            deleteTabVisible: true,
                            fileContent: sBase64Data // Store the base64 string
                        });

                        // Update the model after all files are processed
                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true); // Force refresh to update bindings
                            MessageToast.show("Files uploaded: " + aFiles.length);
                            oFileUploader.setValue(""); // Clear the uploader
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
                            fileContent: sBase64Data
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
            var aAttachments = oModel.getProperty("/attachments");
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            if (!oAttachment || !oAttachment.fileContent) {
                MessageToast.show("File content not found for: " + sFileName);
                return;
            }

            try {
                // Extract the base64 data (remove the data URI prefix)
                var sBase64Data = oAttachment.fileContent.split(',')[1];
                // Convert base64 to binary
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                // Create Blob
                var oBlob = new Blob([byteArray], { type: oAttachment.fileContent.split(';')[0].split(':')[1] });
                // Create download link
                var sUrl = URL.createObjectURL(oBlob);
                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName);
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName);
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
                oModel.refresh(true); // Force refresh to update bindings
                MessageToast.show("File deleted: " + sFileName);
            }
        }
    });
});


UPDATED CODE 2

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
    
], function(Controller, JSONModel, MessageToast, Fragment) {
    "use strict";
    return Controller.extend("com.mmapprovalhub.approvalhub.controller.Sanctionfd", {
        onInit: function() {
            // Initialize budget data
           
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 500, contingency: 25, total: 525 },
                    { nature: "Revenue Budget", amount: 475, contingency: 0, total: 475 },
                    { nature: "Personnel Cost", amount: 1000, contingency: 0, total: 1000 },
                    { nature: "Total", amount: 1975, contingency: 25, total: 2000 }
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
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Sanctionfd").attachPatternMatched(this._onRouteSanctionfdController, this);
        },
        _onRouteSanctionfdController: function(oEvent){
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
            var Name = this._SanctionfdNameUI;
            if(Name === "SSFD"){
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("DashboardUI", {
                    Name: "SSFD"
                });
            }
        },
        onBackDashboardpage: function() {
            MessageToast.show("Navigating back to dashboard...");
            // Example: this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onSavePress: function() {
            // Load the dialog fragment if not already loaded
            if (!this._oSaveDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.cordys.cordys.view.fragments.SaveDialog",
                    controller: this
                }).then(function(oDialog) {
                    this._oSaveDialog = oDialog;
                    this.getView().addDependent(this._oSaveDialog);
                    this._oSaveDialog.open();
                }.bind(this));
            } else {
                this._oSaveDialog.open();
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

        onSubmitPress: function() {
            var oView = this.getView();
            var sRefNumber = oView.byId("inputRefNumber").getValue();
            if (!sRefNumber) {
                MessageToast.show("Reference Number is required!");
                return;
            }

            var oSubmitData = {
                referenceNumber: sRefNumber,
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
            MessageToast.show("Form submitted successfully: " + JSON.stringify(oSubmitData));
            // Add actual submit logic (e.g., OData service call) here
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
            aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;

            if (iIndex !== aItems.length - 1) {
                var iTotalAmount = 0;
                var iTotalContingency = 0;
                for (var i = 0; i < aItems.length - 1; i++) {
                    iTotalAmount += aItems[i].amount;
                    iTotalContingency += aItems[i].contingency;
                }
                aItems[aItems.length - 1].amount = iTotalAmount;
                aItems[aItems.length - 1].contingency = iTotalContingency;
                aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;
            }

            oModel.setProperty("/items", aItems);
            MessageToast.show("Budget amount updated!");
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

            // Process each file
            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result; // base64 string including the data URI prefix
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            uploadedBy: "Current User",
                            uploadedOn: sUploadedOn,
                            deleteTabVisible: true,
                            fileContent: sBase64Data // Store the base64 string
                        });

                        // Update the model after all files are processed
                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true); // Force refresh to update bindings
                            MessageToast.show("Files uploaded: " + aFiles.length);
                            oFileUploader.setValue(""); // Clear the uploader
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
                            fileContent: sBase64Data
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
            var aAttachments = oModel.getProperty("/attachments");
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            if (!oAttachment || !oAttachment.fileContent) {
                MessageToast.show("File content not found for: " + sFileName);
                return;
            }

            try {
                // Extract the base64 data (remove the data URI prefix)
                var sBase64Data = oAttachment.fileContent.split(',')[1];
                // Convert base64 to binary
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                // Create Blob
                var oBlob = new Blob([byteArray], { type: oAttachment.fileContent.split(';')[0].split(':')[1] });
                // Create download link
                var sUrl = URL.createObjectURL(oBlob);
                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName);
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName);
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
                oModel.refresh(true); // Force refresh to update bindings
                MessageToast.show("File deleted: " + sFileName);
            }
        }
    });
});


UPDATE CODE

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function(Controller, JSONModel, MessageToast, Fragment) {
    "use strict";
    return Controller.extend("com.cordys.cordys.controller.cordys", {
        onInit: function() {
            // Initialize budget data
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 500, contingency: 25, total: 525 },
                    { nature: "Revenue Budget", amount: 475, contingency: 0, total: 475 },
                    { nature: "Personnel Cost", amount: 1000, contingency: 0, total: 1000 },
                    { nature: "Total", amount: 1975, contingency: 25, total: 2000 }
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
        },

        onBackDashboardpage: function() {
            MessageToast.show("Navigating back to dashboard...");
            // Example: this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onSavePress: function() {
            // Load the dialog fragment if not already loaded
            if (!this._oSaveDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.cordys.cordys.view.SaveDialog",
                    controller: this
                }).then(function(oDialog) {
                    this._oSaveDialog = oDialog;
                    this.getView().addDependent(this._oSaveDialog);
                    this._oSaveDialog.open();
                }.bind(this));
            } else {
                this._oSaveDialog.open();
            }
        },

        onConfirmSave: function() {
            var oView = this.getView();
            var oFormData = {
                referenceNumber: oView.byId("inputRefNumber").getText(), // Use getText() since it's a Text element
                location: oView.byId("comboLocation").getSelectedKey(),
                budget: oView.byId("inputBudget").getValue(),
                projectName: oView.byId("inputProjectName").getValue(),
                irr: oView.byId("inputIRR").getValue(),
                itemRequired: oView.byId("inputItemRequired").getValue(),
                market: oView.byId("comboMarket").getSelectedKey(),
                date: oView.byId("dateField").getValue(),
                engineeringHours: oView.byId("inputHour").getValue(),
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

        onSubmitPress: function() {
            var oView = this.getView();
            var sRefNumber = oView.byId("inputRefNumber").getText(); // Use getText() since it's a Text element
            var sProjectName = oView.byId("inputProjectName").getValue();
            var sItemRequired = oView.byId("inputItemRequired").getValue();

            // Basic validation
            if (!sRefNumber) {
                MessageToast.show("Reference Number is required!");
                return;
            }
            if (!sProjectName) {
                MessageToast.show("Project Name is required!");
                return;
            }
            if (!sItemRequired) {
                MessageToast.show("Item Required is required!");
                return;
            }

            var oSubmitData = {
                // referenceNumber: sRefNumber,
                // location: oView.byId("comboLocation").getSelectedKey(),
                // budget: oView.byId("inputBudget").getValue(),
                // projectName: sProjectName,
                // irr: oView.byId("inputIRR").getValue(),
                // itemRequired: sItemRequired,
                // market: oView.byId("comboMarket").getSelectedKey(),
                // date: oView.byId("dateField").getValue(),
                // engineeringHours: oView.byId("inputHour").getValue(),
                // background: oView.byId("_IDGenTextArea").getValue(),
                // justification: oView.byId("_IDGenTextArea1").getValue(),
                // expectedOutcome: oView.byId("_IDGenTextArea2").getValue(),
                // attachments: this.getView().getModel("UploadDocSrvTabData").getProperty("/attachments")
            };
            MessageToast.show("Form submitted successfully: " + JSON.stringify(oSubmitData));
            // Add actual submit logic (e.g., OData service call) here
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
            aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;

            if (iIndex !== aItems.length - 1) {
                var iTotalAmount = 0;
                var iTotalContingency = 0;
                for (var i = 0; i < aItems.length - 1; i++) {
                    iTotalAmount += aItems[i].amount;
                    iTotalContingency += aItems[i].contingency;
                }
                aItems[aItems.length - 1].amount = iTotalAmount;
                aItems[aItems.length - 1].contingency = iTotalContingency;
                aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;
            }

            oModel.setProperty("/items", aItems);
            MessageToast.show("Budget amount updated!");
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

            // Process each file
            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result; // base64 string including the data URI prefix
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            uploadedBy: "Current User",
                            uploadedOn: sUploadedOn,
                            deleteTabVisible: true,
                            fileContent: sBase64Data // Store the base64 string
                        });

                        // Update the model after all files are processed
                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            oModel.refresh(true); // Force refresh to update bindings
                            MessageToast.show("Files uploaded: " + aFiles.length);
                            oFileUploader.setValue(""); // Clear the uploader
                        }
                    };
                    oReader.onerror = function() {
                        MessageToast.show("Error reading file: " + file.name);
                    };
                    oReader.readAsDataURL(file); // Read file as base64
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
                MessageToast.show("File content not found for: " + sFileName);
                return;
            }

            try {
                // Extract the base64 data (remove the data URI prefix)
                var sBase64Data = oAttachment.fileContent.split(',')[1];
                // Convert base64 to binary
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                // Create Blob
                var oBlob = new Blob([byteArray], { type: oAttachment.fileContent.split(';')[0].split(':')[1] });
                // Create download link
                var sUrl = URL.createObjectURL(oBlob);
                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName);
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName);
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
                oModel.refresh(true); // Force refresh to update bindings
                MessageToast.show("File deleted: " + sFileName);
            }
        }
    });
});

OLD CODE

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function(Controller, JSONModel, MessageToast, Fragment) {
    "use strict";
    return Controller.extend("com.cordys.cordys.controller.cordys", {
        onInit: function() {
            // Initialize budget data
            var oBudgetData = {
                items: [
                    { nature: "Capital Budget", amount: 500, contingency: 25, total: 525 },
                    { nature: "Revenue Budget", amount: 475, contingency: 0, total: 475 },
                    { nature: "Personnel Cost", amount: 1000, contingency: 0, total: 1000 },
                    { nature: "Total", amount: 1975, contingency: 25, total: 2000 }
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
        },

        onBackDashboardpage: function() {
            MessageToast.show("Navigating back to dashboard...");
            // Example: this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onSavePress: function() {
            // Load the dialog fragment if not already loaded
            if (!this._oSaveDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.cordys.cordys.view.fragments.SaveDialog",
                    controller: this
                }).then(function(oDialog) {
                    this._oSaveDialog = oDialog;
                    this.getView().addDependent(this._oSaveDialog);
                    this._oSaveDialog.open();
                }.bind(this));
            } else {
                this._oSaveDialog.open();
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

        onSubmitPress: function() {
            var oView = this.getView();
            var sRefNumber = oView.byId("inputRefNumber").getValue();
            if (!sRefNumber) {
                MessageToast.show("Reference Number is required!");
                return;
            }

            var oSubmitData = {
                referenceNumber: sRefNumber,
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
            MessageToast.show("Form submitted successfully: " + JSON.stringify(oSubmitData));
            // Add actual submit logic (e.g., OData service call) here
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
            aItems[iIndex].total = aItems[iIndex].amount + aItems[iIndex].contingency;

            if (iIndex !== aItems.length - 1) {
                var iTotalAmount = 0;
                var iTotalContingency = 0;
                for (var i = 0; i < aItems.length - 1; i++) {
                    iTotalAmount += aItems[i].amount;
                    iTotalContingency += aItems[i].contingency;
                }
                aItems[aItems.length - 1].amount = iTotalAmount;
                aItems[aItems.length - 1].contingency = iTotalContingency;
                aItems[aItems.length - 1].total = iTotalAmount + iTotalContingency;
            }

            oModel.setProperty("/items", aItems);
            MessageToast.show("Budget amount updated!");
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

            // Process each file
            for (var i = 0; i < aFiles.length; i++) {
                (function(file, index) {
                    var oReader = new FileReader();
                    oReader.onload = function(e) {
                        var sBase64Data = e.target.result; // base64 string including the data URI prefix
                        aAttachments.push({
                            ID: new Date().getTime().toString() + index,
                            fileName: file.name,
                            uploadedBy: "Current User",
                            uploadedOn: sUploadedOn,
                            deleteTabVisible: true,
                            fileContent: sBase64Data // Store the base64 string
                        });

                        // Update the model after all files are processed
                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
                            MessageToast.show("Files uploaded: " + aFiles.length);
                            oFileUploader.setValue(""); // Clear the uploader
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
                            fileContent: sBase64Data
                        });

                        if (index === aFiles.length - 1) {
                            oModel.setProperty("/attachments", aAttachments);
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
            var aAttachments = oModel.getProperty("/attachments");
            var oAttachment = aAttachments.find(function(oItem) {
                return oItem.ID === sID;
            });

            if (!oAttachment || !oAttachment.fileContent) {
                MessageToast.show("File content not found for: " + sFileName);
                return;
            }

            try {
                // Extract the base64 data (remove the data URI prefix)
                var sBase64Data = oAttachment.fileContent.split(',')[1];
                // Convert base64 to binary
                var byteCharacters = atob(sBase64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                // Create Blob
                var oBlob = new Blob([byteArray], { type: oAttachment.fileContent.split(';')[0].split(':')[1] });
                // Create download link
                var sUrl = URL.createObjectURL(oBlob);
                var oLink = document.createElement("a");
                oLink.href = sUrl;
                oLink.download = sFileName;
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
                URL.revokeObjectURL(sUrl);
                MessageToast.show("Downloading file: " + sFileName);
            } catch (e) {
                MessageToast.show("Error downloading file: " + sFileName);
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
                MessageToast.show("File deleted: " + sFileName);
            }
        }
    });
});
