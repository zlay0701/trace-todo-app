'use client';

import React from 'react';
import { useTasks } from '@/contexts/TaskContext';

const CategoryFilter: React.FC = () => {
  const { state, setFilter } = useTasks();
  const { categories, tags, filter } = state;

  const handleCategoryFilter = (category: string | undefined) => {
    setFilter({ category: filter.category === category ? undefined : category });
  };

  const handleTagFilter = (tag: string | undefined) => {
    setFilter({ tag: filter.tag === tag ? undefined : tag });
  };

  const handleCompletedFilter = (completed: boolean | undefined) => {
    setFilter({ completed: filter.completed === completed ? undefined : completed });
  };

  const handlePriorityFilter = (priority: 'low' | 'medium' | 'high' | undefined) => {
    setFilter({ priority: filter.priority === priority ? undefined : priority });
  };

  const clearAllFilters = () => {
    setFilter({
      category: undefined,
      tag: undefined,
      completed: undefined,
      priority: undefined,
    });
  };

  const hasActiveFilters =
    filter.category !== undefined ||
    filter.tag !== undefined ||
    filter.completed !== undefined ||
    filter.priority !== undefined;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-priority-high';
      case 'medium':
        return 'bg-priority-medium';
      case 'low':
        return 'bg-priority-low';
      default:
        return 'bg-neutral';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:text-blue-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter(undefined)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.category === undefined
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter.category === category
                    ? 'bg-primary text-white'
                    : 'bg-neutral-light text-neutral hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagFilter(undefined)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter.tag === undefined
                    ? 'bg-primary text-white'
                    : 'bg-neutral-light text-neutral hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filter.tag === tag
                      ? 'bg-primary text-white'
                      : 'bg-neutral-light text-neutral hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCompletedFilter(undefined)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.completed === undefined
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleCompletedFilter(false)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.completed === false
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleCompletedFilter(true)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.completed === true
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePriorityFilter(undefined)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.priority === undefined
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handlePriorityFilter('high')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.priority === 'high'
                  ? 'bg-priority-high text-white'
                  : 'bg-neutral-light text-neutral hover:bg-gray-200'
              }`}
            >
              High
            </button>
            <button
              onClick={() => handlePriorityFilter('medium')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.priority === 'medium'
                  ? 'bg-priority-medium text-white'
                  : 'bg-neutral-light text-neutral hover:bg-gray-200'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => handlePriorityFilter('low')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.priority === 'low'
                  ? 'bg-priority-low text-white'
                  : 'bg-neutral-light text-neutral hover:bg-gray-200'
              }`}
            >
              Low
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;