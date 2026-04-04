<template>
  <div class="weather-icon-wrapper" :style="wrapperStyle">
    <span
      v-if="iconClass"
      :class="['weather-icon', iconClass]"
      :style="iconStyle"
      :aria-label="alt"
      role="img"
    ></span>
    <div
      v-else
      class="weather-icon-placeholder"
      :style="{ width: `${size}px`, height: `${size}px` }"
      :aria-label="alt"
      role="img"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  code: {
    type: [String, Number],
    required: true,
  },
  size: {
    type: Number,
    default: 48,
  },
  fill: {
    type: Boolean,
    default: false,
  },
  alt: {
    type: String,
    default: '天气图标',
  },
})

const supportedCodes = new Set([
  '100', '101', '102', '103', '104', '150', '151', '152', '153',
  '300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '350', '351', '399',
  '400', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '456', '457', '499',
  '500', '501', '502', '503', '504', '507', '508', '509', '510', '511', '512', '513', '514', '515',
  '800', '801', '802', '803', '804', '805', '806', '807', '900', '901', '999',
  '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010', '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019', '1020', '1021', '1022', '1023', '1024', '1025', '1026', '1027', '1028', '1029', '1030', '1031', '1032', '1033', '1034', '1035', '1036', '1037', '1038', '1039', '1040', '1041', '1042', '1043', '1044', '1045', '1046', '1047', '1048', '1049', '1050', '1051', '1052', '1053', '1054', '1055', '1056', '1057', '1058', '1059', '1060', '1061', '1062', '1063', '1064', '1065', '1066', '1067', '1068', '1069', '1071', '1072', '1073', '1074', '1075', '1076', '1077', '1078', '1079', '1080', '1081', '1082', '1084', '1085', '1086', '1087', '1088', '1089',
  '1201', '1202', '1203', '1204', '1205', '1206', '1207', '1208', '1209', '1210', '1211', '1212', '1213', '1214', '1215', '1216', '1217', '1218', '1219', '1221', '1241', '1242', '1243', '1244', '1245', '1246', '1247', '1248', '1249', '1250', '1251', '1271', '1272', '1273', '1274',
  '1601', '1602', '1603', '1604', '1605', '1606', '1607', '1608', '1609', '1610',
  '1701', '1702', '1703', '1704', '1705', '1706', '1707', '1708', '1709', '1710',
  '1801', '1802', '1803', '1804', '1805',
  '2001', '2002', '2003', '2004',
])

const normalizedCode = computed(() => {
  if (props.code === null || props.code === undefined || props.code === '') return null
  return String(props.code)
})

const iconClass = computed(() => {
  if (!normalizedCode.value || !supportedCodes.has(normalizedCode.value)) return null
  return `qi-${normalizedCode.value}`
})

const wrapperStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))

const iconStyle = computed(() => ({
  fontSize: `${props.size}px`,
}))
</script>

<style scoped>
.weather-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.weather-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  line-height: 1;
  transition: transform 0.3s ease;
}

.weather-icon:hover {
  transform: scale(1.08);
}

.weather-icon-placeholder {
  background: linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%);
  border-radius: 4px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
