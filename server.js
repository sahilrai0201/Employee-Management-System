const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'webapp', 'localService', 'data', 'Employee.json');
const DEPT_FILE = path.join(__dirname, 'webapp', 'localService', 'data', 'Departments.json');
const MGR_FILE = path.join(__dirname, 'webapp', 'localService', 'data', 'Managers.json');
const METADATA_FILE = path.join(__dirname, 'webapp', 'localService', 'metadata.xml');

function getEmployees() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveEmployees(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Traditional SAP Gateway OData V2 Service Base Endpoint
const GATEWAY_BASE = '/sap/opu/odata/sap/ZEMPLOYEE_SRV';

// Helper to extract Key from OData V2 URI e.g. EmployeeSet('EMP-1001') or EmployeeSet('EMP%2D1001')
function extractKey(subPath, prefix) {
  const regex = new RegExp(`^\\/${prefix}\\(['"]?([^'"\\)]+)['"]?\\)`);
  const match = subPath.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
}

// -------------------------------------------------------------
// SAP Gateway OData V2 Middleware
// -------------------------------------------------------------
app.use((req, res, next) => {
  let url = decodeURIComponent(req.originalUrl || req.url);

  // Fallback redirect if an old RAP URL is called
  if (url.startsWith('/sap/opu/odata4/sap/zui_employee_o4/srvd/sap/zsd_employee/0001')) {
    const migrated = url.replace(
      '/sap/opu/odata4/sap/zui_employee_o4/srvd/sap/zsd_employee/0001',
      GATEWAY_BASE
    ).replace('/Employee', '/EmployeeSet')
     .replace('/Departments', '/DepartmentSet')
     .replace('/Managers', '/ManagerSet');
    req.url = migrated;
    url = decodeURIComponent(req.url);
  }

  if (!url.startsWith(GATEWAY_BASE)) {
    return next();
  }

  const sub = url.slice(GATEWAY_BASE.length).split('?')[0];

  // 1. Metadata request
  if (sub === '/$metadata' || sub.includes('$metadata')) {
    res.setHeader('Content-Type', 'application/xml');
    return res.sendFile(METADATA_FILE);
  }

  // 2. Service Document
  if (sub === '' || sub === '/') {
    return res.json({
      d: {
        EntitySets: ['EmployeeSet', 'DepartmentSet', 'ManagerSet']
      }
    });
  }

  // 3. DepartmentSet (Value Help)
  if (sub === '/DepartmentSet' || sub === '/DepartmentSet/') {
    const data = JSON.parse(fs.readFileSync(DEPT_FILE, 'utf8'));
    return res.json({
      d: {
        results: data
      }
    });
  }

  // 4. ManagerSet (Value Help)
  if (sub === '/ManagerSet' || sub === '/ManagerSet/') {
    const data = JSON.parse(fs.readFileSync(MGR_FILE, 'utf8'));
    return res.json({
      d: {
        results: data
      }
    });
  }

  // 5. EmployeeSet Collection
  if (sub === '/EmployeeSet' || sub === '/EmployeeSet/') {
    if (req.method === 'GET') {
      let list = getEmployees();

      if (req.query.$search) {
        const query = req.query.$search.toLowerCase();
        list = list.filter(emp =>
          (emp.EmployeeID && emp.EmployeeID.toLowerCase().includes(query)) ||
          (emp.FullName && emp.FullName.toLowerCase().includes(query)) ||
          (emp.Department && emp.Department.toLowerCase().includes(query)) ||
          (emp.JobTitle && emp.JobTitle.toLowerCase().includes(query)) ||
          (emp.Email && emp.Email.toLowerCase().includes(query))
        );
      }

      return res.json({
        d: {
          results: list,
          __count: list.length
        }
      });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body.EmployeeID || !body.FirstName || !body.LastName || !body.Email) {
        return res.status(400).json({
          error: {
            code: '/IWBEP/CX_MGW_BUSI_EXCEPTION',
            message: {
              lang: 'en',
              value: 'Mandatory fields missing: Employee ID, Name, and Email are required.'
            }
          }
        });
      }

      const list = getEmployees();
      const duplicate = list.find(e => e.EmployeeID.toUpperCase() === body.EmployeeID.toUpperCase());
      if (duplicate) {
        return res.status(409).json({
          error: {
            code: '/IWBEP/CX_MGW_BUSI_EXCEPTION',
            message: {
              lang: 'en',
              value: `Employee with ID ${body.EmployeeID} already exists in table ZEMPLOYEE.`
            }
          }
        });
      }

      const newEmp = {
        EmployeeID: body.EmployeeID,
        FirstName: body.FirstName,
        LastName: body.LastName,
        FullName: `${body.FirstName} ${body.LastName}`.trim(),
        Email: body.Email,
        PhoneNumber: body.PhoneNumber || '',
        DateOfBirth: body.DateOfBirth || null,
        Department: body.Department || 'Engineering',
        JobTitle: body.JobTitle || 'Specialist',
        Manager: body.Manager || 'Alexander Wright',
        JoiningDate: body.JoiningDate || new Date().toISOString().slice(0, 10),
        EmploymentType: body.EmploymentType || 'Full-Time',
        EmploymentStatus: body.EmploymentStatus || 'Active',
        OfficeLocation: body.OfficeLocation || 'Walldorf, Germany',
        Salary: parseFloat(body.Salary) || 75000,
        Currency: body.Currency || 'EUR',
        StatusCriticality: body.EmploymentStatus === 'Active' ? 3 : (body.EmploymentStatus === 'On Leave' ? 2 : 1)
      };

      list.unshift(newEmp);
      saveEmployees(list);

      return res.status(201).json({
        d: newEmp
      });
    }
  }

  // 6. Single Employee: EmployeeSet('ID')
  const empId = extractKey(sub, 'EmployeeSet');
  if (empId) {
    const list = getEmployees();
    const index = list.findIndex(e => e.EmployeeID.toUpperCase() === empId.toUpperCase());

    if (req.method === 'GET') {
      if (index === -1) {
        return res.status(404).json({
          error: {
            code: '/IWBEP/CX_MGW_BUSI_EXCEPTION',
            message: { lang: 'en', value: `Employee '${empId}' not found in database.` }
          }
        });
      }
      return res.json({
        d: list[index]
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'MERGE') {
      if (index === -1) {
        return res.status(404).json({
          error: {
            code: '/IWBEP/CX_MGW_BUSI_EXCEPTION',
            message: { lang: 'en', value: `Employee '${empId}' not found for update.` }
          }
        });
      }

      const updated = {
        ...list[index],
        ...req.body,
        EmployeeID: list[index].EmployeeID
      };

      if (updated.FirstName && updated.LastName) {
        updated.FullName = `${updated.FirstName} ${updated.LastName}`.trim();
      }

      if (updated.EmploymentStatus) {
        updated.StatusCriticality = updated.EmploymentStatus === 'Active' ? 3 : (updated.EmploymentStatus === 'On Leave' ? 2 : 1);
      }

      list[index] = updated;
      saveEmployees(list);

      return res.json({
        d: updated
      });
    }

    if (req.method === 'DELETE') {
      if (index === -1) {
        return res.status(404).json({
          error: {
            code: '/IWBEP/CX_MGW_BUSI_EXCEPTION',
            message: { lang: 'en', value: `Employee '${empId}' not found for deletion.` }
          }
        });
      }

      list.splice(index, 1);
      saveEmployees(list);

      return res.status(204).send();
    }
  }

  return next();
});

// Serve SAPUI5 Webapp static assets
app.use(express.static(path.join(__dirname, 'webapp')));

// Root route redirect to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
});

// Start Express HTTP Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SAP Fiori - Traditional SAP Gateway OData V2 Server  `);
  console.log(`  Local Service Endpoint: http://localhost:${PORT}${GATEWAY_BASE}/`);
  console.log(`  Web Application:        http://localhost:${PORT}/index.html`);
  console.log(`=======================================================`);
});
