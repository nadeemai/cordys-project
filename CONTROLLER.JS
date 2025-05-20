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
