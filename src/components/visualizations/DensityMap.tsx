import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DensityRegion } from '@/utils/dataProcessing';

interface DensityMapProps {
  regions: DensityRegion[];
  width?: number;
  height?: number;
  onRegionClick?: (region: DensityRegion) => void;
}

const DensityMap: React.FC<DensityMapProps> = ({
  regions,
  width = 800,
  height = 400,
  onRegionClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || regions.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Setup
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create projection
    const projection = d3.geoEquirectangular()
      .scale(height / Math.PI)
      .translate([width / 2, height / 2])
      .rotate([0, 0]);

    // Create color scale
    const maxDensity = Math.max(...regions.map(r => r.density));
    const colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([0, maxDensity]);

    // Draw grid cells
    const cells = svg.selectAll('g')
      .data(regions)
      .enter()
      .append('g');

    // Calculate cell size
    const cellSize = Math.min(
      width / (360 / 15),  // 15-degree RA cells
      height / (180 / 15)  // 15-degree Dec cells
    );

    cells.append('rect')
      .attr('x', d => {
        const [x] = projection([-d.ra, d.dec]) || [0, 0];
        return x - cellSize / 2;
      })
      .attr('y', d => {
        const [, y] = projection([-d.ra, d.dec]) || [0, 0];
        return y - cellSize / 2;
      })
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => colorScale(d.density))
      .attr('opacity', 0.7)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 2);

        // Show tooltip
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>Region:</strong><br/>
            RA: ${d.ra.toFixed(1)}°<br/>
            Dec: ${d.dec.toFixed(1)}°<br/>
            Objects: ${d.density}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.7)
          .attr('stroke-width', 0.5);
        tooltip.style('opacity', 0);
      })
      .on('click', (event, d) => onRegionClick?.(d));

    // Add density values
    cells.append('text')
      .attr('x', d => {
        const [x] = projection([-d.ra, d.dec]) || [0, 0];
        return x;
      })
      .attr('y', d => {
        const [, y] = projection([-d.ra, d.dec]) || [0, 0];
        return y + 4;
      })
      .text(d => d.density)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.density > maxDensity / 2 ? '#ffffff' : '#000000')
      .attr('font-size', '10px')
      .style('pointer-events', 'none');

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'density-map-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'rgba(255, 255, 255, 0.9)')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)')
      .style('pointer-events', 'none')
      .style('font-size', '12px');

    // Add legend
    const legendWidth = 20;
    const legendHeight = height * 0.8;
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 50}, ${height * 0.1})`);

    const legendScale = d3.scaleLinear()
      .domain([0, maxDensity])
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5);

    // Create gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'density-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', legendHeight)
      .attr('x2', 0)
      .attr('y2', 0);

    const stops = d3.range(0, 1.1, 0.1);
    stops.forEach(stop => {
      gradient.append('stop')
        .attr('offset', `${stop * 100}%`)
        .attr('stop-color', colorScale(stop * maxDensity));
    });

    // Draw legend rectangle
    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#density-gradient)');

    // Add legend axis
    legend.append('g')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll('text')
      .attr('fill', '#ffffff');

    // Add legend title
    legend.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -legendHeight / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .text('Object Density');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        cells.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [regions, width, height, onRegionClick]);

  return (
    <div className="density-map-container" style={{ width, height }}>
      <svg
        ref={svgRef}
        style={{
          background: 'rgb(13, 18, 30)',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

export default DensityMap;
