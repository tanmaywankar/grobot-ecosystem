export const INITIAL_DEVICES = [
  {
    id: "grobot-01",
    name: "Grobotaro",
    plantType: "Monstera Deliciosa",
    mood: "Happy",
    status: "online",
    telemetry: {
      temperature: 32,
      temperatureStatus: "Normal",
      humidity: 50,
      humidityStatus: "Medium",
      sunlight: 42,
      sunlightStatus: "Optimal",
      soilMoisture: 58,
      soilStatus: "Perfect",
      condition: "Excellent",
      healthScore: 80,
      chartData: [
        { time: "Sept", temp: 28 },
        { time: "", temp: 36 },
        { time: "", temp: 38 },
        { time: "", temp: 36 },
        { time: "Oct", temp: 32 },
      ],
    },
  },
  {
    id: "grobot-02",
    name: "Grobottov",
    plantType: "Fiddle Leaf Fig",
    mood: "Needs Care",
    status: "offline",
    telemetry: {
      temperature: 24,
      temperatureStatus: "Low",
      humidity: 35,
      humidityStatus: "Dry",
      sunlight: 20,
      sunlightStatus: "Low",
      soilMoisture: 18,
      soilStatus: "Dry",
      condition: "Needs Care",
      healthScore: 45,
      chartData: [
        { time: "Sept", temp: 22 },
        { time: "", temp: 25 },
        { time: "", temp: 24 },
        { time: "", temp: 23 },
        { time: "Oct", temp: 24 },
      ],
    },
  },
  {
    id: "grobot-03",
    name: "Grobotino",
    plantType: "Snake Plant",
    mood: "Thriving",
    status: "online",
    telemetry: {
      temperature: 29,
      temperatureStatus: "Normal",
      humidity: 55,
      humidityStatus: "Medium",
      sunlight: 65,
      sunlightStatus: "Optimal",
      soilMoisture: 62,
      soilStatus: "Perfect",
      condition: "Excellent",
      healthScore: 92,
      chartData: [
        { time: "Sept", temp: 26 },
        { time: "", temp: 30 },
        { time: "", temp: 32 },
        { time: "", temp: 31 },
        { time: "Oct", temp: 29 },
      ],
    },
  },
  {
    id: "grobot-04",
    name: "Grobotos",
    plantType: "Pothos",
    mood: "Thirsty",
    status: "online",
    telemetry: {
      temperature: 31,
      temperatureStatus: "Normal",
      humidity: 48,
      humidityStatus: "Medium",
      sunlight: 50,
      sunlightStatus: "Optimal",
      soilMoisture: 22,
      soilStatus: "Dry",
      condition: "Fair",
      healthScore: 68,
      chartData: [
        { time: "Sept", temp: 27 },
        { time: "", temp: 32 },
        { time: "", temp: 34 },
        { time: "", temp: 33 },
        { time: "Oct", temp: 31 },
      ],
    },
  },
  {
    id: "grobot-05",
    name: "Grobotnik",
    plantType: "Peace Lily",
    mood: "Overwatered",
    status: "offline",
    telemetry: {
      temperature: 28,
      temperatureStatus: "Normal",
      humidity: 78,
      humidityStatus: "High",
      sunlight: 30,
      sunlightStatus: "Optimal",
      soilMoisture: 92,
      soilStatus: "Wet",
      condition: "Attention",
      healthScore: 58,
      chartData: [
        { time: "Sept", temp: 25 },
        { time: "", temp: 28 },
        { time: "", temp: 29 },
        { time: "", temp: 29 },
        { time: "Oct", temp: 28 },
      ],
    },
  },
];

export const LAST_SELECTED_DEVICE_KEY = "grobot_last_device_id";

export function getActiveDeviceId() {
  const saved = localStorage.getItem(LAST_SELECTED_DEVICE_KEY);
  if (saved && INITIAL_DEVICES.some((d) => d.id === saved)) {
    return saved;
  }
  return INITIAL_DEVICES[0].id;
}

export function setActiveDeviceId(id) {
  localStorage.setItem(LAST_SELECTED_DEVICE_KEY, id);
}

