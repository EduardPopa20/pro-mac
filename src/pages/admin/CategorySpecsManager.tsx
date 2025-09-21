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
} from '@mui/material';
import {
  ExpandMore,
  Save,
  Visibility,
  VisibilityOff,
  FilterList,
  Info,
  Settings,
  RestoreOutlined,
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
  const { user, isAdmin, loading: authLoading } = useAuthStore();

  const [categories, setCategories] = useState<CategorySpecConfig[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modifiedSpecs, setModifiedSpecs] = useState<Record<number, SpecificationVisibility>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if not admin (but only after auth is loaded)
  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [authLoading, user, isAdmin, navigate]);

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
    const filters: Record<string, boolean> = {};
    const details: Record<string, boolean> = {};

    specs.forEach(spec => {
      // By default, show basic specs in filters, all specs in details
      filters[spec.key] = spec.category === 'basic';
      details[spec.key] = true;
    });

    return { filters, details };
  };

  const handleSpecToggle = useCallback((specKey: string, type: 'filters' | 'details') => {
    const category = categories[selectedCategory];
    if (!category) return;

    const currentSpecs = modifiedSpecs[category.id] || category.visible_specifications || getDefaultVisibility(category.slug);

    const newSpecs = {
      ...currentSpecs,
      [type]: {
        ...currentSpecs[type],
        [specKey]: !currentSpecs[type][specKey],
      },
    };

    setModifiedSpecs(prev => ({
      ...prev,
      [category.id]: newSpecs,
    }));
  }, [categories, selectedCategory, modifiedSpecs]);

  const handleToggleAll = useCallback((type: 'filters' | 'details', value: boolean) => {
    const category = categories[selectedCategory];
    if (!category) return;

    const specs = CATEGORY_SPECIFICATIONS[category.slug] || [];
    const currentSpecs = modifiedSpecs[category.id] || category.visible_specifications || getDefaultVisibility(category.slug);

    const newTypeSpecs: Record<string, boolean> = {};
    specs.forEach(spec => {
      newTypeSpecs[spec.key] = value;
    });

    const newSpecs = {
      ...currentSpecs,
      [type]: newTypeSpecs,
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

  const handleResetDefaults = useCallback(() => {
    const category = categories[selectedCategory];
    if (!category) return;

    const defaultSpecs = getDefaultVisibility(category.slug);
    setModifiedSpecs(prev => ({
      ...prev,
      [category.id]: defaultSpecs,
    }));
  }, [categories, selectedCategory]);

  const hasChanges = Object.keys(modifiedSpecs).length > 0;

  const currentCategory = categories[selectedCategory];
  const currentSpecs = currentCategory
    ? (modifiedSpecs[currentCategory.id] || currentCategory.visible_specifications || getDefaultVisibility(currentCategory.slug))
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
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
          Configurați care specificații sunt vizibile în <strong>filtre</strong> și în <strong>detaliile produsului</strong> pentru fiecare categorie.
          Acest lucru permite ascunderea specificațiilor care nu sunt disponibile pentru anumite produse.
        </Typography>
      </Alert>

      {/* Category Tabs */}
      <Card
        sx={{
          mb: 3,
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
        <Tabs
          value={selectedCategory}
          onChange={(_, value) => setSelectedCategory(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
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
      </Card>

      {/* Specification Management */}
      {currentCategory && currentSpecs && (
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
          <CardContent>
            {/* Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box display="flex" gap={2}>
                <Tooltip title="Afișează toate specificațiile în secțiunea de filtre">
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleToggleAll('filters', true)}
                    sx={{
                      minHeight: { xs: 44, md: 32 },
                      px: { xs: 2, md: 1 },
                      fontSize: { xs: '0.875rem', md: '0.875rem' }
                    }}
                  >
                    Afișează toate în filtre
                  </Button>
                </Tooltip>
                <Tooltip title="Ascunde toate specificațiile din secțiunea de filtre">
                  <Button
                    size="small"
                    startIcon={<VisibilityOff />}
                    onClick={() => handleToggleAll('filters', false)}
                    sx={{
                      minHeight: { xs: 44, md: 32 },
                      px: { xs: 2, md: 1 },
                      fontSize: { xs: '0.875rem', md: '0.875rem' }
                    }}
                  >
                    Ascunde toate din filtre
                  </Button>
                </Tooltip>
              </Box>
              <Tooltip title="Resetează la configurația implicită pentru această categorie">
                <Button
                  size="small"
                  startIcon={<RestoreOutlined />}
                  onClick={handleResetDefaults}
                  color="secondary"
                  sx={{
                    minHeight: { xs: 44, md: 32 },
                    px: { xs: 2, md: 1 },
                    fontSize: { xs: '0.875rem', md: '0.875rem' }
                  }}
                >
                  Resetare la implicit
                </Button>
              </Tooltip>
            </Box>

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
                          <TableCell align="center">Vizibil în Filtre</TableCell>
                          <TableCell align="center">Vizibil în Detalii Produs</TableCell>
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
                              <Typography variant="caption" color="text.secondary">
                                {spec.key}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Switch
                                checked={currentSpecs.filters[spec.key] || false}
                                onChange={() => handleSpecToggle(spec.key, 'filters')}
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
                            <TableCell align="center">
                              <Switch
                                checked={currentSpecs.details[spec.key] || false}
                                onChange={() => handleSpecToggle(spec.key, 'details')}
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
        </Card>
      )}

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