import { Route, Routes } from "react-router";
import { Layout } from "./components/layout/Layout";
import { Home } from "./components/main/Home";
import { Login } from "./components/main/Login";
import { Register } from "./components/main/Register";
import { VillaDetails } from "./components/main/VillaDetails";
import { EditVilla } from "./components/main/EditVilla";
import { OwnerProperties } from "./components/main/OwnerProperties";
import { AddVilla } from "./components/main/AddVilla";
import { CustomerReservations } from "./components/main/CustomerReservartions";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { NotFound } from "./components/main/NotFound";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="villas/:id" element={<VillaDetails />} />

          <Route element={<ProtectedRoute requireRole="Owner" />}>
            <Route path="villas/:id/edit" element={<EditVilla />} />
            <Route path="villas/my" element={<OwnerProperties />} />
            <Route path="villas/add" element={<AddVilla />} />
          </Route>

          <Route element={<ProtectedRoute requireRole="Customer" />}>
            <Route path="reservations/my" element={<CustomerReservations />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
