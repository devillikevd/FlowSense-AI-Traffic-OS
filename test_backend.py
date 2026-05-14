#!/usr/bin/env python
"""Test script to verify AI backend capabilities are working."""

import sys
sys.path.insert(0, 'backend')

try:
    from predictive_engine import TrafficEngine
    from ai_capabilities import SmartCityIntelligence
    print("✓ Successfully imported TrafficEngine and SmartCityIntelligence")
    
    # Initialize the engine
    engine = TrafficEngine()
    print("✓ TrafficEngine initialized successfully")
    
    # Initialize smart city AI
    smart = SmartCityIntelligence(engine)
    print("✓ SmartCityIntelligence initialized successfully")
    
    # Test key methods
    result = engine.predict_location("Connaught Place")
    print(f"✓ predict_location works: {result['congestion_level']}")
    
    result = smart.dynamic_diversion("Connaught Place")
    print(f"✓ dynamic_diversion works: {len(result['active_diversions'])} diversions")
    
    result = smart.anomaly_detection("Connaught Place")
    print(f"✓ anomaly_detection works: {result['anomaly_detected']}")
    
    result = smart.commuter_assistant("Connaught Place", "IGI Airport", "user123")
    print(f"✓ commuter_assistant works: stress score {result['assistant']['stress_score']}")
    
    print("\n✅ All AI capabilities are functional and ready!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
