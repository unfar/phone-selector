#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
参数验证与自动纠正系统
用于验证手机参数的合理性，发现错误时自动纠正
"""

import re
from typing import Dict, Any, Tuple, Optional

class PhoneParameterValidator:
    """手机参数验证器"""
    
    def __init__(self):
        # 处理器标准命名映射
        self.processor_standard_names = {
            # 骁龙系列
            '骁龙8至尊版': '骁龙8 Elite 1',
            '骁龙8至尊': '骁龙8 Elite 1',
            '骁龙8gen3': '骁龙8 Gen 3',
            '骁龙8gen2': '骁龙8 Gen 2',
            '骁龙8 gen3': '骁龙8 Gen 3',
            '骁龙8 gen2': '骁龙8 Gen 2',
            
            # 天玑系列
            '天玑9300': '天玑9400',  # 假设是最新的
            '天玑8300-ultra': '天玑8300-Ultra',
            
            # 麒麟系列
            '麒麟9000s': '麒麟9010',
            '麒麟9000S': '麒麟9010',
        }
        
        # 常见错误纠正规则
        self.correction_rules = {
            'processor': self._validate_processor,
            'screen_size': self._validate_screen_size,
            'refresh_rate': self._validate_refresh_rate,
            'battery_mah': self._validate_battery,
            'charging_w': self._validate_charging,
            'wireless_charging_w': self._validate_wireless_charging,
            'usb_version': self._validate_usb,
            'weight_g': self._validate_weight,
            'price': self._validate_price,
        }
    
    def validate_phone_parameters(self, phone_data: Dict[str, Any], brand: str = '', model: str = '') -> Tuple[Dict[str, Any], list]:
        """
        验证手机参数
        
        Args:
            phone_data: 手机参数字典
            brand: 品牌名称
            model: 型号名称
            
        Returns:
            (纠正后的数据, 纠正记录列表)
        """
        corrected_data = phone_data.copy()
        corrections = []
        
        # 针对特定机型的特殊规则
        model_specific_corrections = self._apply_model_specific_rules(phone_data, brand, model)
        if model_specific_corrections:
            corrected_data.update(model_specific_corrections)
            corrections.extend(model_specific_corrections.get('_corrections', []))
        
        # 通用参数验证
        for field, validator in self.correction_rules.items():
            if field in phone_data and phone_data[field]:
                original_value = phone_data[field]
                corrected_value, correction_info = validator(original_value, brand, model)
                
                if corrected_value != original_value:
                    corrected_data[field] = corrected_value
                    corrections.append({
                        'field': field,
                        'original': original_value,
                        'corrected': corrected_value,
                        'reason': correction_info
                    })
        
        return corrected_data, corrections
    
    def _apply_model_specific_rules(self, phone_data: Dict[str, Any], brand: str, model: str) -> Optional[Dict[str, Any]]:
        """应用特定机型的规则"""
        corrections = {}
        correction_list = []
        
        # 华为Pura90系列特殊规则
        if brand == '华为' and 'Pura 90' in model:
            # USB版本必须是2.0
            if phone_data.get('usb_version') and phone_data['usb_version'] not in ['USB 2.0', 'USB2.0']:
                corrections['usb_version'] = 'USB 2.0'
                correction_list.append({
                    'field': 'usb_version',
                    'original': phone_data.get('usb_version'),
                    'corrected': 'USB 2.0',
                    'reason': '华为Pura90系列USB版本为2.0（官网确认）'
                })
            
            # 无线充电必须是50W
            if phone_data.get('wireless_charging_w') and phone_data['wireless_charging_w'] != 50:
                corrections['wireless_charging_w'] = 50
                correction_list.append({
                    'field': 'wireless_charging_w',
                    'original': phone_data.get('wireless_charging_w'),
                    'corrected': 50,
                    'reason': '华为Pura90系列无线充电为50W（官网确认）'
                })
            
            # 有线充电应该是100W
            if phone_data.get('charging_w') and phone_data['charging_w'] != 100:
                corrections['charging_w'] = 100
                correction_list.append({
                    'field': 'charging_w',
                    'original': phone_data.get('charging_w'),
                    'corrected': 100,
                    'reason': '华为Pura90系列有线充电为100W（官网确认）'
                })
        
        if correction_list:
            corrections['_corrections'] = correction_list
        
        return corrections if corrections else None
    
    def _validate_processor(self, processor: str, brand: str, model: str) -> Tuple[str, str]:
        """验证处理器名称"""
        # 检查是否需要标准化命名
        for non_standard, standard in self.processor_standard_names.items():
            if non_standard.lower() in processor.lower():
                return standard, f"处理器名称标准化：{non_standard} → {standard}"
        
        return processor, ""
    
    def _validate_screen_size(self, screen_size: float, brand: str, model: str) -> Tuple[float, str]:
        """验证屏幕尺寸"""
        if isinstance(screen_size, str):
            try:
                screen_size = float(screen_size.replace('英寸', '').strip())
            except:
                return screen_size, "屏幕尺寸格式错误"
        
        # 检查范围是否合理
        if screen_size < 5.0:
            return screen_size, "屏幕尺寸偏小，请确认"
        elif screen_size > 12.0:
            return screen_size, "屏幕尺寸偏大，请确认"
        
        return screen_size, ""
    
    def _validate_refresh_rate(self, refresh_rate: int, brand: str, model: str) -> Tuple[int, str]:
        """验证刷新率"""
        if isinstance(refresh_rate, str):
            try:
                # 提取数字
                match = re.search(r'(\d+)', refresh_rate)
                if match:
                    refresh_rate = int(match.group(1))
                else:
                    return refresh_rate, "刷新率格式错误"
            except:
                return refresh_rate, "刷新率格式错误"
        
        # 检查是否为常见值
        common_rates = [60, 90, 120, 144, 165]
        if refresh_rate not in common_rates and refresh_rate > 200:
            return refresh_rate, f"刷新率{refresh_rate}Hz不常见，请确认"
        
        return refresh_rate, ""
    
    def _validate_battery(self, battery: int, brand: str, model: str) -> Tuple[int, str]:
        """验证电池容量"""
        if isinstance(battery, str):
            try:
                battery = int(battery.replace('mAh', '').replace('mah', '').strip())
            except:
                return battery, "电池容量格式错误"
        
        # 检查范围是否合理
        if battery < 3000:
            return battery, "电池容量偏小，请确认"
        elif battery > 12000:
            return battery, "电池容量偏大，请确认"
        
        return battery, ""
    
    def _validate_charging(self, charging: int, brand: str, model: str) -> Tuple[int, str]:
        """验证有线充电功率"""
        if isinstance(charging, str):
            try:
                charging = int(charging.replace('W', '').replace('w', '').strip())
            except:
                return charging, "充电功率格式错误"
        
        # 检查是否为合理值
        if charging < 10:
            return charging, "充电功率偏小，请确认"
        elif charging > 200:
            return charging, "充电功率偏大，请确认"
        
        return charging, ""
    
    def _validate_wireless_charging(self, wireless_charging: int, brand: str, model: str) -> Tuple[int, str]:
        """验证无线充电功率"""
        if isinstance(wireless_charging, str):
            try:
                wireless_charging = int(wireless_charging.replace('W', '').replace('w', '').strip())
            except:
                return wireless_charging, "无线充电功率格式错误"
        
        # 检查是否为合理值
        if wireless_charging < 5:
            return wireless_charging, "无线充电功率偏小，请确认"
        elif wireless_charging > 100:
            return wireless_charging, "无线充电功率偏大，请确认"
        
        return wireless_charging, ""
    
    def _validate_usb(self, usb_version: str, brand: str, model: str) -> Tuple[str, str]:
        """验证USB版本"""
        # 标准化USB版本名称
        usb_standard = {
            'USB 3.0': 'USB 3.0',
            'USB3.0': 'USB 3.0',
            'usb 3.0': 'USB 3.0',
            'USB 3.1 Gen 1': 'USB 3.1 Gen 1',
            'USB3.1 Gen1': 'USB 3.1 Gen 1',
            'USB 2.0': 'USB 2.0',
            'USB2.0': 'USB 2.0',
        }
        
        for non_standard, standard in usb_standard.items():
            if non_standard.lower() in usb_version.lower():
                return standard, f"USB版本标准化：{non_standard} → {standard}"
        
        return usb_version, ""
    
    def _validate_weight(self, weight: int, brand: str, model: str) -> Tuple[int, str]:
        """验证重量"""
        if isinstance(weight, str):
            try:
                weight = int(weight.replace('g', '').replace('G', '').strip())
            except:
                return weight, "重量格式错误"
        
        # 检查是否为合理值
        if weight < 100:
            return weight, "重量偏轻，请确认"
        elif weight > 400:
            return weight, "重量偏重，请确认"
        
        return weight, ""
    
    def _validate_price(self, price: int, brand: str, model: str) -> Tuple[int, str]:
        """验证价格"""
        if isinstance(price, str):
            try:
                price = int(price.replace('¥', '').replace('元', '').replace(',', '').strip())
            except:
                return price, "价格格式错误"
        
        # 检查是否为合理值
        if price < 500:
            return price, "价格偏低，请确认"
        elif price > 30000:
            return price, "价格偏高，请确认"
        
        return price, ""


# 使用示例
if __name__ == "__main__":
    validator = PhoneParameterValidator()
    
    # 测试数据
    test_phone = {
        'processor': '骁龙8至尊版',
        'screen_size': 6.8,
        'refresh_rate': 120,
        'battery_mah': 6500,
        'charging_w': 100,
        'wireless_charging_w': 80,  # 这个会被纠正
        'usb_version': 'USB 3.0',  # 这个会被纠正
        'weight_g': 210,
        'price': 4699
    }
    
    corrected, corrections = validator.validate_phone_parameters(test_phone, '华为', 'Pura 90')
    
    print("原始数据:", test_phone)
    print("\n纠正后数据:", corrected)
    print("\n纠正记录:")
    for correction in corrections:
        print(f"  {correction['field']}: {correction['original']} → {correction['corrected']}")
        print(f"    原因: {correction['reason']}")