sap.ui.define([
  "sap/ui/core/ComponentContainer",
  "sap/m/Shell"
], function (ComponentContainer, Shell) {
  "use strict";

  new Shell({
    app: new ComponentContainer({
      name: "corp.ems.employee",
      settings: {
        id: "employeeAppRoot"
      },
      async: true,
      height: "100%"
    }),
    appWidthLimited: false
  }).placeAt("content");

  // Fade out splash screen once UI5 shell is mounted
  setTimeout(function () {
    var oSplash = document.getElementById("splashScreen");
    if (oSplash) {
      oSplash.style.opacity = "0";
      setTimeout(function () {
        if (oSplash.parentNode) {
          oSplash.parentNode.removeChild(oSplash);
        }
      }, 300);
    }
  }, 400);
});
