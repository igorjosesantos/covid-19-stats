import React, { FC, useEffect, useRef, useState } from 'react'
import country from "world-map-country-shapes";
import svgPanZoom from 'svg-pan-zoom';
import useEvent from '../hooks/useEvent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'

interface Props {
    countries: Record<string, any>
    selectedCountry: string,
    setSelectedCountry: Function
}

const WorldMap: FC<Props> = ({ countries, selectedCountry, setSelectedCountry }) => {
  const worldMap = useRef<SVGSVGElement>(null)
  const panZoomWorldMap = useRef<SvgPanZoom.Instance>();
  const [isDragging, setIsDragging] = useState(false);

  const hasData = (id: string): Boolean => {
    for (let country of countries.countries) {
      if (country.iso2 === id)
        return true
    }
    return false
  }

  const getCountryName = (id: string) => {
    for (let country of countries.countries) {
      if (country.iso2 === id)
        return country.name
    }
    return id
  }

  useEvent('resize', () => {
    panZoomWorldMap?.current?.resize();
    panZoomWorldMap?.current?.fit();
    panZoomWorldMap?.current?.center();
  })

  useEffect(() => {
    panZoomWorldMap.current = svgPanZoom(worldMap.current!!, {
      // onPan: () => setIsDragging(true),
    })
  }, [])

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        ref={worldMap}
        // className="absolute inset-0 h-full"
        id="world-map"
        width="100%"
        height="100%"
        viewBox="0 0 2000 1001"
        // onClick={() => {
        //   if (isDragging)
        //     setIsDragging(false)
        // }}
      >
        {
          country.map((country: Record<string, any>) => {
            const countryName = getCountryName(country.id)
            
            if (hasData(country.id)) {
              return <path
                key={country.id}
                d={country.shape}
                className={
                  `cursor-pointer transition-colors duration-200 ease-in-out stroke-gray-500 ${selectedCountry === country.id ? 'fill-accent' : 'fill-current'}`
                }
                onClick={() => {
                  // if (!isDragging) {
                    // panZoomWorldMap?.current?.reset()
                    setSelectedCountry(country.id)
                  // }
                  
                  // setIsDragging(false)
                }}
              >
                <title>{countryName}</title>
              </path>
            } else {
              return <path
                key={country.id} 
                d={country.shape} 
                className="fill-current opacity-75 stroke-gray-500"
              >
                <title>{countryName} (no data)</title>
              </path>
            }
          })
        }
      </svg>
      <div className="absolute top-0 right-0 flex flex-col p-3 lg:p-4 sy-2">
        <button
          className="rounded-full focus:outline-none focus:shadow-outline w-8 h-8 bg-back text-primary"
          title="Reset position"
          onClick={() => panZoomWorldMap?.current?.reset()}
        >
          <FontAwesomeIcon fixedWidth icon={faExpand} />
        </button>
        <button
          className="rounded-full focus:outline-none focus:shadow-outline w-8 h-8 bg-back text-primary"
          title="Zoom in"
          onClick={() => panZoomWorldMap?.current?.zoomIn()}
        >
          <FontAwesomeIcon fixedWidth icon={faPlus} />
        </button>
        <button
          className="rounded-full focus:outline-none focus:shadow-outline w-8 h-8 bg-back text-primary"
          title="Zoom out"
          onClick={() => panZoomWorldMap?.current?.zoomOut()}
        >
          <FontAwesomeIcon fixedWidth icon={faMinus} />
        </button>
      </div>
    </>
  )
}

WorldMap.defaultProps = {
  countries: { countries: [] },
  setSelectedCountry: () => {}
}

export default WorldMap
