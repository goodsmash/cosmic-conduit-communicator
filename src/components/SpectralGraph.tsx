import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface SpectralData {
  wavelength: number[]
  flux: number[]
  emissionLines?: { wavelength: number; element: string; intensity: number }[]
  absorptionLines?: { wavelength: number; element: string; depth: number }[]
}

interface SpectralGraphProps {
  data: SpectralData
  width?: number
  height?: number
}

export function SpectralGraph({ 
  data, 
  width = 600, 
  height = 300 
}: SpectralGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data) return

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove()

    // Set margins
    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([Math.min(...data.wavelength), Math.max(...data.wavelength)])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([Math.min(...data.flux), Math.max(...data.flux)])
      .range([innerHeight, 0])

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create line generator
    const line = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveMonotoneX)

    // Draw spectral line
    svg.append('path')
      .datum(data.wavelength.map((w, i) => [w, data.flux[i]] as [number, number]))
      .attr('fill', 'none')
      .attr('stroke', '#4a9eff')
      .attr('stroke-width', 1.5)
      .attr('d', line)

    // Draw emission lines
    if (data.emissionLines) {
      svg.selectAll('.emission-line')
        .data(data.emissionLines)
        .enter()
        .append('line')
        .attr('class', 'emission-line')
        .attr('x1', d => xScale(d.wavelength))
        .attr('x2', d => xScale(d.wavelength))
        .attr('y1', yScale(0))
        .attr('y2', d => yScale(d.intensity))
        .attr('stroke', '#ff4a4a')
        .attr('stroke-width', 2)

      // Add emission line labels
      svg.selectAll('.emission-label')
        .data(data.emissionLines)
        .enter()
        .append('text')
        .attr('class', 'emission-label')
        .attr('x', d => xScale(d.wavelength))
        .attr('y', d => yScale(d.intensity) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(d => d.element)
    }

    // Draw absorption lines
    if (data.absorptionLines) {
      svg.selectAll('.absorption-line')
        .data(data.absorptionLines)
        .enter()
        .append('line')
        .attr('class', 'absorption-line')
        .attr('x1', d => xScale(d.wavelength))
        .attr('x2', d => xScale(d.wavelength))
        .attr('y1', yScale(0))
        .attr('y2', d => yScale(-d.depth))
        .attr('stroke', '#4aff4a')
        .attr('stroke-width', 2)

      // Add absorption line labels
      svg.selectAll('.absorption-label')
        .data(data.absorptionLines)
        .enter()
        .append('text')
        .attr('class', 'absorption-label')
        .attr('x', d => xScale(d.wavelength))
        .attr('y', d => yScale(-d.depth) + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(d => d.element)
    }

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${d}Å`)

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}`)

    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)

    svg.append('g')
      .call(yAxis)

    // Add axis labels
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .text('Wavelength (Å)')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .text('Flux')

    // Add tooltips
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'spectral-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')

    // Add hover interactions
    svg.selectAll('line')
      .on('mouseover', (event, d: any) => {
        tooltip
          .style('visibility', 'visible')
          .html(`
            Element: ${d.element}<br/>
            Wavelength: ${d.wavelength.toFixed(2)}Å<br/>
            ${d.intensity ? `Intensity: ${d.intensity.toFixed(2)}` : `Depth: ${d.depth.toFixed(2)}`}
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden')
      })

  }, [data, width, height])

  return <svg ref={svgRef} />
}
