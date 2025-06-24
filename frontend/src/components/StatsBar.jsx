import {
  Box,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getVillageStats } from "../data/villageDataService";

const StatsBar = () => {
  const [stats, setStats] = useState(null);
  const bgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const villageStats = getVillageStats();
    setStats(villageStats);
  }, []);

  if (!stats) return null;

  return (
    <Box
      bg={bgColor}
      px={4}
      py={3}
      borderBottom="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <HStack spacing={8} justify="center">
        <Stat>
          <StatLabel color="brand.darkBlue">หมู่บ้านทั้งหมด</StatLabel>
          <StatNumber color="brand.orange">{stats.totalVillages}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel color="brand.darkBlue">มีแผนแล้ว</StatLabel>
          <StatNumber color="brand.green">{stats.withPlan}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel color="brand.darkBlue">ยังไม่มีแผน</StatLabel>
          <StatNumber color="red.500">{stats.withoutPlan}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel color="brand.darkBlue">ต้องการอาสา</StatLabel>
          <StatNumber color="orange.500">{stats.needVolunteers}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel color="brand.darkBlue">ต้องการงบ</StatLabel>
          <StatNumber color="purple.500">{stats.needFunding}</StatNumber>
        </Stat>
      </HStack>
    </Box>
  );
};

export default StatsBar;
