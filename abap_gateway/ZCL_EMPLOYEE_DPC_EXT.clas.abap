CLASS zcl_employee_dpc_ext DEFINITION
  PUBLIC
  INHERITING FROM /iwbep/cl_mgw_abs_data
  CREATE PUBLIC .

  PUBLIC SECTION.
    TYPES:
      BEGIN OF ty_employee,
        employee_id       TYPE c LENGTH 10,
        first_name        TYPE c LENGTH 40,
        last_name         TYPE c LENGTH 40,
        full_name         TYPE c LENGTH 80,
        email             TYPE c LENGTH 100,
        phone_number      TYPE c LENGTH 30,
        date_of_birth     TYPE d,
        department        TYPE c LENGTH 50,
        job_title         TYPE c LENGTH 60,
        manager           TYPE c LENGTH 80,
        joining_date      TYPE d,
        employment_type   TYPE c LENGTH 20,
        employment_status TYPE c LENGTH 20,
        office_location   TYPE c LENGTH 50,
        salary            TYPE p LENGTH 7 DECIMALS 2,
        currency          TYPE c LENGTH 3,
        status_criticality TYPE i,
      END OF ty_employee,
      tt_employee TYPE STANDARD TABLE OF ty_employee WITH DEFAULT KEY,

      BEGIN OF ty_department,
        department_id   TYPE c LENGTH 10,
        department_name TYPE c LENGTH 50,
        head            TYPE c LENGTH 80,
        cost_center     TYPE c LENGTH 20,
      END OF ty_department,
      tt_department TYPE STANDARD TABLE OF ty_department WITH DEFAULT KEY,

      BEGIN OF ty_manager,
        manager_id   TYPE c LENGTH 10,
        manager_name TYPE c LENGTH 80,
        department   TYPE c LENGTH 50,
        job_title    TYPE c LENGTH 60,
      END OF ty_manager,
      tt_manager TYPE STANDARD TABLE OF ty_manager WITH DEFAULT KEY.

    METHODS /iwbep/if_mgw_appl_srv_runtime~get_entityset REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~get_entity REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~create_entity REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~update_entity REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~delete_entity REDEFINITION.

  PROTECTED SECTION.
    METHODS employeeset_get_entityset
      IMPORTING
        !iv_entity_name           TYPE string
        !iv_entity_set_name       TYPE string
        !iv_source_name           TYPE string
        !it_filter_select_options TYPE /iwbep/t_mgw_select_option
        !it_order                 TYPE /iwbep/t_mgw_tech_pairs
        !is_paging                TYPE /iwbep/s_mgw_paging
        !it_key_tab               TYPE /iwbep/t_mgw_name_value_pair
        !it_navigation_path       TYPE /iwbep/t_mgw_navigation_path
        !io_tech_request_context  TYPE REF TO /iwbep/if_mgw_req_entityset
      EXPORTING
        !et_entityset             TYPE tt_employee
        !es_response_context      TYPE /iwbep/if_mgw_appl_srv_runtime=>ty_s_mgw_response_context
      RAISING
        /iwbep/cx_mgw_busi_exception
        /iwbep/cx_mgw_tech_exception.

    METHODS employeeset_get_entity
      IMPORTING
        !iv_entity_name          TYPE string
        !iv_entity_set_name      TYPE string
        !iv_source_name          TYPE string
        !it_key_tab              TYPE /iwbep/t_mgw_name_value_pair
        !io_tech_request_context TYPE REF TO /iwbep/if_mgw_req_entity
      EXPORTING
        !er_entity               TYPE ty_employee
        !es_response_context     TYPE /iwbep/if_mgw_appl_srv_runtime=>ty_s_mgw_response_entity_cntxt
      RAISING
        /iwbep/cx_mgw_busi_exception
        /iwbep/cx_mgw_tech_exception.

    METHODS employeeset_create_entity
      IMPORTING
        !iv_entity_name          TYPE string
        !iv_entity_set_name      TYPE string
        !iv_source_name          TYPE string
        !it_key_tab              TYPE /iwbep/t_mgw_name_value_pair
        !io_data_provider        TYPE REF TO /iwbep/if_mgw_entry_provider
        !io_tech_request_context TYPE REF TO /iwbep/if_mgw_req_entity_c
      EXPORTING
        !er_entity               TYPE ty_employee
      RAISING
        /iwbep/cx_mgw_busi_exception
        /iwbep/cx_mgw_tech_exception.

    METHODS employeeset_update_entity
      IMPORTING
        !iv_entity_name          TYPE string
        !iv_entity_set_name      TYPE string
        !iv_source_name          TYPE string
        !it_key_tab              TYPE /iwbep/t_mgw_name_value_pair
        !io_data_provider        TYPE REF TO /iwbep/if_mgw_entry_provider
        !io_tech_request_context TYPE REF TO /iwbep/if_mgw_req_entity_u
      EXPORTING
        !er_entity               TYPE ty_employee
      RAISING
        /iwbep/cx_mgw_busi_exception
        /iwbep/cx_mgw_tech_exception.

    METHODS employeeset_delete_entity
      IMPORTING
        !iv_entity_name          TYPE string
        !iv_entity_set_name      TYPE string
        !iv_source_name          TYPE string
        !it_key_tab              TYPE /iwbep/t_mgw_name_value_pair
        !io_tech_request_context TYPE REF TO /iwbep/if_mgw_req_entity_d
      RAISING
        /iwbep/cx_mgw_busi_exception
        /iwbep/cx_mgw_tech_exception.

    METHODS departmentset_get_entityset
      EXPORTING
        !et_entityset TYPE tt_department.

    METHODS managerset_get_entityset
      EXPORTING
        !et_entityset TYPE tt_manager.

  PRIVATE SECTION.
