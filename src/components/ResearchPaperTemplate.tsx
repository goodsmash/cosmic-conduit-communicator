import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Link,
  Grid,
  Chip,
} from '@mui/material';

interface Author {
  name: string;
  institution?: string;
  email?: string;
}

interface ResearchPaperProps {
  title: string;
  authors: Author[];
  abstract: string;
  doi?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  date?: string;
  pages?: string;
  keywords: string[];
  sections: {
    title: string;
    content: string;
  }[];
  references: {
    id: number;
    text: string;
    doi?: string;
  }[];
}

const ResearchPaperTemplate: React.FC<ResearchPaperProps> = ({
  title,
  authors,
  abstract,
  doi,
  journal,
  volume,
  issue,
  date,
  pages,
  keywords,
  sections,
  references,
}) => {
  return (
    <Paper sx={{ p: 4, maxWidth: '900px', mx: 'auto', my: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mb: 3 }}>
          {authors.map((author, index) => (
            <Box key={index} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1">
                {author.name}
              </Typography>
              {author.institution && (
                <Typography variant="body2" color="text.secondary">
                  {author.institution}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Journal Information */}
        {journal && (
          <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
            {journal}
            {volume && ` Volume ${volume}`}
            {issue && `, Issue ${issue}`}
            {date && `, ${date}`}
            {pages && `, Pages ${pages}`}
          </Typography>
        )}

        {doi && (
          <Typography variant="body2" align="center" gutterBottom>
            DOI: <Link href={`https://doi.org/${doi}`} target="_blank">{doi}</Link>
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Abstract */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Abstract
        </Typography>
        <Typography variant="body1" paragraph>
          {abstract}
        </Typography>
        
        {/* Keywords */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Keywords:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {keywords.map((keyword, index) => (
              <Chip key={index} label={keyword} size="small" />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Main Content Sections */}
      {sections.map((section, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {section.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {section.content}
          </Typography>
        </Box>
      ))}

      {/* References */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          References
        </Typography>
        <Box sx={{ pl: 2 }}>
          {references.map((ref) => (
            <Typography key={ref.id} variant="body2" paragraph>
              [{ref.id}] {ref.text}
              {ref.doi && (
                <Link 
                  href={`https://doi.org/${ref.doi}`}
                  target="_blank"
                  sx={{ ml: 1 }}
                >
                  DOI: {ref.doi}
                </Link>
              )}
            </Typography>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ResearchPaperTemplate;
