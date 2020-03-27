import React, { FC, useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage';
import useFetch from '../hooks/useFetch';
import StatCard from './StatCard';
import WorldMap from './WorldMap';
import { ICountry } from '../definitions/ICountry';
import { toPercentage } from '../utils/toPercentage';
import { COUNTRIES_URL } from '../api';

const COUNTRY_DEFAULT: ICountry = {
  name: 'Argentina',
  iso2: 'AR',
  iso3: 'ARG'
}

interface ICountries {
  countries: ICountry[]
}

const CountryStats: FC = () => {
    const [selectedCountry, setSelectedCountry] = useLocalStorage('country-selected', COUNTRY_DEFAULT);
    const [selectedCountryData, setSelectedCountryData] = useState<Record<string, any>>({});
    
    const [countryData, countryLoading, cError] = useFetch(
        `${COUNTRIES_URL}/${selectedCountry.name}`
    )
    
    const [countries] = useFetch<ICountries>(COUNTRIES_URL)
    
    // const handleCountrySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //   const country = JSON.parse(e.currentTarget.value)
    //   setSelectedCountry(country)
    //   getCountryData(country)
    // }

    const getCountryByIso2 = (iso2: string) => {
        for(let country of countries?.countries as ICountry[]) {
          if(country.iso2 === iso2) {
            return country
          }
        }

        throw new Error('Country not found')
    }

    const getCountryData = async (country: ICountry) => {
      const r = await fetch(`https://restcountries.eu/rest/v2/alpha/${country.iso2}`)
      const data = await r.json()

      setSelectedCountryData(data)
    }

    useEffect(() => {
      getCountryData(selectedCountry)
    }, [selectedCountry])

    return (
      <div className="CountryStats relative neumorph sm:shadow-neumorph-inset mb-6 h-64 overflow-hidden">
        <WorldMap
          countries={countries as ICountries}
          selectedCountry={selectedCountry.iso2}
          setSelectedCountry={(iso2: string) => {
            try {
              const country = getCountryByIso2(iso2)
              setSelectedCountry(country)
            } catch (e) {}
          }}
        />

        {selectedCountryData.population && (
          <div className="inline-flex items-center relative">
            <img
              className="h-16 w-16 rounded-full object-cover mr-3 shadow-md"
              src={selectedCountryData?.flag}
              alt="Country flag"
            />
            <div className="">
              <div>{selectedCountryData.name}</div>
              <div className="text-sm text-muted">
                Population: {selectedCountryData.population.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* <select
          className="block text-gray-900 w-full p-2 md:p-3 rounded-md mb-6 md:text-xl bg-primary text-back focus:outline-none focus:outline-shadow"
          disabled={countryLoading}
          onChange={handleCountrySelection}
          value={JSON.stringify(selectedCountry)}
        >
          { countries &&
            countries.countries.map((country: ICountry) => {
              return (
                <option
                  key={country.name}
                  value={JSON.stringify(country)}
                >
                  {country.name}
                </option>
              )
            })}
        </select> */}

        <div className="absolute bottom-0 w-full flex justify-center sx-2 sm:sx-5">
          {cError.length > 0 && (
            <div className="text-center text-gray-500 ">
              <div className="font-sans text-5xl mb-3">¯\_(ツ)_/¯</div>
              <div>{cError}</div>
            </div>
          )}

          {cError.length === 0 && (
            <>
              <StatCard
                title="Confirmed (100%)"
                value={
                  countryLoading ? undefined : countryData?.confirmed.value
                }
              />
              <StatCard
                title={`Recovered (${toPercentage(
                  countryData?.recovered.value,
                  countryData?.confirmed.value
                )})`}
                value={
                  countryLoading ? undefined : countryData?.recovered.value
                }
              />
              <StatCard
                title={`Deaths (${toPercentage(
                  countryData?.deaths.value,
                  countryData?.confirmed.value
                )})`}
                value={countryLoading ? undefined : countryData?.deaths.value}
              />
            </>
          )}
        </div>
      </div>
    )
}

export default CountryStats
