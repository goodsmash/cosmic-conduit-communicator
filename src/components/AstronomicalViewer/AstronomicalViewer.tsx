import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExploreIcon from '@mui/icons-material/Explore';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { ImageMetadata, RandomDiscoveryResult } from '../../services/mastApi';

interface AstronomicalViewerProps {
  images: ImageMetadata[];
  loading: boolean;
  error: Error | null;
  onRandomDiscover?: () => Promise<RandomDiscoveryResult>;
  onNearbySearch?: (ra: number, dec: number) => Promise<void>;
}

const AstronomicalViewer: React.FC<AstronomicalViewerProps> = ({
  images,
  loading,
  error,
  onRandomDiscover,
  onNearbySearch
}) => {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [discoveryResult, setDiscoveryResult] = useState<RandomDiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleRandomDiscover = async () => {
    if (!onRandomDiscover) return;
    
    setIsDiscovering(true);
    try {
      const result = await onRandomDiscover();
      setDiscoveryResult(result);
    } catch (err) {
      console.error('Error during random discovery:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleNearbySearch = async (ra: number, dec: number) => {
    if (!onNearbySearch) return;
    try {
      await onNearbySearch(ra, dec);
    } catch (err) {
      console.error('Error searching nearby:', err);
    }
  };

  const renderImageGrid = () => (
    <Grid container spacing={2}>
      {images.map((image, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedImage(image)}
            >
              {image.thumbnailUrl ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={image.thumbnailUrl}
                  alt={image.title || 'Astronomical object'}
                  sx={{ objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No preview available
                  </Typography>
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" gutterBottom noWrap>
                  {image.title || 'Unnamed Object'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {image.instrument}
                </Typography>
                {image.dateObs && (
                  <Typography variant="caption" display="block">
                    {new Date(image.dateObs).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );

  const renderDiscoveryDialog = () => (
    <Dialog 
      open={!!discoveryResult} 
      onClose={() => setDiscoveryResult(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        New Discovery!
        <IconButton
          sx={{ position: 'absolute', right: 8, top: 8 }}
          onClick={() => setDiscoveryResult(null)}
        >
          <RefreshIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {discoveryResult && (
          <Box>
            {discoveryResult.type === 'image' && (
              <Box sx={{ mb: 2 }}>
                {(discoveryResult.data as ImageMetadata).thumbnailUrl && (
                  <img
                    src={(discoveryResult.data as ImageMetadata).thumbnailUrl}
                    alt="Discovered object"
                    style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                  />
                )}
              </Box>
            )}
            <Typography variant="body1" paragraph>
              {discoveryResult.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coordinates: RA {discoveryResult.coordinates.ra.toFixed(4)}, 
              Dec {discoveryResult.coordinates.dec.toFixed(4)}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ExploreIcon />}
              onClick={() => {
                handleNearbySearch(
                  discoveryResult.coordinates.ra,
                  discoveryResult.coordinates.dec
                );
                setDiscoveryResult(null);
              }}
              sx={{ mt: 2 }}
            >
              Explore Nearby
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, bgcolor: 'error.main', color: 'error.contrastText', borderRadius: 1 }}>
        <Typography>Error: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Found {images.length} Images
        </Typography>
        <Box>
          <Tooltip title="Discover something random">
            <IconButton 
              onClick={handleRandomDiscover}
              disabled={isDiscovering}
              color="primary"
            >
              <ExploreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <AnimatePresence mode='wait'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderImageGrid()}
        </motion.div>
      </AnimatePresence>

      {renderDiscoveryDialog()}

      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {selectedImage && (
            <Box>
              {selectedImage.url && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title || 'Astronomical object'}
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  />
                </Box>
              )}
              <Typography variant="h6" gutterBottom>
                {selectedImage.title || 'Unnamed Object'}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedImage.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Instrument</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedImage.instrument}
                  </Typography>
                </Grid>
                {selectedImage.wavelength && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Wavelength</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedImage.wavelength}
                    </Typography>
                  </Grid>
                )}
                {selectedImage.dateObs && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Observation Date</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(selectedImage.dateObs).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AstronomicalViewer;
