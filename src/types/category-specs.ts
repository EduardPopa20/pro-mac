// Category Specification Visibility Types

export interface SpecificationVisibility {
  visible: Record<string, boolean>;
}

export interface CategorySpecConfig {
  id: number;
  name: string;
  slug: string;
  visible_specifications: SpecificationVisibility | null;
  specification_config?: Record<string, any>;
}

// Specification metadata for admin interface
export interface SpecificationMetadata {
  key: string;
  label: string;
  category: 'basic' | 'technical' | 'physical' | 'suitability' | 'pricing';
  dataType: 'text' | 'number' | 'boolean' | 'select';
  description?: string;
}

// All available specifications by category
export const CATEGORY_SPECIFICATIONS: Record<string, SpecificationMetadata[]> = {
  faianta: [
    // Basic specs
    { key: 'dimensions', label: 'Dimensiuni', category: 'basic', dataType: 'text', description: 'Dimensiunile plăcii (ex: 30x60 cm)' },
    { key: 'material', label: 'Material', category: 'basic', dataType: 'text', description: 'Materialul din care este fabricată' },
    { key: 'finish', label: 'Finisaj', category: 'basic', dataType: 'text', description: 'Tipul de finisaj al suprafeței' },
    { key: 'color', label: 'Culoare', category: 'basic', dataType: 'text', description: 'Culoarea principală a produsului' },
    { key: 'usage_area', label: 'Zonă de utilizare', category: 'basic', dataType: 'text', description: 'Interior/Exterior' },

    // Technical specs
    { key: 'surface_finish', label: 'Finisaj suprafață', category: 'technical', dataType: 'text', description: 'Detalii despre finisajul suprafeței' },
    { key: 'texture', label: 'Textură', category: 'technical', dataType: 'text', description: 'Textura suprafeței' },
    { key: 'quality_grade', label: 'Grad de calitate', category: 'technical', dataType: 'text', description: 'Gradul de calitate al produsului' },
    { key: 'thickness', label: 'Grosime', category: 'technical', dataType: 'text', description: 'Grosimea plăcii' },

    // Physical specs
    { key: 'weight_per_box', label: 'Greutate per cutie', category: 'physical', dataType: 'number', description: 'Greutatea unei cutii (kg)' },
    { key: 'area_per_box', label: 'Suprafață per cutie', category: 'physical', dataType: 'number', description: 'Suprafața acoperită de o cutie (m²)' },
    { key: 'tiles_per_box', label: 'Plăci per cutie', category: 'physical', dataType: 'number', description: 'Numărul de plăci într-o cutie' },
    { key: 'origin_country', label: 'Țara de origine', category: 'physical', dataType: 'text', description: 'Țara de proveniență' },

    // Suitability specs
    { key: 'is_rectified', label: 'Rectificat', category: 'suitability', dataType: 'boolean', description: 'Dacă plăcile sunt rectificate' },
    { key: 'is_frost_resistant', label: 'Rezistent la îngheț', category: 'suitability', dataType: 'boolean', description: 'Rezistență la îngheț-dezgheț' },
    { key: 'is_floor_heating_compatible', label: 'Compatibil încălzire pardoseală', category: 'suitability', dataType: 'boolean', description: 'Compatibil cu încălzirea în pardoseală' },
    { key: 'suitable_for_walls', label: 'Potrivit pentru pereți', category: 'suitability', dataType: 'boolean', description: 'Poate fi montat pe pereți' },
    { key: 'suitable_for_floors', label: 'Potrivit pentru pardoseli', category: 'suitability', dataType: 'boolean', description: 'Poate fi montat pe pardoseli' },
    { key: 'suitable_for_exterior', label: 'Potrivit pentru exterior', category: 'suitability', dataType: 'boolean', description: 'Poate fi utilizat în exterior' },
    { key: 'suitable_for_commercial', label: 'Potrivit pentru spații comerciale', category: 'suitability', dataType: 'boolean', description: 'Potrivit pentru trafic intens' },
  ],

  gresie: [
    // Similar to faianta but with emphasis on floor properties
    { key: 'dimensions', label: 'Dimensiuni', category: 'basic', dataType: 'text' },
    { key: 'material', label: 'Material', category: 'basic', dataType: 'text' },
    { key: 'finish', label: 'Finisaj', category: 'basic', dataType: 'text' },
    { key: 'color', label: 'Culoare', category: 'basic', dataType: 'text' },
    { key: 'usage_area', label: 'Zonă de utilizare', category: 'basic', dataType: 'text' },
    { key: 'surface_finish', label: 'Finisaj suprafață', category: 'technical', dataType: 'text' },
    { key: 'texture', label: 'Textură', category: 'technical', dataType: 'text' },
    { key: 'quality_grade', label: 'Grad de calitate', category: 'technical', dataType: 'text' },
    { key: 'thickness', label: 'Grosime', category: 'technical', dataType: 'text' },
    { key: 'weight_per_box', label: 'Greutate per cutie', category: 'physical', dataType: 'number' },
    { key: 'area_per_box', label: 'Suprafață per cutie', category: 'physical', dataType: 'number' },
    { key: 'tiles_per_box', label: 'Plăci per cutie', category: 'physical', dataType: 'number' },
    { key: 'origin_country', label: 'Țara de origine', category: 'physical', dataType: 'text' },
    { key: 'is_rectified', label: 'Rectificat', category: 'suitability', dataType: 'boolean' },
    { key: 'is_frost_resistant', label: 'Rezistent la îngheț', category: 'suitability', dataType: 'boolean' },
    { key: 'is_floor_heating_compatible', label: 'Compatibil încălzire pardoseală', category: 'suitability', dataType: 'boolean' },
    { key: 'suitable_for_walls', label: 'Potrivit pentru pereți', category: 'suitability', dataType: 'boolean' },
    { key: 'suitable_for_floors', label: 'Potrivit pentru pardoseli', category: 'suitability', dataType: 'boolean' },
    { key: 'suitable_for_exterior', label: 'Potrivit pentru exterior', category: 'suitability', dataType: 'boolean' },
    { key: 'suitable_for_commercial', label: 'Potrivit pentru spații comerciale', category: 'suitability', dataType: 'boolean' },
  ],

  parchet: [
    // Basic specs
    { key: 'brand', label: 'Brand', category: 'basic', dataType: 'text', description: 'Producătorul parchetului' },
    { key: 'wood_essence', label: 'Esență lemn', category: 'basic', dataType: 'text', description: 'Tipul de lemn (stejar, fag, etc.)' },
    { key: 'core_material', label: 'Material miez', category: 'basic', dataType: 'text', description: 'HDF, MDF, lemn masiv, etc.' },

    // Technical specs
    { key: 'traffic_class', label: 'Clasă de trafic', category: 'technical', dataType: 'text', description: 'AC3, AC4, AC5, etc.' },
    { key: 'thickness_mm', label: 'Grosime (mm)', category: 'technical', dataType: 'number', description: 'Grosimea parchetului în mm' },
    { key: 'wear_layer_thickness_mm', label: 'Grosime strat uzură (mm)', category: 'technical', dataType: 'number', description: 'Grosimea stratului de uzură' },
    { key: 'installation_type', label: 'Tip montaj', category: 'technical', dataType: 'text', description: 'Click, lipire, etc.' },
    { key: 'edge_type', label: 'Tip margine', category: 'technical', dataType: 'text', description: '2V, 4V, fără șanfren, etc.' },
    { key: 'surface_treatment', label: 'Tratament suprafață', category: 'technical', dataType: 'text', description: 'Lac, ulei, etc.' },

    // Physical specs
    { key: 'plank_dimensions', label: 'Dimensiuni lamelă', category: 'physical', dataType: 'text', description: 'L x l x h' },
    { key: 'planks_per_box', label: 'Lamele per cutie', category: 'physical', dataType: 'number' },
    { key: 'sqm_per_box', label: 'm² per cutie', category: 'physical', dataType: 'number' },
    { key: 'box_weight_kg', label: 'Greutate cutie (kg)', category: 'physical', dataType: 'number' },
    { key: 'country_of_origin', label: 'Țara de origine', category: 'physical', dataType: 'text' },

    // Warranty & certifications
    { key: 'warranty_years', label: 'Garanție (ani)', category: 'technical', dataType: 'number' },
    { key: 'residential_warranty_years', label: 'Garanție rezidențial (ani)', category: 'technical', dataType: 'number' },
    { key: 'commercial_warranty_years', label: 'Garanție comercial (ani)', category: 'technical', dataType: 'number' },

    // Suitability
    { key: 'is_waterproof', label: 'Rezistent la apă', category: 'suitability', dataType: 'boolean' },
    { key: 'has_underpad', label: 'Cu folie încorporată', category: 'suitability', dataType: 'boolean' },
    { key: 'underfloor_heating_compatible', label: 'Compatibil încălzire pardoseală', category: 'suitability', dataType: 'boolean' },

    // Environmental
    { key: 'formaldehyde_class', label: 'Clasă formaldehidă', category: 'technical', dataType: 'text' },
    { key: 'fire_resistance_class', label: 'Clasă rezistență foc', category: 'technical', dataType: 'text' },
    { key: 'acoustic_rating_db', label: 'Izolare fonică (dB)', category: 'technical', dataType: 'number' },
    { key: 'thermal_resistance', label: 'Rezistență termică', category: 'technical', dataType: 'text' },
  ],

  riflaje: [
    // Basic specs
    { key: 'material', label: 'Material', category: 'basic', dataType: 'text' },
    { key: 'brand', label: 'Brand', category: 'basic', dataType: 'text' },
    { key: 'panel_type', label: 'Tip panou', category: 'basic', dataType: 'text' },

    // Technical specs
    { key: 'panel_dimensions', label: 'Dimensiuni panou', category: 'technical', dataType: 'text' },
    { key: 'panel_thickness', label: 'Grosime panou', category: 'technical', dataType: 'text' },
    { key: 'coverage_area', label: 'Suprafață acoperire', category: 'technical', dataType: 'text' },
    { key: 'box_quantity', label: 'Cantitate per cutie', category: 'technical', dataType: 'number' },
    { key: 'weight_per_sqm', label: 'Greutate per m²', category: 'technical', dataType: 'number' },

    // Acoustic specs
    { key: 'acoustic_properties', label: 'Proprietăți acustice', category: 'technical', dataType: 'text' },
    { key: 'noise_reduction_coefficient', label: 'Coeficient reducere zgomot', category: 'technical', dataType: 'text' },

    // Installation specs
    { key: 'mounting_system', label: 'Sistem montaj', category: 'technical', dataType: 'text' },
    { key: 'suspension_type', label: 'Tip suspendare', category: 'technical', dataType: 'text' },
    { key: 'edge_detail', label: 'Detaliu margine', category: 'technical', dataType: 'text' },
    { key: 'perforation_pattern', label: 'Model perforații', category: 'technical', dataType: 'text' },

    // Material specs
    { key: 'wood_species', label: 'Specie lemn', category: 'basic', dataType: 'text' },
    { key: 'veneer_type', label: 'Tip furnir', category: 'technical', dataType: 'text' },
    { key: 'core_material', label: 'Material miez', category: 'technical', dataType: 'text' },
    { key: 'panel_orientation', label: 'Orientare panou', category: 'technical', dataType: 'text' },

    // Finish specs
    { key: 'finish_type', label: 'Tip finisaj', category: 'technical', dataType: 'text' },
    { key: 'color_finish', label: 'Culoare finisaj', category: 'basic', dataType: 'text' },

    // Suitability
    { key: 'fire_rating', label: 'Clasificare foc', category: 'suitability', dataType: 'text' },
    { key: 'water_resistant', label: 'Rezistent la apă', category: 'suitability', dataType: 'boolean' },

    // Other
    { key: 'warranty_years', label: 'Garanție (ani)', category: 'technical', dataType: 'number' },
    { key: 'environmental_certification', label: 'Certificare mediu', category: 'technical', dataType: 'text' },
    { key: 'maintenance_level', label: 'Nivel întreținere', category: 'technical', dataType: 'text' },
  ],
};

// Helper function to get specification metadata
export function getSpecificationMetadata(category: string, specKey: string): SpecificationMetadata | undefined {
  const categorySpecs = CATEGORY_SPECIFICATIONS[category];
  if (!categorySpecs) return undefined;

  return categorySpecs.find(spec => spec.key === specKey);
}

// Helper function to get all specification keys for a category
export function getCategorySpecificationKeys(category: string): string[] {
  const categorySpecs = CATEGORY_SPECIFICATIONS[category];
  if (!categorySpecs) return [];

  return categorySpecs.map(spec => spec.key);
}

// Helper function to group specifications by category
export function getGroupedSpecifications(category: string): Record<string, SpecificationMetadata[]> {
  const categorySpecs = CATEGORY_SPECIFICATIONS[category];
  if (!categorySpecs) return {};

  return categorySpecs.reduce((groups, spec) => {
    if (!groups[spec.category]) {
      groups[spec.category] = [];
    }
    groups[spec.category].push(spec);
    return groups;
  }, {} as Record<string, SpecificationMetadata[]>);
}