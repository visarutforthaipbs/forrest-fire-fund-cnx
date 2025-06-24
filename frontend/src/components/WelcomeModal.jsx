import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Box,
  Heading,
  Icon,
  SimpleGrid,
  Badge,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CheckCircleIcon, InfoIcon, WarningIcon } from "@chakra-ui/icons";

const WelcomeModal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useImperativeHandle(ref, () => ({
    openModal: () => setIsOpen(true),
  }));

  useEffect(() => {
    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      // Delay showing modal slightly for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark that user has seen the welcome modal
    localStorage.setItem("hasSeenWelcome", "true");
  };

  const features = [
    {
      icon: "🗺️",
      title: "แผนที่ชุมชน",
      description: "ดูข้อมูลหมู่บ้านทั้ง 1,171 หมู่บ้านในจังหวัดเชียงใหม่",
      color: "blue.500",
    },
    {
      icon: "📝",
      title: "ส่งแผนการจัดการ",
      description: "หมู่บ้านสามารถส่งแผนการจัดการไฟป่าของชุมชน",
      color: "orange.500",
    },
    {
      icon: "📊",
      title: "ติดตามสถิติ",
      description: "ดูสถิติหมู่บ้านที่มีแผนและต้องการความช่วยเหลือ",
      color: "green.500",
    },
    {
      icon: "🔍",
      title: "ค้นหาและกรอง",
      description: "ค้นหาหมู่บ้านตามเกณฑ์ต่างๆ เช่า สถานะแผน ความต้องการ",
      color: "purple.500",
    },
  ];

  const legendItems = [
    { color: "#4CAF50", label: "มีแผนแล้ว", count: "20" },
    { color: "#F47B20", label: "ยังไม่มีแผน", count: "1,151" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={isMobile ? "full" : "2xl"}
      isCentered={!isMobile}
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        mx={isMobile ? 0 : 4}
        my={isMobile ? 0 : 8}
        maxH={isMobile ? "100vh" : "90vh"}
        overflowY="auto"
      >
        <ModalHeader
          bg="linear-gradient(135deg, #F47B20 0%, #FF8C42 100%)"
          color="white"
          borderTopRadius="md"
          py={6}
        >
          <VStack spacing={3} align="center">
            <Box fontSize="3xl">🔥</Box>
            <Heading size="lg" textAlign="center">
              ยินดีต้อนรับสู่แพลตฟอร์มจัดการไฟป่าชุมชน
            </Heading>
          </VStack>
        </ModalHeader>
        <ModalCloseButton color="white" size="lg" />

        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Platform Introduction */}
            <Box>
              <Text fontSize="lg" color="brand.accent" lineHeight="tall">
                แพลตฟอร์มนี้เป็นระบบสารสนเทศเพื่อการจัดการไฟป่าในชุมชน
                ที่รวบรวมข้อมูลหมู่บ้านทั้ง{" "}
                <Badge colorScheme="orange" fontSize="md">
                  1,171 หมู่บ้าน
                </Badge>{" "}
                ในจังหวัดเชียงใหม่ พร้อมระบบติดตามแผนการจัดการไฟป่าของชุมชน
              </Text>
            </Box>

            <Divider />

            {/* Key Features */}
            <Box>
              <Heading size="md" mb={4} color="brand.accent">
                ✨ ฟีเจอร์หลัก
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {features.map((feature, index) => (
                  <Box
                    key={index}
                    p={4}
                    borderRadius="lg"
                    border="1px"
                    borderColor="gray.200"
                    bg="brand.cardBg"
                    _hover={{ shadow: "md", borderColor: "brand.primary" }}
                    transition="all 0.2s"
                  >
                    <HStack spacing={3} align="start">
                      <Box fontSize="2xl">{feature.icon}</Box>
                      <VStack align="start" spacing={1} flex="1">
                        <Text fontWeight="bold" color="brand.accent">
                          {feature.title}
                        </Text>
                        <Text fontSize="sm" color="brand.muted">
                          {feature.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Legend */}
            <Box>
              <Heading size="md" mb={4} color="brand.accent">
                🎨 สัญลักษณ์บนแผนที่
              </Heading>
              <VStack spacing={3} align="stretch">
                {legendItems.map((item, index) => (
                  <HStack
                    key={index}
                    justify="space-between"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <HStack spacing={3}>
                      <Box
                        w={4}
                        h={4}
                        bg={item.color}
                        borderRadius="sm"
                        boxShadow="sm"
                      />
                      <Text fontWeight="medium" color="brand.accent">
                        {item.label}
                      </Text>
                    </HStack>
                    <Badge colorScheme="gray" fontSize="sm">
                      {item.count} หมู่บ้าน
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Divider />

            {/* How to Use */}
            <Box>
              <Heading size="md" mb={4} color="brand.accent">
                🚀 วิธีการใช้งาน
              </Heading>
              <VStack spacing={3} align="stretch">
                <HStack align="start" spacing={3}>
                  <Icon as={InfoIcon} color="blue.500" mt={1} />
                  <Text color="brand.accent">
                    <strong>ดูข้อมูลหมู่บ้าน:</strong>{" "}
                    คลิกที่หมู่บ้านบนแผนที่เพื่อดูรายละเอียด
                  </Text>
                </HStack>
                <HStack align="start" spacing={3}>
                  <Icon as={CheckCircleIcon} color="green.500" mt={1} />
                  <Text color="brand.accent">
                    <strong>ส่งแผน:</strong>{" "}
                    หมู่บ้านสามารถส่งแผนการจัดการไฟป่าผ่านปุ่ม "ส่งแผน"
                  </Text>
                </HStack>
                <HStack align="start" spacing={3}>
                  <Icon as={WarningIcon} color="orange.500" mt={1} />
                  <Text color="brand.accent">
                    <strong>ติดตามสถิติ:</strong>{" "}
                    ดูสถิติการมีแผนและความต้องการช่วยเหลือทางด้านซ้าย
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Data Source */}
            <Box
              p={4}
              bg="blue.50"
              borderRadius="lg"
              border="1px"
              borderColor="blue.200"
            >
              <Text fontSize="sm" color="blue.800">
                <strong>💡 ข้อมูลอ้างอิง:</strong>{" "}
                ข้อมูลพื้นที่หมู่บ้านจากกรมการปกครอง
                และข้อมูลแผนการจัดการไฟป่าจากชุมชนท้องถิ่น
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.50" borderBottomRadius="md">
          <VStack spacing={3} w="full">
            <Button
              variant="primary"
              size="lg"
              w="full"
              onClick={handleClose}
              _hover={{
                bg: "brand.primary",
                transform: "translateY(-1px)",
                shadow: "lg",
              }}
            >
              เริ่มใช้งานแพลตฟอร์ม 🚀
            </Button>
            <Text fontSize="xs" color="brand.muted" textAlign="center">
              หน้าต่างนี้จะไม่แสดงอีกครั้งหลังจากปิด
            </Text>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

WelcomeModal.displayName = "WelcomeModal";

export default WelcomeModal;
