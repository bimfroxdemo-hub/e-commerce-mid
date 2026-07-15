export const mockUsers = [
  {
    id: 101,
    name: "Vishal Nishad",
    email: "vishalnishad0809@gmail.com",
    role: "Admin", // Admin Role
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    status: "Active",
    phone: "+91 98765 43210",
    addresses: [
      {
        id: "addr_1",
        label: "Home (Default)",
        fullName: "Vishal Nishad",
        street: "404 Luxe Towers, Sector 62",
        city: "Noida",
        state: "Uttar Pradesh",
        pincode: "201301",
        phone: "+91 98765 43210",
        isDefault: true
      },
      {
        id: "addr_2",
        label: "Design Studio",
        fullName: "Vishal Nishad",
        street: "702 Creative Labs, DLF Phase 3",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122002",
        phone: "+91 98765 43211",
        isDefault: false
      }
    ],
    joinedDate: "2024-03-12"
  },
  {
    id: 102,
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    role: "Customer",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop",
    status: "Active",
    phone: "+91 91234 56789",
    addresses: [
      {
        id: "addr_3",
        label: "Primary Residence",
        fullName: "Aarav Sharma",
        street: "12B, Regency Enclave, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
        phone: "+91 91234 56789",
        isDefault: true
      }
    ],
    joinedDate: "2025-01-20"
  },
  {
    id: 103,
    name: "Priya Patel",
    email: "priya.patel@example.com",
    role: "Customer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    status: "Active",
    phone: "+91 88776 65544",
    addresses: [
      {
        id: "addr_4",
        label: "Appartment Address",
        fullName: "Priya Patel",
        street: "Flat 401, Sapphire Heights, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560038",
        phone: "+91 88776 65544",
        isDefault: true
      }
    ],
    joinedDate: "2025-05-15"
  },
  {
    id: 104,
    name: "Vikram Malhotra",
    email: "vikram@example.com",
    role: "Customer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    status: "Blocked",
    phone: "+91 77665 44332",
    addresses: [],
    joinedDate: "2024-11-02"
  }
];
