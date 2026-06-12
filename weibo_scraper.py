#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
微博数据爬取工具
用于从微博获取手机参数信息，补充官网缺失的数据
"""

import requests
from bs4 import BeautifulSoup
import re
import json
import time
from typing import Dict, Any, Optional, List

class WeiboPhoneDataScraper:
    """微博手机数据爬取器"""
    
    def __init__(self):
        self.base_url = "https://s.weibo.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def search_phone_info(self, phone_model: str, brand: str = '') -> Dict[str, Any]:
        """
        搜索手机信息
        
        Args:
            phone_model: 手机型号
            brand: 品牌（可选）
            
        Returns:
            手机参数字典
        """
        # 构建搜索关键词
        search_query = f"{brand} {phone_model}" if brand else phone_model
        search_query = f"{search_query} 参数 规格 配置"
        
        print(f"正在搜索微博: {search_query}")
        
        try:
            # 搜索微博
            search_url = f"{self.base_url}/weibo?q={requests.utils.quote(search_query)}"
            response = self.session.get(search_url, timeout=10)
            
            if response.status_code != 200:
                print(f"搜索失败，状态码: {response.status_code}")
                return {}
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 提取微博内容
            phone_info = self.extract_phone_info_from_weibo(soup, phone_model, brand)
            
            return phone_info
            
        except Exception as e:
            print(f"搜索微博时发生错误: {e}")
            return {}
    
    def extract_phone_info_from_weibo(self, soup: BeautifulSoup, phone_model: str, brand: str) -> Dict[str, Any]:
        """从微博内容中提取手机信息"""
        phone_info = {}
        
        # 查找包含手机参数的微博
        weibo_cards = soup.find_all('div', class_='card-wrap')
        
        for card in weibo_cards:
            card_text = card.get_text()
            
            # 检查是否包含相关关键词
            if any(keyword in card_text for keyword in ['处理器', '屏幕', '电池', '充电', '参数', '规格']):
                # 提取参数信息
                extracted_info = self.extract_parameters_from_text(card_text)
                
                if extracted_info:
                    phone_info.update(extracted_info)
                    break  # 找到一个就停止
        
        return phone_info
    
    def extract_parameters_from_text(self, text: str) -> Dict[str, Any]:
        """从文本中提取手机参数"""
        params = {}
        
        # 提取处理器
        processor_patterns = [
            r'(骁龙\d+\s*[A-Za-z]*\s*\d*)',
            r'(天玑\d+[a-zA-Z]*)',
            r'(麒麟\d+[A-Za-z]*)',
            r'(A\d+\s*[A-Za-z]*)',
            r'(苹果\s*A\d+)'
        ]
        
        for pattern in processor_patterns:
            match = re.search(pattern, text)
            if match:
                params['processor'] = match.group(1)
                break
        
        # 提取屏幕尺寸
        screen_match = re.search(r'(\d+\.?\d*)\s*英寸', text)
        if screen_match:
            params['screen_size'] = float(screen_match.group(1))
        
        # 提取刷新率
        refresh_match = re.search(r'(\d+)\s*Hz', text)
        if refresh_match:
            params['refresh_hz'] = int(refresh_match.group(1))
        
        # 提取电池容量
        battery_match = re.search(r'(\d+)\s*mAh', text)
        if battery_match:
            params['battery_mah'] = int(battery_match.group(1))
        
        # 提取充电功率
        charging_patterns = [
            r'(\d+)\s*[Ww]\s*有线',
            r'有线\s*(\d+)\s*[Ww]',
            r'快充\s*(\d+)\s*[Ww]',
            r'充电\s*(\d+)\s*[Ww]'
        ]
        
        for pattern in charging_patterns:
            match = re.search(pattern, text)
            if match:
                params['charging_w'] = int(match.group(1))
                break
        
        # 提取无线充电
        wireless_patterns = [
            r'无线\s*(\d+)\s*[Ww]',
            r'(\d+)\s*[Ww]\s*无线'
        ]
        
        for pattern in wireless_patterns:
            match = re.search(pattern, text)
            if match:
                params['wireless_charging_w'] = int(match.group(1))
                break
        
        # 提取重量
        weight_match = re.search(r'(\d+)\s*[gG克]', text)
        if weight_match:
            params['weight_g'] = int(weight_match.group(1))
        
        # 提取USB版本
        usb_patterns = [
            r'USB\s*(\d+\.\d+)',
            r'USB\s*(\d+\.\d+)\s*[A-Za-z]*'
        ]
        
        for pattern in usb_patterns:
            match = re.search(pattern, text)
            if match:
                params['usb_version'] = f"USB {match.group(1)}"
                break
        
        # 提取NFC
        if 'NFC' in text or 'nfc' in text:
            params['has_nfc'] = True
        
        # 提取红外
        if '红外' in text:
            params['has_ir'] = True
        
        # 提取潜望长焦
        if '潜望' in text or '长焦' in text:
            params['has_tele'] = True
        
        return params
    
    def search_official_weibo(self, brand: str) -> List[Dict[str, Any]]:
        """
        搜索品牌官方微博，获取最新手机信息
        
        Args:
            brand: 品牌名称
            
        Returns:
            手机信息列表
        """
        # 品牌官方微博账号映射
        official_accounts = {
            '华为': '华为手机',
            '小米': '小米手机',
            'OPPO': 'OPPO',
            'vivo': 'vivo',
            'HONOR': '荣耀手机',
            'REDMI': 'Redmi红米手机',
            '一加': '一加手机',
            '真我': 'realme真我手机',
            'iQOO': 'iQOO手机',
            '三星': '三星电子',
            '苹果': 'Apple',
            '红魔': '红魔手机',
            'ROG': 'ROG玩家国度',
            '索尼': '索尼Xperia',
            'realme': 'realme真我手机',
            '荣耀': '荣耀手机'
        }
        
        account = official_accounts.get(brand)
        if not account:
            print(f"未找到品牌 {brand} 的官方微博账号")
            return []
        
        print(f"搜索 {brand} 官方微博: {account}")
        
        try:
            # 访问官方微博主页
            account_url = f"{self.base_url}/u/{account}"
            response = self.session.get(account_url, timeout=10)
            
            if response.status_code != 200:
                print(f"访问官方微博失败，状态码: {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 提取最新微博中的手机信息
            phone_infos = []
            weibo_cards = soup.find_all('div', class_='card-wrap')
            
            for card in weibo_cards[:10]:  # 只看最新的10条微博
                card_text = card.get_text()
                
                # 检查是否包含手机发布信息
                if any(keyword in card_text for keyword in ['发布', '新品', '上市', '开售']):
                    extracted_info = self.extract_parameters_from_text(card_text)
                    if extracted_info:
                        phone_infos.append(extracted_info)
            
            return phone_infos
            
        except Exception as e:
            print(f"搜索官方微博时发生错误: {e}")
            return []
    
    def validate_weibo_data(self, weibo_data: Dict[str, Any], brand: str, model: str) -> Dict[str, Any]:
        """
        验证微博数据的合理性
        
        Args:
            weibo_data: 从微博提取的数据
            brand: 品牌
            model: 型号
            
        Returns:
            验证后的数据
        """
        validated_data = {}
        
        # 应用参数验证器
        from parameter_validator import PhoneParameterValidator
        validator = PhoneParameterValidator()
        
        # 验证每个参数
        for field, value in weibo_data.items():
            if value:
                # 根据字段类型选择验证方法
                validation_method = f"_validate_{field}"
                if hasattr(validator, validation_method):
                    validated_value, reason = getattr(validator, validation_method)(value, brand, model)
                    validated_data[field] = validated_value
                else:
                    validated_data[field] = value
        
        return validated_data


# 使用示例
if __name__ == "__main__":
    scraper = WeiboPhoneDataScraper()
    
    # 测试搜索手机信息
    print("测试微博数据爬取：\n")
    
    # 搜索华为Pura90
    huawei_pura90 = scraper.search_phone_info("Pura 90", "华为")
    print(f"华为 Pura 90 微博数据: {huawei_pura90}")
    
    # 搜索OPPO Find X9s Pro
    oppo_find = scraper.search_phone_info("Find X9s Pro", "OPPO")
    print(f"\nOPPO Find X9s Pro 微博数据: {oppo_find}")
    
    # 搜索华为官方微博
    print(f"\n搜索华为官方微博：")
    huawei_official = scraper.search_official_weibo("华为")
    print(f"找到 {len(huawei_official)} 条相关信息")
    
    print("\n✓ 微博数据爬取工具测试完成")