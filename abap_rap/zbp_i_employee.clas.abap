CLASS zbp_i_employee DEFINITION PUBLIC ABSTRACT FINAL FOR BEHAVIOR OF zi_employee.
ENDCLASS.

CLASS zbp_i_employee IMPLEMENTATION.
ENDCLASS.

* Local Types / Handler Implementation (in local types include):
CLASS lhc_employee DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS validateEmployeeID FOR VALIDATE ON SAVE
      IMPORTING keys FOR Employee~validateEmployeeID.

    METHODS validateMandatoryFields FOR VALIDATE ON SAVE
      IMPORTING keys FOR Employee~validateMandatoryFields.

    METHODS validateEmail FOR VALIDATE ON SAVE
      IMPORTING keys FOR Employee~validateEmail.

    METHODS validateSalary FOR VALIDATE ON SAVE
      IMPORTING keys FOR Employee~validateSalary.

    METHODS setDefaultValues FOR DETERMINE ON MODIFY
      IMPORTING keys FOR Employee~setDefaultValues.

    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR Employee RESULT result.
ENDCLASS.

CLASS lhc_employee IMPLEMENTATION.

  METHOD validateEmployeeID.
    READ ENTITIES OF zi_employee IN LOCAL MODE
      ENTITY Employee
        FIELDS ( EmployeeID )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    LOOP AT lt_employees INTO DATA(ls_emp).
      " Check for duplicate Employee ID in database
      SELECT SINGLE FROM zemployee
        FIELDS employee_id
        WHERE employee_id = @ls_emp-EmployeeID
        INTO @DATA(lv_existing_id).

      IF sy-subrc = 0.
        APPEND VALUE #( %tky = ls_emp-%tky ) TO failed-employee.
        APPEND VALUE #(
          %tky        = ls_emp-%tky
          %state_area = 'VALIDATE_ID'
          %msg        = new_message_with_text(
                          severity = if_abap_behv_message=>severity-error
                          text     = |Employee with ID '{ ls_emp-EmployeeID }' already exists.|
                        )
          %element-EmployeeID = if_abap_behv=>mk-on
        ) TO reported-employee.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD validateMandatoryFields.
    READ ENTITIES OF zi_employee IN LOCAL MODE
      ENTITY Employee
        FIELDS ( FirstName LastName Department JobTitle JoiningDate )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    LOOP AT lt_employees INTO DATA(ls_emp).
      IF ls_emp-FirstName IS INITIAL.
        APPEND VALUE #( %tky = ls_emp-%tky ) TO failed-employee.
        APPEND VALUE #(
          %tky        = ls_emp-%tky
          %msg        = new_message_with_text( severity = if_abap_behv_message=>severity-error text = 'First Name is mandatory.' )
          %element-FirstName = if_abap_behv=>mk-on
        ) TO reported-employee.
      ENDIF.

      IF ls_emp-LastName IS INITIAL.
        APPEND VALUE #( %tky = ls_emp-%tky ) TO failed-employee.
        APPEND VALUE #(
          %tky        = ls_emp-%tky
          %msg        = new_message_with_text( severity = if_abap_behv_message=>severity-error text = 'Last Name is mandatory.' )
          %element-LastName = if_abap_behv=>mk-on
        ) TO reported-employee.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD validateEmail.
    READ ENTITIES OF zi_employee IN LOCAL MODE
      ENTITY Employee
        FIELDS ( Email )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    LOOP AT lt_employees INTO DATA(ls_emp).
      IF ls_emp-Email IS NOT INITIAL AND NOT ls_emp-Email CP '*@*.*'.
        APPEND VALUE #( %tky = ls_emp-%tky ) TO failed-employee.
        APPEND VALUE #(
          %tky        = ls_emp-%tky
          %msg        = new_message_with_text( severity = if_abap_behv_message=>severity-error text = 'Please enter a valid corporate email address.' )
          %element-Email = if_abap_behv=>mk-on
        ) TO reported-employee.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD validateSalary.
    READ ENTITIES OF zi_employee IN LOCAL MODE
      ENTITY Employee
        FIELDS ( Salary )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    LOOP AT lt_employees INTO DATA(ls_emp).
      IF ls_emp-Salary < 0.
        APPEND VALUE #( %tky = ls_emp-%tky ) TO failed-employee.
        APPEND VALUE #(
          %tky        = ls_emp-%tky
          %msg        = new_message_with_text( severity = if_abap_behv_message=>severity-error text = 'Salary cannot be a negative amount.' )
          %element-Salary = if_abap_behv=>mk-on
        ) TO reported-employee.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD setDefaultValues.
    READ ENTITIES OF zi_employee IN LOCAL MODE
      ENTITY Employee
        FIELDS ( EmploymentStatus Currency )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    MODIFY ENTITIES OF zi_employee IN LOCAL MODE
      ENTITY Employee
        UPDATE FIELDS ( EmploymentStatus Currency )
        WITH VALUE #( FOR emp IN lt_employees (
          %tky             = emp-%tky
          EmploymentStatus = COND #( WHEN emp-EmploymentStatus IS INITIAL THEN 'Active' ELSE emp-EmploymentStatus )
          Currency         = COND #( WHEN emp-Currency IS INITIAL THEN 'EUR' ELSE emp-Currency )
        ) ).
  ENDMETHOD.

  METHOD get_instance_authorizations.
    " Enterprise authorization checks (e.g. Activity 01 create, 02 change, 03 display)
  ENDMETHOD.

ENDCLASS.
