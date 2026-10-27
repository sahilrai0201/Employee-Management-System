# Classical SAP NetWeaver Gateway (SEGW) Deployment Guide

This guide describes how to deploy the traditional SAP NetWeaver Gateway OData V2 service (`ZEMPLOYEE_SRV`) for the Employee Management System using standard SAP GUI transactions.

---

## 1. Prerequisites & Required Transactions

| Transaction Code | Description |
| ---------------- | ----------- |
| `SE11`           | ABAP Data Dictionary (Create table `ZEMPLOYEE`) |
| `SEGW`           | SAP Gateway Service Builder (Define Model & Runtime Objects) |
| `SE24`           | Class Builder (Implement `ZCL_EMPLOYEE_DPC_EXT`) |
| `/IWFND/MAINT_SERVICE` | Activate and Maintain SAP Gateway Services |
| `/IWFND/GW_CLIENT`     | SAP Gateway Client (OData V2 Test Tool) |

---

## 2. Step 1: Create Transparent Table `ZEMPLOYEE` (SE11)

1. Open transaction `SE11`, enter Table Name: `ZEMPLOYEE`, and click **Create**.
2. **Short Description**: `Employee Master Data Table`.
3. Under **Delivery and Maintenance**:
   - Delivery Class: `A` (Application Table)
   - Data Browser/Table View Maint.: `Display/Maintenance Allowed`.
4. In the **Fields** tab, define:
   - `MANDT` (Type `MANDT`, Key: Checked)
   - `EMPLOYEE_ID` (Type `CHAR10`, Key: Checked)
   - `FIRST_NAME` (Type `CHAR40`)
   - `LAST_NAME` (Type `CHAR40`)
   - `FULL_NAME` (Type `CHAR80`)
   - `EMAIL` (Type `CHAR100`)
   - `PHONE_NUMBER` (Type `CHAR30`)
   - `DATE_OF_BIRTH` (Type `DATS`)
   - `DEPARTMENT` (Type `CHAR50`)
   - `JOB_TITLE` (Type `CHAR60`)
   - `MANAGER_NAME` (Type `CHAR80`)
   - `JOINING_DATE` (Type `DATS`)
   - `EMPLOYMENT_TYPE` (Type `CHAR20`)
   - `EMPLOYMENT_STATUS` (Type `CHAR20`)
   - `OFFICE_LOCATION` (Type `CHAR50`)
   - `SALARY` (Type `CURR13_2`, Reference Table: `ZEMPLOYEE`, Ref Field: `CURRENCY`)
   - `CURRENCY` (Type `WAERS`)
   - `CREATED_BY` (Type `SYUNAME`)
   - `CREATED_AT` (Type `TIMESTAMPL`)
   - `CHANGED_BY` (Type `SYUNAME`)
   - `CHANGED_AT` (Type `TIMESTAMPL`)
5. In **Technical Settings**:
   - Data Class: `APPL0`
   - Size Category: `2`
6. Save and **Activate** the table (`Ctrl + F3`).

---

## 3. Step 2: Create Gateway Service in SEGW

1. Open transaction `SEGW`.
2. Click **Create Project**:
   - **Project**: `ZEMPLOYEE_SRV`
   - **Description**: `Employee Management OData V2 Service`
   - **Package**: `$TMP` (Local Object) or your target transport package.
3. Right-click **Data Model** -> **Import** -> **DDIC Structure**:
   - Import structure / table `ZEMPLOYEE` as Entity Type `Employee`.
   - Ensure `EmployeeID` is selected as the primary key.
   - Name the Entity Set: `EmployeeSet`.
4. Create additional Entity Types for Value Helps:
   - `Department` -> Entity Set: `DepartmentSet` (Key: `DepartmentID`)
   - `Manager` -> Entity Set: `ManagerSet` (Key: `ManagerID`)
5. Click **Generate Runtime Objects** button (`Ctrl + F3`):
   - Model Provider Class: `ZCL_EMPLOYEE_MPC` / `ZCL_EMPLOYEE_MPC_EXT`
   - Data Provider Class: `ZCL_EMPLOYEE_DPC` / `ZCL_EMPLOYEE_DPC_EXT`
   - Service Name: `ZEMPLOYEE_SRV`

---

## 4. Step 3: Implement CRUD in Data Provider Class (`ZCL_EMPLOYEE_DPC_EXT`)

1. Open transaction `SE24` or double-click `ZCL_EMPLOYEE_DPC_EXT` in `SEGW`.
2. In the **Methods** tab, redefine:
   - `EMPLOYEESET_GET_ENTITYSET` (Read all records with filter/order/paging)
   - `EMPLOYEESET_GET_ENTITY` (Read single record by Key)
   - `EMPLOYEESET_CREATE_ENTITY` (Create with duplicate check and validation)
   - `EMPLOYEESET_UPDATE_ENTITY` (Update employee details)
   - `EMPLOYEESET_DELETE_ENTITY` (Delete employee record)
   - `DEPARTMENTSET_GET_ENTITYSET` (Master data for departments)
   - `MANAGERSET_GET_ENTITYSET` (Master data for managers)
3. Copy the source code from `abap_gateway/ZCL_EMPLOYEE_DPC_EXT.clas.abap`.
4. Save and **Activate** the class.

---

## 5. Step 4: Register and Test Service (/IWFND/MAINT_SERVICE)

1. Open transaction `/IWFND/MAINT_SERVICE`.
2. Click **Add Service**:
   - System Alias: `LOCAL`
   - Technical Service Name: `ZEMPLOYEE_SRV*`
   - Click **Get Services**.
3. Select `ZEMPLOYEE_SRV`, assign package `$TMP`, and click **Continue**.
4. Return to `/IWFND/MAINT_SERVICE` and find `ZEMPLOYEE_SRV`:
   - Verify that the ICF Node status is **Green** (Active).
   - Click **SAP Gateway Client** (`/IWFND/GW_CLIENT`).
5. Execute standard OData V2 tests:
   - **Service Document**:
     `GET /sap/opu/odata/sap/ZEMPLOYEE_SRV/?$format=json`
   - **Metadata**:
     `GET /sap/opu/odata/sap/ZEMPLOYEE_SRV/$metadata`
   - **Read Collection**:
     `GET /sap/opu/odata/sap/ZEMPLOYEE_SRV/EmployeeSet?$format=json`
   - **Read Single Record**:
     `GET /sap/opu/odata/sap/ZEMPLOYEE_SRV/EmployeeSet('EMP-1001')?$format=json`
