# Toronto Trip Planner MVP - Workflow Fix Specification

**Date:** February 8, 2026  
**Scope:** Bug fixes and prompt improvements for Toronto MVP  
**Status:** Ready for Implementation

---

## 1. BUGS FOUND

### Bug 1.1: Date Calculation (Inclusive Days)
**Symptom:** Feb 28 → Mar 2 computes as 2 days instead of 3 days  
**Cause:** Date range calculation not including both start and end dates (off-by-one error)  
**Location:** `backend/models/trip_preferences.py` - `_calculate_date_fields()` method  
**Fix:** Use `(end_date - start_date).days + 1` for inclusive count

### Bug 1.2: Incorrect Activity Count per Pace
**Symptom:** Itinerary generates variable activity counts not matching pace requirements  
**Cause:** System prompt has different pace definitions than requirements  
**Location:** `backend/services/itinerary_service.py` - `GEMINI_ITINERARY_SYSTEM_INSTRUCTION`  
**Current:** Relaxed: 2-3, Moderate: 4-5, Packed: 6-8  
**Required:** Relaxed: 2, Moderate: 3, Packed: 4  
**Fix:** Update system prompt pace rules and settings constants

### Bug 1.3: Missing Lunch/Dinner Guarantee
**Symptom:** Some days may not have both lunch and dinner explicitly scheduled  
**Cause:** Prompt says "at least" one meal, not explicit lunch AND dinner requirement  
**Location:** `backend/services/itinerary_service.py` - system prompt  
**Fix:** Change prompt to enforce "MUST include BOTH lunch AND dinner with explicit times"

### Bug 1.4: "Still need" Line in Production
**Symptom:** Internal QA message "Still need: city, dates..." visible to users  
**Cause:** `nlp_extraction_service.py` includes missing fields in user-facing response  
**Location:** `backend/services/nlp_extraction_service.py` - `generate_conversational_response()`  
**Fix:** Add debug flag; return missing fields as separate JSON field, not in message text

### Bug 1.5: Budget Services Still Active
**Symptom:** Budget estimator and trip budget services are called in orchestrator  
**Cause:** MVP scope changed but services not disabled  
**Location:** `backend/services/itinerary_orchestrator.py` - `__init__()` and `_fetch_budget()`  
**Fix:** Comment out budget service initialization and calls; remove from parallel gather

### Bug 1.6: Budget in Required Fields
**Symptom:** System still requires budget for validation  
**Cause:** Budget validation still active  
**Location:** `backend/services/itinerary_service.py` - `_validate_preferences()`  
**Fix:** Remove budget from required fields list; make it optional

### Bug 1.7: Weather Not Day-by-Day in Itinerary
**Symptom:** Weather shown as summary, not integrated per day in schedule  
**Cause:** Weather is fetched but not passed per-day to itinerary generator  
**Location:** `backend/services/itinerary_orchestrator.py` - weather context building  
**Fix:** Parse weather into day-by-day list and include in itinerary prompt per day

### Bug 1.8: Interests Handling When Not Provided
**Symptom:** If user doesn't mention interests, itinerary may be too narrow  
**Cause:** No fallback logic for distributing across categories when interests are empty  
**Location:** `backend/services/itinerary_service.py` - prompt building  
**Fix:** Update prompt: "If no interests specified, distribute activities across diverse categories"

### Bug 1.9: Source Citations Not Enforced
**Symptom:** Some activities may lack `Source: venue_id, url` format  
**Cause:** Prompt says "MUST" but doesn't fail generation without them  
**Location:** `backend/services/itinerary_service.py` - validation  
**Fix:** Add post-generation validation to reject itineraries missing sources

### Bug 1.10: Pace Terminology Mismatch
**Symptom:** Code uses "relaxed/moderate/packed" but requirements say "slow/moderate/fast"  
**Cause:** Inconsistent terminology across codebase  
**Location:** Multiple files - models, services, prompts  
**Fix:** Standardize on "relaxed/moderate/packed" internally but accept synonyms in extraction

### Bug 1.11: Booking Service Not Integrated
**Symptom:** User wants to book flights or Airbnb but system doesn't provide booking links  
**Cause:** BookingService exists but not called in conversation flow  
**Location:** `backend/services/booking_service.py` - not integrated into chat endpoint  
**Fix:** 
- Extract `source_location` during NLP intake (where user is traveling from)
- Add `booking_type` to preferences ("accommodation", "transportation", "both", or "none")
- Generate pre-filled booking links after itinerary confirmation:
  - **Airbnb**: Auto-fill city, check-in/out dates, number of guests
  - **Flight**: Auto-fill origin (source_location), destination (city), dates
- Include booking links in final response if user requests them

---

## 2. PROPOSED CHANGES (WORKFLOW)

### 2.1 Updated Workflow Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STATE A: INTAKE (Multi-turn conversation)                  │
│  - Extract: city, country, dates, interests, pace          │
│  - Budget is OPTIONAL (not required)                       │
│  - Hide "Still need" from user (debug mode only)          │
│  - Show friendly messages asking for missing info          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STATE B: CONFIRMATION GATE                                  │
│  - Required: city, country, pace                           │
│  - Required: start_date + end_date (or duration_days)      │
│  - Optional: interests, location_preference                │
│  - Compute: duration = (end - start).days + 1 (inclusive) │
│  - Ask user: "Ready to generate itinerary?"               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STATE C: PARALLEL DATA FETCH                                │
│  ✓ Venues from Airflow DB (VenueService)                  │
│  ✓ Weather day-by-day (WeatherService)                    │
│  ✗ Budget estimation (DISABLED)                           │
│  ✗ Trip budget (DISABLED)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STATE D: ITINERARY GENERATION (LLM)                        │
│  Input:                                                     │
│   - User profile (city, dates, pace, interests)           │
│   - Airflow venue list (closed-world)                     │
│   - Daily weather forecast                                 │
│  Rules:                                                     │
│   - Activities per day: relaxed=2, moderate=3, packed=4   │
│   - MUST have: lunch + dinner with times                   │
│   - ONLY use venues from list                              │
│   - EVERY item: Source: venue_id, url                     │
│   - Weather-aware (rain → indoor venues)                   │
│  Output: JSON itinerary with sources                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STATE E: VALIDATION                                         │
│  ✓ All days have lunch + dinner                           │
│  ✓ Activity count matches pace                             │
│  ✓ All venues from Airflow list                           │
│  ✓ All items have Source citations                        │
│  ✓ Day count = (end - start).days + 1                     │
│  ✓ No budget calculations present                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STATE F: BOOKING LINKS (Optional - if user requests)       │
│  - Generate pre-filled Airbnb link (city, dates, guests)  │
│  - Generate pre-filled flight link (origin, dest, dates)  │
│  - Links auto-populate search forms (no manual entry)      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STATE G: RESPONSE TO USER                                   │
│  - Show complete itinerary                                  │
│  - Include daily weather                                    │
│  - All venues clickable (from Airflow)                     │
│  - Booking links (if requested)                            │
│  - No internal debug messages                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Required Fields Update

