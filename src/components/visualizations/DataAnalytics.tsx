import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AstronomicalObject } from '@/utils/astronomyUtils';
import { ProcessedData } from '@/utils/dataProcessing';

interface DataAnalyticsProps {
  data: ProcessedData;
  objects: AstronomicalObject[];
}

const DataAnalytics: React.FC<DataAnalyticsProps> = ({ data, objects }) => {
  const theme = useTheme();

  // Prepare data for charts
  const typeDistributionData = Object.entries(data.statistics.typeDistribution)
    .map(([type, count]) => ({ type, count }));

  const hemisphereData = [
    {
      name: 'Northern',
      value: objects.filter(obj => parseFloat(obj.dec.split(':')[0]) > 0).length,
    },
    {
      name: 'Southern',
      value: objects.filter(obj => parseFloat(obj.dec.split(':')[0]) <= 0).length,
    },
  ];

  const tagDistributionData = objects.reduce((acc, obj) => {
    obj.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const tagData = Object.entries(tagDistributionData)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const COLORS = [
    '#4A90E2',
    '#50E3C2',
    '#F8E71C',
    '#BD10E0',
    '#9013FE',
    '#417505',
    '#7ED321',
    '#F5A623',
    '#D0021B',
    '#9B9B9B',
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Data Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Object Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" gutterBottom>
              Object Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="type"
                  tick={{ fill: theme.palette.text.primary }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: theme.palette.text.primary }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
                <Bar dataKey="count" fill="#4A90E2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Hemisphere Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" gutterBottom>
              Hemisphere Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hemisphereData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {hemisphereData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tag Distribution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" gutterBottom>
              Top 10 Tags Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tick={{ fill: theme.palette.text.primary }}
                />
                <YAxis
                  dataKey="tag"
                  type="category"
                  tick={{ fill: theme.palette.text.primary }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
                <Bar dataKey="count" fill="#50E3C2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Statistics Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Key Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {objects.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Objects
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {Object.keys(data.statistics.typeDistribution).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Object Types
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {Object.keys(tagDistributionData).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Unique Tags
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {hemisphereData[0].value > hemisphereData[1].value ? 'North' : 'South'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Dominant Hemisphere
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataAnalytics;
