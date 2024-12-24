import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AstronomicalObject } from '@/utils/astronomyUtils';

interface SkyMapProps {
  objects: AstronomicalObject[];
  width?: number;
  height?: number;
  onObjectClick?: (object: AstronomicalObject) => void;
}

const SkyMap: React.FC<SkyMapProps> = ({
  objects,
  width = 800,
  height = 400,
  onObjectClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

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

    // Convert RA/Dec to coordinates
    const points = objects.map(obj => {
      const ra = parseFloat(obj.ra.split(':')[0]) * 15; // Convert hours to degrees
      const dec = parseFloat(obj.dec.split(':')[0]);
      const [x, y] = projection([-ra, dec]) || [0, 0];
      return { ...obj, x, y };
    });

    // Draw grid lines
    const graticule = d3.geoGraticule()
      .step([15, 15]); // 15-degree steps

    svg.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', d3.geoPath(projection))
      .attr('fill', 'none')
      .attr('stroke', '#2a3f5f')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3);

    // Draw celestial objects
    const objectGroups = svg.selectAll('g')
      .data(points)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Object symbols
    objectGroups.append('circle')
      .attr('r', d => {
        switch (d.type.toLowerCase()) {
          case 'galaxy': return 6;
          case 'star cluster': return 5;
          case 'nebula': return 7;
          default: return 4;
        }
      })
      .attr('fill', d => {
        switch (d.type.toLowerCase()) {
          case 'galaxy': return '#4A90E2';
          case 'star cluster': return '#F8E71C';
          case 'nebula': return '#50E3C2';
          default: return '#FFFFFF';
        }
      })
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (event, d) => onObjectClick?.(d));

    // Labels
    objectGroups.append('text')
      .attr('x', 8)
      .attr('y', 4)
      .text(d => d.name)
      .attr('fill', '#FFFFFF')
      .attr('font-size', '10px')
      .style('pointer-events', 'none');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        svg.selectAll('g, path').attr('transform', event.transform);
      });

    svg.call(zoom);

    // Legend
    const legend = svg.append('g')
      .attr('transform', 'translate(20, 20)');

    const types = ['Galaxy', 'Star Cluster', 'Nebula'];
    const colors = ['#4A90E2', '#F8E71C', '#50E3C2'];

    types.forEach((type, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('circle')
        .attr('r', 4)
        .attr('fill', colors[i]);

      legendItem.append('text')
        .attr('x', 12)
        .attr('y', 4)
        .text(type)
        .attr('fill', '#FFFFFF')
        .attr('font-size', '12px');
    });

    // Add RA/Dec labels
    const raLabels = Array.from({ length: 24 }, (_, i) => i);
    const decLabels = Array.from({ length: 13 }, (_, i) => (i - 6) * 15);

    // RA labels
    svg.append('g')
      .selectAll('text')
      .data(raLabels)
      .enter()
      .append('text')
      .attr('x', d => projection([-d * 15, 0])?.[0] || 0)
      .attr('y', height - 10)
      .text(d => `${d}h`)
      .attr('fill', '#FFFFFF')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle');

    // Dec labels
    svg.append('g')
      .selectAll('text')
      .data(decLabels)
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', d => projection([0, d])?.[1] || 0)
      .text(d => `${d}°`)
      .attr('fill', '#FFFFFF')
      .attr('font-size', '10px')
      .attr('alignment-baseline', 'middle');

  }, [objects, width, height, onObjectClick]);

  return (
    <div className="sky-map-container" style={{ width, height }}>
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

export default SkyMap;
