import { useState, type FormEvent } from 'react';

interface SearchBarProps {
  onSubmit: (query: string) => void;
  initial?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onSubmit,
  initial = '',
  placeholder = 'Search songs or artists',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initial);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(query);
  };

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <span className="search-bar-icon" aria-hidden="true">
        <i className="fa-solid fa-magnifying-glass" />
      </span>
      <input
        className="search-input"
        type="search"
        name="q"
        aria-label="Search songs or artists"
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <button className="btn btn-primary search-submit" type="submit">
        <span className="visually-hidden">Search</span>
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </form>
  );
}
