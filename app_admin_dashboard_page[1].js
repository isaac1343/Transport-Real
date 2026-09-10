"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { loadData, saveData, todayKey } from "@/lib/storage";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [employeeForm, setEmployeeForm] = useState({
    id: "",
    name: "",
    department: "",
    phone: "",
    password: "",
    dropoffPoint: ""
  });
  const [carForm, setCarForm] = useState({
    id: "",
    plateNumber: "",
    driverName: "",
    capacity: ""
  });
  const [dropoffPoint, setDropoffPoint] = useState("");

  const today = todayKey();

  useEffect(() => {
    setData(loadData());
  }, []);

  const todaysBookings = useMemo(() => {
    if (!data) return [];
    return data.bookings.filter((b) => b.date === today);
  }, [data, today]);

  const todaysBoardings = useMemo(() => {
    if (!data) return [];
    return data.boardings.filter((b) => b.date === today);
  }, [data, today]);

  const boardedByCar = useMemo(() => {
    if (!data) return [];
    return data.cars.map((car) => {
      const people = todaysBoardings.filter((b) => b.carId === car.id && b.boarded);
      return {
        ...car,
        boardedCount: people.length,
        boardedEmployees: people
      };
    });
  }, [data, todaysBoardings]);

  const utilization = useMemo(() => {
    const totalCapacity = data?.cars.reduce((sum, car) => sum + Number(car.capacity), 0) || 0;
    const boarded = todaysBoardings.length;
    const signed = todaysBookings.length;
    return {
      totalCapacity,
      boarded,
      signed,
      neededCarsEstimate:
        data?.cars.length ? Math.ceil(signed / Math.max(1, averageCapacity(data.cars))) : 0
    };
  }, [data, todaysBoardings, todaysBookings]);

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const db = loadData();
    db.employees.push({
      id: employeeForm.id.trim(),
      name: employeeForm.name.trim(),
      department: employeeForm.department.trim(),
      phone: employeeForm.phone.trim(),
      password: employeeForm.password,
      dropoffPoint: employeeForm.dropoffPoint
    });
    saveData(db);
    setData(db);
    setEmployeeForm({
      id: "",
      name: "",
      department: "",
      phone: "",
      password: "",
      dropoffPoint: ""
    });
    setMessage("New employee added.");
  };

  const handleAddCar = (e) => {
    e.preventDefault();
    const db = loadData();
    db.cars.push({
      id: carForm.id.trim(),
      plateNumber: carForm.plateNumber.trim(),
      driverName: carForm.driverName.trim(),
      capacity: Number(carForm.capacity)
    });
    saveData(db);
    setData(db);
    setCarForm({
      id: "",
      plateNumber: "",
      driverName: "",
      capacity: ""
    });
    setMessage("New car added.");
  };

  const handleAddDropoff = (e) => {
    e.preventDefault();
    const db = loadData();
    if (!db.dropoffPoints.includes(dropoffPoint.trim())) {
      db.dropoffPoints.push(dropoffPoint.trim());
      saveData(db);
      setData(db);
      setDropoffPoint("");
      setMessage("Drop-off point added.");
    } else {
      setMessage("Drop-off point already exists.");
    }
  };

  const logout = () => {
    localStorage.removeItem("transport-session");
    window.location.href = "/";
  };

  if (!data) {
    return (
      <AuthGuard role="admin">
        <main className="page">
          <div className="container">
            <div className="card">
              <h2>Loading admin dashboard...</h2>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard role="admin">
      <main className="page">
        <div className="container">
          <Header
            title="Admin Dashboard"
            subtitle="Manage employees, cars, drop-off points and transport utilization"
            actions={[{ label: "Logout", onClick: logout }]}
          />

          {message ? <div className="successBox">{message}</div> : null}

          <div className="kpi">
            <div className="stat">
              <span className="small">Employees Signed Today</span>
              <strong>{utilization.signed}</strong>
            </div>
            <div className="stat">
              <span className="small">Employees Boarded Today</span>
              <strong>{utilization.boarded}</strong>
            </div>
            <div className="stat">
              <span className="small">Fleet Capacity</span>
              <strong>{utilization.totalCapacity}</strong>
            </div>
            <div className="stat">
              <span className="small">Estimated Cars Needed</span>
              <strong>{utilization.neededCarsEstimate}</strong>
            </div>
          </div>

          <div className="grid three" style={{ marginTop: 18 }}>
            <div className="card">
              <h2>Add New Employee</h2>
              <form onSubmit={handleAddEmployee}>
                <input
                  className="input"
                  placeholder="Employee ID"
                  value={employeeForm.id}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, id: e.target.value })}
                  required
                />
                <input
                  className="input"
                  placeholder="Full Name"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  required
                />
                <input
                  className="input"
                  placeholder="Department"
                  value={employeeForm.department}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                  required
                />
                <input
                  className="input"
                  placeholder="Phone"
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                  required
                />
                <input
                  className="input"
                  placeholder="Password"
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                  required
                />
                <select
                  className="select"
                  value={employeeForm.dropoffPoint}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, dropoffPoint: e.target.value })}
                  required
                >
                  <option value="">Select drop-off point</option>
                  {data.dropoffPoints.map((point) => (
                    <option key={point} value={point}>
                      {point}
                    </option>
                  ))}
                </select>
                <button className="button primary" type="submit">Add Employee</button>
              </form>
            </div>

            <div className="card">
              <h2>Add Car</h2>
              <form onSubmit={handleAddCar}>
                <input
                  className="input"
                  placeholder="Car ID"
                  value={carForm.id}
                  onChange={(e) => setCarForm({ ...carForm, id: e.target.value })}
                  required
                />
                <input
                  className="input"
                  placeholder="Number Plate"
                  value={carForm.plateNumber}
                  onChange={(e) => setCarForm({ ...carForm, plateNumber: e.target.value })}
                  required
                />
                <input
                  className="input"
                  placeholder="Driver Name"
                  value={carForm.driverName}
                  onChange={(e) => setCarForm({ ...carForm, driverName: e.target.value })}
                  required
                />
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="Capacity"
                  value={carForm.capacity}
                  onChange={(e) => setCarForm({ ...carForm, capacity: e.target.value })}
                  required
                />
                <button className="button primary" type="submit">Add Car</button>
              </form>
            </div>

            <div className="card">
              <h2>Add Drop-off Point</h2>
              <form onSubmit={handleAddDropoff}>
                <input
                  className="input"
                  placeholder="Drop-off point"
                  value={dropoffPoint}
                  onChange={(e) => setDropoffPoint(e.target.value)}
                  required
                />
                <button className="button primary" type="submit">Add Drop-off Point</button>
              </form>
              <div className="list" style={{ marginTop: 16 }}>
                {data.dropoffPoints.map((point) => (
                  <div className="listItem" key={point}>{point}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid two" style={{ marginTop: 18 }}>
            <div className="card">
              <h2>All Registered Employees</h2>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Drop-off Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.employees.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>{emp.name}</td>
                        <td>{emp.department}</td>
                        <td>{emp.dropoffPoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h2>Cars and Capacity</h2>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Car ID</th>
                      <th>Plate Number</th>
                      <th>Driver</th>
                      <th>Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cars.map((car) => (
                      <tr key={car.id}>
                        <td>{car.id}</td>
                        <td>{car.plateNumber}</td>
                        <td>{car.driverName}</td>
                        <td>{car.capacity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid two" style={{ marginTop: 18 }}>
            <div className="card">
              <h2>Employees Boarded by Specific Car</h2>
              <div className="list">
                {boardedByCar.map((car) => (
                  <div className="listItem" key={car.id}>
                    <strong>{car.plateNumber}</strong> — {car.boardedCount}/{car.capacity} boarded
                    <div className="small" style={{ marginTop: 8 }}>
                      {car.boardedEmployees.length === 0
                        ? "No employees boarded this car today."
                        : car.boardedEmployees
                            .map((emp) => `${emp.employeeName} (${emp.employeeId})`)
                            .join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>Full Report of Transport Utilization</h2>
              <div className="list">
                <div className="listItem">
                  <strong>Date:</strong> {today}
                </div>
                <div className="listItem">
                  <strong>Total registered employees:</strong> {data.employees.length}
                </div>
                <div className="listItem">
                  <strong>Total signed up today:</strong> {todaysBookings.length}
                </div>
                <div className="listItem">
                  <strong>Total boarded today:</strong> {todaysBoardings.length}
                </div>
                <div className="listItem">
                  <strong>Total cars available:</strong> {data.cars.length}
                </div>
                <div className="listItem">
                  <strong>Total capacity available:</strong> {utilization.totalCapacity}
                </div>
                <div className="listItem">
                  <strong>Utilization rate:</strong>{" "}
                  {utilization.totalCapacity
                    ? `${Math.round((todaysBoardings.length / utilization.totalCapacity) * 100)}%`
                    : "0%"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}

function averageCapacity(cars) {
  if (!cars.length) return 1;
  return cars.reduce((sum, car) => sum + Number(car.capacity), 0) / cars.length;
}