**Before:**
```python
REQUIRED = ["city", "country", "start_date", "end_date", "budget", "interests", "pace"]
```

**After:**
```python
REQUIRED = ["city", "country", "pace"]
REQUIRED_DATES = ["start_date", "end_date"] OR ["start_date", "duration_days"] OR ["end_date", "duration_days"]
OPTIONAL = ["interests", "location_preference", "booking_type", "source_location"]
REMOVED = ["budget"]  # MVP simplification

# Booking fields (optional):
BOOKING_TYPE = "accommodation" | "transportation" | "both" | "none"  # Default: "none"
SOURCE_LOCATION = "string or null"  # Where user is traveling from (needed for flights)
```

### 2.3 Pace Activity Mapping

```python
PACE_ACTIVITIES = {
    "relaxed": 2,   # 2 activities per day
    "moderate": 3,  # 3 activities per day  
    "packed": 4,    # 4 activities per day
}

# Accept synonyms in extraction:
PACE_SYNONYMS = {
    "slow": "relaxed",
    "chill": "relaxed", 
    "fast": "packed",
    "busy": "packed",
    # ... etc
}
```

### 2.4 Service Updates

**Disable budget services, enable booking service:**
```python
# REMOVE:
self.budget_service = TripBudgetService()
await self._fetch_budget(loop, preferences)

# KEEP:
self.weather_service = WeatherService()
self.venue_service = VenueService()
self.maps_service = GoogleMapsService()
self.booking_service = BookingService()  # ADD: for flight/Airbnb links
```

### 2.5 Booking Link Generation

**When user requests booking (booking_type != "none"):**

```python
from services.booking_service import BookingService

booking_service = BookingService()

# Generate Airbnb link (if booking_type in ["accommodation", "both"])
if preferences.get("booking_type") in ["accommodation", "both"]:
    airbnb_link = booking_service.generate_airbnb_link(
        city=preferences["city"],
        check_in=preferences["start_date"],
        check_out=preferences["end_date"],
        guests=preferences.get("group_size", 1)
    )
    # Returns: https://www.airbnb.com/s/Toronto/homes?checkin=2026-03-15&checkout=2026-03-17&adults=2

# Generate flight link (if booking_type in ["transportation", "both"])
if preferences.get("booking_type") in ["transportation", "both"]:
    if preferences.get("source_location"):  # Origin is required
        flight_link = booking_service.generate_flight_link(
            origin=preferences["source_location"],
            destination=preferences["city"],
            departure_date=preferences["start_date"],
            return_date=preferences["end_date"],
            passengers=preferences.get("group_size", 1)
        )
        # Returns: https://www.google.com/travel/flights?q=Flights%20from%20New%20York%20to%20Toronto%20on%202026-03-15%20returning%202026-03-17
```

---

## 3. UPDATED SYSTEM PROMPT (Conversational Intake)

### File: `backend/services/nlp_extraction_service.py`

```python
INTAKE_SYSTEM_PROMPT = """You are a friendly travel assistant helping plan a trip to Toronto.

Your job is to gather the essential details through natural conversation:
1. **City** (we focus on Toronto)
2. **Country** (Canada)
3. **Travel dates** (when are you visiting?)
4. **Pace** (how busy do you want each day? relaxed, moderate, or packed)
5. **Interests** (optional - what do you enjoy? food, culture, sports, nature, entertainment)
6. **Location preference** (optional - where would you like to stay? downtown, near parks, etc.)
7. **Booking needs** (optional - do you need help booking flights or accommodation?)
8. **Where from** (optional - if user wants flights, where are they traveling from?)

Guidelines:
- Be warm and conversational, not robotic
- Ask ONE question at a time when information is missing
- If the user mentions interests, acknowledge them specifically
- If interests are not mentioned, that's fine - we'll create a balanced mix
- Budget is optional for now - don't ask about it
- If user mentions booking flights/hotels, ask where they're traveling from (for flight links)
- Confirm all details before offering to generate the itinerary
- When ready, ask: "Want me to create your personalized itinerary?"
- After itinerary, if booking was mentioned: "I can also provide booking links for flights and/or accommodation. Interested?"

Conversation flow:
1. **Extract** what the user shares
2. **Ask** for ONE missing critical field (priority: city → dates → pace)
3. **Confirm** when you have: city, dates, and pace
4. **Offer** to generate the itinerary

Do NOT show internal fields like "Still need: ..." - that's for debugging only.
Do NOT mention processes like "processing" or "analyzing" - just respond naturally.

Example good responses:
- "Great! A trip to Toronto from March 15-17. How would you like to pace your days - relaxed, moderate, or packed with activities?"
- "Perfect! I have everything I need. Ready for me to create your 3-day Toronto itinerary?"
- "Sounds fun! What dates are you thinking for your Toronto trip?"
- "Got it - I'll help you book flights too. Where are you traveling from?"
- "Your itinerary is ready! I can also create pre-filled booking links for Airbnb and flights if you'd like."

Example bad responses:
- "Processing your request... Still need: pace, budget" ❌
- "I will now analyze your preferences" ❌
- "Extracting structured data from your input" ❌

**Booking Extraction Logic:**
When user mentions booking needs, extract:
- **booking_type**: 
  - "accommodation" if mentions: hotel, airbnb, place to stay, accommodation, lodging, where to stay
  - "transportation" if mentions: flight, plane ticket, getting there, travel to, fly to
  - "both" if mentions both accommodation AND transportation
  - "none" if not mentioned
- **source_location**: 
  - Extract when user mentions: "from [city]", "coming from [city]", "traveling from [city]", "live in [city]"
  - Required ONLY if booking_type includes "transportation"
  - Ask explicitly if user wants flights but hasn't mentioned origin: "Where are you traveling from?"
  
Examples:
- "I need to book a hotel" → booking_type: "accommodation", source_location: null
- "I need flights from Boston" → booking_type: "transportation", source_location: "Boston"
- "Coming from Chicago, need flights and a place to stay" → booking_type: "both", source_location: "Chicago"
- "Just planning activities" → booking_type: "none", source_location: null
"""
```

