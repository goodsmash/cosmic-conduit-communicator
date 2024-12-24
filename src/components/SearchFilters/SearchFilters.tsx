import React, { useState } from 'react';
import { 
  Paper, 
  Grid, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MastSearchParams } from '../../services/mastApi';
import { EnergyBand, ObservationType } from '../../types/astronomical';

interface SearchFiltersProps {
  onSearch: (params: MastSearchParams) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<MastSearchParams>({
    maxRecords: 100,
    wavelengthBand: '',
    observationType: 'SCIENCE',
    ra: undefined,
    dec: undefined,
    radius: 0.1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const energyBands: Array<{ value: EnergyBand; label: string }> = [
    { value: 'RADIO', label: 'Radio (>10mm)' },
    { value: 'MILLIMETER', label: 'Millimeter (0.1-10mm)' },
    { value: 'INFRARED', label: 'Infrared (1μm-0.1mm)' },
    { value: 'OPTICAL', label: 'Optical (300nm-1μm)' },
    { value: 'UV', label: 'Ultraviolet (100-300nm)' },
    { value: 'XRAY', label: 'X-Ray (0.12-120keV)' },
    { value: 'GAMMARAY', label: 'Gamma Ray (>120keV)' }
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="RA (degrees)"
              type="number"
              value={filters.ra || ''}
              onChange={(e) => setFilters({
                ...filters,
                ra: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              inputProps={{ step: 'any' }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Dec (degrees)"
              type="number"
              value={filters.dec || ''}
              onChange={(e) => setFilters({
                ...filters,
                dec: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              inputProps={{ step: 'any' }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Radius (degrees)"
              type="number"
              value={filters.radius || ''}
              onChange={(e) => setFilters({
                ...filters,
                radius: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              inputProps={{ step: '0.1', min: '0' }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Energy Band</InputLabel>
              <Select
                value={filters.wavelengthBand || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  wavelengthBand: e.target.value
                })}
                label="Energy Band"
              >
                <MenuItem value="">All Bands</MenuItem>
                {energyBands.map((band) => (
                  <MenuItem key={band.value} value={band.value}>
                    {band.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Observation Type</InputLabel>
              <Select
                value={filters.observationType || 'SCIENCE'}
                onChange={(e) => setFilters({
                  ...filters,
                  observationType: e.target.value as ObservationType
                })}
                label="Observation Type"
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="SCIENCE">Science</MenuItem>
                <MenuItem value="CALIBRATION">Calibration</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                size="large"
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default SearchFilters;
