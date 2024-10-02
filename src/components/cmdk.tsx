import { Place } from "@/lib/api_types";
import { Command } from "cmdk";
import React, { useEffect, useRef } from "react";
import { Kbd } from "./kbd";

export function CMDK({
  onSelectLocation,
}: {
  onSelectLocation: (location: Place) => void;
}) {
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [values, setValues] = React.useState<Place[]>([]);
  const lastTypeTimestamp = useRef(Date.now());
  const lastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!inputValue) return;
    if (lastTimeout.current && lastTypeTimestamp.current + 200 > Date.now())
      clearTimeout(lastTimeout.current);
    lastTypeTimestamp.current = Date.now();
    lastTimeout.current = setTimeout(async () => {
      console.log("Searching for:", inputValue);
      const results = (await fetch(
        `https://nominatim.openstreetmap.org/search.php?q=${inputValue}&polygon_geojson=1&format=jsonv2`
      ).then((res) => res.json())) satisfies Place[];
      setValues(results);
      // setValues([inputValue]);
    }, 200);
    return () => {
      if (lastTimeout.current) clearTimeout(lastTimeout.current);
    };
  }, [inputValue]);

  return (
    <div className="command-menu flex flex-col justify-center items-center w-full">
      <Command
        shouldFilter={false}
        value={value}
        onValueChange={(v) => setValue(v)}
      >
        <div cmdk-framer-header="">
          <SearchIcon />
          <Command.Input
            onChangeCapture={(e) => {
              console.log(Date.now());
              setInputValue(e.currentTarget.value);
            }}
            value={inputValue}
            autoFocus
            placeholder="Search for a location..."
          />
        </div>
        <Command.List>
          <div cmdk-framer-items="">
            <div className="w-full">
              <Command.Group heading="Locations">
                {values.map((v) => (
                  <Item
                    value={v.name}
                    id={v.place_id}
                    subtitle={v.display_name}
                    key={v.place_id}
                    onSelect={(id) => {
                      onSelectLocation(values.find((v) => v.place_id === id)!);
                    }}
                  >
                    {""}
                  </Item>
                ))}
              </Command.Group>
            </div>
          </div>
        </Command.List>
        <footer className="text-xs text-gray-400 flex justify-end">
          <Kbd>↑</Kbd>
          <Kbd className="mx-1">↓</Kbd> to navigate
        </footer>
      </Command>
    </div>
  );
}

function Item({
  value,
  subtitle,
  id,
  onSelect,
}: {
  children: React.ReactNode;
  value: string;
  id: number;
  subtitle: string;
  onSelect: (id: number) => void;
}) {
  return (
    <Command.Item
      value={String(id)}
      onSelect={(value) => {
        console.log(value);
        onSelect(id);
      }}
    >
      {value}
      <span cmdk-framer-item-subtitle="" className="text-ellipsis truncate">
        {subtitle}
      </span>
    </Command.Item>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