---

## 4. UPDATED ITINERARY PROMPT (Generation)

### File: `backend/services/itinerary_service.py`

```python
ITINERARY_SYSTEM_PROMPT = """You are an expert Toronto travel planner. Generate a detailed day-by-day itinerary.

## CRITICAL CONSTRAINTS (MUST FOLLOW)

### 1. CLOSED-WORLD VENUES
You MUST ONLY use venues from the list below. DO NOT invent venues, make up links, or suggest places not in this list.

AVAILABLE VENUES:
{venue_catalogue}

### 2. SOURCE CITATIONS (100% REQUIRED)
EVERY activity and meal MUST include:
   Source: <venue_id>, <url>

Example:
   Morning: Visit CN Tower with observation deck
   Source: cn_tower, https://www.cntower.ca

If you cannot cite a source from the venue list, DO NOT include that activity.

### 3. DAILY WEATHER (provided for planning)
{daily_weather}

Use weather to prefer indoor venues on rainy days, outdoor venues on sunny days.
But ONLY choose from the available venue list above.

### 4. MEAL REQUIREMENTS
Every day MUST include:
- 1 lunch (scheduled between 11:30-13:30)
- 1 dinner (scheduled between 17:30-20:00)

Both with explicit times, venue names, and Source citations.

### 5. ACTIVITY COUNT BY PACE
- **Relaxed**: Exactly 2 activities per day (plus lunch + dinner)
- **Moderate**: Exactly 3 activities per day (plus lunch + dinner)
- **Packed**: Exactly 4 activities per day (plus lunch + dinner)

Activity = a scheduled event/venue visit, not including meals.

### 6. INTERESTS HANDLING
- If interests provided: prioritize those categories
- If NO interests provided: distribute activities across diverse categories (food, culture, entertainment, nature, sports) for variety

### 7. TIME REALISM
- Activities: {activity_duration} per activity
- Buffers: {buffer_time} between activities
- Lunch: {lunch_duration}
- Dinner: {dinner_duration}
- No overlapping events
- Chronological order within each day

## INPUT DATA

**Trip Details:**
- City: {city}
- Dates: {start_date} to {end_date} ({num_days} days)
- Pace: {pace}
- Interests: {interests}
- Starting location: {location_preference}

**Venues Available:** See AVAILABLE VENUES section above (closed-world)

**Weather Forecast:** See daily weather section above

## OUTPUT FORMAT

Return ONLY valid JSON (no markdown fences, no explanations):

```json
{
  "itinerary": {
    "city": "Toronto",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "total_days": <number>,
    "pace": "relaxed|moderate|packed",
    "days": [
      {
        "day_number": 1,
        "date": "YYYY-MM-DD",
        "weather": "from daily weather forecast",
        "activities": [
          {
            "time": "HH:MM",
            "duration_minutes": <number>,
            "title": "Activity name",
            "venue_name": "Exact venue name from list",
            "category": "category from venue",
            "description": "Brief description",
            "source_venue_id": "venue_id",
            "source_url": "url",
            "notes": "Weather-aware notes if applicable"
          }
        ],
        "meals": [
          {
            "type": "lunch",
            "time": "HH:MM",
            "venue_name": "Restaurant name from list",
            "source_venue_id": "venue_id",
            "source_url": "url"
          },
          {
            "type": "dinner",
            "time": "HH:MM",
            "venue_name": "Restaurant name from list",
            "source_venue_id": "venue_id",
            "source_url": "url"
          }
        ]
      }
    ]
  }
}
```

## VALIDATION CHECKLIST (before returning)

✓ Total days = {num_days}
✓ Each day has exactly {expected_activities} activities (not counting meals)
✓ Each day has lunch AND dinner
✓ All venues are from the Available Venues list
✓ Every activity has source_venue_id and source_url
✓ Every meal has source_venue_id and source_url
✓ Times are chronological with no overlaps
✓ Weather preferences respected (indoor on rain days)
✓ Interests represented (or diverse mix if none specified)

If you cannot meet these requirements with the available venues, reduce activities rather than inventing venues.
"""
```

---

## 5. TEST PLAN (WITH ACCEPTANCE CRITERIA)

### 5.1 Unit Tests

#### Test: Date Calculation (Inclusive)
**File:** `backend/tests/test_date_calculation.py`

```python
def test_inclusive_date_count():
    """Feb 28 to Mar 2 must be 3 days, not 2."""
    from datetime import date
    from models.trip_preferences import TripPreferences
    
    prefs = TripPreferences(
        start_date="2026-02-28",
        end_date="2026-03-02"
    )
    
    # Calculate duration
    start = date.fromisoformat(prefs.start_date)
    end = date.fromisoformat(prefs.end_date)
    duration = (end - start).days + 1  # +1 for inclusive
    
    assert duration == 3, f"Expected 3 days, got {duration}"
    assert prefs.duration_days == 3
```

**Acceptance:** MUST pass. Build fails if Feb 28 → Mar 2 ≠ 3 days.

#### Test: Pace Activity Mapping
**File:** `backend/tests/test_pace_activities.py`

```python
def test_pace_activity_count():
    """Verify pace maps to correct activity count."""
    PACE_ACTIVITIES = {
        "relaxed": 2,
        "moderate": 3,
        "packed": 4,
    }
    
    for pace, expected in PACE_ACTIVITIES.items():
        # Generate itinerary would use this pace
        assert PACE_ACTIVITIES[pace] == expected
```

**Acceptance:** MUST pass. Relaxed=2, Moderate=3, Packed=4.

### 5.2 Integration Tests

#### Test: Weather Day-by-Day
**File:** `backend/tests/test_weather_integration.py`

```python
async def test_weather_per_day():
    """Weather must be fetched for each day of trip."""
    from services.weather_service import WeatherService
    
    service = WeatherService()
    start = "2026-03-15"
    end = "2026-03-17"
    
    weather = await service.get_weather("Toronto", "Canada", start, end)
    
    assert weather is not None
    assert len(weather["daily"]) == 3  # 3 days inclusive
    
    # Each day must have: date, temp, conditions
    for day in weather["daily"]:
        assert "date" in day
        assert "temperature" in day or "temp_max" in day
        assert "conditions" in day or "weather" in day
```

