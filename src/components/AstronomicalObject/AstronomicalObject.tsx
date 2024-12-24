import React from 'react';
import { Paper, Box, Typography, Chip, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Observation } from '../../types/astronomical';
import TelephotoIcon from '@mui/icons-material/PhotoCamera';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import ScienceIcon from '@mui/icons-material/Science';

interface AstronomicalObjectProps {
  observation: Observation;
  onClick?: () => void;
}

const AstronomicalObject: React.FC<AstronomicalObjectProps> = ({ observation, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Paper 
        elevation={3}
        sx={{ 
          p: 2, 
          cursor: 'pointer',
          '&:hover': { boxShadow: 6 }
        }}
        onClick={onClick}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {observation.target?.name || observation.observationID}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                icon={<ScienceIcon />}
                label={observation.intent}
                size="small"
                sx={{ mr: 1 }}
              />
              {observation.instrument?.name && (
                <Chip
                  icon={<TelephotoIcon />}
                  label={observation.instrument.name}
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              {observation.time?.exposure && (
                <Chip
                  icon={<TimelapseIcon />}
                  label={`${observation.time.exposure}s exposure`}
                  size="small"
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {observation.energy?.energyBands.map((band) => (
                <Chip
                  key={band}
                  label={band}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          {observation.target?.type && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Type: {observation.target.type}
              </Typography>
            </Grid>
          )}

          {observation.quality && (
            <Grid item xs={12}>
              <Chip
                label={`Quality: ${observation.quality.flag}`}
                size="small"
                color={observation.quality.flag === 'GOOD' ? 'success' : 
                       observation.quality.flag === 'QUESTIONABLE' ? 'warning' : 'error'}
              />
            </Grid>
          )}
        </Grid>
      </Paper>
    </motion.div>
  );
};

export default AstronomicalObject;
