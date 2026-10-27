# SAP Fiori Elements - Employee Management System (EMS)

Enterprise-grade SAP Fiori application built using **SAPUI5**, **SAP Fiori Elements floorplans (List Report and Object Page)**, **OData V4**, and **SAP Horizon theme (`sap_horizon`)**.

Designed to consume an **SAP S/4HANA ABAP RESTful Application Programming Model (ABAP RAP)** service (`ZUI_EMPLOYEE_O4`), with an integrated local OData V4 preview server for immediate standalone execution and verification.

---

## 1. Application Identity & Architecture

- **Application Name**: Employee Management
- **Subtitle**: Human Resources Administration
- **UI Floorplans**:
  - **List Report Floorplan**: Collapsible DynamicPage header, 7-field filter bar, live search, adapt filters, responsive table with multi-select, semantic status indicators, action toolbar (Create, Edit, Delete, Refresh, Export to Excel), value help dialogs.
  - **Object Page Floorplan**: Header facets, dynamic metrics, anchor-bar navigation with 4 sections: Personal Information, Employment Details, Compensation, and Office Information. Full edit mode with field validations, save, cancel, and delete.
- **Protocol**: OData V4
- **Theme**: SAP Horizon (`sap_horizon`)
- **Backend Model**: ABAP RAP Managed with Draft, Determinations, and Validations.

---

## 2. Project Structure

```
EMS/
├── server.js                          # Local OData V4 server with CRUD & metadata
├── ui5.yaml                           # Official SAP Fiori Tools & UI5 tooling configuration
├── ui5-mock.yaml                      # Mock server configuration for SAP Business Application Studio
├── package.json                       # Scripts and project dependencies
├── abap_rap/                          # Complete SAP ABAP RAP backend source code
│   ├── ZI_Employee.cds               # Interface CDS View Entity
│   ├── ZC_Employee.cds               # Consumption CDS View with all @UI annotations
│   ├── ZI_Employee.bdef              # Managed Behavior Definition with validations & draft
│   ├── ZC_Employee.bdef              # Projection Behavior Definition
│   ├── zbp_i_employee.clas.abap      # ABAP Behavior Implementation Class
│   ├── ZSD_EMPLOYEE.srvd             # Service Definition
│   └── README_SAP_DEPLOYMENT.md      # Step-by-step S/4HANA & BTP deployment guide
└── webapp/
    ├── Component.js                  # SAPUI5 Component initializing models & router
    ├── manifest.json                 # SAP Fiori Elements OData V4 manifest & routing
    ├── index.html                    # SAP Fiori Launchpad container with ShellBar
    ├── init.js                       # SAPUI5 bootstrap module
    ├── annotations/
    │   └── annotation.xml            # OData V4 UI Annotations (LineItem, SelectionFields, Facets)
    ├── localService/
    │   ├── metadata.xml              # OData V4 EDMX Metadata Schema
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
    │   ├── ListReport.view.xml        # SAP Fiori Elements List Report floorplan
    │   └── ObjectPage.view.xml       # SAP Fiori Elements Object Page floorplan
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

## 4. Connecting to a Real SAP S/4HANA or SAP BTP System

1. In `webapp/manifest.json`, verify the data source URI:
   ```json
   "/sap/opu/odata4/sap/zui_employee_o4/srvd/sap/zsd_employee/0001/"
   ```
2. In `ui5.yaml`, point `backend` to your SAP system URL or BTP Destination:
   ```yaml
   backend:
     - path: /sap
       url: https://your-s4hana-host:port
       destination: S4HANA_SYSTEM
   ```
3. Follow the steps in [abap_rap/README_SAP_DEPLOYMENT.md](file:///c:/Users/sahil/OneDrive/Desktop/EMS/abap_rap/README_SAP_DEPLOYMENT.md) to activate the CDS views and service binding in ADT.