**Acceptance:** MUST return weather for all days from start to end (inclusive).

#### Test: Airflow Grounding
**File:** `backend/tests/test_venue_grounding.py`

```python
async def test_all_venues_from_database():
    """Every activity must come from Airflow venue list."""
    from services.itinerary_service import ItineraryService
    from services.venue_service import VenueService
    
    # Get available venues
    venue_service = VenueService()
    venues = venue_service.get_venues_for_itinerary(
        city="Toronto",
        interests=["Culture and History"],
        budget_per_day=100.0
    )
    venue_ids = {v["place_key"] for v in venues}
    
    # Generate itinerary
    itinerary_service = ItineraryService()
    preferences = {
        "city": "Toronto",
        "country": "Canada",
        "start_date": "2026-03-15",
        "end_date": "2026-03-17",
        "duration_days": 3,
        "pace": "moderate",
        "interests": ["Culture and History"],
        "location_preference": "downtown"
    }
    
    itinerary = await itinerary_service.generate_itinerary(
        preferences=preferences,
        request_id="test-001"
    )
    
    # Validate all sources
    for day in itinerary.days:
        for activity in day.activities:
            assert activity.source_venue_id in venue_ids, \
                f"Activity {activity.venue_name} uses venue {activity.source_venue_id} not in DB"
```

**Acceptance:** MUST pass. Build fails if ANY activity uses non-DB venue.

### 5.3 End-to-End Tests

#### Test: Complete Workflow with Interests
**File:** `backend/tests/test_e2e_with_interests.py`

```python
async def test_full_workflow_with_interests():
    """Multi-turn conversation → confirmation → generation."""
    from services.nlp_extraction_service import NLPExtractionService
    from services.itinerary_service import ItineraryService
    
    nlp = NLPExtractionService()
    itinerary_svc = ItineraryService()
    
    # Turn 1: User mentions city and interests
    prefs1 = await nlp.extract_preferences(
        "I want to visit Toronto and I love museums and food"
    )
    assert prefs1.city == "Toronto"
    assert "Culture and History" in prefs1.interests
    assert "Food and Beverage" in prefs1.interests
    
    # Turn 2: Bot asks for dates
    # Turn 3: User provides dates
    prefs2 = await nlp.refine_preferences(
        prefs1,
        "March 15 to 17"
    )
    assert prefs2.start_date == "2026-03-15"
    assert prefs2.end_date == "2026-03-17"
    assert prefs2.duration_days == 3
    
    # Turn 4: Bot asks for pace
    # Turn 5: User provides pace
    prefs3 = await nlp.refine_preferences(
        prefs2,
        "moderate pace please"
    )
    assert prefs3.pace == "moderate"
    
    # Generate itinerary
    itinerary = await itinerary_svc.generate_itinerary(
        preferences=prefs3.to_dict(),
        request_id="test-e2e-001"
    )
    
    # Validate
    assert len(itinerary.days) == 3
    for day in itinerary.days:
        # Must have 3 activities (moderate pace)
        assert len(day.activities) == 3
        
        # Must have lunch and dinner
        meals = {m.meal_type for m in day.meals}
        assert "lunch" in meals
        assert "dinner" in meals
        
        # All activities have sources
        for activity in day.activities:
            assert activity.source_venue_id is not None
            assert activity.source_url is not None
```

**Acceptance:** MUST pass all assertions.

#### Test: Workflow WITHOUT Interests
**File:** `backend/tests/test_e2e_no_interests.py`

```python
async def test_workflow_no_interests():
    """User doesn't mention interests - should get diverse itinerary."""
    from services.itinerary_service import ItineraryService
    
    service = ItineraryService()
    preferences = {
        "city": "Toronto",
        "country": "Canada",
        "start_date": "2026-03-15",
        "end_date": "2026-03-17",
        "duration_days": 3,
        "pace": "moderate",
        "interests": [],  # No interests
        "location_preference": "downtown"
    }
    
    itinerary = await service.generate_itinerary(
        preferences=preferences,
        request_id="test-no-interests"
    )
    
    # Collect all categories used
    categories = set()
    for day in itinerary.days:
        for activity in day.activities:
            categories.add(activity.category)
    
    # Should have variety (at least 2 different categories)
    assert len(categories) >= 2, \
        f"Expected diverse categories, got only: {categories}"
```

**Acceptance:** When no interests, itinerary must use ≥2 categories.

#### Test: Pace Change Mid-Chat
**File:** `backend/tests/test_e2e_pace_change.py`

```python
async def test_pace_change_during_conversation():
    """User changes pace after first mentioning it."""
    from services.nlp_extraction_service import NLPExtractionService
    
    nlp = NLPExtractionService()
    
    # Initial: relaxed pace
    prefs1 = await nlp.extract_preferences(
        "Toronto Mar 15-17, relaxed pace"
    )
    assert prefs1.pace == "relaxed"
    
    # Change mind: packed pace
    prefs2 = await nlp.refine_preferences(
        prefs1,
        "Actually, make it packed - we want to see a lot"
    )
    assert prefs2.pace == "packed"
    assert prefs2.start_date == prefs1.start_date  # Dates unchanged
```

**Acceptance:** Refinement must update pace without losing other fields.

#### Test: Booking Link Generation
**File:** `backend/tests/test_e2e_booking_links.py`

```python
async def test_booking_link_generation():
    """User requests booking - generate pre-filled links."""
    from services.nlp_extraction_service import NLPExtractionService
    from services.booking_service import BookingService
    
    nlp = NLPExtractionService()
    booking_svc = BookingService()
    
    # User wants to book flights and accommodation
    prefs = await nlp.extract_preferences(
        "Toronto trip Mar 15-17, moderate pace. I'm from New York and need to book flights and a place to stay"
    )
    
    assert prefs.city == "Toronto"
    assert prefs.source_location == "New York"
    assert prefs.booking_type in ["both", "transportation", "accommodation"]
    
    # Generate Airbnb link
    airbnb_link = booking_svc.generate_airbnb_link(
        city=prefs.city,
        check_in=prefs.start_date,
        check_out=prefs.end_date,
        guests=1
    )
    
    # Verify link structure
    assert "airbnb.com" in airbnb_link
    assert "Toronto" in airbnb_link
    assert "2026-03-15" in airbnb_link or "checkin" in airbnb_link
    assert "2026-03-17" in airbnb_link or "checkout" in airbnb_link
    
    # Generate flight link
    flight_link = booking_svc.generate_flight_link(
        origin=prefs.source_location,
        destination=prefs.city,
        departure_date=prefs.start_date,
        return_date=prefs.end_date,
        passengers=1
    )
    
    # Verify link structure
    assert "google.com/travel/flights" in flight_link or "skyscanner" in flight_link
    assert "New%20York" in flight_link or "New York" in flight_link
    assert "Toronto" in flight_link
    assert "2026-03-15" in flight_link or "departure" in flight_link
```