ENDCLASS.

CLASS zcl_employee_dpc_ext IMPLEMENTATION.

  METHOD /iwbep/if_mgw_appl_srv_runtime~get_entityset.
    CASE io_tech_request_context->get_entity_set_name( ).
      WHEN 'EmployeeSet'.
        me->employeeset_get_entityset(
          EXPORTING
            iv_entity_name           = iv_entity_name
            iv_entity_set_name       = iv_entity_set_name
            iv_source_name           = iv_source_name
            it_filter_select_options = it_filter_select_options
            it_order                 = it_order
            is_paging                = is_paging
            it_key_tab               = it_key_tab
            it_navigation_path       = it_navigation_path
            io_tech_request_context  = io_tech_request_context
          IMPORTING
            et_entityset             = DATA(lt_employees)
            es_response_context      = es_response_context
        ).
        copy_data_to_ref( EXPORTING is_data = lt_employees CHANGING cr_data = er_entityset ).

      WHEN 'DepartmentSet'.
        me->departmentset_get_entityset( IMPORTING et_entityset = DATA(lt_depts) ).
        copy_data_to_ref( EXPORTING is_data = lt_depts CHANGING cr_data = er_entityset ).

      WHEN 'ManagerSet'.
        me->managerset_get_entityset( IMPORTING et_entityset = DATA(lt_mgrs) ).
        copy_data_to_ref( EXPORTING is_data = lt_mgrs CHANGING cr_data = er_entityset ).

      WHEN OTHERS.
        SUPER->/iwbep/if_mgw_appl_srv_runtime~get_entityset(
          EXPORTING
            iv_entity_name           = iv_entity_name
            iv_entity_set_name       = iv_entity_set_name
            iv_source_name           = iv_source_name
            it_filter_select_options = it_filter_select_options
            it_order                 = it_order
            is_paging                = is_paging
            it_navigation_path       = it_navigation_path
            it_key_tab               = it_key_tab
            io_tech_request_context  = io_tech_request_context
          IMPORTING
            er_entityset             = er_entityset
            es_response_context      = es_response_context
        ).
    ENDCASE.
  ENDMETHOD.

  METHOD /iwbep/if_mgw_appl_srv_runtime~get_entity.
    CASE io_tech_request_context->get_entity_set_name( ).
      WHEN 'EmployeeSet'.
        me->employeeset_get_entity(
          EXPORTING
            iv_entity_name          = iv_entity_name
            iv_entity_set_name      = iv_entity_set_name
            iv_source_name          = iv_source_name
            it_key_tab              = it_key_tab
            io_tech_request_context = io_tech_request_context
          IMPORTING
            er_entity               = DATA(ls_employee)
            es_response_context     = es_response_context
        ).
        copy_data_to_ref( EXPORTING is_data = ls_employee CHANGING cr_data = er_entity ).

      WHEN OTHERS.
        SUPER->/iwbep/if_mgw_appl_srv_runtime~get_entity(
          EXPORTING
            iv_entity_name          = iv_entity_name
            iv_entity_set_name      = iv_entity_set_name
            iv_source_name          = iv_source_name
            it_key_tab              = it_key_tab
            io_tech_request_context = io_tech_request_context
          IMPORTING
            er_entity               = er_entity
            es_response_context     = es_response_context
        ).
    ENDCASE.
  ENDMETHOD.

  METHOD /iwbep/if_mgw_appl_srv_runtime~create_entity.
    CASE io_tech_request_context->get_entity_set_name( ).
      WHEN 'EmployeeSet'.
        me->employeeset_create_entity(
          EXPORTING
            iv_entity_name          = iv_entity_name
            iv_entity_set_name      = iv_entity_set_name
            iv_source_name          = iv_source_name
            it_key_tab              = it_key_tab
            io_data_provider        = io_data_provider
            io_tech_request_context = io_tech_request_context
          IMPORTING
            er_entity               = DATA(ls_created)
        ).
        copy_data_to_ref( EXPORTING is_data = ls_created CHANGING cr_data = er_entity ).

      WHEN OTHERS.
        SUPER->/iwbep/if_mgw_appl_srv_runtime~create_entity(
          EXPORTING
            iv_entity_name          = iv_entity_name
            iv_entity_set_name      = iv_entity_set_name
            iv_source_name          = iv_source_name
            it_key_tab              = it_key_tab
            io_data_provider        = io_data_provider
            io_tech_request_context = io_tech_request_context
          IMPORTING
            er_entity               = er_entity
        ).
    ENDCASE.
  ENDMETHOD.

  METHOD /iwbep/if_mgw_appl_srv_runtime~update_entity.
    CASE io_tech_request_context->get_entity_set_name( ).
      WHEN 'EmployeeSet'.
        me->employeeset_update_entity(
          EXPORTING
            iv_entity_name          = iv_entity_name
            iv_entity_set_name      = iv_entity_set_name
            iv_source_name          = iv_source_name
            it_key_tab              = it_key_tab
            io_data_provider        = io_data_provider
            io_tech_request_context = io_tech_request_context
          IMPORTING
            er_entity               = DATA(ls_updated)
        ).
        copy_data_to_ref( EXPORTING is_data = ls_updated CHANGING cr_data = er_entity ).

      WHEN OTHERS.
        SUPER->/iwbep/if_mgw_appl_srv_runtime~update_entity(
          EXPORTING
            iv_entity_name          = iv_entity_name
            iv_entity_set_name      = iv_entity_set_name
            iv_source_name          = iv_source_name
            it_key_tab              = it_key_tab
            io_data_provider        = io_data_provider
            io_tech_request_context = io_tech_request_context
          IMPORTING
            er_entity               = er_entity
        ).
    ENDCASE.
  ENDMETHOD.

  METHOD /iwbep/if_mgw_appl_srv_runtime~delete_entity.
    CASE io_tech_request_context->get_entity_set_name( ).
      WHEN 'EmployeeSet'.
        me->employeeset_delete_entity(
          EXPORTING
            iv_entity_name          = iv_entity_name
            iv_entity_set_name      = iv_entity_set_name
            iv_source_name          = iv_source_name
            it_key_tab              = it_key_tab
            io_tech_request_context = io_tech_request_context
        ).

      WHEN OTHERS.
        SUPER->/iwbep/if_mgw_appl_srv_runtime~delete_entity(
          EXPORTING
            iv_entity_name          = iv_entity_name
            iv_entity_set_name      = iv_entity_set_name
            iv_source_name          = iv_source_name
            it_key_tab              = it_key_tab
            io_tech_request_context = io_tech_request_context
        ).
    ENDCASE.
  ENDMETHOD.

  " -----------------------------------------------------------------------
  " 1. READ ALL EMPLOYEES (Classic Open SQL with SELECT)
  " -----------------------------------------------------------------------
  METHOD employeeset_get_entityset.
    DATA: lt_db_emp TYPE STANDARD TABLE OF zemployee,
          ls_entity TYPE ty_employee.

    " Traditional Open SQL query against DDIC table ZEMPLOYEE
    SELECT * FROM zemployee
      INTO TABLE lt_db_emp
      ORDER BY employee_id ASCENDING.

    LOOP AT lt_db_emp INTO DATA(ls_db).
      CLEAR ls_entity.
      ls_entity-employee_id       = ls_db-employee_id.
      ls_entity-first_name        = ls_db-first_name.
      ls_entity-last_name         = ls_db-last_name.
      ls_entity-full_name         = ls_db-full_name.
      ls_entity-email             = ls_db-email.
      ls_entity-phone_number      = ls_db-phone_number.
      ls_entity-date_of_birth     = ls_db-date_of_birth.
      ls_entity-department        = ls_db-department.
      ls_entity-job_title         = ls_db-job_title.
      ls_entity-manager           = ls_db-manager_name.
      ls_entity-joining_date      = ls_db-joining_date.
      ls_entity-employment_type   = ls_db-employment_type.
      ls_entity-employment_status = ls_db-employment_status.
      ls_entity-office_location   = ls_db-office_location.
      ls_entity-salary            = ls_db-salary.
      ls_entity-currency          = ls_db-currency.

      " Calculate Status Criticality for UI display
      CASE ls_db-employment_status.
        WHEN 'Active'.    ls_entity-status_criticality = 3. " Green
        WHEN 'On Leave'.  ls_entity-status_criticality = 2. " Yellow
        WHEN 'Terminated'. ls_entity-status_criticality = 1. " Red
        WHEN OTHERS.      ls_entity-status_criticality = 0.
      ENDCASE.

      APPEND ls_entity TO et_entityset.
    ENDLOOP.

    " Paging & Count calculation
    IF io_tech_request_context->has_count( ) = abap_true.
      es_response_context-count = lines( et_entityset ).
    ENDIF.
  ENDMETHOD.

  " -----------------------------------------------------------------------
  " 2. READ SINGLE EMPLOYEE (SELECT SINGLE by Key)
  " -----------------------------------------------------------------------
  METHOD employeeset_get_entity.
    DATA: ls_db_emp TYPE zemployee,
          lv_emp_id TYPE char10.

    READ TABLE it_key_tab INTO DATA(ls_key) WITH KEY name = 'EmployeeID'.
    IF sy-subrc = 0.
      lv_emp_id = ls_key-value.
    ELSE.
      READ TABLE it_key_tab INTO ls_key INDEX 1.
      IF sy-subrc = 0.
        lv_emp_id = ls_key-value.
      ENDIF.
    ENDIF.

    SELECT SINGLE * FROM zemployee
      INTO ls_db_emp
      WHERE employee_id = lv_emp_id.

    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Employee record '{ lv_emp_id }' not found in database.|.
    ENDIF.

    er_entity-employee_id       = ls_db_emp-employee_id.
    er_entity-first_name        = ls_db_emp-first_name.
    er_entity-last_name         = ls_db_emp-last_name.
    er_entity-full_name         = ls_db_emp-full_name.
    er_entity-email             = ls_db_emp-email.
    er_entity-phone_number      = ls_db_emp-phone_number.
    er_entity-date_of_birth     = ls_db_emp-date_of_birth.
    er_entity-department        = ls_db_emp-department.
    er_entity-job_title         = ls_db_emp-job_title.
    er_entity-manager           = ls_db_emp-manager_name.
    er_entity-joining_date      = ls_db_emp-joining_date.
    er_entity-employment_type   = ls_db_emp-employment_type.
    er_entity-employment_status = ls_db_emp-employment_status.
    er_entity-office_location   = ls_db_emp-office_location.
    er_entity-salary            = ls_db_emp-salary.
    er_entity-currency          = ls_db_emp-currency.

    CASE ls_db_emp-employment_status.
      WHEN 'Active'.    er_entity-status_criticality = 3.
      WHEN 'On Leave'.  er_entity-status_criticality = 2.
      WHEN 'Terminated'. er_entity-status_criticality = 1.
      WHEN OTHERS.      er_entity-status_criticality = 0.
    ENDCASE.
  ENDMETHOD.

  " -----------------------------------------------------------------------
  " 3. CREATE EMPLOYEE (INSERT into ZEMPLOYEE with Validation)
  " -----------------------------------------------------------------------
  METHOD employeeset_create_entity.
    DATA: ls_payload TYPE ty_employee,
          ls_db_emp  TYPE zemployee,
          lv_exists  TYPE abap_bool.

    " Parse inbound OData request payload
    io_data_provider->read_entry_data( IMPORTING es_data = ls_payload ).

    " Mandatory field validation (Classic business logic)
    IF ls_payload-employee_id IS INITIAL OR
       ls_payload-first_name  IS INITIAL OR
       ls_payload-last_name   IS INITIAL OR
       ls_payload-email       IS INITIAL.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Mandatory fields missing: Employee ID, Name, and Email are required.'.
    ENDIF.

    " Check duplicate primary key
    SELECT SINGLE @abap_true FROM zemployee
      INTO @lv_exists
      WHERE employee_id = @ls_payload-employee_id.

    IF lv_exists = abap_true.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Employee ID '{ ls_payload-employee_id }' already exists in table ZEMPLOYEE.|.
    ENDIF.

    " Prepare DDIC table record
    ls_db_emp-mandt             = sy-mandt.
    ls_db_emp-employee_id       = ls_payload-employee_id.
    ls_db_emp-first_name        = ls_payload-first_name.
    ls_db_emp-last_name         = ls_payload-last_name.
    ls_db_emp-full_name         = |{ ls_payload-first_name } { ls_payload-last_name }|.
    ls_db_emp-email             = ls_payload-email.
    ls_db_emp-phone_number      = ls_payload-phone_number.
    ls_db_emp-date_of_birth     = ls_payload-date_of_birth.
    ls_db_emp-department        = ls_payload-department.
    ls_db_emp-job_title         = ls_payload-job_title.
    ls_db_emp-manager_name      = ls_payload-manager.
    ls_db_emp-joining_date      = ls_payload-joining_date.
    ls_db_emp-employment_type   = ls_payload-employment_type.
    ls_db_emp-employment_status = ls_payload-employment_status.
    ls_db_emp-office_location   = ls_payload-office_location.
    ls_db_emp-salary            = ls_payload-salary.
    ls_db_emp-currency          = ls_payload-currency.
    ls_db_emp-created_by        = sy-uname.
    GET TIME STAMP FIELD ls_db_emp-created_at.

    " Classical INSERT
    INSERT zemployee FROM ls_db_emp.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Failed to persist employee record into database table ZEMPLOYEE.'.
    ENDIF.

    er_entity = ls_payload.
    er_entity-full_name = ls_db_emp-full_name.
    er_entity-status_criticality = 3.
  ENDMETHOD.

  " -----------------------------------------------------------------------
  " 4. UPDATE EMPLOYEE (UPDATE ZEMPLOYEE)
  " -----------------------------------------------------------------------
  METHOD employeeset_update_entity.
    DATA: ls_payload TYPE ty_employee,
          ls_db_emp  TYPE zemployee,
          lv_emp_id  TYPE char10.

    READ TABLE it_key_tab INTO DATA(ls_key) WITH KEY name = 'EmployeeID'.
    IF sy-subrc = 0.
      lv_emp_id = ls_key-value.
    ELSE.
      READ TABLE it_key_tab INTO ls_key INDEX 1.
      IF sy-subrc = 0.
        lv_emp_id = ls_key-value.
      ENDIF.
    ENDIF.

    io_data_provider->read_entry_data( IMPORTING es_data = ls_payload ).

    SELECT SINGLE * FROM zemployee
      INTO ls_db_emp
      WHERE employee_id = lv_emp_id.

    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Employee record '{ lv_emp_id }' not found.|.
    ENDIF.

    ls_db_emp-first_name        = ls_payload-first_name.
    ls_db_emp-last_name         = ls_payload-last_name.
    ls_db_emp-full_name         = |{ ls_payload-first_name } { ls_payload-last_name }|.
    ls_db_emp-email             = ls_payload-email.
    ls_db_emp-phone_number      = ls_payload-phone_number.
    ls_db_emp-date_of_birth     = ls_payload-date_of_birth.
    ls_db_emp-department        = ls_payload-department.
    ls_db_emp-job_title         = ls_payload-job_title.
    ls_db_emp-manager_name      = ls_payload-manager.
    ls_db_emp-joining_date      = ls_payload-joining_date.
    ls_db_emp-employment_type   = ls_payload-employment_type.
    ls_db_emp-employment_status = ls_payload-employment_status.
    ls_db_emp-office_location   = ls_payload-office_location.
    ls_db_emp-salary            = ls_payload-salary.
    ls_db_emp-currency          = ls_payload-currency.
    ls_db_emp-changed_by        = sy-uname.
    GET TIME STAMP FIELD ls_db_emp-changed_at.

    UPDATE zemployee FROM ls_db_emp.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Database update failed for table ZEMPLOYEE.'.
    ENDIF.

    er_entity = ls_payload.
    er_entity-full_name = ls_db_emp-full_name.
  ENDMETHOD.

  " -----------------------------------------------------------------------
  " 5. DELETE EMPLOYEE (DELETE FROM ZEMPLOYEE)
  " -----------------------------------------------------------------------
  METHOD employeeset_delete_entity.
    DATA: lv_emp_id TYPE char10.

    READ TABLE it_key_tab INTO DATA(ls_key) WITH KEY name = 'EmployeeID'.
    IF sy-subrc = 0.
      lv_emp_id = ls_key-value.
    ELSE.
      READ TABLE it_key_tab INTO ls_key INDEX 1.
      IF sy-subrc = 0.
        lv_emp_id = ls_key-value.
      ENDIF.
    ENDIF.

    DELETE FROM zemployee WHERE employee_id = lv_emp_id.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Employee '{ lv_emp_id }' not found or could not be deleted.|.
    ENDIF.
  ENDMETHOD.

  " -----------------------------------------------------------------------
  " 6. VALUE HELPS
  " -----------------------------------------------------------------------
  METHOD departmentset_get_entityset.
    et_entityset = VALUE #(
      ( department_id = 'ENG'  department_name = 'Engineering'          head = 'Marcus Vance'      cost_center = 'CC-1001' )
      ( department_id = 'IT'   department_name = 'Information Technology' head = 'Alexander Wright' cost_center = 'CC-1002' )
      ( department_id = 'FIN'  department_name = 'Finance'              head = 'Sarah Jenkins'     cost_center = 'CC-1003' )
      ( department_id = 'HR'   department_name = 'Human Resources'       head = 'Elena Rostova'     cost_center = 'CC-1004' )
      ( department_id = 'MKT'  department_name = 'Marketing'            head = 'Carlos Mendoza'    cost_center = 'CC-1005' )
      ( department_id = 'OPS'  department_name = 'Operations'           head = 'Hiroshi Tanaka'    cost_center = 'CC-1006' )
      ( department_id = 'SAL'  department_name = 'Sales'                head = 'Rachel Adams'      cost_center = 'CC-1007' )
    ).
  ENDMETHOD.

  METHOD managerset_get_entityset.
    et_entityset = VALUE #(
      ( manager_id = 'MGR-01' manager_name = 'Alexander Wright' department = 'Information Technology' job_title = 'VP of Engineering' )
      ( manager_id = 'MGR-02' manager_name = 'Marcus Vance'     department = 'Engineering'            job_title = 'Director of Software Engineering' )
      ( manager_id = 'MGR-03' manager_name = 'Sarah Jenkins'    department = 'Finance'                job_title = 'Chief Financial Officer' )
      ( manager_id = 'MGR-04' manager_name = 'Elena Rostova'    department = 'Human Resources'         job_title = 'Head of People Operations' )
      ( manager_id = 'MGR-05' manager_name = 'Carlos Mendoza'   department = 'Marketing'              job_title = 'VP of Global Marketing' )
      ( manager_id = 'MGR-06' manager_name = 'Hiroshi Tanaka'   department = 'Operations'             job_title = 'VP of Operations' )
      ( manager_id = 'MGR-07' manager_name = 'Rachel Adams'     department = 'Sales'                  job_title = 'Director of Enterprise Sales' )
    ).
  ENDMETHOD.

ENDCLASS.
