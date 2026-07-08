import { useState } from "react";

function SearchFilterBar({
    placeholder = "Search...",
    filterOptions = [],
    onSearch,
    onFilter,
}) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (onSearch) {
            onSearch(value);
        }
    };

    const handleFilter = (e) => {
        const value = e.target.value;
        setFilter(value);

        if (onFilter) {
            onFilter(value);
        }
    };

    return (
        <div className="search-filter-bar">

            <input
                type="text"
                placeholder={placeholder}
                value={search}
                onChange={handleSearch}
            />

            <select
                value={filter}
                onChange={handleFilter}
            >
                <option value="ALL">ALL</option>

                {filterOptions.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>
                ))}
            </select>

        </div>
    );
}

export default SearchFilterBar;