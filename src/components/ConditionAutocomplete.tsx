import { useState } from 'react';
import Autosuggest from 'react-autosuggest';

interface ConditionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder?: string;
  className?: string;
}

// Common medical conditions for suggestions
const COMMON_CONDITIONS = [
  'Diabetes Type 1',
  'Diabetes Type 2',
  'Hypertension',
  'High Blood Pressure',
  'Asthma',
  'COPD',
  'Heart Disease',
  'Coronary Artery Disease',
  'Arthritis',
  'Rheumatoid Arthritis',
  'Osteoarthritis',
  'Depression',
  'Anxiety',
  'GERD',
  'Acid Reflux',
  'High Cholesterol',
  'Hyperlipidemia',
  'Thyroid Disease',
  'Hypothyroidism',
  'Hyperthyroidism',
  'Kidney Disease',
  'Chronic Kidney Disease',
  'Cancer',
  'Breast Cancer',
  'Lung Cancer',
  'Prostate Cancer',
  'Colon Cancer',
  'Osteoporosis',
  'Migraine',
  'Epilepsy',
  'Parkinson\'s Disease',
  'Alzheimer\'s Disease',
  'Multiple Sclerosis',
  'Lupus',
  'Fibromyalgia',
  'Sleep Apnea',
  'IBS',
  'Irritable Bowel Syndrome',
  'Crohn\'s Disease',
  'Ulcerative Colitis',
  'Celiac Disease',
  'Psoriasis',
  'Eczema',
  'Allergies',
  'Seasonal Allergies',
  'Food Allergies'
];

export function ConditionAutocomplete({
  value,
  onChange,
  onAdd,
  placeholder = "e.g., Diabetes, Hypertension",
  className = ""
}: ConditionAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const getSuggestions = (inputValue: string): string[] => {
    const input = inputValue.trim().toLowerCase();
    return input.length === 0
      ? []
      : COMMON_CONDITIONS.filter(condition =>
          condition.toLowerCase().includes(input)
        ).slice(0, 10);
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: string) => suggestion;

  const renderSuggestion = (suggestion: string) => (
    <div className="px-3 py-2 hover:bg-blue-50 cursor-pointer">
      {suggestion}
    </div>
  );

  const inputProps = {
    placeholder,
    value,
    onChange: (_: any, { newValue }: { newValue: string }) => {
      onChange(newValue);
    },
    onKeyPress: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onAdd();
      }
    },
    className: `w-full border p-2 rounded text-sm ${className}`.trim()
  };

  const theme = {
    container: 'relative flex-1',
    containerOpen: 'react-autosuggest__container--open',
    input: 'react-autosuggest__input',
    inputOpen: 'react-autosuggest__input--open',
    inputFocused: 'react-autosuggest__input--focused',
    suggestionsContainer: 'absolute z-10 w-full',
    suggestionsContainerOpen: 'react-autosuggest__suggestions-container--open',
    suggestionsList: 'bg-white shadow border rounded-b max-h-48 overflow-y-auto',
    suggestion: 'react-autosuggest__suggestion',
    suggestionFirst: 'react-autosuggest__suggestion--first',
    suggestionHighlighted: 'bg-blue-50',
    sectionContainer: 'react-autosuggest__section-container',
    sectionContainerFirst: 'react-autosuggest__section-container--first',
    sectionTitle: 'react-autosuggest__section-title'
  };

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      theme={theme}
    />
  );
}