import { Wrapper } from "@googlemaps/react-wrapper";
import { useRef, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

export default function App() {
  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_MAP_API_KEY}
      version="beta"
      libraries={["marker"]}
    >
      <MyMap />
    </Wrapper>
  );
}

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: { lat: 43.66293, lng: -79.39314 },
  zoom: 10,
  disableDefaultUI: true,
};

function MyMap() {
  const [map, setMap] = useState();
  const ref = useRef();

  useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, mapOptions));
  }, []);

  return (
    <>
      <div ref={ref} id="map" />
      {map && <Weather map={map} />}
    </>
  );
}

const weatherData = {
  A: {
    name: "Toronto",
    position: { lat: 43.66293, lng: -79.39314 },
    climate: "Raining",
    temp: 20,
    fiveDay: [15, 18, 12, 22, 20],
  },
  B: {
    name: "Guelph",
    position: { lat: 43.544811, lng: -80.248108 },
    climate: "Cloudy",
    temp: 20,
    fiveDay: [15, 18, 12, 22, 20],
  },
  C: {
    name: "Orangeville",
    position: { lat: 43.919239, lng: -80.097412 },
    climate: "Sunny",
    temp: 20,
    fiveDay: [15, 18, 12, 22, 20],
  },
};

function Weather({ map }) {
  const [editing, setEditing] = useState();
  const [highlight, setHighlight] = useState();
  const [data, setData] = useState(weatherData);

  return (
    <>
      {editing && (
        <Editing
          data={data[editing]}
          update={(newData) =>
            setData((existing) => ({ ...existing, [editing]: newData }))
          }
          close={() => setEditing(null)}
        />
      )}
      {Object.entries(data).map(([key, value]) => (
        <Marker
          key={key}
          map={map}
          position={value.position}
          onClick={() => setEditing(key)}
        >
          <div
            className={`marker ${value.climate.toLowerCase()} ${
              highlight === key || editing === key ? "highlight" : ""
            }`}
            onMouseEnter={() => setHighlight(key)}
            onMouseLeave={() => setHighlight(null)}
          >
            <h2>{value.climate}</h2>
            <div>{value.temp}c</div>
            {highlight === key || editing === key ? (
              <div className="five-day">
                <p>Next 5</p>
                <p>{value.fiveDay.join(", ")}</p>
              </div>
            ) : null}
          </div>
        </Marker>
      ))}
    </>
  );
}

function Editing({ data, update, close }) {
  return (
    <div className="editing">
      <h2>Editing {data.name}</h2>

      <label for="climate">Climate</label>
      <select
        id="climate"
        value={data.climate}
        onChange={(e) => update({ ...data, climate: e.target.value })}
      >
        {["Sunny", "Cloudy", "Raining"].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>

      <label for="temp">Temperature</label>
      <input
        id="temp"
        type="number"
        value={data.temp}
        onChange={(e) => update({ ...data, temp: e.target.value })}
      />

      <button type="button" onClick={() => close()}>
        Save
      </button>
    </div>
  );
}

function Marker({ map, children, onClick, position }) {
  const rootRef = useRef();
  const markerRef = useRef();

  useEffect(() => {
    if (!rootRef.current) {
      const container = document.createElement("div");
      rootRef.current = createRoot(container);

      markerRef.current = new google.maps.marker.AdvancedMarkerView({
        position,
        content: container,
      });
    }

    return () => {
      markerRef.current.map = null;
    };
  }, []);

  useEffect(() => {
    rootRef.current.render(children);
    markerRef.current.position = position;
    markerRef.current.map = map;
    const listener = markerRef.current.addListener("click", onClick);

    return () => {
      listener.remove();
    };
  }, [map, children]);
}
