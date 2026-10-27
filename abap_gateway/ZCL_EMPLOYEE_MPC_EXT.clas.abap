CLASS zcl_employee_mpc_ext DEFINITION
  PUBLIC
  INHERITING FROM /iwbep/cl_mgw_abs_model
  CREATE PUBLIC .

  PUBLIC SECTION.
    METHODS define REDEFINITION.

  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.

CLASS zcl_employee_mpc_ext IMPLEMENTATION.

  METHOD define.
    " Call standard SEGW model generation
    " SUPER->define( ).

    " Classical OData V2 model annotations
    DATA(lo_entity) = model->get_entity_type( iv_entity_name = 'Employee' ).
    IF lo_entity IS BOUND.
      DATA(lo_prop) = lo_entity->get_property( iv_property_name = 'Salary' ).
      IF lo_prop IS BOUND.
        lo_prop->set_as_currency( 'Currency' ).
      ENDIF.
    ENDIF.
  ENDMETHOD.

ENDCLASS.
