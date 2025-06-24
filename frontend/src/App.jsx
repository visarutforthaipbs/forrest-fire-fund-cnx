import { useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import Header from "./components/Header";
import Map from "./components/Map";
import VillageDetailSidebar from "./components/VillageDetailSidebar";
import VillageDetail from "./pages/VillageDetail";
import SubmitPlan from "./pages/SubmitPlan";
import WelcomeModal from "./components/WelcomeModal";

function App() {
  const [selectedVillage, setSelectedVillage] = useState(null);
  const welcomeModalRef = useRef();
  const sidebarWidth = useBreakpointValue({
    base: "100%",
    md: "350px",
    lg: "400px",
  });
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const handleVillageSelect = (village) => {
    setSelectedVillage(village);
  };

  const handleOpenWelcome = () => {
    welcomeModalRef.current?.openModal();
  };

  return (
    <Box minH="100vh" bg="brand.background">
      {/* Welcome Modal - shows on first visit */}
      <WelcomeModal ref={welcomeModalRef} />

      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* Sidebar - responsive positioning */}
              <VillageDetailSidebar
                village={selectedVillage}
                sidebarWidth={sidebarWidth}
                isDesktop={isDesktop}
              />

              {/* Main Content Area */}
              <Box
                ml={{ base: 0, lg: sidebarWidth }}
                height="100vh"
                display="flex"
                flexDirection="column"
                position="relative"
              >
                <Header onOpenWelcome={handleOpenWelcome} />
                <Box flex="1" height="0">
                  <Map
                    onVillageSelect={handleVillageSelect}
                    selectedVillage={selectedVillage}
                  />
                </Box>
              </Box>
            </>
          }
        />
        <Route path="/village/:id" element={<VillageDetail />} />
        <Route path="/submit-plan" element={<SubmitPlan />} />
      </Routes>
    </Box>
  );
}

export default App;
