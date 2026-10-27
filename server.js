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

const SERVICE_BASE = '/sap/opu/odata4/sap/zui_employee_o4/srvd/sap/zsd_employee/0001';

// Direct metadata endpoint
app.get(`${SERVICE_BASE}/\\$metadata`, (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(METADATA_FILE);
});

// OData V4 Service Middleware
app.use((req, res, next) => {
  const url = decodeURIComponent(req.originalUrl || req.url);

  if (!url.startsWith(SERVICE_BASE)) {
    return next();
  }

  const sub = url.slice(SERVICE_BASE.length).split('?')[0];

  // 1. Metadata check
  if (sub === '/$metadata' || sub.includes('$metadata')) {
    res.setHeader('Content-Type', 'application/xml');
    return res.sendFile(METADATA_FILE);
  }

  // 2. Departments
  if (sub === '/Departments' || sub === '/Departments/') {
    const data = JSON.parse(fs.readFileSync(DEPT_FILE, 'utf8'));
    return res.json({
      '@odata.context': '$metadata#Departments',
      value: data
    });
  }

  // 3. Managers
  if (sub === '/Managers' || sub === '/Managers/') {
    const data = JSON.parse(fs.readFileSync(MGR_FILE, 'utf8'));
    return res.json({
      '@odata.context': '$metadata#Managers',
      value: data
    });
  }

  // 4. Employee Collection
  if (sub === '/Employee' || sub === '/Employee/') {
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
        '@odata.context': '$metadata#Employee',
        '@odata.count': list.length,
        value: list
      });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body.EmployeeID || !body.FirstName || !body.LastName || !body.Email) {
        return res.status(400).json({
          error: {
            code: 'CX_RAP_VALIDATION_ERROR',
            message: 'Mandatory fields missing: EmployeeID, FirstName, LastName, and Email are required.'
          }
        });
      }

      const list = getEmployees();
      const exists = list.some(e => e.EmployeeID.toUpperCase() === body.EmployeeID.trim().toUpperCase());
      if (exists) {
        return res.status(409).json({
          error: {
            code: 'CX_RAP_DUPLICATE_KEY',
            message: `Employee ID '${body.EmployeeID}' already exists in the system.`
          }
        });
      }

      const newEmp = {
        EmployeeID: body.EmployeeID.trim().toUpperCase(),
        FirstName: body.FirstName.trim(),
        LastName: body.LastName.trim(),
        FullName: `${body.FirstName.trim()} ${body.LastName.trim()}`,
        Email: body.Email.trim(),
        PhoneNumber: body.PhoneNumber || '',
        DateOfBirth: body.DateOfBirth || '',
        Department: body.Department || 'Engineering',
        JobTitle: body.JobTitle || '',
        Manager: body.Manager || 'Alexander Wright',
        JoiningDate: body.JoiningDate || new Date().toISOString().slice(0, 10),
        EmploymentType: body.EmploymentType || 'Full-Time',
        EmploymentStatus: body.EmploymentStatus || 'Active',
        OfficeLocation: body.OfficeLocation || 'Walldorf, Germany',
        Salary: parseFloat(body.Salary) || 0,
        Currency: body.Currency || 'EUR',
        StatusCriticality: body.EmploymentStatus === 'Active' ? 3 : (body.EmploymentStatus === 'On Leave' ? 2 : 1)
      };

      list.unshift(newEmp);
      saveEmployees(list);

      return res.status(201).json(newEmp);
    }
  }

  // 5. Individual Employee
  const singleMatch = sub.match(/^\/Employee(?:\(['"]?([^'"\)]+)['"]?\)|(?:\/['"]?([^'"\)]+)['"]?))$/);
  if (singleMatch) {
    const empId = singleMatch[1] || singleMatch[2];
    const list = getEmployees();
    const index = list.findIndex(e => e.EmployeeID === empId);

    if (req.method === 'GET') {
      if (index === -1) {
        return res.status(404).json({
          error: { code: 'CX_RAP_NOT_FOUND', message: `Employee '${empId}' not found.` }
        });
      }
      return res.json({
        '@odata.context': '$metadata#Employee/$entity',
        ...list[index]
      });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      if (index === -1) {
        return res.status(404).json({
          error: { code: 'CX_RAP_NOT_FOUND', message: `Employee '${empId}' not found.` }
        });
      }
      const existing = list[index];
      const body = req.body;
      const updated = {
        ...existing,
        ...body,
        EmployeeID: existing.EmployeeID,
        FullName: body.FirstName && body.LastName ? `${body.FirstName.trim()} ${body.LastName.trim()}` : existing.FullName,
        Salary: body.Salary !== undefined ? parseFloat(body.Salary) : existing.Salary,
        StatusCriticality: body.EmploymentStatus === 'Active' ? 3 : (body.EmploymentStatus === 'On Leave' ? 2 : 1)
      };
      list[index] = updated;
      saveEmployees(list);
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      if (index === -1) {
        return res.status(404).json({
          error: { code: 'CX_RAP_NOT_FOUND', message: `Employee '${empId}' not found.` }
        });
      }
      list.splice(index, 1);
      saveEmployees(list);
      return res.status(204).send();
    }
  }

  next();
});

// Serve webapp static directory
app.use(express.static(path.join(__dirname, 'webapp')));

// Catch-all for SPA navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`SAP Fiori Elements • Employee Management Application`);
  console.log(`Launchpad URL: http://localhost:${PORT}/index.html`);
  console.log(`OData V4 Metadata: http://localhost:${PORT}${SERVICE_BASE}/$metadata`);
  console.log(`OData V4 EntitySet: http://localhost:${PORT}${SERVICE_BASE}/Employee`);
  console.log(`================================================================`);
});
