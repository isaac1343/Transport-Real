export const STORAGE_KEY = "transport-coordination-system-v1";

const seedData = {
  employees: [
    {
      id: "EMP001",
      name: "Alice Johnson",
      department: "Finance",
      phone: "555-0101",
      password: "pass123",
      dropoffPoint: "North Gate"
    },
    {
      id: "EMP002",
      name: "Brian Smith",
      department: "Operations",
      phone: "555-0102",
      password: "pass123",
      dropoffPoint: "West End"
    },
    {
      id: "EMP003",
      name: "Cynthia Lee",
      department: "HR",
      phone: "555-0103",
      password: "pass123",
      dropoffPoint: "Central Park"
    }
  ],
  cars: [
    {
      id: "CAR001",
      plateNumber: "KAA-101A",
      driverName: "John Driver",
      capacity: 4
    },
    {
      id: "CAR002",
      plateNumber: "KBB-202B",
      driverName: "Mary Wheels",
      capacity: 6
    }
  ],
  dropoffPoints: ["North Gate", "West End", "Central Park", "South Gate"],
  bookings: [],
  boardings: [],
  users: [
    { username: "admin", password: "admin123", role: "admin", name: "System Admin" },
    { username: "vendor", password: "vendor123", role: "vendor", name: "Transport Vendor" }
  ]
};

export function todayKey() {
  return new Date().toISOString().split("T")[0];
}

export function loadData() {
  if (typeof window === "undefined") return seedData;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
}

export function saveData(data) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
}

export function employeeLogin(employeeId, password) {
  const data = loadData();
  return data.employees.find(
    (emp) => emp.id === employeeId.trim() && emp.password === password
  );
}

export function staffLogin(username, password) {
  const data = loadData();
  return data.users.find(
    (user) => user.username === username.trim() && user.password === password
  );
}