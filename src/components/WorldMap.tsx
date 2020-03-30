import React, { FC, useEffect, useRef, useMemo } from 'react'
import country from "world-map-country-shapes";
import svgPanZoom from 'svg-pan-zoom';
import useEvent from '../hooks/useEvent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand } from '@fortawesome/free-solid-svg-icons'
import * as Hammer from "hammerjs"

interface Props {
    countries: Record<string, any>
    selectedCountry: string,
    setSelectedCountry: Function
}

const WorldMap: FC<Props> = ({ countries, selectedCountry, setSelectedCountry }) => {
  const worldMap = useRef<SVGSVGElement>(null)
  const panZoomWorldMap = useRef<SvgPanZoom.Instance>();

  useEvent('resize', () => {
    panZoomWorldMap?.current?.resize();
    panZoomWorldMap?.current?.fit();
    panZoomWorldMap?.current?.center();
  })

  useEffect(() => {
    panZoomWorldMap.current = svgPanZoom(worldMap.current!!, {
      customEventsHandler: {
        // Halt all touch events
        haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],

        // Init custom events handler
        init: function(options) {
          let instance = options.instance
          let initialScale = 1
          let pannedX = 0
          let pannedY = 0

          // Init Hammer
          // @ts-ignore
          this.hammer = Hammer(options.svgElement, {
            inputClass: Hammer.SUPPORT_POINTER_EVENTS
              ? Hammer.PointerEventInput
              : Hammer.TouchInput
          })

          // @ts-ignore
          this.hammer.get("pinch").set({ enable: true })

          // Handle pan
          // @ts-ignore
          this.hammer.on("panstart panmove", function(ev) {
            // On pan start reset panned variables
            if (ev.type === "panstart") {
              pannedX = 0
              pannedY = 0
            }

            // Pan only the difference
            instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY })
            pannedX = ev.deltaX
            pannedY = ev.deltaY
          })

          // Handle double tap
          // @ts-ignore
          this.hammer.on('doubletap', function() {
            options.instance.zoomIn()
          })

          // Handle pinch
          // @ts-ignore
          this.hammer.on("pinchstart pinchmove", function(ev) {
            // On pinch start remember initial zoom
            if (ev.type === "pinchstart") {
              initialScale = instance.getZoom()
              instance.zoomAtPoint(initialScale * ev.scale, {
                x: ev.center.x,
                y: ev.center.y
              })
            }

            instance.zoomAtPoint(initialScale * ev.scale, {
              x: ev.center.x,
              y: ev.center.y
            })
          })

          // Prevent moving the page on some devices when panning over SVG
          options.svgElement.addEventListener('touchmove', function(e){ e.preventDefault(); });
        },
        // Destroy custom events handler
        destroy: function() {
          // @ts-ignore
          this.hammer.destroy()
        }
      },
      beforePan: function(oldPan, newPan) {
        const GUTTER_WIDTH = 100
        const GUTTER_HEIGHT = 100
        
        // @ts-ignore
        const sizes = this.getSizes()
        const leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + GUTTER_WIDTH
        const rightLimit = sizes.width - GUTTER_WIDTH - sizes.viewBox.x * sizes.realZoom
        const topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + GUTTER_HEIGHT
        const bottomLimit = sizes.height - GUTTER_HEIGHT - sizes.viewBox.y * sizes.realZoom

        return {
          x: Math.max(leftLimit, Math.min(rightLimit, newPan.x)),
          y: Math.max(topLimit, Math.min(bottomLimit, newPan.y))
        }
      }
    })
  }, [])

  const countryPaths = useMemo(() => {
    const getCountryName = (id: string) => {
      for (let country of countries.countries) {
        if (country.iso2 === id) return country.name
      }
      return id
    }

    const hasData = (id: string): Boolean => {
      for (let country of countries.countries) {
        if (country.iso2 === id) return true
      }
      return false
    }

    return country.map((country: Record<string, any>) => {
      const countryName = getCountryName(country.id)

      if (hasData(country.id)) {
        return (
          <path
            key={country.id}
            d={country.shape}
            className={`cursor-pointer transition-colors duration-200 ease-in-out stroke-gray-500 ${
              selectedCountry === country.id ? "fill-accent" : "fill-current"
            }`}
            onClick={() => setSelectedCountry(country.id)}
          >
            <title>{countryName}</title>
          </path>
        )
      } else {
        return (
          <path
            key={country.id}
            d={country.shape}
            className="fill-current opacity-75 stroke-gray-500"
          >
            <title>{countryName} (no data)</title>
          </path>
        )
      }
    })
  }, [selectedCountry, setSelectedCountry, countries])

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
        <g className="svg-pan-zoom_viewport transition-transform duration-150">
          {countryPaths}
        </g>
      </svg>

      <div className="absolute bottom-0 right-0 flex flex-col p-3 lg:p-4 sy-2">
        <button
          className="btn-map"
          title="Reset position"
          onClick={() => panZoomWorldMap?.current?.reset()}
        >
          <FontAwesomeIcon fixedWidth icon={faExpand} />
        </button>
        <button
          className="btn-map text-lg"
          title="Zoom in"
          onClick={() => panZoomWorldMap?.current?.zoomIn()}
        >
          +
        </button>
        <button
          className="btn-map text-lg"
          title="Zoom out"
          onClick={() => panZoomWorldMap?.current?.zoomOut()}
        >
          -
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
