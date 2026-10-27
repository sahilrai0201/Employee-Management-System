sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/core/Fragment",
  "sap/ui/export/Spreadsheet"
], function (Controller, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, Fragment, Spreadsheet) {
  "use strict";

  return Controller.extend("corp.ems.employee.controller.ListReport", {

    onInit: function () {
      this._oRouter = this.getOwnerComponent().getRouter();
      this._oTable = this.byId("employeeTable");
    },

    /* =========================================================== */
    /* Filter Bar & Search Logic                                   */
    /* =========================================================== */

    onSearchFilters: function () {
      var aFilters = [];

      var sEmpID = this.byId("filterEmpID").getValue();
      if (sEmpID) {
        aFilters.push(new Filter("EmployeeID", FilterOperator.Contains, sEmpID.trim()));
      }

      var sName = this.byId("filterName").getValue();
      if (sName) {
        aFilters.push(new Filter("FullName", FilterOperator.Contains, sName.trim()));
      }

      var sDept = this.byId("filterDept").getValue();
      if (sDept) {
        aFilters.push(new Filter("Department", FilterOperator.Contains, sDept.trim()));
      }

      var sJob = this.byId("filterJobTitle").getValue();
      if (sJob) {
        aFilters.push(new Filter("JobTitle", FilterOperator.Contains, sJob.trim()));
      }

      var sStatus = this.byId("filterStatus").getSelectedKey();
      if (sStatus) {
        aFilters.push(new Filter("EmploymentStatus", FilterOperator.EQ, sStatus));
      }

      var sDate = this.byId("filterJoiningDate").getValue();
      if (sDate) {
        aFilters.push(new Filter("JoiningDate", FilterOperator.Contains, sDate));
      }

      var sType = this.byId("filterEmpType").getSelectedKey();
      if (sType) {
        aFilters.push(new Filter("EmploymentType", FilterOperator.EQ, sType));
      }

      this._applyTableFilters(aFilters);
    },

    onClearFilters: function () {
      this.byId("filterEmpID").setValue("");
      this.byId("filterName").setValue("");
      this.byId("filterDept").setValue("");
      this.byId("filterJobTitle").setValue("");
      this.byId("filterStatus").setSelectedKey("");
      this.byId("filterJoiningDate").setValue("");
      this.byId("filterEmpType").setSelectedKey("");
      this.byId("globalSearchField").setValue("");

      this._applyTableFilters([]);
      MessageToast.show("Filters cleared.");
    },

    onQuickSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("query") || oEvent.getSource().getValue();
      if (!sQuery) {
        this.onSearchFilters();
        return;
      }

      var aSearchFilters = [
        new Filter("EmployeeID", FilterOperator.Contains, sQuery),
        new Filter("FullName", FilterOperator.Contains, sQuery),
        new Filter("Department", FilterOperator.Contains, sQuery),
        new Filter("JobTitle", FilterOperator.Contains, sQuery),
        new Filter("Email", FilterOperator.Contains, sQuery)
      ];

      var oCombinedFilter = new Filter({
        filters: aSearchFilters,
        and: false
      });

      this._applyTableFilters([oCombinedFilter]);
    },

    _applyTableFilters: function (aFilters) {
      var oBinding = this._oTable.getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters, "Application");
        var iCount = oBinding.getLength();
        this.getOwnerComponent().getModel("appView").setProperty("/totalCount", iCount);
      }
    },

    onAdaptFilters: function () {
      MessageBox.information(
        "Standard Fiori Variant Management: All 7 key HR filter fields (Employee ID, Name, Department, Job Title, Status, Joining Date, Employment Type) are already active and visible on the Filter Bar."
      );
    },

    /* =========================================================== */
    /* Table Selection and Navigation                              */
    /* =========================================================== */

    onTableSelectionChange: function () {
      var aSelected = this._oTable.getSelectedItems();
      var oAppView = this.getOwnerComponent().getModel("appView");
      oAppView.setProperty("/selectedCount", aSelected.length);
      oAppView.setProperty("/hasSelection", aSelected.length > 0);
    },

    onItemPress: function (oEvent) {
      var oItem = oEvent.getSource();
      var oContext = oItem.getBindingContext("employeeModel");
      var sEmpID = oContext.getProperty("EmployeeID");
      this._oRouter.navTo("EmployeeDetails", {
        EmployeeID: sEmpID
      });
    },

    onEditSelectedEmployee: function () {
      var aSelected = this._oTable.getSelectedItems();
      if (aSelected.length === 1) {
        var oContext = aSelected[0].getBindingContext("employeeModel");
        var sEmpID = oContext.getProperty("EmployeeID");
        this.getOwnerComponent().getModel("appView").setProperty("/isEditMode", true);
        this._oRouter.navTo("EmployeeDetails", {
          EmployeeID: sEmpID
        });
      }
    },

    onRefreshData: function () {
      var oModel = this.getOwnerComponent().getModel("employeeModel");
      var oAppView = this.getOwnerComponent().getModel("appView");
      oAppView.setProperty("/isBusy", true);
      
      fetch("/sap/opu/odata/sap/ZEMPLOYEE_SRV/EmployeeSet")
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var aList = [];
          if (data && data.d && Array.isArray(data.d.results)) {
            aList = data.d.results;
          } else if (Array.isArray(data)) {
            aList = data;
          } else if (data && Array.isArray(data.value)) {
            aList = data.value;
          }
          oModel.setData(aList);
          oAppView.setProperty("/totalCount", aList.length);
          oAppView.setProperty("/selectedCount", 0);
          oAppView.setProperty("/hasSelection", false);
          oAppView.setProperty("/isBusy", false);
          MessageToast.show("Employee records refreshed from SAP Gateway OData V2 service.");
        })
        .catch(function (err) {
          oAppView.setProperty("/isBusy", false);
          MessageBox.error("Failed to refresh records from server: " + err.message);
        });
    },

    /* =========================================================== */
    /* Create Employee Dialog & Validation                         */
    /* =========================================================== */

    onOpenCreateDialog: function () {
      if (!this._oCreateDialog) {
        Fragment.load({
          id: this.getView().getId(),
          name: "corp.ems.employee.fragment.CreateEmployeeDialog",
          controller: this
        }).then(function (oDialog) {
          this._oCreateDialog = oDialog;
          this.getView().addDependent(this._oCreateDialog);
          this._initNewEmployeeModel();
          this._oCreateDialog.open();
        }.bind(this));
      } else {
        this._initNewEmployeeModel();
        this._oCreateDialog.open();
      }
    },

    _initNewEmployeeModel: function () {
      var oNewModel = new JSONModel({
        EmployeeID: "",
        FirstName: "",
        LastName: "",
        Email: "",
        PhoneNumber: "",
        DateOfBirth: "",
        Department: "Engineering",
        JobTitle: "",
        Manager: "Alexander Wright",
        JoiningDate: new Date().toISOString().slice(0, 10),
        EmploymentType: "Full-Time",
        EmploymentStatus: "Active",
        OfficeLocation: "Walldorf, Germany",
        Salary: 85000,
        Currency: "EUR"
      });
      this.getView().setModel(oNewModel, "newEmployee");
    },

    onLiveValidateID: function (oEvent) {
      var sVal = oEvent.getParameter("value");
      var oInput = oEvent.getSource();
      var aExisting = this.getOwnerComponent().getModel("employeeModel").getData() || [];
      var bDuplicate = aExisting.some(function (emp) {
        return emp.EmployeeID && emp.EmployeeID.toUpperCase() === sVal.toUpperCase();
      });

      if (bDuplicate) {
        oInput.setValueState("Error");
        oInput.setValueStateText("Employee ID already exists. Duplicate IDs are rejected.");
      } else if (!sVal.trim()) {
        oInput.setValueState("Error");
        oInput.setValueStateText("Employee ID is mandatory.");
      } else {
        oInput.setValueState("None");
      }
    },

    onCreateDialogSave: function () {
      var oNewEmp = this.getView().getModel("newEmployee").getData();
      var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

      // Validate Mandatory Fields
      if (!oNewEmp.EmployeeID || !oNewEmp.FirstName || !oNewEmp.LastName || !oNewEmp.Email || !oNewEmp.Department || !oNewEmp.JobTitle || !oNewEmp.JoiningDate) {
        MessageBox.error(oResourceBundle.getText("msgValidationError"));
        return;
      }

      // Check Duplicate ID
      var aExisting = this.getOwnerComponent().getModel("employeeModel").getData() || [];
      var bDuplicate = aExisting.some(function (emp) {
        return emp.EmployeeID.toUpperCase() === oNewEmp.EmployeeID.trim().toUpperCase();
      });

      if (bDuplicate) {
        MessageBox.error(oResourceBundle.getText("msgDuplicateID", [oNewEmp.EmployeeID]));
        return;
      }

      // Check Email format
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(oNewEmp.Email)) {
        MessageBox.error(oResourceBundle.getText("msgInvalidEmail"));
        return;
      }

      // Format payload
      var oPayload = Object.assign({}, oNewEmp);
      oPayload.EmployeeID = oPayload.EmployeeID.trim().toUpperCase();
      oPayload.FirstName = oPayload.FirstName.trim();
      oPayload.LastName = oPayload.LastName.trim();
      oPayload.FullName = oPayload.FirstName + " " + oPayload.LastName;
      oPayload.Salary = parseFloat(oPayload.Salary) || 0;
      oPayload.StatusCriticality = oPayload.EmploymentStatus === "Active" ? 3 : (oPayload.EmploymentStatus === "On Leave" ? 2 : 1);

      // Execute POST request against SAP Gateway OData V2 service
      fetch("/sap/opu/odata/sap/ZEMPLOYEE_SRV/EmployeeSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oPayload)
      })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (errBody) {
            var msg = errBody && errBody.error && errBody.error.message && errBody.error.message.value
              ? errBody.error.message.value
              : "Server validation rejected creation.";
            throw new Error(msg);
          });
        }
        return res.json();
      })
      .then(function (data) {
        var createdEmp = (data && data.d) ? data.d : data;
        // Update local dataset and refresh
        var aList = this.getOwnerComponent().getModel("employeeModel").getData() || [];
        aList.unshift(createdEmp);
        this.getOwnerComponent().getModel("employeeModel").setData(aList);
        this.getOwnerComponent().getModel("appView").setProperty("/totalCount", aList.length);

        this._oCreateDialog.close();
        MessageToast.show(oResourceBundle.getText("msgCreateSuccess", [createdEmp.EmployeeID]));
      }.bind(this))
      .catch(function (err) {
        MessageBox.error("Backend Error: " + err.message);
      });
    },

    onCreateDialogCancel: function () {
      this._oCreateDialog.close();
    },

    /* =========================================================== */
    /* Delete Selected Employees                                   */
    /* =========================================================== */

    onDeleteSelectedEmployees: function () {
      var aSelected = this._oTable.getSelectedItems();
      if (aSelected.length === 0) {
        return;
      }

      var aEmpIDs = aSelected.map(function (item) {
        return item.getBindingContext("employeeModel").getProperty("EmployeeID");
      });

      var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      var sConfirmText = aEmpIDs.length === 1
        ? oResourceBundle.getText("msgConfirmDelete", [aEmpIDs[0], aSelected[0].getBindingContext("employeeModel").getProperty("FullName")])
        : "Are you sure you want to delete " + aEmpIDs.length + " selected employee records? This action cannot be undone.";

      MessageBox.confirm(sConfirmText, {
        title: oResourceBundle.getText("msgConfirmDeleteTitle"),
        icon: MessageBox.Icon.WARNING,
        actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
        emphasizedAction: MessageBox.Action.DELETE,
        onClose: function (sAction) {
          if (sAction === MessageBox.Action.DELETE) {
            this._executeDeletion(aEmpIDs);
          }
        }.bind(this)
      });
    },

    _executeDeletion: function (aEmpIDs) {
      Promise.all(aEmpIDs.map(function (sId) {
        return fetch("/sap/opu/odata/sap/ZEMPLOYEE_SRV/EmployeeSet('" + encodeURIComponent(sId) + "')", {
          method: "DELETE"
        });
      }))
      .then(function () {
        var aList = this.getOwnerComponent().getModel("employeeModel").getData() || [];
        var aRemaining = aList.filter(function (emp) {
          return aEmpIDs.indexOf(emp.EmployeeID) === -1;
        });
        this.getOwnerComponent().getModel("employeeModel").setData(aRemaining);
        this._oTable.removeSelections(true);
        this.getOwnerComponent().getModel("appView").setProperty("/totalCount", aRemaining.length);
        this.getOwnerComponent().getModel("appView").setProperty("/selectedCount", 0);
        this.getOwnerComponent().getModel("appView").setProperty("/hasSelection", false);

        var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        MessageToast.show(oResourceBundle.getText("msgDeleteSuccess", [aEmpIDs.join(", ")]));
      }.bind(this))
      .catch(function (err) {
        MessageBox.error("Backend Delete Error: " + err.message);
      });
    },

    /* =========================================================== */
    /* Value Help Handlers                                         */
    /* =========================================================== */

    onOpenDeptValueHelpForFilter: function () {
      this._sTargetFieldForDept = "filter";
      this._openDeptDialog();
    },

    onOpenDeptValueHelpForCreate: function () {
      this._sTargetFieldForDept = "create";
      this._openDeptDialog();
    },

    _openDeptDialog: function () {
      if (!this._oDeptDialog) {
        Fragment.load({
          id: this.getView().getId(),
          name: "corp.ems.employee.fragment.DepartmentValueHelpDialog",
          controller: this
        }).then(function (oDialog) {
          this._oDeptDialog = oDialog;
          this.getView().addDependent(this._oDeptDialog);
          this._oDeptDialog.open();
        }.bind(this));
      } else {
        this._oDeptDialog.open();
      }
    },

    onDepartmentConfirm: function (oEvent) {
      var oSelectedItem = oEvent.getParameter("selectedItem");
      if (oSelectedItem) {
        var sDeptName = oSelectedItem.getTitle();
        if (this._sTargetFieldForDept === "filter") {
          this.byId("filterDept").setValue(sDeptName);
        } else if (this._sTargetFieldForDept === "create") {
          this.getView().getModel("newEmployee").setProperty("/Department", sDeptName);
        }
      }
    },

    onDepartmentSearch: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilter = new Filter("DepartmentName", FilterOperator.Contains, sValue);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter([oFilter]);
    },

    onOpenMgrValueHelpForCreate: function () {
      if (!this._oMgrDialog) {
        Fragment.load({
          id: this.getView().getId(),
          name: "corp.ems.employee.fragment.ManagerValueHelpDialog",
          controller: this
        }).then(function (oDialog) {
          this._oMgrDialog = oDialog;
          this.getView().addDependent(this._oMgrDialog);
          this._oMgrDialog.open();
        }.bind(this));
      } else {
        this._oMgrDialog.open();
      }
    },

    onManagerConfirm: function (oEvent) {
      var oSelectedItem = oEvent.getParameter("selectedItem");
      if (oSelectedItem) {
        var sMgrName = oSelectedItem.getTitle();
        this.getView().getModel("newEmployee").setProperty("/Manager", sMgrName);
      }
    },

    onManagerSearch: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilter = new Filter("ManagerName", FilterOperator.Contains, sValue);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter([oFilter]);
    },

    /* =========================================================== */
    /* Spreadsheet Export                                          */
    /* =========================================================== */

    onExportSpreadsheet: function () {
      var aCols = [
        { label: "Employee ID", property: "EmployeeID", type: "string" },
        { label: "Full Name", property: "FullName", type: "string" },
        { label: "Department", property: "Department", type: "string" },
        { label: "Job Title", property: "JobTitle", type: "string" },
        { label: "Email", property: "Email", type: "string" },
        { label: "Phone Number", property: "PhoneNumber", type: "string" },
        { label: "Joining Date", property: "JoiningDate", type: "string" },
        { label: "Employment Type", property: "EmploymentType", type: "string" },
        { label: "Employment Status", property: "EmploymentStatus", type: "string" },
        { label: "Office Location", property: "OfficeLocation", type: "string" },
        { label: "Salary", property: "Salary", type: "number", scale: 2 },
        { label: "Currency", property: "Currency", type: "string" }
      ];

      var oModel = this.getOwnerComponent().getModel("employeeModel");
      var aData = oModel.getData() || [];

      var oSettings = {
        workbook: {
          columns: aCols,
          context: {
            application: "SAP Fiori Elements - Employee Management",
            version: "1.0.0",
            title: "Employee Directory Export",
            sheetName: "Employees"
          }
        },
        dataSource: aData,
        fileName: "Employees_" + new Date().toISOString().slice(0, 10) + ".xlsx"
      };

      var oSheet = new Spreadsheet(oSettings);
      oSheet.build().then(function () {
        MessageToast.show("Spreadsheet downloaded successfully.");
      }).finally(function () {
        oSheet.destroy();
      });
    }

  });
});
