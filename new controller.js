NEW CODE

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
