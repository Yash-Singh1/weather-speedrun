"use client";

import { Place } from "@/lib/api_types";
import "../styles/cmdk.scss";
import { CMDK } from "@/components/cmdk";
import { useEffect, useState } from "react";
import { WeatherData } from "@/lib/api_types_weather";
import { Card } from "@/components/card";
import dayjs from "dayjs";

export default function Home() {
  // const [location, setLocation] = useState<Place | null>({
  //   display_name: "Cupertino",
  //   place_id: 311374829,
  // });
  const [location, setLocation] = useState<Place | null>(null);
  const [forecast, setForecast] = useState<WeatherData | null>(null);

  const onSelectLocation = (location: Place) => {
    console.log(location);
    setLocation(location);
    // Cache in localStorage for dev
    if (localStorage.getItem(`weather:${location.place_id}`)) {
      setForecast(
        JSON.parse(
          localStorage.getItem(`weather:${location.place_id}`) as string
        )
      );
      return;
    }
    (
      fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHERAPI_API_KEY}&q=${location.lat},${location.lon}&aqi=no&days=7`
      ).then((res) => res.json()) as Promise<WeatherData>
    ).then((data) => {
      console.log(data);
      setForecast(data);
      localStorage.setItem(
        `weather:${location.place_id}`,
        JSON.stringify(data)
      );
    });
    // setForecast([{}] as unknown as WeatherData);
  };

  // DEBUG: rm later
  useEffect(() => {
    if (location) onSelectLocation(location);
  }, []);

  return (
    <div
      className={`flex w-full justify-center ${
        location === null ? "items-center" : ""
      } min-h-screen p-8 pb-20 gap-16 sm:p-12 font-[family-name:var(--font-geist-sans)]`}
    >
      {location === null ? (
        <CMDK onSelectLocation={onSelectLocation} />
      ) : (
        <div className="w-full">
          <h2 className="text-6xl text-center font-bold uppercase tracking-wide">
            Weather in
          </h2>
          <h1 className="text-8xl text-center mt-4 font-black uppercase tracking-wide">
            {location.name || location.display_name}
          </h1>
          <p className="text-center text-gray-200/80">
            Precise location: {location.display_name}
          </p>
          {forecast === null ? (
            <div className="flex justify-center items-center w-full my-8">
              <div className="h-4 w-4 animate-spin border-4 rounded-full border-t-transparent border-white" />
            </div>
          ) : (
            <>
              <h4 className="text-4xl font-semibold my-4">Current</h4>
              <div className="w-96 border border-neutral-400/20 bg-black/60 flex flex-row justify-between items-center p-8">
                <div>
                  <h5 className="font-bold uppercase text-xl mb-4">
                    {location.name || location.display_name}
                  </h5>
                  <p className="font-bold uppercase text-3xl">
                    {forecast.current.temp_c}°
                  </p>
                  <p className="font-semibold text-sm text-gray-200/80">
                    {forecast.current.condition.text}
                  </p>
                  <p className="font-semibold text-sm text-gray-200/80">
                    Feels like {forecast.current.feelslike_c}*
                  </p>
                </div>
                <div className="flex items-center flex-col">
                  <div
                    style={{
                      backgroundImage: `url(${forecast.current.condition.icon.replace(
                        "64x64",
                        "128x128"
                      )})`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                    className="w-24 h-24"
                  >
                    &nbsp;
                  </div>
                </div>
              </div>
              <h4 className="text-4xl font-semibold my-4">Forecast</h4>
              <div className="flex flex-row flex-wrap gap-4">
                {forecast.forecast.forecastday
                  .filter((day) => {
                    const date = new Date(day.date);
                    console.log(date);
                    return (
                      date.getTime() <=
                        new Date().setDate(new Date().getDate() + 7) &&
                      date.getDate() >= new Date().getDate()
                    );
                  })
                  .map((forecast) => {
                    return (
                      <Card
                        key={forecast.date}
                        title={dayjs(forecast.date).format("dddd")}
                        description={forecast.day.condition.text}
                        className="flex-grow-0 min-h-full flex-shrink-0 w-max basis-50"
                        header={
                          <img
                            src={forecast.day.condition.icon.replace(
                              "64x64",
                              "128x128"
                            )}
                            className="w-full w-40 m-auto"
                            alt={forecast.day.condition.text}
                          />
                        }
                      >
                        <p>High: {forecast.day.maxtemp_c}°</p>
                        <p>Average: {forecast.day.avgtemp_c}°</p>
                        <p>Low: {forecast.day.mintemp_c}°</p>
                        <p>Rainfall: {forecast.day.totalprecip_mm}mm</p>
                        <p>Wind: {forecast.day.maxwind_kph}kph</p>
                      </Card>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
