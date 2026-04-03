#!/usr/bin/env python
# -*- coding: utf-8 -*-

with open('CarbonFootprintView.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# 修改主容器 overflow-hidden 为 overflow-visible
content = content.replace(
    'relative overflow-hidden shadow-xl',
    'relative overflow-visible shadow-xl'
)

# 修改结果区域容器允许水平溢出
content = content.replace(
    'flex flex-col overflow-y-auto">',
    'flex flex-col overflow-y-auto overflow-x-visible">'
)

# 修改图表容器高度
content = content.replace(
    'ref="trendChartRef" class="h-56"',
    'ref="trendChartRef" class="h-72 min-h-72"'
)
content = content.replace(
    'ref="pieChartRef" class="h-64"',
    'ref="pieChartRef" class="h-72 min-h-72"'
)
content = content.replace(
    'ref="radarChartRef" class="h-64"',
    'ref="radarChartRef" class="h-72 min-h-72"'
)

# 修改图表容器卡片允许溢出
content = content.replace(
    'rounded-2xl p-4 shadow-sm">',
    'rounded-2xl p-4 shadow-sm overflow-visible">'
)

with open('CarbonFootprintView.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print('修改完成！')
