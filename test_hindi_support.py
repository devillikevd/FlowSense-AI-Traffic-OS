#!/usr/bin/env python3
"""
Test script for FlowSense AI Assistant with Hindi/Hinglish support
"""

import sys
sys.path.insert(0, 'c:\\Users\\HP\\flowsense')

from backend.predictive_engine import TrafficEngine
from backend.ai_capabilities import ConversationalAI

def test_hindi_hinglish():
    """Test Hindi/Hinglish language support"""
    
    print("=" * 70)
    print("FlowSense AI Assistant - Hindi/Hinglish Support Test")
    print("=" * 70)
    
    # Initialize
    engine = TrafficEngine()
    ai = ConversationalAI(engine)
    
    # Test cases with Hindi/Hinglish
    test_cases = [
        ("cp ke pass khaane ki jgh koi h", "eating place near CP"),
        ("saket to rohini", "Saket to Rohini route"),
        ("parking kahan par h", "parking location"),
        ("aaj traffic kaise hai", "today's traffic"),
        ("cp mein congestion kitna hai", "congestion at CP"),
        ("airport kaise jaun", "how to reach airport"),
        ("parking available hai kya", "parking availability"),
        ("Hello", "English greeting"),
        ("route from delhi to noida", "English route query"),
    ]
    
    print("\n📱 Testing Hindi/Hinglish Intent Detection:\n")
    print("-" * 70)
    
    for test_message, description in test_cases:
        print(f"\n🗣️ User: {test_message}")
        print(f"   Description: {description}")
        
        response = ai.process_message(test_message, user_id="hindi_user")
        
        language = response.get("language", "unknown")
        confidence = response.get("confidence", 0)
        
        print(f"   Language: {language.upper()}")
        print(f"   Confidence: {confidence * 100:.0f}%")
        print(f"   Response Preview: {response['response'][:80]}...")
        
        if response.get("status") == "error":
            print(f"   ⚠️ Error: {response.get('error', 'Unknown')}")
    
    print("\n" + "=" * 70)
    print("✅ Hindi/Hinglish support test completed!")
    print("=" * 70)

if __name__ == "__main__":
    try:
        test_hindi_hinglish()
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
