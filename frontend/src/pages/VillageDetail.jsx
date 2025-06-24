import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { getVillageById } from "../data/villageDataService";

const VillageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const village = getVillageById(id);

  if (!village) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={4}>
          <Heading color="brand.darkBlue">ไม่พบข้อมูลหมู่บ้าน</Heading>
          <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate("/")}>
            กลับหน้าแรก
          </Button>
        </VStack>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    if (status.hasPlan) return "green";
    if (status.needsVolunteers && status.needsFunding) return "red";
    if (status.needsVolunteers) return "orange";
    if (status.needsFunding) return "purple";
    return "gray";
  };

  return (
    <Box bg="white" minH="100vh">
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Breadcrumb */}
          <Breadcrumb
            spacing="8px"
            separator={<ChevronRightIcon color="gray.500" />}
          >
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => navigate("/")}
                color="brand.orange"
              >
                🔥 ไฟป๋อดี
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink color="brand.darkBlue">
                {village.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Back Button */}
          <HStack>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="outline"
              borderColor="brand.orange"
              color="brand.orange"
              onClick={() => navigate("/")}
            >
              กลับแผนที่
            </Button>
          </HStack>

          {/* Village Header */}
          <Box>
            <Heading size="2xl" color="brand.darkBlue" mb={4}>
              {village.name}
            </Heading>
            <HStack spacing={3} mb={4}>
              {village.status.hasPlan ? (
                <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                  ✅ มีแผนจัดการไฟป่าแล้ว
                </Badge>
              ) : (
                <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                  ❌ ยังไม่มีแผนจัดการไฟป่า
                </Badge>
              )}

              {village.status.needsVolunteers && (
                <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
                  🔧 ต้องการอาสาสมัคร
                </Badge>
              )}

              {village.status.needsFunding && (
                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                  💰 ต้องการงบประมาณ
                </Badge>
              )}
            </HStack>
            <Text fontSize="lg" color="gray.600">
              ตำบล{village.subdistrict} อำเภอ{village.district} จังหวัด
              {village.province}
            </Text>

            {village.communityPlan && (
              <Text color="green.600" fontWeight="semibold">
                มีแผนชุมชนจัดการไฟป่าแล้ว
              </Text>
            )}
          </Box>

          <Divider />

          {/* Village Info Cards */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="brand.darkBlue">
                    📊 ข้อมูลหมู่บ้าน
                  </Heading>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Text fontWeight="bold">รหัสหมู่:</Text>
                      <Text>หมู่ {village.gisData.mooCode || "ไม่ระบุ"}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold">พิกัด:</Text>
                      <Text>
                        {village.lat.toFixed(4)}, {village.lng.toFixed(4)}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold">สถานะ:</Text>
                      <Badge colorScheme={getStatusColor(village.status)}>
                        {village.status.hasPlan
                          ? "พร้อมรับมือไฟป่า"
                          : "ต้องการความช่วยเหลือ"}
                      </Badge>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="brand.darkBlue">
                    🎯 การดำเนินการ
                  </Heading>
                  <VStack align="stretch" spacing={3}>
                    {village.status.hasPlan ? (
                      <Button variant="secondary" size="sm">
                        📋 ดูแผนจัดการไฟป่า
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm">
                        📝 ส่งแผนจัดการไฟป่า
                      </Button>
                    )}

                    {village.status.needsVolunteers && (
                      <Button variant="outline" colorScheme="orange" size="sm">
                        🙋‍♂️ สมัครเป็นอาสาสมัคร
                      </Button>
                    )}

                    {village.status.needsFunding && (
                      <Button variant="outline" colorScheme="purple" size="sm">
                        💝 ร่วมสนับสนุนงบประมาณ
                      </Button>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Additional Info */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md" color="brand.darkBlue">
                  📝 รายละเอียดเพิ่มเติม
                </Heading>
                <Text>
                  หมู่บ้าน{village.name} เป็นหนึ่งในชุมชนที่เข้าร่วมแพลตฟอร์ม
                  "ไฟป๋อดี: ไอเดียชุมชน จัดการไฟป่า"
                  เพื่อร่วมกันสร้างเครือข่ายการจัดการไฟป่าแบบชุมชน
                  ตั้งอยู่ในตำบล{village.subdistrict} อำเภอ{village.district}
                </Text>
                <Text>
                  🌍 <strong>วิสัยทัศน์:</strong> ชุมชนที่เข้มแข็ง
                  ป้องกันไฟป่าได้อย่างยั่งยืน
                </Text>
                <Text>
                  🤝 <strong>เป้าหมาย:</strong>{" "}
                  สร้างแผนจัดการไฟป่าที่เหมาะสมกับบริบทของแต่ละพื้นที่
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default VillageDetail;
