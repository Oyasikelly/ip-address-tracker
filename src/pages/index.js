import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { IoIosArrowForward } from "react-icons/io";
import { useState } from "react";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../pages/components/Map'), { ssr: false });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [geoData, setGeoData] = useState(null);
  const [ipAddress, setIpAddress] = useState('8.8.8.8');
  const [ipAddressResult, setIpAddressResult] = useState(null);
  const [error, setError] = useState(null);

  function handleIpAddress(e) {
    setIpAddress(e.target.value);
  }

  async function fetchGeoData() {
    setIpAddressResult(ipAddress);
    setIpAddress('');
    setError(null);  // Reset error state on new IP input
    if (!ipAddress || !isValidIpAddress(ipAddress)) {
      setError('Please enter a valid IP address');
      return;
    }

    const endpoint = `https://get.geojs.io/v1/ip/geo/${ipAddress}.json`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);
      setGeoData(data);
    } catch (error) {
      console.error('Failed to fetch geolocation data:', error);
      setError('Failed to fetch geolocation data. Please try again.');
    }
  }

  // Validate IP address format (basic check for valid IP)
  function isValidIpAddress(ip) {
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <header className="w-full h-[40vh] bg-[url('/images/pattern-bg-mobile.png')] lg:bg-[url('/images/pattern-bg-desktop.png')] bg-cover bg-blend-multiply">
        <main className="w-full h-full flex flex-col items-center pt-20 lg:pt-10 flex flex-col">
          <h1 className="mb-9 text-2xl font-bold text-white">IP Address Tracker</h1>
          <div className="join rounded-[0.5rem] w-full flex justify-center">
            <input
              onChange={handleIpAddress}
              value={ipAddress}
              className="input input-bordered join-item w-[40%]"
              placeholder="Search for any IP address or domain"
            />
            <button
              onClick={fetchGeoData}
              className="btn border-none hover:bg-base-content hover:opacity-70 rounded-r-[0.5rem] bg-neutral join-item rounded-r-full"
            >
              <IoIosArrowForward color="white" />
            </button>
          </div>
          {error && (
            <div className="text-red-500 mt-4 text-center">{error}</div>
          )}
        </main>
      </header>

      <footer className="relative z-0 w-full h-[60vh] flex flex-col items-center">
        {geoData ? (
          <>
            <div className="p-4 absolute -top-12 z-20 bg-base-100 bg-opacity-70 grid grid-cols-4 justify-center items-center w-[80%] rounded-[0.5rem]">
              <div className="title pr-4 overflow-auto scrollbar-hide cursor-pointer">
                <h1 className="text-xs text-orange-200 font-bold text-center lg:text-start">IP ADDRESS</h1>
                <span className="text-xs lg:text-2xl">{geoData.ip}</span>
              </div>
              <div className="title px-4 overflow-auto scrollbar-hide cursor-pointer border-l-2 border-l-gray-200 text-center lg:text-start">
                <h1 className="text-xs text-orange-200 font-bold">LOCATION</h1>
                <span className="text-xs lg:text-2xl">
                  {geoData.city}{geoData.city && ","} {geoData.country}
                </span>
              </div>
              <div className="title px-4 overflow-auto scrollbar-hide cursor-pointer border-l-2 border-l-gray-200 text-center lg:text-start">
                <h1 className="text-xs text-orange-200 font-bold">TIMEZONE</h1>
                <span className="text-xs lg:text-2xl">{geoData.timezone}</span>
              </div>
              <div className="title px-4 overflow-auto scrollbar-hide cursor-pointer border-l-2 border-l-gray-200 text-center lg:text-start">
                <h1 className="text-xs text-orange-200 font-bold">ISP</h1>
                <span className="text-xs lg:text-2xl">{geoData.organization}</span>
              </div>
            </div>
            <div className="bg-blue-300 h-full w-full">
              {geoData.latitude && geoData.longitude && (
                <Map
                  latitude={parseFloat(geoData.latitude)}
                  longitude={parseFloat(geoData.longitude)}
                  ipAddress={ipAddressResult}
                  city={geoData.city}
                  country={geoData.country}
                />
              )}
            </div>
          </>
        ) : (
          <div className="text-gray-400 mt-4 text-center">Please enter a valid IP address to see the geolocation.</div>
        )}
      </footer>
    </div>
  );
}
