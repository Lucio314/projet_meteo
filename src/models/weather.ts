export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  time: string;
  temperature_2m: number;
  rain: number;

}

export interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface WeatherResponse {
  current: CurrentWeather;
  daily: DailyWeather;
}