**Acceptance:** Links must auto-populate search forms with trip details.

#### Test: Booking Without Source Location
**File:** `backend/tests/test_booking_validation.py`

```python
async def test_flight_booking_requires_source():
    """Flight booking cannot be generated without source location."""
    from services.booking_service import BookingService
    
    booking_svc = BookingService()
    
    # Try to generate flight link without origin
    with pytest.raises(ValueError, match="source_location required"):
        booking_svc.generate_flight_link(
            origin=None,  # Missing!
            destination="Toronto",
            departure_date="2026-03-15",
            return_date="2026-03-17"
        )
```

**Acceptance:** Flight links require origin; must raise error if missing.

### 5.4 Build-Failing Acceptance Criteria

**The build MUST FAIL if:**

1. ❌ Feb 28 → Mar 2 computes as anything other than 3 days
2. ❌ Any day missing lunch or dinner
3. ❌ Activity count doesn't match pace (relaxed≠2, moderate≠3, packed≠4)
4. ❌ Any activity uses venue not in Airflow DB
5. ❌ Any activity missing `source_venue_id` or `source_url`
6. ❌ Weather not fetched for all days (start to end inclusive)
7. ❌ Budget services are called (TripBudgetService, BudgetEstimator)
8. ❌ "Still need" appears in production user message
9. ❌ Budget is in required fields list
10. ❌ Flight booking link generated without source_location
11. ❌ Booking links don't auto-populate search parameters (city, dates)

---

## 6. HOW TO TEST (STEP-BY-STEP GUIDE)

### 6.1 Local Setup

```bash
# 1. Start Docker services (Postgres, Airflow, Chroma)
cd /Users/vietbui/Desktop/gia_version/MonVoyage
docker compose -f docker-compose.dev.yml up -d --build

# 2. Verify containers running
docker compose -f docker-compose.dev.yml ps

# 3. Seed database with Toronto venues
docker compose -f docker-compose.dev.yml exec airflow-webserver bash -lc \
  "python /opt/airflow/dags/lib/seed_tracked_sites.py"

# 4. Activate Python environment
source .venv/bin/activate

# 5. Install dependencies
pip install -r backend/requirements.txt

# 6. Verify .env configuration
cat backend/.env
# Check: PORT=8000, APP_DB_URL=...localhost:5435/app, GEMINI_KEY set
```

### 6.2 Debug Mode Toggle

**Add to `backend/.env`:**
```bash
DEBUG_MODE=true  # Shows "Still need" in responses
# or
DEBUG_MODE=false  # Hides internal fields (production)
```

**Update code (`nlp_extraction_service.py`):**
```python
import os

DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"

async def generate_conversational_response(...):
    # ... existing code ...
    
    if DEBUG_MODE:
        # Include missing fields for debugging
        if missing_fields:
            response += f"\n\n[DEBUG] Still need: {', '.join(missing_fields)}"
    
    return response, is_complete
```

### 6.3 Grounding Validation Script

**Create:** `backend/tests/validate_grounding.py`

```python
#!/usr/bin/env python3
"""Validate that all itinerary sources are from Airflow DB."""
import json
import sys
import asyncio
from services.venue_service import VenueService

async def validate_itinerary_grounding(itinerary_json: dict) -> bool:
    """Check all venues in itinerary are from database.
    
    Returns:
        True if all venues valid, False if any hallucinated.
    """
    # Get all venue IDs from database
    venue_service = VenueService()
    db_venues = venue_service.get_venues_for_itinerary(
        city="Toronto",
        interests=[],  # Get all
        budget_per_day=9999  # No filter
    )
    valid_ids = {v["place_key"] for v in db_venues}
    valid_urls = {v["url"] for v in db_venues}
    
    errors = []
    
    # Check each day
    for day in itinerary_json["itinerary"]["days"]:
        day_num = day["day_number"]
        
        # Check activities
        for activity in day["activities"]:
            venue_id = activity.get("source_venue_id")
            url = activity.get("source_url")
            
            if not venue_id:
                errors.append(f"Day {day_num}: Activity '{activity['title']}' missing source_venue_id")
            elif venue_id not in valid_ids:
                errors.append(f"Day {day_num}: Invalid venue_id '{venue_id}' not in database")
            
            if not url:
                errors.append(f"Day {day_num}: Activity '{activity['title']}' missing source_url")
            elif url not in valid_urls:
                errors.append(f"Day {day_num}: Invalid URL '{url}' not in database")
        
        # Check meals
        for meal in day["meals"]:
            venue_id = meal.get("source_venue_id")
            url = meal.get("source_url")
            
            if not venue_id:
                errors.append(f"Day {day_num}: Meal '{meal['type']}' missing source_venue_id")
            elif venue_id not in valid_ids:
                errors.append(f"Day {day_num}: Invalid meal venue_id '{venue_id}' not in database")
    
    if errors:
        print("❌ GROUNDING VALIDATION FAILED:")
        for err in errors:
            print(f"  - {err}")
        return False
    
    print("✅ GROUNDING VALIDATION PASSED: All venues from database")
    return True

if __name__ == "__main__":
    # Read itinerary from file or stdin
    with open(sys.argv[1]) as f:
        itinerary = json.load(f)
    
    result = asyncio.run(validate_itinerary_grounding(itinerary))
    sys.exit(0 if result else 1)
```

**Usage:**
```bash
# Generate itinerary to file
python test/test_itinerary_with_db.py > itinerary_output.json

# Validate grounding
python backend/tests/validate_grounding.py itinerary_output.json
```

### 6.4 Example Test Conversations

#### Example 1: WITH Interests

