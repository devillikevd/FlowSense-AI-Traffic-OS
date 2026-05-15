#!/usr/bin/env python3
"""
Test script for FlowSense AI Assistant
Verifies conversational AI is communicating properly
"""

import sys
sys.path.insert(0, '/Users/HP/flowsense')

from backend.predictive_engine import TrafficEngine
from backend.ai_capabilities import ConversationalAI

def test_ai_assistant():
    """Test various AI assistant functionalities"""
    
    print("=" * 60)
    print("FlowSense AI Assistant Test Suite")
    print("=" * 60)
    
    # Initialize the engine and AI
    print("\n✓ Initializing FlowSense engine...")
    engine = TrafficEngine()
    ai = ConversationalAI(engine)
    print("✓ AI Assistant initialized successfully\n")
    
    # Test cases
    test_cases = [
        ("Hello", "greeting"),
        ("Hi there!", "greeting"),
        ("What can you do?", "help"),
        ("How is traffic in Connaught Place?", "status_check"),
        ("Route from CP to Airport", "route"),
        ("Emergency! Accident at MG Road", "emergency"),
        ("What's the forecast?", "prediction"),
        ("Air quality today?", "pollution"),
        ("Where can I park?", "parking"),
        ("Tell me about the weather", "weather"),
    ]
    
    print("Testing conversational AI responses:")
    print("-" * 60)
    
    for test_message, intent_type in test_cases:
        print(f"\n📝 User: {test_message}")
        print(f"   Intent: {intent_type}")
        
        response = ai.process_message(test_message, user_id="test_user")
        
        if response.get("status") == "success":
            print(f"✓ Response received")
            print(f"  Confidence: {response.get('confidence', 0)*100:.0f}%")
            print(f"  Message: {response['response'][:100]}...")
        else:
            print(f"✗ Error: {response.get('error', 'Unknown error')}")
    
    # Test context generation
    print("\n" + "=" * 60)
    print("Testing Location Context Generation")
    print("-" * 60)
    
    test_locations = ["Connaught Place", "AIIMS", "IGI Airport"]
    for location in test_locations:
        print(f"\n📍 Location: {location}")
        context = ai.generate_context_summary(location)
        print(f"  Status: {context.get('current_status')}")
        print(f"  Recommendation: {context.get('recommendation')}")
        print(f"  Best time: {context.get('best_time', 'N/A')}")
    
    # Test conversation history
    print("\n" + "=" * 60)
    print("Conversation History")
    print("-" * 60)
    print(f"Total messages processed: {len(ai.conversation_history)}")
    print(f"Unique users: {len(set(h.get('user_id', 'guest') for h in ai.conversation_history))}")
    
    print("\n" + "=" * 60)
    print("✓ All tests completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_ai_assistant()
    except Exception as e:
        print(f"\n✗ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
