@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Employee Management - Interface View Entity'
define root view entity ZI_Employee
  as select from zemployee as Employee
{
  key employee_id       as EmployeeID,
      first_name        as FirstName,
      last_name         as LastName,
      concat_with_space(Employee.first_name, Employee.last_name, 1) as FullName,
      email             as Email,
      phone_number      as PhoneNumber,
      date_of_birth     as DateOfBirth,
      department        as Department,
      job_title         as JobTitle,
      manager           as Manager,
      joining_date      as JoiningDate,
      employment_type   as EmploymentType,
      employment_status as EmploymentStatus,
      office_location   as OfficeLocation,
      @Semantics.amount.currencyCode: 'Currency'
      salary            as Salary,
      currency          as Currency,
      
      // Criticality calculation for Fiori Elements
      case employment_status
        when 'Active'   then 3 // Green (Positive)
        when 'On Leave' then 2 // Orange (Critical)
        when 'Inactive' then 1 // Red (Negative)
        else 0                 // Grey (Neutral)
      end               as StatusCriticality,

      // Administrative fields (ETag / Audit Trail)
      @Semantics.user.createdBy: true
      created_by        as CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at        as CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by   as LastChangedBy,
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at   as LastChangedAt,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at as LocalLastChangedAt
}
