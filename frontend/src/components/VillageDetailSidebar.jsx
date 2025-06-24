import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  List,
  ListItem,
  ListIcon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  Center,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Tbody,
  Tr,
  Td,
  Flex,
  Spacer,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useToast,
  Image,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  CalendarIcon,
  TimeIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { getVillageStats } from "../data/villageDataService";

const VillageDetailSidebar = ({ village, sidebarWidth, isDesktop }) => {
  const [stats, setStats] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const villageStats = await getVillageStats();
        setStats(villageStats);
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    };

    loadStats();
  }, []);

  const handleSupportClick = () => {
    // Open Facebook page in new tab
    window.open("https://www.facebook.com/breathcouncil.org", "_blank");

    // Show toast notification
    toast({
      title: "เปิดหน้า Facebook แล้ว",
      description: "คุณสามารถแชทกับแอดมินเพื่อสนับสนุนหมู่บ้านนี้ได้",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusBadges = (status) => {
    const badges = [];
    if (status.hasPlan) {
      badges.push(
        <Badge key="plan" colorScheme="green" size="sm">
          ✅ มีแผนแล้ว
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="no-plan" colorScheme="red" size="sm">
          ❌ ยังไม่มี
        </Badge>
      );
    }
    if (status.needsVolunteers) {
      badges.push(
        <Badge key="volunteers" colorScheme="orange" size="sm">
          🔧 ต้องการอาสา
        </Badge>
      );
    }
    if (status.needsFunding) {
      badges.push(
        <Badge key="funding" colorScheme="blue" size="sm">
          💰 ต้องการเงิน
        </Badge>
      );
    }
    return badges;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "ไม่ระบุ";
    return `฿${amount.toLocaleString()}`;
  };

  const getTimingColor = (timing) => {
    switch (timing) {
      case "ก่อนเกิดเหตุ":
        return "blue";
      case "ช่วงเกิดเหตุ":
        return "orange";
      case "หลังเกิดเหตุ":
        return "green";
      default:
        return "gray";
    }
  };

  const getTimingIcon = (timing) => {
    switch (timing) {
      case "ก่อนเกิดเหตุ":
        return "🛡️";
      case "ช่วงเกิดเหตุ":
        return "🔥";
      case "หลังเกิดเหตุ":
        return "🌱";
      default:
        return "📋";
    }
  };

  const renderVillageInfo = (villageInfo) => {
    if (!villageInfo) return null;

    return (
      <Card>
        <CardBody>
          <VStack align="start" spacing={3}>
            <HStack spacing={2} align="center">
              <Image
                src="/icons/vills-home.svg"
                alt="Village Info Icon"
                w="16px"
                h="16px"
                objectFit="contain"
              />
              <Heading size="sm" color="brand.darkBlue">
                ข้อมูลหมู่บ้าน
              </Heading>
            </HStack>

            <SimpleGrid columns={2} spacing={3} w="full">
              <Box>
                <Text fontSize="xs" color="gray.500">
                  หมู่
                </Text>
                <Text fontWeight="semibold">{villageInfo.moo}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">
                  ตำบล
                </Text>
                <Text fontWeight="semibold">{villageInfo.subdistrict}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">
                  อำเภอ
                </Text>
                <Text fontWeight="semibold">{villageInfo.district}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">
                  จังหวัด
                </Text>
                <Text fontWeight="semibold">{villageInfo.province}</Text>
              </Box>
            </SimpleGrid>

            {(villageInfo.population || villageInfo.households) && (
              <SimpleGrid columns={2} spacing={3} w="full">
                {villageInfo.population && (
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      ประชากร
                    </Text>
                    <Text fontWeight="semibold">
                      {villageInfo.population.toLocaleString()} คน
                    </Text>
                  </Box>
                )}
                {villageInfo.households && (
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      ครัวเรือน
                    </Text>
                    <Text fontWeight="semibold">
                      {villageInfo.households.toLocaleString()} หลังคาเรือน
                    </Text>
                  </Box>
                )}
              </SimpleGrid>
            )}

            {villageInfo.area?.forest_managed_rai && (
              <Box>
                <Text fontSize="xs" color="gray.500">
                  พื้นที่ป่าที่ดูแล
                </Text>
                <Text fontWeight="semibold">
                  {villageInfo.area.forest_managed_rai.toLocaleString()} ไร่
                </Text>
              </Box>
            )}

            {villageInfo.forest_types &&
              villageInfo.forest_types.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    ประเภทป่า
                  </Text>
                  <Wrap>
                    {villageInfo.forest_types.map((type, index) => (
                      <WrapItem key={index}>
                        <Tag size="sm" colorScheme="green">
                          <TagLabel>{type}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}

            {villageInfo.main_occupations &&
              villageInfo.main_occupations.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    อาชีพหลัก
                  </Text>
                  <Wrap>
                    {villageInfo.main_occupations.map((occupation, index) => (
                      <WrapItem key={index}>
                        <Tag size="sm" colorScheme="blue">
                          <TagLabel>{occupation}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}

            {villageInfo.problems && (
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  ปัญหาและสาเหตุ
                </Text>
                <Text fontSize="sm" color="red.600">
                  {villageInfo.problems.causes}
                </Text>
                {villageInfo.problems.risk_area && (
                  <Box mt={2}>
                    <Text fontSize="xs" color="gray.500">
                      พื้นที่เสี่ยง
                    </Text>
                    <Text fontSize="sm" color="orange.600">
                      {villageInfo.problems.risk_area}
                    </Text>
                  </Box>
                )}
                {villageInfo.problems.limitations && (
                  <Box mt={2}>
                    <Text fontSize="xs" color="gray.500">
                      ข้อจำกัด
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {villageInfo.problems.limitations}
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  const renderFireManagementActivities = (fireManagement) => {
    if (!fireManagement) return null;

    const allActivities = [
      ...(fireManagement.pre_incident || []).map((activity) => ({
        ...activity,
        timing: "ก่อนเกิดเหตุ",
      })),
      ...(fireManagement.during_incident || []).map((activity) => ({
        ...activity,
        timing: "ช่วงเกิดเหตุ",
      })),
      ...(fireManagement.post_incident || []).map((activity) => ({
        ...activity,
        timing: "หลังเกิดเหตุ",
      })),
    ];

    if (allActivities.length === 0) return null;

    return (
      <Card>
        <CardBody>
          <VStack align="start" spacing={3}>
            <Heading size="sm" color="brand.orange">
              🔥 แผนจัดการไฟป่า
            </Heading>

            <Accordion allowMultiple w="full">
              {allActivities.map((activity, index) => (
                <AccordionItem
                  key={activity.id || index}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  mb={2}
                >
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <HStack spacing={2}>
                        <Text fontSize="sm">
                          {getTimingIcon(activity.timing)}
                        </Text>
                        <Badge
                          colorScheme={getTimingColor(activity.timing)}
                          size="sm"
                        >
                          {activity.timing}
                        </Badge>
                        <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                          {activity.name}
                        </Text>
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <VStack align="start" spacing={3}>
                      <Text fontSize="sm" color="gray.700">
                        {activity.description}
                      </Text>

                      {activity.period && (
                        <HStack>
                          <CalendarIcon color="gray.500" boxSize={3} />
                          <Text fontSize="xs" color="gray.600">
                            ระยะเวลา: {activity.period}
                          </Text>
                        </HStack>
                      )}

                      {activity.budget > 0 && (
                        <Box w="full">
                          <HStack mb={2}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="brand.darkBlue"
                            >
                              💰 งบประมาณ: {formatCurrency(activity.budget)}
                            </Text>
                          </HStack>

                          {activity.budget_items &&
                            activity.budget_items.length > 0 && (
                              <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>
                                  รายละเอียดค่าใช้จ่าย:
                                </Text>
                                <List spacing={1}>
                                  {activity.budget_items.map(
                                    (item, itemIndex) => (
                                      <ListItem key={itemIndex} fontSize="xs">
                                        <HStack justify="space-between">
                                          <Text flex="1">
                                            {item.description}
                                          </Text>
                                          <Text
                                            fontWeight="semibold"
                                            color="brand.darkBlue"
                                          >
                                            {item.amount
                                              ? formatCurrency(item.amount)
                                              : "ไม่มีค่าใช้จ่าย"}
                                          </Text>
                                        </HStack>
                                      </ListItem>
                                    )
                                  )}
                                </List>
                              </Box>
                            )}
                        </Box>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  const renderEquipment = (equipment) => {
    if (!equipment || equipment.length === 0) return null;

    return (
      <Card w="full">
        <CardBody>
          <VStack align="start" spacing={3}>
            <Heading size="sm" color="brand.green">
              🛠️ อุปกรณ์และเครื่องมือ
            </Heading>

            <Table size="sm" variant="simple">
              <Tbody>
                {equipment.map((item, index) => (
                  <Tr key={index}>
                    <Td px={0} py={2}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="semibold">
                          {item.name}
                        </Text>
                        <HStack spacing={4}>
                          <HStack>
                            <Text fontSize="xs" color="gray.500">
                              มีอยู่:
                            </Text>
                            <Badge
                              colorScheme={item.available > 0 ? "green" : "red"}
                              size="sm"
                            >
                              {item.available}
                            </Badge>
                          </HStack>
                          <HStack>
                            <Text fontSize="xs" color="gray.500">
                              ต้องการ:
                            </Text>
                            <Badge
                              colorScheme={item.needed > 0 ? "orange" : "gray"}
                              size="sm"
                            >
                              {item.needed}
                            </Badge>
                          </HStack>
                        </HStack>
                        {item.needed > item.available && (
                          <Text fontSize="xs" color="red.500">
                            ขาดอีก {item.needed - item.available} ชิ้น
                          </Text>
                        )}
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  const renderBudget = (budget) => {
    if (!budget) return null;

    const shortagePercentage =
      budget.allocated > 0 ? (budget.shortage / budget.allocated) * 100 : 0;

    return (
      <Card w="full">
        <CardBody>
          <VStack align="start" spacing={3}>
            <Heading size="sm" color="brand.darkBlue">
              💰 สรุปงบประมาณ
            </Heading>

            <SimpleGrid columns={1} spacing={3} w="full">
              <Stat>
                <StatLabel>งบประมาณที่ได้รับ</StatLabel>
                <StatNumber color="green.600">
                  {formatCurrency(budget.allocated)}
                </StatNumber>
              </Stat>

              <Stat>
                <StatLabel>งบประมาณที่ขาด</StatLabel>
                <StatNumber color="red.600">
                  {formatCurrency(budget.shortage)}
                </StatNumber>
              </Stat>
            </SimpleGrid>

            {budget.allocated > 0 && (
              <Box w="full">
                <Text fontSize="sm" mb={2}>
                  ความต้องการงบประมาณ
                </Text>
                <Progress
                  value={100 - shortagePercentage}
                  colorScheme={
                    shortagePercentage > 50
                      ? "red"
                      : shortagePercentage > 25
                      ? "orange"
                      : "green"
                  }
                  size="md"
                  borderRadius="md"
                />
                <Text fontSize="xs" color="gray.600" mt={1}>
                  ได้รับแล้ว {(100 - shortagePercentage).toFixed(1)}%
                  จากความต้องการทั้งหมด
                </Text>
              </Box>
            )}

            {budget.sources && budget.sources.length > 0 && (
              <Box w="full">
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                  แหล่งงบประมาณ:
                </Text>
                <VStack align="start" spacing={1}>
                  {budget.sources.map((source, index) => (
                    <HStack key={index} justify="space-between" w="full">
                      <Text fontSize="sm">{source.name}</Text>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="green.600"
                      >
                        {formatCurrency(source.amount)}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  const renderSupportButton = () => {
    return (
      <Card w="full">
        <CardBody>
          <VStack align="center" spacing={3}>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              ต้องการสนับสนุนหมู่บ้านนี้เพิ่มเติม?
            </Text>
            <Button
              colorScheme="blue"
              size="md"
              w="full"
              onClick={handleSupportClick}
              leftIcon={<span>💬</span>}
            >
              ร่วมสนับสนุน
            </Button>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              แชทกับแอดมินเพื่อสอบถามรายละเอียดการสนับสนุน
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  const renderCommunityPlan = (plan) => {
    if (!plan) {
      return (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>ยังไม่มีแผนชุมชน!</AlertTitle>
            <AlertDescription fontSize="sm">
              หมู่บ้านนี้ยังไม่มีแผนจัดการไฟป่า ต้องการความช่วยเหลือในการวางแผน
            </AlertDescription>
          </Box>
        </Alert>
      );
    }

    return (
      <VStack align="start" spacing={4} w="full">
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>มีแผนชุมชนแล้ว!</AlertTitle>
            <AlertDescription fontSize="sm">
              หมู่บ้านนี้มีแผนจัดการไฟป่าที่ครอบคลุมและละเอียด
            </AlertDescription>
          </Box>
        </Alert>

        {plan.village_info && renderVillageInfo(plan.village_info)}
        {plan.fire_management &&
          renderFireManagementActivities(plan.fire_management)}
        {plan.equipment && renderEquipment(plan.equipment)}
        {plan.budget && renderBudget(plan.budget)}
        {plan.budget && renderSupportButton()}
      </VStack>
    );
  };

  const renderStatsOverview = () => {
    if (!stats) return null;

    return (
      <VStack align="start" spacing={4} w="full">
        <VStack spacing={4} textAlign="center" w="full">
          <Icon boxSize={isMobile ? 8 : 12} color="brand.orange">
            🗺️
          </Icon>
          <Box w={isMobile ? "120px" : "150px"} h="auto" mb={3}>
            <Image
              src="/logos/sidebar-logo.png"
              alt="Sidebar Logo"
              w="100%"
              h="auto"
              objectFit="contain"
              style={{
                filter: "brightness(1.1) contrast(1.1)",
                imageRendering: "auto",
              }}
            />
          </Box>
          <VStack spacing={2}>
            <Text
              fontSize={isMobile ? "md" : "lg"}
              fontWeight="semibold"
              color="brand.darkBlue"
            >
              หมู่บ้านทั้งหมดในเขตป่า
            </Text>
            <Text fontSize={isMobile ? "xs" : "sm"} color="gray.500">
              คลิกที่หมู่บ้านบนแผนที่เพื่อดูรายละเอียด
            </Text>
          </VStack>
        </VStack>

        <Card w="full">
          <CardBody>
            <VStack align="start" spacing={4}>
              <HStack spacing={2} align="center">
                <Image
                  src="/icons/vills-network.svg"
                  alt="Statistics Icon"
                  w="16px"
                  h="16px"
                  objectFit="contain"
                />
                <Heading size="sm" color="brand.darkBlue">
                  สรุปสถิติ
                </Heading>
              </HStack>

              <SimpleGrid columns={2} spacing={isMobile ? 3 : 4} w="full">
                <Stat textAlign="center">
                  <StatNumber
                    fontSize={isMobile ? "xl" : "2xl"}
                    color="brand.orange"
                  >
                    {stats.totalVillages}
                  </StatNumber>
                  <StatLabel
                    color="brand.darkBlue"
                    fontSize={isMobile ? "xs" : "sm"}
                  >
                    หมู่บ้านทั้งหมด
                  </StatLabel>
                </Stat>

                <Stat textAlign="center">
                  <StatNumber
                    fontSize={isMobile ? "xl" : "2xl"}
                    color="brand.green"
                  >
                    {stats.withPlan}
                  </StatNumber>
                  <StatLabel
                    color="brand.darkBlue"
                    fontSize={isMobile ? "xs" : "sm"}
                  >
                    มีแผนแล้ว
                  </StatLabel>
                </Stat>

                <Stat textAlign="center">
                  <StatNumber
                    fontSize={isMobile ? "xl" : "2xl"}
                    color="red.500"
                  >
                    {stats.withoutPlan}
                  </StatNumber>
                  <StatLabel
                    color="brand.darkBlue"
                    fontSize={isMobile ? "xs" : "sm"}
                  >
                    ยังไม่มีแผน
                  </StatLabel>
                </Stat>

                <Stat textAlign="center">
                  <StatNumber
                    fontSize={isMobile ? "xl" : "2xl"}
                    color="orange.500"
                  >
                    {stats.needVolunteers}
                  </StatNumber>
                  <StatLabel
                    color="brand.darkBlue"
                    fontSize={isMobile ? "xs" : "sm"}
                  >
                    ต้องการอาสา
                  </StatLabel>
                </Stat>
              </SimpleGrid>

              <Box w="full">
                <Stat textAlign="center">
                  <StatNumber
                    fontSize={isMobile ? "xl" : "2xl"}
                    color="purple.500"
                  >
                    {stats.needFunding}
                  </StatNumber>
                  <StatLabel
                    color="brand.darkBlue"
                    fontSize={isMobile ? "xs" : "sm"}
                  >
                    ต้องการงบประมาณ
                  </StatLabel>
                </Stat>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Card w="full">
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack spacing={2} align="center">
                <Image
                  src="/icons/vills-stats.svg"
                  alt="Progress Icon"
                  w="16px"
                  h="16px"
                  objectFit="contain"
                />
                <Heading size="sm" color="brand.darkBlue">
                  ความคืบหน้า
                </Heading>
              </HStack>

              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text
                    fontSize={isMobile ? "xs" : "sm"}
                    color="gray.600"
                    noOfLines={1}
                  >
                    หมู่บ้านที่มีแผน
                  </Text>
                  <Text
                    fontSize={isMobile ? "xs" : "sm"}
                    fontWeight="semibold"
                    color="brand.green"
                  >
                    {((stats.withPlan / stats.totalVillages) * 100).toFixed(1)}%
                  </Text>
                </HStack>
                <Progress
                  value={(stats.withPlan / stats.totalVillages) * 100}
                  colorScheme="green"
                  size={isMobile ? "sm" : "md"}
                  borderRadius="md"
                />
              </Box>

              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text
                    fontSize={isMobile ? "xs" : "sm"}
                    color="gray.600"
                    noOfLines={1}
                  >
                    หมู่บ้านที่ยังไม่มีแผน
                  </Text>
                  <Text
                    fontSize={isMobile ? "xs" : "sm"}
                    fontWeight="semibold"
                    color="orange.500"
                  >
                    {((stats.withoutPlan / stats.totalVillages) * 100).toFixed(
                      1
                    )}
                    %
                  </Text>
                </HStack>
                <Progress
                  value={(stats.withoutPlan / stats.totalVillages) * 100}
                  colorScheme="orange"
                  size={isMobile ? "sm" : "md"}
                  borderRadius="md"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Partner Logos */}
        <Box w="full" mt={6}>
          <VStack spacing={isMobile ? 3 : 4}>
            <Text
              fontSize={isMobile ? "xs" : "sm"}
              color="brand.muted"
              textAlign="center"
            >
              โดยความร่วมมือของ
            </Text>
            <HStack
              spacing={isMobile ? 4 : 6}
              justify="center"
              align="center"
              w="full"
            >
              <Box w={isMobile ? "40px" : "50px"} h="auto">
                <Image
                  src="/logos/logo-bconsil.svg"
                  alt="B.Consil Logo"
                  w="100%"
                  h="auto"
                  objectFit="contain"
                />
              </Box>
              <Box w={isMobile ? "80px" : "100px"} h="auto">
                <Image
                  src="/logos/logo-prachatham.svg"
                  alt="Prachatham Logo"
                  w="100%"
                  h="auto"
                  objectFit="contain"
                />
              </Box>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    );
  };

  // Mobile floating button
  const MobileToggleButton = () => (
    <IconButton
      icon={<ChevronUpIcon />}
      aria-label="เปิดรายละเอียดหมู่บ้าน"
      position="fixed"
      bottom={4}
      left={4}
      zIndex={1002}
      colorScheme="orange"
      size="lg"
      borderRadius="full"
      boxShadow="lg"
      onClick={onOpen}
      display={{ base: "flex", lg: "none" }}
    />
  );

  // Desktop sidebar content
  const SidebarContent = () => (
    <>
      {/* Header */}
      <Box
        pl={4}
        pr={2}
        pt={4}
        pb={4}
        borderBottom="1px"
        borderColor="gray.200"
        bg="white"
        position="sticky"
        top={0}
        zIndex={1001}
      >
        <HStack spacing={2} align="center" mb={2}>
          <Image
            src="/icons/vills-home.svg"
            alt="Village Details Icon"
            w="25px"
            h="25px"
            objectFit="contain"
          />
          <Heading
            size={isMobile ? "sm" : "md"}
            color="brand.darkBlue"
            noOfLines={1}
          >
            รายละเอียดหมู่บ้าน
          </Heading>
        </HStack>
        {village && (
          <VStack align="start" spacing={2}>
            <Text
              fontWeight="bold"
              fontSize={isMobile ? "2xl" : "4xl"}
              noOfLines={2}
            >
              {village.name}
            </Text>
            <Text
              fontSize={isMobile ? "xs" : "sm"}
              color="gray.600"
              noOfLines={2}
            >
              ตำบล{village.subdistrict} อำเภอ{village.district} จังหวัด
              {village.province}
            </Text>
            <Wrap spacing={1}>{getStatusBadges(village.status)}</Wrap>
          </VStack>
        )}
      </Box>

      {/* Content */}
      <Box pl={4} pr={2} pt={4} pb={4}>
        {!village ? (
          renderStatsOverview()
        ) : (
          <VStack align="start" spacing={4} w="full">
            <Box w="full">
              <HStack spacing={2} align="center" mb={3}>
                <Image
                  src="/icons/plan-icon.svg"
                  alt="Plan Icon"
                  w="16px"
                  h="16px"
                  objectFit="contain"
                />
                <Text fontWeight="bold" color="brand.darkBlue">
                  แผนชุมชน
                </Text>
              </HStack>
              {renderCommunityPlan(village.communityPlan)}
            </Box>
          </VStack>
        )}
      </Box>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        w={sidebarWidth}
        h="100vh"
        bg="white"
        borderRight="2px"
        borderColor="brand.orange"
        overflowY="auto"
        position="fixed"
        left={0}
        top={0}
        zIndex={1000}
        boxShadow="lg"
        display={{ base: "none", lg: "block" }}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent maxH="80vh">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={2} align="center">
              <Image
                src="/icons/vills-home.svg"
                alt="Village Details Icon"
                w="20px"
                h="20px"
                objectFit="contain"
              />
              <Text color="brand.darkBlue" fontSize="lg">
                รายละเอียดหมู่บ้าน
              </Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody overflowY="auto">
            {village && (
              <VStack align="start" spacing={3} mb={4}>
                <Text fontWeight="bold" fontSize="xl" noOfLines={2}>
                  {village.name}
                </Text>
                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                  ตำบล{village.subdistrict} อำเภอ{village.district} จังหวัด
                  {village.province}
                </Text>
                <Wrap spacing={1}>{getStatusBadges(village.status)}</Wrap>
              </VStack>
            )}

            {!village ? (
              renderStatsOverview()
            ) : (
              <VStack align="start" spacing={4} w="full">
                <Box w="full">
                  <Text fontWeight="bold" mb={3} color="brand.darkBlue">
                    📋 แผนชุมชน
                  </Text>
                  {renderCommunityPlan(village.communityPlan)}
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Mobile Toggle Button */}
      <MobileToggleButton />
    </>
  );
};

export default VillageDetailSidebar;
