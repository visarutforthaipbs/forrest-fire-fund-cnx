import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  VStack,
  HStack,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  FaMoneyBillWave,
  FaTools,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import Header from "../components/Header";

const Support = () => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [supportType, setSupportType] = useState("money");
  const [supportForm, setSupportForm] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    equipment: "",
    quantity: 1,
    message: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchVillagesWithPlans();
  }, []);

  const fetchVillagesWithPlans = async () => {
    try {
      // For now, let's use mock data based on the community plan structure
      // In the future, this should fetch from the actual API
      const mockVillagesWithPlans = [
        {
          uid: "village_1746714956290",
          name: "บ้านกาดฮาว",
          district: "แม่ริม",
          communityPlan: {
            village_info: {
              population: 1011,
            },
            budget: {
              allocated: 71000,
              shortage: 46000,
            },
            equipment: [
              { name: "เครื่องเป่าลม", available: 3, needed: 3 },
              { name: "รองเท้า", available: 0, needed: 11 },
              { name: "เสื้อ", available: 0, needed: 11 },
              { name: "หมวก", available: 0, needed: 11 },
              { name: "มีดใหญ่", available: 0, needed: 11 },
              { name: "วิทยุสื่อสาร", available: 0, needed: 11 },
            ],
          },
        },
        {
          uid: "village_1746718127249",
          name: "บ้านห้วยส้มสุก",
          district: "แม่ริม",
          communityPlan: {
            village_info: {
              population: null,
            },
            budget: {
              allocated: 110000,
              shortage: 76000,
            },
            equipment: [
              { name: "น้ำมันเชื้อเพลิง", available: 0, needed: 3000 },
              { name: "ค่าอาหาร", available: 0, needed: 2500 },
              { name: "น้ำ", available: 0, needed: 1000 },
              { name: "น้ำมันเครื่อง", available: 0, needed: 200 },
            ],
          },
        },
        {
          uid: "village_1746718798860",
          name: "บ้านเมืองก๊ะ",
          district: "แม่ริม",
          communityPlan: {
            village_info: {
              population: null,
            },
            budget: {
              allocated: 83000,
              shortage: 59000,
            },
            equipment: [
              { name: "เครื่องเป่าลม", available: 7, needed: 2 },
              { name: "น้ำมันเชื้อเพลิง 4 แกลลอน", available: 0, needed: 3000 },
              { name: "เป้น้ำดื่ม", available: 0, needed: 10 },
              { name: "วิทยุสื่อสาร", available: 0, needed: 6 },
              { name: "เครื่องตัดหญ้า", available: 0, needed: 2 },
            ],
          },
        },
        {
          uid: "village_1746721289737",
          name: "บ้านจอมแจ้ง",
          district: "สันป่าตอง",
          communityPlan: {
            village_info: {
              population: 433,
            },
            budget: {
              allocated: 110000,
              shortage: 46000,
            },
            equipment: [
              { name: "เครื่องเป่าลม", available: 3, needed: 2 },
              { name: "เครื่องตัดหญ้า", available: 2, needed: 2 },
              { name: "รองเท้าดับไฟป่า(บูท)", available: 0, needed: 16 },
              { name: "เครื่องพ่นน้ำ", available: 3, needed: 2 },
            ],
          },
        },
        {
          uid: "village_1746773300491",
          name: "บ้านหนองห้า",
          district: "สันป่าตอง",
          communityPlan: {
            village_info: {
              population: 473,
            },
            budget: {
              allocated: 83000,
              shortage: 21500,
            },
            equipment: [
              { name: "เครื่องตัดหญ้า", available: 1, needed: 2 },
              { name: "เครื่องเป่าลม", available: 1, needed: 2 },
              { name: "เป้ใส่น้ำดื่ม", available: 0, needed: 10 },
              { name: "เลื่อยยนต์", available: 0, needed: 2 },
              { name: "หลอดไฟโซลาเซลล์", available: 0, needed: 2 },
            ],
          },
        },
      ];

      setVillages(mockVillagesWithPlans);
    } catch (error) {
      console.error("Error fetching villages:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลหมู่บ้านได้",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSupportClick = (village) => {
    setSelectedVillage(village);
    onOpen();
  };

  const handleSupportSubmit = async () => {
    try {
      const supportData = {
        villageId: selectedVillage.uid,
        villageName: selectedVillage.name,
        supportType,
        donorInfo: {
          name: supportForm.donorName,
          email: supportForm.donorEmail,
          phone: supportForm.donorPhone,
        },
        support:
          supportType === "money"
            ? {
                amount: parseFloat(supportForm.amount),
                message: supportForm.message,
              }
            : {
                equipment: supportForm.equipment,
                quantity: supportForm.quantity,
                message: supportForm.message,
              },
        submittedAt: new Date().toISOString(),
      };

      // Send to backend API
      const response = await fetch("http://localhost:3001/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supportData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit support request");
      }

      toast({
        title: "ส่งข้อมูลสำเร็จ!",
        description: `ขอบคุณสำหรับการสนับสนุน${selectedVillage.name}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setSupportForm({
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        amount: "",
        equipment: "",
        quantity: 1,
        message: "",
      });

      onClose();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อมูลการสนับสนุนได้",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatBudget = (amount) => {
    return new Intl.NumberFormat("th-TH").format(amount);
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.orange" />
            <Text>กำลังโหลดข้อมูลหมู่บ้าน...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Header />

      {/* Hero Section */}
      <Box
        bg="brand.accent"
        color="white"
        py={12}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: "linear(to-r, brand.accent, brand.primary)",
          opacity: 0.9,
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={6} textAlign="center">
            <Heading size="xl" color="white">
              ร่วมสนับสนุนชุมชน
            </Heading>
            <Text fontSize="lg" maxW="2xl" color="white" opacity={0.9}>
              ร่วมมือกันป้องกันไฟป่า สนับสนุนชุมชนที่มีแผนการจัดการไฟป่าแล้ว
              ด้วยเงินทุนหรืออุปกรณ์ที่จำเป็น
            </Text>
            <HStack spacing={8} pt={4}>
              <VStack spacing={3}>
                <Box
                  p={4}
                  bg="whiteAlpha.200"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                >
                  <Icon as={FaMoneyBillWave} boxSize={8} color="white" />
                </Box>
                <Text fontWeight="bold" color="white">
                  สนับสนุนเงินทุน
                </Text>
              </VStack>
              <VStack spacing={3}>
                <Box
                  p={4}
                  bg="whiteAlpha.200"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                >
                  <Icon as={FaTools} boxSize={8} color="white" />
                </Box>
                <Text fontWeight="bold" color="white">
                  บริจาคอุปกรณ์
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Villages Grid */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="lg" mb={2} color="brand.accent">
              หมู่บ้านที่ต้องการความช่วยเหลือ
            </Heading>
            <Text color="brand.muted">
              {villages.length} หมู่บ้านที่มีแผนการจัดการไฟป่าแล้ว
              และต้องการการสนับสนุน
            </Text>
          </Box>

          {villages.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              ยังไม่มีหมู่บ้านที่ต้องการการสนับสนุนในขณะนี้
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {villages.map((village) => (
                <Card
                  key={village.uid || village.id}
                  variant="outline"
                  _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  <CardHeader pb={2}>
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" w="full">
                        <Heading size="md" color="brand.primary">
                          {village.name}
                        </Heading>
                        <Badge colorScheme="green">มีแผน</Badge>
                      </HStack>
                      <HStack color="brand.muted" fontSize="sm">
                        <Icon as={FaMapMarkerAlt} />
                        <Text>{village.district}</Text>
                      </HStack>
                      <HStack color="brand.muted" fontSize="sm">
                        <Icon as={FaUsers} />
                        <Text>
                          ประชากร:{" "}
                          {village.communityPlan?.village_info?.population ||
                            "ไม่ระบุ"}{" "}
                          คน
                        </Text>
                      </HStack>
                    </VStack>
                  </CardHeader>

                  <CardBody pt={0}>
                    <VStack align="start" spacing={3}>
                      {/* Budget Needs */}
                      {village.communityPlan?.budget && (
                        <Box w="full">
                          <Text fontWeight="semibold" fontSize="sm" mb={1}>
                            งบประมาณที่ต้องการ:
                          </Text>
                          <Text color="red.500" fontWeight="bold">
                            ฿
                            {formatBudget(
                              village.communityPlan.budget.shortage || 0
                            )}
                          </Text>
                          <Text fontSize="xs" color="brand.muted">
                            (ขาดแคลน{" "}
                            {formatBudget(
                              village.communityPlan.budget.shortage || 0
                            )}{" "}
                            บาท)
                          </Text>
                        </Box>
                      )}

                      {/* Equipment Needs */}
                      {village.communityPlan?.equipment && (
                        <Box w="full">
                          <Text fontWeight="semibold" fontSize="sm" mb={1}>
                            อุปกรณ์ที่ต้องการ:
                          </Text>
                          <List spacing={1} fontSize="sm">
                            {village.communityPlan.equipment
                              .filter((item) => item.needed > item.available)
                              .slice(0, 3)
                              .map((item, index) => (
                                <ListItem key={index}>
                                  <ListIcon
                                    as={FaCheckCircle}
                                    color="orange.500"
                                  />
                                  {item.name}: ต้องการ{" "}
                                  {item.needed - item.available} ชิ้น
                                </ListItem>
                              ))}
                          </List>
                        </Box>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        w="full"
                        onClick={() => handleSupportClick(village)}
                      >
                        ช่วยเหลือหมู่บ้านนี้
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      {/* Support Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>สนับสนุน{selectedVillage?.name}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Tabs value={supportType} onChange={setSupportType}>
              <TabList>
                <Tab onClick={() => setSupportType("money")}>
                  <HStack>
                    <Icon as={FaMoneyBillWave} />
                    <Text>สนับสนุนเงินทุน</Text>
                  </HStack>
                </Tab>
                <Tab onClick={() => setSupportType("equipment")}>
                  <HStack>
                    <Icon as={FaTools} />
                    <Text>บริจาคอุปกรณ์</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Money Support */}
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="semibold" mb={2}>
                        งบประมาณที่ต้องการ:
                      </Text>
                      <Text fontSize="lg" color="red.500" fontWeight="bold">
                        ฿
                        {formatBudget(
                          selectedVillage?.communityPlan?.budget?.shortage || 0
                        )}
                      </Text>
                    </Box>

                    <Divider />

                    <FormControl isRequired>
                      <FormLabel>ชื่อผู้บริจาค</FormLabel>
                      <Input
                        value={supportForm.donorName}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            donorName: e.target.value,
                          })
                        }
                        placeholder="กรุณาระบุชื่อ"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>อีเมล</FormLabel>
                      <Input
                        type="email"
                        value={supportForm.donorEmail}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            donorEmail: e.target.value,
                          })
                        }
                        placeholder="example@email.com"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>เบอร์โทรศัพท์</FormLabel>
                      <Input
                        value={supportForm.donorPhone}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            donorPhone: e.target.value,
                          })
                        }
                        placeholder="08X-XXX-XXXX"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>จำนวนเงินที่ต้องการบริจาค (บาท)</FormLabel>
                      <NumberInput min={100}>
                        <NumberInputField
                          value={supportForm.amount}
                          onChange={(e) =>
                            setSupportForm({
                              ...supportForm,
                              amount: e.target.value,
                            })
                          }
                          placeholder="1,000"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>ข้อความ (ถ้ามี)</FormLabel>
                      <Textarea
                        value={supportForm.message}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            message: e.target.value,
                          })
                        }
                        placeholder="ข้อความสำหรับชุมชน..."
                        rows={3}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* Equipment Support */}
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="semibold" mb={2}>
                        อุปกรณ์ที่ต้องการ:
                      </Text>
                      <List spacing={2}>
                        {selectedVillage?.communityPlan?.equipment &&
                          selectedVillage.communityPlan.equipment
                            .filter((item) => item.needed > item.available)
                            .map((item, index) => (
                              <ListItem key={index}>
                                <ListIcon
                                  as={FaCheckCircle}
                                  color="orange.500"
                                />
                                {item.name}: ต้องการ{" "}
                                {item.needed - item.available} ชิ้น
                              </ListItem>
                            ))}
                      </List>
                    </Box>

                    <Divider />

                    <FormControl isRequired>
                      <FormLabel>ชื่อผู้บริจาค</FormLabel>
                      <Input
                        value={supportForm.donorName}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            donorName: e.target.value,
                          })
                        }
                        placeholder="กรุณาระบุชื่อ"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>อีเมล</FormLabel>
                      <Input
                        type="email"
                        value={supportForm.donorEmail}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            donorEmail: e.target.value,
                          })
                        }
                        placeholder="example@email.com"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>เบอร์โทรศัพท์</FormLabel>
                      <Input
                        value={supportForm.donorPhone}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            donorPhone: e.target.value,
                          })
                        }
                        placeholder="08X-XXX-XXXX"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>อุปกรณ์ที่ต้องการบริจาค</FormLabel>
                      <Select
                        value={supportForm.equipment}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            equipment: e.target.value,
                          })
                        }
                        placeholder="เลือกอุปกรณ์"
                      >
                        {selectedVillage?.communityPlan?.equipment &&
                          selectedVillage.communityPlan.equipment
                            .filter((item) => item.needed > item.available)
                            .map((item, index) => (
                              <option key={index} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>จำนวน</FormLabel>
                      <NumberInput min={1} value={supportForm.quantity}>
                        <NumberInputField
                          onChange={(e) =>
                            setSupportForm({
                              ...supportForm,
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>ข้อความ (ถ้ามี)</FormLabel>
                      <Textarea
                        value={supportForm.message}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            message: e.target.value,
                          })
                        }
                        placeholder="ข้อความสำหรับชุมชน..."
                        rows={3}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              onClick={handleSupportSubmit}
              isDisabled={
                !supportForm.donorName ||
                !supportForm.donorEmail ||
                (supportType === "money" && !supportForm.amount) ||
                (supportType === "equipment" && !supportForm.equipment)
              }
            >
              ส่งข้อมูลการสนับสนุน
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Support;