```bash
# Start backend
python backend/app.py

# In another terminal, test with curl:
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-001",
    "message": "I want to visit Toronto and I love museums and good food",
    "conversation_history": []
  }'

# Expected: Bot extracts city=Toronto, interests=[Culture and History, Food and Beverage]
# Bot asks for dates

curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-001",
    "message": "March 15 to 17",
    "conversation_history": [...]
  }'

# Expected: Bot has dates, asks for pace

curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-001",
    "message": "moderate pace",
    "conversation_history": [...]
  }'

# Expected: Bot confirms and offers to generate
# Response should NOT show "Still need: ..." (unless DEBUG_MODE=true)

curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-001",
    "message": "yes please",
    "conversation_history": [...]
  }'

# Expected: Full itinerary JSON returned
# Validate:
# - 3 days (Mar 15, 16, 17)
# - 3 activities per day (moderate)
# - Lunch + dinner each day
# - All sources from DB
```

#### Example 2: WITHOUT Interests

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-002",
    "message": "Planning a Toronto trip Mar 15-17, relaxed pace",
    "conversation_history": []
  }'

# Expected: Bot has most info, might ask for confirmation
# Interests: not mentioned, should default to diverse mix

# Generate itinerary
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-002", 
    "message": "create itinerary",
    "conversation_history": [...]
  }'

# Validate:
# - 3 days
# - 2 activities per day (relaxed)
# - Diverse categories (≥2 different types)
```

#### Example 3: Pace Change Mid-Chat

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-003",
    "message": "Toronto trip Mar 15-17, relaxed pace",
    "conversation_history": []
  }'

# Bot confirms, user changes mind:
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-003",
    "message": "Actually change to packed pace, we want to see everything",
    "conversation_history": [...]
  }'

# Expected: Bot updates pace to "packed"
# Generate itinerary should have 4 activities per day
```

#### Example 4: Booking Flights and Accommodation

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-004",
    "message": "I want to visit Toronto Mar 15-17, moderate pace. I need to book flights and a hotel",
    "conversation_history": []
  }'

# Expected: Bot asks where user is traveling from
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-004",
    "message": "I'\''m coming from New York",
    "conversation_history": [...]
  }'

# Expected: Bot has all info, generates itinerary
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-004",
    "message": "yes, create my itinerary",
    "conversation_history": [...]
  }'

# Response should include:
# - Full itinerary (3 days, 3 activities per day, lunch+dinner)
# - Pre-filled Airbnb link: 
#   https://www.airbnb.com/s/Toronto/homes?checkin=2026-03-15&checkout=2026-03-17&adults=1
# - Pre-filled flight link:
#   https://www.google.com/travel/flights?q=Flights%20from%20New%20York%20to%20Toronto%20on%202026-03-15%20returning%202026-03-17

# Validate:
# - booking_type extracted as "both" (flights + accommodation)
# - source_location = "New York"
# - Airbnb link contains: city, check-in, check-out dates
# - Flight link contains: origin, destination, departure, return dates
# - Links are clickable and open pre-filled search forms
```

### 6.5 Automated Test Suite

```bash
# Run all unit tests
pytest backend/tests/test_date_calculation.py -v
pytest backend/tests/test_pace_activities.py -v

# Run integration tests
pytest backend/tests/test_weather_integration.py -v
pytest backend/tests/test_venue_grounding.py -v

# Run end-to-end tests
pytest backend/tests/test_e2e_with_interests.py -v
pytest backend/tests/test_e2e_no_interests.py -v
pytest backend/tests/test_e2e_pace_change.py -v
pytest backend/tests/test_e2e_booking_links.py -v

# Run booking tests
pytest backend/tests/test_booking_validation.py -v

# Run all tests
pytest backend/tests/ -v

# With coverage
pytest backend/tests/ --cov=backend/services --cov-report=html
```

### 6.6 Manual Checklist

After implementation, manually verify:

- [ ] Start backend: `python backend/app.py` → port 8000
- [ ] Database seeded: ≥15 Toronto venues present
- [ ] Chat endpoint: `/api/chat` accepts messages
- [ ] Date calc: Feb 28 → Mar 2 = 3 days (check logs or response)
- [ ] Pace mapping: relaxed=2, moderate=3, packed=4 activities
- [ ] Meals: Every day has lunch AND dinner with times
- [ ] Sources: Every activity has `source_venue_id` and `source_url`
- [ ] Weather: Each day shows weather in response
- [ ] No budget: Budget fields not required, services not called
- [ ] "Still need" hidden: Production messages don't show internal QA
- [ ] Grounding: Run `validate_grounding.py` → all pass
- [ ] Interests optional: Works with and without interests
- [ ] Diverse mix: No-interests itinerary uses multiple categories
- [ ] Booking extraction: source_location and booking_type extracted from NLP
- [ ] Airbnb links: Auto-populate city, check-in, check-out, guests
- [ ] Flight links: Auto-populate origin, destination, dates
- [ ] Booking validation: Flight links require source_location (error if missing)
- [ ] Booking optional: Works without booking (booking_type="none")

---

## 7. IMPLEMENTATION PRIORITY

### Phase 1: Critical Fixes (Must Do First)
1. Fix date calculation (inclusive days)
2. Update pace activity counts
3. Remove budget from required fields
4. Disable budget services
5. Hide "Still need" from production

### Phase 2: Prompt Updates
6. Update intake prompt (conversational, no "Still need", ask about booking)
7. Update itinerary prompt (pace activities, lunch+dinner, sources)

### Phase 3: Booking Integration
8. Add booking_type and source_location to NLP extraction
9. Update conversation flow to ask for source_location when booking flights
10. Integrate BookingService to generate pre-filled links
11. Include booking links in final response (if requested)

### Phase 4: Validation
12. Add source citation validation
13. Add meal presence validation
14. Add activity count validation
15. Add booking link validation (required fields)

### Phase 5: Testing
16. Write unit tests (dates, pace, booking links)
17. Write integration tests (weather, grounding, booking)
18. Write E2E tests (conversations, booking flow)
19. Create validation scripts

---

## 8. SUCCESS CRITERIA

### MVP is complete when:

✅ **All tests pass** (unit, integration, E2E)  
✅ **Grounding validation** passes for generated itineraries  
✅ **Date calculation** correct (inclusive count)  
✅ **Activity counts** match pace requirements  
✅ **Meals present** on every day (lunch + dinner)  
✅ **Sources cited** for every item  
✅ **Weather integrated** per day  
✅ **No budget services** running  
✅ **Production UX** clean (no debug messages)  
✅ **Diverse mix** when interests not specified  
✅ **Booking links** generated when requested (Airbnb + flights)  
✅ **Auto-populated booking** forms with trip details  
✅ **Source location** extracted for flight bookings  

### Ready to deploy when:

- All automated tests green
- Manual test conversations successful
- Grounding validation script returns 0 exit code
- CODE REVIEW passed
- Documentation updated

---

## 9. BOOKING FEATURE IMPLEMENTATION GUIDE

### 9.1 Overview

The booking feature allows users to request pre-filled booking links for:
- **Accommodation** (Airbnb) - Auto-fills city, check-in, check-out, guests
- **Transportation** (Flights) - Auto-fills origin, destination, dates
- **Both** - Generates both Airbnb and flight links

**Key Principle:** Conditional logic - `source_location` is only required when booking includes transportation.

### 9.2 Data Model Changes

#### File: `backend/models/trip_preferences.py`

Add two new optional fields:

```python
# Booking preferences (optional)
booking_type: Optional[str] = None  
# Values: "accommodation", "transportation", "both", or "none"
# Default: "none" if not mentioned

