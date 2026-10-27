*----------------------------------------------------------------------*
* DDIC Transparent Database Table: ZEMPLOYEE
* Description: Employee Master Data (Classical SAP NetWeaver Table)
* Delivery Class: A (Application Table)
* Data Class: APPL0 (Master Data)
* Size Category: 2 (Up to 10,000 records)
*----------------------------------------------------------------------*
@EndUserText.label : 'Employee Master Data Table'
@AbapCatalog.enhancementCategory : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #ALLOWED
define table zemployee {
  key mandt         : mandt not null;
  key employee_id   : char10 not null;
  first_name        : char40 not null;
  last_name         : char40 not null;
  full_name         : char80;
  email             : char100 not null;
  phone_number      : char30;
  date_of_birth     : dats;
  department        : char50 not null;
  job_title         : char60 not null;
  manager_id        : char10;
  manager_name      : char80;
  joining_date      : dats not null;
  employment_type   : char20 not null;
  employment_status : char20 not null;
  office_location   : char50;
  @Semantics.amount.currencyCode : 'zemployee.currency'
  salary            : curr13_2;
  currency          : waers;
  created_by        : syuname;
  created_at        : timestampl;
  changed_by        : syuname;
  changed_at        : timestampl;
}
