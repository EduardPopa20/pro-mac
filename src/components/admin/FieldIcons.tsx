/**
 * Field Icons and Tooltips for Admin Forms
 * Maps field names to appropriate icons and tooltip content
 */
import React from 'react'
import { 
  Tooltip, 
  InputAdornment,
  SvgIcon,
  Typography
} from '@mui/material'
import {
  // Basic Info
  Title as NameIcon,
  Description as DescriptionIcon,
  Inventory as CodeIcon,
  Business as BrandIcon,
  
  // Dimensions & Physical
  Straighten as DimensionIcon,
  Height as ThicknessIcon,
  FitnessCenter as WeightIcon,
  SquareFoot as AreaIcon,
  ViewModule as TilesIcon,
  
  // Pricing
  Euro as PriceIcon,
  LocalOffer as SpecialPriceIcon,
  TrendingUp as StandardPriceIcon,
  
  // Stock & Inventory
  Inventory2 as StockIcon,
  Schedule as DeliveryIcon,
  ShoppingCart as MinOrderIcon,
  Warning as ReorderIcon,
  
  // Product Features
  Palette as ColorIcon,
  Texture as SurfaceIcon,
  Home as ApplicationIcon,
  Build as InstallIcon,
  Checkroom as StyleIcon,
  
  // Materials & Tech
  Science as MaterialIcon,
  Engineering as TechIcon,
  Star as FeatureIcon,
  Shield as DurabilityIcon,
  WaterDrop as ResistanceIcon,
  
  // Parchet specific
  ViewWeek as PlankIcon,
  Height as BoardIcon,
  Inventory as PackageIcon,
  
  // Categories
  Category as CategoryIcon,
  
  // Metadata
  Visibility as VisibilityIcon,
  TrendingUp as FeaturedIcon,
  Notes as NotesIcon,
  Straighten,
  Euro
} from '@mui/icons-material'