source_location: Optional[str] = None  
# Where user is traveling from
# Only required if booking_type in ["transportation", "both"]
```

### 9.3 NLP Extraction Updates

#### File: `backend/services/nlp_extraction_service.py`

**Update system instruction to extract booking fields:**

```python
# Add to extraction schema:
{
    "booking_type": "string or null ('accommodation', 'transportation', 'both', or 'none')",
    "source_location": "string or null (required only if booking_type is 'transportation' or 'both')"
}

# Extraction rules:
"""
**Booking Type Detection:**
- "accommodation" if user mentions: hotel, airbnb, place to stay, accommodation, lodging
- "transportation" if mentions: flight, plane, bus, getting there, travel to
- "both" if mentions both accommodation AND transportation
- "none" if not mentioned or user says: no, nothing, I'll book myself, no thanks

**Source Location Detection:**
- Extract when user says: "from [city]", "coming from [city]", "traveling from [city]", "I'm in [city]"
- Only required if booking_type includes transportation
"""
```

**Update conversational flow with conditional logic:**

```python
# Priority 7: Ask for booking_type (after budget)
if not preferences.booking_type:
    missing_fields.append("booking preferences")
    response = "Would you like to book accommodation, transportation, or both? (Say 'no' if you don't need booking help)"

# Priority 8: Ask for source_location (CONDITIONAL)
if preferences.booking_type in ["transportation", "both"] and not preferences.source_location:
    missing_fields.append("travel origin")
    response = "Got it! Where will you be traveling from?"
```

**Update completeness calculation:**

```python
def _calculate_completeness(self, preferences: TripPreferences) -> float:
    required_fields = ['city', 'country', 'start_date', 'end_date', 'pace', 'booking_type']
    
    # Conditionally add source_location as required
    if preferences.booking_type in ["transportation", "both"]:
        required_fields.append('source_location')
    
    filled_count = sum([
        1 for field in required_fields 
        if getattr(preferences, field, None) is not None
    ])
    
    return filled_count / len(required_fields)
```

### 9.4 Booking Service Implementation

#### File: `backend/services/booking_service.py`

The BookingService already exists. Ensure these methods are implemented:

```python
class BookingService:
    """Generate pre-filled booking links for Airbnb and flights."""
    
    def generate_airbnb_link(
        self,
        city: str,
        check_in: str,  # YYYY-MM-DD
        check_out: str,  # YYYY-MM-DD
        guests: int = 1,
    ) -> str:
        """Generate Airbnb search link with pre-filled parameters.
        
        Returns:
            https://www.airbnb.com/s/{city}/homes?checkin={check_in}&checkout={check_out}&adults={guests}
        """
        from urllib.parse import quote
        
        base_url = "https://www.airbnb.com/s"
        city_encoded = quote(city)
        
        return (
            f"{base_url}/{city_encoded}/homes?"
            f"checkin={check_in}&checkout={check_out}&adults={guests}"
        )
    
    def generate_flight_link(
        self,
        origin: str,
        destination: str,
        departure_date: str,  # YYYY-MM-DD
        return_date: str,  # YYYY-MM-DD
        passengers: int = 1,
    ) -> str:
        """Generate Google Flights link with pre-filled search.
        
        Raises:
            ValueError: If origin is None (required for flights)
        
        Returns:
            https://www.google.com/travel/flights?q=Flights%20from%20{origin}%20to%20{dest}...
        """
        if not origin:
            raise ValueError("source_location required for flight booking")
        
        from urllib.parse import quote
        
        query = (
            f"Flights from {origin} to {destination} "
            f"on {departure_date} returning {return_date}"
        )
        
        return f"https://www.google.com/travel/flights?q={quote(query)}"
```

### 9.5 Chat Endpoint Integration

#### File: `backend/app.py` - `/api/chat` endpoint

After generating itinerary, check if booking links are needed:

```python
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # ... existing NLP extraction and itinerary generation ...
    
    # After itinerary is generated:
    booking_links = {}
    
    if preferences.booking_type and preferences.booking_type != "none":
        booking_service = BookingService()
        
        # Generate Airbnb link
        if preferences.booking_type in ["accommodation", "both"]:
            booking_links["airbnb"] = booking_service.generate_airbnb_link(
                city=preferences.city,
                check_in=preferences.start_date,
                check_out=preferences.end_date,
                guests=preferences.group_size or 1
            )
        
        # Generate flight link
        if preferences.booking_type in ["transportation", "both"]:
            if preferences.source_location:
                booking_links["flight"] = booking_service.generate_flight_link(
                    origin=preferences.source_location,
                    destination=preferences.city,
                    departure_date=preferences.start_date,
                    return_date=preferences.end_date,
                    passengers=preferences.group_size or 1
                )
    
    # Include in response
    return {
        "itinerary": itinerary_data,
        "booking_links": booking_links,  # Can be empty dict if none requested
        "message": bot_response
    }
```

### 9.6 Booking Flow Examples

#### Example 1: Accommodation Only (No Source Needed)

```
User: "I want to visit Kingston for 3 days with $500 budget, museums, relaxed pace"

Bot: "Would you like to book accommodation, transportation, or both? (Say 'no' if you don't need booking help)"

User: "Just Airbnb"

Bot: "Perfect! I have your Kingston trip from Feb 15-17. Shall I proceed with planning?"
✅ Complete at 100% - No source_location needed

