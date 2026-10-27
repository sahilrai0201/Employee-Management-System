sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/ResponsivePopover",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/CustomListItem",
  "sap/m/VBox",
  "sap/m/HBox",
  "sap/m/Text",
  "sap/m/Title",
  "sap/m/Label",
  "sap/m/Button",
  "sap/m/ObjectStatus",
  "sap/m/MessageToast",
  "sap/ui/core/library"
], function (Controller, ResponsivePopover, List, StandardListItem, CustomListItem, VBox, HBox, Text, Title, Label, Button, ObjectStatus, MessageToast, coreLibrary) {
  "use strict";

  var ValueState = coreLibrary.ValueState;

  return Controller.extend("corp.ems.employee.controller.App", {
    onInit: function () {
      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
    },

    onUserProfilePress: function (oEvent) {
      var oButton = oEvent.getSource();
      if (!this._oUserPopover) {
        this._oUserPopover = new ResponsivePopover({
          title: "SAP User Profile",
          placement: "Bottom",
          contentWidth: "320px",
          content: [
            new VBox({
              class: "sapUiSmallMargin",
              items: [
                new Title({ text: "Sarah Connor (HR_ADMIN)", level: "H4" }),
                new Text({ text: "Enterprise HR Global Administrator" }),
                new Text({ text: "Email: sarah.connor@enterprise.corp" }),
                new HBox({
                  class: "sapUiTinyMarginTop",
                  items: [
                    new Label({ text: "System: ", design: "Bold" }),
                    new Text({ text: "S/4HANA 2023 (Client 100)" })
                  ]
                }),
                new HBox({
                  items: [
                    new Label({ text: "OData V4 Binding: ", design: "Bold" }),
                    new Text({ text: "ZUI_EMPLOYEE_O4" })
                  ]
                }),
                new HBox({
                  items: [
                    new Label({ text: "Theme: ", design: "Bold" }),
                    new Text({ text: "SAP Horizon (sap_horizon)" })
                  ]
                })
              ]
            })
          ],
          endButton: new Button({
            text: "Sign Out",
            type: "Transparent",
            press: function () {
              MessageToast.show("Signed out of SAP Fiori Launchpad.");
              this._oUserPopover.close();
            }.bind(this)
          })
        });
        this.getView().addDependent(this._oUserPopover);
      }
      this._oUserPopover.openBy(oButton);
    },

    onNotificationsPress: function (oEvent) {
      var oButton = oEvent.getSource();
      if (!this._oNotificationPopover) {
        this._oNotificationPopover = new ResponsivePopover({
          title: "HR Notifications (3)",
          placement: "Bottom",
          contentWidth: "360px",
          content: [
            new List({
              items: [
                new StandardListItem({
                  title: "Annual HR Review Cycle Active",
                  description: "Q4 Performance appraisals require approval by Nov 15.",
                  icon: "sap-icon://survey",
                  info: "Priority",
                  infoState: ValueState.Warning
                }),
                new StandardListItem({
                  title: "Contract Renewal Approaching",
                  description: "Carlos Mendoza (EMP-1010) contractor agreement expires in 30 days.",
                  icon: "sap-icon://user-edit",
                  info: "Action Req.",
                  infoState: ValueState.Error
                }),
                new StandardListItem({
                  title: "New Employee Onboarded",
                  description: "Li Wei (EMP-1009) profile activated in Singapore office.",
                  icon: "sap-icon://add-employee",
                  info: "Info",
                  infoState: ValueState.Success
                })
              ]
            })
          ]
        });
        this.getView().addDependent(this._oNotificationPopover);
      }
      this._oNotificationPopover.openBy(oButton);
    },

    onBackendStatusPress: function (oEvent) {
      var oButton = oEvent.getSource();
      if (!this._oStatusPopover) {
        this._oStatusPopover = new ResponsivePopover({
          title: "SAP RAP Architecture Status",
          placement: "Bottom",
          contentWidth: "350px",
          content: [
            new VBox({
              class: "sapUiSmallMargin",
              items: [
                new ObjectStatus({
                  title: "Backend Service Status",
                  text: "Active & Synced",
                  state: ValueState.Success,
                  icon: "sap-icon://sys-enter-2"
                }),
                new Text({
                  class: "sapUiTinyMarginTop",
                  text: "Protocol: OData V4"
                }),
                new Text({
                  text: "Service Path: /sap/opu/odata4/sap/zui_employee_o4/srvd/sap/zsd_employee/0001/"
                }),
                new Text({
                  class: "sapUiTinyMarginTop",
                  text: "The application is currently communicating with the local OData V4 engine simulating the ABAP RAP behavior definitions (draft, validations, and determinations)."
                })
              ]
            })
          ]
        });
        this.getView().addDependent(this._oStatusPopover);
      }
      this._oStatusPopover.openBy(oButton);
    },

    onProductSwitcherPress: function () {
      MessageToast.show("SAP Fiori Launchpad App Switcher");
    }
  });
});
