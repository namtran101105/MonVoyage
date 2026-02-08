export const mockItinerary = {
  "trip_id": "trip_20260207_180254",
  "itinerary_version": 2,
  "created_at": "2026-02-07T18:02:54.974098",
  "status": "draft",
  "pace": "moderate",
  "total_budget": 1000.0,
  "total_spent": 599.40,
  "total_activities": 12,
  "activities_per_day_avg": 4.0,
  "total_travel_time_hours": 2.5,
  "adaptation_count": 0,
  "last_adapted_at": null,

  "days": [
    {
      "day_number": 1,
      "date": "2026-02-17",

      "morning_departure": {
        "mode": "walking",
        "duration_minutes": 15,
        "distance_km": 1.0,
        "from_location": "Downtown Toronto",
        "to_location": "Harbourfront Centre",
        "cost": 0.0,
        "directions": "Walk south on Bay St to Queens Quay",
        "parking_info": null
      },

      "activities": [
        {
          "activity_id": "d1_a1",
          "venue_name": "Harbourfront Centre & Waterfront",
          "sequence": 1,
          "planned_start": "09:00",
          "planned_end": "10:30",
          "category": "waterfront",
          "notes": "Scenic lakeside boardwalk, art spaces, and skyline views.",
          "duration_reason": "Relaxing walk and taking photos.",
          "status": "pending",
          "estimated_cost": 0.0,
          "actual_cost": null,
          "travel_to_next": {
            "mode": "walking",
            "duration_minutes": 10,
            "distance_km": 0.6,
            "from_location": "Harbourfront Centre",
            "to_location": "Ripley's Aquarium of Canada",
            "cost": 0.0,
            "directions": "Walk north on Rees St toward Bremner Blvd",
            "parking_info": null
          }
        },

        {
          "activity_id": "d1_a2",
          "venue_name": "Ripley's Aquarium of Canada",
          "sequence": 2,
          "planned_start": "10:45",
          "planned_end": "12:00",
          "category": "museums",
          "notes": "Interactive aquarium featuring underwater tunnels.",
          "duration_reason": "Explore galleries and moving walkway.",
          "status": "pending",
          "estimated_cost": 46.0,
          "actual_cost": null,
          "travel_to_next": {
            "mode": "walking",
            "duration_minutes": 15,
            "distance_km": 1.1,
            "from_location": "Ripley's Aquarium",
            "to_location": "St. Lawrence Market",
            "cost": 0.0,
            "directions": "Walk east along Front St",
            "parking_info": null
          }
        },

        {
          "activity_id": "d1_a3",
          "venue_name": "Hockey Hall of Fame",
          "sequence": 3,
          "planned_start": "13:30",
          "planned_end": "14:45",
          "category": "museums",
          "notes": "Celebrates Canada's hockey legacy with trophies and exhibits.",
          "duration_reason": "Interactive exhibits and Stanley Cup.",
          "status": "pending",
          "estimated_cost": 25.0,
          "actual_cost": null,
          "travel_to_next": {
            "mode": "walking",
            "duration_minutes": 10,
            "distance_km": 0.7,
            "from_location": "Hockey Hall of Fame",
            "to_location": "CN Tower",
            "cost": 0.0,
            "directions": "Walk west along Front St to CN Tower",
            "parking_info": null
          }
        },

        {
          "activity_id": "d1_a4",
          "venue_name": "CN Tower",
          "sequence": 4,
          "planned_start": "15:00",
          "planned_end": "16:30",
          "category": "landmarks",
          "notes": "Iconic Toronto observation tower with glass floor and skyline views.",
          "duration_reason": "Observation deck and EdgeWalk views.",
          "status": "pending",
          "estimated_cost": 47.0,
          "actual_cost": null,
          "travel_to_next": null
        }

      ],

      "meals": [
        {
          "meal_type": "lunch",
          "venue_name": "St. Lawrence Market",
          "planned_time": "12:15",
          "estimated_cost": 25.0,
          "actual_cost": null,
          "notes": "Famous food market – try peameal bacon sandwich."
        },
        {
          "meal_type": "dinner",
          "venue_name": "360 Restaurant at CN Tower",
          "planned_time": "18:30",
          "estimated_cost": 90.0,
          "actual_cost": null,
          "notes": "Rotating fine dining with skyline views."
        }
      ],

      "evening_return": {
        "mode": "walking",
        "duration_minutes": 10,
        "distance_km": 0.8,
        "from_location": "CN Tower",
        "to_location": "Downtown Toronto",
        "cost": 0.0,
        "directions": "Walk north on Bremner Blvd",
        "parking_info": null
      },

      "daily_budget_allocated": 400.0,
      "daily_budget_spent": 233.0,
      "weather": {
        "date": "2026-05-10",
        "condition": "Partly cloudy",
        "temp_max_c": 22,
        "temp_min_c": 12,
        "precipitation_chance": 10,
        "wind_speed_kmh": 15
      },
      "total_activities": 4,
      "total_hours": 8.0
    },

    {
      "day_number": 2,
      "date": "2026-02-18",

      "morning_departure": {
        "mode": "transit",
        "duration_minutes": 20,
        "distance_km": 6.0,
        "from_location": "Downtown Toronto",
        "to_location": "Royal Ontario Museum",
        "cost": 3.35,
        "directions": "Take Line 1 subway to Museum Station",
        "parking_info": null
      },

      "activities": [
        {
          "activity_id": "d2_a1",
          "venue_name": "Royal Ontario Museum (ROM)",
          "sequence": 1,
          "planned_start": "09:30",
          "planned_end": "11:30",
          "category": "museums",
          "notes": "One of North America’s largest museums of natural history.",
          "duration_reason": "Dinosaurs and world cultures.",
          "status": "pending",
          "estimated_cost": 26.0,
          "actual_cost": null,
          "travel_to_next": {
            "mode": "walking",
            "duration_minutes": 5,
            "distance_km": 0.3,
            "from_location": "ROM",
            "to_location": "Bata Shoe Museum",
            "cost": 0.0,
            "directions": "Walk west on Bloor St",
            "parking_info": null
          }
        },

        {
          "activity_id": "d2_a2",
          "venue_name": "Bata Shoe Museum",
          "sequence": 2,
          "planned_start": "11:45",
          "planned_end": "12:45",
          "category": "museums",
          "notes": "Unique global footwear history museum.",
          "duration_reason": "Curated themed exhibits.",
          "status": "pending",
          "estimated_cost": 14.0,
          "actual_cost": null,
          "travel_to_next": {
            "mode": "walking",
            "duration_minutes": 10,
            "distance_km": 0.8,
            "from_location": "Bata Shoe Museum",
            "to_location": "Casa Loma",
            "cost": 0.0,
            "directions": "Walk northwest toward Davenport Rd",
            "parking_info": null
          }
        },

        {
          "activity_id": "d2_a3",
          "venue_name": "Casa Loma",
          "sequence": 3,
          "planned_start": "14:00",
          "planned_end": "15:30",
          "category": "landmarks",
          "notes": "Historic castle mansion with gardens and tunnels.",
          "duration_reason": "Explore rooms and towers.",
          "status": "pending",
          "estimated_cost": 40.0,
          "actual_cost": null,
          "travel_to_next": {
            "mode": "transit",
            "duration_minutes": 25,
            "distance_km": 7.0,
            "from_location": "Casa Loma",
            "to_location": "Kensington Market",
            "cost": 3.35,
            "directions": "Streetcar south to Spadina Ave",
            "parking_info": null
          }
        },

        {
          "activity_id": "d2_a4",
          "venue_name": "Kensington Market",
          "sequence": 4,
          "planned_start": "16:00",
          "planned_end": "17:30",
          "category": "other",
          "notes": "Bohemian neighborhood with vintage shops and street art.",
          "duration_reason": "Browse and snacks.",
          "status": "pending",
          "estimated_cost": 10.0,
          "actual_cost": null,
          "travel_to_next": null
        }
      ],

      "meals": [
        {
          "meal_type": "lunch",
          "venue_name": "Eataly Yorkville",
          "planned_time": "13:00",
          "estimated_cost": 35.0,
          "actual_cost": null,
          "notes": "Italian marketplace dining."
        },
        {
          "meal_type": "dinner",
          "venue_name": "Seven Lives Tacos",
          "planned_time": "18:30",
          "estimated_cost": 25.0,
          "actual_cost": null,
          "notes": "Famous tacos in Kensington."
        }
      ],

      "evening_return": {
        "mode": "transit",
        "duration_minutes": 20,
        "distance_km": 5.5,
        "from_location": "Kensington Market",
        "to_location": "Downtown Toronto",
        "cost": 3.35,
        "directions": "Streetcar east to downtown",
        "parking_info": null
      },

      "daily_budget_allocated": 400.0,
      "daily_budget_spent": 160.05,
      "weather": {
        "date": "2026-05-11",
        "condition": "Clear sky",
        "temp_max_c": 24,
        "temp_min_c": 14,
        "precipitation_chance": 5,
        "wind_speed_kmh": 10
      },
      "total_activities": 4,
      "total_hours": 8.0
    },

    {
      "day_number": 3,
      "date": "2026-02-19",

      "morning_departure": {
        "mode": "ferry",
        "duration_minutes": 15,
        "distance_km": 3.0,
        "from_location": "Jack Layton Ferry Terminal",
        "to_location": "Toronto Islands",
        "cost": 9.0,
        "directions": "Take ferry to Centre Island",
        "parking_info": null
      },

      "activities": [
        {
          "activity_id": "d3_a1",
          "venue_name": "Toronto Islands & Centreville",
          "sequence": 1,
          "planned_start": "09:30",
          "planned_end": "12:00",
          "category": "nature_parks",
          "notes": "Beaches, bike paths, skyline views.",
          "duration_reason": "Cycling and exploration.",
          "status": "pending",
          "estimated_cost": 20.0,
          "actual_cost": null,
          "travel_to_next": {
            "mode": "ferry",
            "duration_minutes": 15,
            "distance_km": 3.0,
            "from_location": "Toronto Islands",
            "to_location": "Distillery District",
            "cost": 9.0,
            "directions": "Return ferry then streetcar east",
            "parking_info": null
          }
        },

        {
          "activity_id": "d3_a2",
          "venue_name": "Distillery Historic District",
          "sequence": 2,
          "planned_start": "13:00",
          "planned_end": "14:30",
          "category": "culture_history",
          "notes": "Victorian industrial architecture + art galleries.",
          "duration_reason": "Shops and photos.",
          "status": "pending",
          "estimated_cost": 0.0,
          "actual_cost": null,
          "travel_to_next": {
            "mode": "transit",
            "duration_minutes": 20,
            "distance_km": 6.0,
            "from_location": "Distillery District",
            "to_location": "Art Gallery of Ontario",
            "cost": 3.35,
            "directions": "Streetcar west to AGO",
            "parking_info": null
          }
        },

        {
          "activity_id": "d3_a3",
          "venue_name": "Art Gallery of Ontario (AGO)",
          "sequence": 3,
          "planned_start": "15:00",
          "planned_end": "16:30",
          "category": "museums",
          "notes": "Major Canadian and global art collections.",
          "duration_reason": "Key exhibits.",
          "status": "pending",
          "estimated_cost": 30.0,
          "actual_cost": null,
          "travel_to_next": {
            "mode": "walking",
            "duration_minutes": 10,
            "distance_km": 0.7,
            "from_location": "AGO",
            "to_location": "Nathan Phillips Square",
            "cost": 0.0,
            "directions": "Walk east on Dundas St",
            "parking_info": null
          }
        },

        {
          "activity_id": "d3_a4",
          "venue_name": "Nathan Phillips Square & Toronto Sign",
          "sequence": 4,
          "planned_start": "16:45",
          "planned_end": "17:30",
          "category": "landmarks",
          "notes": "City Hall plaza and iconic Toronto sign.",
          "duration_reason": "Photos and relaxation.",
          "status": "pending",
          "estimated_cost": 0.0,
          "actual_cost": null,
          "travel_to_next": null
        }
      ],

      "meals": [
        {
          "meal_type": "lunch",
          "venue_name": "Cluny Bistro",
          "planned_time": "12:15",
          "estimated_cost": 40.0,
          "actual_cost": null,
          "notes": "French bistro in Distillery District."
        },
        {
          "meal_type": "dinner",
          "venue_name": "Canoe Restaurant",
          "planned_time": "19:00",
          "estimated_cost": 95.0,
          "actual_cost": null,
          "notes": "Upscale Canadian dining with skyline views."
        }
      ],

      "evening_return": {
        "mode": "walking",
        "duration_minutes": 10,
        "distance_km": 0.8,
        "from_location": "Canoe Restaurant",
        "to_location": "Downtown Toronto",
        "cost": 0.0,
        "directions": "Walk south on Bay St",
        "parking_info": null
      },

      "daily_budget_allocated": 400.0,
      "daily_budget_spent": 0.0,
      "weather": {
        "date": "2026-05-12",
        "condition": "Slight rain",
        "temp_max_c": 18,
        "temp_min_c": 11,
        "precipitation_chance": 65,
        "wind_speed_kmh": 20
      },
      "total_activities": 4,
      "total_hours": 8.5
    }
  ],
  booking_links: {
    flights: {
      url: "https://www.skyscanner.ca/transport/flights/ymqa/ytoa/260217/260219/?adultsv2=1&childrenv2=&cabinclass=economy&rtn=1&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false",
      label: "Flights",
      provider: "Skyscanner",
    },
    accommodation: {
      url: "https://www.airbnb.ca/s/Toronto--Ontario/homes?date_picker_type=calendar&checkin=2026-02-17&checkout=2026-02-19&adults=1&refinement_paths%5B%5D=%2Fhomes&place_id=ChIJpTvG15DL1IkRd8S0KlBVNTI&search_type=AUTOSUGGEST",
      label: "Accommodation",
      provider: "Airbnb",
    },
    bus: {
      url: "https://www.busbud.com/en-ca/bus-schedules-results/375dd587-9001-acbd-84a4-683dedfb933e/375dd587-9001-acbd-84a4-683ded8add83?outbound_date=2026-02-17&return_date=2026-02-19&adults=1",
      label: "Bus or Train",
      provider: "Busbud",
    },
  },
};