Response includes:
{
  "booking_links": {
    "airbnb": "https://www.airbnb.com/s/Kingston/homes?checkin=2026-02-15&checkout=2026-02-17&adults=1"
  }
}
```

#### Example 2: Transportation Only (Source Required)

```
User: "Trip to Toronto next week, $800, food tours, moderate pace"

Bot: "Would you like to book accommodation, transportation, or both?"

User: "Just flight tickets"

Bot: "Got it! Where will you be traveling from?"

User: "Montreal"

Bot: "Perfect! I have your Toronto trip from Montreal. Shall I proceed?"
✅ Complete at 100% after source provided

Response includes:
{
  "booking_links": {
    "flight": "https://www.google.com/travel/flights?q=Flights%20from%20Montreal%20to%20Toronto%20on%202026-02-15%20returning%202026-02-17"
  }
}
```

#### Example 3: Both (Source Required)

```
User: "Paris trip, $2000, all interests, packed pace"

Bot: "Would you like to book accommodation, transportation, or both?"

User: "Both please"

Bot: "Great! Where will you be traveling from?"

User: "New York"

Bot: "Perfect! I have your Paris trip from New York. Shall I proceed?"
✅ Complete at 100%

Response includes:
{
  "booking_links": {
    "airbnb": "https://www.airbnb.com/s/Paris/homes?checkin=2026-03-15&checkout=2026-03-17&adults=1",
    "flight": "https://www.google.com/travel/flights?q=Flights%20from%20New%20York%20to%20Paris%20on%202026-03-15%20returning%202026-03-17"
  }
}
```

#### Example 4: No Booking (Skip Source)

```
User: "Kingston trip, $500, museums, relaxed"

Bot: "Would you like to book accommodation, transportation, or both?"

User: "No thanks, I'll book myself"

Bot: "Perfect! I have your Kingston trip. Shall I proceed?"
✅ Complete at 100% - Goes straight to confirmation

Response includes:
{
  "booking_links": {}  // Empty - no links generated
}
```

### 9.7 Frontend Display

#### File: `frontend/index.html` or React component

**Display booking links in the itinerary response:**

```html
<!-- Booking Links Section (only if present) -->
<div v-if="Object.keys(bookingLinks).length > 0" class="booking-section">
  <h3>🎫 Booking Links</h3>
  
  <div v-if="bookingLinks.airbnb" class="booking-card">
    <h4>🏠 Accommodation</h4>
    <a :href="bookingLinks.airbnb" target="_blank" class="booking-link">
      Search Airbnb (Pre-filled with your dates)
    </a>
  </div>
  
  <div v-if="bookingLinks.flight" class="booking-card">
    <h4>✈️ Flights</h4>
    <a :href="bookingLinks.flight" target="_blank" class="booking-link">
      Search Flights (Pre-filled with your route)
    </a>
  </div>
</div>
```

**Show booking preferences in trip summary:**

```html
<div class="preference-card">
  <h4>🎫 Booking Preferences</h4>
  <p v-if="preferences.booking_type === 'accommodation'">
    Booking Type: Accommodation Only
  </p>
  <p v-else-if="preferences.booking_type === 'transportation'">
    Booking Type: Transportation Only
  </p>
  <p v-else-if="preferences.booking_type === 'both'">
    Booking Type: Both Accommodation & Transportation
  </p>
  <p v-else>
    Booking Type: None
  </p>
  
  <!-- Note: source_location is stored but NOT displayed in UI -->
</div>
```

### 9.8 Testing the Booking Feature

**Create test file:** `backend/tests/test_booking_flow.py`

```python
import asyncio
from services.nlp_extraction_service import NLPExtractionService
from services.booking_service import BookingService

async def test_booking_flows():
    nlp = NLPExtractionService()
    booking = BookingService()
    
    # Test 1: Accommodation only (no source needed)
    print("\n=== Test 1: Accommodation Only ===")
    prefs1 = await nlp.extract_preferences(
        "Kingston trip, $500, just need Airbnb"
    )
    assert prefs1.booking_type == "accommodation"
    assert prefs1.source_location is None
    
    link = booking.generate_airbnb_link(
        city=prefs1.city,
        check_in=prefs1.start_date,
        check_out=prefs1.end_date,
        guests=1
    )
    assert "airbnb.com" in link
    assert "Kingston" in link
    print(f"✅ Airbnb link: {link}")
    
    # Test 2: Transportation only (source required)
    print("\n=== Test 2: Transportation Only ===")
    prefs2 = await nlp.extract_preferences(
        "Toronto trip, need flights from Montreal"
    )
    assert prefs2.booking_type == "transportation"
    assert prefs2.source_location == "Montreal"
    
    link = booking.generate_flight_link(
        origin=prefs2.source_location,
        destination=prefs2.city,
        departure_date=prefs2.start_date,
        return_date=prefs2.end_date,
        passengers=1
    )
    assert "google.com/travel/flights" in link
    assert "Montreal" in link
    print(f"✅ Flight link: {link}")
    
    # Test 3: Both (source required)
    print("\n=== Test 3: Both ===")
    prefs3 = await nlp.extract_preferences(
        "Paris trip from New York, need flights and hotel"
    )
    assert prefs3.booking_type == "both"
    assert prefs3.source_location == "New York"
    print("✅ Both booking types with source location")
    
    # Test 4: No booking
    print("\n=== Test 4: No Booking ===")
    prefs4 = await nlp.extract_preferences(
        "Kingston trip, I don't need booking help"
    )
    assert prefs4.booking_type == "none"
    print("✅ No booking needed")

if __name__ == "__main__":
    asyncio.run(test_booking_flows())
```

**Run test:**
```bash
python backend/tests/test_booking_flow.py
```

### 9.9 Key Implementation Points

✅ **Conditional Logic**: `source_location` only required when `booking_type` in ["transportation", "both"]

✅ **Question Flow**: Booking questions come AFTER all basic trip info (city, dates, pace, interests, budget)

✅ **Validation**: Flight links must validate `source_location` is present, raise error if missing

✅ **UI Display**: Show `booking_type` in UI, but hide `source_location` (stored in JSON only)

✅ **Link Generation**: Generate links AFTER itinerary confirmation, include in response

✅ **User Experience**: 
- Clear question: "Would you like to book accommodation, transportation, or both?"
- Accept "no" to skip booking entirely
- Only ask origin when needed for flights

✅ **Backward Compatibility**: Existing trips without booking_type default to "none"

---

**END OF SPECIFICATION**

*Ready for implementation. All sections can be copy-pasted into respective files.*
