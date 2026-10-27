@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Employee Management - Consumption Projection View'
@Metadata.allowExtensions: true
@Search.searchable: true

@UI: {
  headerInfo: {
    typeName: 'Employee',
    typeNamePlural: 'Employees',
    title: { type: #STANDARD, value: 'FullName' },
    description: { type: #STANDARD, value: 'JobTitle' }
  }
}
define root view entity ZC_Employee
  provider contract transactional_query
  as projection on ZI_Employee
{
  @UI.facet: [
    {
      id: 'HeaderStatus',
      purpose: #HEADER,
      type: #DATAPOINT_REFERENCE,
      targetQualifier: 'StatusDataPoint',
      position: 10
    },
    {
      id: 'HeaderDepartment',
      purpose: #HEADER,
      type: #DATAPOINT_REFERENCE,
      targetQualifier: 'DeptDataPoint',
      position: 20
    },
    {
      id: 'PersonalInformationSection',
      purpose: #STANDARD,
      type: #COLLECTION,
      label: 'Personal Information',
      position: 10
    },
    {
      id: 'PersonalInfoFieldGroup',
      purpose: #STANDARD,
      parentId: 'PersonalInformationSection',
      type: #FIELDGROUP_REFERENCE,
      targetQualifier: 'PersonalInformation',
      position: 10
    },
    {
      id: 'EmploymentDetailsSection',
      purpose: #STANDARD,
      type: #COLLECTION,
      label: 'Employment Details',
      position: 20
    },
    {
      id: 'EmploymentDetailsFieldGroup',
      purpose: #STANDARD,
      parentId: 'EmploymentDetailsSection',
      type: #FIELDGROUP_REFERENCE,
      targetQualifier: 'EmploymentDetails',
      position: 10
    },
    {
      id: 'CompensationSection',
      purpose: #STANDARD,
      type: #COLLECTION,
      label: 'Compensation',
      position: 30
    },
    {
      id: 'CompensationFieldGroup',
      purpose: #STANDARD,
      parentId: 'CompensationSection',
      type: #FIELDGROUP_REFERENCE,
      targetQualifier: 'Compensation',
      position: 10
    },
    {
      id: 'OfficeInformationSection',
      purpose: #STANDARD,
      type: #COLLECTION,
      label: 'Office Information',
      position: 40
    },
    {
      id: 'OfficeInfoFieldGroup',
      purpose: #STANDARD,
      parentId: 'OfficeInformationSection',
      type: #FIELDGROUP_REFERENCE,
      targetQualifier: 'OfficeInformation',
      position: 10
    }
  ]

  @UI: {
    lineItem:       [ { position: 10, importance: #HIGH, label: 'Employee ID' } ],
    selectionField: [ { position: 10 } ],
    fieldGroup:     [ { qualifier: 'EmploymentDetails', position: 10, label: 'Employee ID' } ]
  }
  @Search.defaultSearchElement: true
  @Search.fuzzinessThreshold: 0.8
  key EmployeeID,

  @UI: {
    fieldGroup:     [ { qualifier: 'PersonalInformation', position: 10, label: 'First Name' } ]
  }
  FirstName,

  @UI: {
    fieldGroup:     [ { qualifier: 'PersonalInformation', position: 20, label: 'Last Name' } ]
  }
  LastName,

  @UI: {
    lineItem:       [ { position: 20, importance: #HIGH, label: 'Employee Name' } ],
    selectionField: [ { position: 20 } ]
  }
  @Search.defaultSearchElement: true
  @Search.fuzzinessThreshold: 0.8
  FullName,

  @UI: {
    lineItem:       [ { position: 50, importance: #MEDIUM, label: 'Email' } ],
    fieldGroup:     [ { qualifier: 'PersonalInformation', position: 30, label: 'Email Address' } ]
  }
  Email,

  @UI: {
    fieldGroup:     [ { qualifier: 'PersonalInformation', position: 40, label: 'Phone Number' } ]
  }
  PhoneNumber,

  @UI: {
    fieldGroup:     [ { qualifier: 'PersonalInformation', position: 50, label: 'Date of Birth' } ]
  }
  DateOfBirth,

  @UI: {
    lineItem:       [ { position: 30, importance: #HIGH, label: 'Department' } ],
    selectionField: [ { position: 30 } ],
    fieldGroup:     [ { qualifier: 'EmploymentDetails', position: 20, label: 'Department' },
                      { qualifier: 'OfficeInformation', position: 20, label: 'Department' } ],
    dataPoint:      { qualifier: 'DeptDataPoint', title: 'Department' }
  }
  @Consumption.valueHelpDefinition: [{ entity: { name: 'ZI_Department', element: 'DepartmentName' } }]
  Department,

  @UI: {
    lineItem:       [ { position: 40, importance: #HIGH, label: 'Job Title' } ],
    selectionField: [ { position: 40 } ],
    fieldGroup:     [ { qualifier: 'EmploymentDetails', position: 30, label: 'Job Title' } ]
  }
  JobTitle,

  @UI: {
    fieldGroup:     [ { qualifier: 'EmploymentDetails', position: 40, label: 'Manager' } ]
  }
  @Consumption.valueHelpDefinition: [{ entity: { name: 'ZI_Manager', element: 'ManagerName' } }]
  Manager,

  @UI: {
    lineItem:       [ { position: 60, importance: #MEDIUM, label: 'Joining Date' } ],
    selectionField: [ { position: 50 } ],
    fieldGroup:     [ { qualifier: 'EmploymentDetails', position: 50, label: 'Joining Date' } ]
  }
  JoiningDate,

  @UI: {
    lineItem:       [ { position: 70, importance: #LOW, label: 'Employment Type' } ],
    selectionField: [ { position: 60 } ],
    fieldGroup:     [ { qualifier: 'EmploymentDetails', position: 60, label: 'Employment Type' } ]
  }
  EmploymentType,

  @UI: {
    lineItem:       [ { position: 80, importance: #HIGH, criticality: 'StatusCriticality', label: 'Employment Status' } ],
    selectionField: [ { position: 70 } ],
    fieldGroup:     [ { qualifier: 'EmploymentDetails', position: 70, label: 'Employment Status', criticality: 'StatusCriticality' } ],
    dataPoint:      { qualifier: 'StatusDataPoint', title: 'Employment Status', criticality: 'StatusCriticality' }
  }
  EmploymentStatus,

  @UI: {
    fieldGroup:     [ { qualifier: 'OfficeInformation', position: 10, label: 'Office Location' } ]
  }
  OfficeLocation,

  @UI: {
    fieldGroup:     [ { qualifier: 'Compensation', position: 10, label: 'Base Salary' } ]
  }
  @Semantics.amount.currencyCode: 'Currency'
  Salary,

  @UI: {
    fieldGroup:     [ { qualifier: 'Compensation', position: 20, label: 'Currency' } ]
  }
  Currency,

  StatusCriticality,
  LocalLastChangedAt
}
