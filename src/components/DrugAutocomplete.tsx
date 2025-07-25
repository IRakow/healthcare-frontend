import { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { supabase } from '@/lib/supabase';

interface DrugOption {
  name: string;
}

interface DrugAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DrugAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Start typing medication name...",
  className = ""
}: DrugAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<DrugOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async (inputValue: string) => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('drug_names')
        .select('name')
        .ilike('name', `%${inputValue}%`)
        .limit(10);
      
      if (error) {
        console.error('Error fetching drug suggestions:', error);
        setSuggestions([]);
      } else {
        setSuggestions(data || []);
      }
    } catch (error) {
      console.error('Error fetching drug suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    fetchSuggestions(value);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: DrugOption) => suggestion.name;

  const renderSuggestion = (suggestion: DrugOption) => (
    <div className="px-3 py-2 hover:bg-blue-50 cursor-pointer">
      {suggestion.name}
    </div>
  );

  const inputProps = {
    placeholder,
    value,
    onChange: (_: any, { newValue }: { newValue: string }) => {
      onChange(newValue);
    },
    className: `w-full border p-2 rounded text-sm ${className}`.trim()
  };

  const theme = {
    container: 'relative',
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
    <div className="drug-autocomplete">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        theme={theme}
      />
      {isLoading && (
        <div className="absolute right-2 top-2 text-gray-400">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  );
}