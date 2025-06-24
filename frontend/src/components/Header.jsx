import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  VStack,
  Spacer,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Divider,
  Link,
  Badge,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { QuestionIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const Header = ({ onOpenWelcome }) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      bg="white"
      borderBottom="2px"
      borderColor="brand.orange"
      px={4}
      py={3}
      position="relative"
      zIndex={1000}
      boxShadow="sm"
    >
      <Flex align="center" maxW="container.xl" mx="auto">
        {/* Logo */}
        <Heading
          size={{ base: "sm", md: "md" }}
          color="brand.orange"
          fontWeight="bold"
          mr={4}
          cursor="pointer"
          onClick={() => navigate("/")}
          _hover={{
            opacity: 0.8,
            transform: "scale(1.05)",
          }}
          transition="all 0.2s"
          noOfLines={1}
        >
          🔥 Fire Fund | ชุมชนจัดการไฟป่า
        </Heading>

        <Spacer />

        {/* Desktop Navigation */}
        <HStack spacing={3} display={{ base: "none", md: "flex" }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/submit-plan")}
          >
            ส่งแผน
          </Button>

          {/* About Button */}
          <Button
            variant="outline"
            size="sm"
            borderColor="brand.accent"
            color="brand.accent"
            leftIcon={<span>ℹ️</span>}
            _hover={{
              bg: "brand.accent",
              color: "white",
              borderColor: "brand.accent",
            }}
            onClick={onOpenWelcome}
          >
            เกี่ยวกับ
          </Button>

          {/* Question/Info Button */}
          <IconButton
            aria-label="ข้อมูลแหล่งที่มาและการติดต่อ"
            icon={<QuestionIcon />}
            size="sm"
            variant="outline"
            borderColor="brand.muted"
            color="brand.accent"
            _hover={{
              bg: "brand.muted",
              color: "white",
              borderColor: "brand.muted",
            }}
            onClick={onOpen}
          />
        </HStack>

        {/* Mobile Navigation */}
        <HStack spacing={2} display={{ base: "flex", md: "none" }}>
          {/* Mobile Info Button */}
          <IconButton
            aria-label="ข้อมูลแหล่งที่มาและการติดต่อ"
            icon={<QuestionIcon />}
            size="sm"
            variant="outline"
            borderColor="brand.muted"
            color="brand.accent"
            _hover={{
              bg: "brand.muted",
              color: "white",
              borderColor: "brand.muted",
            }}
            onClick={onOpen}
          />

          {/* Mobile Menu Button */}
          <IconButton
            aria-label="เปิดเมนู"
            icon={<HamburgerIcon />}
            size="sm"
            variant="outline"
            borderColor="brand.primary"
            color="brand.primary"
            _hover={{
              bg: "brand.primary",
              color: "white",
              borderColor: "brand.primary",
            }}
            onClick={onDrawerOpen}
          />
        </HStack>
      </Flex>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={onDrawerClose}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" color="brand.accent">
            🔥 เมนู
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch" pt={4}>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  navigate("/submit-plan");
                  onDrawerClose();
                }}
                leftIcon={<span>📝</span>}
              >
                ส่งแผน
              </Button>

              <Button
                variant="outline"
                size="md"
                borderColor="brand.accent"
                color="brand.accent"
                leftIcon={<span>ℹ️</span>}
                _hover={{
                  bg: "brand.accent",
                  color: "white",
                  borderColor: "brand.accent",
                }}
                onClick={() => {
                  onOpenWelcome();
                  onDrawerClose();
                }}
              >
                เกี่ยวกับ
              </Button>
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onDrawerClose}>
              ปิด
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Information Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={isMobile ? "full" : "lg"}
        isCentered={!isMobile}
      >
        <ModalOverlay />
        <ModalContent mx={isMobile ? 0 : 4}>
          <ModalHeader
            color="brand.accent"
            fontSize={isMobile ? "lg" : "xl"}
            pb={isMobile ? 2 : 4}
          >
            📊 ข้อมูลแหล่งที่มาและการติดต่อ
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody px={isMobile ? 4 : 6} py={isMobile ? 4 : 6}>
            <VStack align="start" spacing={4}>
              {/* Data Sources Section */}
              <Box w="full">
                <Text
                  fontWeight="bold"
                  color="brand.accent"
                  mb={3}
                  fontSize={isMobile ? "md" : "lg"}
                >
                  🗂️ แหล่งข้อมูล
                </Text>
                <VStack align="start" spacing={isMobile ? 3 : 2}>
                  <Box>
                    <Text
                      fontSize={isMobile ? "xs" : "sm"}
                      fontWeight="semibold"
                      lineHeight="1.4"
                    >
                      ขอบเขตหมู่บ้าน แนวกันไฟ และพื้นที่เชื้อเพลิง
                    </Text>
                    <Text
                      fontSize={isMobile ? "2xs" : "xs"}
                      color="brand.muted"
                      mt={1}
                    >
                      มูลนิธิเพื่อการพัฒนาที่ยั่งยืน (ภาคเหนือ) : 2568
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize={isMobile ? "xs" : "sm"}
                      fontWeight="semibold"
                      lineHeight="1.4"
                    >
                      ชนิดป่าไม้
                    </Text>
                    <Text
                      fontSize={isMobile ? "2xs" : "xs"}
                      color="brand.muted"
                      mt={1}
                    >
                      กรมป่าไม้ กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม : 2561
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize={isMobile ? "xs" : "sm"}
                      fontWeight="semibold"
                      lineHeight="1.4"
                    >
                      อาคารบ้านเรือน
                    </Text>
                    <Text
                      fontSize={isMobile ? "2xs" : "xs"}
                      color="brand.muted"
                      mt={1}
                    >
                      Open Buildings โดย Google
                    </Text>
                  </Box>
                </VStack>
              </Box>

              <Divider />

              {/* Contact Section */}
              <Box w="full">
                <Text
                  fontWeight="bold"
                  color="brand.accent"
                  mb={3}
                  fontSize={isMobile ? "md" : "lg"}
                >
                  💬 ติดต่อเพื่อพัฒนาเว็บไซต์
                </Text>
                <VStack align="start" spacing={3}>
                  <Box>
                    <Text
                      fontSize={isMobile ? "xs" : "sm"}
                      fontWeight="semibold"
                      mb={2}
                      lineHeight="1.4"
                    >
                      หากมีข้อเสนะแนะหรือพบปัญหาการใช้งาน
                    </Text>
                    <VStack align="start" spacing={2}>
                      <HStack flexWrap="wrap" spacing={2}>
                        <Badge colorScheme="blue" size="sm">
                          📧 อีเมล
                        </Badge>
                        <Link
                          href="mailto:visarut298@gmail.com"
                          color="brand.primary"
                          fontSize={isMobile ? "xs" : "sm"}
                          _hover={{ textDecoration: "underline" }}
                          wordBreak="break-all"
                        >
                          visarut298@gmail.com
                        </Link>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box>
                    <Text
                      fontSize={isMobile ? "2xs" : "xs"}
                      color="brand.muted"
                      mt={2}
                      lineHeight="1.4"
                    >
                      ขอบคุณสำหรับความคิดเห็นและข้อเสนอแนะของคุณ
                      เราจะนำไปพัฒนาปรับปรุงเว็บไซต์ให้ดียิ่งขึ้น
                    </Text>
                  </Box>
                </VStack>
              </Box>

              <Divider />

              {/* Version/Credits */}
              <Box w="full">
                <Text
                  fontWeight="bold"
                  color="brand.accent"
                  mb={2}
                  fontSize={isMobile ? "md" : "lg"}
                >
                  🏷️ เกี่ยวกับเว็บไซต์
                </Text>
                <VStack align="start" spacing={isMobile ? 2 : 1}>
                  <Text
                    fontSize={isMobile ? "2xs" : "xs"}
                    color="brand.muted"
                    lineHeight="1.4"
                  >
                    เวอร์ชัน: 1.0.0
                  </Text>
                  <Text
                    fontSize={isMobile ? "2xs" : "xs"}
                    color="brand.muted"
                    lineHeight="1.4"
                  >
                    พัฒนาโดย{" "}
                    <Link
                      href="https://visarutsankham.com/"
                      isExternal
                      color="brand.primary"
                      _hover={{ textDecoration: "underline" }}
                    >
                      วิศรุต แสนคำ
                    </Link>
                  </Text>
                  <Text
                    fontSize={isMobile ? "2xs" : "xs"}
                    color="brand.muted"
                    lineHeight="1.4"
                  >
                    © 2024 แพลตฟอร์มไอเดียชุมชนจัดการไฟป่า
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter px={isMobile ? 4 : 6} py={isMobile ? 4 : 6}>
            <Button
              colorScheme="gray"
              size={isMobile ? "md" : "sm"}
              onClick={onClose}
              w={isMobile ? "full" : "auto"}
            >
              ปิด
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Header;
