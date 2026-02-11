export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  time: string;
}

export interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}
