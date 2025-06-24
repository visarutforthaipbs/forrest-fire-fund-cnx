import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  Button,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Divider,
  Badge,
  IconButton,
  Alert,
  AlertIcon,
  Progress,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, CalendarIcon } from "@chakra-ui/icons";
import { useState } from "react";
import Header from "../components/Header";

const SubmitPlan = () => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    village_info: {
      name: "",
      moo: "",
      subdistrict: "",
      district: "",
      province: "เชียงใหม่",
      coordinates: { lat: "", lng: "" },
      population: "",
      households: "",
      area: { forest_managed_rai: "" },
      forest_types: [],
      problems: {
        causes: "",
        risk_area: "",
        limitations: "",
      },
      main_occupations: [],
    },
    fire_management: {
      pre_incident: [],
      during_incident: [],
      post_incident: [],
    },
    equipment: [],
    budget: {
      allocated: "",
      shortage: "",
      sources: [],
    },
  });

  const forestTypeOptions = [
    "ป่าเบญจพรรณ",
    "ป่าเต็งรัง",
    "ป่าดิบแล้ง",
    "ป่าดิบชื้น",
    "ป่าสน",
    "ป่าไผ่",
    "ป่าชายเลน",
    "ป่าพรุ",
  ];

  const occupationOptions = [
    "เกษตร:พืชไร่",
    "เกษตร:พืชสวน",
    "เกษตร:ปศุสัตว์",
    "หาของป่า",
    "รับจ้าง",
    "ค้าขาย/ผู้ประกอบการ",
    "ข้าราชการ",
    "พนักงานเอกชน",
  ];

  const equipmentOptions = [
    "เครื่องเป่าลม",
    "รองเท้า",
    "เสื้อ",
    "หมวก",
    "มีดใหญ่",
    "เลื่อยยนต์",
    "วิทยุสื่อสาร",
    "ถังน้ำ",
    "สายฉีดน้ำ",
    "คราดมือเสือ",
  ];

  const handleInputChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      const newData = { ...prev };
      if (index !== null) {
        if (!newData[section]) newData[section] = [];
        newData[section][index] = {
          ...newData[section][index],
          [field]: value,
        };
      } else if (section && field) {
        if (field.includes(".")) {
          const [parentField, childField] = field.split(".");
          if (!newData[section][parentField])
            newData[section][parentField] = {};
          newData[section][parentField][childField] = value;
        } else {
          newData[section][field] = value;
        }
      } else {
        newData[field] = value;
      }
      return newData;
    });
  };

  const addActivity = (timing) => {
    const newActivity = {
      id: Date.now(),
      name: "",
      description: "",
      period: "",
      budget: 0,
      budget_items: [{ description: "", amount: 0 }],
      timing: timing,
    };
    setFormData((prev) => ({
      ...prev,
      fire_management: {
        ...prev.fire_management,
        [timing]: [...prev.fire_management[timing], newActivity],
      },
    }));
  };

  const removeActivity = (timing, index) => {
    setFormData((prev) => ({
      ...prev,
      fire_management: {
        ...prev.fire_management,
        [timing]: prev.fire_management[timing].filter((_, i) => i !== index),
      },
    }));
  };

  const addBudgetItem = (timing, activityIndex) => {
    setFormData((prev) => {
      const newData = { ...prev };
      newData.fire_management[timing][activityIndex].budget_items.push({
        description: "",
        amount: 0,
      });
      return newData;
    });
  };

  const addEquipment = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, { name: "", available: 0, needed: 0 }],
    }));
  };

  const addBudgetSource = () => {
    setFormData((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        sources: [...prev.budget.sources, { name: "", amount: 0 }],
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log("Submitting form data:", formData);

      // Submit to API
      const response = await fetch(
        "http://localhost:3001/api/community-plans",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit plan");
      }

      toast({
        title: "ส่งแผนสำเร็จ!",
        description: `แผนจัดการไฟป่าของ${
          formData.village_info.name
        }ได้รับการบันทึกแล้ว รหัสอ้างอิง: ${result.data.id.slice(-8)}`,
        status: "success",
        duration: 8000,
        isClosable: true,
      });

      // Reset form after successful submission
      setFormData({
        village_info: {
          name: "",
          moo: "",
          subdistrict: "",
          district: "",
          province: "เชียงใหม่",
          coordinates: { lat: "", lng: "" },
          population: "",
          households: "",
          area: { forest_managed_rai: "" },
          forest_types: [],
          problems: {
            causes: "",
            risk_area: "",
            limitations: "",
          },
          main_occupations: [],
        },
        fire_management: {
          pre_incident: [],
          during_incident: [],
          post_incident: [],
        },
        equipment: [],
        budget: {
          allocated: "",
          shortage: "",
          sources: [],
        },
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งแผนได้ กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVillageInfoForm = () => (
    <Card>
      <CardHeader>
        <Heading size="md" color="brand.darkBlue">
          📍 ข้อมูลหมู่บ้าน
        </Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
            <FormControl isRequired>
              <FormLabel>ชื่อหมู่บ้าน</FormLabel>
              <Input
                value={formData.village_info.name}
                onChange={(e) =>
                  handleInputChange("village_info", "name", e.target.value)
                }
                placeholder="เช่น บ้านกาดฮาว"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>หมู่ที่</FormLabel>
              <Input
                value={formData.village_info.moo}
                onChange={(e) =>
                  handleInputChange("village_info", "moo", e.target.value)
                }
                placeholder="เช่น 4"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>ตำบล</FormLabel>
              <Input
                value={formData.village_info.subdistrict}
                onChange={(e) =>
                  handleInputChange(
                    "village_info",
                    "subdistrict",
                    e.target.value
                  )
                }
                placeholder="เช่น สะลวง"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>อำเภอ</FormLabel>
              <Input
                value={formData.village_info.district}
                onChange={(e) =>
                  handleInputChange("village_info", "district", e.target.value)
                }
                placeholder="เช่น แม่ริม"
              />
            </FormControl>

            <FormControl>
              <FormLabel>ประชากร (คน)</FormLabel>
              <NumberInput>
                <NumberInputField
                  value={formData.village_info.population}
                  onChange={(e) =>
                    handleInputChange(
                      "village_info",
                      "population",
                      parseInt(e.target.value) || ""
                    )
                  }
                  placeholder="เช่น 1011"
                />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>จำนวนครัวเรือน</FormLabel>
              <NumberInput>
                <NumberInputField
                  value={formData.village_info.households}
                  onChange={(e) =>
                    handleInputChange(
                      "village_info",
                      "households",
                      parseInt(e.target.value) || ""
                    )
                  }
                  placeholder="เช่น 334"
                />
              </NumberInput>
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel>พื้นที่ป่าที่ดูแล (ไร่)</FormLabel>
            <NumberInput>
              <NumberInputField
                value={formData.village_info.area.forest_managed_rai}
                onChange={(e) =>
                  handleInputChange(
                    "village_info",
                    "area.forest_managed_rai",
                    parseInt(e.target.value) || ""
                  )
                }
                placeholder="เช่น 1104"
              />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>ประเภทป่า</FormLabel>
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
              {forestTypeOptions.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={
                    formData.village_info.forest_types.includes(type)
                      ? "solid"
                      : "outline"
                  }
                  colorScheme={
                    formData.village_info.forest_types.includes(type)
                      ? "green"
                      : "gray"
                  }
                  onClick={() => {
                    const currentTypes = formData.village_info.forest_types;
                    const newTypes = currentTypes.includes(type)
                      ? currentTypes.filter((t) => t !== type)
                      : [...currentTypes, type];
                    handleInputChange("village_info", "forest_types", newTypes);
                  }}
                >
                  {type}
                </Button>
              ))}
            </SimpleGrid>
          </FormControl>

          <FormControl>
            <FormLabel>อาชีพหลักของชุมชน</FormLabel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
              {occupationOptions.map((occupation) => (
                <Button
                  key={occupation}
                  size="sm"
                  variant={
                    formData.village_info.main_occupations.includes(occupation)
                      ? "solid"
                      : "outline"
                  }
                  colorScheme={
                    formData.village_info.main_occupations.includes(occupation)
                      ? "blue"
                      : "gray"
                  }
                  onClick={() => {
                    const currentOccupations =
                      formData.village_info.main_occupations;
                    const newOccupations = currentOccupations.includes(
                      occupation
                    )
                      ? currentOccupations.filter((o) => o !== occupation)
                      : [...currentOccupations, occupation];
                    handleInputChange(
                      "village_info",
                      "main_occupations",
                      newOccupations
                    );
                  }}
                >
                  {occupation}
                </Button>
              ))}
            </SimpleGrid>
          </FormControl>

          <Divider />

          <VStack spacing={4} w="full">
            <Heading size="sm" color="red.600">
              🚨 ปัญหาและสาเหตุ
            </Heading>

            <FormControl>
              <FormLabel>สาเหตุของปัญหาไฟป่า</FormLabel>
              <Textarea
                value={formData.village_info.problems.causes}
                onChange={(e) =>
                  handleInputChange(
                    "village_info",
                    "problems.causes",
                    e.target.value
                  )
                }
                placeholder="เช่น สภาพอากาศที่ร้อนแล้ง ในเขตป่าผลัดใบมีใบไม้สะสมจำนวนมาก, เกิดการลักลอบเผา, ไฟจากสวนเข้าป่า"
                rows={4}
              />
            </FormControl>

            <FormControl>
              <FormLabel>พื้นที่เสี่ยง</FormLabel>
              <Textarea
                value={formData.village_info.problems.risk_area}
                onChange={(e) =>
                  handleInputChange(
                    "village_info",
                    "problems.risk_area",
                    e.target.value
                  )
                }
                placeholder="เช่น เขตติดต่อกับสถาบันราชภัฏเชียงใหม่และเขตตำบลขี้เหล็กอำเภอแม่แตง, บ้านเตาถ่าน"
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>ข้อจำกัด</FormLabel>
              <Textarea
                value={formData.village_info.problems.limitations}
                onChange={(e) =>
                  handleInputChange(
                    "village_info",
                    "problems.limitations",
                    e.target.value
                  )
                }
                placeholder="เช่น เขตปกครองยังไม่ชัดเจนทำให้เกิดพื้นที่สูญญากาศ"
                rows={3}
              />
            </FormControl>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );

  const renderActivityForm = (timing, activities, timingLabel, timingIcon) => (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <Text fontSize="lg">{timingIcon}</Text>
            <Heading size="md" color="brand.orange">
              {timingLabel}
            </Heading>
          </HStack>
          <Button
            size="sm"
            colorScheme="green"
            leftIcon={<AddIcon />}
            onClick={() => addActivity(timing)}
          >
            เพิ่มกิจกรรม
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4}>
          {activities.map((activity, index) => (
            <Card key={activity.id} variant="outline" w="full">
              <CardBody>
                <VStack spacing={4}>
                  <HStack w="full" justify="space-between">
                    <Text fontWeight="bold" color="gray.600">
                      กิจกรรมที่ {index + 1}
                    </Text>
                    <IconButton
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      icon={<DeleteIcon />}
                      onClick={() => removeActivity(timing, index)}
                    />
                  </HStack>

                  <FormControl isRequired>
                    <FormLabel>ชื่อกิจกรรม</FormLabel>
                    <Input
                      value={activity.name}
                      onChange={(e) =>
                        handleInputChange(
                          "fire_management",
                          timing,
                          {
                            ...activity,
                            name: e.target.value,
                          },
                          index
                        )
                      }
                      placeholder="เช่น ประชุมทีม 3 เดือน/ครั้ง = 4 ครั้ง"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>รายละเอียดกิจกรรม</FormLabel>
                    <Textarea
                      value={activity.description}
                      onChange={(e) =>
                        handleInputChange(
                          "fire_management",
                          timing,
                          {
                            ...activity,
                            description: e.target.value,
                          },
                          index
                        )
                      }
                      placeholder="อธิบายรายละเอียดของกิจกรรม วิธีการดำเนินงาน และเป้าหมาย"
                      rows={4}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>ระยะเวลาดำเนินการ</FormLabel>
                    <Input
                      value={activity.period}
                      onChange={(e) =>
                        handleInputChange(
                          "fire_management",
                          timing,
                          {
                            ...activity,
                            period: e.target.value,
                          },
                          index
                        )
                      }
                      placeholder="เช่น 01/07/2024 - 31/07/2025"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>งบประมาณรวม (บาท)</FormLabel>
                    <NumberInput>
                      <NumberInputField
                        value={activity.budget}
                        onChange={(e) =>
                          handleInputChange(
                            "fire_management",
                            timing,
                            {
                              ...activity,
                              budget: parseInt(e.target.value) || 0,
                            },
                            index
                          )
                        }
                        placeholder="0"
                      />
                    </NumberInput>
                  </FormControl>

                  <Box w="full">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="semibold">รายการค่าใช้จ่าย</Text>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="ghost"
                        leftIcon={<AddIcon />}
                        onClick={() => addBudgetItem(timing, index)}
                      >
                        เพิ่มรายการ
                      </Button>
                    </HStack>
                    <VStack spacing={2}>
                      {activity.budget_items.map((item, itemIndex) => (
                        <HStack key={itemIndex} w="full">
                          <Input
                            placeholder="รายการค่าใช้จ่าย"
                            value={item.description}
                            onChange={(e) => {
                              const newActivity = { ...activity };
                              newActivity.budget_items[itemIndex].description =
                                e.target.value;
                              handleInputChange(
                                "fire_management",
                                timing,
                                newActivity,
                                index
                              );
                            }}
                            flex={2}
                          />
                          <NumberInput flex={1}>
                            <NumberInputField
                              placeholder="จำนวนเงิน"
                              value={item.amount || ""}
                              onChange={(e) => {
                                const newActivity = { ...activity };
                                newActivity.budget_items[itemIndex].amount =
                                  parseInt(e.target.value) || 0;
                                handleInputChange(
                                  "fire_management",
                                  timing,
                                  newActivity,
                                  index
                                );
                              }}
                            />
                          </NumberInput>
                          <IconButton
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            icon={<DeleteIcon />}
                            onClick={() => {
                              const newActivity = { ...activity };
                              newActivity.budget_items =
                                newActivity.budget_items.filter(
                                  (_, i) => i !== itemIndex
                                );
                              handleInputChange(
                                "fire_management",
                                timing,
                                newActivity,
                                index
                              );
                            }}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          ))}
          {activities.length === 0 && (
            <Alert status="info">
              <AlertIcon />
              ยังไม่มีกิจกรรมในช่วงนี้ คลิก "เพิ่มกิจกรรม" เพื่อเริ่มต้น
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  const renderEquipmentForm = () => (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md" color="brand.green">
            🛠️ อุปกรณ์และเครื่องมือ
          </Heading>
          <Button
            size="sm"
            colorScheme="green"
            leftIcon={<AddIcon />}
            onClick={addEquipment}
          >
            เพิ่มอุปกรณ์
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4}>
          {formData.equipment.map((item, index) => (
            <Card key={index} variant="outline" w="full">
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                  <FormControl>
                    <FormLabel>ชื่ออุปกรณ์</FormLabel>
                    <Select
                      value={item.name}
                      onChange={(e) => {
                        const newEquipment = [...formData.equipment];
                        newEquipment[index].name = e.target.value;
                        handleInputChange("", "equipment", newEquipment);
                      }}
                      placeholder="เลือกอุปกรณ์"
                    >
                      {equipmentOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>มีอยู่</FormLabel>
                    <NumberInput>
                      <NumberInputField
                        value={item.available}
                        onChange={(e) => {
                          const newEquipment = [...formData.equipment];
                          newEquipment[index].available =
                            parseInt(e.target.value) || 0;
                          handleInputChange("", "equipment", newEquipment);
                        }}
                      />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>ต้องการ</FormLabel>
                    <NumberInput>
                      <NumberInputField
                        value={item.needed}
                        onChange={(e) => {
                          const newEquipment = [...formData.equipment];
                          newEquipment[index].needed =
                            parseInt(e.target.value) || 0;
                          handleInputChange("", "equipment", newEquipment);
                        }}
                      />
                    </NumberInput>
                  </FormControl>

                  <Flex align="end">
                    <IconButton
                      colorScheme="red"
                      variant="ghost"
                      icon={<DeleteIcon />}
                      onClick={() => {
                        const newEquipment = formData.equipment.filter(
                          (_, i) => i !== index
                        );
                        handleInputChange("", "equipment", newEquipment);
                      }}
                    />
                  </Flex>
                </SimpleGrid>
              </CardBody>
            </Card>
          ))}
          {formData.equipment.length === 0 && (
            <Alert status="info">
              <AlertIcon />
              ยังไม่มีข้อมูลอุปกรณ์ คลิก "เพิ่มอุปกรณ์" เพื่อเริ่มต้น
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  const renderBudgetForm = () => (
    <Card>
      <CardHeader>
        <Heading size="md" color="brand.darkBlue">
          💰 สรุปงบประมาณ
        </Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
            <FormControl>
              <FormLabel>งบประมาณที่ได้รับ (บาท)</FormLabel>
              <NumberInput>
                <NumberInputField
                  value={formData.budget.allocated}
                  onChange={(e) =>
                    handleInputChange(
                      "budget",
                      "allocated",
                      parseInt(e.target.value) || ""
                    )
                  }
                  placeholder="เช่น 71000"
                />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>งบประมาณที่ขาด (บาท)</FormLabel>
              <NumberInput>
                <NumberInputField
                  value={formData.budget.shortage}
                  onChange={(e) =>
                    handleInputChange(
                      "budget",
                      "shortage",
                      parseInt(e.target.value) || ""
                    )
                  }
                  placeholder="เช่น 46000"
                />
              </NumberInput>
            </FormControl>
          </SimpleGrid>

          <Divider />

          <Box w="full">
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="semibold">แหล่งงบประมาณ</Text>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<AddIcon />}
                onClick={addBudgetSource}
              >
                เพิ่มแหล่งงบประมาณ
              </Button>
            </HStack>

            <VStack spacing={3}>
              {formData.budget.sources.map((source, index) => (
                <HStack key={index} w="full">
                  <Input
                    placeholder="ชื่อแหล่งงบประมาณ"
                    value={source.name}
                    onChange={(e) => {
                      const newSources = [...formData.budget.sources];
                      newSources[index].name = e.target.value;
                      handleInputChange("budget", "sources", newSources);
                    }}
                    flex={2}
                  />
                  <NumberInput flex={1}>
                    <NumberInputField
                      placeholder="จำนวนเงิน"
                      value={source.amount}
                      onChange={(e) => {
                        const newSources = [...formData.budget.sources];
                        newSources[index].amount =
                          parseInt(e.target.value) || 0;
                        handleInputChange("budget", "sources", newSources);
                      }}
                    />
                  </NumberInput>
                  <IconButton
                    colorScheme="red"
                    variant="ghost"
                    icon={<DeleteIcon />}
                    onClick={() => {
                      const newSources = formData.budget.sources.filter(
                        (_, i) => i !== index
                      );
                      handleInputChange("budget", "sources", newSources);
                    }}
                  />
                </HStack>
              ))}
              {formData.budget.sources.length === 0 && (
                <Alert status="info">
                  <AlertIcon />
                  ยังไม่มีข้อมูลแหล่งงบประมาณ คลิก "เพิ่มแหล่งงบประมาณ"
                  เพื่อเริ่มต้น
                </Alert>
              )}
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );

  const steps = [
    { title: "ข้อมูลหมู่บ้าน", component: renderVillageInfoForm },
    {
      title: "กิจกรรมก่อนเกิดเหตุ",
      component: () =>
        renderActivityForm(
          "pre_incident",
          formData.fire_management.pre_incident,
          "กิจกรรมก่อนเกิดเหตุ",
          "🛡️"
        ),
    },
    {
      title: "กิจกรรมช่วงเกิดเหตุ",
      component: () =>
        renderActivityForm(
          "during_incident",
          formData.fire_management.during_incident,
          "กิจกรรมช่วงเกิดเหตุ",
          "🔥"
        ),
    },
    {
      title: "กิจกรรมหลังเกิดเหตุ",
      component: () =>
        renderActivityForm(
          "post_incident",
          formData.fire_management.post_incident,
          "กิจกรรมหลังเกิดเหตุ",
          "🌱"
        ),
    },
    { title: "อุปกรณ์และเครื่องมือ", component: renderEquipmentForm },
    { title: "งบประมาณ", component: renderBudgetForm },
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Navigation Header */}
      <Header />

      {/* Enhanced Header */}
      <Box
        bg="linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)"
        color="white"
        py={12}
        position="relative"
        overflow="hidden"
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          background="radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 2px, transparent 2px), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 2px, transparent 2px)"
          backgroundSize="60px 60px"
        />

        <Container maxW="container.xl" position="relative">
          <VStack spacing={6} textAlign="center">
            {/* Main Title */}
            <VStack spacing={3}>
              <Box fontSize="4xl">🔥</Box>
              <Heading
                size="2xl"
                fontWeight="bold"
                textShadow="0 2px 4px rgba(0,0,0,0.3)"
              >
                ส่งแผนจัดการไฟป่าชุมชน
              </Heading>
              <Text fontSize="xl" opacity={0.9} maxW="800px" lineHeight="tall">
                ร่วมสร้างชุมชนที่ปลอดภัยจากไฟป่า
                ด้วยการส่งแผนจัดการที่ครอบคลุมและยั่งยืน
              </Text>
            </VStack>

            {/* Key Features */}
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={8}
              w="full"
              maxW="900px"
            >
              <VStack spacing={2}>
                <Box fontSize="2xl">📋</Box>
                <Text fontWeight="semibold">แผนครอบคลุม</Text>
                <Text fontSize="sm" opacity={0.8} textAlign="center">
                  ครอบคลุมทุกขั้นตอน ก่อน-ระหว่าง-หลังเกิดเหตุ
                </Text>
              </VStack>

              <VStack spacing={2}>
                <Box fontSize="2xl">💰</Box>
                <Text fontWeight="semibold">งบประมาณชัดเจน</Text>
                <Text fontSize="sm" opacity={0.8} textAlign="center">
                  ระบุงบประมาณและแหล่งเงินทุนอย่างละเอียด
                </Text>
              </VStack>

              <VStack spacing={2}>
                <Box fontSize="2xl">🤝</Box>
                <Text fontWeight="semibold">ได้รับการสนับสนุน</Text>
                <Text fontSize="sm" opacity={0.8} textAlign="center">
                  หน่วยงานที่เกี่ยวข้องจะให้การสนับสนุนที่เหมาะสม
                </Text>
              </VStack>
            </SimpleGrid>

            {/* Instructions */}
            <Alert
              status="info"
              bg="rgba(255,255,255,0.15)"
              color="white"
              borderRadius="lg"
              maxW="700px"
            >
              <AlertIcon color="white" />
              <Box>
                <Text fontWeight="semibold">คำแนะนำการกรอกแบบฟอร์ม</Text>
                <Text fontSize="sm" mt={1}>
                  กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง
                  เพื่อให้การพิจารณาและการสนับสนุนเป็นไปอย่างรวดเร็ว ข้อมูลที่มี
                  * จำเป็นต้องกรอก
                </Text>
              </Box>
            </Alert>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={6}>
          {/* Progress */}
          <Card w="full">
            <CardBody>
              <VStack spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="semibold">
                    ขั้นตอนที่ {currentStep} จาก {steps.length}
                  </Text>
                  <Text color="gray.600">{steps[currentStep - 1].title}</Text>
                </HStack>
                <Progress
                  value={(currentStep / steps.length) * 100}
                  colorScheme="orange"
                  size="lg"
                  w="full"
                  borderRadius="md"
                />
              </VStack>
            </CardBody>
          </Card>

          {/* Form Content */}
          {steps[currentStep - 1].component()}

          {/* Navigation */}
          <Card w="full">
            <CardBody>
              <HStack justify="space-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  isDisabled={currentStep === 1}
                >
                  ย้อนกลับ
                </Button>

                <HStack spacing={2}>
                  {steps.map((_, index) => (
                    <Box
                      key={index}
                      w={3}
                      h={3}
                      borderRadius="full"
                      bg={
                        index + 1 === currentStep ? "brand.orange" : "gray.300"
                      }
                    />
                  ))}
                </HStack>

                {currentStep < steps.length ? (
                  <Button
                    colorScheme="orange"
                    onClick={() =>
                      setCurrentStep(Math.min(steps.length, currentStep + 1))
                    }
                  >
                    ถัดไป
                  </Button>
                ) : (
                  <Button
                    colorScheme="green"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    loadingText="กำลังส่ง..."
                  >
                    ส่งแผน
                  </Button>
                )}
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default SubmitPlan;
