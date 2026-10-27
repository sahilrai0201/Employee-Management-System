sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/ui/Device"
], function (UIComponent, JSONModel, Device) {
  "use strict";

  return UIComponent.extend("corp.ems.employee.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      // Call parent init
      UIComponent.prototype.init.apply(this, arguments);

      // Global UI State Model
      var oAppViewModel = new JSONModel({
        isBusy: false,
        totalCount: 0,
        selectedCount: 0,
        hasSelection: false,
        isEditMode: false,
        serviceStatus: "Connected to SAP NetWeaver Gateway OData V2 (ZEMPLOYEE_SRV)",
        systemInfo: {
          client: "100",
          system: "ECC 6.0 / NetWeaver 7.50",
          user: "HR_ADMIN",
          role: "HR Administrator"
        }
      });
      this.setModel(oAppViewModel, "appView");

      // Device model
      var oDeviceModel = new JSONModel(Device);
      oDeviceModel.setDefaultBindingMode("OneWay");
      this.setModel(oDeviceModel, "device");

      // Master data models for Value Helps
      var oDeptModel = new JSONModel();
      oDeptModel.loadData("localService/data/Departments.json");
      this.setModel(oDeptModel, "departments");

      var oMgrModel = new JSONModel();
      oMgrModel.loadData("localService/data/Managers.json");
      this.setModel(oMgrModel, "managers");

      // Primary employee model (served from traditional SAP Gateway OData V2 endpoint)
      var oEmployeeModel = new JSONModel();
      oEmployeeModel.loadData("/sap/opu/odata/sap/ZEMPLOYEE_SRV/EmployeeSet");
      oEmployeeModel.attachRequestCompleted(function () {
        var oData = oEmployeeModel.getData();
        var aList = [];
        if (oData && oData.d && Array.isArray(oData.d.results)) {
          aList = oData.d.results;
        } else if (Array.isArray(oData)) {
          aList = oData;
        } else if (oData && Array.isArray(oData.value)) {
          aList = oData.value;
        }
        oEmployeeModel.setData(aList);
        oAppViewModel.setProperty("/totalCount", aList.length);
      });
      this.setModel(oEmployeeModel, "employeeModel");

      // Enable hash-based router
      this.getRouter().initialize();
    },

    getContentDensityClass: function () {
      if (!this._sContentDensityClass) {
        if (Device.support.touch) {
          this._sContentDensityClass = "sapUiSizeCozy";
        } else {
          this._sContentDensityClass = "sapUiSizeCompact";
        }
      }
      return this._sContentDensityClass;
    }
  });
});
