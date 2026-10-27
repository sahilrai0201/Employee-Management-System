# SAP Fiori - Employee Management System (EMS)

Enterprise-grade SAP Fiori application built using **SAPUI5**, **SAP Fiori Floorplans (List Report and Object Page)**, **Traditional SAP Gateway (SEGW)** with **OData V2**, and **SAP Horizon theme (`sap_horizon`)**.

Designed to consume a traditional **SAP NetWeaver Gateway OData V2 Service (`ZEMPLOYEE_SRV`)**, backed by transparent DDIC database table `ZEMPLOYEE` and Data Provider Class `ZCL_EMPLOYEE_DPC_EXT`. Includes an integrated local OData V2 preview server for immediate standalone execution and testing.

---

## 1. Application Identity & Architecture

- **Application Name**: Employee Management System
- **Subtitle**: Human Resources Administration
- **UI Floorplans**:
  - **List Report Floorplan**: Collapsible DynamicPage header, 7-field filter bar, live search, adapt filters, responsive table with multi-select, semantic status indicators, action toolbar (Create, Edit, Delete, Refresh, Export to Excel), value help dialogs.
  - **Object Page Floorplan**: Header facets, dynamic metrics, anchor-bar navigation with 4 sections: Personal Information, Employment Details, Compensation, and Office Information. Full inline edit mode with field validations, save, cancel, and delete.
- **Protocol**: OData V2
- **Theme**: SAP Horizon (`sap_horizon`)
- **Backend Model**: Traditional SAP Gateway (SEGW) Data Provider Class (`ZCL_EMPLOYEE_DPC_EXT`) + ABAP Dictionary Transparent Table (`ZEMPLOYEE`).

---

## 2. Project Structure

```
EMS/
├── server.js                          # Local SAP Gateway OData V2 mock & CRUD server
├── ui5.yaml                           # SAP Fiori Tools & UI5 tooling configuration
├── ui5-mock.yaml                      # Mock server configuration for SAP Business Application Studio
├── package.json                       # Scripts and project dependencies
├── abap_gateway/                      # Traditional SAP NetWeaver ABAP backend source code
│   ├── ZEMPLOYEE.tabl.abap           # DDIC Transparent Database Table definition
│   ├── ZCL_EMPLOYEE_DPC_EXT.clas.abap # Data Provider Extension Class (CRUD methods in Open SQL)
│   ├── ZCL_EMPLOYEE_MPC_EXT.clas.abap # Model Provider Extension Class
│   └── README_SAP_SEGW_DEPLOYMENT.md # Step-by-step SEGW & /IWFND/MAINT_SERVICE deployment guide
└── webapp/
    ├── Component.js                  # SAPUI5 Component initializing models & router
    ├── manifest.json                 # SAP Fiori manifest with OData V2 datasource & routing
    ├── index.html                    # SAP Fiori Launchpad container with ShellBar
    ├── init.js                       # SAPUI5 bootstrap module
    ├── localService/
    │   ├── metadata.xml              # OData V2 EDMX Metadata Schema
    │   └── data/
    │       ├── Employee.json         # Enterprise employee mock database
    │       ├── Departments.json      # Value help master data
    │       └── Managers.json         # Value help master data
    ├── i18n/
    │   └── i18n.properties          # Translatable Fiori texts
    ├── controller/
    │   ├── App.controller.js         # ShellBar & user profile controller
    │   ├── ListReport.controller.js  # List Report search, filter, CRUD & export
    │   └── ObjectPage.controller.js  # Object Page view/edit/save/delete
    ├── view/
    │   ├── App.view.xml              # Root view with ShellBar & NavContainer
    │   ├── ListReport.view.xml        # SAP Fiori List Report floorplan
    │   └── ObjectPage.view.xml       # SAP Fiori Object Page floorplan
    ├── fragment/
    │   ├── CreateEmployeeDialog.fragment.xml
    │   ├── DepartmentValueHelpDialog.fragment.xml
    │   └── ManagerValueHelpDialog.fragment.xml
    └── test/
        └── flpSandbox.html           # SAP Fiori Launchpad Sandbox preview
```

---

## 3. Running the Application Locally

1. Start the application:
   ```bash
   npm start
   ```
2. Open your web browser at:
   ```
   http://localhost:8080/index.html
   ```
3. Test the features:
   - **Filter Bar**: Filter by ID, Name, Department (using Value Help dialog), Job Title, Status, Joining Date, or Type.
   - **Table Actions**:
     - Click **Create** to launch the creation dialog with mandatory field and duplicate ID validation.
     - Select an employee and click **Edit** or click on any row to open the **Object Page**.
     - Select one or more employees and click **Delete** to trigger the SAP confirmation prompt.
     - Click **Export to Excel** to download an `.xlsx` spreadsheet of employee records.
   - **Object Page**:
     - View sections: Personal Information, Employment Details, Compensation, and Office Information.
     - Click **Edit** to enter inline editing mode, modify fields, and click **Save** (or **Cancel** to revert).
   - **Shell Bar**: Click the user initials avatar (`HA`) for profile/system information, or the notifications icon.

---

## 4. Connecting to an SAP NetWeaver / ECC / S/4HANA System

1. In `webapp/manifest.json`, verify the traditional Gateway OData V2 service URI:
   ```json
   "/sap/opu/odata/sap/ZEMPLOYEE_SRV/"
   ```
2. In `ui5.yaml`, point `backend` to your SAP system URL:
   ```yaml
   backend:
     - path: /sap
       url: https://your-sap-server:port
       destination: SAP_GATEWAY_SYSTEM
   ```
3. Follow the steps in [abap_gateway/README_SAP_SEGW_DEPLOYMENT.md](file:///c:/Users/sahil/OneDrive/Desktop/EMS/abap_gateway/README_SAP_SEGW_DEPLOYMENT.md) to:
   - Create table `ZEMPLOYEE` in transaction `SE11`.
   - Build service `ZEMPLOYEE_SRV` in transaction `SEGW`.
   - Implement methods in `ZCL_EMPLOYEE_DPC_EXT` in `SE24`.
   - Register the service in transaction `/IWFND/MAINT_SERVICE`.
