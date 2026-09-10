"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { loadData, saveData, todayKey } from "@/lib/storage";

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [selectedCar, setSelectedCar] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const today = todayKey();

  useEffect(() => {
    setData(loadData());
  }, []);

  const todaysBookings = useMemo(() => {
    if (!data) return [];
    return data.bookings.filter((b) => b.date === today);
  }, [data, today]);

  const boardedToday = useMemo(() => {
    if (!data) return [];
    return data.boardings.filter((b) => b.date === today);
  }, [data, today]);

  const handleSearch = () => {
    setError("");
    setMessage("");
    const db = loadData();
    const employee = db.employees.find((emp) => emp.id === searchId.trim());
    if (!employee) {
      setSearchResult(null);
      setError("Employee number not found.");
      return;
    }
    const booking = db.bookings.find((b) => b.employeeId === employee.id && b.date === today);
    setSearchResult({
      employee,
      booking
    });
    if (!booking) {
      setError("Employee found, but has not signed up for transport today.");
    }
  };

  const handleBoard = () => {
    setError("");
    setMessage("");
    const db = loadData();

    if (!searchResult?.employee) {
      setError("Search for an employee first.");
      return;
    }

    if (!selectedCar) {
      setError("Select a car before boarding.");
      return;
    }

    if (!searchResult.booking) {
      setError("This employee is missing from today's signed list.");
      return;
    }

    const car = db.cars.find((c) => c.id === selectedCar);
    const currentCarBoardings = db.boardings.filter(
      (b) => b.date === today && b.carId === selectedCar && b.boarded
    );

    if (currentCarBoardings.length >= car.capacity) {
      setError("Selected car is already full.");
      return;
    }

    const existingBoarding = db.boardings.find(
      (b) => b.employeeId === searchResult.employee.id && b.date === today
    );

    if (existingBoarding) {
      existingBoarding.carId = car.id;
      existingBoarding.plateNumber = car.plateNumber;
      existingBoarding.dropoffPoint = searchResult.employee.dropoffPoint;
      existingBoarding.boarded = true;
      existingBoarding.droppedOff = false;
      existingBoarding.boardedAt = new Date().toISOString();
    } else {
      db.boardings.push({
        id: `BRD-${Date.now()}`,
        date: today,
        employeeId: searchResult.employee.id,
        employeeName: searchResult.employee.name,
        carId: car.id,
        plateNumber: car.plateNumber,
        dropoffPoint: searchResult.employee.dropoffPoint,
        boarded: true,
        droppedOff: false,
        boardedAt: new Date().toISOString(),
        droppedOffAt: null
      });
    }

    saveData(db);
    setData(db);
    setMessage(`Employee checked into car ${car.plateNumber}.`);
  };

  const handleDropOff = (boardingId) => {
    setError("");
    setMessage("");
    const db = loadData();
    const boarding = db.boardings.find((b) => b.id === boardingId);
    if (!boarding) {
      setError("Boarding record not found.");
      return;
    }
    boarding.droppedOff = true;
    boarding.droppedOffAt = new Date().toISOString();
    saveData(db);
    setData(db);
    setMessage("Employee marked as dropped off.");
  };

  const logout = () => {
    localStorage.removeItem("transport-session");
    window.location.href = "/";
  };

  return (
    <AuthGuard role="vendor">
      <main className="page">
        <div className="container">
          <Header
            title="Vendor Dashboard"
            subtitle="Search signed employees, board them to specific cars, and mark drop-off"
            actions={[{ label: "Logout", onClick: logout }]}
          />

          <div className="grid two">
            <div className="card">
              <h2>Search Employee by Employee ID</h2>
              {error ? <div className="error">{error}</div> : null}
              {message ? <div className="successBox">{message}</div> : null}
              <label className="label">Employee Number</label>
              <input
                className="input"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter employee ID"
              />
              <button className="button primary" onClick={handleSearch}>
                Search Employee
              </button>

              {searchResult ? (
                <div className="list" style={{ marginTop: 16 }}>
                  <div className="listItem">
                    <strong>Name:</strong> {searchResult.employee.name}
                  </div>
                  <div className="listItem">
                    <strong>Department:</strong> {searchResult.employee.department}
                  </div>
                  <div className="listItem">
                    <strong>Signed Today:</strong>{" "}
                    {searchResult.booking ? (
                      <span className="badge green">Yes</span>
                    ) : (
                      <span className="badge red">No</span>
                    )}
                  </div>
                  <div className="listItem">
                    <strong>Drop-off Point:</strong> {searchResult.employee.dropoffPoint}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="card">
              <h2>Board Employee to Specific Car</h2>
              <label className="label">Select Car by Plate Number</label>
              <select
                className="select"
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
              >
                <option value="">Choose a car</option>
                {data?.cars.map((car) => {
                  const count = boardedToday.filter(
                    (b) => b.carId === car.id && b.boarded
                  ).length;
                  return (
                    <option key={car.id} value={car.id}>
                      {car.plateNumber} - capacity {count}/{car.capacity}
                    </option>
                  );
                })}
              </select>
              <button className="button success" onClick={handleBoard}>
                Check Employee In / Board
              </button>
            </div>
          </div>

          <div className="grid two" style={{ marginTop: 18 }}>
            <div className="card">
              <h2>All Employees Signed Today</h2>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Drop-off</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysBookings.length === 0 ? (
                      <tr>
                        <td colSpan="4">No employees signed today.</td>
                      </tr>
                    ) : (
                      todaysBookings.map((booking) => {
                        const boarded = boardedToday.find((b) => b.employeeId === booking.employeeId);
                        return (
                          <tr key={booking.id}>
                            <td>{booking.employeeId}</td>
                            <td>{booking.employeeName}</td>
                            <td>{booking.dropoffPoint}</td>
                            <td>
                              {boarded ? (
                                <span className="badge green">Boarded</span>
                              ) : (
                                <span className="badge yellow">Waiting</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h2>Boarded Employees / Drop-off</h2>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Car</th>
                      <th>Drop-off</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardedToday.length === 0 ? (
                      <tr>
                        <td colSpan="5">No boarded employees yet.</td>
                      </tr>
                    ) : (
                      boardedToday.map((boarding) => (
                        <tr key={boarding.id}>
                          <td>{boarding.employeeId}</td>
                          <td>{boarding.employeeName}</td>
                          <td>{boarding.plateNumber}</td>
                          <td>
                            {boarding.droppedOff ? (
                              <span className="badge green">Dropped Off</span>
                            ) : (
                              <span className="badge yellow">In Transit</span>
                            )}
                          </td>
                          <td>
                            {!boarding.droppedOff ? (
                              <button
                                className="button warning"
                                onClick={() => handleDropOff(boarding.id)}
                              >
                                Mark Drop-off
                              </button>
                            ) : (
                              <span className="small">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}