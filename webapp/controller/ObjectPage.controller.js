sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/core/Fragment",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageBox, MessageToast, Fragment, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("corp.ems.employee.controller.ObjectPage", {

    onInit: function () {
      this._oRouter = this.getOwnerComponent().getRouter();
      this._oRouter.getRoute("EmployeeDetails").attachPatternMatched(this._onRouteMatched, this);

      var oDetailModel = new JSONModel();
      this.getView().setModel(oDetailModel, "detailModel");
    },

    _onRouteMatched: function (oEvent) {
      var sEmpID = oEvent.getParameter("arguments").EmployeeID;
      this._sCurrentEmpID = sEmpID;

      var oEmployeeModel = this.getOwnerComponent().getModel("employeeModel");
      var aList = oEmployeeModel.getData() || [];
      var oEmployee = aList.find(function (emp) {
        return emp.EmployeeID === sEmpID;
      });

      if (oEmployee) {
        this._setEmployeeData(oEmployee);
      } else {
        // Fetch single instance from SAP Gateway OData V2 service
        fetch("/sap/opu/odata/sap/ZEMPLOYEE_SRV/EmployeeSet('" + encodeURIComponent(sEmpID) + "')")
          .then(function (res) {
            if (!res.ok) {
              throw new Error("Employee not found in backend database.");
            }
            return res.json();
          })
          .then(function (data) {
            var empData = (data && data.d) ? data.d : data;
            this._setEmployeeData(empData);
          }.bind(this))
          .catch(function (err) {
            MessageBox.error(err.message, {
              onClose: function () {
                this.onNavBack();
              }.bind(this)
            });
          }.bind(this));
      }
    },

    _setEmployeeData: function (oEmployee) {
      // Create clone for editing/cancellation
      this._oOriginalData = JSON.parse(JSON.stringify(oEmployee));
      this.getView().getModel("detailModel").setData(JSON.parse(JSON.stringify(oEmployee)));
    },

    onNavBack: function () {
      this.getOwnerComponent().getModel("appView").setProperty("/isEditMode", false);
      this._oRouter.navTo("EmployeeList", {}, true);
    },

    onEditPress: function () {
      this.getOwnerComponent().getModel("appView").setProperty("/isEditMode", true);
    },

    onCancelPress: function () {
      // Revert changes from original snapshot
      this.getView().getModel("detailModel").setData(JSON.parse(JSON.stringify(this._oOriginalData)));
      this.getOwnerComponent().getModel("appView").setProperty("/isEditMode", false);
      MessageToast.show("Editing cancelled. Unsaved changes discarded.");
    },

    onSavePress: function () {
      var oCurrentData = this.getView().getModel("detailModel").getData();
      var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

      // Validate mandatory fields
      if (!oCurrentData.FirstName || !oCurrentData.LastName || !oCurrentData.Email || !oCurrentData.Department || !oCurrentData.JobTitle || !oCurrentData.JoiningDate) {
        MessageBox.error(oResourceBundle.getText("msgValidationError"));
        return;
      }

      // Check email
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(oCurrentData.Email)) {
        MessageBox.error(oResourceBundle.getText("msgInvalidEmail"));
        return;
      }

      // Compute FullName and StatusCriticality
      oCurrentData.FirstName = oCurrentData.FirstName.trim();
      oCurrentData.LastName = oCurrentData.LastName.trim();
      oCurrentData.FullName = oCurrentData.FirstName + " " + oCurrentData.LastName;
      oCurrentData.Salary = parseFloat(oCurrentData.Salary) || 0;
      oCurrentData.StatusCriticality = oCurrentData.EmploymentStatus === "Active" ? 3 : (oCurrentData.EmploymentStatus === "On Leave" ? 2 : 1);

      // Execute PUT/PATCH against SAP Gateway OData V2 service
      fetch("/sap/opu/odata/sap/ZEMPLOYEE_SRV/EmployeeSet('" + encodeURIComponent(oCurrentData.EmployeeID) + "')", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oCurrentData)
      })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status + ": Server validation failed.");
        }
        return res.json();
      })
      .then(function (data) {
        var savedData = (data && data.d) ? data.d : data;
        this._oOriginalData = JSON.parse(JSON.stringify(savedData));
        this.getView().getModel("detailModel").setData(JSON.parse(JSON.stringify(savedData)));
        this.getOwnerComponent().getModel("appView").setProperty("/isEditMode", false);

        // Synchronize with master employee model
        var oEmployeeModel = this.getOwnerComponent().getModel("employeeModel");
        var aList = oEmployeeModel.getData() || [];
        var iIndex = aList.findIndex(function (emp) {
          return emp.EmployeeID === savedData.EmployeeID;
        });
        if (iIndex !== -1) {
          aList[iIndex] = savedData;
          oEmployeeModel.setData(aList);
        }

        MessageToast.show(oResourceBundle.getText("msgUpdateSuccess", [savedData.EmployeeID]));
      }.bind(this))
      .catch(function (err) {
        MessageBox.error("Backend Error: " + err.message);
      });
    },

    onDeletePress: function () {
      var oCurrentData = this.getView().getModel("detailModel").getData();
      var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

      MessageBox.confirm(
        oResourceBundle.getText("msgConfirmDelete", [oCurrentData.EmployeeID, oCurrentData.FullName]),
        {
          title: oResourceBundle.getText("msgConfirmDeleteTitle"),
          icon: MessageBox.Icon.WARNING,
          actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.DELETE,
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.DELETE) {
              fetch("/sap/opu/odata/sap/ZEMPLOYEE_SRV/EmployeeSet('" + encodeURIComponent(oCurrentData.EmployeeID) + "')", {
                method: "DELETE"
              })
              .then(function () {
                var oEmployeeModel = this.getOwnerComponent().getModel("employeeModel");
                var aList = oEmployeeModel.getData() || [];
                var aFiltered = aList.filter(function (emp) {
                  return emp.EmployeeID !== oCurrentData.EmployeeID;
                });
                oEmployeeModel.setData(aFiltered);
                this.getOwnerComponent().getModel("appView").setProperty("/totalCount", aFiltered.length);

                MessageToast.show(oResourceBundle.getText("msgDeleteSuccess", [oCurrentData.EmployeeID]));
                this.onNavBack();
              }.bind(this))
              .catch(function (err) {
                MessageBox.error("Backend Delete Error: " + err.message);
              }.bind(this));
            }
          }.bind(this)
        }
      );
    },

    /* =========================================================== */
    /* Value Help for Object Page in Edit Mode                     */
    /* =========================================================== */

    onOpenDeptValueHelpForDetail: function () {
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
        this.getView().getModel("detailModel").setProperty("/Department", oSelectedItem.getTitle());
      }
    },

    onDepartmentSearch: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilter = new Filter("DepartmentName", FilterOperator.Contains, sValue);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter([oFilter]);
    },

    onOpenMgrValueHelpForDetail: function () {
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
        this.getView().getModel("detailModel").setProperty("/Manager", oSelectedItem.getTitle());
      }
    },

    onManagerSearch: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilter = new Filter("ManagerName", FilterOperator.Contains, sValue);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter([oFilter]);
    }

  });
});
