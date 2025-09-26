import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Button,
  Tabs,
  Tab,
  Chip,
  Alert,
  Breadcrumbs,
  Link,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Skeleton,
} from '@mui/material';
import {
  ExpandMore,
  Save,
  Info,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import type {
  CategorySpecConfig,
  SpecificationVisibility,
} from '../../types/category-specs';
import {
  CATEGORY_SPECIFICATIONS,
  getGroupedSpecifications,
} from '../../types/category-specs';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';

export default function CategorySpecsManager() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();

  const [categories, setCategories] = useState<CategorySpecConfig[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modifiedSpecs, setModifiedSpecs] = useState<Record<number, SpecificationVisibility>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if not admin (but only after auth is loaded)
  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      navigate('/admin/dashboard');
    }
  }, [authLoading, user, navigate]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, visible_specifications, specification_config')
        .order('name');

      if (error) throw error;

      // Initialize empty visibility for categories without configuration
      const categoriesWithDefaults = data?.map(cat => ({
        ...cat,
        visible_specifications: cat.visible_specifications || getDefaultVisibility(cat.slug),
      })) || [];

      setCategories(categoriesWithDefaults);
      if (categoriesWithDefaults.length > 0 && selectedCategory === 0) {
        setSelectedCategory(0);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Eroare la încărcarea categoriilor');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultVisibility = (categorySlug: string): SpecificationVisibility => {
    const specs = CATEGORY_SPECIFICATIONS[categorySlug] || [];
    const visible: Record<string, boolean> = {};

    specs.forEach(spec => {
      // By default, show basic specs and important technical specs
      visible[spec.key] = spec.category === 'basic' || spec.category === 'technical';
    });

    return { visible };
  };

  const handleSpecToggle = useCallback((specKey: string) => {
    const category = categories[selectedCategory];
    if (!category) return;

    const currentSpecs = modifiedSpecs[category.id] || category.visible_specifications || getDefaultVisibility(category.slug);

    const newSpecs = {
      ...currentSpecs,
      visible: {
        ...currentSpecs.visible,
        [specKey]: !currentSpecs.visible[specKey],
      },
    };

    setModifiedSpecs(prev => ({
      ...prev,
      [category.id]: newSpecs,
    }));
  }, [categories, selectedCategory, modifiedSpecs]);


  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');

    try {
      // Update each modified category
      const updates = Object.entries(modifiedSpecs).map(async ([categoryId, specs]) => {
        const { error } = await supabase
          .from('categories')
          .update({ visible_specifications: specs })
          .eq('id', parseInt(categoryId));

        if (error) throw error;
      });

      await Promise.all(updates);

      // Refresh data
      await fetchCategories();
      setModifiedSpecs({});
      setSuccessMessage('Configurările au fost salvate cu succes!');
    } catch (error) {
      console.error('Error saving specifications:', error);
      setErrorMessage('Eroare la salvarea configurărilor');
    } finally {
      setSaving(false);
    }
  };


  // Helper function to convert old format {filters: {}, details: {}} to new format {visible: {}}
  const convertToNewFormat = (oldSpecs: any, categorySlug: string): SpecificationVisibility => {
    // If it's already in new format, return as is
    if (oldSpecs.visible) {
      return oldSpecs;
    }

    // If it's old format, convert it
    if (oldSpecs.filters || oldSpecs.details) {
      const specs = CATEGORY_SPECIFICATIONS[categorySlug] || [];
      const visible: Record<string, boolean> = {};

      specs.forEach(spec => {
        // Show spec if it was visible in either filters or details in old format
        visible[spec.key] = Boolean(oldSpecs.filters?.[spec.key] || oldSpecs.details?.[spec.key]);
      });

      return { visible };
    }

    // Fallback to default
    return getDefaultVisibility(categorySlug);
  };

  const hasChanges = Object.keys(modifiedSpecs).length > 0;

  const currentCategory = categories[selectedCategory];
  const currentSpecs = currentCategory
    ? (modifiedSpecs[currentCategory.id] ||
       // Convert old format to new format if needed
       (currentCategory.visible_specifications ?
         convertToNewFormat(currentCategory.visible_specifications, currentCategory.slug) :
         getDefaultVisibility(currentCategory.slug)))
    : null;

  const groupedSpecs = currentCategory ? getGroupedSpecifications(currentCategory.slug) : {};

  const categoryLabels: Record<string, string> = {
    basic: 'Specificații de bază',
    technical: 'Specificații tehnice',
    physical: 'Specificații fizice',
    suitability: 'Compatibilitate și utilizare',
    pricing: 'Prețuri',
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={24} />
        </Box>

        {/* Header skeleton */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Skeleton variant="text" width={400} height={40} />
          {hasChanges && (
            <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
          )}
        </Box>

        {/* Info alert skeleton */}
        <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 3, borderRadius: 1 }} />

        {/* Card with tabs and content skeleton */}
        <Card
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'grey.300'
          }}
        >
          {/* Tabs skeleton */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
            <Box display="flex" gap={2}>
              <Skeleton variant="text" width={80} height={40} />
              <Skeleton variant="text" width={80} height={40} />
              <Skeleton variant="text" width={80} height={40} />
              <Skeleton variant="text" width={80} height={40} />
            </Box>
          </Box>

          <CardContent>
            {/* Accordion sections skeleton */}
            {[1, 2, 3].map(index => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 1 }} />
                <Box sx={{ pl: 2 }}>
                  {/* Table rows skeleton */}
                  {[1, 2, 3, 4].map(rowIndex => (
                    <Box key={rowIndex} display="flex" alignItems="center" sx={{ py: 1 }} gap={2}>
                      <Skeleton variant="text" width="40%" height={24} />
                      <Skeleton variant="rectangular" width={48} height={24} />
                      <Skeleton variant="rectangular" width={60} height={20} />
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link
            component="button"
            onClick={() => navigate('/admin/dashboard')}
            sx={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            Admin
          </Link>
          <Typography color="text.primary">Configurare Specificații Categorii</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Configurare Vizibilitate Specificații
        </Typography>
        {hasChanges && (
          <Tooltip title="Salvează toate modificările făcute la configurația specificațiilor">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                minHeight: { xs: 44, md: 40 },
                px: { xs: 2, md: 3 },
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              {saving ? 'Se salvează...' : 'Salvează modificările'}
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Configurați care specificații sunt vizibile în interfața publică pentru fiecare categorie.
          Specificațiile ascunse nu vor apărea în filtrele de căutare și nici în detaliile produselor.
        </Typography>
      </Alert>

      {/* Category Tabs - unified with accordion */}

      {/* Unified Specification Management */}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.300',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.light',
            boxShadow: (theme) => theme.shadows[6],
            transform: 'translateY(-2px)'
          }
        }}
      >
        {/* Category Tabs integrated into card */}
        <Tabs
          value={selectedCategory}
          onChange={(_, value) => setSelectedCategory(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}
        >
          {categories.map((category, index) => (
            <Tab
              key={category.id}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {category.name}
                  {modifiedSpecs[category.id] && (
                    <Chip label="Modificat" size="small" color="warning" />
                  )}
                </Box>
              }
              value={index}
            />
          ))}
        </Tabs>

        {currentCategory && currentSpecs && (
          <CardContent>

            {/* Specifications by Category */}
            {Object.entries(groupedSpecs).map(([category, specs]) => (
              <Accordion key={category} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    {categoryLabels[category] || category}
                    <Chip
                      label={`${specs.length} specificații`}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Specificație</TableCell>
                          <TableCell align="center">Vizibil</TableCell>
                          <TableCell width={50}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {specs.map(spec => (
                          <TableRow key={spec.key}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" fontWeight={500}>
                                  {spec.label}
                                </Typography>
                                {spec.description && (
                                  <Tooltip title={spec.description}>
                                    <Info fontSize="small" color="action" />
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Switch
                                checked={currentSpecs?.visible?.[spec.key] || false}
                                onChange={() => handleSpecToggle(spec.key)}
                                size="small"
                                color="primary"
                                sx={{
                                  '& .MuiSwitch-switchBase': {
                                    minWidth: { xs: 44, md: 'auto' },
                                    minHeight: { xs: 44, md: 'auto' }
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {spec.dataType === 'boolean' && (
                                <Chip label="Da/Nu" size="small" variant="outlined" />
                              )}
                              {spec.dataType === 'number' && (
                                <Chip label="Număr" size="small" variant="outlined" />
                              )}
                              {spec.dataType === 'text' && (
                                <Chip label="Text" size="small" variant="outlined" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
      />
    </Container>
  );
}