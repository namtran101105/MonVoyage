"""Quick test for the weather client."""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from clients.weather_client import WeatherClient


def main():
    city = "Hanoi, Vietnam"
    dates = ["2026-02-08", "2026-02-09", "2026-02-10"]

    print(f"City:  {city}")
    print(f"Dates: {', '.join(dates)}")
    print("=" * 60)

    client = WeatherClient()
    result = client.get_weather(city, dates)

    print(f"Location: {result['city']}, {result['country']}")
    print(f"Timezone: {result['timezone']}")
    print()

    for f in result["forecasts"]:
        print(f"  {f['date']}  |  {f['condition']}")
        print(f"    Temp: {f['temp_min_c']}°C - {f['temp_max_c']}°C")
        print(f"    Rain: {f['precipitation_mm']}mm ({f['precipitation_chance']}% chance)")
        print(f"    Wind: {f['wind_speed_kmh']} km/h")
        print(f"    Sun:  {f['sunrise']} - {f['sunset']}")
        print()


if __name__ == "__main__":
    main()
