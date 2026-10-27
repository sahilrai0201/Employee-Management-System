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
        serviceStatus: "Connected to Local OData V4 Mock Service (RAP Simulation)",
        systemInfo: {
          client: "100",
          system: "S4HANA 2023",
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

      // Primary employee model (served from our local OData V4 service endpoint)
      var oEmployeeModel = new JSONModel();
      oEmployeeModel.loadData("/sap/opu/odata4/sap/zui_employee_o4/srvd/sap/zsd_employee/0001/Employee");
      oEmployeeModel.attachRequestCompleted(function () {
        var aData = oEmployeeModel.getData();
        var aList = Array.isArray(aData) ? aData : (aData && aData.value ? aData.value : []);
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