export interface FieldIconConfig {
  icon: React.ReactElement
  tooltip: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Comprehensive mapping of field names to icons and tooltips
 */
export const FIELD_ICON_MAP: Record<string, FieldIconConfig> = {
  // Basic Product Info
  'name': {
    icon: <NameIcon />,
    tooltip: 'Numele produsului care va apărea în catalog'
  },
  'description': {
    icon: <DescriptionIcon />,
    tooltip: 'Descrierea detaliată care va ajuta clienții să înțeleagă produsul'
  },
  'product_code': {
    icon: <CodeIcon />,
    tooltip: 'Codul unic al produsului pentru identificare (ex: 31326, EPL001)'
  },
  'brand': {
    icon: <BrandIcon />,
    tooltip: 'Marca producătorului (ex: CERAMAXX, Egger, Kronotex)'
  },
  
  // Dimensions & Physical Properties
  'dimensions': {
    icon: <DimensionIcon />,
    tooltip: 'Dimensiunile produsului (ex: 30x60 cm, 1285x192 mm)'
  },
  'thickness': {
    icon: <ThicknessIcon />,
    tooltip: 'Grosimea în milimetri (ex: 8.5 mm, 10 mm)'
  },
  'weight_per_box': {
    icon: <WeightIcon />,
    tooltip: 'Greutatea unei cutii/pachet în kilograme'
  },
  'area_per_box': {
    icon: <AreaIcon />,
    tooltip: 'Suprafața acoperită de o cutie în metri pătrați'
  },
  'tiles_per_box': {
    icon: <TilesIcon />,
    tooltip: 'Numărul de plăci dintr-o cutie'
  },
  'tiles_per_sqm': {
    icon: <TilesIcon />,
    tooltip: 'Câte plăci sunt necesare pentru un metru pătrat'
  },
  
  // Parchet specific dimensions
  'plank_length': {
    icon: <PlankIcon />,
    tooltip: 'Lungimea unei planșe în milimetri'
  },
  'plank_width': {
    icon: <PlankIcon />,
    tooltip: 'Lățimea unei planșe în milimetri'
  },
  'board_thickness': {
    icon: <BoardIcon />,
    tooltip: 'Grosimea planșei în milimetri'
  },
  'pieces_per_pack': {
    icon: <PackageIcon />,
    tooltip: 'Numărul de planșe dintr-un pachet'
  },
  'coverage_per_pack': {
    icon: <AreaIcon />,
    tooltip: 'Suprafața acoperită de un pachet în metri pătrați'
  },
  
  // Riflaje specific
  'installation_width': {
    icon: <DimensionIcon />,
    tooltip: 'Lățimea de instalare în milimetri'
  },
  'installation_length': {
    icon: <DimensionIcon />,
    tooltip: 'Lungimea de instalare în milimetri'
  },
  'linear_meters_per_box': {
    icon: <Straighten />,
    tooltip: 'Metri liniari acoperiți de o cutie'
  },
  
  // Pricing
  'price': {
    icon: <PriceIcon />,
    tooltip: 'Prețul actual de vânzare în RON'
  },
  'standard_price': {
    icon: <StandardPriceIcon />,
    tooltip: 'Prețul standard/de listă înainte de reduceri'
  },
  'special_price': {
    icon: <SpecialPriceIcon />,
    tooltip: 'Preț promotional special (opțional)'
  },
  'cost_price': {
    icon: <Euro />,
    tooltip: 'Prețul de cost pentru calculul profitului'
  },
  
  // Stock & Inventory
  'stock_quantity': {
    icon: <StockIcon />,
    tooltip: 'Cantitatea disponibilă în stoc'
  },
  'estimated_delivery_days': {
    icon: <DeliveryIcon />,
    tooltip: 'Timpul estimat de livrare în zile'
  },
  'minimum_order_quantity': {
    icon: <MinOrderIcon />,
    tooltip: 'Cantitatea minimă pentru comandă'
  },
  'reorder_level': {
    icon: <ReorderIcon />,
    tooltip: 'Nivelul la care trebuie reaprovizionat stocul'
  },
  
  // Visual & Technical Properties
  'color': {
    icon: <ColorIcon />,
    tooltip: 'Culoarea sau nuanța produsului (ex: Alb, Gri deschis)'
  },
  'surface_finish': {
    icon: <SurfaceIcon />,
    tooltip: 'Tipul de finisaj (ex: Mat, Lucios, Texturat)'
  },
  'application_areas': {
    icon: <ApplicationIcon />,
    tooltip: 'Zonele recomandate de utilizare (Living, Baie, Bucătărie, etc.)'
  },
  'installation_method': {
    icon: <InstallIcon />,
    tooltip: 'Metoda de instalare recomandată'
  },
  'style': {
    icon: <StyleIcon />,
    tooltip: 'Stilul de design (Modern, Clasic, Rustic, etc.)'
  },
  
  // Material & Technical
  'material': {
    icon: <MaterialIcon />,
    tooltip: 'Materialul din care este fabricat'
  },
  'technical_features': {
    icon: <TechIcon />,
    tooltip: 'Caracteristici tehnice speciale'
  },
  'special_features': {
    icon: <FeatureIcon />,
    tooltip: 'Caracteristici distincte ale produsului'
  },
  'durability_rating': {
    icon: <DurabilityIcon />,
    tooltip: 'Clasificarea durabilității (PEI, clasa de trafic)'
  },
  'water_resistance': {
    icon: <ResistanceIcon />,
    tooltip: 'Nivelul de rezistență la apă'
  },
  
  // Categories & Metadata
  'category_id': {
    icon: <CategoryIcon />,
    tooltip: 'Categoria din care face parte produsul'
  },
  'is_active': {
    icon: <VisibilityIcon />,
    tooltip: 'Dacă produsul este vizibil în catalog'
  },
  'is_featured': {
    icon: <FeaturedIcon />,
    tooltip: 'Dacă produsul apare în secțiunea de produse recomandate'
  },
  'notes': {
    icon: <NotesIcon />,
    tooltip: 'Note interne pentru administratori'
  }
}

/**
 * Get icon configuration for a field
 */
export const getFieldIcon = (fieldName: string): FieldIconConfig | null => {
  return FIELD_ICON_MAP[fieldName] || null
}

/**
 * Render icon with tooltip for a field label
 */
export const FieldIconWithTooltip: React.FC<{
  fieldName: string
  size?: 'small' | 'medium'
}> = ({ fieldName, size = 'small' }) => {
  const config = getFieldIcon(fieldName)
  
  if (!config) {
    return null
  }
  
  return (
    <Tooltip title={config.tooltip} placement={config.placement || 'top'}>
      <SvgIcon 
        sx={{ 
          fontSize: size === 'small' ? 16 : 20,
          color: 'text.secondary',
          ml: 0.5,
          cursor: 'help'
        }}
      >
        {config.icon}
      </SvgIcon>
    </Tooltip>
  )
}

/**
 * Enhanced FormField component that includes icon and removes helper text
 */
export const FormFieldWithIcon: React.FC<{
  label: string
  fieldName: string
  required?: boolean
  children: React.ReactNode
}> = ({ label, fieldName, required, children }) => {
  const iconConfig = getFieldIcon(fieldName)
  
  return (
    <div>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 1, 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {label}
        {required && (
          <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
            *
          </Typography>
        )}
        {iconConfig && (
          <Tooltip title={iconConfig.tooltip} placement="top">
            <SvgIcon 
              sx={{ 
                fontSize: 16,
                color: 'primary.main',
                ml: 1,
                cursor: 'help'
              }}
            >
              {iconConfig.icon}
            </SvgIcon>
          </Tooltip>
        )}
      </Typography>
      {children}
    </div>
  )
}

export default {
  FIELD_ICON_MAP,
  getFieldIcon,
  FieldIconWithTooltip,
  FormFieldWithIcon
}