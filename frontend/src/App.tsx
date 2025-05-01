import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AddSeller from './pages/AddSeller';
import AddVehicle from './pages/AddVehicle';
import AddVehicleWithSeller from './pages/AddVehicleWithSeller';
import AvailableVehicles from './pages/AvailableVehicles';
import EditSeller from './pages/EditSeller';
import SellersList from './pages/SellersList';
import SoldVehicles from './pages/SoldVehicles';
import SimulatePayment from './pages/SimulatePayment';
import { VehicleProvider } from './contexts/VehicleContext';
import { ToastProvider } from './components/material/feedback/ToastProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <VehicleProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<AvailableVehicles />} />
                <Route path="add-vehicle" element={<AddVehicle />} />
                <Route path="add-vehicle/:sellerId" element={<AddVehicleWithSeller />} />
                <Route path="sold-vehicles" element={<SoldVehicles />} />
                <Route path="sellers" element={<SellersList />} />
                <Route path="add-seller" element={<AddSeller />} />
                <Route path="sellers/add" element={<AddSeller />} />
                <Route path="edit-seller/:sellerId" element={<EditSeller />} />
              </Route>
              <Route path="/simulate-payment/:externalId" element={<SimulatePayment />} />
            </Routes>
          </Router>
        </VehicleProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
